// config.mjs: lee las variables de entorno y las banderas de la línea de comandos con valores por omisión.
// Todo lo privado (claves, carpeta de la marca) entra por aquí; el código nunca lleva un valor real.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRECIOS, leerPreciosDeTexto, mezclarPrecios } from './costos.mjs';

const DIR_WORKER = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Apps con nombre propio cuyo logo real se pide a escribir.mjs (--logos) cuando aparecen en la entrada.
export const APPS_POR_OMISION = 'CapCut,Claude,ChatGPT,WhatsApp,Canva,Excel,Notion,Instagram,TikTok,YouTube,Gemini';
// Carrusel de ejemplo de la skill que se usa en modo --simular (relativo a SKILL_DIR).
export const EJEMPLO_SIMULACION = path.join('ejemplos', '2026-09-06-cotizar-sin-perder-dinero', 'carrusel.json');
export const PEDIDO_EJEMPLO = path.join(DIR_WORKER, 'pruebas', 'pedido.ejemplo.json');

const numero = (valor, porOmision) => {
  const n = Number(valor);
  return Number.isFinite(n) && n > 0 ? n : porOmision;
};

// Igual que `numero`, pero el cero es un valor válido: en los topes de gasto significa «sin tope».
const numeroConCero = (valor, porOmision) => {
  const n = Number(valor);
  return Number.isFinite(n) && n >= 0 ? n : porOmision;
};

// ────────────────────────────────────────────────────────────────────────────────────────────────
// TOPES DE GASTO · por qué estos números
//
// Medido el 7-sep-2026 con llamadas reales (claude-opus-5): un pedido normal de 4 versiones cuesta
// alrededor de $1.41, y cada ronda de corrección de la puerta de calidad suma ~$0.22 por versión.
// El peor caso realista de un pedido —4 versiones y las 2 rondas de corrección en todas— ronda $2.2.
//
//   TOPE POR PEDIDO $3.00   deja pasar cualquier pedido normal con holgura y corta en seco un pedido
//                           desbocado (un reintento en bucle) a algo más del doble de lo normal.
//   TOPE POR DÍA   $20.00   son unos 14 pedidos normales en un día. El uso real ronda 1 pedido al día,
//                           así que nunca estorba; lo que hace es que un día malo cueste $20 y no una
//                           tarjeta vaciada.
//   AVISO AL 80 %           $16 de $20: queda medio día de margen para reaccionar antes del corte.
//
// Los tres se cambian por variable de entorno sin tocar código (ver worker/.env.ejemplo).
// ────────────────────────────────────────────────────────────────────────────────────────────────
export const TOPE_PEDIDO_USD = 3;
export const TOPE_DIA_USD = 20;
export const AVISO_DIA_PCT = 80;

