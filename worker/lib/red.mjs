// red.mjs: portero de las descargas del worker. El contenedor vive en la red interna del servidor, así que
// un enlace escrito en la app no puede servir para tocar servicios internos ni el punto de metadatos del
// proveedor (169.254.169.254). Aquí se decide qué enlace se abre: solo http/https, y solo si el nombre
// resuelve a una dirección pública.
//
// Dos reglas que valen la pena entender antes de tocar este archivo:
//
//  1. NO se decide con expresiones regulares sobre el texto de la dirección. Una misma dirección se puede
//     escribir de muchas formas (::ffff:127.0.0.1, ::ffff:7f00:1, ::7f00:1, 64:ff9b::7f00:1, 2130706433,
//     0177.0.0.1, 0x7f000001) y cualquier lista de patrones se queda corta. Aquí la dirección se expande a
//     sus BYTES y la decisión se toma sobre los bytes.
//  2. La conexión se hace a la dirección que YA se aprobó. Si se revisa el nombre y después se deja que la
//     librería lo resuelva otra vez por su cuenta, un dominio con TTL cero puede contestar primero una
//     dirección pública y en la segunda consulta una interna («reenganche de DNS»). Por eso no se usa
//     `fetch`, sino node:http/node:https con un `lookup` fijo que solo devuelve la IP aprobada.
import dns from 'node:dns/promises';
import net from 'node:net';
import http from 'node:http';
import https from 'node:https';
import zlib from 'node:zlib';

export const MENSAJE_BLOQUEO = 'Ese enlace no se puede abrir desde el servidor';
export const MENSAJE_SIN_DOMINIO = 'No encontré ese dominio; revisa el enlace';
export const MENSAJE_MUCHOS_SALTOS = 'Ese enlace da demasiadas vueltas (redirecciones) y no llega a ningún lado';
export const MENSAJE_MUY_GRANDE = 'Ese enlace devuelve un archivo demasiado grande';

const MAX_SALTOS = 5;
const TOPE_BYTES = 64 * 1024 * 1024; // techo duro de lo que se baja de un enlace ajeno
// Sin esto varios CDN contestan 403 (fetch mandaba «node» y Wikimedia, por ejemplo, lo rechaza).
const NAVEGADOR = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';
const NOMBRES_PROHIBIDOS = /^(localhost|localhost\.localdomain|ip6-localhost|ip6-loopback|metadata|metadata\.google\.internal)$/i;
const SUFIJOS_PROHIBIDOS = ['.local', '.internal', '.localhost', '.home.arpa', '.lan'];

const sinCorchetes = (host) => String(host || '').replace(/^\[|\]$/g, '');

// ---------- de texto a bytes ----------

// «127.0.0.1» → [127,0,0,1]. Solo la forma punteada de cuatro octetos decimales sin ceros a la izquierda;
// cualquier otra escritura devuelve null y el portero la trata como interna (ante la duda, se bloquea).
export function bytesIpv4(texto) {
  const partes = String(texto || '').split('.');
  if (partes.length !== 4) return null;
  const bytes = [];
  for (const parte of partes) {
    if (!/^(0|[1-9]\d{0,2})$/.test(parte)) return null;
    const n = Number(parte);
    if (n > 255) return null;
    bytes.push(n);
  }
  return bytes;
}

