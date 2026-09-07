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

// La línea que imprime el cliente de la API por cada llamada (scripts/lib/costes.mjs, lineaDeUso):
//   · claude-opus-5: 207 tokens de entrada, 2183 de salida (14827 de escritura en caché, 20581 de lectura de caché) · $0.1234
// El paréntesis es opcional y puede traer lectura de caché, escritura, o las dos. Se lee lo que haya:
// lo que el cliente todavía no imprima cuenta como cero, nunca rompe la lectura.
const LINEA_USO = /^[·•]\s*([^:]+?)\s*:\s*([\d.,]+)\s*tokens?\s+de\s+entrada\s*,\s*([\d.,]+)\s*de\s+salida\b(.*)$/i;
const LECTURA_CACHE = /([\d.,]+)\s*(?:tokens?\s*)?(?:desde|de\s+lectura\s+de|leídos?\s+de)\s+cach/i;
const ESCRITURA_CACHE = /([\d.,]+)\s*(?:tokens?\s*)?(?:de\s+)?escrit\w*\s+(?:en\s+|de\s+)?cach/i;
// Guardar un bloque en caché cuesta 1.25x la entrada con vida de 5 minutos y 2x con vida de 1 hora:
// la misma llamada, con el mismo consumo, cuesta distinto según el ttl. Si el escritor lo dice en su
// línea («ttl 1h», «ttl=1h», «… de escritura en caché 1h»), manda lo que diga la línea; si no lo dice,
// manda el ttl con el que el worker lanzó al escritor (config.ttlCacheEfectivo).
const TTL_EN_LINEA = /\bttl\s*[=:]?\s*(5\s*m|1\s*h)\b/i;
const TTL_PEGADO_A_LA_ESCRITURA = /escrit\w*\s+(?:en\s+|de\s+)?cach\w*\s+(?:de\s+|con\s+ttl\s+)?(5\s*m|1\s*h)\b/i;
// El propio escritor imprime al final lo que le costó esa llamada («· $0.3756»), calculado con el ttl
// de verdad. Se lee para cotejarlo con la cuenta del worker y, si el escritor cobró más, cobrar eso:
// para un freno de gasto, quedarse corto es el único error que sale caro.
const USD_ESCRITOR = /\$\s*(\d+(?:[.]\d+)?)\b/;

const aEntero = (texto) => {
  const n = Number(String(texto ?? '').replace(/[.,\s]/g, ''));
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : 0;
};

// «1 h» → «1h», « 5M » → «5m». Cualquier otra cosa, null.
export function normalizarTtl(valor) {
  const t = String(valor || '').trim().toLowerCase().replace(/\s+/g, '');
  return t === '1h' || t === '5m' ? t : null;
}

/**
 * Lee una línea de stderr del escritor y devuelve el consumo de esa llamada, o null si la línea no
 * hablaba de consumo (que es la mayoría: avisos de render, progreso, errores).
 * @param {string} linea
 * @param {{ttl?: string}} [opciones] ttl con el que se lanzó al escritor («5m» o «1h»); por omisión «5m».
 * @returns {{modelo:string, entrada:number, salida:number, lectura:number, escritura5m:number,
 *            escritura1h:number, ttl:string, usdEscritor:number|null}|null}
 */
export function leerUso(linea, { ttl } = {}) {
  const texto = String(linea || '').trim();
  const m = LINEA_USO.exec(texto);
  if (!m) return null;
  const cola = m[4] || '';
  const escritura = aEntero((ESCRITURA_CACHE.exec(cola) || [])[1]);
  const ttlUsado = normalizarTtl((TTL_EN_LINEA.exec(texto) || [])[1])
    || normalizarTtl((TTL_PEGADO_A_LA_ESCRITURA.exec(texto) || [])[1])
    || normalizarTtl(ttl) || '5m';
  const usd = Number((USD_ESCRITOR.exec(cola) || [])[1]);
  return {
    modelo: m[1].trim(),
    entrada: aEntero(m[2]),
    salida: aEntero(m[3]),
    lectura: aEntero((LECTURA_CACHE.exec(cola) || [])[1]),
    escritura5m: ttlUsado === '1h' ? 0 : escritura,
    escritura1h: ttlUsado === '1h' ? escritura : 0,
    ttl: ttlUsado,
    usdEscritor: Number.isFinite(usd) && usd >= 0 ? usd : null,
  };
}

/**
 * Las dos cuentas de una misma llamada: la del worker con su tabla de precios y la que el escritor
 * imprimió en su línea. Cualquiera de las dos puede ser null (modelo que no está en la tabla; línea
 * de un escritor viejo que todavía no imprime el importe).
 */
