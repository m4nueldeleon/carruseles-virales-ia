// blob.mjs: sube archivos a Vercel Blob con la API REST (el mismo contrato que scripts/lib/banco_nube.py:
// PUT https://blob.vercel-storage.com/<ruta>, Bearer, x-api-version 7, sin sufijo aleatorio, con sobrescritura).
import fs from 'node:fs';
import path from 'node:path';
import { log } from './log.mjs';

const API = 'https://blob.vercel-storage.com';
const TIPOS = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.zip': 'application/zip',
  '.json': 'application/json', '.txt': 'text/plain; charset=utf-8',
};
const INTENTOS = 3;
const TIMEOUT_MS = 120_000;

const tipoDe = (ruta) => TIPOS[path.extname(ruta).toLowerCase()] || 'application/octet-stream';
const tamano = (ruta) => `${Math.max(1, Math.round(fs.statSync(ruta).size / 1024))} KB`;

export async function subirArchivo(rutaLocal, destino, token) {
  const cuerpo = fs.readFileSync(rutaLocal);
  const cabeceras = {
    Authorization: `Bearer ${token}`, 'x-api-version': '7', 'x-content-type': tipoDe(rutaLocal),
    'x-add-random-suffix': '0', 'x-allow-overwrite': '1', 'x-cache-control-max-age': '3600',
  };
  let ultimoError = null;
  for (let intento = 1; intento <= INTENTOS; intento++) {
    try {
      const r = await fetch(`${API}/${destino}`, { method: 'PUT', headers: cabeceras, body: cuerpo, signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (r.ok) return (await r.json()).url;
      ultimoError = new Error(`Vercel Blob ${r.status}: ${(await r.text()).slice(0, 200)}`);
      if (r.status < 500 && r.status !== 429) break; // un 4xx no se arregla reintentando
    } catch (e) {
      ultimoError = e;
    }
    await new Promise((res) => setTimeout(res, 1500 * intento));
  }
  throw ultimoError;
}

export function crearAlmacen({ blobToken, sinSubir }) {
  return Object.freeze({
    async subir(rutaLocal, destino) {
      if (sinSubir) {
        log(`  [SIN SUBIR] ${destino} (${tamano(rutaLocal)})`);
        return null;
      }
      if (!blobToken) throw new Error('No se pudieron subir las imágenes: falta BLOB_READ_WRITE_TOKEN en el servidor');
      return subirArchivo(rutaLocal, destino, blobToken);
    },
  });
}

// Sube las láminas, el preview, la portada chica y el zip de una versión bajo `prefijo` y devuelve las URL.
export async function subirVersion(almacen, carpeta, prefijo, slides) {
  const slidesUrls = [];
  for (const nombre of slides) {
    slidesUrls.push(await almacen.subir(path.join(carpeta, 'slides', nombre), `${prefijo}/slides/${nombre}`));
  }
  const opcional = async (archivo) => (fs.existsSync(path.join(carpeta, archivo))
    ? almacen.subir(path.join(carpeta, archivo), `${prefijo}/${archivo}`)
    : null);
  return {
    slides_urls: slidesUrls.filter(Boolean),
    preview_url: await opcional('preview.jpg'),
    portada_url: await opcional('portada-270.jpg'),
    zip_url: await opcional('carrusel.zip'),
  };
}
