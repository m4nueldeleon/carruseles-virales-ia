// supabase.mjs: cliente mínimo de la API REST de Supabase (PostgREST) con fetch, sin dependencias.
// Usa la service key: el worker corre en el servidor y salta RLS a propósito.
const TIMEOUT_MS = 30_000;

export function crearCliente({ supabaseUrl, supabaseKey }) {
  if (!supabaseUrl || !supabaseKey) throw new Error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  const cabeceras = { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, 'Content-Type': 'application/json' };

  async function pedir(metodo, ruta, { cuerpo, prefer } = {}) {
    const respuesta = await fetch(`${supabaseUrl}/rest/v1/${ruta}`, {
      method: metodo,
      headers: prefer ? { ...cabeceras, Prefer: prefer } : cabeceras,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const texto = await respuesta.text();
    if (!respuesta.ok) {
      const error = new Error(`Supabase ${respuesta.status} en ${metodo} ${ruta.split('?')[0]}: ${texto.slice(0, 300)}`);
      error.status = respuesta.status;
      throw error;
    }
    return texto ? JSON.parse(texto) : null;
  }

  return Object.freeze({
    seleccionar: (tabla, consulta) => pedir('GET', `${tabla}?${consulta}`),
    // PATCH con return=representation: devuelve las filas tocadas; vacío significa que el filtro no casó.
    actualizar: (tabla, consulta, cambios) => pedir('PATCH', `${tabla}?${consulta}`, { cuerpo: cambios, prefer: 'return=representation' }),
    insertar: (tabla, fila) => pedir('POST', tabla, { cuerpo: fila, prefer: 'return=representation' }),
  });
}
