// contrato.test.mjs — la aduana entre el modelo y el motor, sin red y sin navegador.
//   node --test pruebas/contrato.test.mjs
//
// El caso de oro (pruebas/caso-oro.plano.json) es una respuesta REAL de claude-opus-5 del 7-sep-2026:
// carrusel plano, caption como objeto, hashtags dentro del caption, objetivo con tres valores,
// notas como lista y numero_fantasma booleano. Con el motor de antes reventaba dos veces (primero
// «La salida no trae carrusel.slides», después un TypeError en qa.mjs). Aquí atraviesa entero.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { comoContrato, normalizarCarrusel, normalizarCaption, normalizarHashtags, normalizarSlide, verificarSalida } from '../scripts/lib/contrato.mjs';

const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const oro = () => JSON.parse(fs.readFileSync(path.join(DIR, 'pruebas', 'caso-oro.plano.json'), 'utf8'));
const pasar = crudo => normalizarCarrusel(comoContrato(crudo).carrusel);

// ---------- envoltura ----------
test('comoContrato envuelve el carrusel plano y aparta las claves de la envoltura', () => {
  const s = comoContrato(oro());
  assert.equal(s.rutina, 'carrusel');
  assert.equal(s.formato_elegido, 'carrusel-lista');
  assert.equal(s.carrusel.formato_elegido, undefined, 'formato_elegido no debe quedar dentro del carrusel');
  assert.equal(s.carrusel.slides.length, 5);
});

test('comoContrato deja pasar tal cual lo que ya viene envuelto', () => {
  const envuelto = { rutina: 'carrusel', carrusel: { slides: [{ layout: 'portada-titulo' }] }, confianza: 0.9 };
  assert.equal(comoContrato(envuelto), envuelto);
});

test('comoContrato respeta un escalado aunque no traiga slides', () => {
  const esc = { escalar_a_claude: true, motivo: 'faltan cifras', carrusel: null };
  assert.equal(comoContrato(esc).escalar_a_claude, true);
  assert.equal(verificarSalida(esc).escalado, true);
});

// ---------- caption ----------
test('caption objeto {primera_linea, texto, hashtags} sale como texto y suelta sus hashtags', () => {
  const r = normalizarCaption({ primera_linea: 'Gancho corto.', texto: 'Gancho corto.\n\nSegundo párrafo.', hashtags: ['#uno', '#dos'] });
  assert.equal(r.texto, 'Gancho corto.\n\nSegundo párrafo.', 'la primera línea no se repite');
  assert.deepEqual(r.hashtags, ['#uno', '#dos']);
});

test('caption objeto sin «texto» se arma con primera_linea + resto', () => {
  const r = normalizarCaption({ primera_linea: 'Gancho.', resto: 'Cuerpo del caption.' });
  assert.equal(r.texto, 'Gancho.\n\nCuerpo del caption.');
});

test('caption que ya es texto no se toca', () => {
  const r = normalizarCaption('Primera línea.\n\nSegunda.');
  assert.equal(r.texto, 'Primera línea.\n\nSegunda.');
  assert.deepEqual(r.hashtags, []);
});

test('caption como lista de párrafos se junta', () => {
  assert.equal(normalizarCaption(['Uno.', 'Dos.']).texto, 'Uno.\n\nDos.');
});

test('los hashtags pegados al final del caption se sacan al arreglo', () => {
  const r = normalizarCaption('Cuerpo del caption.\n\n#uno #dos #tres');
  assert.equal(r.texto, 'Cuerpo del caption.');
  assert.deepEqual(r.hashtags, ['#uno', '#dos', '#tres']);
});

test('caption ausente no revienta', () => {
  assert.deepEqual(normalizarCaption(null), { texto: '', hashtags: [] });
});

// ---------- hashtags ----------
test('normalizarHashtags acepta lista, línea suelta y palabras sin almohadilla', () => {
  assert.deepEqual(normalizarHashtags(['#a', '#b']), ['#a', '#b']);
  assert.deepEqual(normalizarHashtags('#a #b'), ['#a', '#b']);
  assert.deepEqual(normalizarHashtags('a, b'), ['#a', '#b']);
  assert.deepEqual(normalizarHashtags(null), []);
  assert.deepEqual(normalizarHashtags(['#a', '#a', '#b']), ['#a', '#b'], 'sin repetidos');
  assert.deepEqual(normalizarHashtags('#dueñosdenegocio'), ['#dueñosdenegocio'], 'con tilde y ñ');
});

// ---------- láminas ----------
test('numero_fantasma booleano se vuelve el número de la lámina y nunca la palabra «true»', () => {
  assert.equal(normalizarSlide({ layout: 'punto-numero', numero: '01', numero_fantasma: true }).numero_fantasma, '01');
  assert.equal('numero_fantasma' in normalizarSlide({ layout: 'lista', numero_fantasma: true }), false, 'sin número, se quita');
  assert.equal('numero_fantasma' in normalizarSlide({ layout: 'lista', numero_fantasma: false }), false);
  assert.equal(normalizarSlide({ layout: 'punto-numero', numero_fantasma: '02' }).numero_fantasma, '02');
});