export function partesDeCosto(uso, tabla = PRECIOS) {
  const p = uso ? preciosDe(uso.modelo, tabla) : null;
  const tablaUsd = p ? (uso.entrada * p.entrada
    + (uso.escritura5m || 0) * p.escritura5m
    + (uso.escritura1h || 0) * p.escritura1h
    + (uso.lectura || 0) * p.lectura
    + uso.salida * p.salida) / 1_000_000 : null;
  const escritorUsd = uso && Number.isFinite(uso.usdEscritor) ? uso.usdEscritor : null;
  return { tablaUsd, escritorUsd };
}

// Lo que cuesta ese consumo, en dólares. Si el escritor dijo lo que le cobraron y es MÁS que la cuenta
// de la tabla, manda la suya: el tope tiene que frenar con el dinero de verdad, no con el estimado.
// Un modelo que no está en la tabla y sin importe del escritor vale 0 y se declara aparte
// (`conocido: false`): más vale no cobrarle de más al tope que inventarse un precio.
export function costoDeUso(uso, tabla = PRECIOS) {
  const { tablaUsd, escritorUsd } = partesDeCosto(uso, tabla);
  if (tablaUsd === null && escritorUsd === null) return { usd: 0, conocido: false };
  return { usd: Math.max(tablaUsd ?? 0, escritorUsd ?? 0), conocido: true };
}

// ---------- el contador de una versión (o de una corrección) ----------

/**
 * Acumula el consumo de todas las llamadas de un trabajo. Se le van pasando las líneas de stderr tal
 * como llegan; devuelve el consumo de la línea cuando era una línea de consumo, y null cuando no.
 * @param {{tabla?: object, ttl?: string}} [opciones] `ttl` es el que el worker le pasó al escritor.
 */
export function crearContador({ tabla = PRECIOS, ttl = '5m' } = {}) {
  const estado = {
    usd: 0, entrada: 0, salida: 0, lectura: 0, escritura: 0, llamadas: 0,
    modelos: [], porModelo: {}, sinPrecio: [], desvioUsd: 0,
  };

  function sumar(linea) {
    const uso = leerUso(linea, { ttl });
    if (!uso) return null;
    const { tablaUsd, escritorUsd } = partesDeCosto(uso, tabla);
    const { usd, conocido } = costoDeUso(uso, tabla);
    estado.usd += usd;
    estado.entrada += uso.entrada;
    estado.salida += uso.salida;
    estado.lectura += uso.lectura;
    estado.escritura += uso.escritura5m + uso.escritura1h;
    estado.llamadas += 1;
    if (tablaUsd !== null && escritorUsd !== null) estado.desvioUsd += Math.abs(tablaUsd - escritorUsd);
    if (!estado.modelos.includes(uso.modelo)) estado.modelos = [...estado.modelos, uso.modelo];
    // Cuánto escribió cada modelo: así se sabe cuál fue la llamada principal (ver el getter `modelo`).
    estado.porModelo = { ...estado.porModelo, [uso.modelo]: (estado.porModelo[uso.modelo] || 0) + uso.salida };
    if (!conocido && !estado.sinPrecio.includes(uso.modelo)) estado.sinPrecio = [...estado.sinPrecio, uso.modelo];
    return { ...uso, usd, conocido };
  }

  // El modelo que se le apunta a la versión: el de la llamada PRINCIPAL, la que escribió el carrusel.
  // No sirve el primero que aparece —con --formato-plan referencia la llamada auxiliar (Sonnet, que
  // elige el formato o lee la captura) va ANTES que la principal— y tampoco el más caro. Sirve el que
  // más escribió: el carrusel entero son miles de tokens de salida; elegir un formato son decenas.
  // Empate: el primero que apareció.
  function modeloPrincipal() {
    return estado.modelos.reduce((mejor, m) =>
      (mejor === null || (estado.porModelo[m] || 0) > (estado.porModelo[mejor] || 0) ? m : mejor), null);
  }

  return {
    sumar,
    get usd() { return estado.usd; },
    get llamadas() { return estado.llamadas; },
    get sinPrecio() { return [...estado.sinPrecio]; },
    // Cuánto se separan la cuenta del worker y la del escritor. Con todo en su sitio es 0; si crece,
    // es que la tabla de precios o el ttl de aquí ya no son los del escritor y hay que mirarlo.
    get desvioUsd() { return estado.desvioUsd; },
    get modelo() { return modeloPrincipal(); },
    // Lo que se guarda en la fila de carrusel_version. `modelo` permite que mande el escritor cuando
    // su resumen --json diga cuál fue la llamada principal.
    columnas({ modelo = null } = {}) {
      return {
        tokens_entrada: estado.entrada,
        tokens_salida: estado.salida,
        tokens_cache_lectura: estado.lectura,
        tokens_cache_escritura: estado.escritura,
        modelo: modelo || modeloPrincipal(),
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
