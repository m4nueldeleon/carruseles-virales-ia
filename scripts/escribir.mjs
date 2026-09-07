#!/usr/bin/env node
// escribir.mjs: escribe carrusel.json, caption.txt y metadata.json con la API de Anthropic (Claude Opus por
// omisión), fuera de Claude Code. Lo invoca un servidor, un cron o un worker con spawn: las banderas y las
// salidas son un contrato estable. Lee MI-MARCA.md e historico.json de la carpeta de trabajo, arma el system
// prompt con hermes/RUTINA-CARRUSEL.md + SKILL.md §4 + el capítulo del protocolo de formato que toca, pide JSON
// estricto, valida, renderiza, corre QA y, si QA bloquea, devuelve el qa.json al modelo para corregir.
//
//   export ANTHROPIC_API_KEY=...   (o guárdala en ~/.anthropic-cli/.env)
//   node scripts/escribir.mjs --tema "5 errores al cotizar" --carpeta ./mis-carruseles [banderas]
//
// ENTRADA (al menos una)
//   --tema "texto"                  tema del carrusel
//   --referencia ref.md             referencia.md escrito por referencia.py o leer-imagen.mjs (puede ir con --tema)
//   --correccion "texto" --base <carrusel.json>
//                                   modo corrección: el modelo recibe el carrusel existente y la corrección del usuario
//                                   y devuelve el carrusel completo corregido (misma palabra clave salvo que la corrección
//                                   diga otra cosa; conserva las imagen.src que siguen siendo válidas). Sin --salida escribe
//                                   en la carpeta de --base y guarda el anterior como carrusel.previo.json
//   --carpeta <carpeta-de-trabajo>  donde viven MI-MARCA.md, historico.json y las carpetas de carruseles (por omisión .)
// ESTRUCTURA
//   --formato-plan <imagen-unica|carrusel-5|carrusel-8|referencia>
//        imagen-unica   1 lámina (portada-titulo o texto-pleno con imagen); el CTA vive en el caption; QA corre con --imagen-unica
//        carrusel-5     5 láminas: portada, rehook, cuerpo, guardable, cta
//        carrusel-8     8 a 10 láminas: portada, rehook, 4-6 de cuerpo, guardable, cta
//        referencia     el modelo elige el formato con «Cómo elegir el formato» de references/PROTOCOLOS-FORMATO.md (una llamada
//                       corta previa) y lo reporta en formato_elegido
//        Al system prompt entra SOLO el capítulo del protocolo que toca (por --tipo si está mapeado, si no el del plan) más
//        «Cómo elegir el formato» y «Lo que se repite en todos los que funcionaron». Sin --formato-plan se escribe como antes
//        (7-12 láminas según la rutina Hermes), sin protocolo.
//   --laminas N                     fuerza el número exacto de láminas (1 = imagen única)
//   --tipo <guia|lista|recurso|noticia|tutorial|contrarian|historia|comparativa|prompt>
//                                   tipo sugerido; también decide el capítulo del protocolo (lista, comparativa y contrarian →
//                                   carrusel-lista; noticia → carrusel-noticia; historia → carrusel-historia)
//   --look <look>                   fuerza el look (si no, lo decide siguiente-look.mjs)
//   --formato <3:4|4:5|1:1|9:16>    formato de las láminas; 3:4 por omisión. Siempre se escribe en carrusel.formato
//   --instrucciones "texto"         instrucciones libres del usuario; van en el mensaje
// IMÁGENES
//   --banco <ruta o URL de catalogo.json>
//                                   resumen compacto del banco de rostro (fotos y avatares con su URL pública) y la obligación
//                                   de usar imagen.src de ahí en portada, una lámina de cuerpo y el CTA; un solo tipo de rostro;
//                                   avatares primero cuando el look tiene avatar; nunca avatar sobre panel del acento
//   --logos "CapCut,Claude"         icono oficial de cada app (API pública de la App Store, vendedor verificado) montado como
//                                   tarjeta con esquinas redondeadas y borde navy en assets/img/logo-<app>.png, y cada par en
//                                   assets/img/logos-<a>-mas-<b>.png (dos tarjetas + «+» del acento del look). Si la API falla,
//                                   se sigue sin ese logo y queda en faltantes
// MODELO Y SALIDA
//   --modelo <id>                   por omisión claude-opus-5 (o la variable ANTHROPIC_MODEL)
//   --modelo-auxiliar <id>          modelo de la llamada que elige el formato (por omisión claude-sonnet-5, o la
//                                   variable ANTHROPIC_MODELO_AUXILIAR). No escribe el carrusel: solo clasifica
//   --esfuerzo <low|medium|high|xhigh|max>
//                                   cuánto razona el modelo antes de escribir (por omisión low, o ESCRIBIR_ESFUERZO).
//                                   Sin esto Opus 5 razona con «high» y se come dos tercios de la salida
//   --pensamiento <adaptive|disabled>
//                                   por omisión adaptive (o ESCRIBIR_PENSAMIENTO); disabled lo apaga del todo
//   --ttl-cache <5m|1h>             vida del prefijo cacheado (por omisión 5m, o ESCRIBIR_CACHE_TTL). El bloque
//                                   estable del system (ficha, banco, histórico, referencia) no cambia entre las
//                                   versiones de un pedido: la 2ª, 3ª y 4ª lo leen del caché a 0.1x
//   --rondas N                      rondas de corrección cuando QA bloquea (2 por omisión)
//   --salida <carpeta>              carpeta exacta del carrusel (si no, <carpeta-de-trabajo>/<fecha>-<slug>)
//   --sin-render                    solo escribe carrusel.json, caption.txt y metadata.json (sin render ni QA)
//   --json                          imprime al final UNA línea JSON en stdout:
//                                   {carpeta, slug, formato_plan, formato_elegido, look, laminas, indice_qa, veredicto_qa,
//                                    palabra_clave, faltantes, confianza}. Todo el progreso va a stderr (con o sin --json).
//   --simular <carrusel.json>       NO llama al modelo: usa ese JSON como si lo hubiera devuelto (prueba render, QA, caption,
//                                   metadata y --json sin gastar API). No requiere llave; no hay rondas de corrección
//   --volcar-prompt <archivo>       guarda el system prompt y los mensajes que se mandan (depuración)
// CÓDIGOS DE SALIDA
//   0 ok (aunque QA bloquee: mira veredicto_qa) · 2 error de uso o de entorno · 3 el modelo escaló (con --json imprime
//   {"error":"escalado","motivo","faltantes"}) · 4 el modelo no devolvió JSON válido ni carrusel.slides
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { crearCliente, leerLlave, ESFUERZOS, MODELO_AUXILIAR_POR_OMISION, MODELO_POR_OMISION, PENSAMIENTOS } from './lib/anthropic.mjs';
import { PLANES, cargarProtocolos, capitulosPara, indiceParaElegir, bloqueProtocolo } from './lib/protocolos.mjs';
import { cargarBanco, resumenBanco, reglasBanco } from './lib/banco.mjs';
import { ACENTO_POR_LOOK, prepararLogos, componerParesLogos, describirLogos } from './lib/logos.mjs';
import { escribirCaption, escribirMetadata } from './lib/entrega.mjs';
import { FORMATOS, LOOKS } from './lib/construir-html.mjs';
import { comoContrato, normalizarCarrusel, verificarSalida } from './lib/contrato.mjs';
import { lineaDeTotal, sumarUsos, USO_VACIO } from './lib/costes.mjs';

