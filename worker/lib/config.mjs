// config.mjs: lee las variables de entorno y las banderas de la línea de comandos con valores por omisión.
// Todo lo privado (claves, carpeta de la marca) entra por aquí; el código nunca lleva un valor real.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
    `workspace=${config.workspaceId || 'todas las marcas'}`,
    `anthropic=${si(config.anthropicKey)}`, `supabase=${si(config.supabaseUrl && config.supabaseKey)}`,
    `blob=${si(config.blobToken)}`, `apify=${si(env.APIFY_TOKEN)}`,
    config.simular ? 'MODO SIMULACIÓN (sin base de datos, sin API, sin subir)' : (config.sinSubir ? 'SIN SUBIR a Vercel Blob' : ''),
  ].filter(Boolean).join(' · ');
}