export function cargarConfig(argv = process.argv.slice(2), env = process.env) {
  const banderas = new Set(argv.filter((a) => a.startsWith('--')));
  const skillDir = path.resolve(env.SKILL_DIR || path.resolve(DIR_WORKER, '..'));
  const privadoDir = path.resolve(env.PRIVADO_DIR || '/privado');
  const trabajoDir = path.resolve(env.TRABAJO_DIR || '/trabajo');
  const simular = banderas.has('--simular');
  return Object.freeze({
    supabaseUrl: (env.SUPABASE_URL || '').replace(/\/+$/, ''),
    supabaseKey: env.SUPABASE_SERVICE_ROLE_KEY || '',
    anthropicKey: env.ANTHROPIC_API_KEY || '',
    modelo: env.ANTHROPIC_MODEL || 'claude-opus-5',
    // El modelo de las llamadas auxiliares (elegir formato, leer una captura de referencia): clasifican y
    // describen, no escriben el carrusel. Vacío = el que traiga la skill por omisión (claude-sonnet-5).
    modeloAuxiliar: env.ANTHROPIC_MODELO_AUXILIAR || '',
    // Cuánto razona el modelo antes de escribir; sin esto Opus 5 razona al máximo y se come la salida.
    esfuerzo: env.ESCRIBIR_ESFUERZO || '',
    // Vida del prefijo cacheado: «5m» (cada lectura lo renueva) o «1h» para pedidos lentos.
    ttlCache: env.ESCRIBIR_CACHE_TTL || '',
    blobToken: env.BLOB_READ_WRITE_TOKEN || '',
    bancoUrl: env.BANCO_URL || '',
    workspaceId: env.WORKSPACE_ID || '',
    skillDir,
    privadoDir,
    trabajoDir,
    bancoDir: path.resolve(env.BANCO_DIR || path.join(privadoDir, 'assets', 'fotos', 'reales')),
    intervaloS: numero(env.WORKER_INTERVALO_S, 15),
    pullMin: numero(env.SKILL_PULL_MIN, 30),
    bancoRefrescoH: numero(env.BANCO_REFRESCO_H, 24),
    huerfanoMin: numero(env.WORKER_HUERFANO_MIN, 90),
    retencionDias: numero(env.TRABAJO_RETENCION_DIAS, 7),
    timeoutVersionMin: numero(env.WORKER_TIMEOUT_VERSION_MIN, 25),
    rondas: numero(env.ESCRIBIR_RONDAS, 2),
    topePedidoUsd: numeroConCero(env.COSTO_TOPE_PEDIDO_USD, TOPE_PEDIDO_USD),
    topeDiaUsd: numeroConCero(env.COSTO_TOPE_DIA_USD, TOPE_DIA_USD),
    avisoDiaPct: numeroConCero(env.COSTO_AVISO_DIA_PCT, AVISO_DIA_PCT),
    precios: mezclarPrecios(leerPreciosDeTexto(env.COSTO_PRECIOS_JSON), PRECIOS),
    appsConocidas: (env.WORKER_APPS_CONOCIDAS || APPS_POR_OMISION).split(',').map((s) => s.trim()).filter(Boolean),
    unaVez: banderas.has('--una-vez'),
    simular,
    sinSubir: simular || banderas.has('--sin-subir'),
    ayuda: banderas.has('--ayuda') || banderas.has('--help'),
  });
}

// Problemas que impiden producir. Cada pedido reclamado se marca como error con el primero de la lista,
// con un texto que el equipo entiende (sin trazas).
export function diagnosticar(config) {
  const problemas = [];
  if (!config.simular && !config.anthropicKey) problemas.push('Falta la clave de Anthropic en el servidor');
  if (!config.simular && !fs.existsSync(path.join(config.privadoDir, 'MI-MARCA.md'))) {
    problemas.push('Falta MI-MARCA.md en la carpeta privada del servidor');
  }
  if (!fs.existsSync(path.join(config.skillDir, 'scripts', 'escribir.mjs'))) {
    problemas.push('La skill del servidor no tiene scripts/escribir.mjs');
  }
  return problemas;
}

// Una línea para el arranque: qué hay y qué falta, sin imprimir ningún valor secreto.
export function resumenConfig(config, env = process.env) {
  const si = (v) => (v ? 'sí' : 'NO');
  return [
    `skill=${config.skillDir}`, `privado=${config.privadoDir}`, `trabajo=${config.trabajoDir}`, `banco=${config.bancoDir}`,
    `modelo=${config.modelo}`, `intervalo=${config.intervaloS}s`, `pull=${config.pullMin}min`,
    `tope/pedido=${config.topePedidoUsd ? `$${config.topePedidoUsd}` : 'sin tope'}`,
    `tope/día=${config.topeDiaUsd ? `$${config.topeDiaUsd}` : 'sin tope'}`,
    `workspace=${config.workspaceId || 'todas las marcas'}`,
    `anthropic=${si(config.anthropicKey)}`, `supabase=${si(config.supabaseUrl && config.supabaseKey)}`,
    `blob=${si(config.blobToken)}`, `apify=${si(env.APIFY_TOKEN)}`,
    config.simular ? 'MODO SIMULACIÓN (sin base de datos, sin API, sin subir)' : (config.sinSubir ? 'SIN SUBIR a Vercel Blob' : ''),
  ].filter(Boolean).join(' · ');
}
