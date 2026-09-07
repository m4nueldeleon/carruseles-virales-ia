// anthropic.mjs: cliente mínimo de la API Messages de Anthropic, compartido por escribir.mjs y
// leer-imagen.mjs. Contrato: llave (variable o ~/.anthropic-cli/.env) → llamada con timeout →
// extraer JSON → un reintento solo-JSON → nunca confiar en la salida (quien llama valida la forma).
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

export function leerLlave() {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY.trim();
  const archivo = path.join(os.homedir(), '.anthropic-cli', '.env');
  if (fs.existsSync(archivo)) {
    const m = fs.readFileSync(archivo, 'utf8').match(/ANTHROPIC_API_KEY\s*=\s*["']?([^"'\n]+)/);
    if (m) return m[1].trim();
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

export function crearCliente({ llave, modelo = MODELO_POR_OMISION, timeoutMs = TIMEOUT_MS, log = () => {} } = {}) {
  if (!llave) throw new Error('Falta ANTHROPIC_API_KEY (exporta la variable o guárdala en ~/.anthropic-cli/.env como ANTHROPIC_API_KEY=...).');

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

  // Devuelve { texto, usage, stop }. `system` puede ser texto o un arreglo de bloques (para cache_control).
  // Un reintento ante sobrecarga, límite de tasa o red caída; el timeout corta cada intento por separado.
  async function llamar(mensajes, { system, maxTokens = 12000, temperature = 0.4 } = {}) {
    const cuerpo = { model: modelo, max_tokens: maxTokens, temperature, messages: mensajes };
    if (system) cuerpo.system = system;
    for (let intento = 1; intento <= 2; intento++) {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), timeoutMs);
      try {
        const j = await llamarUnaVez(cuerpo, ctrl.signal);
        const texto = (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
        if (j.usage) log(`  · ${modelo}: ${j.usage.input_tokens} tokens de entrada, ${j.usage.output_tokens} de salida${j.usage.cache_read_input_tokens ? ` (${j.usage.cache_read_input_tokens} desde caché)` : ''}`);
        return { texto, usage: j.usage || null, stop: j.stop_reason || null };
      } catch (e) {
        const transitorio = REINTENTABLE.has(e.status) || e.name === 'AbortError' || /fetch failed|ECONN|ETIMEDOUT|EAI_AGAIN/i.test(String(e.message));
        if (intento === 2 || !transitorio) throw e;
        log(`  · la API falló (${e.status || e.name || e.message}); reintento en 8 s`);
        await esperar(8000);
      } finally {
        clearTimeout(t);
      }
    }
    throw new Error('sin respuesta de la API');
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