// Expande una IPv6 a sus 16 bytes. Entiende la forma comprimida («::») y la mixta que termina en IPv4
// («::ffff:127.0.0.1»). Devuelve null si el texto no es una IPv6 completa y bien formada.
export function bytesIpv6(texto) {
  const dir = String(texto || '').toLowerCase().split('%')[0];
  if (!dir.includes(':')) return null;
  const mitades = dir.split('::');
  if (mitades.length > 2) return null;                     // «::» solo puede aparecer una vez
  const trocear = (s) => (s ? s.split(':') : []);
  const cabeza = trocear(mitades[0]);
  const cola = mitades.length === 2 ? trocear(mitades[1]) : [];
  const finales = mitades.length === 2 ? cola : cabeza;
  let cuatro = null;
  if (finales.length && finales.at(-1).includes('.')) {    // forma mixta: el último grupo es una IPv4
    cuatro = bytesIpv4(finales.pop());
    if (!cuatro) return null;
  }
  const necesarios = 8 - (cuatro ? 2 : 0);
  const puestos = cabeza.length + cola.length;
  if (mitades.length === 1 ? puestos !== necesarios : puestos >= necesarios) return null;
  const grupos = [...cabeza, ...new Array(necesarios - puestos).fill('0'), ...cola];
  const bytes = [];
  for (const grupo of grupos) {
    if (!/^[0-9a-f]{1,4}$/.test(grupo)) return null;
    const n = parseInt(grupo, 16);
    bytes.push(n >> 8, n & 0xff);
  }
  if (cuatro) bytes.push(...cuatro);
  return bytes.length === 16 ? bytes : null;
}

// ---------- la decisión, sobre los bytes ----------

// 0/8, 10/8, 127/8, 100.64/10, 169.254/16 (enlace local y metadatos de nube), 172.16/12, 192.0/16,
// 192.168/16, 198.18/15, y de 224 en adelante (multicast, reservado y 255.255.255.255).
function ipv4InternaBytes(bytes) {
  const [a, b] = bytes;
  if (a === 0) return true;                             // «esta red»
  if (a === 10) return true;                            // privada 10/8
  if (a === 127) return true;                           // loopback
  if (a === 100 && b >= 64 && b <= 127) return true;    // 100.64/10: red de operador y de varias nubes
  if (a === 169 && b === 254) return true;              // enlace local y metadatos de nube
  if (a === 172 && b >= 16 && b <= 31) return true;     // privada 172.16/12
  if (a === 192 && b === 0) return true;                // 192.0.0/24 (protocolos) y 192.0.2/24 (documentación)
  if (a === 192 && b === 168) return true;              // privada 192.168/16
  if (a === 198 && (b === 18 || b === 19)) return true; // 198.18/15: pruebas de red
  if (a >= 224) return true;                            // multicast, reservado y difusión
  return false;
}

const ceros = (bytes, desde, hasta) => bytes.slice(desde, hasta).every((n) => n === 0);

// Las IPv4 disfrazadas de IPv6. Devuelve los 4 bytes de la IPv4 escondida, o null si no hay ninguna:
//   ::ffff:a.b.c.d   mapeada     (80 bits en cero + ffff)
//   ::a.b.c.d        compatible  (96 bits en cero; aquí caen también «::» y «::1»)
//   ::ffff:0:a.b.c.d traducida   (SIIT, ::ffff:0:0/96)
//   2002:a.b.c.d::   6to4        (la IPv4 va en los bytes 2..5)
function ipv4Escondida(bytes) {
  if (ceros(bytes, 0, 10) && ((bytes[10] === 0xff && bytes[11] === 0xff) || (bytes[10] === 0 && bytes[11] === 0))) {
    return bytes.slice(12);
  }
  if (ceros(bytes, 0, 8) && bytes[8] === 0xff && bytes[9] === 0xff && bytes[10] === 0 && bytes[11] === 0) {
    return bytes.slice(12);
  }
  if (bytes[0] === 0x20 && bytes[1] === 0x02) return bytes.slice(2, 6);
  return null;
}

// NAT64 (64:ff9b::/32, incluye el 64:ff9b::/96 estándar y el 64:ff9b:1::/48 de uso local), multicast,
// únicas locales, enlace local, y cualquier IPv4 escondida que a su vez sea interna.
function ipv6InternaBytes(bytes) {
  if (bytes[0] === 0x00 && bytes[1] === 0x64 && bytes[2] === 0xff && bytes[3] === 0x9b) return true; // NAT64
  if (bytes[0] === 0xff) return true;                                   // multicast ff00::/8
  if ((bytes[0] & 0xfe) === 0xfc) return true;                          // únicas locales fc00::/7
  if (bytes[0] === 0xfe && (bytes[1] & 0xc0) === 0x80) return true;     // enlace local fe80::/10
  const cuatro = ipv4Escondida(bytes);
  return cuatro ? ipv4InternaBytes(cuatro) : false;
}

