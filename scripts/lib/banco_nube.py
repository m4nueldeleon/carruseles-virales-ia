"""banco_nube.py — sube y baja el banco de fotos a un almacén con URL pública (Vercel Blob).

Por qué: la skill corre en varias máquinas (laptop, servidor, agente remoto) y en claude.ai;
el banco debe estar siempre accesible por URL. Vercel Blob da URLs públicas estables y
se sube por API con un solo token (BLOB_READ_WRITE_TOKEN).

Token: variable de entorno BLOB_READ_WRITE_TOKEN o archivo ~/.vercel-blob-cli/.env con
BLOB_READ_WRITE_TOKEN=... (y opcional BLOB_BASE_URL=https://<store>.public.blob.vercel-storage.com).
"""
from __future__ import annotations

import json
import mimetypes
import os
import re
import secrets
import urllib.request
from pathlib import Path

API = "https://blob.vercel-storage.com"
ARCHIVO_ENV = Path.home() / ".vercel-blob-cli" / ".env"
EXT_SUBIBLES = {".jpg", ".jpeg", ".png", ".json", ".webp"}


def leer_env() -> dict:
    """Lee ~/.vercel-blob-cli/.env sin dependencias; el entorno del proceso tiene prioridad."""
    valores = {}
    if ARCHIVO_ENV.exists():
        for linea in ARCHIVO_ENV.read_text(encoding="utf-8").splitlines():
            if "=" in linea and not linea.lstrip().startswith("#"):
                clave, _, valor = linea.partition("=")
                valores[clave.strip()] = valor.strip().strip('"')
    return {**valores, **{k: v for k, v in os.environ.items() if k.startswith("BLOB_")}}


def token_o_error() -> str:
    token = leer_env().get("BLOB_READ_WRITE_TOKEN")
    if not token:
        raise SystemExit("Falta BLOB_READ_WRITE_TOKEN (entorno o ~/.vercel-blob-cli/.env). Crea un store público: vercel blob create-store <nombre> --access public")
    return token


def subir_archivo(ruta: Path, destino: str, token: str) -> str:
    """PUT a Vercel Blob; devuelve la URL pública. Sobrescribe si ya existe (mismo nombre, sin sufijo)."""
    tipo = mimetypes.guess_type(ruta.name)[0] or "application/octet-stream"
    peticion = urllib.request.Request(f"{API}/{destino}", data=ruta.read_bytes(), method="PUT", headers={
        "Authorization": f"Bearer {token}", "x-api-version": "7", "x-content-type": tipo,
        "x-add-random-suffix": "0", "x-allow-overwrite": "1", "x-cache-control-max-age": "300",
    })
    with urllib.request.urlopen(peticion, timeout=120) as respuesta:
        return json.loads(respuesta.read().decode("utf-8"))["url"]


ROBOTS = "User-agent: *\nDisallow: /\n"  # el dominio del almacén no se indexa: público por URL, invisible para buscadores


def listar_blobs(prefijo: str, token: str) -> list:
    """Lista los blobs bajo un prefijo (paginado)."""
    urls, cursor = [], None
    while True:
        q = f"?prefix={prefijo}&limit=1000" + (f"&cursor={cursor}" if cursor else "")
        peticion = urllib.request.Request(f"{API}/{q}", headers={"Authorization": f"Bearer {token}", "x-api-version": "7"})
        with urllib.request.urlopen(peticion, timeout=60) as r:
            datos = json.loads(r.read().decode("utf-8"))
        urls += [b["url"] for b in datos.get("blobs", [])]
        if not datos.get("hasMore"):
            return urls
        cursor = datos.get("cursor")


def borrar_blobs(urls: list, token: str) -> int:
    """Borra blobs por URL, de 100 en 100."""
    for i in range(0, len(urls), 100):
        cuerpo = json.dumps({"urls": urls[i:i + 100]}).encode("utf-8")
        peticion = urllib.request.Request(f"{API}/delete", data=cuerpo, method="POST", headers={"Authorization": f"Bearer {token}", "x-api-version": "7", "Content-Type": "application/json"})
        with urllib.request.urlopen(peticion, timeout=120) as r:
            r.read()
    return len(urls)


def nuevo_prefijo() -> str:
    """Prefijo impredecible: la rotación deja sin efecto cualquier URL vieja que se haya filtrado."""
    return f"banco-{secrets.token_hex(6)}"


def prefijo_de(base_url: str | None) -> str | None:
    if not base_url:
        return None
    return base_url.rstrip("/").rsplit("/", 1)[-1] or None


