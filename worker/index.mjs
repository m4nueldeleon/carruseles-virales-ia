#!/usr/bin/env node
// index.mjs: el bucle del worker del «Generador de carruseles» (Centro de Control de Marca).
//
//   node worker/index.mjs                      # bucle continuo (así arranca el contenedor)
//   node worker/index.mjs --una-vez            # atiende lo pendiente y termina
//   node worker/index.mjs --una-vez --simular  # sin base de datos ni API: procesa worker/pruebas/pedido.ejemplo.json
//   node worker/index.mjs --sin-subir          # no sube nada a Vercel Blob (las URL quedan vacías)
//
// Cada vuelta: mantenimiento (git pull de la skill, banco de fotos, huérfanos, limpieza) y después reclama UN
// pedido pendiente y lo procesa; si no hay, reclama UNA corrección. Concurrencia 1: el servidor tiene 2 CPU.
import fs from 'node:fs';
import path from 'node:path';
import { cargarConfig, diagnosticar, resumenConfig, PEDIDO_EJEMPLO } from './lib/config.mjs';
import { log, aviso, fallo } from './lib/log.mjs';
import { ejecutar, ultimaLinea, dormir } from './lib/procesos.mjs';
import { crearCliente } from './lib/supabase.mjs';
import { crearRepositorio } from './lib/bd.mjs';
import { crearRepositorioSimulado } from './lib/bd-simulada.mjs';
import { crearAlmacen } from './lib/blob.mjs';
import { crearPipeline } from './pipeline.mjs';

const AYUDA = `Worker del Generador de carruseles.
  --una-vez     atiende lo pendiente y termina
  --simular     sin base de datos, sin API y sin subir: procesa worker/pruebas/pedido.ejemplo.json
  --sin-subir   no sube nada a Vercel Blob
Variables de entorno: ver worker/.env.ejemplo.`;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CADA_HUERFANOS_MS = 10 * 60_000;
const CADA_LIMPIEZA_MS = 24 * 60 * 60_000;

// ---------- mantenimiento ----------

async function cabezaGit(dir) {
  const r = await ejecutar('git', ['-C', dir, 'rev-parse', 'HEAD'], { timeoutMs: 10_000 });
  return ultimaLinea(r.stdout);
}

// La skill se actualiza sola. Si el cambio toca worker/, hace falta reiniciar el contenedor para cargarlo.
async function actualizarSkill(config) {
  if (!fs.existsSync(path.join(config.skillDir, '.git'))) return;
  const antes = await cabezaGit(config.skillDir);
  const r = await ejecutar('git', ['-C', config.skillDir, 'pull', '--ff-only', '--quiet'], { timeoutMs: 120_000 });
  if (r.codigo !== 0) return aviso(`No se pudo actualizar la skill: ${ultimaLinea(r.stderr) || 'sin detalle'}`);
  const despues = await cabezaGit(config.skillDir);
  if (antes === despues) return;
  const cambios = await ejecutar('git', ['-C', config.skillDir, 'diff', '--name-only', antes, despues], { timeoutMs: 10_000 });
  log(`Skill actualizada a ${despues.slice(0, 7)}`);
  if (/^worker\//m.test(cambios.stdout)) aviso('El cambio toca worker/: reinicia el contenedor (docker compose restart) para cargar el worker nuevo');
}

function esEscribible(dir) {
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.accessSync(dir, fs.constants.W_OK);
    return true;
  } catch { return false; }
}

// Trae al banco lo nuevo de la nube (bajar salta lo que ya existe). Si el banco está en un montaje de solo
// lectura lo mantiene el dueño a mano y aquí no se toca.
async function refrescarBanco(config) {
  if (!config.bancoUrl || !esEscribible(config.bancoDir)) return;
  const r = await ejecutar('python3', [path.join(config.skillDir, 'scripts', 'banco-fotos.py'), '--banco', config.bancoDir, 'bajar', config.bancoUrl],
    { cwd: config.skillDir, timeoutMs: 20 * 60_000 });
  if (r.codigo === 0) log(`Banco de fotos: ${ultimaLinea(r.stdout)}`);
  else aviso(`No se pudo refrescar el banco de fotos: ${ultimaLinea(r.stderr)}`);
}

