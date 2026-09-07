// contrato.mjs — la aduana entre lo que devuelve el modelo y lo que espera el motor.
//
// La skill tiene una regla: nunca se confía en la salida. Este archivo es el ÚNICO sitio donde se
// aceptan las variantes de forma razonables que un modelo puede devolver (el caption como objeto,
// los hashtags metidos dentro del caption, `numero_fantasma: true`, `notas` como lista) y se
// traducen al contrato de templates/carrusel.schema.json. Nadie más adivina formas: render.mjs,
// qa.mjs y escribir.mjs llaman aquí y a partir de ahí trabajan con un carrusel de una sola forma.
//
// Lo que NO hace: inventar contenido. Si falta un campo obligatorio se dice CUÁL falta y se para.

// Claves que viven en la envoltura, no dentro del carrusel.
export const CLAVES_ENVOLTURA = ['rutina', 'formato_elegido', 'faltantes', 'confianza', 'escalar_a_claude', 'motivo', 'revisar_humano', 'ronda'];

// El prompt pide el carrusel DIRECTO (con formato_elegido al lado), no envuelto en {carrusel:…}.
// Aceptamos las dos formas: la envuelta que documenta hermes/RUTINA-CARRUSEL.md y la plana que
// devuelve el modelo. Sin esto, una respuesta perfectamente buena se descartaba por la envoltura.
export function comoContrato(json) {
  if (!json || typeof json !== 'object' || Array.isArray(json)) return json;
  if (json.carrusel || json.escalar_a_claude) return json;
  if (!Array.isArray(json.slides)) return json;
  const carrusel = Object.fromEntries(Object.entries(json).filter(([k]) => !CLAVES_ENVOLTURA.includes(k)));
  return {
    rutina: 'carrusel',
    carrusel,
    faltantes: Array.isArray(json.faltantes) ? json.faltantes : [],
    confianza: typeof json.confianza === 'number' ? json.confianza : 1,
    escalar_a_claude: false,
    motivo: json.motivo ?? null,
    formato_elegido: json.formato_elegido ?? null,
  };
}

// ---------- hashtags ----------
const UNO = /#[\p{L}\p{N}_]+/gu;

// Acepta ["#a","#b"], "#a #b", "a, b" o null. Devuelve siempre un arreglo de «#etiqueta» sin repetir.
export function normalizarHashtags(valor) {
  if (valor == null) return [];
  const crudos = Array.isArray(valor) ? valor : [valor];
  const salida = [];
  for (const crudo of crudos) {
    if (crudo == null) continue;
    const texto = String(crudo).trim();
    if (!texto) continue;
    const conAlmohadilla = texto.match(UNO);
    const piezas = conAlmohadilla || texto.split(/[\s,;·]+/).filter(Boolean).map(p => `#${p.replace(/^#+/, '')}`);
    for (const p of piezas) if (p.length > 1 && !salida.includes(p)) salida.push(p);
  }
  return salida;
}

