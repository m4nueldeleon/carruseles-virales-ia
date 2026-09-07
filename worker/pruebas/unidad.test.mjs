// unidad.test.mjs: pruebas de las funciones puras del worker. Correr con `node --test worker/pruebas/unidad.test.mjs`.
import { test } from 'node:test';
import http from 'node:http';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { decidirFormatos, detectarLogos, recortarTema } from '../lib/entrada.mjs';
import { extraerCaption, humanizarMotivo, limpiarTitulo, leerResumenEscribir, listarSlides, crearZip } from '../lib/salida.mjs';
import { cargarConfig, diagnosticar, APPS_POR_OMISION } from '../lib/config.mjs';
import { motivoDeSalida, ultimaLinea } from '../lib/procesos.mjs';
import { ipInterna, nombreProhibido, revisarEnlace, traerSeguro, MENSAJE_BLOQUEO, MENSAJE_MUCHOS_SALTOS } from '../lib/red.mjs';
import { PRECIOS, costoDeUso, crearContador, leerPreciosDeTexto, leerUso, mezclarPrecios, preciosDe } from '../lib/costos.mjs';
import { crearLibroDiario, fechaLocal } from '../lib/gasto.mjs';
import { TOPE_DIA_USD, TOPE_PEDIDO_USD } from '../lib/config.mjs';
import { crearRepositorioSimulado } from '../lib/bd-simulada.mjs';
import { crearAlmacen } from '../lib/blob.mjs';
import { crearPipeline } from '../pipeline.mjs';

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

test('motivoDeSalida descarta los avisos de progreso que empiezan con ·', () => {
  assert.equal(motivoDeSalida('· plan listo\n· render 3/8\n'), '');
  assert.equal(motivoDeSalida('· render 3/8\nNo existe la referencia\n'), 'No existe la referencia');
});

test('humanizarMotivo explica los errores de la API en español y deja el inglés en el log', () => {
  const crudo = motivoDeSalida(RASTRO_NODE);
  const log = [];
  const texto = humanizarMotivo(crudo, { alLog: (d) => log.push(d) });
  assert.match(texto, /^La API de Anthropic rechazó la petición \(error 400\)/);
  assert.ok(!/temperature|deprecated/i.test(texto), `no debe llevar inglés técnico a la pantalla: ${texto}`);
  assert.match(texto, /log del servidor/);
  assert.deepEqual(log, ['Anthropic 400: `temperature` is deprecated for this model.']);
  assert.match(humanizarMotivo('Anthropic 400: {"error":{"message":"Your credit balance is too low to access the API."}}'), /crédito/);
  assert.match(humanizarMotivo('Anthropic 401: {"error":{"message":"API key is invalid."}}'), /clave del servidor/);
  assert.match(humanizarMotivo('Anthropic 429: {"error":{"message":"rate limit"}}'), /unos minutos/);
  assert.match(humanizarMotivo('Anthropic 529: {"error":{"message":"Overloaded"}}'), /no está respondiendo \(error 529\)/);
  assert.equal(humanizarMotivo('No existe la referencia'), 'No existe la referencia');
  assert.equal(humanizarMotivo(''), '');
});

// ---------- el portero de enlaces (que un link de la app no toque la red interna del servidor) ----------

const resolverFalso = (mapa) => async (host) => {
  if (!mapa[host]) throw new Error('sin dominio');
  return mapa[host].map((address) => ({ address, family: address.includes(':') ? 6 : 4 }));
};

