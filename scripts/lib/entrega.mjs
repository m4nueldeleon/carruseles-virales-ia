// entrega.mjs: escribe caption.txt (formato de SKILL.md §7: bloque pegable, «---», notas, ALT por
// lámina) y metadata.json (claves de templates/metadata.ejemplo.json) para un carrusel ya escrito.
import fs from 'node:fs';
import path from 'node:path';

const nn = i => String(i).padStart(2, '0');
const limpiarMarcado = s => String(s ?? '').replace(/\*\*|==|\*/g, '').trim();

// Bloque 1 tal cual se pega en Instagram: caption y, al final, los hashtags.
export function textoCaption(carrusel) {
  const hashtags = (carrusel.hashtags || []).join(' ');
  return `${String(carrusel.caption || '').trim()}${hashtags ? `\n\n${hashtags}` : ''}`;
}

export function escribirCaption({ carpeta, carrusel, salida, modelo, imagenUnica = false, palabraConectada = false, entregableExiste = false }) {
  const N = carrusel.slides.length;
  const faltantes = salida.faltantes || [];
  const pendientes = carrusel.slides.some(s => s.imagen && s.imagen.prompt && !s.imagen.src);
  const notas = [
    `Palabra clave: ${carrusel.palabra_clave || '(ninguna: el CTA pide guardar)'}${carrusel.palabra_clave && !palabraConectada ? ' · conéctala en la automatización de DM (ManyChat u otra) antes de publicar' : ''}`,
    `Entregable por DM: ${carrusel.entregable || '(ninguno)'}${carrusel.entregable ? (entregableExiste ? ' · existe' : ' · confirma que existe o créalo antes de publicar') : ''}`,
    imagenUnica ? 'Imagen única: el CTA vive en el caption; sube slides/01.png con este texto.' : `Orden de subida: slides/01.png → ${nn(N)}.png`,
    'Al subir: agrega una pista de música de la librería (un carrusel de fotos con música es elegible para la pestaña Reels).',
    N > 10 ? `${N} láminas: se suben a mano desde la app (la API acepta 10).` : null,
    salida.formato_elegido ? `Formato del protocolo: ${salida.formato_elegido}` : null,
    faltantes.length ? `Faltantes (no se inventaron): ${faltantes.join(' · ')}` : null,
    pendientes ? 'Imágenes pendientes: las láminas con imagen.prompt y sin imagen.src necesitan generarse y guardarse en assets/img/ (references/IMAGENES.md).' : null,
    `Escrito con ${modelo} vía API · confianza ${salida.confianza ?? '?'}`,
    '',
    'Texto alternativo por lámina (pégalo al subir cada imagen):',
    ...carrusel.slides.map((s, i) => `ALT ${nn(i + 1)}: ${s.alt || '(sin alt)'}`),
  ].filter(x => x !== null);
  fs.writeFileSync(path.join(carpeta, 'caption.txt'), `${textoCaption(carrusel)}\n\n---\n${notas.join('\n')}\n`);
}

// `publicaría` es el veredicto medible: QA sin errores y con índice ≥ 90. La revisión visual sigue siendo humana.
export function escribirMetadata({ carpeta, carrusel, salida, informe, rondas, modelo, formatoPlan, referencia, fecha, instrucciones = null }) {
  const portada = carrusel.slides[0] || {};
  const imagenes = carrusel.slides.map((s, i) => (s.imagen && s.imagen.src ? `${nn(i + 1)}: ${s.imagen.src}` : null)).filter(Boolean);
  const meta = {
    slug: carrusel.slug,
    fecha: carrusel.fecha || fecha,
    tema: carrusel.tema || null,
    tipo: carrusel.tipo || null,
    objetivo: carrusel.objetivo || null,
    look: carrusel.look,
    laminas: carrusel.slides.length,
    hook: limpiarMarcado(portada.titulo),
    palabra_clave: carrusel.palabra_clave || null,
    entregable: carrusel.entregable || null,
    entregable_existe: false,
    palabra_clave_conectada: false,
    publicaría: Boolean(informe && informe.errores && informe.errores.length === 0 && informe.indice >= 90),
    referencia: referencia || carrusel.referencia || null,
    indice_qa: informe ? informe.indice : null,
    veredicto_qa: informe ? informe.veredicto : null,
    rondas_qa: rondas,
    imagenes: imagenes.length ? imagenes : ['ninguna: pendientes de generar o look tipográfico'],
    fuentes: [],
    mediciones: [],
    notas: carrusel.notas || null,
    formato_plan: formatoPlan || null,
    formato_elegido: salida.formato_elegido || null,
    modelo,
    faltantes: salida.faltantes || [],
    confianza: salida.confianza ?? null,
    instrucciones,
  };
  fs.writeFileSync(path.join(carpeta, 'metadata.json'), JSON.stringify(meta, null, 2) + '\n');
  return meta;
}