// Una línea que solo son hashtags: fuera del caption y al arreglo (entrega.mjs los pega al final).
const SOLO_HASHTAGS = linea => /\S/.test(linea) && linea.trim().split(/\s+/).every(p => /^#[\p{L}\p{N}_]+$/u.test(p));

// ---------- caption ----------
// El contrato dice: caption es TEXTO. El modelo a veces devuelve {primera_linea, texto, hashtags}
// o una lista de párrafos. Todas esas formas entran aquí y salen como { texto, hashtags }.
export function normalizarCaption(valor) {
  if (valor == null) return { texto: '', hashtags: [] };
  let texto = '';
  let hashtags = [];
  if (typeof valor === 'string') texto = valor;
  else if (Array.isArray(valor)) texto = valor.filter(l => l != null).map(String).join('\n\n');
  else if (typeof valor === 'object') {
    hashtags = normalizarHashtags(valor.hashtags);
    const cuerpo = valor.texto ?? valor.cuerpo ?? valor.completo ?? null;
    const primera = valor.primera_linea ?? valor.gancho ?? null;
    const resto = Array.isArray(valor.lineas) ? valor.lineas.filter(Boolean).map(String).join('\n\n') : (valor.resto ?? null);
    const partes = [];
    if (primera) partes.push(String(primera).trim());
    // Si el «texto» ya empieza por la primera línea, no la repetimos.
    if (cuerpo) {
      const c = String(cuerpo).trim();
      if (partes.length && c.startsWith(partes[0])) partes.length = 0;
      partes.push(c);
    }
    if (resto) partes.push(String(resto).trim());
    texto = partes.filter(Boolean).join('\n\n');
  } else texto = String(valor);

  // Los hashtags nunca viajan dentro del caption: si vienen al final, se sacan al arreglo.
  const lineas = texto.split('\n');
  while (lineas.length && (!lineas[lineas.length - 1].trim() || SOLO_HASHTAGS(lineas[lineas.length - 1]))) {
    const ultima = lineas.pop();
    if (ultima.trim()) hashtags = [...hashtags, ...normalizarHashtags(ultima)];
  }
  const repetidos = [];
  for (const h of hashtags) if (!repetidos.includes(h)) repetidos.push(h);
  return { texto: lineas.join('\n').trim(), hashtags: repetidos };
}

// ---------- láminas ----------
const aTexto = v => (v == null ? v : typeof v === 'string' ? v : Array.isArray(v) ? v.filter(x => x != null).map(String).join('\n') : String(v));

export function normalizarSlide(slide) {
  if (!slide || typeof slide !== 'object') return slide;
  const s = { ...slide };

  // imagen: {"src": "..."} es el contrato; una cadena suelta también se entiende.
  if (typeof s.imagen === 'string') s.imagen = { src: s.imagen };

  // numero_fantasma es el número GIGANTE de fondo: un texto. Con `true` el motor pintaba «true»
  // sobre la lámina; se traduce al número de la lámina y si no hay número, se quita.
  if (s.numero_fantasma === true) {
    const n = s.numero ?? s.dato ?? null;
    if (n == null || String(n).trim() === '') delete s.numero_fantasma;
    else s.numero_fantasma = String(n);
  } else if (s.numero_fantasma === false || s.numero_fantasma == null) delete s.numero_fantasma;
  else s.numero_fantasma = String(s.numero_fantasma);

  if (s.numero != null) s.numero = String(s.numero);
  if (s.dato != null) s.dato = String(s.dato);
  if (s.alt != null) s.alt = aTexto(s.alt);

  // Campos de lista que a veces llegan sueltos.
  for (const campo of ['items', 'chips']) if (s[campo] != null && !Array.isArray(s[campo])) s[campo] = [s[campo]];

  // `nota` a nivel de lámina no existe en el contrato (la nota vive dentro del ítem). Si hay ítems,
  // se cuelga del último en vez de perderse; si no, se queda como campo muerto e inofensivo.
  if (typeof s.nota === 'string' && s.nota.trim() && Array.isArray(s.items) && s.items.length) {
    const items = s.items.map(x => (typeof x === 'string' ? { texto: x } : { ...x }));
    const ultimo = items[items.length - 1];
    ultimo.nota = [ultimo.nota, s.nota].filter(Boolean).join(' ');
    s.items = items;
    delete s.nota;
  }
  return s;
}

// ---------- carrusel ----------
const OBJETIVOS = ['saves', 'shares', 'comments', 'follows'];

export function normalizarCarrusel(carrusel) {
  if (!carrusel || typeof carrusel !== 'object') return carrusel;
  const c = { ...carrusel };

  const cap = normalizarCaption(c.caption);
  c.caption = cap.texto;
  const hashtags = normalizarHashtags(c.hashtags);
  for (const h of cap.hashtags) if (!hashtags.includes(h)) hashtags.push(h);
  c.hashtags = hashtags; // siempre lista: quien lee no tiene que preguntarse si existe

  // objetivo: texto o arreglo (el contrato admite hasta dos; el modelo a veces manda tres).
  if (Array.isArray(c.objetivo)) {
    const validos = c.objetivo.map(String).filter(o => OBJETIVOS.includes(o));
    c.objetivo = (validos.length ? validos : c.objetivo.map(String)).slice(0, 2);
  } else if (c.objetivo != null) c.objetivo = String(c.objetivo);

  // notas: el contrato pide una cadena; una lista de apuntes se junta en líneas.
  if (c.notas != null) c.notas = aTexto(c.notas);

  if (c.marca == null || typeof c.marca !== 'object' || Array.isArray(c.marca)) c.marca = {};
  else c.marca = { ...c.marca };

  if (Array.isArray(c.slides)) c.slides = c.slides.map(normalizarSlide);
  return c;
}

// ---------- verificación ----------
// Cuando algo falta de verdad, hay que decir QUÉ falta. «La salida no trae carrusel.slides» no
// sirve para arreglar nada; «falta el campo obligatorio «caption»» sí.
export function verificarSalida(salida) {
  if (!salida || typeof salida !== 'object' || Array.isArray(salida)) return { ok: false, error: 'json_invalido', campo: null, mensaje: 'El modelo no devolvió un objeto JSON.' };
  if (salida.escalar_a_claude) return { ok: true, escalado: true };
  const c = salida.carrusel;
  if (c == null) return { ok: false, error: 'sin_carrusel', campo: 'carrusel', mensaje: 'La salida no trae el carrusel: falta el campo «slides» (carrusel plano) o «carrusel» (envuelto).' };
  if (typeof c !== 'object' || Array.isArray(c)) return { ok: false, error: 'carrusel_no_objeto', campo: 'carrusel', mensaje: `El campo «carrusel» es ${Array.isArray(c) ? 'una lista' : typeof c}; se esperaba un objeto.` };
  if (!Array.isArray(c.slides)) return { ok: false, error: 'sin_slides', campo: 'slides', mensaje: `Falta el campo obligatorio «slides» (o no es una lista: llegó ${c.slides === undefined ? 'nada' : typeof c.slides}).` };
  if (!c.slides.length) return { ok: false, error: 'slides_vacio', campo: 'slides', mensaje: 'El campo «slides» llegó vacío: no hay ninguna lámina que renderizar.' };
  const sinLayout = c.slides.map((s, i) => (s && typeof s === 'object' && s.layout ? null : i + 1)).filter(Boolean);
  if (sinLayout.length) return { ok: false, error: 'slide_sin_layout', campo: 'slides[].layout', mensaje: `Falta el campo obligatorio «layout» en la(s) lámina(s) ${sinLayout.join(', ')}.` };
  if (!String(c.caption ?? '').trim()) return { ok: false, error: 'sin_caption', campo: 'caption', mensaje: 'Falta el campo obligatorio «caption» (texto del pie de publicación).' };
  return { ok: true, escalado: false };
}