// Las mil formas de escribir «el servicio que corre aquí mismo». La prueba las manda por el camino de
// verdad (revisarEnlace / traerSeguro), no llamando a ipInterna con una cadena escrita a mano: eso solo
// comprobaba el filtro contra el texto que el filtro ya esperaba, y así fue como se coló el IPv6 mapeado.
const formaInterna = (puerto) => [
  ['punteada', `http://127.0.0.1:${puerto}/`],
  ['nombre localhost', `http://localhost:${puerto}/`],
  ['IPv6 loopback', `http://[::1]:${puerto}/`],
  ['IPv6 mapeado con puntos', `http://[::ffff:127.0.0.1]:${puerto}/`],
  ['IPv6 mapeado en hexadecimal', `http://[::ffff:7f00:1]:${puerto}/`],
  ['IPv6 compatible', `http://[::7f00:1]:${puerto}/`],
  ['NAT64', `http://[64:ff9b::7f00:1]:${puerto}/`],
  ['IPv4 traducida (SIIT)', `http://[::ffff:0:7f00:1]:${puerto}/`],
  ['6to4', `http://[2002:7f00:1::1]:${puerto}/`],
  ['decimal', `http://2130706433:${puerto}/`],
  ['octal', `http://0177.0.0.1:${puerto}/`],
  ['hexadecimal', `http://0x7f000001:${puerto}/`],
  ['corta 127.1', `http://127.1:${puerto}/`],
  ['privada 10/8 mapeada', `http://[::ffff:a00:1]:${puerto}/`],
  ['metadatos de nube mapeados', `http://[::ffff:a9fe:a9fe]:${puerto}/`],
  ['metadatos de nube', `http://169.254.169.254:${puerto}/`],
  ['red de operador 100.64/10', `http://100.64.0.1:${puerto}/`],
  ['192.0.0/24', `http://192.0.0.1:${puerto}/`],
  ['pruebas de red 198.18/15', `http://198.18.0.1:${puerto}/`],
  ['difusión', `http://255.255.255.255:${puerto}/`],
  ['únicas locales', `http://[fd00::1]:${puerto}/`],
  ['enlace local IPv6', `http://[fe80::1]:${puerto}/`],
  ['vecino de Docker', `http://supabase-db:${puerto}/`],
  ['sin http', 'file:///etc/passwd'],
  ['ni siquiera un enlace', 'no es un enlace'],
];

// Levanta un servicio interno de verdad y devuelve cuántas veces lo tocaron.
async function servicioInterno(cuerpo = 'SECRETO-INTERNO') {
  const estado = { golpes: 0 };
  const servidor = http.createServer((_p, r) => { estado.golpes += 1; r.end(cuerpo); });
  await new Promise((ok) => servidor.listen(0, '127.0.0.1', ok));
  estado.puerto = servidor.address().port;
  estado.cerrar = () => new Promise((ok) => servidor.close(ok));
  return estado;
}

test('ipInterna decide por los bytes, no por cómo está escrita la dirección', () => {
  for (const dir of ['127.0.0.1', '10.0.0.1', '172.16.0.1', '172.31.255.255', '192.168.1.1', '169.254.169.254',
    '0.0.0.0', '100.64.0.1', '100.127.255.255', '192.0.0.1', '198.18.0.1', '255.255.255.255', '224.0.0.1',
    '::1', '::', 'fc00::1', 'fd12::3', 'fe80::1', 'ff02::1',
    '::ffff:127.0.0.1', '::ffff:7f00:1', '::ffff:a00:1', '::ffff:a9fe:a9fe', '::7f00:1',
    '64:ff9b::7f00:1', '64:ff9b::808:808', '::ffff:0:7f00:1', '2002:7f00:1::1', 'no-es-ip', '']) {
    assert.equal(ipInterna(dir), true, `debería bloquear ${dir}`);
  }
  for (const dir of ['8.8.8.8', '1.1.1.1', '172.32.0.1', '93.184.216.34', '100.128.0.1', '2606:2800:220:1::']) {
    assert.equal(ipInterna(dir), false, `debería dejar pasar ${dir}`);
  }
});

test('nombreProhibido corta localhost, dominios internos, hosts sin punto y IPv4 mal escritas', () => {
  for (const host of ['localhost', 'LOCALHOST', 'ip6-localhost', 'mi-servicio.local', 'api.internal',
    'supabase-db', 'metadata.google.internal', '2130706433', '0177.0.0.1', '0x7f000001', '']) {
    assert.equal(nombreProhibido(host), true, `debería bloquear ${host}`);
  }
  for (const host of ['example.com', 'localhost.mi-dominio.com', 'cdn.instagram.com', '8.8.8.8', '127.0.0.1']) {
    assert.equal(nombreProhibido(host), false, `debería dejar pasar ${host}`);
  }
});

