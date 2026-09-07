// referencia-md.mjs: inserta o sustituye una sección «## Encabezado» en un referencia.md sin tocar el
// resto (referencia.py deja «## Lectura visual» como marcador y leer-imagen.mjs lo llena).
// Función pura: recibe el texto actual y devuelve el nuevo.
export function insertarSeccion(actual, encabezado, seccion) {
  const texto = String(actual ?? '');
  const inicio = texto.startsWith(encabezado) ? 0 : texto.indexOf(`\n${encabezado}`) >= 0 ? texto.indexOf(`\n${encabezado}`) + 1 : -1;
  if (inicio < 0) return `${texto.replace(/\s*$/, '')}\n\n${seccion}`;
  const resto = texto.slice(inicio + encabezado.length);
  const siguiente = resto.search(/\n## /);
  return `${texto.slice(0, inicio)}${seccion}${siguiente >= 0 ? resto.slice(siguiente + 1) : ''}`;
}
