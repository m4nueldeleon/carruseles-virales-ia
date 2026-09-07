// costos.mjs: cuánto cuesta cada llamada a la API, en dólares.
//
// El escritor (scripts/escribir.mjs) imprime en stderr una línea por llamada con el consumo que le
// devolvió la API. El worker ya recoge esas líneas para el log; aquí se leen, se convierten a dinero
// con la tabla de precios y se suman. Todo lo de este archivo es puro: entra texto, sale un número.
//
// ────────────────────────────────────────────────────────────────────────────────────────────────
// PRECIOS · dólares por millón de tokens. Confirmados el 7-sep-2026 en
// https://platform.claude.com/docs/en/about-claude/pricing
//
// Cinco conceptos, y los cinco se cobran distinto:
//   entrada       el prompt que no venía cacheado
//   escritura5m   guardar un bloque en caché con vida de 5 minutos  (1.25x la entrada)
//   escritura1h   guardar un bloque en caché con vida de 1 hora     (2x la entrada)
//   lectura       reusar un bloque ya cacheado                      (0.1x la entrada)
//   salida        lo que escribe el modelo, razonamiento incluido   (lo caro: 5x la entrada)
//
// PARA ACTUALIZAR: cambia el número aquí y ya. Si hace falta hacerlo sin tocar el código (un precio
// nuevo, un modelo que todavía no está en la lista), la variable COSTO_PRECIOS_JSON del worker acepta
// un JSON con la misma forma y se mezcla encima de esta tabla: {"claude-opus-6":{"entrada":6,…}}.
// ────────────────────────────────────────────────────────────────────────────────────────────────
export const PRECIOS = Object.freeze({
  'claude-opus-5':     Object.freeze({ entrada: 5, escritura5m: 6.25, escritura1h: 10, lectura: 0.50, salida: 25 }),
  'claude-opus-4-8':   Object.freeze({ entrada: 5, escritura5m: 6.25, escritura1h: 10, lectura: 0.50, salida: 25 }),
  'claude-opus-4-5':   Object.freeze({ entrada: 5, escritura5m: 6.25, escritura1h: 10, lectura: 0.50, salida: 25 }),
  'claude-sonnet-5':   Object.freeze({ entrada: 2, escritura5m: 2.50, escritura1h: 4, lectura: 0.20, salida: 10 }),
  'claude-sonnet-4-6': Object.freeze({ entrada: 3, escritura5m: 3.75, escritura1h: 6, lectura: 0.30, salida: 15 }),
  'claude-sonnet-4-5': Object.freeze({ entrada: 3, escritura5m: 3.75, escritura1h: 6, lectura: 0.30, salida: 15 }),
  'claude-haiku-4-5':  Object.freeze({ entrada: 1, escritura5m: 1.25, escritura1h: 2, lectura: 0.10, salida: 5 }),
  'claude-fable-5-1':  Object.freeze({ entrada: 10, escritura5m: 12.50, escritura1h: 20, lectura: 0.25, salida: 50 }),
  'claude-fable-5':    Object.freeze({ entrada: 10, escritura5m: 12.50, escritura1h: 20, lectura: 1, salida: 50 }),
});

const CONCEPTOS = Object.freeze(['entrada', 'escritura5m', 'escritura1h', 'lectura', 'salida']);

// El nombre del modelo llega de varias formas: con prefijo de gateway («anthropic/claude-opus-5» en
// OpenRouter), con fecha («claude-haiku-4-5-20251001») o con punto («claude-haiku-4.5»). Todas apuntan
// al mismo precio, así que se normalizan antes de buscar en la tabla.
export function normalizarModelo(modelo) {
  return String(modelo || '').trim().toLowerCase()
    .split('/').pop()                 // «anthropic/claude-opus-5» → «claude-opus-5»
    .replace(/[.]/g, '-')             // «claude-haiku-4.5» → «claude-haiku-4-5»
    .replace(/-\d{8}$/, '')           // «…-20251001» → sin fecha
    .replace(/-(latest|preview)$/, '');
}

// Los precios de ese modelo, o null si no está en la tabla. La coincidencia es por prefijo pero anclada:
// «claude-opus-5» cubre «claude-opus-5-20260101», y NUNCA un futuro «claude-opus-50», que es otra familia.
export function preciosDe(modelo, tabla = PRECIOS) {
  const nombre = normalizarModelo(modelo);
  if (!nombre) return null;
  const claves = Object.keys(tabla).filter((k) => nombre === k || nombre.startsWith(`${k}-`));
  if (!claves.length) return null;
  return tabla[claves.sort((a, b) => b.length - a.length)[0]];
}

// Mezcla la tabla de precios con lo que traiga COSTO_PRECIOS_JSON. Un modelo del JSON con todos sus
// conceptos se añade o sustituye; lo que venga mal escrito se ignora en silencio (nunca tumba el worker).
export function mezclarPrecios(extra, tabla = PRECIOS) {
  if (!extra || typeof extra !== 'object') return tabla;
  const validos = Object.entries(extra).filter(([clave, valor]) => clave && valor && typeof valor === 'object'
    && CONCEPTOS.every((c) => Number.isFinite(Number(valor[c])) && Number(valor[c]) >= 0));
  if (!validos.length) return tabla;
  const nuevos = validos.map(([clave, valor]) => [normalizarModelo(clave),
    Object.freeze(Object.fromEntries(CONCEPTOS.map((c) => [c, Number(valor[c])])))]);
  return Object.freeze({ ...tabla, ...Object.fromEntries(nuevos) });
}