test('revisarEnlace bloquea todas las formas de escribir lo interno y deja pasar lo público', async () => {
  const resolver = resolverFalso({
    'ejemplo-publico.com': ['93.184.216.34'],
    'trampa.com': ['10.1.2.3'],
    'mixto.com': ['8.8.8.8', '127.0.0.1'],
    'mapeada.com': ['::ffff:7f00:1'],
  });
  for (const [nombre, enlace] of formaInterna(9000)) {
    const r = await revisarEnlace(enlace, { resolver });
    assert.equal(r.ok, false, `debería bloquear ${nombre}: ${enlace}`);
    assert.equal(r.motivo, MENSAJE_BLOQUEO);
  }
  for (const enlace of ['ftp://ejemplo-publico.com/x', 'javascript:alert(1)']) {
    assert.equal((await revisarEnlace(enlace, { resolver })).ok, false, enlace);
  }
  assert.equal((await revisarEnlace('http://trampa.com/', { resolver })).ok, false, 'dominio que resuelve a una privada');
  assert.equal((await revisarEnlace('http://mixto.com/', { resolver })).ok, false, 'basta una dirección interna entre varias');
  assert.equal((await revisarEnlace('http://mapeada.com/', { resolver })).ok, false, 'dominio que resuelve a un IPv6 mapeado interno');
  const buena = await revisarEnlace('https://ejemplo-publico.com/foto.jpg', { resolver });
  assert.equal(buena.ok, true);
  assert.deepEqual(buena.direcciones, ['93.184.216.34'], 'devuelve la dirección aprobada para fijar la conexión');
  assert.match((await revisarEnlace('https://no-existe.com/', { resolver })).motivo, /No encontré ese dominio/);
});

test('traerSeguro no alcanza un servicio interno de verdad por ninguna de sus formas', async (t) => {
  const interno = await servicioInterno();
  t.after(() => interno.cerrar());
  for (const [nombre, enlace] of formaInterna(interno.puerto)) {
    await assert.rejects(() => traerSeguro(enlace, { timeoutMs: 3_000 }), (e) => {
      assert.equal(e.bloqueado, true, `${nombre} debería quedar bloqueado por el portero, no fallar de otro modo`);
      return true;
    }, `${nombre}: ${enlace}`);
  }
  assert.equal(interno.golpes, 0, 'el servicio interno no debió recibir ni una sola petición');
});

// El transporte se sustituye para no depender de internet; el portero corre igual en cada salto.
const guionDeSaltos = (mapa) => async (url) => {
  const paso = mapa[url.toString()];
  assert.ok(paso, `el guion no contempla ${url}`);
  return typeof paso === 'string'
    ? new Response(null, { status: 302, headers: { location: paso } })
    : new Response('final', { status: 200 });
};

test('traerSeguro revisa cada salto de la redirección, no solo el primero', async () => {
  const resolver = resolverFalso({ 'publico-a.com': ['93.184.216.34'], 'publico-b.com': ['8.8.8.8'] });
  const pedir = guionDeSaltos({
    'https://publico-a.com/1': 'https://publico-b.com/2',
    'https://publico-b.com/2': 'http://169.254.169.254/latest/meta-data/',
    'https://publico-a.com/ok': 'https://publico-b.com/fin',
    'https://publico-b.com/fin': true,
  });
  await assert.rejects(() => traerSeguro('https://publico-a.com/1', { resolver, pedir }), (e) => {
    assert.equal(e.bloqueado, true);
    assert.equal(e.message, MENSAJE_BLOQUEO);
    return true;
  }, 'el tercer salto va a los metadatos de la nube y debe cortarse ahí');
  const buena = await traerSeguro('https://publico-a.com/ok', { resolver, pedir });
  assert.equal(buena.status, 200);
  assert.equal(await buena.text(), 'final');
});

test('traerSeguro se planta cuando el enlace da vueltas sin llegar', async () => {
  const resolver = resolverFalso({ 'vueltas.com': ['93.184.216.34'] });
  const pedir = async () => new Response(null, { status: 302, headers: { location: 'https://vueltas.com/otra' } });
  await assert.rejects(() => traerSeguro('https://vueltas.com/1', { resolver, pedir, maxSaltos: 3 }),
    (e) => e.message === MENSAJE_MUCHOS_SALTOS);
});

// ---------- el mismo portero, en el lado de Python (scripts/referencia.py) ----------

const REFERENCIA_PY = path.join(import.meta.dirname, '..', '..', 'scripts', 'referencia.py');

const correrPython = (argumentos) => new Promise((listo) => {
  const hijo = spawn('python3', [REFERENCIA_PY, ...argumentos], { stdio: ['ignore', 'pipe', 'pipe'] });
  let stderr = '';
  hijo.stderr.on('data', (d) => { stderr += d; });
  hijo.stdout.resume();
  hijo.on('error', () => listo({ codigo: null, stderr: 'no se pudo lanzar python3' }));
  hijo.on('close', (codigo) => listo({ codigo, stderr }));
});

