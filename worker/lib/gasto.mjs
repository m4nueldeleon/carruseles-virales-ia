// gasto.mjs: el libro del día. Cuánto lleva gastado el worker hoy, para poder frenar antes de fundir
// el crédito de la cuenta.
//
// Se guarda en disco (TRABAJO_DIR/_costos/gasto-AAAA-MM-DD.json) para que un reinicio del contenedor no
// borre la cuenta del día: si el worker se reinicia diez veces, el tope diario sigue siendo el mismo.
// Si el disco no deja escribir, el libro sigue funcionando en memoria y lo avisa UNA vez: frenar de más
// nunca es peor que no frenar, pero tampoco vale tumbar el worker por un permiso de carpeta.
//
// El día es el día LOCAL del contenedor (la variable TZ del docker-compose), que es el día que ve el
// equipo cuando mira los logs.
import fs from 'node:fs';
import path from 'node:path';
import { aviso, log } from './log.mjs';
import { dolares, redondear } from './costos.mjs';

const CARPETA = '_costos';

const dos = (n) => String(n).padStart(2, '0');
export const fechaLocal = (fecha = new Date()) => `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;

/**
 * @param {object} opciones
 * @param {string} opciones.dir            carpeta de trabajo del worker (dentro se crea _costos/)
 * @param {number} opciones.topeDiaUsd     dólares al día; 0 o menos = sin tope
 * @param {number} opciones.avisoPct       a qué porcentaje del tope se avisa en el log (80 = al 80 %)
 * @param {() => Date} [opciones.ahora]    para las pruebas
 */
export function crearLibroDiario({ dir, topeDiaUsd, avisoPct = 80, ahora = () => new Date() }) {
  const carpeta = path.join(dir, CARPETA);
  // Único estado mutable del módulo, a propósito: es un contador que vive lo que vive el proceso.
  const estado = { fecha: null, usd: 0, trabajos: 0, avisado: false, bloqueoDicho: false, discoDicho: false };

  const archivoDe = (fecha) => path.join(carpeta, `gasto-${fecha}.json`);

  function leerDeDisco(fecha) {
    try {
      const j = JSON.parse(fs.readFileSync(archivoDe(fecha), 'utf8'));
      const usd = Number(j?.usd);
      return { usd: Number.isFinite(usd) && usd > 0 ? usd : 0, trabajos: Number(j?.trabajos) || 0 };
    } catch { return { usd: 0, trabajos: 0 }; }
  }

  function guardarEnDisco() {
    try {
      fs.mkdirSync(carpeta, { recursive: true });
      fs.writeFileSync(archivoDe(estado.fecha),
        `${JSON.stringify({ fecha: estado.fecha, usd: redondear(estado.usd), trabajos: estado.trabajos }, null, 2)}\n`);
    } catch (e) {
      if (estado.discoDicho) return;
      estado.discoDicho = true;
      aviso(`No se pudo guardar el gasto del día en disco (${e.code || e.message}): el tope diario sigue activo, pero se reinicia si se reinicia el contenedor`);
    }
  }

  // Al cambiar de día el contador arranca de cero (y recoge lo que ya hubiera en el archivo de hoy,
  // por si el contenedor se reinició a media jornada).
  function alDia() {
    const hoy = fechaLocal(ahora());
    if (estado.fecha === hoy) return;
    const previo = leerDeDisco(hoy);
    estado.fecha = hoy;
    estado.usd = previo.usd;
    estado.trabajos = previo.trabajos;
    // A propósito NO se da por avisado aunque lo que se recogió del disco ya pase del 80 %: si el
    // contenedor se reinicia con el día medio gastado, el aviso tiene que volver a salir en el log.
    estado.avisado = false;
    estado.bloqueoDicho = false;
  }

  /** Apunta lo que costó un trabajo y devuelve el total del día. */
  function anotar(usd, { trabajos = 1 } = {}) {
    alDia();
    const cantidad = Number(usd);
    if (Number.isFinite(cantidad) && cantidad > 0) {
      estado.usd += cantidad;
      estado.trabajos += trabajos;
      guardarEnDisco();
    }
    if (topeDiaUsd > 0 && !estado.avisado && estado.usd >= topeDiaUsd * (avisoPct / 100)) {
      estado.avisado = true;
      aviso(`El gasto de hoy va en ${dolares(estado.usd)} de un tope de ${dolares(topeDiaUsd)} (${avisoPct} %). Quedan ${dolares(restante())}.`);
    }
    return estado.usd;
  }

  const total = () => { alDia(); return estado.usd; };
  const restante = () => (topeDiaUsd > 0 ? Math.max(0, topeDiaUsd - estado.usd) : Infinity);

  /** ¿Se acabó el presupuesto del día? Si sí, el worker no toma trabajo nuevo (lo pendiente sigue pendiente). */
  function alcanzoElTope() {
    if (!(topeDiaUsd > 0)) return false;
    alDia();
    const llegó = estado.usd >= topeDiaUsd;
    if (llegó && !estado.bloqueoDicho) {
      estado.bloqueoDicho = true;
      log(`Tope de gasto del día alcanzado: ${dolares(estado.usd)} de ${dolares(topeDiaUsd)}. No se toman pedidos nuevos hasta mañana; los pendientes se quedan en la cola.`);
    }
    return llegó;
  }

  return Object.freeze({
    anotar,
    total,
    restante,
    alcanzoElTope,
    get tope() { return topeDiaUsd; },
    get fecha() { alDia(); return estado.fecha; },
    get trabajos() { alDia(); return estado.trabajos; },
  });
}
