#!/usr/bin/env node
// qa.mjs — Puerta de calidad de un carrusel. Mide lo que se puede medir por código y calcula un
// índice de viralidad (0-100) con la rúbrica de references/PSICOLOGIA-VIRALIDAD.md.
//
//   node scripts/qa.mjs <carpeta-del-carrusel> [--json] [--estricto]
//
// Sale con código 1 si hay ERRORES (bloquean la entrega). Los AVISOS no bloquean pero restan puntos.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { construirHTML, palabras } from './lib/construir-html.mjs';
import { cargarPlaywright } from './lib/playwright.mjs';

const DIR_SKILL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const carpeta = path.resolve(args.find(a => !a.startsWith('--')) || '.');
const salidaJson = args.includes('--json');
const estricto = args.includes('--estricto');

const data = JSON.parse(fs.readFileSync(path.join(carpeta, 'carrusel.json'), 'utf8'));
const dirSrc = path.join(carpeta, 'slides-src');
fs.mkdirSync(dirSrc, { recursive: true });
const htmlPath = path.join(dirSrc, 'index.html');
fs.writeFileSync(htmlPath, construirHTML({ data, dirCarrusel: carpeta, dirSalida: dirSrc, dirSkill: DIR_SKILL }));

// ---------- reglas de copy ----------
const LISTA_NEGRA = [
  'en la era digital', 'en un mundo donde', 'imagina un mundo', 'desbloquea tu potencial', 'lleva tu negocio al siguiente nivel',
  'revoluciona', 'transforma tu vida', 'transforma tu negocio', 'el poder de la ia', 'descubre el secreto', 'sin duda',
  'en resumen', 'la clave del éxito', 'potencia tus resultados', 'cambia las reglas del juego', 'maximiza tu potencial',
  'la herramienta definitiva', 'el futuro es ahora', 'sumérgete', 'no se trata solo de', 'en el mundo actual', 'game changer',
  'indetectable', 'éxito garantizado', 'hazte rico', 'ingreso pasivo',
];
const CEBO = ['etiqueta a un amigo', 'etiqueta a', 'dale like', 'sígueme para más', 'sígueme y', 'link en bio', 'link en la bio', 'métete a mi perfil', 'comenta sí', 'comenta con', 'comenta el emoji', 'comparte con 5', 'comparte con 3', 'comparte con 10'];
const DEPENDE_DE_LA_1 = [/\bcomo te dec[ií]a\b/i, /\bcomo vimos\b/i, /\bcontin[uú]a(mos)?\b/i, /\bcomo dije\b/i];
const ENVIO = /\b(m[aá]nda(se)?lo|env[ií]a(se)?lo|comp[aá]rte(se)?lo|p[aá]sa(se)?lo|reenv[ií]a(se)?lo)\b/i;
const FORMULAS_HOOK = [
  /^\s*no\b/i, /\bsin antes\b/i, /\bdeja de\b/i, /\d/, /\bvs\.?\b|\bcontra\b|\bantes\b.*\bahora\b/i, /\?\s*$/,
  /\bnadie te dice\b|\bnadie te enseña\b/i, /\bse nota\b|\bse dan cuenta\b/i, /\bgratis\b/i, /\bmal\b/i, /\berror(es)?\b/i,
];

const problemas = []; // {nivel:'error'|'aviso', slide, msg}
const err = (slide, msg) => problemas.push({ nivel: 'error', slide, msg });
const aviso = (slide, msg) => problemas.push({ nivel: 'aviso', slide, msg });

function textoDe(s) {
  const partes = [s.kicker, s.titulo, s.subtitulo, s.cuerpo, s.loop, s.dato, s.cita, s.autor, s.prompt, s.boton, s.pie,
    ...(s.items || []).map(i => typeof i === 'string' ? i : [i.texto, i.nota].join(' ')),
    ...(s.a?.items || []), s.a?.titulo, ...(s.b?.items || []), s.b?.titulo,
    ...(s.pasos || []).flatMap(p => [p.titulo, p.detalle]), ...(s.chips || [])];
  return partes.filter(Boolean).join(' ').replace(/[*_]/g, '');
}