test('referencia.py tampoco alcanza el servicio interno por ninguna de sus formas', async (t) => {
  if (!fs.existsSync(REFERENCIA_PY)) return t.skip('no está scripts/referencia.py');
  const prueba = await correrPython(['--help']);
  if (prueba.codigo === null) return t.skip('no hay python3 en esta máquina');
  const interno = await servicioInterno();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ref-'));
  t.after(() => interno.cerrar());
  for (const [nombre, enlace] of formaInterna(interno.puerto)) {
    if (!enlace.startsWith('http')) continue;   // referencia.py trata lo que no es http como texto o archivo
    const r = await correrPython([enlace, '--out', tmp]);
    assert.equal(r.codigo, 3, `${nombre} (${enlace}) debería salir con código 3; salió ${r.codigo}`);
    assert.match(r.stderr, /AVISO: Ese enlace no se puede abrir desde el servidor/, `${nombre}: ${r.stderr.slice(0, 120)}`);
  }
  assert.equal(interno.golpes, 0, 'el servicio interno no debió recibir ni una sola petición');
});

// ============================================================
// GASTO: leer el consumo del log, convertirlo a dólares, frenar cuando toca.
// ============================================================

test('leerUso entiende la línea del escritor y descarta el resto del log', () => {
  const uso = leerUso('· claude-opus-5: 18279 tokens de entrada, 7663 de salida (14827 desde caché)');
  assert.deepEqual(uso, { modelo: 'claude-opus-5', entrada: 18279, salida: 7663, lectura: 14827, escritura5m: 0, escritura1h: 0 });
  // Sin paréntesis (el caso normal cuando el caché no se lee).
  assert.deepEqual(leerUso('· claude-opus-5: 18520 tokens de entrada, 4965 de salida'),
    { modelo: 'claude-opus-5', entrada: 18520, salida: 4965, lectura: 0, escritura5m: 0, escritura1h: 0 });
  // Si algún día el cliente también imprime la escritura de caché, se lee sin tocar nada.
  assert.equal(leerUso('· claude-opus-5: 100 tokens de entrada, 50 de salida (10 desde caché, 12106 de escritura de caché)').escritura5m, 12106);
  // Lo que no es una línea de consumo, no lo es.
  for (const linea of ['· render 3/8', 'Error: la API no contestó', '', 'claude-opus-5: hola']) {
    assert.equal(leerUso(linea), null, `no debería leer consumo en «${linea}»`);
  }
});

// El worker no llama al cliente de la API: lo lanza como proceso hijo y le lee stderr. Esta prueba ata las
// dos mitades del contrato, que están en repos-carpetas distintas (scripts/ es la skill, worker/ el servidor)
// y ya se rompieron una vez al cambiar la redacción de la línea sin tocar el patrón de aquí.
test('el worker lee la línea que de verdad imprime el cliente de la API', async () => {
  const { lineaDeUso } = await import('../../scripts/lib/costes.mjs');
  const usage = { input_tokens: 207, output_tokens: 2183, cache_creation_input_tokens: 14827, cache_read_input_tokens: 20581 };
  const uso = leerUso(lineaDeUso('claude-opus-5', usage, 0.1234, 'end_turn').trim());
  assert.deepEqual(uso, { modelo: 'claude-opus-5', entrada: 207, salida: 2183, lectura: 20581, escritura5m: 14827, escritura1h: 0 });
  // La línea del total de la versión NO es una línea de consumo: si se leyera, cada llamada contaría doble.
  const { lineaDeTotal } = await import('../../scripts/lib/costes.mjs');
  assert.equal(leerUso(lineaDeTotal({ llamadas: 2, entrada: 207, escritura_cache: 0, lectura_cache: 20581, salida: 2183, pensamiento: 0, coste_usd: 0.12 }).trim()), null);
});

test('preciosDe normaliza el nombre del modelo y no confunde familias', () => {
  assert.equal(preciosDe('claude-opus-5').salida, 25);
  assert.equal(preciosDe('anthropic/claude-opus-5').salida, 25);        // gateway tipo OpenRouter
  assert.equal(preciosDe('claude-haiku-4-5-20251001').entrada, 1);      // con fecha
  assert.equal(preciosDe('claude-haiku-4.5').entrada, 1);               // con punto
  assert.equal(preciosDe('claude-sonnet-5').salida, 10);
  assert.equal(preciosDe('claude-opus-50'), null, 'un futuro opus-50 es otra familia, no debe heredar precio');
  assert.equal(preciosDe(''), null);
});

