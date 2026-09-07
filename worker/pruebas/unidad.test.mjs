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
import { PRECIOS, costoDeUso, crearContador, leerPreciosDeTexto, leerUso, mezclarPrecios, normalizarTtl, preciosDe } from '../lib/costos.mjs';
import { crearLibroDiario, fechaLocal } from '../lib/gasto.mjs';
import { TOPE_DIA_USD, TOPE_PEDIDO_USD } from '../lib/config.mjs';
import { crearRepositorioSimulado } from '../lib/bd-simulada.mjs';
import { crearAlmacen } from '../lib/blob.mjs';
import { crearPipeline } from '../pipeline.mjs';
import { iteracion } from '../index.mjs';

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
  assert.deepEqual(uso, { modelo: 'claude-opus-5', entrada: 18279, salida: 7663, lectura: 14827, escritura5m: 0, escritura1h: 0, ttl: '5m', usdEscritor: null });
  // Sin paréntesis (el caso normal cuando el caché no se lee).
  assert.deepEqual(leerUso('· claude-opus-5: 18520 tokens de entrada, 4965 de salida'),
    { modelo: 'claude-opus-5', entrada: 18520, salida: 4965, lectura: 0, escritura5m: 0, escritura1h: 0, ttl: '5m', usdEscritor: null });
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
  assert.deepEqual(uso, { modelo: 'claude-opus-5', entrada: 207, salida: 2183, lectura: 20581, escritura5m: 14827, escritura1h: 0, ttl: '5m', usdEscritor: 0.1234 });
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

// DEFECTO CERRADO: se guardaba `modelos[0]` dando por hecho que «las llamadas auxiliares vienen después».
// Con --formato-plan referencia es al revés: la auxiliar (Sonnet, que elige el formato o lee la captura)
// llama ANTES que la principal, y la versión quedaba etiquetada como escrita por Sonnet.
test('la versión se apunta al modelo de la llamada principal, aunque la auxiliar vaya primero', async () => {
  const { lineaDeUso, costeDeUso } = await import('../../scripts/lib/costes.mjs');
  const aux = { input_tokens: 1840, output_tokens: 96, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 };
  const ppal = { input_tokens: 207, output_tokens: 7663, cache_creation_input_tokens: 14827, cache_read_input_tokens: 20581 };
  const c = crearContador();
  c.sumar(lineaDeUso('claude-sonnet-5', aux, costeDeUso(aux, 'claude-sonnet-5'), 'end_turn').trim());
  c.sumar(lineaDeUso('claude-opus-5', ppal, costeDeUso(ppal, 'claude-opus-5'), 'end_turn').trim());
  assert.equal(c.llamadas, 2);
  assert.equal(c.modelo, 'claude-opus-5', 'el carrusel lo escribió Opus; Sonnet solo eligió el formato');
  assert.equal(c.columnas().modelo, 'claude-opus-5');
  // Y si el escritor llega a decir en su resumen --json cuál fue la principal, manda él.
  assert.equal(c.columnas({ modelo: 'claude-opus-5-20260101' }).modelo, 'claude-opus-5-20260101');
});