// Ante la duda, interna: lo que no se reconoce como dirección pública no se abre.
export function ipInterna(direccion) {
  const dir = sinCorchetes(direccion);
  const familia = net.isIP(dir);
  if (familia === 4) { const b = bytesIpv4(dir); return b ? ipv4InternaBytes(b) : true; }
  if (familia === 6) { const b = bytesIpv6(dir); return b ? ipv6InternaBytes(b) : true; }
  return true;
}

// ---------- el nombre del host ----------

// Una IPv4 se puede escribir sin puntos (2130706433), en octal (0177.0.0.1) o en hexadecimal (0x7f000001).
// El analizador de URL de Node las normaliza a la forma punteada antes de que lleguen aquí (así que
// http://2130706433/ ya se ve como 127.0.0.1 y se bloquea por bytes). Si alguna se colara sin normalizar,
// no se adivina cómo la leería el sistema: se bloquea.
const FORMA_NUMERICA = /^(0x[0-9a-f]+|\d+)(\.(0x[0-9a-f]+|\d+))*$/i;
export function hostNumericoRaro(host) {
  const h = sinCorchetes(host).toLowerCase().replace(/\.$/, '');
  if (!FORMA_NUMERICA.test(h)) return false;
  return net.isIP(h) !== 4 || bytesIpv4(h) === null;
}

// Nombres que nunca apuntan a internet: localhost, dominios de red interna y hosts sin punto
// (así se llaman los contenedores vecinos dentro de Docker).
export function nombreProhibido(host) {
  const h = sinCorchetes(host).toLowerCase().replace(/\.$/, '');
  if (!h) return true;
  if (NOMBRES_PROHIBIDOS.test(h)) return true;
  if (SUFIJOS_PROHIBIDOS.some((s) => h.endsWith(s))) return true;
  if (hostNumericoRaro(h)) return true;
  return !h.includes('.') && !net.isIP(h);
}

// Devuelve { ok: true, url, direcciones } o { ok: false, motivo } con un texto que el equipo puede leer.
// `direcciones` son las IP ya aprobadas: traerSeguro se conecta a una de ellas y a ninguna otra.
export async function revisarEnlace(entrada, { resolver = dns.lookup } = {}) {
  let url;
  try { url = new URL(String(entrada)); } catch { return { ok: false, motivo: MENSAJE_BLOQUEO }; }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return { ok: false, motivo: MENSAJE_BLOQUEO };
  const host = sinCorchetes(url.hostname);
  if (nombreProhibido(host)) return { ok: false, motivo: MENSAJE_BLOQUEO };
  if (net.isIP(host)) {
    return ipInterna(host) ? { ok: false, motivo: MENSAJE_BLOQUEO } : { ok: true, url, direcciones: [host] };
  }
  let resueltas;
  try { resueltas = await resolver(host, { all: true, verbatim: true }); } catch { return { ok: false, motivo: MENSAJE_SIN_DOMINIO }; }
  if (!resueltas.length) return { ok: false, motivo: MENSAJE_SIN_DOMINIO };
  if (resueltas.some((d) => ipInterna(d.address))) return { ok: false, motivo: MENSAJE_BLOQUEO };
  return { ok: true, url, direcciones: resueltas.map((d) => d.address) };
}

// ---------- la descarga, fijada a la dirección aprobada ----------

const SIN_CUERPO = new Set([101, 103, 204, 205, 304]);

function cabecerasDe(brutas) {
  const cabeceras = new Headers();
  for (const [clave, valor] of Object.entries(brutas)) {
    for (const uno of Array.isArray(valor) ? valor : [valor]) {
      try { cabeceras.append(clave, String(uno)); } catch { /* cabecera con nombre inválido: se ignora */ }
    }
  }
  return cabeceras;
}

// Se pide sin comprimir, pero si el servidor comprime de todos modos se descomprime aquí.
function sinComprimir(respuesta) {
  const codigo = String(respuesta.headers['content-encoding'] || '').toLowerCase().trim();
  if (codigo === 'gzip' || codigo === 'x-gzip') return respuesta.pipe(zlib.createGunzip());
  if (codigo === 'deflate') return respuesta.pipe(zlib.createInflate());
  if (codigo === 'br') return respuesta.pipe(zlib.createBrotliDecompress());
  return respuesta;
}

