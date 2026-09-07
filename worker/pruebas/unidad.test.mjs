// unidad.test.mjs: pruebas de las funciones puras del worker. Correr con `node --test worker/pruebas/unidad.test.mjs`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { decidirFormatos, detectarLogos, recortarTema } from '../lib/entrada.mjs';
import { extraerCaption, humanizarMotivo, limpiarTitulo, leerResumenEscribir, listarSlides, crearZip } from '../lib/salida.mjs';
import { cargarConfig, diagnosticar, APPS_POR_OMISION } from '../lib/config.mjs';
import { motivoDeSalida, ultimaLinea } from '../lib/procesos.mjs';

const APPS = APPS_POR_OMISION.split(',');

test('decidirFormatos sigue la tabla del encargo', () => {
  assert.deepEqual(decidirFormatos(1, false), ['carrusel-8']);
  assert.deepEqual(decidirFormatos(2, true), ['carrusel-5', 'imagen-unica']);
  assert.deepEqual(decidirFormatos(3, true), ['referencia', 'imagen-unica', 'carrusel-5']);
  assert.deepEqual(decidirFormatos(3, false), ['imagen-unica', 'carrusel-5', 'carrusel-8']);
  assert.deepEqual(decidirFormatos(4, true), ['referencia', 'imagen-unica', 'carrusel-5', 'carrusel-8']);
  assert.deepEqual(decidirFormatos(4, false), ['carrusel-8', 'imagen-unica', 'carrusel-5', 'carrusel-8']);
  assert.deepEqual(decidirFormatos(null, false), ['carrusel-8']);
  assert.deepEqual(decidirFormatos(9, true).length, 4);
});

test('detectarLogos respeta mayúsculas y límites de palabra', () => {
  assert.equal(detectarLogos(['Cotiza con ChatGPT y Excel'], APPS), 'ChatGPT,Excel');
  assert.equal(detectarLogos(['nada de chatgpt en minúsculas'], APPS), null);
  assert.equal(detectarLogos(['WhatsApp.', null, 'y Canva'], APPS), 'WhatsApp,Canva');
  assert.equal(detectarLogos(['ExcelSheets no es Excel'], APPS), 'Excel');
});

test('recortarTema corta en una palabra y aplana espacios', () => {
  assert.equal(recortarTema('  hola\n mundo '), 'hola mundo');
  const largo = recortarTema(Array(60).fill('palabra').join(' '));
  assert.ok(largo.length <= 200 && !largo.endsWith(' ') && largo.endsWith('palabra'));
});

test('extraerCaption toma el bloque antes de ---', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cap-'));
  const ruta = path.join(tmp, 'caption.txt');
  fs.writeFileSync(ruta, 'Primera línea.\n\nSegunda.\n\n#uno #dos\n\n---\nPalabra clave: X\n');
  assert.equal(extraerCaption(ruta), 'Primera línea.\n\nSegunda.\n\n#uno #dos');
  assert.equal(extraerCaption(path.join(tmp, 'no-existe.txt')), null);
});

test('limpiarTitulo quita el marcado del motor', () => {
  assert.equal(limpiarTitulo('Tu cotización *pierde dinero*\nantes de ==mandarla==.'), 'Tu cotización pierde dinero antes de mandarla.');
  assert.equal(limpiarTitulo(null), '');
});

test('leerResumenEscribir toma la última línea JSON', () => {
  const salida = 'HTML → x\n{"a":1}\nPNG → y\n{"carpeta":"v1","laminas":8}\n';
  assert.deepEqual(leerResumenEscribir(salida), { carpeta: 'v1', laminas: 8 });
  assert.equal(leerResumenEscribir('sin json'), null);
});