const DIR_SKILL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (k, d = null) => { const i = args.indexOf(k); return i >= 0 && i + 1 < args.length ? args[i + 1] : d; };
const flag = k => args.includes(k);
const log = (...a) => console.error(...a);

// ---------- banderas ----------
const tema = opt('--tema');
const carpetaTrabajo = path.resolve(opt('--carpeta', '.'));
const refPath = opt('--referencia');
const tipo = opt('--tipo');
const lookForzado = opt('--look');
const modelo = opt('--modelo', MODELO_POR_OMISION);
const rondas = Math.max(1, Number(opt('--rondas', 2)) || 1);
const plan = opt('--formato-plan');
const laminasForzadas = opt('--laminas') ? Number(opt('--laminas')) : null;
const instrucciones = opt('--instrucciones');
const formato = opt('--formato', '3:4');
const bancoOrigen = opt('--banco');
const logosNombres = String(opt('--logos', '') || '').split(',').map(s => s.trim()).filter(Boolean);
const correccion = opt('--correccion');
const basePath = opt('--base');
const salidaDir = opt('--salida');
const sinRender = flag('--sin-render');
const salidaJson = flag('--json');
const simularPath = opt('--simular');
const volcarPrompt = opt('--volcar-prompt');
// Cuánto vive el prefijo cacheado. Con «5m» cada lectura renueva los 5 minutos, y como las versiones de un
// pedido van una detrás de otra (1.5-2 min cada una) la cadena se sostiene sola; la escritura cuesta 1.25x.
// Con «1h» la escritura cuesta 2x pero aguanta un pedido lento o varios pedidos de la misma marca seguidos.
const TTL_CACHE = opt('--ttl-cache', process.env.ESCRIBIR_CACHE_TTL || '5m');
if (!['5m', '1h'].includes(TTL_CACHE)) { console.error('✗ --ttl-cache debe ser 5m o 1h'); process.exit(2); }
// Cuánto razona el modelo antes de escribir. Sin esto Opus 5 razona con esfuerzo «high» sin que nadie se lo
// pida y se come dos tercios de la salida, que es la partida cara. Se queda fijo durante toda la corrida:
// cambiarlo entre llamadas invalidaría el prefijo cacheado.
const esfuerzo = opt('--esfuerzo', process.env.ESCRIBIR_ESFUERZO || 'low');
const pensamiento = opt('--pensamiento', process.env.ESCRIBIR_PENSAMIENTO || 'adaptive');
// El modelo de las llamadas auxiliares (elegir formato): es clasificar, no escribir, y no toca la calidad
// del carrusel. La escritura se queda en el modelo principal.
const modeloAuxiliar = opt('--modelo-auxiliar', MODELO_AUXILIAR_POR_OMISION);
if (!ESFUERZOS.includes(esfuerzo)) { console.error(`✗ --esfuerzo debe ser uno de: ${ESFUERZOS.join(', ')}`); process.exit(2); }
if (!PENSAMIENTOS.includes(pensamiento)) { console.error(`✗ --pensamiento debe ser uno de: ${PENSAMIENTOS.join(', ')}`); process.exit(2); }

function fallo(msg, codigo = 2, extra = null) {
  log('✗ ' + msg);
  if (salidaJson && extra) console.log(JSON.stringify(extra));
  process.exit(codigo);
}

