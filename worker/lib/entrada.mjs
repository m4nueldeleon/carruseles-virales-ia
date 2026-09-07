// entrada.mjs: convierte la entrada del pedido (idea, texto, link o imagen) en entrada/referencia.md,
// decide qué formatos se producen según `versiones` y detecta apps con nombre propio para pedir sus logos.
import fs from 'node:fs';
import path from 'node:path';
import { log, aviso } from './log.mjs';
import { ejecutar, motivoDeSalida } from './procesos.mjs';

const TIMEOUT_REFERENCIA_MS = 15 * 60_000; // Apify puede tardar varios minutos con un reel
const TIMEOUT_VISION_MS = 5 * 60_000;
const TOPE_IMAGEN_BYTES = 25 * 1024 * 1024;
const TOPE_TEMA = 200;
const EXT_POR_TIPO = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp' };

// Qué se produce con N versiones. Con referencia (link o captura), una versión imita su formato.
export function decidirFormatos(versiones, hayReferencia) {
  const n = Math.min(4, Math.max(1, Number(versiones) || 1));
  if (n === 1) return ['carrusel-8'];
  if (n === 2) return ['carrusel-5', 'imagen-unica'];
  if (n === 3) return hayReferencia ? ['referencia', 'imagen-unica', 'carrusel-5'] : ['imagen-unica', 'carrusel-5', 'carrusel-8'];
  return [hayReferencia ? 'referencia' : 'carrusel-8', 'imagen-unica', 'carrusel-5', 'carrusel-8'];
}

const escapar = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Nombres propios con mayúscula de la lista configurable, tal como los escribió quien pidió.
export function detectarLogos(textos, apps) {
  const texto = textos.filter(Boolean).join('\n');
  const encontradas = apps.filter((app) => new RegExp(`(^|[^\\p{L}\\p{N}])${escapar(app)}(?=$|[^\\p{L}\\p{N}])`, 'u').test(texto));
  return encontradas.length ? encontradas.join(',') : null;
}

export function recortarTema(texto) {
  const plano = String(texto || '').replace(/\s+/g, ' ').trim();
  if (plano.length <= TOPE_TEMA) return plano || null;
  const corte = plano.lastIndexOf(' ', TOPE_TEMA);
  return plano.slice(0, corte > 80 ? corte : TOPE_TEMA).trim();
}

const bloqueInstrucciones = (instrucciones) => `\n## Instrucciones del pedido\n\n${String(instrucciones || '').trim() || '(ninguna)'}\n`;

function anexarInstrucciones(ruta, instrucciones) {
  if (!fs.existsSync(ruta) || !String(instrucciones || '').trim()) return;
  fs.appendFileSync(ruta, bloqueInstrucciones(instrucciones));
}

function referenciaDeTexto(pedido, ruta) {
  const texto = String(pedido.entrada_texto || '').trim();
  if (!texto) return { fallo: 'El pedido no trae texto' };
  const md = ['# Referencia', '', `- **Tipo:** ${pedido.entrada_tipo}`, '- **Fuente:** pedido del Centro de Control de Marca',
    `- **Palabras:** ${texto.split(/\s+/).length}`, '', '## Texto', '', texto, '', bloqueInstrucciones(pedido.instrucciones)];
  fs.writeFileSync(ruta, md.join('\n'));
  return { ruta, hayReferencia: false, tema: pedido.entrada_tipo === 'idea' ? recortarTema(texto) : null };
}

const listarImagenes = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).sort() : []);
const palabrasEn = (ruta) => Number((fs.existsSync(ruta) ? fs.readFileSync(ruta, 'utf8') : '').match(/\*\*Palabras:\*\*\s*(\d+)/)?.[1] || 0);

// Lectura visual con scripts/leer-imagen.mjs (lo aporta la skill). En simulación, sin el script, deja una ficha vacía.
async function leerImagenes(objetivo, rutaMd, config) {
  const script = path.join(config.skillDir, 'scripts', 'leer-imagen.mjs');
  if (!fs.existsSync(script)) {
    if (!config.simular) return { ok: false, motivo: 'La skill del servidor aún no tiene scripts/leer-imagen.mjs (lectura visual de capturas)' };
    fs.appendFileSync(rutaMd, '\n## Lectura visual (simulada)\n\n_(sin leer-imagen.mjs en esta skill)_\n');
    return { ok: true };
  }
  const r = await ejecutar('node', [script, objetivo, '--out', rutaMd, '--append'],
    { cwd: config.skillDir, timeoutMs: TIMEOUT_VISION_MS, alStderr: (l) => log('  leer-imagen:', l) });
  if (r.codigo === 0 && fs.existsSync(rutaMd)) return { ok: true };
  return { ok: false, motivo: `No pude leer la imagen de referencia. ${motivoDeSalida(r.stderr)}`.trim() };
}