test('listarSlides ignora copias y crearZip arma un zip plano', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'zip-'));
  fs.mkdirSync(path.join(tmp, 'slides'));
  for (const f of ['01.png', '02.png', '01 2.png', 'nota.txt']) fs.writeFileSync(path.join(tmp, 'slides', f), 'x');
  fs.writeFileSync(path.join(tmp, 'caption.txt'), 'hola');
  const slides = listarSlides(tmp);
  assert.deepEqual(slides, ['01.png', '02.png']);
  const zip = await crearZip(tmp, slides);
  assert.ok(zip && fs.statSync(zip).size > 0);
});

test('cargarConfig aplica valores por omisión y banderas', () => {
  const c = cargarConfig(['--una-vez', '--simular'], { SKILL_DIR: '/s', PRIVADO_DIR: '/p', TRABAJO_DIR: '/t', WORKER_INTERVALO_S: 'abc' });
  assert.equal(c.intervaloS, 15);
  assert.equal(c.modelo, 'claude-opus-5');
  assert.equal(c.bancoDir, '/p/assets/fotos/reales');
  assert.ok(c.unaVez && c.simular && c.sinSubir);
  assert.equal(diagnosticar(c)[0], 'La skill del servidor no tiene scripts/escribir.mjs');
  const real = cargarConfig([], { SKILL_DIR: '/s', PRIVADO_DIR: '/p' });
  assert.equal(diagnosticar(real)[0], 'Falta la clave de Anthropic en el servidor');
});

test('ultimaLinea limpia colores y vacíos', () => {
  assert.equal(ultimaLinea('a\n\x1b[31mb\x1b[0m\n\n'), 'b');
  assert.equal(ultimaLinea(''), '');
});

// Lo que Node imprime cuando escribir.mjs revienta: el motivo útil está a media pila, no al final.
const RASTRO_NODE = [
  '/skill/scripts/lib/anthropic.mjs:76',
  "      const e = new Error(`Anthropic ${r.status}: ${detalle}`);",
  '                ^',
  '',
  'Error: Anthropic 400: {"type":"error","error":{"type":"invalid_request_error","message":"`temperature` is deprecated for this model."}}',
  '    at llamarUnaVez (file:///skill/scripts/lib/anthropic.mjs:76:17)',
  '    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)',
  '  status: 400',
  '}',
  '',
  'Node.js v22.20.0',
].join('\n');

test('motivoDeSalida ignora el rastro de pila y el pie de Node', () => {
  const motivo = motivoDeSalida(RASTRO_NODE);
  assert.ok(!/Node\.js v/.test(motivo), 'no debe quedarse con «Node.js v22.20.0»');
  assert.ok(!/\bat \b/.test(motivo), 'no debe quedarse con un marco de la pila');
  assert.ok(motivo.startsWith('Anthropic 400:'), motivo);
});

test('motivoDeSalida toma la línea del escritor y aguanta la salida vacía', () => {
  assert.equal(motivoDeSalida('render → v1\n\x1b[31m✗ No existe la referencia\x1b[0m\n'), 'No existe la referencia');
  assert.equal(motivoDeSalida(''), '');
  assert.equal(motivoDeSalida('\n   \n}\nNode.js v22.20.0\n'), '');
  assert.equal(motivoDeSalida(null), '');
});

test('humanizarMotivo explica los errores de la API en español', () => {
  const crudo = motivoDeSalida(RASTRO_NODE);
  assert.equal(humanizarMotivo(crudo),
    'La API de Anthropic rechazó la petición (400): `temperature` is deprecated for this model.');
  assert.match(humanizarMotivo('Anthropic 400: {"error":{"message":"Your credit balance is too low to access the API."}}'), /crédito/);
  assert.match(humanizarMotivo('Anthropic 401: {"error":{"message":"API key is invalid."}}'), /clave del servidor/);
  assert.match(humanizarMotivo('Anthropic 429: {"error":{"message":"rate limit"}}'), /unos minutos/);
  assert.match(humanizarMotivo('Anthropic 529: {"error":{"message":"Overloaded"}}'), /no está respondiendo \(error 529\)/);
  assert.equal(humanizarMotivo('No existe la referencia'), 'No existe la referencia');
  assert.equal(humanizarMotivo(''), '');
});
