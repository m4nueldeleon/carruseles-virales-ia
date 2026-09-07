// bd-simulada.mjs: repositorio en memoria para probar el worker sin Supabase. Imprime cada escritura
// tal como iría a la base (los JSON grandes se resumen). Entrega el pedido de ejemplo una vez y,
// cuando ese pedido termina, la corrección de ejemplo (si el archivo la trae).
import { log } from './log.mjs';

const GRANDES = new Set(['carrusel_json', 'qa_json']);
const resumir = (obj) => JSON.stringify(obj, (clave, valor) =>
  (GRANDES.has(clave) && valor && typeof valor === 'object') ? `[objeto con ${Object.keys(valor).length} claves]` : valor);

export function crearRepositorioSimulado({ pedido, correccion = null }) {
  const memoria = {
    pedido: { ...pedido },
    correccion: correccion ? { ...correccion, pedido_id: pedido.id } : null,
    versiones: [],
    pedidoEntregado: false,
    correccionEntregada: false,
  };
  const escribir = (accion, tabla, id, cambios) => log(`[SIMULADO] ${accion} ${tabla} ${id}: ${resumir(cambios)}`);

  return Object.freeze({
    async reclamarPedido() {
      if (memoria.pedidoEntregado) return null;
      memoria.pedidoEntregado = true;
      memoria.pedido = { ...memoria.pedido, estado: 'procesando' };
      escribir('PATCH', 'carrusel_pedido', pedido.id, { estado: 'procesando' });
      return memoria.pedido;
    },
    async reclamarCorreccion() {
      const lista = memoria.correccion && memoria.pedidoEntregado && !memoria.correccionEntregada && memoria.pedido.estado !== 'procesando';
      if (!lista) return null;
      memoria.correccionEntregada = true;
      memoria.correccion = { ...memoria.correccion, estado: 'procesando' };
      escribir('PATCH', 'carrusel_correccion', memoria.correccion.id, { estado: 'procesando' });
      return memoria.correccion;
    },
    async actualizarPedido(id, cambios) {
      memoria.pedido = { ...memoria.pedido, ...cambios };
      escribir('PATCH', 'carrusel_pedido', id, cambios);
      return memoria.pedido;
    },
    async actualizarCorreccion(id, cambios) {
      memoria.correccion = { ...memoria.correccion, ...cambios };
      escribir('PATCH', 'carrusel_correccion', id, cambios);
      return memoria.correccion;
    },
    async insertarVersion(fila) {
      const nueva = { ...fila, id: `simulada-v${fila.n}`, created_at: new Date().toISOString() };
      memoria.versiones = [...memoria.versiones, nueva];
      escribir('INSERT', 'carrusel_version', nueva.id, fila);
      return nueva;
    },
    async pedidoPorId(id) { return memoria.pedido.id === id ? memoria.pedido : null; },
    async versionesDe(pedidoId) { return memoria.versiones.filter((v) => v.pedido_id === pedidoId); },
    async rescatarHuerfanos() { return 0; },
  });
}