// ---------- ficha de marca (si existe en la carpeta de trabajo) ----------
const dirTrabajo = path.dirname(carpeta);
let prohibidasMarca = [];
try {
  const ficha = fs.readFileSync(path.join(dirTrabajo, 'MI-MARCA.md'), 'utf8');
  const m = ficha.match(/\*\*Palabras que NUNCA[^:]*:\*\*\s*([^\n]+)/i);
  if (m) prohibidasMarca = m[1].split(/[·,;]/).map(x => x.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').trim().toLowerCase()).filter(x => x.length >= 3 && x.length <= 30 && !x.includes('/'));
} catch {}

// ---------- rotación de look: carpetas hermanas + histórico ----------
const recientes = [];
try { for (const h of JSON.parse(fs.readFileSync(path.join(dirTrabajo, 'historico.json'), 'utf8'))) recientes.push({ slug: h.slug, fecha: h.fecha || '', look: h.look }); } catch {}
try {
  for (const d of fs.readdirSync(dirTrabajo, { withFileTypes: true })) {
    if (!d.isDirectory() || path.join(dirTrabajo, d.name) === carpeta) continue;
    const f = path.join(dirTrabajo, d.name, 'carrusel.json');
    if (!fs.existsSync(f)) continue;
    try { const c = JSON.parse(fs.readFileSync(f, 'utf8')); recientes.push({ slug: c.slug || d.name, fecha: c.fecha || d.name.slice(0, 10), look: c.look }); } catch {}
  }
} catch {}
const masReciente = recientes.filter(r => r.look && r.slug !== data.slug).sort((a, b) => (b.fecha + b.slug).localeCompare(a.fecha + a.slug))[0];

// ---------- estructura ----------
const N = data.slides.length;
if (N < 5) err(0, `Solo ${N} láminas: un carrusel útil lleva 6-12 (hasta 20 si es guía larga).`);
if (N > 20) err(0, `${N} láminas: Instagram permite máximo 20.`);
if (N > 12) aviso(0, `${N} láminas: más de 12 baja la tasa de finalización; considera partir en serie.`);
const portada = data.slides[0];
if (!portada.titulo) err(1, 'La portada no tiene título.');
const palPortada = palabras(portada.titulo);
if (palPortada > 9) err(1, `Título de portada con ${palPortada} palabras: máximo 9 (ideal 4-7).`);
else if (palPortada > 7) aviso(1, `Título de portada con ${palPortada} palabras: el ideal es 4-7.`);
const hookOk = FORMULAS_HOOK.some(re => re.test(String(portada.titulo || '') + ' ' + String(portada.subtitulo || '')));
if (!hookOk) aviso(1, 'El gancho no usa ninguna fórmula probada (número, negación, "no X sin", contraste, pregunta cerrada, "se nota", gratis, error).');
if (!/\*[^*]+\*/.test(String(portada.titulo || ''))) aviso(1, 'La portada no marca una palabra en acento (*palabra*): la palabra imán guía el ojo.');
const s2 = data.slides[1];
if (s2 && !['rehook', 'agitacion', 'cuerpo'].includes(s2.rol || 'cuerpo')) aviso(2, 'La lámina 2 debería re-enganchar (rol rehook/agitacion): promesa concreta + open loop.');
if (s2 && !s2.loop) aviso(2, 'La lámina 2 no cierra con loop: es la segunda portada (Instagram la muestra a quien no deslizó) y debe obligar a seguir.');
if (s2 && DEPENDE_DE_LA_1.some(re => re.test(textoDe(s2)))) err(2, 'La lámina 2 depende de la 1 («como te decía», «como vimos», «continúa»): tiene que entenderse sola.');
data.slides.forEach((s, i) => {
  const elems = (s.items || []).length || (s.pasos || []).length || (s.chips || []).length;
  const tope = (s.rol === 'cheatsheet' || ['lista', 'pasos', 'prompt', 'comparativa'].includes(s.layout)) ? 7 : 4;
  if (elems > tope) aviso(i + 1, `${elems} elementos en una lámina: la memoria de trabajo aguanta ~4 (7 en la guardable). Agrupa o parte.`);
});
const cta = data.slides.filter(s => s.rol === 'cta');
if (cta.length === 0) err(N, 'No hay lámina de CTA (rol "cta").');
if (cta.length > 1) err(N, 'Más de una lámina de CTA: un carrusel pide UNA sola acción.');
if (data.slides[N - 1]?.rol !== 'cta') aviso(N, 'La última lámina no es el CTA.');
const conLoop = data.slides.filter(s => (s.rol || 'cuerpo') === 'cuerpo' && s.loop).length;
const cuerpoN = data.slides.filter(s => (s.rol || 'cuerpo') === 'cuerpo').length;
if (cuerpoN > 0 && conLoop / cuerpoN < 0.5) aviso(0, `Solo ${conLoop} de ${cuerpoN} láminas de cuerpo cierran con open loop ("loop"): mete uno al pie de la mayoría.`);
const guardable = data.slides.some(s => ['lista', 'pasos', 'prompt', 'comparativa'].includes(s.layout) || s.rol === 'cheatsheet');
if (!guardable) aviso(0, 'No hay lámina guardable (lista, pasos, prompt o comparativa): es lo que justifica el SAVE.');
const conNumero = data.slides.filter(s => /\d/.test(textoDe(s))).length;
if (conNumero < 2) aviso(0, `Solo ${conNumero} lámina(s) con números/porcentajes: mete al menos 2 datos concretos.`);

// ---------- copy ----------
const todoTexto = data.slides.map(textoDe).join('\n') + '\n' + (data.caption || '');
for (const frase of LISTA_NEGRA) if (todoTexto.toLowerCase().includes(frase)) err(0, `Frase de IA en el copy: «${frase}». Bórrala y reescribe.`);
for (const pal of prohibidasMarca) { const re = new RegExp(`\\b${pal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'); if (re.test(todoTexto)) aviso(0, `Palabra prohibida en MI-MARCA.md: «${pal}».`); }
if (/—/.test(data.slides.map(textoDe).join(' '))) aviso(0, 'Raya larga (—) en una lámina: usa punto, dos puntos o coma.');
if (masReciente && masReciente.look === data.look) aviso(0, `Mismo look (${data.look}) que el carrusel más reciente «${masReciente.slug}»: rota (node scripts/siguiente-look.mjs).`);
data.slides.forEach((s, i) => {
  const acentos = (String(s.titulo || '').match(/\*[^*]+\*/g) || []).length;
  if (acentos > 1) aviso(i + 1, `${acentos} palabras en acento en el título: solo una (la palabra imán).`);
});
const puntos = data.slides.filter(s => s.layout === 'punto-numero' && !(s.imagen && /recorte|derecha/.test(s.imagen.pos || '')));
if (puntos.length >= 2) { const conF = puntos.filter(s => s.numero_fantasma).length; if (conF > 0 && conF < puntos.length) aviso(0, `numero_fantasma en ${conF} de ${puntos.length} láminas punto-numero: o en todas o en ninguna.`); }
for (const frase of CEBO) if (todoTexto.toLowerCase().includes(frase)) aviso(0, `Cebo de interacción o CTA vago: «${frase}». Cambia por una sola acción concreta.`);
data.slides.forEach((s, i) => {
  const n = palabras(textoDe(s)) - palabras(s.pie);  // el pie (fuente, nota) no cuenta para la lectura de 3 s
  if (s.rol === 'cheatsheet' || s.layout === 'lista' || s.layout === 'prompt' || s.layout === 'comparativa' || s.layout === 'pasos') { if (n > 70) aviso(i + 1, `${n} palabras en una lámina guardable: tope 70.`); }
  else if (n > 40) err(i + 1, `${n} palabras: máximo 40 por lámina (se lee en <3 s a brazo extendido).`);
  const conj = (textoDe(s).match(/\b(y además|además|también)\b/gi) || []).length;
  if (conj >= 2) aviso(i + 1, 'Varias ideas en una lámina ("además/también"): una idea por lámina.');
});
if (data.caption) {
  const primera = data.caption.split('\n')[0];
  if (primera.length > 125) aviso(0, `La primera línea del caption tiene ${primera.length} caracteres; se cortan a ~125 antes de "más".`);
  if (data.palabra_clave && !data.caption.toUpperCase().includes(String(data.palabra_clave).toUpperCase())) err(0, `La palabra clave «${data.palabra_clave}» no aparece en el caption.`);
  if (data.palabra_clave && !cta.some(c => textoDe(c).toUpperCase().includes(String(data.palabra_clave).toUpperCase()))) err(N, `La palabra clave «${data.palabra_clave}» no está en la lámina de CTA.`);
  if (!ENVIO.test(data.caption) && !data.slides.some(s => ENVIO.test(textoDe(s)))) aviso(0, 'Falta la frase de envío con destinatario («Mándaselo a tu socio que…»): los envíos son la señal #1 de alcance a no seguidores.');
} else aviso(0, 'No hay caption.');
const conImagen = data.slides.filter(s => s.imagen && s.imagen.src);
if (!portada.imagen || !portada.imagen.src) aviso(1, 'La portada no lleva imagen: la cara de la marca en una situación del tema sube la atención y la identidad.');
const cuerpoConImg = data.slides.filter(s => (s.rol || 'cuerpo') === 'cuerpo' && s.imagen && s.imagen.src).length;
if (cuerpoConImg < 2) aviso(0, `Solo ${cuerpoConImg} lámina(s) de cuerpo con imagen: el plan visual pide al menos 2 (ícono/ilustración, foto en situación o captura).`);
{ const seq = data.slides.map(s => s.layout); let rep = 1; for (let i = 1; i < seq.length; i++) { rep = seq[i] === seq[i - 1] ? rep + 1 : 1; if (rep === 4) { aviso(i + 1, `Cuatro láminas seguidas con el layout ${seq[i]}: rompe el ritmo con una imagen, un dato-hero o una foto-texto.`); break; } } }
const conAlt = data.slides.filter(s => s.alt).length;
if (conAlt === 0) aviso(0, 'Ninguna lámina trae `alt` (texto alternativo con la palabra clave del tema): Instagram y Google indexan ese texto.');
const hashtags = data.hashtags || [];
if (hashtags.length > 5) err(0, `${hashtags.length} hashtags: Instagram limita a 5 desde dic-2025.`);
if (hashtags.length === 0) aviso(0, 'Sin hashtags: 3-5 de nicho ayudan a la búsqueda.');

// ---------- medición en el navegador ----------
const { chromium } = cargarPlaywright(DIR_SKILL);
const rel = (l1, l2) => { const [a, b] = l1 > l2 ? [l1, l2] : [l2, l1]; return (a + 0.05) / (b + 0.05); };
function lum(rgb) { const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]); }
function parseColor(s, fondo) {
  if (!s) return null;
  const hex = s.match(/^#([0-9a-f]{6})$/i); if (hex) return [0, 2, 4].map(i => parseInt(hex[1].slice(i, i + 2), 16));
  const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null;
  const p = m[1].split(',').map(Number); const a = p.length > 3 ? p[3] : 1;
  if (a === 0) return null;
  if (a < 1 && fondo) return p.slice(0, 3).map((c, i) => Math.round(a * c + (1 - a) * fondo[i]));
  return p.slice(0, 3);
}

(async () => {
  const browser = await chromium.launch();
  const w = Number(fs.readFileSync(htmlPath, 'utf8').match(/data-w="(\d+)"/)[1]);
  const h = Number(fs.readFileSync(htmlPath, 'utf8').match(/data-h="(\d+)"/)[1]);
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle' });
  try { await page.evaluate(() => document.fonts.ready); } catch {}
  await page.waitForTimeout(400);
  try { await page.evaluate(() => window.__fit && window.__fit()); } catch {}
  const medidas = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('.slide').forEach(slide => {
      const r = slide.getBoundingClientRect();
      const bg = slide.dataset.bg;
      const textos = [];
      const walker = document.createTreeWalker(slide, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (!node.textContent.trim()) continue;
        const el = node.parentElement; if (!el || el.closest('#descargar')) continue;
        const cs = getComputedStyle(el);
        const range = document.createRange(); range.selectNodeContents(node);
        const rr = range.getBoundingClientRect();
        if (rr.width === 0) continue;
        const critico = !!el.closest('.titulo,.sub,.cuerpo,.item,.cita,.dato,.paso,.cta-boton,.prompt,.loop,.col,.numero');
        let bgPropio = null, anc = el;
        while (anc && anc !== slide) { const b = getComputedStyle(anc).backgroundColor; if (b && !/rgba\(\s*\d+,\s*\d+,\s*\d+,\s*0\)/.test(b) && b !== 'transparent') { bgPropio = b; break; } anc = anc.parentElement; }
        const esAcento = !!el.closest('.acento,.idx,.numero,.dato,.n,.autor');
        const clase = (el.closest('.titulo,.sub,.cuerpo,.item,.cita,.dato,.paso,.cta-boton,.prompt,.loop,.col,.top,.bottom,.sello,.chip,.kicker,.autor,.numero') || el).className || el.tagName;
        textos.push({ txt: node.textContent.trim().slice(0, 40), fs: parseFloat(cs.fontSize), color: cs.color, bgPropio, esAcento, clase: String(clase).split(' ')[0],
          top: rr.top - r.top, bottom: rr.bottom - r.top, left: rr.left - r.left, right: rr.right - r.left, critico });
      }
      const cont = slide.querySelector('.contenido');
      const desborde = cont ? cont.scrollHeight - cont.clientHeight : 0;
      const cajas = {};
      for (const sel of ['.recorte', '.img-derecha', '.img-abajo', '.img-centro', '.panel', '.foto']) { const el = slide.querySelector(sel); if (el) { const b = el.getBoundingClientRect(); cajas[sel] = { left: b.left - r.left, right: b.right - r.left, top: b.top - r.top, bottom: b.bottom - r.top }; } }
      const acentos = [...slide.querySelectorAll('.contenido .acento')].map(a => { const b = a.getBoundingClientRect(); return { txt: a.textContent.trim().slice(0, 30), left: b.left - r.left, right: b.right - r.left, top: b.top - r.top, bottom: b.bottom - r.top }; });
      out.push({ n: Number(slide.dataset.n), layout: slide.dataset.layout, bg, w: r.width, h: r.height, desborde, ajuste: Number(slide.dataset.ajuste || 0), textos, cajas, acentos });
    });
    return out;
  });
  await browser.close();

  const SAFE = 80, UI = 150;
  const cruza = (a, b) => a.left < b.right - 12 && a.right > b.left + 12 && a.top < b.bottom - 12 && a.bottom > b.top + 12;
  for (const m of medidas) {
    for (const sel of ['.recorte', '.img-derecha', '.img-centro']) {
      const caja = m.cajas[sel]; if (!caja) continue;
      const tapados = m.textos.filter(t => t.critico && cruza(t, caja));
      if (tapados.length) aviso(m.n, `La imagen (${sel.slice(1)}) se traslapa con el texto «${tapados[0].txt}»: acorta el texto o usa una foto con el sujeto en su mitad.`);
    }
    if (m.cajas['.panel']) for (const a of m.acentos) if (cruza(a, m.cajas['.panel'])) aviso(m.n, `La palabra en acento «${a.txt}» cae sobre el panel del mismo color: se pierde. Acorta el título o quita el panel.`);
    if (m.desborde > 6) err(m.n, `El contenido desborda ${Math.round(m.desborde)}px aun reduciendo la letra 15%: recorta texto o cambia de layout.`);
    else if (m.ajuste > 8) aviso(m.n, `Hubo que reducir la letra ${m.ajuste}% para que cupiera: recorta el texto.`);
    const fondo = parseColor(m.bg) || [17, 17, 17];
    let minContraste = 21, minTinta = 21, peor = '';
    for (const t of m.textos) {
      const esMicro = /top|bottom|sello|chip|autor|pager|handle|kicker|sticker/.test(t.clase);
      const minFs = /titulo|cita|dato/.test(t.clase) ? 84 : esMicro ? 30 : 38;
      if (t.fs < minFs) (t.fs < 30 ? err : aviso)(m.n, `Texto de ${Math.round(t.fs)}px en .${t.clase} («${t.txt}»): mínimo ${minFs}px.`);
      if (t.left < SAFE - 2 || t.right > m.w - SAFE + 2 || t.top < 0 || t.bottom > m.h) {
        if (!/top|bottom/.test(t.clase)) err(m.n, `«${t.txt}» sale del margen seguro (${Math.round(t.left)}-${Math.round(t.right)}px).`);
      }
      if (t.critico && t.bottom > m.h - UI && !/cta-boton|sello/.test(t.clase)) aviso(m.n, `«${t.txt}» cae en la franja inferior que tapa Instagram (${Math.round(t.bottom)}px de ${m.h}).`);
      const c = parseColor(t.color);
      const f = parseColor(t.bgPropio, fondo) || fondo;
      if (c && t.critico) { const k = rel(lum(c), lum(f)); if (k < minContraste) { minContraste = k; peor = `${t.clase}: «${t.txt}»`; } if (!t.esAcento) minTinta = Math.min(minTinta, k); }
      else if (c && esMicro) { const k = rel(lum(c), lum(f)); if (k < 3) aviso(m.n, `Texto pequeño «${t.txt}» con contraste ${k.toFixed(1)}:1.`); }
    }
    if (minContraste < 3) err(m.n, `Contraste ${minContraste.toFixed(1)}:1 en ${peor} — debajo de 3:1 (ilegible en el celular).`);
    else if (minContraste < 4.5) aviso(m.n, `Contraste ${minContraste.toFixed(1)}:1 en ${peor} — sube a ≥4.5:1 si es una palabra clave.`);
    if (minTinta < 7 && minTinta >= 3) aviso(m.n, `El texto principal tiene contraste ${minTinta.toFixed(1)}:1 — el ideal para 35-60 años es ≥7:1.`);
  }

  // ---------- índice de viralidad (0-100) ----------
  const errores = problemas.filter(p => p.nivel === 'error');
  const avisos = problemas.filter(p => p.nivel === 'aviso');
  const tiene = re => problemas.some(p => re.test(p.msg));
  const subConNumero = /\d/.test(String(portada.subtitulo || ''));
  const portadaAnuncia = (portada.chips || []).length >= 3 || !!(portada.imagen && portada.imagen.src);
  const pts = {
    gancho: (palPortada >= 3 && palPortada <= 7 ? 10 : palPortada <= 9 ? 6 : 0) + (hookOk ? 10 : 0) + (/\*[^*]+\*/.test(String(portada.titulo || '')) ? 4 : 0)
      + (subConNumero ? 3 : 0) + (portadaAnuncia ? 3 : 0),
    estructura: (N >= 7 && N <= 12 ? 6 : N >= 5 ? 3 : 0) + (s2 && ['rehook', 'agitacion'].includes(s2.rol) && s2.loop ? 4 : s2 && ['rehook', 'agitacion'].includes(s2.rol) ? 2 : 0)
      + (conNumero >= 2 ? 5 : conNumero === 1 ? 2 : 0) + (cuerpoN && conLoop / cuerpoN >= 0.5 ? 5 : conLoop ? 2 : 0) + (guardable ? 7 : 0)
      + (cta.length === 1 && data.palabra_clave ? 8 : cta.length === 1 ? 5 : 0),
    legibilidad: (tiene(/mínimo \d+px/) ? 0 : 5) + (tiene(/palabras: máximo/) ? 0 : 3) + (tiene(/debajo de 3:1/) ? 0 : tiene(/Contraste \d|contraste \d/) ? 2 : 4) + (tiene(/desborda|margen seguro/) ? 0 : 4) + (cuerpoConImg >= 2 && portada.imagen && portada.imagen.src ? 4 : cuerpoConImg >= 1 ? 2 : 0),
    copy: (tiene(/Frase de IA/) ? 0 : 5) + (data.caption && data.caption.split('\n')[0].length <= 125 ? 2 : 0) + (hashtags.length >= 3 && hashtags.length <= 5 ? 2 : 0)
      + (tiene(/Cebo de interacción/) ? 0 : 3) + (tiene(/frase de envío/) ? 0 : 3),
  };
  const indice = Math.max(0, Math.min(100, Object.values(pts).reduce((a, b) => a + b, 0) - errores.length * 4));
  const veredicto = errores.length ? 'BLOQUEADO' : indice >= 80 ? 'LISTO' : indice >= 65 ? 'MEJORABLE' : 'REHACER';
  const informe = { carpeta: path.basename(carpeta), laminas: N, look: data.look, indice, veredicto, puntos: pts, errores, avisos };
  fs.writeFileSync(path.join(carpeta, 'qa.json'), JSON.stringify(informe, null, 2));
  if (salidaJson) console.log(JSON.stringify(informe, null, 2));
  else {
    console.log(`\nQA · ${data.slug || path.basename(carpeta)} · ${N} láminas · look ${data.look}`);
    console.log(`Índice de viralidad: ${indice}/100 → ${veredicto}   (gancho ${pts.gancho}/30 · estructura ${pts.estructura}/35 · legibilidad ${pts.legibilidad}/20 · copy ${pts.copy}/15)`);
    for (const p of errores) console.log(`  ✗ [${p.slide || '-'}] ${p.msg}`);
    for (const p of avisos) console.log(`  · [${p.slide || '-'}] ${p.msg}`);
    if (!problemas.length) console.log('  ✓ sin observaciones');
  }
  process.exit(errores.length || (estricto && avisos.length) ? 1 : 0);
})().catch(e => { console.error('QA falló:', e.message); process.exit(1); });