async function referenciaDeLink(pedido, dirEntrada, ruta, config) {
  if (!pedido.entrada_url) return { fallo: 'El pedido no trae el link' };
  const r = await ejecutar('python3', [path.join(config.skillDir, 'scripts', 'referencia.py'), pedido.entrada_url, '--out', dirEntrada],
    { cwd: config.skillDir, timeoutMs: TIMEOUT_REFERENCIA_MS, alStderr: (l) => log('  referencia.py:', l) });
  const avisoPy = (r.stderr.match(/AVISO:\s*(.+)/) || [])[1] || '';
  const laminas = listarImagenes(path.join(dirEntrada, '_referencia'));
  if (laminas.length) {
    if (!fs.existsSync(ruta)) fs.writeFileSync(ruta, `# Referencia\n\n- **Tipo:** link\n- **Fuente:** ${pedido.entrada_url}\n`);
    const lectura = await leerImagenes(path.join(dirEntrada, '_referencia'), ruta, config);
    if (!lectura.ok) aviso(lectura.motivo);
  }
  if (!fs.existsSync(ruta) || (palabrasEn(ruta) === 0 && !laminas.length)) {
    const detalle = avisoPy || motivoDeSalida(r.stderr) || 'El link no devolvió texto.';
    return { fallo: `No pude leer el contenido del link. ${detalle} Pega el texto o la transcripción como entrada de tipo texto.`.replace(/\s+/g, ' ').trim() };
  }
  anexarInstrucciones(ruta, pedido.instrucciones);
  return { ruta, hayReferencia: true, tema: null };
}

async function descargarImagen(url, dirEntrada) {
  const r = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!r.ok) throw new Error(`respuesta ${r.status}`);
  const tipo = (r.headers.get('content-type') || '').split(';')[0].trim();
  const datos = Buffer.from(await r.arrayBuffer());
  if (!datos.length || datos.length > TOPE_IMAGEN_BYTES) throw new Error('la imagen está vacía o pesa más de 25 MB');
  const ext = EXT_POR_TIPO[tipo] || (path.extname(new URL(url).pathname).match(/^\.(png|jpe?g|webp)$/i)?.[0] || '.jpg');
  const destino = path.join(dirEntrada, `imagen${ext.toLowerCase()}`);
  fs.writeFileSync(destino, datos);
  return destino;
}

async function referenciaDeImagen(pedido, dirEntrada, ruta, config) {
  if (!pedido.entrada_imagen_url) return { fallo: 'El pedido no trae la imagen' };
  let imagen;
  try {
    imagen = await descargarImagen(pedido.entrada_imagen_url, dirEntrada);
  } catch (e) {
    return { fallo: `No pude descargar la imagen del pedido (${e.message}). Vuelve a subirla.` };
  }
  fs.writeFileSync(ruta, `# Referencia\n\n- **Tipo:** imagen\n- **Fuente:** captura subida al pedido\n`);
  const lectura = await leerImagenes(imagen, ruta, config);
  if (!lectura.ok) return { fallo: lectura.motivo };
  anexarInstrucciones(ruta, pedido.instrucciones);
  return { ruta, hayReferencia: true, tema: null };
}

// Devuelve { ruta, hayReferencia, tema } o { fallo } con un texto para el equipo.
export async function construirReferencia({ pedido, dirEntrada, config }) {
  fs.mkdirSync(dirEntrada, { recursive: true });
  const ruta = path.join(dirEntrada, 'referencia.md');
  const tipo = pedido.entrada_tipo;
  if (tipo === 'idea' || tipo === 'texto') return referenciaDeTexto(pedido, ruta);
  if (tipo === 'link') return referenciaDeLink(pedido, dirEntrada, ruta, config);
  if (tipo === 'imagen') return referenciaDeImagen(pedido, dirEntrada, ruta, config);
  return { fallo: `Tipo de entrada desconocido: ${tipo}` };
}
