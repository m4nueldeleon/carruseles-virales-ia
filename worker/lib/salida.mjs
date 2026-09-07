// salida.mjs: lee lo que deja escribir.mjs en la carpeta de la versión (carrusel.json, caption.txt, qa.json,
// slides/) y arma el zip descargable con las láminas, el caption y el preview.
import fs from 'node:fs';
import path from 'node:path';
import { ejecutar } from './procesos.mjs';

export function leerJsonSiExiste(ruta) {
  try { return JSON.parse(fs.readFileSync(ruta, 'utf8')); } catch { return null; }
}

// Solo las láminas numeradas (01.png…), en orden; ignora copias y restos de renders anteriores.
export function listarSlides(carpeta) {
  const dir = path.join(carpeta, 'slides');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => /^\d{2}\.png$/.test(f)).sort();
}

// El bloque pegable en Instagram: todo lo que va antes de la primera línea `---` (después vienen las notas).
export function extraerCaption(rutaCaption) {
  if (!fs.existsSync(rutaCaption)) return null;
  const [bloque] = fs.readFileSync(rutaCaption, 'utf8').split(/^\s*---\s*$/m);
  return bloque.trim() || null;
}

// Título sin el marcado del motor (*acento*, **negrita**, ==marcador==) ni saltos de línea.
export function limpiarTitulo(titulo) {
  return String(titulo || '').replace(/\*\*|\*|==/g, '').replace(/\s*\n\s*/g, ' ').replace(/\s+/g, ' ').trim();
}

export function tituloPortada(carrusel) {
  return limpiarTitulo(carrusel?.slides?.[0]?.titulo) || null;
}

// ---------- el error, dicho en español ----------

// El mensaje que manda la API viene envuelto en JSON: «{"error":{"message":"…"}}».
function mensajeDeApi(bruto) {
  const m = String(bruto || '').match(/"message"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  const texto = m ? m[1].replace(/\\"/g, '"').replace(/\\n/g, ' ') : String(bruto || '');
  return texto.replace(/\s+/g, ' ').replace(/[{}"]+$/, '').trim();
}

// Traduce el error técnico del escritor a algo que entienda quien pidió el carrusel.
// Lo que no reconoce lo devuelve tal cual: más vale un texto raro que ninguno.
export function humanizarMotivo(motivo) {
  const texto = String(motivo || '').trim();
  const m = texto.match(/Anthropic\s+(\d{3})\s*:?\s*([\s\S]*)/);
  if (!m) return texto;
  const codigo = Number(m[1]);
  const mensaje = mensajeDeApi(m[2]);
  if (/credit balance|billing|insufficient|quota/i.test(mensaje)) {
    return 'Se acabó el crédito de la API de Anthropic: hay que recargar la cuenta para seguir generando carruseles.';
  }
  if (codigo === 401 || codigo === 403) return 'La API de Anthropic no aceptó la clave del servidor: hay que revisarla.';
  if (codigo === 429) return 'La API de Anthropic pidió esperar por exceso de peticiones. Vuelve a intentarlo en unos minutos.';
  if (codigo >= 500) return `La API de Anthropic no está respondiendo (error ${codigo}). Es temporal: vuelve a intentarlo en unos minutos.`;
  return `La API de Anthropic rechazó la petición (${codigo})${mensaje ? `: ${mensaje}` : ''}`;
}

// escribir.mjs --json imprime UNA línea JSON en stdout; se toma la última que parsee, por si el render habló antes.
export function leerResumenEscribir(stdout) {
  const lineas = String(stdout || '').split('\n').map((l) => l.trim()).filter((l) => l.startsWith('{') && l.endsWith('}'));
  for (const linea of lineas.reverse()) {
    try { return JSON.parse(linea); } catch { /* no era el resumen */ }
  }
  return null;
}

const GUION_ZIP_PY = 'import sys,zipfile,os\nz=zipfile.ZipFile(sys.argv[1],"w",zipfile.ZIP_DEFLATED)\n'
  + 'for a in sys.argv[2:]: z.write(a,os.path.basename(a))\nz.close()';

// carrusel.zip plano: 01.png…NN.png + caption.txt + preview.jpg. Usa `zip`; si no está, el zipfile de Python.
export async function crearZip(carpeta, slides) {
  const destino = path.join(carpeta, 'carrusel.zip');
  if (fs.existsSync(destino)) fs.unlinkSync(destino);
  const archivos = [...slides.map((s) => path.join('slides', s)), 'caption.txt', 'preview.jpg']
    .filter((a) => fs.existsSync(path.join(carpeta, a)));
  if (!archivos.length) return null;
  const conZip = await ejecutar('zip', ['-j', '-q', destino, ...archivos], { cwd: carpeta, timeoutMs: 120_000 });
  if (conZip.codigo === 0 && fs.existsSync(destino)) return destino;
  const conPy = await ejecutar('python3', ['-c', GUION_ZIP_PY, destino, ...archivos], { cwd: carpeta, timeoutMs: 120_000 });
  return conPy.codigo === 0 && fs.existsSync(destino) ? destino : null;
}
