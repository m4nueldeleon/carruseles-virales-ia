// contraste-foto.mjs — el punto ciego de QA: el contraste del texto contra la FOTO que tiene debajo.
//
// La medición del DOM compara el color del texto contra el fondo del lienzo (o contra el panel de acento
// si lo hay). Cuando la lámina lleva una foto —un recorte, una imagen a la derecha, un fondo a sangre— el
// fondo real de esas letras son los píxeles de la foto, no el color del look. Por eso un handle gris
// oscuro sobre un zapato negro sacaba 100/100: nadie miraba la foto.
//
// Vía: se mide sobre el PNG que ya sabe producir el motor. Se apaga la tinta de TODO el texto (queda el
// resto de la lámina intacto: fotos, paneles, kickers, el número fantasma que es decoración de fondo), se
// fotografía la lámina y se lee ese PNG dentro de la misma página con un canvas. El PNG entra como data:
// URI, que no ensucia el canvas, así que no hace falta ninguna dependencia nueva ni salir a Python.
//
// No se mide la caja entera de una tirada: se parte en columnas. Una palabra mitad sobre el hueso y mitad
// sobre un zapato negro da un promedio decente y se lee fatal; lo que decide es la PEOR columna y cuánto
// del ancho está por debajo del mínimo.

// Capas de foto de la lámina (base.css). Si el texto no cruza ninguna, el fondo real es el del lienzo y
// la medición del DOM ya lo cubre.
export const CAPAS_FOTO = ['.bg', '.recorte', '.img-derecha', '.img-centro', '.img-abajo', '.foto'];

// CSS que apaga la tinta sin mover un solo píxel de la maqueta: el texto sigue ocupando su caja.
const APAGAR_TINTA = `#descargar{display:none!important}
.slide *:not(.numero-fantasma):not(.numero-fantasma *){color:transparent!important;text-shadow:none!important;-webkit-text-stroke-color:transparent!important}
.slide *::before,.slide *::after{color:transparent!important}`;

const cruzaCaja = (t, c) => t.left < c.right - 2 && t.right > c.left + 2 && t.top < c.bottom - 2 && t.bottom > c.top + 2;

// ¿Este texto se pinta sobre alguna capa de foto?
export function sobreFoto(texto, cajas) {
  return CAPAS_FOTO.some(sel => cajas[sel] && cruzaCaja(texto, cajas[sel]));
}

// Lee el PNG de la lámina y devuelve, por zona, el color medio de cada columna (RGB 0-255).
// Se corre dentro de la página: el canvas hace el trabajo y solo viajan de vuelta unos pocos números.
function leerColumnas({ b64, zonas, anchoCss }) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = () => reject(new Error('el PNG de la lámina no se pudo abrir'));
    img.onload = () => {
      // El PNG puede salir a más de 1x (deviceScaleFactor, pantallas HiDPI): las cajas del DOM vienen en
      // píxeles de CSS, así que todo se convierte con la escala real del archivo.
      const escala = img.naturalWidth / anchoCss;
      const cv = document.createElement('canvas');
      cv.width = img.naturalWidth; cv.height = img.naturalHeight;
      const ctx = cv.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      const salida = zonas.map(z => {
        const alto = (z.bottom - z.top) * escala;
        const y0 = Math.max(0, Math.round(z.top * escala + alto * 0.12));
        const y1 = Math.min(cv.height, Math.max(y0 + 1, Math.round(z.bottom * escala - alto * 0.12)));
        const x0 = Math.max(0, Math.round(z.left * escala));
        const x1 = Math.min(cv.width, Math.max(x0 + 1, Math.round(z.right * escala)));
        const ancho = x1 - x0;
        const n = Math.max(3, Math.min(32, Math.round(ancho / (16 * escala))));
        const cols = [];
        for (let i = 0; i < n; i++) {
          const cx0 = x0 + Math.floor((ancho * i) / n);
          const cx1 = Math.max(cx0 + 1, x0 + Math.floor((ancho * (i + 1)) / n));
          const d = ctx.getImageData(cx0, y0, cx1 - cx0, y1 - y0).data;
          let r = 0, g = 0, b = 0;
          for (let p = 0; p < d.length; p += 4) { r += d[p]; g += d[p + 1]; b += d[p + 2]; }
          const px = d.length / 4;
          cols.push([r / px, g / px, b / px]);
        }
        return cols;
      });
      resolve(salida);
    };
    img.src = 'data:image/png;base64,' + b64;
  });
}

// Para cada lámina de `medidas`, deja en cada texto que cae sobre una foto su `columnas` (colores medios
// del PNG detrás de sus letras). Los textos que no cruzan foto se quedan sin `columnas` y no cambian nada.
// Si algo falla (una foto que no cargó, un canvas sucio), se avisa y QA sigue con el resto: esta medición
// suma, no sustituye.
export async function medirFondoBajoTexto(page, medidas) {
  const objetivo = medidas.map(m => m.textos.map((t, i) => [t, i]).filter(([t]) => sobreFoto(t, m.cajas)));
  if (!objetivo.some(l => l.length)) return { medidos: 0 };
  await page.addStyleTag({ content: APAGAR_TINTA });
  const laminas = await page.$$('.slide');
  let medidos = 0;
  for (let i = 0; i < medidas.length; i++) {
    if (!objetivo[i].length || !laminas[i]) continue;
    const b64 = (await laminas[i].screenshot({ type: 'png' })).toString('base64');
    const zonas = objetivo[i].map(([t]) => ({ left: t.left, top: t.top, right: t.right, bottom: t.bottom }));
    const cols = await page.evaluate(leerColumnas, { b64, zonas, anchoCss: medidas[i].w });
    objetivo[i].forEach(([t], j) => { t.columnas = cols[j]; medidos++; });
  }
  return { medidos };
}