// Traduce el fallo de la API a algo que una persona pueda leer y accionar.
function motivoDeApi(e) {
  const texto = String(e && e.message || e);
  if (/credit balance is too low|insufficient.*credit|billing/i.test(texto)) {
    return 'La cuenta de la API se quedó sin saldo. Recarga en console.anthropic.com (o apunta ANTHROPIC_BASE_URL y la llave a otro proveedor) y vuelve a lanzar el pedido.';
  }
  if (/invalid x-api-key|authentication|unauthorized|401/i.test(texto)) return 'La llave de la API no fue aceptada. Revisa ANTHROPIC_API_KEY en el servidor.';
  if (/rate limit|429/i.test(texto)) return 'La API está limitando las peticiones ahora mismo. Vuelve a intentarlo en unos minutos.';
  if (/overloaded|529|5\d\d/.test(texto)) return 'La API está caída o saturada en este momento. Vuelve a intentarlo en un rato.';
  if (/fetch failed|ECONN|ETIMEDOUT|EAI_AGAIN|AbortError/i.test(texto)) return 'No se pudo conectar con la API (red o tiempo agotado). Vuelve a lanzar el pedido.';
  return `La API rechazó la petición: ${texto.slice(0, 200)}`;
}

if (plan && !PLANES.includes(plan)) fallo(`--formato-plan debe ser uno de: ${PLANES.join(', ')}`);
if (!FORMATOS[formato]) fallo(`--formato debe ser uno de: ${Object.keys(FORMATOS).join(', ')}`);
if ((correccion && !basePath) || (basePath && !correccion)) fallo('El modo corrección necesita --correccion "texto" y --base carrusel.json juntos.');
if (laminasForzadas !== null && (!Number.isInteger(laminasForzadas) || laminasForzadas < 1 || laminasForzadas > 20)) fallo('--laminas debe ser un entero entre 1 y 20.');
if (lookForzado && !LOOKS.includes(lookForzado)) fallo(`--look debe ser uno de: ${LOOKS.join(', ')}`);
if (!tema && !refPath && !correccion && !simularPath) fallo('Dame --tema "…", --referencia archivo.md, --correccion "…" --base carrusel.json o --simular carrusel.json');
if (tipo && !['guia', 'lista', 'recurso', 'noticia', 'tutorial', 'contrarian', 'historia', 'comparativa', 'prompt'].includes(tipo)) fallo('--tipo no es un tipo del contrato.');

const marcaPath = path.join(carpetaTrabajo, 'MI-MARCA.md');
if (!fs.existsSync(marcaPath)) fallo(`No existe ${marcaPath}: llena la ficha primero (templates/MI-MARCA.md).`);
const marca = fs.readFileSync(marcaPath, 'utf8');
if (refPath && !fs.existsSync(refPath)) fallo(`No existe la referencia ${refPath}`);
const referencia = refPath ? fs.readFileSync(refPath, 'utf8') : null;
let base = null;
if (basePath) {
  if (!fs.existsSync(basePath)) fallo(`No existe --base ${basePath}`);
  try { base = JSON.parse(fs.readFileSync(basePath, 'utf8')); } catch (e) { fallo(`--base no es JSON válido: ${e.message}`); }
}
const llave = simularPath ? null : leerLlave();
if (!simularPath && !llave) fallo('Falta ANTHROPIC_API_KEY (exporta la variable o guárdala en ~/.anthropic-cli/.env como ANTHROPIC_API_KEY=…).');
const cliente = simularPath ? null : crearCliente({ llave, modelo, log, ttlCache: TTL_CACHE, pensamiento, esfuerzo });
// Cliente aparte para lo auxiliar: otro modelo, sin razonamiento y con su propio contador de gasto.
const clienteAuxiliar = simularPath ? null
  : (modeloAuxiliar === modelo ? cliente : crearCliente({ llave, modelo: modeloAuxiliar, log, ttlCache: TTL_CACHE, pensamiento: 'disabled' }));

// ---------- contexto de la marca ----------
let historico = [];
try { historico = JSON.parse(fs.readFileSync(path.join(carpetaTrabajo, 'historico.json'), 'utf8')); } catch {}
const lookAnterior = (lookForzado || base) ? null : (() => {
  const r = spawnSync('node', [path.join(DIR_SKILL, 'scripts', 'siguiente-look.mjs'), carpetaTrabajo, ...(tipo ? ['--tipo', tipo] : [])], { encoding: 'utf8' });
  try { return JSON.parse(r.stdout); } catch { return null; }
})();
const lookRecomendado = lookForzado || (base && base.look) || (lookAnterior && lookAnterior.recomendado) || 'guia-rapida';
const fecha = new Date().toISOString().slice(0, 10);
const faltantesLocales = [];

