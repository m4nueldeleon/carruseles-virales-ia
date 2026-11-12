// Carrusel temático con fotos reales: lee <carpeta>/fotos.json y saca slides/01.png…, preview.jpg (mosaico) y
// portada-270.jpg (la portada al tamaño de la cuadrícula del perfil). Guía: references/REMIX-VIRAL.md.
// Uso: node templates/tematico-fotos/render.mjs <carpeta-del-carrusel> [--salida <carpeta>]
// fotos.json: { "acento": "#00d7c0", "sello": "#f5c84c", "firma": "@cuenta", "laminas": [ { "layout": "impresa" |
// "sangre" | "antes-despues" | "idea" | "texto" | "lista" | "cierre", ... } ] }. Campos: ejemplo.json y
// references/REMIX-VIRAL.md. PLAYWRIGHT_RUTA = ruta a un paquete playwright propio (p. ej. el del mini).
// Rutas de imagen relativas a la carpeta del carrusel. Requiere Playwright y ffmpeg.
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

process.env.PLAYWRIGHT_BROWSERS_PATH ||= path.join(process.env.HOME, '.playwright-browsers');
const require = createRequire(import.meta.url);
if (process.argv.length < 3 || process.argv.includes('--help')) {
  console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').filter((l) => l.startsWith('//')).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
  process.exit(process.argv.includes('--help') ? 0 : 1);
}
const { chromium } = (() => {
  for (const ruta of [process.env.PLAYWRIGHT_RUTA, 'playwright', '/opt/homebrew/lib/node_modules/playwright'].filter(Boolean)) {
    try { return require(ruta); } catch {}
  }
  console.error('Falta Playwright (npm i -g playwright)');
  process.exit(1);
})();

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const carpeta = path.resolve(process.argv[2]);
const i = process.argv.indexOf('--salida');
const salida = path.resolve(i > 0 ? process.argv[i + 1] : carpeta);
const guion = JSON.parse(readFileSync(path.join(carpeta, 'fotos.json'), 'utf8'));
const aUrl = (p) => (!p || /^(https?:|data:|file:)/.test(p) ? p : pathToFileURL(path.resolve(carpeta, p)).href);
// Convierte a URL toda ruta de imagen de la lámina (foto, fondo, antes.src, recuerdos[].src)
const conUrls = (d) => ({
  ...d,
  ...Object.fromEntries(['foto', 'fondo'].filter((k) => d[k]).map((k) => [k, aUrl(d[k])])),
  ...(d.antes ? { antes: { ...d.antes, src: aUrl(d.antes.src) } } : {}),
  ...(d.recuerdos ? { recuerdos: d.recuerdos.map((r) => ({ ...r, src: aUrl(r.src) })) } : {}),
});

const dirSlides = path.join(salida, 'slides');
mkdirSync(dirSlides, { recursive: true });
for (const f of readdirSync(dirSlides).filter((f) => /^\d+\.png$/.test(f))) rmSync(path.join(dirSlides, f));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1440 } });
const pngs = [];
for (const [n, lamina] of guion.laminas.entries()) {
  await page.goto(pathToFileURL(path.join(AQUI, 'plantilla.html')).href);
  const tam = await page.evaluate(([d, g]) => window.pintar(d, g), [conUrls(lamina), guion]);
  const png = path.join(dirSlides, `${String(n + 1).padStart(2, '0')}.png`);
  await page.screenshot({ path: png });
  pngs.push(png);
  console.log(`${path.basename(png)} · ${lamina.layout} · titular a ${tam}px`);
}
await browser.close();
const mosaico = pngs.length > 1
  ? `${pngs.map((_, k) => `[${k}:v]scale=432:576[s${k}]`).join(';')};${pngs.map((_, k) => `[s${k}]`).join('')}hstack=inputs=${pngs.length}`
  : '[0:v]scale=432:576';  // hstack no acepta una sola entrada
execFileSync('ffmpeg', ['-y', '-v', 'error', ...pngs.flatMap((p) => ['-i', p]), '-filter_complex', mosaico,
  path.join(salida, 'preview.jpg')]);
execFileSync('sips', ['-s', 'format', 'jpeg', '-Z', '360', pngs[0], '--out', path.join(salida, 'portada-270.jpg')], { stdio: 'ignore' });
console.log(`preview.jpg y portada-270.jpg en ${salida}`);
