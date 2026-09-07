// anthropic.mjs: cliente mínimo de la API Messages de Anthropic, compartido por escribir.mjs y
// leer-imagen.mjs. Contrato: llave (variable o ~/.anthropic-cli/.env) → llamada con timeout →
// extraer JSON → un reintento solo-JSON → nunca confiar en la salida (quien llama valida la forma).
// Los modelos nuevos (Opus 5, Fable 5) rechazan temperature/top_p/top_k: no se mandan, y si aun así la
// API contesta 400 por un parámetro obsoleto, se repite la llamada sin él y queda constancia en stderr.
// Sin dependencias: usa fetch de Node 18+.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const API = 'https://api.anthropic.com/v1/messages';
export const VERSION_API = '2023-06-01';
// La última versión de Opus disponible en la API; ANTHROPIC_MODEL la sobreescribe sin tocar código.
export const MODELO_POR_OMISION = process.env.ANTHROPIC_MODEL || 'claude-opus-5';
export const TIMEOUT_MS = 180_000;

const REINTENTABLE = new Set([408, 409, 429, 500, 502, 503, 504, 529]);
const esperar = ms => new Promise(r => setTimeout(r, ms));

// Parámetros de muestreo: los modelos anteriores los aceptan, los nuevos los rechazan con un 400.
export const PARAMETROS_MUESTREO = Object.freeze(['temperature', 'top_p', 'top_k']);
// Familias que ya no admiten muestreo (Opus 5, Fable 5 y sus variantes con fecha o sufijo). El número va
// anclado: «opus-5», «opus-5-20260101» y «opus-5.1» sí; un futuro «opus-50» es otra familia y NO entra.
const SIN_MUESTREO = /(opus|fable)-5(?!\d)/i;
const TEXTO_DE_RECHAZO = /deprecat|not supported|unsupported|no longer|not allowed|cannot be used|unexpected|must not|remove/i;

export const admiteMuestreo = modelo => !SIN_MUESTREO.test(String(modelo || ''));

