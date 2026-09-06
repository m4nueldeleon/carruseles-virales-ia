#!/usr/bin/env node
// render.mjs — carrusel.json → slides/01.png … NN.png (1080x1350 @2x) + slides-src/index.html + preview.jpg
//
//   node scripts/render.mjs <carpeta-del-carrusel> [--escala 2] [--solo-html] [--embeber-fuentes] [--sin-preview]
//
// La carpeta debe tener carrusel.json y (opcional) assets/. El PNG sale numerado con cero a la
// izquierda para que Instagram respete el orden al subir.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { construirHTML } from './lib/construir-html.mjs';
import { cargarPlaywright } from './lib/playwright.mjs';

const DIR_SKILL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const carpeta = path.resolve(args.find(a => !a.startsWith('--')) || '.');
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const escala = Number(opt('--escala', 2));
const soloHtml = args.includes('--solo-html');
const embeber = args.includes('--embeber-fuentes');
const sinPreview = args.includes('--sin-preview');

const jsonPath = path.join(carpeta, 'carrusel.json');
if (!fs.existsSync(jsonPath)) { console.error(`No existe ${jsonPath}`); process.exit(2); }
let data;
try { data = JSON.parse(fs.readFileSync(jsonPath, 'utf8')); } catch (e) { console.error('carrusel.json no es JSON válido:', e.message); process.exit(2); }
if (!Array.isArray(data.slides) || data.slides.length === 0) { console.error('carrusel.json no tiene slides'); process.exit(2); }

const dirSrc = path.join(carpeta, 'slides-src');
const dirOut = path.join(carpeta, 'slides');
fs.mkdirSync(dirSrc, { recursive: true });
fs.mkdirSync(dirOut, { recursive: true });

const html = construirHTML({ data, dirCarrusel: carpeta, dirSalida: dirSrc, dirSkill: DIR_SKILL, embeberFuentes: embeber });
const htmlPath = path.join(dirSrc, 'index.html');
fs.writeFileSync(htmlPath, html);
console.log(`HTML → ${htmlPath}`);
if (soloHtml) process.exit(0);

const { chromium } = cargarPlaywright(DIR_SKILL);
const [w, h] = [Number(html.match(/data-w="(\d+)"/)[1]), Number(html.match(/data-h="(\d+)"/)[1])];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: escala });
  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle' });
  try { await page.evaluate(() => document.fonts.ready); } catch {}
  await page.waitForTimeout(600);
  try { await page.evaluate(() => window.__fit && window.__fit()); } catch {}
  await page.addStyleTag({ content: '#descargar{display:none!important}' });
  // limpia PNG viejos para que no queden láminas huérfanas de una versión anterior
  for (const f of fs.readdirSync(dirOut)) if (/^\d{2}\.png$/.test(f)) fs.unlinkSync(path.join(dirOut, f));
  const slides = await page.$$('.slide');
  for (let i = 0; i < slides.length; i++) {
    const n = String(i + 1).padStart(2, '0');
    await slides[i].screenshot({ path: path.join(dirOut, `${n}.png`), type: 'png' });
  }
  console.log(`PNG → ${dirOut} (${slides.length} láminas, ${w}x${h} @${escala}x)`);

  if (!sinPreview) {
    // Mosaico de vista previa: se arma en el propio navegador (sin ImageMagick)
    const cols = slides.length <= 4 ? slides.length : slides.length <= 8 ? 4 : 5;
    const filas = Math.ceil(slides.length / cols);
    const tw = 480, th = Math.round(tw * h / w);
    const imgs = fs.readdirSync(dirOut).filter(f => /^\d{2}\.png$/.test(f)).sort()
      .map(f => `<img src="file://${path.join(dirOut, f)}" style="width:${tw}px;height:${th}px;display:block">`).join('');
    const mosaico = `<!doctype html><body style="margin:0;background:#222"><div style="display:grid;grid-template-columns:repeat(${cols},${tw}px);gap:12px;padding:12px;width:max-content">${imgs}</div></body>`;
    const mosaicoPath = path.join(dirSrc, 'preview.html');
    fs.writeFileSync(mosaicoPath, mosaico);
    const p2 = await browser.newPage({ viewport: { width: cols * (tw + 12) + 12, height: filas * (th + 12) + 12 }, deviceScaleFactor: 1 });
    await p2.goto('file://' + mosaicoPath, { waitUntil: 'load' });
    await p2.waitForTimeout(300);
    await p2.screenshot({ path: path.join(carpeta, 'preview.jpg'), type: 'jpeg', quality: 88, fullPage: true });
    console.log(`Preview → ${path.join(carpeta, 'preview.jpg')}`);
    // Portada al tamaño de la cuadrícula del perfil (~270 px de ancho): si no se lee aquí, no se lee en el feed
    const p3 = await browser.newPage({ viewport: { width: 270, height: Math.round(270 * h / w) }, deviceScaleFactor: 1 });
    await p3.goto('file://' + path.join(dirOut, '01.png'), { waitUntil: 'load' });
    await p3.addStyleTag({ content: 'img{width:270px;height:auto;display:block} body{margin:0}' });
    await p3.screenshot({ path: path.join(carpeta, 'portada-270.jpg'), type: 'jpeg', quality: 85 });
    console.log(`Portada en cuadrícula → ${path.join(carpeta, 'portada-270.jpg')}`);
  }
  await browser.close();
})().catch(e => { console.error('Render falló:', e.message); process.exit(1); });