test('una imagen como cadena suelta se entiende como {src}', () => {
  assert.deepEqual(normalizarSlide({ layout: 'lista', imagen: 'https://x/y.png' }).imagen, { src: 'https://x/y.png' });
});

test('la nota suelta de una lámina se cuelga del último ítem en vez de perderse', () => {
  const s = normalizarSlide({ layout: 'lista', items: ['uno', 'dos'], nota: 'Señal 2 y 3.' });
  assert.equal(s.items[1].nota, 'Señal 2 y 3.');
  assert.equal(s.nota, undefined);
});

test('pasos como cadenas sueltas se vuelven {titulo}: la lámina guardable dejaba de tener texto', () => {
  const s = normalizarSlide({ layout: 'pasos', pasos: ['Confirma qué incluye.', 'Manda monto y fecha.'] });
  assert.deepEqual(s.pasos, [{ titulo: 'Confirma qué incluye.' }, { titulo: 'Manda monto y fecha.' }]);
  // con objetos bien formados no se toca nada
  const ok = normalizarSlide({ layout: 'pasos', pasos: [{ n: 1, titulo: 'Uno', detalle: 'detalle' }] });
  assert.deepEqual(ok.pasos, [{ n: '1', titulo: 'Uno', detalle: 'detalle' }]);
  // «texto» en vez de «titulo» también se entiende
  assert.equal(normalizarSlide({ layout: 'pasos', pasos: [{ texto: 'Dos' }] }).pasos[0].titulo, 'Dos');
});

test('las columnas de una comparativa aceptan lista suelta o cadena', () => {
  const s = normalizarSlide({ layout: 'comparativa', a: ['uno', 'dos'], b: 'Solo título' });
  assert.deepEqual(s.a, { items: ['uno', 'dos'] });
  assert.deepEqual(s.b, { titulo: 'Solo título' });
  const objetos = normalizarSlide({ layout: 'comparativa', a: { titulo: 'Te dicen', items: [{ texto: 'Publica diario' }] } });
  assert.deepEqual(objetos.a.items, ['Publica diario']);
});

// ---------- carrusel entero ----------
test('el caso de oro atraviesa la aduana entero y con los tipos del contrato', () => {
  const c = pasar(oro());
  assert.equal(typeof c.caption, 'string');
  assert.ok(c.caption.startsWith('Si te vas tres días'));
  assert.deepEqual(c.hashtags, ['#dueñosdenegocio', '#delegar', '#pymes', '#iaparanegocios']);
  assert.deepEqual(c.objetivo, ['saves', 'shares'], 'tres objetivos se recortan a los dos del contrato');
  assert.equal(typeof c.notas, 'string', 'la lista de notas se junta en un texto');
  assert.equal(c.slides[2].numero_fantasma, '01');
  assert.equal(c.slides[3].items.at(-1).nota, 'Señal 2: nadie sabe un precio sin preguntarte. Señal 3: te llaman en vacaciones.');
  assert.equal(verificarSalida({ carrusel: c }).ok, true);
});

test('variantes razonables de la misma respuesta pasan todas', () => {
  const base = oro();
  const variantes = {
    'caption ya en texto': { ...base, caption: 'Primera línea corta.\n\nSegunda.', hashtags: ['#a', '#b', '#c'] },
    'sin qa': (() => { const { qa, ...r } = base; return r; })(),
    'sin notas': (() => { const { notas, ...r } = base; return r; })(),
    'objetivo en texto': { ...base, objetivo: 'saves' },
    'sin marca': (() => { const { marca, ...r } = base; return r; })(),
    'sin hashtags en ningún lado': { ...base, caption: 'Solo texto, sin etiquetas.' },
    'notas en texto': { ...base, notas: 'Una sola nota.' },
  };
  for (const [nombre, v] of Object.entries(variantes)) {
    const c = pasar(v);
    assert.equal(typeof c.caption, 'string', `${nombre}: caption debe ser texto`);
    assert.equal(typeof c.marca, 'object', `${nombre}: marca siempre es objeto`);
    assert.ok(Array.isArray(c.slides), `${nombre}: slides es lista`);
    assert.equal(verificarSalida({ carrusel: c }).ok, true, `${nombre}: debe pasar la verificación`);
  }
  assert.equal(pasar(variantes['objetivo en texto']).objetivo, 'saves');
  assert.deepEqual(pasar(variantes['sin hashtags en ningún lado']).hashtags, []);
});