// La cara para la lámina de CTA según MI-MARCA.md §5 (si la ruta existe en la carpeta de trabajo).
function avatarDeMarca() {
  const linea = marca.match(/\*\*Fotos reales tuyas[^:]*:\*\*\s*([^\n]+)/i);
  if (!linea || /^\s*\[ej\./i.test(linea[1])) return null;
  const ruta = linea[1].match(/assets\/fotos\/[\w./-]+\.(?:jpe?g|png|webp)/i);
  if (!ruta) return null;
  const abs = path.join(carpetaTrabajo, ruta[0]);
  return fs.existsSync(abs) ? abs : null;
}
const avatarAbs = avatarDeMarca();
const handleDeMarca = () => { const m = marca.match(/\*\*Cuenta de Instagram:\*\*\s*\[?\s*(@[\w.]+)/i); return m ? m[1] : null; };

// ---------- protocolo, banco y logos ----------
const protocolos = cargarProtocolos(DIR_SKILL);
if (plan && !protocolos) log('· references/PROTOCOLOS-FORMATO.md no está en la skill: se escribe sin protocolo por formato');

let banco = null;
if (bancoOrigen) {
  try {
    banco = resumenBanco(await cargarBanco(bancoOrigen));
    log(`Banco: ${banco.entradas.length} entradas con URL (${banco.entradas.filter(e => e.tipo === 'avatar').length} avatares)${banco.sin_src ? `, ${banco.sin_src} sin URL ni archivo` : ''}`);
    if (!banco.entradas.length) { faltantesLocales.push('banco: ninguna foto ni avatar con URL o archivo'); banco = null; }
  } catch (e) { faltantesLocales.push(`banco: ${e.message}`); log(`✗ banco: ${e.message}`); }
}

const dirStaging = fs.mkdtempSync(path.join(os.tmpdir(), 'carrusel-logos-'));
const logos = logosNombres.length ? await prepararLogos(logosNombres, dirStaging, { log }) : { listos: [], faltantes: [] };
faltantesLocales.push(...logos.faltantes);

// ---------- paso previo: elegir formato cuando el plan es «referencia» ----------
let formatoElegido = null, laminasSugeridas = null;
if (plan === 'referencia' && protocolos && cliente) {
  const validos = [...protocolos.capitulos.keys()];
  const sistemaElegir = `Eres el director creativo de la skill Carruseles Virales IA. Con el árbol «Cómo elegir el formato» y el índice de protocolos eliges UN formato para la referencia o el tema dado. Respondes SOLO un objeto JSON: {"formato_elegido": "<slug>", "laminas": <entero>, "motivo": "<una frase>"}. Slugs válidos: ${validos.join(', ')}. Los imagen-unica-* son 1 lámina; reel se produce como su versión carrusel 3:4 (7-9 láminas).\n\n${protocolos.elegir}\n\nÍNDICE DE PROTOCOLOS:\n${indiceParaElegir(protocolos)}`;
  const encargoElegir = `TEMA: ${tema || '(sale de la referencia)'}\n\nINSTRUCCIONES DEL USUARIO: ${instrucciones || '(ninguna)'}\n\nREFERENCIA:\n${(referencia || '(sin referencia: decide por el tema)').slice(0, 24000)}`;
  log(`Eligiendo formato con el protocolo (${clienteAuxiliar.modelo})…`);
  // El system de esta llamada es literalmente el mismo texto en todos los pedidos de todas las marcas: con
  // punto de corte se lee del caché a partir de la segunda vez. Y el techo sube de 400 —a 70 tokens de
  // truncarse y disparar un reintento de la llamada entera— a 1,500, que no cuesta nada por estar ahí.
  const r = await clienteAuxiliar.pedirJson(
    [{ role: 'user', content: encargoElegir }],
    { system: [{ type: 'text', text: sistemaElegir, cache_control: { type: 'ephemeral', ttl: TTL_CACHE } }], maxTokens: 1500, temperature: 0.2 },
  );
  if (r.json && protocolos.capitulos.has(r.json.formato_elegido)) {
    formatoElegido = r.json.formato_elegido;
    laminasSugeridas = Number.isInteger(r.json.laminas) ? r.json.laminas : null;
    log(`Formato elegido: ${formatoElegido}${laminasSugeridas ? ` (${laminasSugeridas} láminas)` : ''}: ${r.json.motivo || ''}`);
  } else log('· el modelo no eligió un formato válido; sigo con la estructura de carrusel-8');
}

// ---------- system prompt ----------
const esImagenUnica = () => laminasForzadas === 1 || plan === 'imagen-unica' || /^imagen-unica/.test(formatoElegido || '');

function textoEstructura() {
  if (esImagenUnica()) return `FORMATO-PLAN: imagen-unica. "slides" lleva EXACTAMENTE 1 lámina, con "rol": "portada" y "layout": "portada-titulo" (tipográfica con imagen en pos abajo, derecha o recorte) o "texto-pleno" (con imagen o texto puro si el protocolo lo pide). Todo el gancho, el contenido y el remate viven en esa lámina; el argumento vive en el caption. Escribe "pie": "" (sin «Desliza») y "sin_top": true (sin contador 01/01). Sin loop, sin lámina cta: la palabra clave, si hay entregable, va SOLO en el caption; si no hay entregable, el caption cierra con una pregunta de identificación o un aforismo. Elige entre los protocolos imagen-unica-meme e imagen-unica-tweet según el tema y escríbelo en formato_elegido.`;
  if (laminasForzadas) return `FORMATO-PLAN: ${plan || 'libre'} con láminas fijas. "slides" lleva EXACTAMENTE ${laminasForzadas} láminas: la primera es portada, la última es cta con cta-cara${laminasForzadas >= 4 ? ', la segunda es rehook y la penúltima es la guardable (rol cheatsheet: lista, pasos, comparativa o prompt)' : ''}; el resto es cuerpo.`;
  if (plan === 'carrusel-5') return 'FORMATO-PLAN: carrusel-5. "slides" lleva EXACTAMENTE 5 láminas en este orden: 1 portada · 2 rehook · 3 cuerpo (una sola idea, la más fuerte) · 4 guardable (rol cheatsheet con layout lista, pasos, comparativa o prompt: es lo que justifica el guardado) · 5 cta (cta-cara). Si el tema necesita dos ideas de cuerpo, la segunda se funde en la guardable; nunca 6 láminas.';
  if (plan === 'carrusel-8') return 'FORMATO-PLAN: carrusel-8. "slides" lleva de 8 a 10 láminas (8 por omisión): 1 portada · 2 rehook · 4 a 6 de cuerpo · penúltima guardable (rol cheatsheet) · última cta (cta-cara). El insight más valioso va en la última lámina de cuerpo.';
  if (plan === 'referencia') return formatoElegido
    ? `FORMATO-PLAN: referencia. El formato lo dicta el protocolo «${formatoElegido}»${laminasSugeridas ? ` con ${laminasSugeridas} láminas` : ''}: respeta su capítulo (número de láminas, portada, cuerpo, cierre) dentro del contrato y escribe "formato_elegido": "${formatoElegido}" en la envoltura.`
    : 'FORMATO-PLAN: referencia sin protocolo elegido. Escribe de 8 a 10 láminas (portada, rehook, cuerpo, guardable, cta) y en formato_elegido el nombre del formato que mejor describa la pieza.';
  return '';
}

function textoPlanVisual() {
  if (banco) return 'PLAN VISUAL OBLIGATORIO: la portada, al menos una lámina de cuerpo y la lámina cta llevan imagen.src del banco (reglas del BANCO DE ROSTRO); al menos otra lámina de cuerpo lleva imagen.prompt (ilustración, ícono 3D o escena, sin texto) o una imagen de la lista de imágenes disponibles. Escribe alt en cada lámina.';
  if (esImagenUnica()) return 'PLAN VISUAL: la única lámina lleva imagen (una de las imágenes disponibles o imagen.prompt con la persona de la marca o el objeto del tema, sin texto), salvo que el protocolo pida texto puro. Escribe alt.';
  return 'PLAN VISUAL OBLIGATORIO: la portada lleva imagen (imagen.prompt con la persona de la marca en una situación del tema, sin texto), al menos dos láminas de cuerpo llevan imagen.prompt (ilustración, ícono 3D o escena, sin texto) y la lámina cta lleva la cara de la marca. Escribe alt en cada lámina.';
}

function componerSystem() {
  const rutina = fs.readFileSync(path.join(DIR_SKILL, 'hermes', 'RUTINA-CARRUSEL.md'), 'utf8');
  // El cierre del bloque tiene que ir a principio de línea: dentro del prompt hay un ```json en
  // medio de una frase («sin markdown, sin ```json») y con el patrón perezoso sin anclar el bloque
  // se cortaba ahí. Se mandaban 293 de 5,946 caracteres: el modelo nunca veía las leyes, la forma
  // de la salida ni la tabla de layouts, y devolvía lo que le parecía razonable.
  const bloque = rutina.match(/^```text\n([\s\S]*?)^```/m);
  const skill = fs.readFileSync(path.join(DIR_SKILL, 'SKILL.md'), 'utf8');
  const reglasCopy = (skill.match(/## 4\. Escribir[\s\S]*?(?=\n## 5\.)/) || [''])[0];
  const estatico = `${bloque ? bloque[1] : rutina}\n\nREGLAS ADICIONALES DE COPY Y ESTRUCTURA (de SKILL.md §4; mandan sobre lo anterior si chocan):\n${reglasCopy}`;
  const slugs = capitulosPara({ plan, tipo, formatoElegido, protocolos });
  const protocolo = plan ? bloqueProtocolo({ slugs, protocolos }) : '';
// El contrato de salida, escrito sin rodeos y en el bloque que manda (va al final del system, pegado
// al encargo). Cada campo mal tipado revienta una corrida entera, así que aquí se declara la FORMA:
// qué es obligatorio, qué es opcional y de qué tipo es cada cosa. Los tipos que el modelo confunde
// (caption objeto, hashtags dentro del caption, numero_fantasma booleano) van nombrados uno por uno.
const CONTRATO_SALIDA = `CONTRATO DE SALIDA (manda sobre cualquier ejemplo anterior de este prompt)
Responde UN SOLO objeto JSON, sin markdown y sin texto alrededor. Escribe el carrusel al desnudo, con "formato_elegido" a su lado (también se acepta envuelto en {"rutina","carrusel",…}, pero prefiere el desnudo). Los tipos de abajo NO son negociables: un campo con la forma equivocada tira la corrida entera.

OBLIGATORIOS del carrusel: "slug" texto, "look" texto, "formato" texto, "caption" TEXTO, "slides" lista de objetos.
OBLIGATORIO de cada lámina: "layout" texto.
OPCIONALES del carrusel: "fecha", "tema", "tipo", "serie", "palabra_clave", "entregable" (textos); "objetivo" (texto, o lista de 2 como mucho); "marca" objeto {"handle","sello"}; "hashtags" LISTA de textos (3 a 5); "notas" TEXTO.
OPCIONALES de cada lámina: "rol", "kicker", "titulo", "subtitulo", "cuerpo", "loop", "numero", "numero_fantasma", "dato", "cita", "autor", "prompt", "etiqueta", "boton", "pie", "etiqueta_top", "sticker", "alt" (todos TEXTO); "items" y "chips" (listas de textos); "pasos" LISTA DE OBJETOS {"titulo","detalle"}; "a", "b" objetos {"titulo","items"}; "imagen" objeto {"src","pos","panel","tamano","duotono","prompt"}.

Los siete errores de forma que hay que evitar:
1. "caption" es TEXTO plano con saltos \\n. NUNCA un objeto {"primera_linea","texto","hashtags"} ni una lista.
2. "hashtags" es una lista propia del carrusel, al mismo nivel que "caption". NUNCA dentro del caption ni dentro de un objeto.
3. "notas" es UN texto (usa \\n si son varios apuntes), no una lista.
4. "numero_fantasma" es el número como TEXTO ("01"), nunca true: lo que escribas ahí se pinta gigante en la lámina.
5. "alt" va dentro de cada lámina, como texto, siempre.
6. "pasos" son OBJETOS: [{"titulo":"Manda el monto","detalle":"con fecha límite"}]. Una lista de cadenas sueltas se renderiza como números sin texto y la lámina guardable sale vacía.
7. No inventes campos: nada de "qa", "palabras" ni "n" por lámina. La calidad la mide scripts/qa.mjs, no tú.

Ejemplo de la FORMA (contenido de relleno y solo 2 láminas; el número de láminas lo manda el FORMATO-PLAN):
{"formato_elegido":"carrusel-lista","slug":"ejemplo-de-forma","fecha":"2026-01-31","tema":"Tema de ejemplo","tipo":"lista","formato":"3:4","look":"guia-rapida","serie":"Guía rápida","objetivo":"saves","palabra_clave":"FICHA","entregable":"la hoja de una página por DM","marca":{"handle":"@tucuenta","sello":"IA aplicada al negocio real"},"slides":[{"rol":"portada","layout":"portada-titulo","titulo":"Tu negocio no *camina* sin ti","subtitulo":"3 señales y qué delegar","chips":["3 señales"],"pie":"Desliza","imagen":{"src":"https://ejemplo/foto.png","pos":"recorte","panel":true},"alt":"Portada del carrusel sobre delegar en tu negocio."},{"rol":"cta","layout":"cta-cara","titulo":"¿Quieres la *ficha*?","cuerpo":"Comenta FICHA y te la mando por DM.","boton":"Comenta FICHA","alt":"Lámina final que invita a comentar la palabra FICHA."}],"caption":"Si te vas tres días y el negocio se para, tienes un empleo con tu nombre.\\n\\nMándaselo a tu socio que aprueba cada precio.\\n\\nComenta FICHA y te mando la hoja.","hashtags":["#dueñosdenegocio","#delegar","#pymes"],"notas":"Avisos esperados de QA: la lámina 2 es el CTA por ser un ejemplo corto."}`;

  // Todo lo que NO cambia entre las versiones de un mismo pedido, junto y al principio: la rutina, las
  // reglas de copy, la ficha de la marca, el banco, el histórico y la referencia. Es el prefijo que la API
  // puede leer del caché en la versión 2, 3 y 4 y en cada ronda de corrección. El orden es lo único que
  // importa: la API solo lee el caché si el prefijo COMPLETO hasta el punto de corte coincide byte a byte,
  // y hasta hoy el capítulo del protocolo —que cambia con el formato— estaba metido dentro de ese prefijo.
  const estable = [
    estatico,
    `FICHA DE LA MARCA (MI-MARCA.md; manda sobre cualquier suposición sobre la voz, el público o la oferta):\n${marca}`,
    banco ? reglasBanco(banco) : '',
    banco ? `BANCO DISPONIBLE (copia las "src" EXACTAS de esta lista):\n${JSON.stringify(banco.entradas, null, 2)}` : '',
    historico.length ? `CARRUSELES RECIENTES DE LA MARCA (para no repetir ángulo, gancho ni look):\n${JSON.stringify(historico.slice(-6), null, 2)}` : '',
    referencia ? `REFERENCIA DE ENTRADA (se replica el ángulo y la estructura, nunca el texto ni las imágenes):\n${referencia}` : '',
  ].filter(Boolean).join('\n\n');

  const dinamico = [
    CONTRATO_SALIDA,
    `FORMATO DE LAS LÁMINAS: escribe "formato": "${formato}" en el carrusel (manda sobre el 4:5 de la rutina).`,
    `FORMATO_ELEGIDO: escribe en "formato_elegido" el slug del protocolo de formato que aplicaste (${protocolos ? [...protocolos.capitulos.keys()].join(', ') : 'según PROTOCOLOS-FORMATO.md'}) o null si no aplicaste ninguno.`,
    textoEstructura(),
    textoPlanVisual(),
    logos.listos.length ? `IMÁGENES DISPONIBLES EN LA CARPETA DEL CARRUSEL (escribe la ruta EXACTA en imagen.src; son logos reales de terceros: pequeños, como acompañante en pos "abajo" o "centro", nunca protagonistas de la portada ni sugiriendo patrocinio):\n${describirLogos(logos.listos).join('\n')}` : '',
    'IMÁGENES: cualquier imagen.src que no sea una URL https de la lista del banco o una ruta de la lista de imágenes disponibles se descarta al validar.',
  ].filter(Boolean).join('\n\n');
  // Dos puntos de corte, no uno:
  //   1) al final de lo estable  → lo leen TODAS las versiones del pedido y todas las rondas de corrección;
  //   2) al final del protocolo  → lo leen las versiones que comparten capítulo (carrusel-5 y carrusel-8
  //      usan el mismo, así que en un pedido de 4 versiones se escribe una vez y se lee dos).
  // El resto (contrato, formato, estructura, plan visual) cambia con el formato y va suelto al final: son
  // ~400 tokens, y cachearlos costaría más (la escritura vale 1.25x) de lo que ahorrarían.
  const corte = { type: 'ephemeral', ttl: TTL_CACHE };
  const bloques = [{ type: 'text', text: estable, cache_control: corte }];
  if (protocolo) bloques.push({ type: 'text', text: protocolo, cache_control: corte });
  bloques.push({ type: 'text', text: dinamico });
  return bloques;
}

// ---------- encargo ----------
// El encargo lleva SOLO lo que cambia de una versión a otra. La ficha de la marca, el banco, el histórico
// y la referencia viajan en el bloque estable del system (con punto de corte de caché), no aquí: repetirlos
// en el mensaje del usuario era pagar ~14,000 tokens a precio lleno en cada versión del mismo pedido.
const entrada = {
  tema,
  look_anterior: lookAnterior ? lookAnterior.ultimo?.look ?? null : null, look_recomendado: lookRecomendado, tipo_sugerido: tipo,
  formato_plan: plan, formato_elegido: formatoElegido, laminas_exactas: laminasForzadas || (esImagenUnica() ? 1 : null), formato,
  instrucciones_usuario: instrucciones,
  imagenes_disponibles: logos.listos.length ? describirLogos(logos.listos).map(l => l.replace(/^- /, '').split(':')[0]) : null,
  qa_previo: null,
};
const encargo = correccion
  ? `RUTINA: carrusel (corrección)\n\nENTRADA:\n${JSON.stringify({ ...entrada, carrusel_actual: base, correccion }, null, 2)}\n\nAplica la corrección del usuario al carrusel_actual y devuelve el contrato completo (rutina, carrusel, faltantes, confianza, escalar_a_claude, motivo, formato_elegido) con el carrusel corregido entero: conserva la misma palabra_clave salvo que la corrección diga otra cosa, conserva todas las imagen.src que sigan siendo válidas y no toques lo que la corrección no menciona.`
  : `RUTINA: carrusel\n\nENTRADA:\n${JSON.stringify(entrada, null, 2)}`;
const system = componerSystem();
const mensajes = [{ role: 'user', content: encargo }];
if (volcarPrompt) { fs.writeFileSync(volcarPrompt, JSON.stringify({ system, mensajes }, null, 2)); log(`Prompt → ${volcarPrompt}`); }

// comoContrato, normalizarCarrusel y verificarSalida viven en scripts/lib/contrato.mjs: la aduana
// entre lo que devuelve el modelo y lo que espera el motor está en un solo sitio y tiene pruebas.

// ---------- llamada (o simulación) ----------
let salida;
if (simularPath) {
  let simulado;
  try { simulado = JSON.parse(fs.readFileSync(simularPath, 'utf8')); } catch (e) { fallo(`--simular no es JSON válido: ${e.message}`); }
  salida = simulado.carrusel ? simulado : comoContrato({ ...simulado, slides: simulado.slides || [] });
  log(`Simulación: uso ${simularPath} como respuesta del modelo (sin llamar a la API)`);
} else {
  log(`Escribiendo con ${modelo}${plan ? ` · plan ${plan}` : ''}${formatoElegido ? ` · ${formatoElegido}` : ''}…`);
  let r;
  try {
    r = await cliente.pedirJson(mensajes, { system });
  } catch (e) {
    // Un fallo de la API no debe salir como volcado de Node: el worker lo copia tal cual a la pantalla
    // del usuario. Se traduce a un motivo que se entienda y al código 2 («error de entorno»).
    fallo(motivoDeApi(e), 2, { error: 'api', detalle: String(e.message || e).slice(0, 300) });
  }
  salida = comoContrato(r.json);
}
if (salida && typeof salida === 'object' && salida.carrusel) salida = { ...salida, carrusel: normalizarCarrusel(salida.carrusel) };
{
  const v = verificarSalida(salida);
  if (!v.ok) fallo(v.mensaje, v.error === 'json_invalido' ? 4 : 4, { error: v.error, campo: v.campo });
  if (v.escalado) fallo(`El modelo escaló: ${salida.motivo}`, 3, { error: 'escalado', motivo: salida.motivo || null, faltantes: salida.faltantes || [] });
}

// ---------- normalizar y validar (nunca confiar en la salida) ----------
const aSlug = s => String(s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
function normalizar(carruselCrudo) {
  const c = normalizarCarrusel(carruselCrudo);
  const look = lookForzado || (LOOKS.includes(c.look) ? c.look : null) || lookRecomendado;
  if (look !== c.look) log(`· look «${c.look}» no existe o está forzado; uso ${look}`);
  const marcaJson = { ...(c.marca || {}) };
  if (!marcaJson.handle) marcaJson.handle = handleDeMarca() || '@tucuenta';
  return { ...c, version: 1, slug: aSlug(c.slug) || aSlug(tema) || 'carrusel', fecha: c.fecha || fecha, formato, look, marca: marcaJson };
}
// Quita las imagen.src que no existen (ruta local rota, URL inventada) y lo anota en faltantes.
function validarImagenes(c, carpeta) {
  const quitadas = [];
  const valida = src => /^(https?:\/\/|data:)/.test(src) || fs.existsSync(path.isAbsolute(src) ? src : path.resolve(carpeta, src));
  const slides = c.slides.map((s, i) => {
    if (!s.imagen || !s.imagen.src || valida(s.imagen.src)) return s;
    quitadas.push(`imagen.src inexistente en lámina ${i + 1}: ${s.imagen.src}`);
    const { src, ...resto } = s.imagen;
    return { ...s, imagen: resto };
  });
  const marcaJson = { ...c.marca };
  if (marcaJson.avatar && !valida(marcaJson.avatar)) { quitadas.push(`marca.avatar inexistente: ${marcaJson.avatar}`); delete marcaJson.avatar; }
  if (!marcaJson.avatar && avatarAbs) marcaJson.avatar = path.relative(carpeta, avatarAbs).split(path.sep).join('/');
  return { carrusel: { ...c, slides, marca: marcaJson }, quitadas };
}

let carrusel = normalizar(salida.carrusel);
const carpeta = salidaDir ? path.resolve(salidaDir) : correccion ? path.dirname(path.resolve(basePath)) : path.join(carpetaTrabajo, `${fecha}-${carrusel.slug}`);
const dirImg = path.join(carpeta, 'assets', 'img');
fs.mkdirSync(dirImg, { recursive: true });
if (correccion && fs.existsSync(path.join(carpeta, 'carrusel.json'))) {
  fs.copyFileSync(path.join(carpeta, 'carrusel.json'), path.join(carpeta, 'carrusel.previo.json'));
  log('El carrusel anterior queda en carrusel.previo.json');
}
// Logos: del staging a assets/img; los pares se componen ahora, con el acento del look que quedó.
for (const l of logos.listos) { fs.copyFileSync(path.join(dirStaging, l.archivo), path.join(dirImg, l.archivo)); }
if (logos.listos.length > 1) componerParesLogos(logos.listos, dirImg, ACENTO_POR_LOOK[carrusel.look], { log });
fs.rmSync(dirStaging, { recursive: true, force: true });

const faltantesDe = (s, extra) => [...new Set([...(s.faltantes || []), ...faltantesLocales, ...extra])];
let validacion = validarImagenes(carrusel, carpeta);
carrusel = validacion.carrusel;
salida = { ...salida, faltantes: faltantesDe(salida, validacion.quitadas) };
const escribirJson = () => fs.writeFileSync(path.join(carpeta, 'carrusel.json'), JSON.stringify(carrusel, null, 2) + '\n');
escribirJson();
log(`Guion → ${path.join(carpeta, 'carrusel.json')} (${carrusel.slides.length} láminas, look ${carrusel.look}, formato ${carrusel.formato})`);

// ---------- render + QA + rondas de corrección ----------
const correr = (script, extra) => spawnSync('node', [path.join(DIR_SKILL, 'scripts', script), carpeta, ...extra], { encoding: 'utf8' });
const render = extra => { const r = correr('render.mjs', extra); process.stderr.write((r.stdout || '') + (r.stderr || '')); return r.status === 0; };
const qa = () => {
  const r = correr('qa.mjs', ['--json', ...(carrusel.slides.length === 1 ? ['--imagen-unica'] : [])]);
  try { return JSON.parse(r.stdout); } catch { process.stderr.write((r.stderr || r.stdout || 'QA no devolvió JSON') + '\n'); return null; }
};
let informe = null, rondasHechas = 0;
if (!sinRender) {
  for (let ronda = 1; ronda <= rondas; ronda++) {
    rondasHechas = ronda;
    if (!render(['--sin-preview'])) break;
    informe = qa();
    if (!informe) break;
    log(`QA ronda ${ronda}: ${informe.indice}/100 → ${informe.veredicto} (${informe.errores.length} errores, ${informe.avisos.length} avisos)`);
    if (informe.veredicto !== 'BLOQUEADO' || ronda === rondas || !cliente) break;
    const r = await cliente.pedirJson([
      ...mensajes, { role: 'assistant', content: JSON.stringify(salida) },
      { role: 'user', content: `RUTINA: carrusel (ronda ${ronda + 1})\n\nqa_previo:\n${JSON.stringify({ errores: informe.errores, avisos: informe.avisos.slice(0, 12) }, null, 2)}\n\nCorrige cada error, conserva todo lo demás (incluidas las imagen.src) y devuelve el contrato completo.` },
    ], { system });
    const corregido = comoContrato(r.json);
    const vr = verificarSalida(corregido);
    if (!vr.ok || vr.escalado) { log(`· la corrección no devolvió un carrusel usable (${vr.escalado ? 'el modelo escaló' : vr.mensaje}); me quedo con la versión anterior`); break; }
    validacion = validarImagenes(normalizar(corregido.carrusel), carpeta);
    carrusel = validacion.carrusel;
    salida = { ...corregido, faltantes: faltantesDe(corregido, validacion.quitadas) };
    escribirJson();
  }
  render([]);
} else log('· --sin-render: no se renderiza ni se corre QA');

// ---------- entrega ----------
escribirCaption({ carpeta, carrusel, salida, modelo: simularPath ? `${modelo} (simulado)` : modelo, imagenUnica: carrusel.slides.length === 1 });
escribirMetadata({ carpeta, carrusel, salida, informe, rondas: rondasHechas, modelo: simularPath ? 'simulado' : modelo, formatoPlan: plan, referencia: refPath || null, fecha, instrucciones });
// Lo que costó esta versión, sumando la llamada principal, la de elegir formato y las rondas de corrección.
// Va al log y al resumen JSON: el worker lo guarda y así el gasto por pedido deja de ser una adivinanza.
const uso = [cliente, clienteAuxiliar !== cliente ? clienteAuxiliar : null]
  .filter(Boolean).reduce((total, c) => sumarUsos(total, c.uso()), USO_VACIO);
if (uso.llamadas) log(lineaDeTotal(uso));
const resumen = {
  carpeta, slug: carrusel.slug, formato_plan: plan, formato_elegido: salida.formato_elegido || formatoElegido || null, look: carrusel.look,
  laminas: carrusel.slides.length, indice_qa: informe ? informe.indice : null, veredicto_qa: informe ? informe.veredicto : null,
  palabra_clave: carrusel.palabra_clave || null, faltantes: salida.faltantes || [], confianza: salida.confianza ?? null,
  uso, coste_usd: Number(uso.coste_usd.toFixed(4)),
};
if (salidaJson) console.log(JSON.stringify(resumen));
else {
  console.log(`Carrusel → ${carpeta}`);
  console.log(`  ${resumen.laminas} láminas · look ${resumen.look} · QA ${resumen.indice_qa ?? 'sin correr'}${resumen.veredicto_qa ? ` (${resumen.veredicto_qa})` : ''} · palabra clave ${resumen.palabra_clave || '(ninguna)'}`);
  if (resumen.faltantes.length) console.log(`  faltantes: ${resumen.faltantes.join(' · ')}`);
  if (carrusel.slides.some(s => s.imagen && s.imagen.prompt && !s.imagen.src)) console.log(`  siguiente: genera las imágenes de imagen.prompt, guárdalas en ${dirImg} y vuelve a correr render.mjs + qa.mjs.`);
}
