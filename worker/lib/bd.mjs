// bd.mjs: las operaciones del worker sobre carrusel_pedido, carrusel_version y carrusel_correccion.
// Reclamar es atómico: el PATCH lleva el filtro estado=eq.pendiente; si otro worker ganó, no vuelve fila.
import { ahoraIso, aviso } from './log.mjs';

const MENSAJE_HUERFANO = 'El proceso se interrumpió a mitad del trabajo (el servidor se reinició). Vuelve a pedirlo.';
const enc = encodeURIComponent;

export function crearRepositorio(cliente, { workspaceId = '' } = {}) {
  const filtroWs = workspaceId ? `&workspace_id=eq.${enc(workspaceId)}` : '';
  // Las correcciones se filtran por el pedido embebido (misma marca y pedido ya terminado). Si la base
  // no declara la relación pedido_id → carrusel_pedido, se cae a la consulta simple y se avisa una vez.
  const conEmbebido = { activo: true };

  const primera = (filas) => (Array.isArray(filas) && filas.length ? filas[0] : null);

  async function reclamarPedido() {
    const candidatos = await cliente.seleccionar('carrusel_pedido',
      `select=*&estado=eq.pendiente${filtroWs}&order=created_at.asc&limit=1`);
    const candidato = primera(candidatos);
    if (!candidato) return null;
    const filas = await cliente.actualizar('carrusel_pedido', `id=eq.${enc(candidato.id)}&estado=eq.pendiente`,
      { estado: 'procesando', worker_inicio: ahoraIso(), worker_fin: null, error: null, updated_at: ahoraIso() });
    return primera(filas);
  }

  async function candidataCorreccion() {
    if (conEmbebido.activo) {
      try {
        const filtroPedido = `&carrusel_pedido.estado=in.(listo,error)${workspaceId ? `&carrusel_pedido.workspace_id=eq.${enc(workspaceId)}` : ''}`;
        return primera(await cliente.seleccionar('carrusel_correccion',
          `select=*,carrusel_pedido!inner(id,workspace_id,estado)&estado=eq.pendiente${filtroPedido}&order=created_at.asc&limit=1`));
      } catch (e) {
        if (e.status !== 400) throw e;
        conEmbebido.activo = false;
        aviso('carrusel_correccion no tiene relación declarada con carrusel_pedido; las correcciones se reclaman sin filtrar por marca');
      }
    }
    return primera(await cliente.seleccionar('carrusel_correccion', 'select=*&estado=eq.pendiente&order=created_at.asc&limit=1'));
  }

  async function reclamarCorreccion() {
    const candidata = await candidataCorreccion();
    if (!candidata) return null;
    const filas = await cliente.actualizar('carrusel_correccion', `id=eq.${enc(candidata.id)}&estado=eq.pendiente`,
      { estado: 'procesando', error: null });
    const fila = primera(filas);
    if (!fila) return null;
    const { carrusel_pedido: _omitido, ...limpia } = { ...fila };
    return limpia;
  }

  // Pedidos o correcciones que llevan demasiado en «procesando»: el worker murió a medias (reinicio, OOM).
  async function rescatarHuerfanos(minutos) {
    const limite = new Date(Date.now() - minutos * 60_000).toISOString();
    const pedidos = await cliente.actualizar('carrusel_pedido',
      `estado=eq.procesando&worker_inicio=lt.${enc(limite)}${filtroWs}`,
      { estado: 'error', error: MENSAJE_HUERFANO, worker_fin: ahoraIso(), updated_at: ahoraIso() });
    const correcciones = await cliente.actualizar('carrusel_correccion',
      `estado=eq.procesando&created_at=lt.${enc(limite)}`, { estado: 'error', error: MENSAJE_HUERFANO });
    return (pedidos?.length || 0) + (correcciones?.length || 0);
  }

  return Object.freeze({
    reclamarPedido,
    reclamarCorreccion,
    rescatarHuerfanos,
    actualizarPedido: (id, cambios) => cliente.actualizar('carrusel_pedido', `id=eq.${enc(id)}`, { ...cambios, updated_at: ahoraIso() }).then(primera),
    actualizarCorreccion: (id, cambios) => cliente.actualizar('carrusel_correccion', `id=eq.${enc(id)}`, cambios).then(primera),
    insertarVersion: (fila) => cliente.insertar('carrusel_version', fila).then(primera),
    pedidoPorId: (id) => cliente.seleccionar('carrusel_pedido', `select=*&id=eq.${enc(id)}`).then(primera),
    versionesDe: (pedidoId) => cliente.seleccionar('carrusel_version', `select=*&pedido_id=eq.${enc(pedidoId)}&order=n.asc`).then((f) => f || []),
  });
}
