#!/usr/bin/env python3
"""referencia.py — Convierte una referencia (link, archivo o texto) en referencia.md para que la skill
parta de ella. Sin dependencias fuera de la librería estándar; usa yt-dlp si está instalado.

  python3 scripts/referencia.py <url-o-archivo> [--out carpeta] [--idioma es]

Soporta:
  · YouTube (video o short)        → transcripción con subtítulos automáticos (yt-dlp)
  · Instagram (/p/, /reel/, /reels/) → si hay APIFY_TOKEN, baja el post con el actor apify/instagram-scraper:
                                     caption, dueño, likes, comentarios, tipo y las láminas a <out>/_referencia/NN.jpg
                                     (un reel además se transcribe). La lectura visual de esas láminas la hace
                                     `node scripts/leer-imagen.mjs <out>/_referencia --out <out>/referencia.md --append`
  · TikTok / Facebook              → si hay APIFY_TOKEN, transcribe el video con el actor
                                     truefetch/video-to-text; si no, deja instrucciones
  · Artículo web (http/https)      → texto principal de la página
  · PDF                            → texto (pdftotext si existe; si no, PyPDF2 si está instalado)
  · .txt / .md                     → tal cual
  · imagen (.png/.jpg)             → no se procesa aquí: Claude la lee directo (visión)
Escribe <out>/referencia.md con metadatos + texto. Nunca inventa: si algo falla, lo dice.
"""
from __future__ import annotations
import argparse, html, ipaddress, json, os, re, shutil, socket, subprocess, sys, tempfile, urllib.error, urllib.parse, urllib.request
from pathlib import Path

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"

BLOQUEO = "Ese enlace no se puede abrir desde el servidor"
SIN_DOMINIO = "No encontré ese dominio; revisa el enlace"
NOMBRES_INTERNOS = ("localhost", "localhost.localdomain", "metadata", "metadata.google.internal")
SUFIJOS_INTERNOS = (".local", ".internal", ".localhost", ".home.arpa", ".lan")


def _ip_interna(direccion: str) -> bool:
    """Loopback, enlace local (incluye 169.254.169.254), privadas y reservadas. Ante la duda, interna."""
    try:
        ip = ipaddress.ip_address(direccion)
    except ValueError:
        return True
    return bool(ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved
                or ip.is_multicast or ip.is_unspecified)


def enlace_bloqueado(url: str) -> str | None:
    """Motivo por el que no se puede abrir el enlace desde el servidor, o None si es seguro.
    Evita que un link pegado en la app sirva para tocar servicios internos o los metadatos de la nube."""
    partes = urllib.parse.urlparse(url)
    if partes.scheme not in ("http", "https"):
        return BLOQUEO
    host = (partes.hostname or "").strip(".").lower()
    if not host or host in NOMBRES_INTERNOS or host.endswith(SUFIJOS_INTERNOS):
        return BLOQUEO
    try:
        ipaddress.ip_address(host)
    except ValueError:
        if "." not in host:  # un nombre sin punto es un vecino de la red interna, no un sitio de internet
            return BLOQUEO
    else:
        return BLOQUEO if _ip_interna(host) else None
    try:
        infos = socket.getaddrinfo(host, partes.port or (443 if partes.scheme == "https" else 80), proto=socket.IPPROTO_TCP)
    except OSError:
        return SIN_DOMINIO
    return BLOQUEO if any(_ip_interna(i[4][0]) for i in infos) else None


