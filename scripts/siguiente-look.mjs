#!/usr/bin/env node
// siguiente-look.mjs — Decide el look del próximo carrusel con una sola regla ordenada, para que
// SKILL.md, DIRECCION-DE-ARTE.md y el histórico no se contradigan.
//
//   node scripts/siguiente-look.mjs <carpeta-de-trabajo> [--tipo guia|lista|recurso|noticia|tutorial|contrarian|historia|comparativa|prompt]
//
// Lee historico.json Y las carpetas hermanas (*/carrusel.json) para saber qué look llevan los
// carruseles más recientes aunque todavía no se hayan medido. Reglas, en este orden:
//   1. Vetado el look del carrusel más reciente (por fecha; en empate, por nombre de carpeta).
//   2. Vetado cualquier look que aparezca 2 veces en los últimos 4.
//   3. Alterna claro/oscuro respecto al más reciente.
//   4. Entre los que quedan, primero el que empuja el tipo; luego el orden de rotación.
import fs from 'node:fs';
import path from 'node:path';

const CLAROS = ['guia-rapida', 'recurso', 'editorial-mono'];
const OSCUROS = ['oscuro-tech', 'noticia', 'bosque'];
const ROTACION = ['guia-rapida', 'oscuro-tech', 'recurso', 'editorial-mono', 'noticia', 'bosque'];
const POR_TIPO = { guia: ['guia-rapida', 'recurso'], lista: ['guia-rapida', 'recurso', 'oscuro-tech'], recurso: ['recurso', 'guia-rapida'], noticia: ['noticia', 'oscuro-tech'],
  tutorial: ['oscuro-tech', 'guia-rapida'], prompt: ['oscuro-tech', 'editorial-mono'], comparativa: ['oscuro-tech', 'editorial-mono'], contrarian: ['editorial-mono', 'noticia'], historia: ['bosque', 'editorial-mono'] };

const args = process.argv.slice(2);
const carpeta = path.resolve(args.find(a => !a.startsWith('--')) || '.');
const ti = args.indexOf('--tipo'); const tipo = ti >= 0 ? args[ti + 1] : null;

const recientes = [];
try { for (const h of JSON.parse(fs.readFileSync(path.join(carpeta, 'historico.json'), 'utf8'))) recientes.push({ slug: h.slug, fecha: h.fecha || '', look: h.look, origen: 'historico' }); } catch {}
for (const d of fs.readdirSync(carpeta, { withFileTypes: true })) {
  if (!d.isDirectory()) continue;
  const f = path.join(carpeta, d.name, 'carrusel.json');
  if (!fs.existsSync(f)) continue;
  try { const c = JSON.parse(fs.readFileSync(f, 'utf8')); recientes.push({ slug: c.slug || d.name, fecha: c.fecha || d.name.slice(0, 10), look: c.look, origen: 'carpeta' }); } catch {}
}
const vistos = new Map();
for (const r of recientes) { const k = r.slug; if (!vistos.has(k) || r.origen === 'carpeta') vistos.set(k, r); }
const orden = [...vistos.values()].filter(r => r.look).sort((a, b) => (b.fecha + b.slug).localeCompare(a.fecha + a.slug));
const ultimo = orden[0];
const ultimos4 = orden.slice(0, 4).map(r => r.look);
const vetados = new Set();
if (ultimo) { vetados.add(ultimo.look); for (const r of orden) if (r.fecha === ultimo.fecha) vetados.add(r.look); }  // todo lo del mismo día, medido o no
for (const l of ROTACION) if (ultimos4.filter(x => x === l).length >= 2) vetados.add(l);
const grupoPreferido = ultimo ? (CLAROS.includes(ultimo.look) ? OSCUROS : CLAROS) : ROTACION;
let candidatos = ROTACION.filter(l => !vetados.has(l));
if (!candidatos.length) candidatos = ROTACION.filter(l => !(ultimo && l === ultimo.look));  // si el día ya agotó los looks, solo veta el último
const empuje = tipo && POR_TIPO[tipo] ? POR_TIPO[tipo] : [];
const puntua = l => (grupoPreferido.includes(l) ? 10 : 0) + (empuje.includes(l) ? 5 - empuje.indexOf(l) : 0) - ROTACION.indexOf(l) * 0.1;
const ranking = candidatos.sort((a, b) => puntua(b) - puntua(a));
console.log(JSON.stringify({ carpeta, ultimo: ultimo || null, ultimos4, vetados: [...vetados], tipo, recomendado: ranking[0] || 'guia-rapida', orden: ranking }, null, 2));
