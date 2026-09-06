#!/usr/bin/env node
// escribir.mjs — Escribe carrusel.json y caption.txt con la API de Anthropic (Claude), fuera de Claude Code.
// Sirve para un servidor, un cron o un asistente (Hermes/SOFIA) que quiera producir el guion con Claude
// y dejar que render.mjs y qa.mjs hagan el resto.
//
//   export ANTHROPIC_API_KEY=...   (o guárdala en ~/.anthropic-cli/.env)
//   node scripts/escribir.mjs --tema "5 errores al cotizar" --carpeta ./mis-carruseles [--referencia ref.md] [--tipo lista] [--look guia-rapida] [--modelo claude-fable-5-1] [--rondas 2]
//
// Lee MI-MARCA.md e historico.json de la carpeta de trabajo, usa el system prompt de hermes/RUTINA-CARRUSEL.md
// más las reglas de SKILL.md §4, pide JSON estricto, valida contra el contrato, renderiza, corre QA y, si QA
// bloquea, devuelve el qa.json al modelo para corregir (máximo --rondas). Porta el contrato del cliente de
// BGI (llave → recorte → timeout → extraer JSON → un reintento solo-JSON → nunca confiar en la salida).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const DIR_SKILL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const tema = opt('--tema', null);
const carpetaTrabajo = path.resolve(opt('--carpeta', '.'));
const refPath = opt('--referencia', null);
const tipo = opt('--tipo', null);
const lookForzado = opt('--look', null);
const modelo = opt('--modelo', process.env.ANTHROPIC_MODEL || 'claude-fable-5-1');
const rondas = Number(opt('--rondas', 2));
const API = 'https://api.anthropic.com/v1/messages';
const TIMEOUT_MS = 180_000;