// DEFECTO CERRADO: la escritura de caché se metía SIEMPRE en la tarifa de 5 minutos (1.25x la entrada).
// Con ESCRIBIR_CACHE_TTL=1h la escritura real cuesta 2x, así que el worker contaba de menos y los topes
// dejaban pasar más gasto del configurado.
test('la escritura de caché se cuenta a la tarifa del ttl con el que se lanzó al escritor', async () => {
  const { lineaDeUso, costeDeUso } = await import('../../scripts/lib/costes.mjs');
  const usage = { input_tokens: 18279, output_tokens: 7663, cache_creation_input_tokens: 30853, cache_read_input_tokens: 0 };
  const linea = lineaDeUso('claude-opus-5', usage, null, 'end_turn').trim();   // la línea de hoy NO dice el ttl
  for (const ttl of ['5m', '1h']) {
    const contador = crearContador({ ttl });
    contador.sumar(linea);
    assert.equal(contador.usd.toFixed(4), costeDeUso(usage, 'claude-opus-5', ttl).toFixed(4),
      `con ttl ${ttl} la cuenta del worker tiene que ser la del escritor, al centavo`);
    assert.equal(contador.desvioUsd, 0);
  }
  const a5m = crearContador({ ttl: '5m' }); a5m.sumar(linea);
  const a1h = crearContador({ ttl: '1h' }); a1h.sumar(linea);
  assert.equal((a1h.usd - a5m.usd).toFixed(4), '0.1157', 'lo que el tope dejaba pasar de más por llamada');
  // Si el escritor llega a escribir el ttl en su línea, manda la línea aunque el worker vaya mal puesto.
  const dicho = crearContador({ ttl: '5m' });
  dicho.sumar(`${linea} · ttl=1h`);
  assert.equal(dicho.usd.toFixed(4), costeDeUso(usage, 'claude-opus-5', '1h').toFixed(4));
  // Y si el escritor dice lo que le cobraron y es más que la cuenta de la tabla, se cobra lo suyo y el
  // desvío queda anotado (es la señal de que la tabla de precios o el ttl de aquí ya no son los suyos).
  const conImporte = crearContador({ ttl: '5m' });
  conImporte.sumar(lineaDeUso('claude-opus-5', usage, costeDeUso(usage, 'claude-opus-5', '1h'), 'end_turn').trim());
  assert.equal(conImporte.usd.toFixed(4), costeDeUso(usage, 'claude-opus-5', '1h').toFixed(4));
  assert.equal(conImporte.desvioUsd.toFixed(4), '0.1157');
  assert.equal(normalizarTtl('1 H'), '1h');
  assert.equal(normalizarTtl('2h'), null);
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
  assert.equal(porOmision.ttlCacheEfectivo, '5m', 'sin variable se cuenta a la tarifa de 5 minutos');
  const propio = cargarConfig([], { COSTO_TOPE_PEDIDO_USD: '0.5', COSTO_TOPE_DIA_USD: '0', COSTO_AVISO_DIA_PCT: '90', ESCRIBIR_CACHE_TTL: '1h' });
  assert.equal(propio.topePedidoUsd, 0.5);
  assert.equal(propio.topeDiaUsd, 0, 'el cero se respeta: significa sin tope');
  assert.equal(propio.avisoDiaPct, 90);
  assert.equal(propio.ttlCacheEfectivo, '1h', 'y con ESCRIBIR_CACHE_TTL=1h, a la de una hora');
  assert.equal(cargarConfig([], { ESCRIBIR_CACHE_TTL: 'lo que sea' }).ttlCacheEfectivo, '5m');
});

// ============================================================
// EL FRENO DE GASTO, DE PUNTA A PUNTA
// ============================================================

// Un escritor de mentira que gasta de verdad (imprime las dos líneas de consumo que lee el worker: la
// auxiliar y la principal), tarda un poco en «renderizar» y ENTREGA la versión. Es el caso que importa:
// cuando la línea de consumo aparece, la API ya cobró; lo que viene después no cuesta un centavo.
const ESCRITOR_QUE_ENTREGA = `
import fs from 'node:fs';
import path from 'node:path';
const salida = process.argv[process.argv.indexOf('--salida') + 1];
process.stderr.write('  · claude-sonnet-5: 1840 tokens de entrada, 96 de salida (0 de escritura en caché, 0 de lectura de caché)\\n');
process.stderr.write('  · claude-opus-5: 18279 tokens de entrada, 7663 de salida (14827 de escritura en caché, 0 de lectura de caché)\\n');
setTimeout(() => {
  fs.mkdirSync(path.join(salida, 'slides'), { recursive: true });
  fs.writeFileSync(path.join(salida, 'slides', '01.png'), 'png');
  fs.writeFileSync(path.join(salida, 'caption.txt'), 'Cotiza sin perder dinero.');
  fs.writeFileSync(path.join(salida, 'carrusel.json'), JSON.stringify({ slug: 'x', look: 'uno', slides: [{ titulo: 'Cotiza sin perder dinero' }] }));
  console.log(JSON.stringify({ carpeta: salida, laminas: 1, look: 'uno', indice_qa: 92, veredicto_qa: 'publicable' }));
}, 300);
`;
const COSTO_POR_VERSION = 0.3803;   // 0.3756 de la llamada de Opus + 0.0046 de la auxiliar

