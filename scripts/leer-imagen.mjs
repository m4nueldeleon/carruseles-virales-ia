#!/usr/bin/env node
// leer-imagen.mjs: lee una imagen o una carpeta de láminas (hasta 10) con visión por la API de Anthropic y
// escribe la sección «## Lectura visual» de referencia.md con la ficha de ingeniería inversa de
// references/REFERENCIAS-ENTRADA.md (gancho literal, promesa, estructura por lámina, anatomía visual, lo
// humano, mecanismo, CTA, qué aplica a la marca y qué no; sin copiar el texto entero). Sirve para las
// láminas que baja referencia.py a <out>/_referencia/ y para una captura que sube el usuario. Usa el mismo
// cliente que escribir.mjs (misma llave, timeout y reintento).
//
//   node scripts/leer-imagen.mjs <imagen|carpeta> [--out referencia.md] [--append] [--modelo <id>] [--max 10]
//   --modelo    por omisión el auxiliar (claude-sonnet-5, o la variable ANTHROPIC_MODELO_AUXILIAR)
//                                [--contexto "texto"] [--dry-run] [--json]
//   --out       archivo .md destino (por omisión referencia.md junto a la imagen o dentro de la carpeta)
//   --append    conserva el archivo y sustituye o añade solo la sección «## Lectura visual»
//   --contexto  qué es la pieza (caption, dueño, dónde se vio) para orientar la lectura
//   --max       tope de imágenes (10 por omisión; la API acepta más, pero la ficha pierde foco)
//   --dry-run   no llama a la API ni requiere llave: imprime cuántas imágenes y el tamaño del payload
//   --json      imprime al final una línea JSON {salida, imagenes, bytes_payload, modelo, tokens_entrada, tokens_salida}
// Códigos de salida: 0 ok · 2 error de uso o de entorno · 4 respuesta vacía del modelo.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { crearCliente, leerLlave, MODELO_AUXILIAR_POR_OMISION } from './lib/anthropic.mjs';
import { insertarSeccion } from './lib/referencia-md.mjs';

const args = process.argv.slice(2);
const opt = (k, d = null) => { const i = args.indexOf(k); return i >= 0 && i + 1 < args.length ? args[i + 1] : d; };
const flag = k => args.includes(k);
const log = (...a) => console.error(...a);
const fallo = (msg, codigo = 2) => { log('✗ ' + msg); process.exit(codigo); };

const CON_VALOR = new Set(['--out', '--modelo', '--max', '--contexto']);
const objetivo = args.find((a, i) => !a.startsWith('--') && !CON_VALOR.has(args[i - 1]));
const salidaJson = flag('--json');
const dryRun = flag('--dry-run');
const append = flag('--append');
// Leer una captura es describir lo que se ve, no escribir el carrusel: va con el modelo auxiliar. Con Opus 5
// y el techo de 4,000 la ficha salía SIEMPRE truncada (se perdían los apartados 8, 9 y 10, justo los que
// dicen qué aplicar a la marca); con el auxiliar y 6,000 de techo cabe entera y cuesta la tercera parte.
const modelo = opt('--modelo', MODELO_AUXILIAR_POR_OMISION);
const TECHO_FICHA = 6000;
const maximo = Math.max(1, Math.min(20, Number(opt('--max', 10)) || 10));
const contexto = opt('--contexto');

if (!objetivo || !fs.existsSync(objetivo)) fallo('Dame una imagen o una carpeta con láminas: node scripts/leer-imagen.mjs <imagen|carpeta> --out referencia.md');
const MEDIA = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif' };
const esCarpeta = fs.statSync(objetivo).isDirectory();
const rutas = (esCarpeta
  ? fs.readdirSync(objetivo).filter(f => MEDIA[path.extname(f).toLowerCase()]).sort().map(f => path.join(objetivo, f))
  : [objetivo]).slice(0, maximo);
