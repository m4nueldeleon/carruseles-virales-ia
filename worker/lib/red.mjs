// red.mjs: portero de las descargas del worker. El contenedor vive en la red interna del servidor, así que
// un enlace escrito en la app no puede servir para tocar servicios internos ni el punto de metadatos del
// proveedor (169.254.169.254). Aquí se decide qué enlace se abre: solo http/https, y solo si el nombre
// resuelve a una dirección pública. Las redirecciones se siguen a mano, comprobando cada salto.
import dns from 'node:dns/promises';
import net from 'node:net';

export const MENSAJE_BLOQUEO = 'Ese enlace no se puede abrir desde el servidor';
export const MENSAJE_SIN_DOMINIO = 'No encontré ese dominio; revisa el enlace';
export const MENSAJE_MUCHOS_SALTOS = 'Ese enlace da demasiadas vueltas (redirecciones) y no llega a ningún lado';

const MAX_SALTOS = 5;
const NOMBRES_PROHIBIDOS = /^(localhost|localhost\.localdomain|ip6-localhost|metadata|metadata\.google\.internal)$/i;
const SUFIJOS_PROHIBIDOS = ['.local', '.internal', '.localhost', '.home.arpa', '.lan'];

const sinCorchetes = (host) => String(host || '').replace(/^\[|\]$/g, '');

// 10/8, 172.16/12, 192.168/16, 127/8, 169.254/16 (enlace local y metadatos de nube) y demás reservados.
function ipv4Interna(dir) {
  const partes = dir.split('.').map(Number);
  if (partes.length !== 4 || partes.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true;
  const [a, b] = partes;
  if (a === 0 || a === 127) return true;                  // «esta red» y loopback
  if (a === 10) return true;                              // privada 10/8
  if (a === 172 && b >= 16 && b <= 31) return true;       // privada 172.16/12
  if (a === 192 && b === 168) return true;                // privada 192.168/16
  if (a === 169 && b === 254) return true;                // enlace local y metadatos de nube
  if (a === 100 && b >= 64 && b <= 127) return true;      // CGNAT 100.64/10
  if (a === 192 && b === 0) return true;                  // 192.0.0/24 y documentación
  if (a === 198 && (b === 18 || b === 19)) return true;   // pruebas de red
  if (a >= 224) return true;                              // multicast y reservados
  return false;
}

// ::1, fc00::/7 (únicas locales), fe80::/10 (enlace local), multicast y las IPv4 disfrazadas de IPv6.
function ipv6Interna(dir) {
  const d = dir.toLowerCase().split('%')[0];
  if (d === '::' || d === '::1') return true;
  if (/^f[cd]/.test(d)) return true;
  if (/^fe[89ab]/.test(d)) return true;
  if (/^ff/.test(d)) return true;
  const mapeada = d.match(/^::(?:ffff:)?(\d+\.\d+\.\d+\.\d+)$/);
  if (mapeada) return ipv4Interna(mapeada[1]);
  return false;
}

// Ante la duda, interna: lo que no se reconoce como dirección pública no se abre.
export function ipInterna(direccion) {
  const dir = sinCorchetes(direccion);
  const familia = net.isIP(dir);
  if (familia === 4) return ipv4Interna(dir);
  if (familia === 6) return ipv6Interna(dir);
  return true;
}

// Nombres que nunca apuntan a internet: localhost, dominios de red interna y hosts sin punto
// (así se llaman los contenedores vecinos dentro de Docker).
export function nombreProhibido(host) {
  const h = sinCorchetes(host).toLowerCase().replace(/\.$/, '');
  if (!h) return true;
  if (NOMBRES_PROHIBIDOS.test(h)) return true;
  if (SUFIJOS_PROHIBIDOS.some((s) => h.endsWith(s))) return true;
  return !h.includes('.') && !net.isIP(h);
}

// Devuelve { ok: true, url } o { ok: false, motivo } con un texto que el equipo puede leer.
export async function revisarEnlace(entrada, { resolver = dns.lookup } = {}) {
  let url;
  try { url = new URL(String(entrada)); } catch { return { ok: false, motivo: MENSAJE_BLOQUEO }; }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return { ok: false, motivo: MENSAJE_BLOQUEO };
  const host = sinCorchetes(url.hostname);
  if (nombreProhibido(host)) return { ok: false, motivo: MENSAJE_BLOQUEO };
  if (net.isIP(host)) return ipInterna(host) ? { ok: false, motivo: MENSAJE_BLOQUEO } : { ok: true, url };
  let direcciones;
  try { direcciones = await resolver(host, { all: true, verbatim: true }); } catch { return { ok: false, motivo: MENSAJE_SIN_DOMINIO }; }
  if (!direcciones.length) return { ok: false, motivo: MENSAJE_SIN_DOMINIO };
  if (direcciones.some((d) => ipInterna(d.address))) return { ok: false, motivo: MENSAJE_BLOQUEO };
  return { ok: true, url };
}

// fetch con portero: revisa el enlace y cada redirección antes de pedirla. Lanza un Error con
// `bloqueado = true` cuando el destino es interno, para que quien llama lo cuente tal cual.
export async function traerSeguro(entrada, { timeoutMs = 60_000, maxSaltos = MAX_SALTOS, ...opciones } = {}) {
  let destino = String(entrada);
  for (let salto = 0; salto <= maxSaltos; salto += 1) {
    const revision = await revisarEnlace(destino);
    if (!revision.ok) {
      const e = new Error(revision.motivo);
      e.bloqueado = true;
      throw e;
    }
    const r = await fetch(revision.url, { ...opciones, redirect: 'manual', signal: AbortSignal.timeout(timeoutMs) });
    const siguiente = r.status >= 300 && r.status < 400 ? r.headers.get('location') : null;
    if (!siguiente) return r;
    destino = new URL(siguiente, revision.url).toString();
  }
  throw new Error(MENSAJE_MUCHOS_SALTOS);
}