function leerLlave() {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY.trim();
  const f = path.join(os.homedir(), '.anthropic-cli', '.env');
  if (fs.existsSync(f)) { const m = fs.readFileSync(f, 'utf8').match(/ANTHROPIC_API_KEY\s*=\s*["']?([^"'\n]+)/); if (m) return m[1].trim(); }
  return null;
}
function fallo(msg) { console.error('✗ ' + msg); process.exit(2); }
if (!tema && !refPath) fallo('Dame --tema "…" o --referencia archivo.md');
const llave = leerLlave();
if (!llave) fallo('Falta ANTHROPIC_API_KEY (exporta la variable o guárdala en ~/.anthropic-cli/.env como ANTHROPIC_API_KEY=…).');

const marcaPath = path.join(carpetaTrabajo, 'MI-MARCA.md');
if (!fs.existsSync(marcaPath)) fallo(`No existe ${marcaPath}: llena la ficha primero (templates/MI-MARCA.md).`);
const marca = fs.readFileSync(marcaPath, 'utf8');
const referencia = refPath ? fs.readFileSync(refPath, 'utf8') : null;
let historico = [];
try { historico = JSON.parse(fs.readFileSync(path.join(carpetaTrabajo, 'historico.json'), 'utf8')); } catch {}
const lookAnterior = lookForzado ? null : (() => { const r = spawnSync('node', [path.join(DIR_SKILL, 'scripts', 'siguiente-look.mjs'), carpetaTrabajo, ...(tipo ? ['--tipo', tipo] : [])], { encoding: 'utf8' }); try { return JSON.parse(r.stdout); } catch { return null; } })();
const lookRecomendado = lookForzado || (lookAnterior && lookAnterior.recomendado) || 'guia-rapida';

const rutina = fs.readFileSync(path.join(DIR_SKILL, 'hermes', 'RUTINA-CARRUSEL.md'), 'utf8');
const bloque = rutina.match(/```text\n([\s\S]*?)```/);
const systemBase = bloque ? bloque[1] : rutina;
const skill = fs.readFileSync(path.join(DIR_SKILL, 'SKILL.md'), 'utf8');
const reglasCopy = (skill.match(/## 4\. Escribir[\s\S]*?(?=\n## 5\.)/) || [''])[0];
const system = `${systemBase}\n\nREGLAS ADICIONALES DE COPY Y ESTRUCTURA (de SKILL.md §4; mandan sobre lo anterior si chocan):\n${reglasCopy}\n\nPLAN VISUAL OBLIGATORIO: la portada lleva imagen (imagen.prompt con la persona de la marca en una situación del tema, sin texto), al menos dos láminas de cuerpo llevan imagen.prompt (ilustración, ícono 3D o escena, sin texto), y la lámina cta lleva la cara de la marca. Escribe alt en cada lámina.`;

const entrada = {
  tema: tema, referencia_texto: referencia, marca_ficha_md: marca,
  look_anterior: lookAnterior ? lookAnterior.ultimo?.look ?? null : null, look_recomendado: lookRecomendado, tipo_sugerido: tipo,
  historico_reciente: historico.slice(-6), qa_previo: null,
};

async function llamar(mensajes) {
  const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(API, { method: 'POST', signal: ctrl.signal,
      headers: { 'x-api-key': llave, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: modelo, max_tokens: 12000, temperature: 0.4, system, messages: mensajes }) });
    if (!r.ok) { const cuerpo = await r.text().catch(() => ''); throw new Error(`Anthropic ${r.status}: ${cuerpo.slice(0, 300)}`); }
    const j = await r.json();
    return (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
  } finally { clearTimeout(t); }
}
function extraerJson(texto) {
  const limpio = texto.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  try { return JSON.parse(limpio); } catch {}
  const i = limpio.indexOf('{'), j = limpio.lastIndexOf('}');
  if (i >= 0 && j > i) { try { return JSON.parse(limpio.slice(i, j + 1)); } catch {} }
  return null;
}
async function pedir(mensajes) {
  let texto = await llamar(mensajes);
  let json = extraerJson(texto);
  if (!json) {
    texto = await llamar([...mensajes, { role: 'assistant', content: texto }, { role: 'user', content: 'Tu respuesta no fue JSON válido. Responde SOLO el objeto JSON del contrato, sin markdown ni texto alrededor.' }]);
    json = extraerJson(texto);
  }
  if (!json) fallo('El modelo no devolvió JSON válido dos veces.');
  return json;
}

const encargo = `RUTINA: carrusel\n\nENTRADA:\n${JSON.stringify(entrada, null, 2)}`;
let salida = await pedir([{ role: 'user', content: encargo }]);
if (salida.escalar_a_claude) fallo(`El modelo escaló: ${salida.motivo}`);
let carrusel = salida.carrusel;
if (!carrusel || !Array.isArray(carrusel.slides)) fallo('La salida no trae carrusel.slides');

const fecha = new Date().toISOString().slice(0, 10);
const slug = (carrusel.slug || 'carrusel').replace(/[^a-z0-9-]/g, '-');
const carpeta = path.join(carpetaTrabajo, `${fecha}-${slug}`);
fs.mkdirSync(path.join(carpeta, 'assets', 'img'), { recursive: true });
const escribir = () => {
  fs.writeFileSync(path.join(carpeta, 'carrusel.json'), JSON.stringify(carrusel, null, 2) + '\n');
  fs.writeFileSync(path.join(carpeta, 'caption.txt'), `${carrusel.caption || ''}\n\n${(carrusel.hashtags || []).join(' ')}\n\n---\nPalabra clave: ${carrusel.palabra_clave || ''}\nEntregable por DM: ${carrusel.entregable || ''}\nEscrito con ${modelo} vía API · faltantes: ${JSON.stringify(salida.faltantes || [])} · confianza: ${salida.confianza}\nImágenes pendientes: cada lámina con imagen.prompt necesita generarse y guardarse en assets/img/ (ver references/IMAGENES.md).\n`);
};
escribir();
console.log(`Guion → ${carpeta}/carrusel.json (${carrusel.slides.length} láminas, look ${carrusel.look})`);

for (let ronda = 1; ronda <= rondas; ronda++) {
  spawnSync('node', [path.join(DIR_SKILL, 'scripts', 'render.mjs'), carpeta, '--sin-preview'], { stdio: 'inherit' });
  const qa = spawnSync('node', [path.join(DIR_SKILL, 'scripts', 'qa.mjs'), carpeta, '--json'], { encoding: 'utf8' });
  let informe = null; try { informe = JSON.parse(qa.stdout); } catch {}
  if (!informe) { console.error(qa.stderr || 'QA no devolvió JSON'); break; }
  console.log(`QA ronda ${ronda}: ${informe.indice}/100 → ${informe.veredicto} (${informe.errores.length} errores, ${informe.avisos.length} avisos)`);
  if (informe.veredicto !== 'BLOQUEADO' || ronda === rondas) break;
  salida = await pedir([{ role: 'user', content: encargo }, { role: 'assistant', content: JSON.stringify(salida) },
    { role: 'user', content: `RUTINA: carrusel (ronda ${ronda + 1})\n\nqa_previo:\n${JSON.stringify({ errores: informe.errores, avisos: informe.avisos.slice(0, 12) }, null, 2)}\n\nCorrige cada error, conserva todo lo demás y devuelve el contrato completo.` }]);
  if (salida.carrusel) { carrusel = salida.carrusel; escribir(); }
}
spawnSync('node', [path.join(DIR_SKILL, 'scripts', 'render.mjs'), carpeta], { stdio: 'inherit' });
console.log(`\nSiguiente: genera las imágenes de imagen.prompt, guárdalas en ${path.join(carpeta, 'assets', 'img')} y vuelve a correr render.mjs + qa.mjs.`);