test('costoDeUso reproduce el coste medido de una versión real', () => {
  // Medición real del 7-sep-2026, v1 carrusel-8: 18279 entrada + 14827 de escritura de caché + 7663 de salida.
  //   18279 x $5 + 14827 x $6.25 + 7663 x $25, por millón = $0.375639
  const uso = { modelo: 'claude-opus-5', entrada: 18279, salida: 7663, lectura: 0, escritura5m: 14827 };
  const { usd, conocido } = costoDeUso(uso);
  assert.equal(conocido, true);
  assert.equal(usd.toFixed(4), '0.3756');
  // La misma versión si el caché SE LEYERA en vez de escribirse (0.1x en vez de 1.25x): $0.2904.
  assert.equal(costoDeUso({ ...uso, escritura5m: 0, lectura: 14827 }).usd.toFixed(4), '0.2904');
  // Un modelo que no está en la tabla no se inventa precio.
  assert.deepEqual(costoDeUso({ modelo: 'modelo-inventado', entrada: 100, salida: 100 }), { usd: 0, conocido: false });
});

test('mezclarPrecios añade modelos por variable de entorno y descarta lo mal escrito', () => {
  const tabla = mezclarPrecios(leerPreciosDeTexto('{"claude-opus-6":{"entrada":5,"escritura5m":6.25,"escritura1h":10,"lectura":0.5,"salida":25}}'));
  assert.equal(preciosDe('claude-opus-6', tabla).salida, 25);
  assert.equal(preciosDe('claude-opus-5', tabla).salida, 25, 'lo de la tabla original se conserva');
  assert.equal(mezclarPrecios(leerPreciosDeTexto('{"malo":{"entrada":1}}')), PRECIOS, 'un modelo incompleto se ignora');
  assert.equal(mezclarPrecios(leerPreciosDeTexto('no es json')), PRECIOS);
  assert.equal(leerPreciosDeTexto(''), null);
});

test('crearContador suma las llamadas y arma las columnas de la versión', () => {
  const c = crearContador();
  assert.equal(c.sumar('· render 1/8'), null);
  c.sumar('· claude-opus-5: 18279 tokens de entrada, 7663 de salida (14827 desde caché)');
  c.sumar('· claude-opus-5: 6527 tokens de entrada, 330 de salida');
  const columnas = c.columnas();
  assert.equal(c.llamadas, 2);
  assert.equal(columnas.tokens_entrada, 18279 + 6527);
  assert.equal(columnas.tokens_salida, 7663 + 330);
  assert.equal(columnas.tokens_cache_lectura, 14827);
  assert.equal(columnas.modelo, 'claude-opus-5');
  assert.ok(columnas.costo_usd > 0.3 && columnas.costo_usd < 0.4, `costo raro: ${columnas.costo_usd}`);
  assert.equal(String(columnas.costo_usd).split('.')[1]?.length <= 4, true, 'se guarda con 4 decimales');
  assert.deepEqual(c.sinPrecio, []);
});

test('el libro del día suma, avisa al 80 %, frena en el tope y sobrevive a un reinicio', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gasto-'));
  const reloj = { fecha: new Date('2026-09-07T10:00:00') };
  const libro = crearLibroDiario({ dir, topeDiaUsd: 20, avisoPct: 80, ahora: () => reloj.fecha });
  assert.equal(libro.alcanzoElTope(), false);
  libro.anotar(15);
  assert.equal(libro.total(), 15);
  assert.equal(libro.alcanzoElTope(), false, '15 de 20 todavía no frena');
  libro.anotar(5);
  assert.equal(libro.alcanzoElTope(), true, '20 de 20 frena');
  assert.equal(libro.restante(), 0);

  // Reinicio del contenedor: un libro nuevo sobre la misma carpeta recupera el gasto del día,
  // y el aviso del 80 % vuelve a salir (el día ya iba por encima cuando se reinició).
  const dichos = [];
  const consolaReal = console.log;
  console.log = (...partes) => dichos.push(partes.join(' '));
  const trasReinicio = crearLibroDiario({ dir, topeDiaUsd: 20, avisoPct: 80, ahora: () => reloj.fecha });
  assert.equal(trasReinicio.total(), 20);
  trasReinicio.anotar(0.5);
  assert.equal(trasReinicio.alcanzoElTope(), true);
  console.log = consolaReal;
  const avisos80 = dichos.filter((l) => /El gasto de hoy va en/.test(l));
  assert.equal(avisos80.length, 1, `el aviso del 80 % debe salir una sola vez: ${JSON.stringify(dichos)}`);
  assert.match(avisos80[0], /\$20\.50 de un tope de \$20\.00 \(80 %\)/);
  assert.equal(dichos.filter((l) => /Tope de gasto del día alcanzado/.test(l)).length, 1, 'y el del corte, también una');

  // Al día siguiente arranca de cero.
  reloj.fecha = new Date('2026-09-08T09:00:00');
  assert.equal(trasReinicio.total(), 0);
  assert.equal(trasReinicio.alcanzoElTope(), false);
  assert.equal(fechaLocal(new Date('2026-01-02T03:04:05')), '2026-01-02');

  // Sin tope (0) nunca frena.
  const libre = crearLibroDiario({ dir: path.join(dir, 'otro'), topeDiaUsd: 0 });
  libre.anotar(1000);
  assert.equal(libre.alcanzoElTope(), false);
  assert.equal(libre.restante(), Infinity);
});