if (!rutas.length) fallo(`No hay imágenes (${Object.keys(MEDIA).join(', ')}) en ${objetivo}`);
const out = path.resolve(opt('--out', esCarpeta ? path.join(objetivo, 'referencia.md') : path.join(path.dirname(objetivo), 'referencia.md')));

// La API acepta hasta 5 MB por imagen y de todos modos la reduce a ~1568 px de lado; por encima de 1.5 MB se
// reduce aquí con Pillow a 1600 px para no subir megas de más. Sin Pillow va tal cual hasta 5 MB y se salta si pesa más.
const TOPE_REDUCIR = 1_500_000, TOPE_API = 5_000_000;
function reducir(ruta) {
  const destino = path.join(os.tmpdir(), `leer-imagen-${process.pid}-${path.basename(ruta)}.jpg`);
  const py = spawnSync('python3', ['-c', 'import sys\nfrom PIL import Image\nim = Image.open(sys.argv[1]); im.thumbnail((1600, 1600)); im.convert("RGB").save(sys.argv[2], "JPEG", quality=85)', ruta, destino], { encoding: 'utf8' });
  if (py.status !== 0 || !fs.existsSync(destino)) return null;
  return destino;
}
const bloques = [];
const usadas = [];
for (const ruta of rutas) {
  let archivo = ruta, media = MEDIA[path.extname(ruta).toLowerCase()];
  const peso = fs.statSync(ruta).size;
  if (peso > TOPE_REDUCIR) {
    const chica = reducir(ruta);
    if (chica) { archivo = chica; media = 'image/jpeg'; }
    else if (peso > TOPE_API) { log(`· ${path.basename(ruta)} pesa más de 5 MB y no pude reducirla (falta Pillow); la salto`); continue; }
    else log(`· ${path.basename(ruta)} pesa ${(peso / 1e6).toFixed(1)} MB y no pude reducirla (falta Pillow); va tal cual`);
  }
  bloques.push({ type: 'image', source: { type: 'base64', media_type: media, data: fs.readFileSync(archivo).toString('base64') } });
  usadas.push(ruta);
  if (archivo !== ruta) fs.rmSync(archivo, { force: true });
}
if (!bloques.length) fallo('Ninguna imagen se pudo preparar.');

const N = bloques.length;
const prompt = `Eres director creativo de carruseles de Instagram para una marca que le habla a dueños de negocio de 35 a 60 años que empiezan a usar IA. Te paso ${N} imagen${N > 1 ? 'es: son las láminas, en orden, de una pieza ajena de referencia' : ': es una captura de una pieza ajena de referencia (o una sola portada)'}.${contexto ? `\n\nContexto que da el usuario: ${contexto}` : ''}

Haz la ficha de ingeniería inversa de references/REFERENCIAS-ENTRADA.md, en español, en Markdown, con estos apartados y en este orden:

1. **Gancho literal**: transcribe tal cual el texto de la portada (entre comillas) y di qué fórmula usa (número, negación, «sin antes», contraste, pregunta cerrada, «nadie te dice», error, gratis, «se nota»).
2. **Promesa**: «Al terminar, sabes/tienes ___ sin ___».
3. **Estructura por lámina**: una línea por lámina con número, rol (portada / rehook / agitación / cuerpo / cheatsheet / cta), el layout equivalente del contrato (portada-titulo, portada-foto, punto-numero, dato-hero, lista, comparativa, pasos, cita, texto-pleno, prompt, cta-cara, foto-texto), qué hace y si cierra con open loop. Cita solo las frases clave; no transcribas el texto completo de ninguna lámina.
4. **Anatomía visual**: paleta (hex aproximados) y el rol de cada color, tipografía (familia aproximada, pesos, mayúsculas o caja normal), jerarquía y niveles de texto, contraste, tipo de cada imagen (foto real, captura de pantalla, ilustración de IA, meme, logo real), márgenes, densidad de palabras por lámina, si hay barras, contador, «Desliza», handle.
5. **Lo humano**: error humano deliberado, humor, cultura pop, jerga de redes, voz (primera o segunda persona, tuteo, regionalismos).
6. **Mecanismo psicológico**: por qué se guarda o se comparte (recurso buscable, prompt dictado, herramienta + IA, estructura visible, identidad, provocación calculada, prueba visible).
7. **CTA**: qué pide, palabra clave si la hay, qué reserva para el DM; números públicos si se ven (likes, comentarios) con la advertencia de que son los de la captura.
8. **Qué aplica a la marca y qué no**: qué se replica (ángulo, estructura por roles, fórmula del gancho, mecanismo) y qué NO se copia (texto, imágenes, diseño exacto, logos ajenos en portada).
9. **Formato sugerido para la versión propia**: imagen única, carrusel corto de 5 o carrusel de 8 a 10, y por qué.
10. **Ángulo propio**: un título de portada de 4 a 7 palabras con una palabra entre *asteriscos* y un subtítulo de 12 palabras o menos, en la voz de un dueño de negocio; misma fórmula, ninguna frase de más de 3 palabras en común con la referencia.

Reglas: no inventes números ni textos que no se ven; si algo no se lee, dilo. No copies párrafos enteros: solo el gancho literal y frases clave. Frases cortas. Sin rayas largas.`;