function limpiarTrabajo(config) {
  if (!fs.existsSync(config.trabajoDir)) return;
  const limite = Date.now() - config.retencionDias * 86_400_000;
  const viejas = fs.readdirSync(config.trabajoDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && UUID.test(d.name))
    .filter((d) => fs.statSync(path.join(config.trabajoDir, d.name)).mtimeMs < limite);
  viejas.forEach((d) => fs.rmSync(path.join(config.trabajoDir, d.name), { recursive: true, force: true }));
  if (viejas.length) log(`Limpieza: ${viejas.length} carpeta(s) de trabajo con más de ${config.retencionDias} días`);
}

// Cada tarea corre cuando vence su plazo; devuelve los nuevos relojes sin tocar los anteriores.
async function mantenimiento(config, repo, relojes) {
  const ahora = Date.now();
  const vencido = (clave, cadaMs) => ahora - (relojes[clave] || 0) >= cadaMs;
  const nuevos = { ...relojes };
  if (!config.unaVez && vencido('pull', config.pullMin * 60_000)) { await actualizarSkill(config); nuevos.pull = ahora; }
  if (vencido('banco', config.bancoRefrescoH * 3_600_000)) { await refrescarBanco(config); nuevos.banco = ahora; }
  if (vencido('huerfanos', CADA_HUERFANOS_MS)) {
    const rescatados = await repo.rescatarHuerfanos(config.huerfanoMin);
    if (rescatados) aviso(`${rescatados} trabajo(s) llevaban más de ${config.huerfanoMin} min en «procesando»: marcados como error`);
    nuevos.huerfanos = ahora;
  }
  if (vencido('limpieza', CADA_LIMPIEZA_MS)) { limpiarTrabajo(config); nuevos.limpieza = ahora; }
  return nuevos;
}

// ---------- bucle ----------

function cargarPedidoEjemplo() {
  const datos = JSON.parse(fs.readFileSync(PEDIDO_EJEMPLO, 'utf8'));
  if (!datos.pedido) throw new Error(`${PEDIDO_EJEMPLO} no trae "pedido"`);
  return datos;
}

async function iteracion(pipeline, repo) {
  const pedido = await repo.reclamarPedido();
  if (pedido) { await pipeline.procesarPedido(pedido); return true; }
  const correccion = await repo.reclamarCorreccion();
  if (correccion) { await pipeline.procesarCorreccion(correccion); return true; }
  return false;
}

async function principal() {
  const config = cargarConfig();
  if (config.ayuda) return console.log(AYUDA);
  log('Worker de carruseles arrancando');
  log(resumenConfig(config));
  for (const problema of diagnosticar(config)) aviso(`${problema}: cada pedido se marcará como error hasta corregirlo`);
  fs.mkdirSync(config.trabajoDir, { recursive: true });

  const repo = config.simular
    ? crearRepositorioSimulado(cargarPedidoEjemplo())
    : crearRepositorio(crearCliente(config), config);
  const pipeline = crearPipeline({ config, repo, almacen: crearAlmacen(config) });

  // Estado compartido con las señales: el único mutable del programa, a propósito.
  const control = { detener: false, ocupado: false, relojes: {} };
  const alApagar = (senal) => {
    if (!control.ocupado) { log(`${senal}: sin trabajo en curso, adiós`); process.exit(0); }
    log(`${senal}: termino el trabajo en curso y me detengo`);
    control.detener = true;
  };
  process.on('SIGTERM', () => alApagar('SIGTERM'));
  process.on('SIGINT', () => alApagar('SIGINT'));

  while (!control.detener) {
    let hubo = false;
    control.ocupado = true;
    try {
      if (!config.simular) control.relojes = await mantenimiento(config, repo, control.relojes);
      hubo = await iteracion(pipeline, repo);
    } catch (e) {
      fallo(`Vuelta fallida: ${e.message}`);
    } finally {
      control.ocupado = false;
    }
    if (control.detener) break;
    if (config.unaVez && !hubo) { log('Nada pendiente; termino (--una-vez)'); break; }
    if (!hubo) await dormir(config.intervaloS * 1000);
  }
}

principal().catch((e) => { fallo(e.message); process.exit(1); });