// ---------- errores con nombre ----------
test('cuando falta un campo obligatorio, el error dice CUÁL', () => {
  const casos = [
    [null, 'json_invalido', null],
    [{ rutina: 'carrusel' }, 'sin_carrusel', 'carrusel'],
    [{ carrusel: { caption: 'hola' } }, 'sin_slides', 'slides'],
    [{ carrusel: { slides: [], caption: 'hola' } }, 'slides_vacio', 'slides'],
    [{ carrusel: { slides: [{ titulo: 'sin layout' }], caption: 'hola' } }, 'slide_sin_layout', 'slides[].layout'],
    [{ carrusel: { slides: [{ layout: 'lista' }] } }, 'sin_caption', 'caption'],
  ];
  for (const [entrada, error, campo] of casos) {
    const v = verificarSalida(entrada);
    assert.equal(v.ok, false, `${error}: debía fallar`);
    assert.equal(v.error, error);
    assert.equal(v.campo, campo);
    assert.ok(v.mensaje.length > 20 && /«|JSON/.test(v.mensaje), `${error}: el mensaje debe nombrar el campo, no ser genérico`);
  }
  assert.match(verificarSalida({ carrusel: { slides: [{ layout: 'a' }, { titulo: 'b' }, { titulo: 'c' }], caption: 'x' } }).mensaje, /lámina\(s\) 2, 3/);
});

// ---------- de punta a punta, sin red ----------
test('el caso de oro llega hasta qa.mjs sin excepción (escribir --simular + render + QA)', { timeout: 180_000 }, () => {
  const carpeta = fs.mkdtempSync(path.join(os.tmpdir(), 'contrato-oro-'));
  // escribir.mjs exige la ficha de marca en la carpeta de trabajo; la plantilla basta para la prueba.
  fs.copyFileSync(path.join(DIR, 'templates', 'MI-MARCA.md'), path.join(carpeta, 'MI-MARCA.md'));
  const r = spawnSync('node', [
    path.join(DIR, 'scripts', 'escribir.mjs'),
    '--simular', path.join(DIR, 'pruebas', 'caso-oro.plano.json'),
    '--carpeta', carpeta, '--salida', path.join(carpeta, 'salida'),
    '--formato-plan', 'carrusel-5', '--json',
  ], { encoding: 'utf8' });
  assert.equal(r.status, 0, `escribir.mjs falló: ${r.stderr}`);
  const resumen = JSON.parse(r.stdout.trim().split('\n').at(-1));
  assert.equal(resumen.laminas, 5);
  assert.equal(typeof resumen.indice_qa, 'number', 'QA tiene que haber corrido y dado un índice');

  const dir = resumen.carpeta;
  for (const f of ['carrusel.json', 'caption.txt', 'metadata.json', 'qa.json', 'preview.jpg']) {
    assert.ok(fs.existsSync(path.join(dir, f)), `falta ${f}`);
  }
  const pngs = fs.readdirSync(path.join(dir, 'slides')).filter(f => /^\d{2}\.png$/.test(f));
  assert.equal(pngs.length, 5, 'cinco láminas en PNG');

  // Lo que antes reventaba: caption objeto en qa.mjs y «true» pintado en la lámina 3.
  const c = JSON.parse(fs.readFileSync(path.join(dir, 'carrusel.json'), 'utf8'));
  assert.equal(typeof c.caption, 'string');
  assert.equal(c.slides[2].numero_fantasma, '01');
  const html = fs.readFileSync(path.join(dir, 'slides-src', 'index.html'), 'utf8');
  assert.ok(!/numero-fantasma">true</.test(html), 'nunca se pinta la palabra «true» en la lámina');
  assert.ok(fs.readFileSync(path.join(dir, 'caption.txt'), 'utf8').includes('#delegar'), 'los hashtags llegan al caption.txt');
  fs.rmSync(carpeta, { recursive: true, force: true });
});

test('qa.mjs bloquea una lámina de pasos cuyos elementos no traen texto', { timeout: 180_000 }, () => {
  const carpeta = fs.mkdtempSync(path.join(os.tmpdir(), 'contrato-vacio-'));
  const c = pasar(oro());
  // se salta la aduana a propósito: así llegaba el carrusel.json antes del arreglo
  c.slides[3] = { rol: 'cheatsheet', layout: 'pasos', titulo: 'Los 3 mensajes', pasos: [{ n: '1' }, { n: '2' }], alt: 'x' };
  fs.writeFileSync(path.join(carpeta, 'carrusel.json'), JSON.stringify(c));
  const r = spawnSync('node', [path.join(DIR, 'scripts', 'qa.mjs'), carpeta, '--json'], { encoding: 'utf8' });
  const informe = JSON.parse(r.stdout);
  assert.ok(informe.errores.some(e => /sin texto/.test(e.msg)), 'QA tiene que ver la lámina vacía');
  fs.rmSync(carpeta, { recursive: true, force: true });
});