// Monta un worker completo sobre carpetas temporales: skill de mentira con ese escritor, marca de
// mentira y repositorio en memoria. No sube nada ni toca la red.
function bancoDePruebas({ pedido: cambios = {}, correccion = null, entorno = {}, libro } = {}) {
  const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'tope-'));
  const skill = path.join(raiz, 'skill');
  fs.mkdirSync(path.join(skill, 'scripts'), { recursive: true });
  fs.mkdirSync(path.join(raiz, 'privado'), { recursive: true });
  fs.writeFileSync(path.join(raiz, 'privado', 'MI-MARCA.md'), '# Marca de prueba\n');
  fs.writeFileSync(path.join(skill, 'scripts', 'escribir.mjs'), ESCRITOR_QUE_ENTREGA);
  const config = cargarConfig(['--sin-subir'], {
    SKILL_DIR: skill, PRIVADO_DIR: path.join(raiz, 'privado'), TRABAJO_DIR: path.join(raiz, 'trabajo'),
    ANTHROPIC_API_KEY: 'clave-de-mentira-para-la-prueba', ...entorno,
  });
  const datos = JSON.parse(fs.readFileSync(new URL('./pedido.ejemplo.json', import.meta.url), 'utf8'));
  const pedido = { ...datos.pedido, ...cambios };
  const repo = crearRepositorioSimulado({ pedido, correccion: correccion ? { ...datos.correccion, ...correccion } : null });
  return { raiz, config, pedido, repo, pipeline: crearPipeline({ config, repo, almacen: crearAlmacen(config), libro }) };
}

// DEFECTO CERRADO: la señal de corte llegaba con la línea de consumo, o sea DESPUÉS de que la API cobró:
// mataba al escritor antes de que escribiera carrusel.json y el pedido quedaba con 0 versiones y el
// dinero gastado. Ahora el tope se mira ANTES de arrancar cada versión.
test('el tope por pedido entrega lo que ya se pagó y frena la versión siguiente', async () => {
  const banco = bancoDePruebas({ pedido: { versiones: 4 }, entorno: { COSTO_TOPE_PEDIDO_USD: '0.5' } });
  await banco.pipeline.procesarPedido(await banco.repo.reclamarPedido());
  const final = await banco.repo.pedidoPorId(banco.pedido.id);
  const versiones = await banco.repo.versionesDe(banco.pedido.id);

  assert.equal(versiones.length, 2, 'la v1 y la v2 se pagaron y se entregan; la v3 ya no arranca');
  assert.equal(final.estado, 'listo', 'con versiones entregadas el pedido NO es un error');
  assert.equal(final.costo_usd, Number((COSTO_POR_VERSION * 2).toFixed(4)));
  assert.match(final.error, /Se generaron 2 de 4 versiones/, `el mensaje dice cuántas salieron: ${final.error}`);
  assert.match(final.error, /lleva \$0\.76/, `y cuánto se gastó: ${final.error}`);
  assert.match(final.error, /el tope por pedido es \$0\.50/, `y cuál es el tope: ${final.error}`);
  // Las dos versiones están enteras en disco y apuntadas al modelo que de verdad escribió el carrusel.
  for (const v of versiones) {
    assert.ok(fs.existsSync(path.join(banco.raiz, 'trabajo', banco.pedido.id, `v${v.n}`, 'carrusel.json')));
    assert.equal(v.modelo, 'claude-opus-5');
  }
});

test('con el tope ya rebasado no se gasta ni un centavo más', async () => {
  const banco = bancoDePruebas({ pedido: { versiones: 2, costo_usd: 5 }, entorno: { COSTO_TOPE_PEDIDO_USD: '3' } });
  await banco.pipeline.procesarPedido(await banco.repo.reclamarPedido());
  const final = await banco.repo.pedidoPorId(banco.pedido.id);
  assert.equal((await banco.repo.versionesDe(banco.pedido.id)).length, 0);
  assert.equal(fs.existsSync(path.join(banco.raiz, 'trabajo', banco.pedido.id, 'v1', 'carrusel.json')), false);
  assert.equal(final.estado, 'error', 'sin nada que entregar sí es un error');
  assert.equal(final.costo_usd, 5, 'y no se gastó nada: el escritor ni se lanzó');
  assert.match(final.error, /Se generaron 0 de 2 versiones/);
});