// UNA petición a la dirección ya aprobada. `lookup` devuelve siempre esa IP y solo esa: no hay una segunda
// consulta de DNS entre la revisión y la conexión. El nombre original sigue viajando en la cabecera Host y
// en el saludo TLS, así que el certificado se sigue verificando contra el dominio de verdad.
function pedirFijado(url, ip, { metodo = 'GET', headers = {}, timeoutMs, topeBytes }) {
  const cliente = url.protocol === 'https:' ? https : http;
  const familia = net.isIP(ip);
  const host = sinCorchetes(url.hostname);
  return new Promise((cumplir, fallar) => {
    let cerrado = false;
    const acabar = (fn, valor) => { if (!cerrado) { cerrado = true; clearTimeout(reloj); fn(valor); } };
    const peticion = cliente.request({
      protocol: url.protocol,
      host,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: `${url.pathname}${url.search}`,
      method: metodo,
      headers: { 'user-agent': NAVEGADOR, accept: '*/*', 'accept-encoding': 'identity', ...headers },
      lookup: (_nombre, opciones, listo) => (opciones && opciones.all
        ? listo(null, [{ address: ip, family: familia }])
        : listo(null, ip, familia)),
    }, (respuesta) => {
      const flujo = sinComprimir(respuesta);
      const trozos = [];
      let total = 0;
      flujo.on('data', (trozo) => {
        total += trozo.length;
        if (total <= topeBytes) return trozos.push(trozo);
        respuesta.destroy();
        peticion.destroy();
        acabar(fallar, new Error(MENSAJE_MUY_GRANDE));
      });
      flujo.on('error', (e) => acabar(fallar, e));
      flujo.on('end', () => {
        const estado = respuesta.statusCode;
        const cuerpo = SIN_CUERPO.has(estado) || estado < 200 ? null : Buffer.concat(trozos);
        acabar(cumplir, new Response(cuerpo, {
          status: estado < 200 ? 200 : estado,
          statusText: respuesta.statusMessage || '',
          headers: cabecerasDe(respuesta.headers),
        }));
      });
    });
    const reloj = setTimeout(() => { peticion.destroy(); acabar(fallar, new Error('La descarga tardó demasiado')); }, timeoutMs);
    peticion.on('error', (e) => acabar(fallar, e));
    peticion.end();
  });
}

// Descarga con portero: revisa el enlace y cada redirección antes de pedirla, y se conecta solo a la
// dirección que aprobó. Lanza un Error con `bloqueado = true` cuando el destino es interno, para que quien
// llama lo cuente tal cual. Devuelve un Response normal (r.ok, r.status, r.headers, r.arrayBuffer()).
//
// `resolver` y `pedir` son costuras para las pruebas: cambian de dónde salen las direcciones y quién hace
// la petición, nunca si se revisa. El portero corre igual en cada salto, venga el transporte de donde venga.
export async function traerSeguro(entrada, {
  timeoutMs = 60_000, maxSaltos = MAX_SALTOS, topeBytes = TOPE_BYTES, resolver, pedir = pedirFijado, ...opciones
} = {}) {
  let destino = String(entrada);
  const limite = Date.now() + timeoutMs;
  for (let salto = 0; salto <= maxSaltos; salto += 1) {
    const revision = await revisarEnlace(destino, resolver ? { resolver } : {});
    if (!revision.ok) {
      const e = new Error(revision.motivo);
      e.bloqueado = true;
      throw e;
    }
    const restante = Math.max(1_000, limite - Date.now());
    const r = await pedir(revision.url, revision.direcciones[0], { ...opciones, timeoutMs: restante, topeBytes });
    const siguiente = r.status >= 300 && r.status < 400 ? r.headers.get('location') : null;
    if (!siguiente) return r;
    destino = new URL(siguiente, revision.url).toString();
  }
  throw new Error(MENSAJE_MUCHOS_SALTOS);
}