class _RedireccionRevisada(urllib.request.HTTPRedirectHandler):
    """Una redirección hacia una dirección interna también se bloquea."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):  # noqa: D102
        if enlace_bloqueado(newurl):
            raise urllib.error.HTTPError(newurl, code, BLOQUEO, headers, fp)
        return super().redirect_request(req, fp, code, msg, headers, newurl)


_ABRIDOR = urllib.request.build_opener(_RedireccionRevisada)


def abrir(req, timeout: int):
    """urlopen con portero: revisa el destino y cada salto de redirección."""
    destino = req.full_url if isinstance(req, urllib.request.Request) else str(req)
    motivo = enlace_bloqueado(destino)
    if motivo:
        raise ValueError(motivo)
    return _ABRIDOR.open(req, timeout=timeout)


def limpiar_vtt(texto: str) -> str:
    lineas, out = texto.splitlines(), []
    for l in lineas:
        if "-->" in l or l.startswith(("WEBVTT", "Kind:", "Language:")) or not l.strip():
            continue
        l = re.sub(r"<[^>]+>", "", l).strip()
        if l and (not out or out[-1] != l):
            out.append(l)
    return " ".join(out)


def youtube(url: str, idioma: str) -> tuple[str, dict]:
    ytdlp = shutil.which("yt-dlp")
    if not ytdlp:
        return "", {"error": "yt-dlp no está instalado (pip install yt-dlp). Pega la transcripción a mano."}
    meta = {}
    try:
        j = subprocess.run([ytdlp, "--skip-download", "--dump-single-json", "--no-warnings", url], capture_output=True, text=True, timeout=120)
        if j.returncode == 0:
            d = json.loads(j.stdout)
            meta = {k: d.get(k) for k in ("title", "uploader", "duration", "upload_date", "view_count", "like_count", "webpage_url")}
    except Exception as e:  # noqa: BLE001
        meta = {"aviso": f"no pude leer metadatos: {e}"}
    with tempfile.TemporaryDirectory() as tmp:
        for langs in (idioma, f"{idioma}-419", "es", "en"):
            r = subprocess.run([ytdlp, "--skip-download", "--write-auto-subs", "--write-subs", "--sub-langs", langs,
                                "--sub-format", "vtt", "--no-warnings", "-o", os.path.join(tmp, "sub"), url],
                               capture_output=True, text=True, timeout=180)
            vtts = sorted(Path(tmp).glob("sub*.vtt"))
            if vtts:
                meta["subtitulos"] = vtts[0].name
                return limpiar_vtt(vtts[0].read_text(encoding="utf8", errors="ignore")), meta
    return "", {**meta, "error": "El video no tiene subtítulos disponibles. Pega la transcripción o el guion."}


def apify_video(url: str, idioma: str) -> tuple[str, dict]:
    token = os.environ.get("APIFY_TOKEN")
    if not token:
        return "", {"error": "Para transcribir reels de Instagram/TikTok/Facebook exporta APIFY_TOKEN (actor truefetch/video-to-text) o pega la transcripción a mano."}
    api = "https://api.apify.com/v2/acts/truefetch~video-to-text/run-sync-get-dataset-items?token=" + token
    body = json.dumps({"video_url": url, "translate": "spanish" if idioma == "es" else idioma}).encode()
    req = urllib.request.Request(api, data=body, headers={"Content-Type": "application/json", "User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            items = json.load(r)
    except Exception as e:  # noqa: BLE001
        return "", {"error": f"Apify falló: {e}"}
    if not items:
        return "", {"error": "Apify no devolvió transcripción."}
    it = items[0]
    texto = it.get("transcript") or it.get("text") or it.get("translated_transcript") or ""
    meta = {k: it.get(k) for k in ("author", "views", "likes", "reactions", "date", "title") if it.get(k) is not None}
    return texto, meta


IG_POST = re.compile(r"instagram\.com/(?:[^/?#]+/)?(?:p|reel|reels)/([A-Za-z0-9_-]+)")


def descargar(url: str, destino: Path) -> bool:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with abrir(req, 120) as r:
            destino.write_bytes(r.read())
        return True
    except Exception:  # noqa: BLE001
        return False


def instagram_post(url: str, out: Path, idioma: str) -> tuple[str, dict]:
    """Post o reel de Instagram con el actor apify/instagram-scraper: caption, dueño, likes, comentarios, tipo
    y las láminas (childPosts[].displayUrl o displayUrl) a <out>/_referencia/NN.jpg. Si el post es un video,
    además intenta la transcripción con truefetch/video-to-text (es un segundo run del actor)."""
    token = os.environ.get("APIFY_TOKEN")
    if not token:
        return "", {"error": "Para leer un post de Instagram exporta APIFY_TOKEN (actor apify/instagram-scraper) o pega el caption y guarda las láminas a mano en _referencia/."}
    api = "https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=" + token
    body = json.dumps({"directUrls": [url], "resultsType": "posts", "resultsLimit": 1}).encode()
    req = urllib.request.Request(api, data=body, headers={"Content-Type": "application/json", "User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            items = json.load(r)
    except Exception as e:  # noqa: BLE001
        return "", {"error": f"Apify (instagram-scraper) falló: {e}"}
    if not items or not isinstance(items, list):
        return "", {"error": "Apify no devolvió el post (¿privado, borrado o URL incorrecta?)."}
    it = items[0]
    if it.get("error"):
        return "", {"error": f"Apify: {it.get('error')} {it.get('errorDescription', '')}".strip()}
    tipo_post = it.get("type") or ("Sidecar" if it.get("childPosts") else "Image")
    meta = {"dueño": it.get("ownerUsername"), "nombre": it.get("ownerFullName"), "tipo_post": tipo_post, "likes": it.get("likesCount"),
            "comentarios": it.get("commentsCount"), "vistas_video": it.get("videoViewCount"), "fecha": it.get("timestamp"), "shortcode": it.get("shortCode")}
    meta = {k: v for k, v in meta.items() if v is not None}
    urls = [c.get("displayUrl") for c in (it.get("childPosts") or []) if c.get("displayUrl")] or ([it["displayUrl"]] if it.get("displayUrl") else [])
    carpeta = out / "_referencia"
    carpeta.mkdir(parents=True, exist_ok=True)
    archivos = [str(carpeta / f"{i:02d}.jpg") for i, u in enumerate(urls, 1) if descargar(u, carpeta / f"{i:02d}.jpg")]
    meta["laminas"] = f"{len(archivos)} de {len(urls)} descargadas en {carpeta}"
    meta["laminas_archivos"] = archivos
    meta["laminas_carpeta"] = str(carpeta)
    texto = (it.get("caption") or "").strip()
    if tipo_post == "Video":
        transcripcion, meta_video = apify_video(url, idioma)
        if transcripcion.strip():
            texto = f"{texto}\n\n[Transcripción del video]\n{transcripcion.strip()}" if texto else transcripcion.strip()
        elif meta_video.get("error"):
            meta["transcripcion"] = meta_video["error"]
    if not texto and not archivos:
        meta["error"] = "El post no trajo caption ni láminas."
    return texto, meta


def articulo(url: str) -> tuple[str, dict]:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "es,en;q=0.8"})
    try:
        with abrir(req, 60) as r:
            raw = r.read().decode(r.headers.get_content_charset() or "utf8", errors="ignore")
    except Exception as e:  # noqa: BLE001
        return "", {"error": f"No pude descargar la página: {e}"}
    titulo = re.search(r"<title[^>]*>(.*?)</title>", raw, re.S | re.I)
    cuerpo = re.search(r"<article[^>]*>(.*?)</article>", raw, re.S | re.I)
    zona = cuerpo.group(1) if cuerpo else re.sub(r"<(script|style|nav|header|footer|aside)[^>]*>.*?</\1>", " ", raw, flags=re.S | re.I)
    parrafos = re.findall(r"<(?:p|h1|h2|h3|li)[^>]*>(.*?)</(?:p|h1|h2|h3|li)>", zona, re.S | re.I)
    limpio = [html.unescape(re.sub(r"<[^>]+>", " ", p)).strip() for p in parrafos]
    limpio = [re.sub(r"\s+", " ", p) for p in limpio if len(p) > 40]
    return "\n\n".join(limpio), {"title": html.unescape(titulo.group(1)).strip() if titulo else None, "url": url}


def pdf(ruta: Path) -> tuple[str, dict]:
    if shutil.which("pdftotext"):
        r = subprocess.run(["pdftotext", "-layout", str(ruta), "-"], capture_output=True, text=True)
        if r.returncode == 0:
            return r.stdout, {"archivo": ruta.name}
    try:
        import PyPDF2  # type: ignore
        with open(ruta, "rb") as f:
            return "\n".join((p.extract_text() or "") for p in PyPDF2.PdfReader(f).pages), {"archivo": ruta.name}
    except Exception:  # noqa: BLE001
        return "", {"error": "No hay pdftotext ni PyPDF2. Instala uno: brew install poppler · pip install PyPDF2"}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("fuente")
    ap.add_argument("--out", default=".")
    ap.add_argument("--idioma", default="es")
    a = ap.parse_args()
    fuente, out = a.fuente.strip(), Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    texto, meta, tipo = "", {}, "texto"
    if re.match(r"https?://", fuente):
        motivo = enlace_bloqueado(fuente)
        if motivo:
            print("AVISO:", motivo, file=sys.stderr)
            return 3
        host = urllib.parse.urlparse(fuente).netloc.lower()
        if "youtube.com" in host or "youtu.be" in host:
            tipo, (texto, meta) = "youtube", youtube(fuente, a.idioma)
        elif "instagram.com" in host and IG_POST.search(fuente):
            tipo, (texto, meta) = "instagram-post", instagram_post(fuente, out, a.idioma)
        elif any(h in host for h in ("instagram.com", "tiktok.com", "facebook.com", "fb.watch")):
            tipo, (texto, meta) = "video-social", apify_video(fuente, a.idioma)
        else:
            tipo, (texto, meta) = "articulo", articulo(fuente)
    else:
        p = Path(fuente)
        if not p.exists():
            tipo, texto = "texto", fuente  # se pasó el texto directo
        elif p.suffix.lower() == ".pdf":
            tipo, (texto, meta) = "pdf", pdf(p)
        elif p.suffix.lower() in (".png", ".jpg", ".jpeg", ".webp"):
            tipo, meta = "imagen", {"archivo": str(p.resolve()), "nota": "Claude la lee directo con visión; describe el carrusel de referencia lámina por lámina."}
        else:
            tipo, texto, meta = "archivo", p.read_text(encoding="utf8", errors="ignore"), {"archivo": p.name}
    palabras = len(texto.split())
    md = ["# Referencia", "", f"- **Tipo:** {tipo}", f"- **Fuente:** {fuente}"]
    for k, v in meta.items():
        if k in ("subtitulos", "laminas_archivos", "laminas_carpeta"):
            continue
        md.append(f"- **{k}:** {v}")
    if tipo == "imagen":
        cuerpo_texto = "_(imagen: Claude la lee con visión y llena la ficha de abajo lámina por lámina)_"
    elif texto.strip():
        cuerpo_texto = texto.strip()
    else:
        cuerpo_texto = "_(sin texto: ver el aviso de arriba; pega aquí la transcripción o el guion)_"
    laminas = []
    if meta.get("laminas_archivos"):
        laminas = ["## Láminas descargadas", ""] + [f"- {p}" for p in meta["laminas_archivos"]] + [
            "", "## Lectura visual", "",
            f"_(pendiente: `node scripts/leer-imagen.mjs \"{meta['laminas_carpeta']}\" --out \"{out / 'referencia.md'}\" --append` la escribe con visión por API; "
            "en Claude Code, mira las láminas y llena aquí la ficha lámina por lámina)_", ""]
    md += [f"- **Palabras:** {palabras}", "", "## Texto", "", cuerpo_texto, "", *laminas,
           "## Ficha de ingeniería inversa (llenar antes de escribir el carrusel)", "",
           "1. **Gancho literal de la referencia:** ", "2. **Promesa (qué se lleva quien la ve):** ",
           "3. **Estructura por roles** (portada / rehook / cuerpo / cheatsheet / cta) y qué hace cada lámina: ",
           "4. **Mecanismo psicológico** (por qué se guarda o se comparte): ", "5. **Qué aplica a MI audiencia y qué no:** ",
           "6. **Ángulo propio, en la voz de la marca** (una frase; no describe el original): ", "",
           "## Tres ganchos puntuados (segura · punzante · lateral)", "", "| Gancho | Fórmula | Especif. | Tensión | Utilidad | Identidad | Verificable | Total |",
           "|---|---|---|---|---|---|---|---|", "|  |  |  |  |  |  |  |  |", "",
           "## Lo que NO se copia", "", "- Texto, imágenes y diseño exacto de la referencia. Se replica el ángulo y la estructura.", ""]
    (out / "referencia.md").write_text("\n".join(md), encoding="utf8")
    print(f"referencia.md → {out / 'referencia.md'} ({tipo}, {palabras} palabras)")
    if meta.get("error"):
        print("AVISO:", meta["error"], file=sys.stderr)
        return 3
    return 0


if __name__ == "__main__":
    sys.exit(main())