// De «`temperature` is deprecated for this model.» saca «temperature»; null si el 400 fue por otra cosa.
export function parametroRechazado(mensaje) {
  const texto = String(mensaje || '');
  if (!TEXTO_DE_RECHAZO.test(texto)) return null;
  const citado = (texto.match(/[`'\"]([a-z_]{2,24})[`'\"]/i) || [])[1];
  if (citado && PARAMETROS_MUESTREO.includes(citado)) return citado;
  return PARAMETROS_MUESTREO.find(p => new RegExp(`\\b${p}\\b`).test(texto)) || null;
}

// Copia sin esa clave: nunca se muta el cuerpo que ya se mandó.
const sinClave = (objeto, clave) => Object.fromEntries(Object.entries(objeto).filter(([k]) => k !== clave));
// El aviso va siempre a stderr, lo lea o no quien llama (el worker lo recoge en su log).
const constancia = texto => { try { process.stderr.write(`${texto}\n`); } catch {} };

// Las líneas comentadas del .env no cuentan (suele quedar ahí la llave vieja) y, como en la terminal,
// si hay varias asignaciones manda la última.
export function leerLlave() {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY.trim();
  const archivo = path.join(os.homedir(), '.anthropic-cli', '.env');
  if (!fs.existsSync(archivo)) return null;
  const lineas = fs.readFileSync(archivo, 'utf8').split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
  for (const linea of lineas.reverse()) {
    const m = linea.match(/^(?:export\s+)?ANTHROPIC_API_KEY\s*=\s*["']?([^"'\s]+)/);
    if (m) return m[1];
  }
  return null;
}

// Saca el primer objeto JSON de una respuesta que puede venir con ```json o con texto alrededor.
export function extraerJson(texto) {
  const limpio = String(texto ?? '').replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  try { return JSON.parse(limpio); } catch {}
  const i = limpio.indexOf('{'), j = limpio.lastIndexOf('}');
  if (i >= 0 && j > i) { try { return JSON.parse(limpio.slice(i, j + 1)); } catch {} }
  return null;
}

// `muestreo` decide si se mandan temperature/top_p/top_k. Por omisión se deduce del modelo; se puede
// forzar (true/false) para probar el respaldo o para un modelo nuevo que la lista todavía no conoce.
export function crearCliente({ llave, modelo = MODELO_POR_OMISION, timeoutMs = TIMEOUT_MS, log = () => {}, muestreo = null } = {}) {
  if (!llave) throw new Error('Falta ANTHROPIC_API_KEY (exporta la variable o guárdala en ~/.anthropic-cli/.env como ANTHROPIC_API_KEY=...).');
  const mandarMuestreo = muestreo === null ? admiteMuestreo(modelo) : Boolean(muestreo);
  const yaRechazados = new Set(); // lo que este modelo rechazó en esta corrida no se vuelve a mandar

  async function llamarUnaVez(cuerpo, signal) {
    const r = await fetch(API, {
      method: 'POST', signal,
      headers: { 'x-api-key': llave, 'anthropic-version': VERSION_API, 'content-type': 'application/json' },
      body: JSON.stringify(cuerpo),
    });
    if (!r.ok) {
      const detalle = await r.text().catch(() => '');
      const e = new Error(`Anthropic ${r.status}: ${detalle.slice(0, 300)}`);
      e.status = r.status;
      throw e;
    }
    return r.json();
  }

  // El cuerpo de la petición: los parámetros de muestreo solo si este modelo los admite y no los ha rechazado.
  function armarCuerpo(mensajes, { system, maxTokens, temperature, topP, topK }) {
    const base = { model: modelo, max_tokens: maxTokens, messages: mensajes };
    if (system) base.system = system;
    if (!mandarMuestreo) return base;
    const opcionales = Object.entries({ temperature, top_p: topP, top_k: topK })
      .filter(([clave, valor]) => valor !== null && valor !== undefined && !yaRechazados.has(clave));
    return { ...base, ...Object.fromEntries(opcionales) };
  }

  // Devuelve { texto, usage, stop }. `system` puede ser texto o un arreglo de bloques (para cache_control).
  // Tres respaldos: quitar el parámetro que la API declare obsoleto, un reintento ante sobrecarga o red
  // caída, y el timeout que corta cada intento por separado.
  async function llamar(mensajes, { system, maxTokens = 12000, temperature = 0.4, topP = null, topK = null } = {}) {
    let cuerpo = armarCuerpo(mensajes, { system, maxTokens, temperature, topP, topK });
    let reintentosRed = 0;
    let parametrosQuitados = 0;
    while (true) {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), timeoutMs);
      try {
        const j = await llamarUnaVez(cuerpo, ctrl.signal);
        const texto = (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
        if (j.usage) log(`  · ${modelo}: ${j.usage.input_tokens} tokens de entrada, ${j.usage.output_tokens} de salida${j.usage.cache_read_input_tokens ? ` (${j.usage.cache_read_input_tokens} desde caché)` : ''}`);
        return { texto, usage: j.usage || null, stop: j.stop_reason || null };
      } catch (e) {
        const sobra = e.status === 400 ? parametroRechazado(e.message) : null;
        if (sobra && sobra in cuerpo && parametrosQuitados < PARAMETROS_MUESTREO.length) {
          parametrosQuitados += 1;
          yaRechazados.add(sobra);
          cuerpo = sinClave(cuerpo, sobra);
          constancia(`  · el modelo ${modelo} ya no acepta «${sobra}»; repito la llamada sin ese parámetro`);
          continue;
        }
        const transitorio = REINTENTABLE.has(e.status) || e.name === 'AbortError' || /fetch failed|ECONN|ETIMEDOUT|EAI_AGAIN/i.test(String(e.message));
        if (reintentosRed >= 1 || !transitorio) throw e;
        reintentosRed += 1;
        log(`  · la API falló (${e.status || e.name || e.message}); reintento en 8 s`);
        await esperar(8000);
      } finally {
        clearTimeout(t);
      }
    }
  }

  // Pide un objeto JSON. Si la respuesta no es JSON válido, insiste una vez pidiendo solo el objeto.
  // Devuelve { json: objeto | null, texto, usage }: el null lo decide quien llama.
  async function pedirJson(mensajes, opciones = {}) {
    const primera = await llamar(mensajes, opciones);
    const json1 = extraerJson(primera.texto);
    if (json1) return { json: json1, texto: primera.texto, usage: primera.usage };
    log('  · la respuesta no fue JSON; pido solo el objeto');
    const segunda = await llamar([
      ...mensajes,
      { role: 'assistant', content: primera.texto || '(vacío)' },
      { role: 'user', content: 'Tu respuesta no fue JSON válido. Responde SOLO el objeto JSON del contrato, sin markdown ni texto alrededor.' },
    ], opciones);
    return { json: extraerJson(segunda.texto), texto: segunda.texto, usage: segunda.usage };
  }

  return { llamar, pedirJson, modelo };
}