def actualizar_mi_marca(ruta: Path, base_url: str) -> bool:
    """Reemplaza la URL entre acentos graves de la línea **banco_url:** de la ficha."""
    if not ruta.exists():
        return False
    texto = ruta.read_text(encoding="utf-8")
    nuevo = re.sub(r"(\*\*banco_url:\*\*\s*`)[^`]+(`)", lambda m: m.group(1) + base_url + m.group(2), texto, count=1)
    if nuevo == texto:
        return False
    ruta.write_text(nuevo, encoding="utf-8")
    return True


def archivos_del_banco(banco: Path) -> list:
    return [p for p in sorted(banco.rglob("*")) if p.is_file() and p.suffix.lower() in EXT_SUBIBLES and "_entrada" not in p.parts and not p.name.startswith(".")]


def subir_banco(banco: Path, prefijo: str, catalogo: dict, rotar: bool = False, mi_marca: Path | None = None) -> dict:
    """Sube fotos, recortes y avatares; devuelve el catálogo con `url` por archivo y `base_url`.

    Con `rotar`, sube todo bajo un prefijo nuevo impredecible, borra el prefijo anterior y
    actualiza `banco_url` en la ficha (`mi_marca`). Siempre publica robots.txt (Disallow: /)."""
    token = token_o_error()
    prefijo_viejo = prefijo_de(catalogo.get("base_url"))
    if rotar:
        prefijo = nuevo_prefijo()
    urls = {}
    for ruta in archivos_del_banco(banco):
        if ruta.name == "catalogo.json":
            continue
        relativo = ruta.relative_to(banco).as_posix()
        urls[relativo] = subir_archivo(ruta, f"{prefijo}/{relativo}", token)
        print(f"↑ {relativo}")
    fotos = {n: {**f, "url": urls.get(n), "recorte_url": urls.get(f.get("recorte") or "")} for n, f in catalogo.get("fotos", {}).items()}
    avatares = {n: {**a, "url": urls.get(f"avatares/{n}"), "recorte_url": urls.get(a.get("recorte") or "")} for n, a in catalogo.get("avatares", {}).items()}
    base = urls[next(iter(urls))].rsplit(f"/{prefijo}/", 1)[0] + f"/{prefijo}" if urls else catalogo.get("base_url")
    nuevo = {**catalogo, "base_url": base, "fotos": fotos, "avatares": avatares}
    ruta_catalogo = banco / "catalogo.json"
    ruta_catalogo.write_text(json.dumps(nuevo, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    subir_archivo(ruta_catalogo, f"{prefijo}/catalogo.json", token)
    print(f"↑ catalogo.json → {base}/catalogo.json")
    robots = banco / "_entrada" / "robots.txt"
    robots.parent.mkdir(exist_ok=True)
    robots.write_text(ROBOTS, encoding="utf-8")
    subir_archivo(robots, "robots.txt", token)
    if rotar and prefijo_viejo and prefijo_viejo != prefijo:
        borrados = borrar_blobs(listar_blobs(prefijo_viejo + "/", token), token)
        print(f"✂ prefijo anterior «{prefijo_viejo}» borrado ({borrados} archivos)")
    if mi_marca and base:
        print("✎ banco_url actualizado en la ficha" if actualizar_mi_marca(mi_marca, base) else "· la ficha no tiene línea **banco_url:** con URL entre acentos graves; anótala a mano")
    return nuevo


def bajar_banco(banco: Path, base_url: str) -> int:
    """Descarga catalogo.json y todo lo que referencia (fotos, recortes, avatares) a la carpeta local."""
    banco.mkdir(parents=True, exist_ok=True)
    with urllib.request.urlopen(f"{base_url.rstrip('/')}/catalogo.json", timeout=60) as r:
        catalogo = json.loads(r.read().decode("utf-8"))
    (banco / "catalogo.json").write_text(json.dumps(catalogo, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    pendientes = []
    for nombre, f in catalogo.get("fotos", {}).items():
        pendientes += [(nombre, f.get("url")), (f.get("recorte"), f.get("recorte_url"))]
    for nombre, a in catalogo.get("avatares", {}).items():
        pendientes += [(f"avatares/{nombre}", a.get("url")), (a.get("recorte"), a.get("recorte_url"))]
    bajados = 0
    for relativo, url in pendientes:
        if not relativo or not url:
            continue
        destino = banco / relativo
        if destino.exists():
            continue
        destino.parent.mkdir(parents=True, exist_ok=True)
        with urllib.request.urlopen(url, timeout=120) as r:
            destino.write_bytes(r.read())
        bajados += 1
        print(f"↓ {relativo}")
    return bajados