const mensajes = [{ role: 'user', content: [...bloques, { type: 'text', text: prompt }] }];
const bytesPayload = Buffer.byteLength(JSON.stringify({ model: modelo, max_tokens: TECHO_FICHA, messages: mensajes }));
log(`${N} imagen${N > 1 ? 'es' : ''} (${usadas.map(u => path.basename(u)).join(', ')}) · payload ${(bytesPayload / 1024).toFixed(0)} KB · modelo ${modelo}`);

if (dryRun) {
  log('--dry-run: no llamo a la API.');
  if (salidaJson) console.log(JSON.stringify({ salida: out, imagenes: usadas.length, bytes_payload: bytesPayload, modelo, tokens_entrada: null, tokens_salida: null, dry_run: true }));
  process.exit(0);
}

const llave = leerLlave();
if (!llave) fallo('Falta ANTHROPIC_API_KEY (exporta la variable o guárdala en ~/.anthropic-cli/.env como ANTHROPIC_API_KEY=…).');
// Describir una captura no necesita que el modelo razone al máximo: sin acotarlo, el razonamiento se come
// el techo y la ficha sale sin los apartados finales, que son justo los que dicen qué aplicar a la marca.
const cliente = crearCliente({ llave, modelo, log, pensamiento: 'adaptive', esfuerzo: 'low' });
const r = await cliente.llamar(mensajes, { maxTokens: TECHO_FICHA, temperature: 0.2 });
if (r.stop === 'max_tokens') log(`⚠ la ficha se cortó por el techo de ${TECHO_FICHA} tokens: los últimos apartados pueden faltar`);
const lectura = String(r.texto || '').trim();
if (!lectura) fallo('El modelo devolvió una respuesta vacía.', 4);

// Sección «## Lectura visual»: se sustituye si ya existe, se añade si no, y sin --append se escribe un archivo nuevo.
const encabezado = '## Lectura visual';
const seccion = `${encabezado}\n\n_Fuente: ${N} imagen${N > 1 ? 'es' : ''} de ${esCarpeta ? path.basename(objetivo) + '/' : path.basename(objetivo)}, leídas con ${modelo} el ${new Date().toISOString().slice(0, 10)}. Se replica el ángulo y la estructura, nunca el texto ni las imágenes._\n\n${lectura}\n`;
const contenido = append && fs.existsSync(out)
  ? insertarSeccion(fs.readFileSync(out, 'utf8'), encabezado, seccion)
  : `# Referencia\n\n- **Tipo:** imagen\n- **Fuente:** ${path.resolve(objetivo)}\n\n${seccion}`;
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, contenido);
log(`Lectura visual → ${out}`);
if (salidaJson) console.log(JSON.stringify({ salida: out, imagenes: usadas.length, bytes_payload: bytesPayload, modelo, tokens_entrada: r.usage?.input_tokens ?? null, tokens_salida: r.usage?.output_tokens ?? null }));
