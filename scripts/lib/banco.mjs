// banco.mjs: carga el catalogo.json del banco de rostro (ruta local o URL pública) y lo resume para el
// modelo: por foto o avatar, nombre, situación, looks, temas y la URL pública (recorte_url o url).
// El formato del catálogo lo escribe scripts/banco-fotos.py (fotos, avatares, base_url).
import fs from 'node:fs';
import path from 'node:path';

// { catalogo, origen, local }: `local` es la carpeta del banco cuando el catálogo es un archivo del disco.
export async function cargarBanco(origen) {
  if (/^https?:\/\//.test(origen)) {
    const url = /catalogo\.json$/.test(origen) ? origen : origen.replace(/\/+$/, '') + '/catalogo.json';
    const r = await fetch(url, { signal: AbortSignal.timeout(60_000) });
    if (!r.ok) throw new Error(`el banco respondió ${r.status} en ${url}`);
    return { catalogo: await r.json(), origen: url, local: null };
  }
  let ruta = path.resolve(origen);
  if (fs.existsSync(ruta) && fs.statSync(ruta).isDirectory()) ruta = path.join(ruta, 'catalogo.json');
  if (!fs.existsSync(ruta)) throw new Error(`no existe ${ruta}`);
  return { catalogo: JSON.parse(fs.readFileSync(ruta, 'utf8')), origen: ruta, local: path.dirname(ruta) };
}

function srcDe(entrada, relativo, recorteRelativo, local) {
  if (entrada.recorte_url) return entrada.recorte_url;
  if (entrada.url) return entrada.url;
  if (!local) return null;
  for (const r of [recorteRelativo, relativo]) if (r && fs.existsSync(path.join(local, r))) return path.join(local, r);
  return null;
}

// Resumen compacto: primero avatares (la skill los prefiere para portada y CTA), luego fotos.
// Solo entran las entradas con una URL pública o un archivo local que exista.
export function resumenBanco({ catalogo, local }, { max = 40 } = {}) {
  const avatares = Object.entries(catalogo.avatares || {}).map(([id, a]) => ({
    id, tipo: 'avatar', estilo: a.estilo || '', look: a.look || '', pose: a.pose || '',
    src: srcDe(a, `avatares/${id}`, a.recorte, local),
  }));
  const fotos = Object.entries(catalogo.fotos || {}).map(([id, f]) => ({
    id, tipo: 'foto', situacion: f.situacion || '', fondo: f.fondo || '', sujeto: f.sujeto || '',
    texto_libre: f.texto_libre || '', looks: f.looks || [], temas: f.temas || [],
    con_recorte: Boolean(f.recorte_url || f.recorte), src: srcDe(f, id, f.recorte, local),
  }));
  const validos = [...avatares, ...fotos].filter(e => e.src);
  return {
    entradas: validos.slice(0, max),
    omitidas: Math.max(0, validos.length - max),
    sin_src: avatares.length + fotos.length - validos.length,
    looks_con_avatar: [...new Set(avatares.filter(a => a.src && a.look).map(a => a.look))],
  };
}

// Reglas para el system prompt. Mandan sobre el «Nunca escribas imagen.src» de la rutina Hermes.
export function reglasBanco(resumen) {
  const looks = resumen.looks_con_avatar.length ? resumen.looks_con_avatar.join(', ') : 'ninguno';
  return `BANCO DE ROSTRO DE LA MARCA (manda sobre «Nunca escribas imagen.src»: con banco SÍ lo escribes)
En la entrada, el campo "banco" lista fotos reales y avatares de la persona de la marca con su "src" (URL pública o ruta). Reglas:
1. La portada, al menos una lámina de cuerpo y la lámina cta llevan "imagen": {"src": <copiado EXACTO de la lista>, "pos": ...}. No inventes ni modifiques ninguna URL. Portada y cta: pos "recorte" (o "recorte-izquierda" si el sujeto mira a la derecha, o "derecha"); cuerpo: "recorte", "derecha" o "centro".
2. Un solo tipo de rostro por carrusel: o todos avatares del MISMO estilo, o todas fotos reales. Nunca mezcles en la misma pieza.
3. Looks con avatar disponible: ${looks}. Si el look del carrusel tiene avatar, usa avatares (mismo estilo) en portada y cta; elige el look del carrusel para que lo tenga, salvo que look_anterior lo vete. Si el look no tiene avatar, usa fotos reales.
4. Trampa del color: el avatar lleva el acento del look en la piel y las manos; con avatar escribe "panel": false (va sobre el fondo del look, nunca sobre el panel del acento). Con foto real puedes usar "panel": true.
5. Elige por situacion, temas, pose y look: la imagen cuenta el tema (celular = WhatsApp, señalando = dato o CTA, palma al frente = advertencia, riendo = contrarian). Nunca la misma imagen en dos láminas.
6. Con imagen.pos "recorte" el título de la portada lleva máximo 6 palabras y ninguna de más de 11 letras.
7. Donde pongas imagen.src no hace falta imagen.prompt. Una lámina que necesite una ilustración que el banco no tiene sigue llevando imagen.prompt sin src.${resumen.omitidas ? `\n(Se omitieron ${resumen.omitidas} entradas por tamaño; elige entre las listadas.)` : ''}`;
}
