// costes.mjs: precios de la API de Anthropic y cuánto costó cada llamada. Sirve para dos cosas:
// dejar constancia en el log de lo que gasta cada versión (antes no se veía nada) y poder comparar
// dos configuraciones con números, no de memoria.
//
// Los precios van en dólares por MILLÓN de tokens, tal como los publica platform.claude.com/docs/en/
// about-claude/pricing (comprobados el 7-sep-2026). La escritura de caché no es gratis: cuesta 1.25x la
// entrada con ttl de 5 minutos y 2x con ttl de 1 hora. La lectura sí es barata: 0.1x la entrada.
export const PRECIOS = Object.freeze({
  'claude-opus-5': { entrada: 5, escritura5m: 6.25, escritura1h: 10, lectura: 0.5, salida: 25 },
  'claude-sonnet-5': { entrada: 2, escritura5m: 2.5, escritura1h: 4, lectura: 0.2, salida: 10 },
  'claude-haiku-4-5-20251001': { entrada: 1, escritura5m: 1.25, escritura1h: 2, lectura: 0.1, salida: 5 },
});

// Un id puede venir con fecha («claude-opus-5-20260101»), con prefijo de gateway («anthropic/claude-opus-5»)
// o con sufijo de versión menor. Se busca la familia por el prefijo más largo que encaje.
export function preciosDe(modelo) {
  const id = String(modelo || '').toLowerCase().replace(/^[^/]+\//, '');
  const exacto = PRECIOS[id];
  if (exacto) return exacto;
  const familia = Object.keys(PRECIOS).sort((a, b) => b.length - a.length).find(k => id.startsWith(k));
  return familia ? PRECIOS[familia] : null;
}

// Suma los cuatro conceptos de una respuesta. `ttl` decide a qué precio se cobró la escritura de caché
// («5m» o «1h»). Devuelve null cuando el modelo no está en la tabla: es mejor no enseñar un número
// inventado que enseñar uno bonito y falso.
export function costeDeUso(usage, modelo, ttl = '5m') {
  const p = preciosDe(modelo);
  if (!p || !usage) return null;
  const escritura = ttl === '1h' ? p.escritura1h : p.escritura5m;
  return (
    (usage.input_tokens || 0) * p.entrada
    + (usage.cache_creation_input_tokens || 0) * escritura
    + (usage.cache_read_input_tokens || 0) * p.lectura
    + (usage.output_tokens || 0) * p.salida
  ) / 1_000_000;
}

// Acumulador de una corrida: cada llamada suma sus tokens y su coste. Se crea nuevo, nunca se muta el
// que ya se entregó a quien llama (misma regla que el resto de la skill).
export function sumarUso(acumulado, usage, coste) {
  return {
    llamadas: acumulado.llamadas + 1,
    entrada: acumulado.entrada + (usage?.input_tokens || 0),
    escritura_cache: acumulado.escritura_cache + (usage?.cache_creation_input_tokens || 0),
    lectura_cache: acumulado.lectura_cache + (usage?.cache_read_input_tokens || 0),
    salida: acumulado.salida + (usage?.output_tokens || 0),
    pensamiento: acumulado.pensamiento + (usage?.thinking_tokens || 0),
    coste_usd: acumulado.coste_usd + (coste || 0),
  };
}

export const USO_VACIO = Object.freeze({
  llamadas: 0, entrada: 0, escritura_cache: 0, lectura_cache: 0, salida: 0, pensamiento: 0, coste_usd: 0,
});

const dinero = n => `$${n.toFixed(4)}`;

// La línea que se escribe en stderr por cada llamada. Enseña las cuatro partidas por separado porque el
// caché solo se ve si se miran separadas: «escritura 14827 · lectura 0» es el síntoma de que no se lee.
export function lineaDeUso(modelo, usage, coste, stop) {
  const partes = [
    `entrada ${usage?.input_tokens ?? '?'}`,
    `escritura de caché ${usage?.cache_creation_input_tokens || 0}`,
    `lectura de caché ${usage?.cache_read_input_tokens || 0}`,
    `salida ${usage?.output_tokens ?? '?'}`,
  ];
  if (usage?.thinking_tokens) partes.push(`de ellos ${usage.thinking_tokens} de razonamiento`);
  if (coste !== null && coste !== undefined) partes.push(dinero(coste));
  // stop_reason «max_tokens» es la señal de que la respuesta se cortó a media frase: hasta hoy pasaba
  // en silencio y quien llama solo veía «no devolvió JSON».
  if (stop && stop !== 'end_turn') partes.push(`stop_reason=${stop}`);
  return `  · ${modelo}: ${partes.join(' · ')}`;
}

export const lineaDeTotal = uso =>
  `  · total de la versión: ${uso.llamadas} llamada(s) · entrada ${uso.entrada} · escritura de caché ${uso.escritura_cache}`
  + ` · lectura de caché ${uso.lectura_cache} · salida ${uso.salida} · ${dinero(uso.coste_usd)}`;

// Junta dos acumuladores (el del modelo principal y el del auxiliar) en uno nuevo.
export const sumarUsos = (a, b) => ({
  llamadas: a.llamadas + b.llamadas,
  entrada: a.entrada + b.entrada,
  escritura_cache: a.escritura_cache + b.escritura_cache,
  lectura_cache: a.lectura_cache + b.lectura_cache,
  salida: a.salida + b.salida,
  pensamiento: a.pensamiento + b.pensamiento,
  coste_usd: a.coste_usd + b.coste_usd,
});