test('una corrección no se lanza si el pedido ya pasó el tope, y el pedido se queda como estaba', async () => {
  const banco = bancoDePruebas({
    pedido: { estado: 'listo', costo_usd: 5 }, correccion: {}, entorno: { COSTO_TOPE_PEDIDO_USD: '3' },
  });
  await banco.repo.reclamarPedido();                       // el pedido ya se procesó antes
  await banco.repo.actualizarPedido(banco.pedido.id, { estado: 'listo' });
  const correccion = { ...JSON.parse(fs.readFileSync(new URL('./pedido.ejemplo.json', import.meta.url), 'utf8')).correccion };
  await banco.pipeline.procesarCorreccion(correccion);
  const final = await banco.repo.pedidoPorId(banco.pedido.id);
  assert.equal(final.estado, 'listo', 'el pedido conserva sus versiones y su estado');
  assert.equal(final.costo_usd, 5, 'la corrección no llamó a la API');
  assert.equal((await banco.repo.versionesDe(banco.pedido.id)).length, 0);
});

// El tope del DÍA no marca nada como error: simplemente no se toma trabajo nuevo, y lo pendiente sigue
// pendiente para mañana.
test('el tope del día no reclama trabajo: los pedidos se quedan pendientes', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dia-'));
  const libro = crearLibroDiario({ dir, topeDiaUsd: 20 });
  libro.anotar(21);
  const espia = { reclamos: 0 };
  const repo = {
    async reclamarPedido() { espia.reclamos += 1; return null; },
    async reclamarCorreccion() { espia.reclamos += 1; return null; },
  };
  assert.equal(await iteracion({}, repo, libro), false);
  assert.equal(espia.reclamos, 0, 'con el día gastado no se le pide trabajo a la base de datos');
  // Con presupuesto sí se reclama.
  const conSaldo = crearLibroDiario({ dir: path.join(dir, 'otro'), topeDiaUsd: 20 });
  assert.equal(await iteracion({}, repo, conSaldo), false);
  assert.equal(espia.reclamos, 2);
});

// DEFECTO CERRADO: arrancar con el día casi gastado solo se veía cuando terminaba el siguiente trabajo,
// que puede tardar media hora. Ahora se avisa en el arranque, antes de tomar nada.
test('el aviso del tope del día sale en el arranque, no al terminar el siguiente trabajo', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'arranque-'));
  const dichos = [];
  const consolaReal = console.log;
  const espiar = (fn) => { console.log = (...p) => dichos.push(p.join(' ')); try { return fn(); } finally { console.log = consolaReal; } };

  const casi = crearLibroDiario({ dir, topeDiaUsd: 20, avisoPct: 80 });
  casi.anotar(19.4);                                    // 97 % del tope
  dichos.length = 0;
  const texto = espiar(() => crearLibroDiario({ dir, topeDiaUsd: 20, avisoPct: 80 }).avisarAlArrancar());
  assert.match(texto, /\$19\.40 de un tope de \$20\.00 \(97 %\)/);
  assert.equal(dichos.filter((l) => /AVISO/.test(l)).length, 1, `tiene que ser un AVISO visible: ${JSON.stringify(dichos)}`);

  // Y con el tope ya alcanzado, el arranque dice que hoy no se toma nada.
  const pasado = crearLibroDiario({ dir: path.join(dir, 'pasado'), topeDiaUsd: 20 });
  pasado.anotar(20.5);
  dichos.length = 0;
  const texto2 = espiar(() => crearLibroDiario({ dir: path.join(dir, 'pasado'), topeDiaUsd: 20 }).avisarAlArrancar());
  assert.match(texto2, /El tope del día YA está alcanzado/);
  assert.match(dichos[0], /AVISO/);

  // Un día tranquilo no grita: informa y ya.
  const tranquilo = crearLibroDiario({ dir: path.join(dir, 'tranquilo'), topeDiaUsd: 20 });
  dichos.length = 0;
  assert.equal(espiar(() => tranquilo.avisarAlArrancar()), null);
  assert.equal(dichos.filter((l) => /AVISO/.test(l)).length, 0);
  assert.match(dichos[0], /Gasto de hoy .*\$0\.00 de un tope de \$20\.00 \(0 %\)/);
});
