// log.mjs: mensajes legibles a stdout con fecha y hora local, pensados para `docker compose logs -f`.
// Nada de aquí escribe secretos: lo que se imprime es lo que el equipo puede leer.
const dos = (n) => String(n).padStart(2, '0');

export function ahoraLegible(fecha = new Date()) {
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())} `
    + `${dos(fecha.getHours())}:${dos(fecha.getMinutes())}:${dos(fecha.getSeconds())}`;
}

export const ahoraIso = () => new Date().toISOString();

export function log(...partes) { console.log(`[${ahoraLegible()}]`, ...partes); }
export function aviso(...partes) { console.log(`[${ahoraLegible()}] AVISO:`, ...partes); }
export function fallo(...partes) { console.error(`[${ahoraLegible()}] ERROR:`, ...partes); }