test('cargarConfig trae los topes de gasto y los deja cambiar por variable', () => {
  const porOmision = cargarConfig([], { SKILL_DIR: '/s', PRIVADO_DIR: '/p', TRABAJO_DIR: '/t' });
  assert.equal(porOmision.topePedidoUsd, TOPE_PEDIDO_USD);
  assert.equal(porOmision.topeDiaUsd, TOPE_DIA_USD);
  assert.equal(porOmision.avisoDiaPct, 80);
  const propio = cargarConfig([], { COSTO_TOPE_PEDIDO_USD: '0.5', COSTO_TOPE_DIA_USD: '0', COSTO_AVISO_DIA_PCT: '90' });
  assert.equal(propio.topePedidoUsd, 0.5);
  assert.equal(propio.topeDiaUsd, 0, 'el cero se respeta: significa sin tope');
  assert.equal(propio.avisoDiaPct, 90);
});

// El freno de verdad: un escritor de mentira que gasta y se queda colgado, y un tope ridículo.
// Comprueba las tres cosas: que el proceso hijo se corta, que el pedido queda en error y que el
// texto que ve el equipo dice cuánto llevaba y cuál era el tope.
test('el tope por pedido corta la versión en curso y lo explica en español', async () => {
  const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'tope-'));
  const skill = path.join(raiz, 'skill');
  fs.mkdirSync(path.join(skill, 'scripts'), { recursive: true });
  fs.mkdirSync(path.join(raiz, 'privado'), { recursive: true });
  fs.writeFileSync(path.join(raiz, 'privado', 'MI-MARCA.md'), '# Marca de prueba\n');
  // Escribe una línea de progreso, una de consumo real y se queda colgado: si nadie lo corta, no termina.
  fs.writeFileSync(path.join(skill, 'scripts', 'escribir.mjs'),
    'process.stderr.write("· render 1/8\\n");\n'
    + 'process.stderr.write("· claude-opus-5: 18279 tokens de entrada, 7663 de salida (14827 desde caché)\\n");\n'
    + 'setTimeout(() => {}, 120000);\n');

  const config = cargarConfig(['--sin-subir'], {
    SKILL_DIR: skill, PRIVADO_DIR: path.join(raiz, 'privado'), TRABAJO_DIR: path.join(raiz, 'trabajo'),
    ANTHROPIC_API_KEY: 'clave-de-mentira-para-la-prueba', COSTO_TOPE_PEDIDO_USD: '0.01',
  });
  const datos = JSON.parse(fs.readFileSync(new URL('./pedido.ejemplo.json', import.meta.url), 'utf8'));
  const pedido = { ...datos.pedido, versiones: 1 };
  const repo = crearRepositorioSimulado({ pedido });
  const pipeline = crearPipeline({ config, repo, almacen: crearAlmacen(config) });

  const inicio = Date.now();
  await pipeline.procesarPedido(await repo.reclamarPedido());
  const final = await repo.pedidoPorId(pedido.id);

  assert.ok(Date.now() - inicio < 60_000, 'el hijo debe morir en el acto, no esperar sus 2 minutos');
  assert.equal(final.estado, 'error');
  assert.match(final.error, /se detuvo para no seguir gastando/);
  assert.match(final.error, /llevaba \$0\.29/, `el mensaje debe decir cuánto llevaba: ${final.error}`);
  assert.match(final.error, /el tope por pedido es \$0\.01/, `y cuál es el tope: ${final.error}`);
  assert.equal(final.costo_usd, 0.2904, 'el coste de la versión cortada también se guarda');
});