// El JSON de COSTO_PRECIOS_JSON, o null si viene vacío o roto.
export function leerPreciosDeTexto(texto) {
  const t = String(texto || '').trim();
  if (!t) return null;
  try {
    const j = JSON.parse(t);
    return j && typeof j === 'object' && !Array.isArray(j) ? j : null;
  } catch { return null; }
}

// ---------- leer el consumo del log del escritor ----------

// La línea que imprime el cliente de la API por cada llamada (scripts/lib/anthropic.mjs):
//   · claude-opus-5: 18279 tokens de entrada, 7663 de salida (14827 desde caché)
// El paréntesis es opcional y puede traer lectura de caché, escritura, o las dos. Se lee lo que haya:
// lo que el cliente todavía no imprima cuenta como cero, nunca rompe la lectura.
const LINEA_USO = /^[·•]\s*([^:]+?)\s*:\s*([\d.,]+)\s*tokens?\s+de\s+entrada\s*,\s*([\d.,]+)\s*de\s+salida\b(.*)$/i;
const LECTURA_CACHE = /([\d.,]+)\s*(?:tokens?\s*)?(?:desde|de\s+lectura\s+de|leídos?\s+de)\s+cach/i;
const ESCRITURA_CACHE = /([\d.,]+)\s*(?:tokens?\s*)?(?:de\s+)?escrit\w*\s+(?:en\s+|de\s+)?cach/i;

const aEntero = (texto) => {
  const n = Number(String(texto ?? '').replace(/[.,\s]/g, ''));
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : 0;
};

/**
 * Lee una línea de stderr del escritor y devuelve el consumo de esa llamada, o null si la línea no
 * hablaba de consumo (que es la mayoría: avisos de render, progreso, errores).
 * @returns {{modelo:string, entrada:number, salida:number, lectura:number, escritura5m:number}|null}
 */
export function leerUso(linea) {
  const m = LINEA_USO.exec(String(linea || '').trim());
  if (!m) return null;
  const cola = m[4] || '';
  return {
    modelo: m[1].trim(),
    entrada: aEntero(m[2]),
    salida: aEntero(m[3]),
    lectura: aEntero((LECTURA_CACHE.exec(cola) || [])[1]),
    escritura5m: aEntero((ESCRITURA_CACHE.exec(cola) || [])[1]),
    escritura1h: 0,
  };
}

// Lo que cuesta ese consumo, en dólares. Un modelo que no está en la tabla vale 0 y se declara aparte
// (`conocido: false`): más vale no cobrarle de más al tope que inventarse un precio.
export function costoDeUso(uso, tabla = PRECIOS) {
  const p = uso ? preciosDe(uso.modelo, tabla) : null;
  if (!p) return { usd: 0, conocido: false };
  const usd = (uso.entrada * p.entrada
    + (uso.escritura5m || 0) * p.escritura5m
    + (uso.escritura1h || 0) * p.escritura1h
    + (uso.lectura || 0) * p.lectura
    + uso.salida * p.salida) / 1_000_000;
  return { usd, conocido: true };
}

// ---------- el contador de una versión (o de una corrección) ----------

/**
 * Acumula el consumo de todas las llamadas de un trabajo. Se le van pasando las líneas de stderr tal
 * como llegan; devuelve el consumo de la línea cuando era una línea de consumo, y null cuando no.
 */
export function crearContador({ tabla = PRECIOS } = {}) {
  const estado = { usd: 0, entrada: 0, salida: 0, lectura: 0, escritura: 0, llamadas: 0, modelos: [], sinPrecio: [] };

  function sumar(linea) {
    const uso = leerUso(linea);
    if (!uso) return null;
    const { usd, conocido } = costoDeUso(uso, tabla);
    estado.usd += usd;
    estado.entrada += uso.entrada;
    estado.salida += uso.salida;
    estado.lectura += uso.lectura;
    estado.escritura += uso.escritura5m + uso.escritura1h;
    estado.llamadas += 1;
    if (!estado.modelos.includes(uso.modelo)) estado.modelos = [...estado.modelos, uso.modelo];
    if (!conocido && !estado.sinPrecio.includes(uso.modelo)) estado.sinPrecio = [...estado.sinPrecio, uso.modelo];
    return { ...uso, usd, conocido };
  }

  return {
    sumar,
    get usd() { return estado.usd; },
    get llamadas() { return estado.llamadas; },
    get sinPrecio() { return [...estado.sinPrecio]; },
    // El modelo que se le apunta a la versión: el que más se usó es siempre el que escribe el carrusel,
    // así que basta con el primero que apareció (las llamadas auxiliares vienen después).
    get modelo() { return estado.modelos[0] || null; },
    // Lo que se guarda en la fila de carrusel_version.
    columnas() {
      return {
        tokens_entrada: estado.entrada,
        tokens_salida: estado.salida,
        tokens_cache_lectura: estado.lectura,
        tokens_cache_escritura: estado.escritura,
        modelo: estado.modelos[0] || null,
        costo_usd: redondear(estado.usd),
      };
    },
  };
}

// ---------- dinero en pantalla y en la base ----------

// Cuatro decimales para guardar (una llamada barata cuesta $0.0056; con dos decimales sería cero).
export const redondear = (usd) => Math.round((Number(usd) || 0) * 10_000) / 10_000;
// Dos decimales para leer, que es como se habla de dinero.
export const dolares = (usd) => `$${(Number(usd) || 0).toFixed(2)}`;
