// logos.mjs: resuelve el icono oficial de una app con la API pública de la App Store, lo descarga y lo
// monta como tarjeta con esquinas redondeadas y borde navy sobre fondo transparente (Pillow, vía
// scripts/lib/tarjeta_logo.py). Los pares «a + b» llevan el signo en el color de acento del look.
// Receta de references/IMAGENES.md §5: logo REAL, nunca uno dibujado por la IA; pequeño, acompañante.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const DIR_LIB = path.dirname(fileURLToPath(import.meta.url));
const TARJETA_PY = path.join(DIR_LIB, 'tarjeta_logo.py');
export const BORDE_NAVY = '#0A2560';
// --acento de templates/looks/*.css; sirve para el «+» entre dos tarjetas.
export const ACENTO_POR_LOOK = {
  'guia-rapida': '#0044DD', noticia: '#FFD200', 'oscuro-tech': '#FF7A1A',
  recurso: '#BE4B2F', bosque: '#E0B24A', 'editorial-mono': '#C81E12',
};

const sinAcentos = s => String(s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const normaliza = s => sinAcentos(s).replace(/[^a-z0-9]/g, '');
export const slugLogo = nombre => sinAcentos(nombre).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// Busca la app en la App Store (sin clave) y verifica que el nombre y el vendedor sean razonables:
// hay imitaciones con nombres parecidos. Devuelve null si ninguna candidata convence.
export async function buscarIconoAppStore(nombre) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(nombre)}&entity=software&limit=3&country=us`;
  const r = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!r.ok) throw new Error(`la App Store respondió ${r.status}`);
  const { results = [] } = await r.json();
  const n = normaliza(nombre);
  const puntua = x => {
    const t = normaliza(x.trackName), s = normaliza(x.sellerName), a = normaliza(x.artistName);
    return (t.startsWith(n) ? 3 : t.includes(n) ? 2 : 0) + (s.includes(n) ? 2 : 0) + (a.includes(n) ? 1 : 0);
  };
  const mejor = results.map(x => ({ ...x, puntos: puntua(x) })).sort((a, b) => b.puntos - a.puntos)[0];
  if (!mejor || mejor.puntos < 2 || !mejor.artworkUrl512) return null;
  return { trackName: mejor.trackName, sellerName: mejor.sellerName, artwork: mejor.artworkUrl512, puntos: mejor.puntos };
}

function correrPillow(argumentos) {
  const py = spawnSync('python3', [TARJETA_PY, ...argumentos], { encoding: 'utf8' });
  if (py.status !== 0) throw new Error(`Pillow: ${String(py.stderr || py.stdout).trim().slice(-200) || 'sin detalle'}`);
}

// Descarga y monta una tarjeta por nombre en <dirImg>/logo-<slug>.png. Nunca lanza: lo que falla
// vuelve en `faltantes` para que el carrusel siga sin ese logo.
export async function prepararLogos(nombres, dirImg, { log = () => {} } = {}) {
  fs.mkdirSync(dirImg, { recursive: true });
  const listos = [], faltantes = [];
  for (const nombre of nombres) {
    const slug = slugLogo(nombre);
    if (!slug) continue;
    const destino = path.join(dirImg, `logo-${slug}.png`);
    const crudo = path.join(dirImg, `_crudo-${slug}.png`);
    try {
      const icono = await buscarIconoAppStore(nombre);
      if (!icono) throw new Error('la App Store no devolvió una app con ese nombre y un vendedor razonable');
      const r = await fetch(icono.artwork, { signal: AbortSignal.timeout(30_000) });
      if (!r.ok) throw new Error(`la descarga del icono respondió ${r.status}`);
      fs.writeFileSync(crudo, Buffer.from(await r.arrayBuffer()));
      correrPillow(['tarjeta', crudo, destino, '--borde', BORDE_NAVY]);
      listos.push({ nombre, slug, archivo: `logo-${slug}.png`, app: icono.trackName, vendedor: icono.sellerName, origen: icono.artwork });
      log(`  ✓ logo ${nombre}: ${icono.trackName} (${icono.sellerName})`);
    } catch (e) {
      faltantes.push(`logo ${nombre}: ${e.message}`);
      log(`  ✗ logo ${nombre}: ${e.message}`);
    } finally {
      fs.rmSync(crudo, { force: true });
    }
  }
  return { listos, faltantes };
}

export const archivoPar = (a, b) => `logos-${a.slug}-mas-${b.slug}.png`;

// Compone todos los pares posibles (a + b) con el acento del look. Devuelve los que salieron bien.
export function componerParesLogos(listos, dirImg, acento, { log = () => {} } = {}) {
  const pares = [];
  for (let i = 0; i < listos.length; i++) {
    for (let j = i + 1; j < listos.length; j++) {
      const a = listos[i], b = listos[j], archivo = archivoPar(a, b);
      try {
        correrPillow(['par', path.join(dirImg, a.archivo), path.join(dirImg, b.archivo), path.join(dirImg, archivo), '--acento', acento || '#0044DD']);
        pares.push({ archivo, a: a.nombre, b: b.nombre });
      } catch (e) {
        log(`  ✗ par ${a.nombre} + ${b.nombre}: ${e.message}`);
      }
    }
  }
  return pares;
}

// Lista de imágenes disponibles para el prompt (rutas relativas a la carpeta del carrusel).
export function describirLogos(listos) {
  const lineas = listos.map(l => `- assets/img/${l.archivo}: icono oficial de ${l.app} (tarjeta con esquinas redondeadas, fondo transparente, 512 px)`);
  for (let i = 0; i < listos.length; i++) for (let j = i + 1; j < listos.length; j++) {
    lineas.push(`- assets/img/${archivoPar(listos[i], listos[j])}: las tarjetas de ${listos[i].app} y ${listos[j].app} con un «+» del color del acento en medio (para «X + Y»)`);
  }
  return lineas;
}
