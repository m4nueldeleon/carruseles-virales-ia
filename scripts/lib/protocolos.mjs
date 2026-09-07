// protocolos.mjs: lee references/PROTOCOLOS-FORMATO.md y entrega solo el capítulo que toca
// (más «Cómo elegir el formato» y «Lo que se repite en todos los que funcionaron») para
// inyectarlo en el system prompt de escribir.mjs sin mandar el archivo entero.
import fs from 'node:fs';
import path from 'node:path';

export const PLANES = ['imagen-unica', 'carrusel-5', 'carrusel-8', 'referencia'];

// Capítulo por omisión de cada plan. Para carrusel-5 y carrusel-8 el capítulo lo decide --tipo si
// está mapeado (abajo); si no, carrusel-lista, el protocolo más general del estudio.
export const CAPITULOS_POR_PLAN = {
  'imagen-unica': ['imagen-unica-meme', 'imagen-unica-tweet'],
  'carrusel-5': ['carrusel-lista'],
  'carrusel-8': ['carrusel-lista'],
  referencia: [],
};

// Tipos del contrato que tienen protocolo propio. guia, tutorial, recurso y prompt siguen FORMATOS.md
// (el estudio no los cubre) y solo reciben los patrones transversales.
export const CAPITULO_POR_TIPO = {
  lista: 'carrusel-lista', comparativa: 'carrusel-lista', contrarian: 'carrusel-lista',
  noticia: 'carrusel-noticia', historia: 'carrusel-historia',
};

const sinSeparador = t => t.replace(/\n-{3,}\s*$/, '').trim();

// { ruta, capitulos: Map<slug, texto>, elegir, transversal } o null si el archivo no existe.
export function cargarProtocolos(dirSkill) {
  const ruta = path.join(dirSkill, 'references', 'PROTOCOLOS-FORMATO.md');
  if (!fs.existsSync(ruta)) return null;
  const texto = fs.readFileSync(ruta, 'utf8');
  const capitulos = new Map();
  let elegir = '', transversal = '';
  for (const parte of texto.split(/\n(?=## )/)) {
    const m = parte.match(/^## Formato: ([a-z0-9-]+)/);
    if (m) capitulos.set(m[1], sinSeparador(parte));
    else if (/^## Cómo elegir el formato/.test(parte)) elegir = sinSeparador(parte);
    else if (/^## Lo que se repite/.test(parte)) transversal = sinSeparador(parte);
  }
  return { ruta, capitulos, elegir, transversal };
}

// Slugs de capítulo que se inyectan: el formato elegido si existe; imagen-unica siempre sus dos
// capítulos; si no, el del tipo mapeado; si no, el del plan.
export function capitulosPara({ plan, tipo, formatoElegido, protocolos }) {
  if (!protocolos) return [];
  const existe = s => protocolos.capitulos.has(s);
  if (formatoElegido && existe(formatoElegido)) return [formatoElegido];
  if (plan === 'imagen-unica') return CAPITULOS_POR_PLAN[plan].filter(existe);
  if (tipo && CAPITULO_POR_TIPO[tipo]) return [CAPITULO_POR_TIPO[tipo]].filter(existe);
  return (CAPITULOS_POR_PLAN[plan] || []).filter(existe);
}

function seccion(texto, nombre) {
  const m = texto.match(new RegExp(`### ${nombre}\\n+([\\s\\S]*?)(?=\\n### |$)`));
  return m ? m[1].trim() : '';
}

// Índice compacto para que el modelo elija formato: por capítulo, cuándo usarlo y cuántas láminas.
export function indiceParaElegir(protocolos) {
  return [...protocolos.capitulos].map(([slug, texto]) =>
    `### ${slug}\n${seccion(texto, 'Cuándo usarlo y cuándo no')}\n\nLáminas: ${seccion(texto, 'Láminas y formato en px')}`).join('\n\n');
}

// Bloque listo para el system prompt: capítulo(s) + cómo elegir + patrones transversales.
export function bloqueProtocolo({ slugs, protocolos }) {
  if (!protocolos) return '';
  const partes = [];
  for (const slug of slugs) {
    const texto = protocolos.capitulos.get(slug);
    if (texto) partes.push(`PROTOCOLO DEL FORMATO «${slug}» (references/PROTOCOLOS-FORMATO.md). Aplica sus reglas de portada, cuerpo, cierre, estilo visual, voz y checklist DENTRO del contrato carrusel.json: donde pida un layout, un look o un tipo que el motor no tiene, usa el más cercano del contrato y anótalo en notas. Las REGLAS ADICIONALES y el FORMATO-PLAN de más abajo mandan si chocan con este capítulo.\n\n${texto}`);
  }
  if (protocolos.elegir) partes.push(protocolos.elegir);
  if (protocolos.transversal) partes.push(protocolos.transversal);
  return partes.join('\n\n---\n\n');
}
