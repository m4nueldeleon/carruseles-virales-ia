#!/usr/bin/env python3
"""banco-fotos.py — cosecha, cura y recorta fotos reales del usuario para el banco de la skill.

El banco vive fuera del repo (carpeta privada del usuario, p. ej. Carruseles/assets/fotos/reales).
Flujo:
  1. cosechar   → copia candidatas desde álbumes de Fotos (macOS) o carpetas del disco a _entrada/
  2. hoja       → hojas de contacto numeradas para elegir mirando (Claude o el usuario)
  3. curar      → acepta con nombre (slug), rechaza el resto; entra al catálogo
  4. recortar   → PNG con alfa por foto (rembg birefnet-portrait local o Higgsfield remove_background)
  5. anotar     → situación, fondo, lado del sujeto, looks y temas (lo que la skill usa para elegir)
  6. catalogo   → resumen para decidir qué foto va en cada lámina

Uso:
  banco-fotos.py cosechar --album "Estudio 2026" --album "Eventos" [--max 60] [--paso 2]
  banco-fotos.py cosechar --carpeta ~/Fotos/Sesion [--max 60]
  banco-fotos.py hoja
  banco-fotos.py curar --aceptar "3:traje-azul-brazos-cruzados,7:camisa-blanca-riendo" [--rechazar-resto]
  banco-fotos.py recortar --todos | real-01 real-02  [--motor rembg|higgsfield]
  banco-fotos.py anotar real-01 --situacion "..." --fondo "azul liso" --sujeto centro --looks guia-rapida,noticia --temas ventas
  banco-fotos.py catalogo
  banco-fotos.py avatar avatar-01-vector.png --estilo vector --look guia-rapida --pose "brazos cruzados" --origen <job_id>
  banco-fotos.py subir [--rotar --mi-marca MI-MARCA.md]   # Vercel Blob; --rotar cambia el prefijo y borra el viejo
  banco-fotos.py bajar https://<store>.public.blob.vercel-storage.com/banco   # en otra máquina
Opciones globales: --banco <carpeta>  (por omisión ./assets/fotos/reales)
"""
from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

try:
    from PIL import Image, ImageDraw
except ImportError:  # subir/bajar no la necesitan; el resto avisa al usarla
    Image = ImageDraw = None


def exigir_pillow() -> None:
    if Image is None:
        sys.exit("Falta Pillow para este comando: pip3 install pillow")

EXT_FOTO = {".jpg", ".jpeg", ".png", ".heic", ".heif", ".tif", ".tiff", ".webp"}
EXT_VIDEO = {".mov", ".mp4", ".m4v"}
LADO_MIN = 900          # px en el lado largo; menos es miniatura o captura vieja
LADO_MAX_BANCO = 3000   # se reduce al aceptar; sobra para recortes y láminas 1080x1350
ANCHOS_PANTALLA = {750, 828, 1080, 1125, 1170, 1179, 1206, 1242, 1284, 1290, 1320}
MODELO_REMBG = "birefnet-portrait"  # el único que respetó traje oscuro sobre fondo oscuro en las pruebas


# ---------- utilidades ----------

def cargar_catalogo(banco: Path) -> dict:
    ruta = banco / "catalogo.json"
    if ruta.exists():
        return json.loads(ruta.read_text(encoding="utf-8"))
    return {"nota": "Fotos reales del usuario. Cada entrada: origen, medidas, situación, fondo, lado del sujeto, looks y temas afines, recorte.", "fotos": {}}


def guardar_catalogo(banco: Path, catalogo: dict) -> None:
    (banco / "catalogo.json").write_text(json.dumps(catalogo, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def cargar_entrada(entrada: Path) -> list:
    ruta = entrada / "entrada.json"
    return json.loads(ruta.read_text(encoding="utf-8")) if ruta.exists() else []


def guardar_entrada(entrada: Path, lista: list) -> None:
    (entrada / "entrada.json").write_text(json.dumps(lista, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def md5(ruta: Path) -> str:
    h = hashlib.md5()
    with ruta.open("rb") as f:
        for bloque in iter(lambda: f.read(1 << 20), b""):
            h.update(bloque)
    return h.hexdigest()


def a_jpeg(origen: Path, destino: Path) -> bool:
    """HEIC/TIFF/WebP → JPEG con sips (macOS) o Pillow. Devuelve False si no se pudo."""
    if origen.suffix.lower() in {".jpg", ".jpeg"}:
        shutil.copy2(origen, destino)
        return True
    if shutil.which("sips"):
        r = subprocess.run(["sips", "-s", "format", "jpeg", str(origen), "--out", str(destino)], capture_output=True)
        if r.returncode == 0 and destino.exists():
            return True
    try:
        Image.open(origen).convert("RGB").save(destino, quality=95)
        return True
    except Exception:
        return False


def reducir_y_guardar(origen: Path, destino: Path) -> tuple:
    with Image.open(origen) as im:
        im = im.convert("RGB")
        im.thumbnail((LADO_MAX_BANCO, LADO_MAX_BANCO))
        im.save(destino, quality=92)
        return im.size


def es_captura(ruta: Path, ancho: int, alto: int) -> bool:
    nombre = ruta.name.lower()
    if nombre.startswith(("screenshot", "captura", "screen shot")):
        return True
    return ruta.suffix.lower() == ".png" and min(ancho, alto) in ANCHOS_PANTALLA


# ---------- cosechar ----------

def exportar_album(album: str, destino: Path, maximo: int, paso: int) -> str:
    """Exporta fotos (no videos) de un álbum de Fotos.app vía AppleScript. Requiere macOS."""
    guion = f'''
tell application "Photos"
  set mi to media items of album "{album}"
  set sel to {{}}
  set n to 0
  repeat with i from 1 to (count of mi) by {paso}
    set x to item i of mi
    set fn to filename of x
    if fn is not missing value and (length of fn) > 4 then
      set ext to text -3 thru -1 of fn
      if (ext is not "MOV") and (ext is not "MP4") and (ext is not "M4V") then
        set end of sel to x
        set n to n + 1
        if n ≥ {maximo} then exit repeat
      end if
    end if
  end repeat
  export sel to (POSIX file "{destino}" as alias)
  return (count of sel)
end tell'''
    r = subprocess.run(["osascript", "-e", guion], capture_output=True, text=True, timeout=1800)
    if r.returncode != 0:
        return f"ERROR álbum «{album}»: {r.stderr.strip()[:200]}"
    return f"álbum «{album}»: {r.stdout.strip()} exportadas"


def listar_carpeta(carpeta: Path, maximo: int, paso: int = 1) -> list:
    rutas = [p for p in sorted(carpeta.rglob("*")) if p.is_file() and p.suffix.lower() in EXT_FOTO and not p.name.startswith(".")]
    return rutas[::max(1, paso)][:maximo]


def incorporar(rutas: list, origen_tag: str, entrada: Path, lista: list, sin_filtro: bool) -> tuple:
    """Copia candidatas a _entrada/ como entrada-NNN.jpg; salta capturas, chicas y duplicadas."""
    vistos = {e["md5"] for e in lista}
    nuevas, saltadas = [], 0
    n = len(lista)
    for ruta in rutas:
        firma = md5(ruta)
        if firma in vistos:
            saltadas += 1
            continue
        n += 1
        destino = entrada / f"entrada-{n:03d}.jpg"
        if not a_jpeg(ruta, destino):
            n -= 1
            saltadas += 1
            continue
        ancho, alto = reducir_y_guardar(destino, destino)
        if not sin_filtro and (max(ancho, alto) < LADO_MIN or es_captura(ruta, ancho, alto)):
            destino.unlink()
            n -= 1
            saltadas += 1
            continue
        vistos.add(firma)
        nuevas.append({"n": n, "archivo": destino.name, "origen": f"{origen_tag}:{ruta}", "ancho": ancho, "alto": alto, "md5": firma})
    return nuevas, saltadas


def cmd_cosechar(args) -> None:
    exigir_pillow()
    entrada = args.banco / "_entrada"
    entrada.mkdir(parents=True, exist_ok=True)
    lista = cargar_entrada(entrada)
    total_nuevas, total_saltadas = 0, 0
    for album in args.album or []:
        with tempfile.TemporaryDirectory() as tmp:
            print(exportar_album(album, Path(tmp), args.max, args.paso))
            nuevas, saltadas = incorporar(listar_carpeta(Path(tmp), args.max), f"fototeca:{album}", entrada, lista, args.sin_filtro)
            lista = lista + nuevas
            total_nuevas += len(nuevas)
            total_saltadas += saltadas
    for carpeta in args.carpeta or []:
        rutas = listar_carpeta(Path(carpeta).expanduser(), args.max, args.paso)
        nuevas, saltadas = incorporar(rutas, "disco", entrada, lista, args.sin_filtro)
        lista = lista + nuevas
        total_nuevas += len(nuevas)
        total_saltadas += saltadas
    guardar_entrada(entrada, lista)
    print(f"{total_nuevas} candidatas nuevas en {entrada} · {total_saltadas} saltadas (capturas, chicas, repetidas) · {len(lista)} en total")
    print("Siguiente: banco-fotos.py hoja  → mira las hojas y elige con curar --aceptar")


# ---------- hoja de contacto ----------

def cmd_hoja(args) -> None:
    exigir_pillow()
    entrada = args.banco / "_entrada"
    lista = cargar_entrada(entrada)
    if not lista:
        sys.exit("No hay candidatas: corre cosechar primero.")
    por_hoja, cols, lado = 24, 6, 300
    for h in range(0, len(lista), por_hoja):
        grupo = lista[h:h + por_hoja]
        filas = (len(grupo) + cols - 1) // cols
        hoja = Image.new("RGB", (cols * (lado + 10) + 10, filas * (lado + 46) + 10), "white")
        dib = ImageDraw.Draw(hoja)
        for i, e in enumerate(grupo):
            with Image.open(entrada / e["archivo"]) as im:
                im = im.convert("RGB")
                im.thumbnail((lado, lado))
                x, y = 10 + (i % cols) * (lado + 10), 10 + (i // cols) * (lado + 46)
                hoja.paste(im, (x, y + 36))
            dib.rectangle([x, y, x + 64, y + 30], fill="black")
            dib.text((x + 8, y + 8), f"#{e['n']}", fill="white")
            dib.text((x + 72, y + 8), f"{e['ancho']}x{e['alto']} {e['origen'].split(':')[0]}", fill="black")
        salida = entrada / f"hoja-{h // por_hoja + 1}.jpg"
        hoja.save(salida, quality=82)
        print(salida)
    print("Elige mirando: qué fotos son del usuario, nítidas, con fondo limpio y pose útil (a cámara, señalando, explicando, riendo).")


# ---------- curar ----------

def siguiente_indice(catalogo: dict) -> int:
    usados = [int(k.split("-")[1]) for k in catalogo["fotos"] if k.startswith("real-") and k.split("-")[1].isdigit()]
    return (max(usados) + 1) if usados else 1


def cmd_curar(args) -> None:
    exigir_pillow()
    entrada = args.banco / "_entrada"
    lista = cargar_entrada(entrada)
    por_n = {e["n"]: e for e in lista}
    catalogo = cargar_catalogo(args.banco)
    idx = siguiente_indice(catalogo)
    aceptados = set()
    for par in [p.strip() for p in args.aceptar.split(",") if p.strip()]:
        n_txt, _, slug = par.partition(":")
        n = int(n_txt)
        if n not in por_n:
            print(f"#{n} no existe en _entrada; se ignora")
            continue
        slug = slug or f"foto-{n}"
        nombre = f"real-{idx:02d}-{slug}.jpg"
        ancho, alto = reducir_y_guardar(entrada / por_n[n]["archivo"], args.banco / nombre)
        catalogo["fotos"][nombre] = {"origen": por_n[n]["origen"], "ancho": ancho, "alto": alto, "situacion": "", "fondo": "", "sujeto": "", "texto_libre": "", "looks": [], "temas": [], "recorte": None, "media_id_higgsfield": None}
        aceptados.add(n)
        idx += 1
        print(f"aceptada #{n} → {nombre}")
    guardar_catalogo(args.banco, catalogo)
    for n in aceptados:
        (entrada / por_n[n]["archivo"]).unlink(missing_ok=True)
    restantes = [e for e in lista if e["n"] not in aceptados]
    if args.rechazar_resto:
        for e in restantes:
            (entrada / e["archivo"]).unlink(missing_ok=True)
        for hoja in entrada.glob("hoja-*.jpg"):
            hoja.unlink()
        restantes = []
        print("resto rechazado y borrado de _entrada")
    guardar_entrada(entrada, restantes)
    print("Siguiente: banco-fotos.py recortar --todos  y  anotar <nombre> --situacion ...")


# ---------- recortar ----------

def solo_silueta_principal(alfa: "Image.Image") -> "Image.Image":
    """Borra las manchas sueltas del recorte y deja la mancha más grande (el sujeto).

    Los recortadores dejan trozos del fondo original flotando (un mueble oscuro, un
    reflejo). En una lámina se ven como bloques de color sin explicación. Se recorre el
    mapa a 1/8 para que sea barato y se escala la máscara de vuelta."""
    ancho, alto = alfa.size
    escala = max(1, max(ancho, alto) // 400)
    chico = alfa.resize((max(1, ancho // escala), max(1, alto // escala)), Image.NEAREST)
    w, h = chico.size
    px = [1 if v > 60 else 0 for v in chico.getdata()]
    etiqueta = [0] * (w * h)
    mejor, mejor_tam, marca = None, 0, 0
    for inicio in range(w * h):
        if not px[inicio] or etiqueta[inicio]:
            continue
        marca += 1
        pila, tam, celdas = [inicio], 0, []
        etiqueta[inicio] = marca
        while pila:
            i = pila.pop()
            tam += 1
            celdas.append(i)
            x, y = i % w, i // w
            for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if 0 <= nx < w and 0 <= ny < h:
                    j = ny * w + nx
                    if px[j] and not etiqueta[j]:
                        etiqueta[j] = marca
                        pila.append(j)
        if tam > mejor_tam:
            mejor, mejor_tam = celdas, tam
    if not mejor or mejor_tam == sum(px):
        return alfa
    mascara = Image.new("L", (w, h), 0)
    datos = mascara.load()
    for i in mejor:
        datos[i % w, i // w] = 255
    grande = mascara.resize((ancho, alto), Image.BILINEAR).point(lambda v: 255 if v > 110 else 0)
    return Image.eval(Image.merge("L", [alfa]), lambda v: v) if False else Image.composite(alfa, Image.new("L", alfa.size, 0), grande)


def limpiar_alfa(ruta: Path) -> None:
    """Quita halos, restos semitransparentes y manchas sueltas; recorta al sujeto con margen."""
    with Image.open(ruta) as im:
        im = im.convert("RGBA")
        alfa = im.getchannel("A").point(lambda a: 0 if a < 40 else (255 if a > 215 else a))
        alfa = solo_silueta_principal(alfa)
        im.putalpha(alfa)
        caja = alfa.getbbox()
        if caja:
            margen = int(0.02 * max(im.size))
            caja = (max(0, caja[0] - margen), max(0, caja[1] - margen), min(im.width, caja[2] + margen), min(im.height, caja[3] + margen))
            im = im.crop(caja)
        im.save(ruta)


def recortar_rembg(origen: Path, destino: Path) -> str:
    if not shutil.which("uvx"):
        return "falta uv (curl -LsSf https://astral.sh/uv/install.sh | sh) o usa --motor higgsfield"
    cmd = ["uvx", "--python", "3.12", "--from", "rembg[cpu,cli]", "rembg", "i", "-m", MODELO_REMBG, str(origen), str(destino)]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=900)
    if r.returncode != 0 or not destino.exists():
        return f"rembg falló: {r.stderr.strip()[-300:]}"
    limpiar_alfa(destino)
    return "ok"


def cmd_recortar(args) -> None:
    exigir_pillow()
    catalogo = cargar_catalogo(args.banco)
    nombres = list(catalogo["fotos"]) if args.todos else args.nombres
    if not nombres:
        sys.exit("Indica nombres (real-01 ...) o --todos")
    carpeta = args.banco / "recortes"
    carpeta.mkdir(exist_ok=True)
    if args.motor == "higgsfield":
        print("Vía Higgsfield (desde Claude Code): media_upload {filename} → curl PUT → media_confirm → remove_background {media_id, media_type:'image'} → descarga el PNG a recortes/<nombre>-recorte.png y anota `recorte` en catalogo.json.")
        return
    for nombre in nombres:
        clave = next((k for k in catalogo["fotos"] if k.startswith(nombre)), None)
        if not clave:
            print(f"{nombre}: no está en el catálogo")
            continue
        destino = carpeta / (Path(clave).stem + "-recorte.png")
        estado = recortar_rembg(args.banco / clave, destino)
        if estado == "ok":
            catalogo["fotos"][clave] = {**catalogo["fotos"][clave], "recorte": f"recortes/{destino.name}"}
        print(f"{clave}: {estado}")
    guardar_catalogo(args.banco, catalogo)


# ---------- anotar / catálogo ----------

def cmd_anotar(args) -> None:
    catalogo = cargar_catalogo(args.banco)
    clave = next((k for k in catalogo["fotos"] if k.startswith(args.nombre)), None)
    if not clave:
        sys.exit(f"{args.nombre} no está en el catálogo")
    cambios = {k: v for k, v in {"situacion": args.situacion, "fondo": args.fondo, "sujeto": args.sujeto, "texto_libre": args.texto_libre}.items() if v}
    if args.looks:
        cambios["looks"] = [x.strip() for x in args.looks.split(",") if x.strip()]
    if args.temas:
        cambios["temas"] = [x.strip() for x in args.temas.split(",") if x.strip()]
    catalogo["fotos"][clave] = {**catalogo["fotos"][clave], **cambios}
    guardar_catalogo(args.banco, catalogo)
    print(f"{clave}: {json.dumps(cambios, ensure_ascii=False)}")


def cmd_catalogo(args) -> None:
    catalogo = cargar_catalogo(args.banco)
    if not catalogo["fotos"]:
        sys.exit("Catálogo vacío.")
    for nombre, f in catalogo["fotos"].items():
        rec = "✓ recorte" if f.get("recorte") else "sin recorte"
        print(f"{nombre} · {f.get('situacion') or '(sin anotar)'} · fondo {f.get('fondo') or '?'} · sujeto {f.get('sujeto') or '?'} · looks {','.join(f.get('looks') or []) or '?'} · {rec}")


# ---------- nube ----------

def cmd_subir(args) -> None:
    sys.path.insert(0, str(Path(__file__).resolve().parent / "lib"))
    from banco_nube import subir_banco
    mi_marca = Path(args.mi_marca).expanduser() if args.mi_marca else None
    catalogo = cargar_catalogo(args.banco)
    from banco_nube import prefijo_de
    # sin --prefijo explícito, se sube al prefijo que ya tiene el banco (si rotó, al rotado); si no, al default
    prefijo = args.prefijo if args.prefijo_explicito else (prefijo_de(catalogo.get("base_url")) or args.prefijo)
    nuevo = subir_banco(args.banco, prefijo, catalogo, rotar=args.rotar, mi_marca=mi_marca)
    print(f"Banco en la nube: {nuevo['base_url']}/catalogo.json" + ("" if mi_marca else " — pon esa URL en MI-MARCA.md (banco_url)."))


def cmd_bajar(args) -> None:
    sys.path.insert(0, str(Path(__file__).resolve().parent / "lib"))
    from banco_nube import bajar_banco
    print(f"{bajar_banco(args.banco, args.base_url)} archivos nuevos en {args.banco}")


def cmd_avatar(args) -> None:
    """Registra un avatar ya generado (PNG en avatares/) con su estilo, look y origen."""
    catalogo = cargar_catalogo(args.banco)
    carpeta = args.banco / "avatares"
    if not (carpeta / args.archivo).exists():
        sys.exit(f"No existe {carpeta / args.archivo}")
    recorte = f"avatares/{Path(args.archivo).stem}-recorte.png"
    entrada = {"estilo": args.estilo, "look": args.look, "pose": args.pose or "", "origen": args.origen or "", "referencias": [r.strip() for r in (args.referencias or "").split(",") if r.strip()], "recorte": recorte if (args.banco / recorte).exists() else None}
    catalogo = {**catalogo, "avatares": {**catalogo.get("avatares", {}), args.archivo: entrada}}
    guardar_catalogo(args.banco, catalogo)
    print(f"avatar {args.archivo}: {json.dumps(entrada, ensure_ascii=False)}")


# ---------- CLI ----------

def construir_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--banco", type=Path, default=Path("assets/fotos/reales"))
    sub = p.add_subparsers(dest="cmd", required=True)
    c = sub.add_parser("cosechar")
    c.add_argument("--album", action="append")
    c.add_argument("--carpeta", action="append")
    c.add_argument("--max", type=int, default=60)
    c.add_argument("--paso", type=int, default=1, help="toma 1 de cada N (álbum o carpeta) para abarcar más variedad")
    c.add_argument("--sin-filtro", action="store_true")
    c.set_defaults(fn=cmd_cosechar)
    sub.add_parser("hoja").set_defaults(fn=cmd_hoja)
    cu = sub.add_parser("curar")
    cu.add_argument("--aceptar", required=True, help='"3:slug,7:slug"')
    cu.add_argument("--rechazar-resto", action="store_true")
    cu.set_defaults(fn=cmd_curar)
    r = sub.add_parser("recortar")
    r.add_argument("nombres", nargs="*")
    r.add_argument("--todos", action="store_true")
    r.add_argument("--motor", choices=["rembg", "higgsfield"], default="rembg")
    r.set_defaults(fn=cmd_recortar)
    a = sub.add_parser("anotar")
    a.add_argument("nombre")
    for campo in ("situacion", "fondo", "sujeto", "texto_libre", "looks", "temas"):
        a.add_argument(f"--{campo}")
    a.set_defaults(fn=cmd_anotar)
    sub.add_parser("catalogo").set_defaults(fn=cmd_catalogo)
    su = sub.add_parser("subir", help="sube el banco a Vercel Blob y escribe las URL en el catálogo")
    su.add_argument("--prefijo", default="banco", help="carpeta en el almacén; sin él se reutiliza el prefijo actual del catálogo; con --rotar se genera una impredecible")
    su.add_argument("--rotar", action="store_true", help="prefijo nuevo, borra el anterior: las URL viejas dejan de servir")
    su.add_argument("--mi-marca", help="ruta de MI-MARCA.md para actualizar banco_url")
    su.set_defaults(fn=cmd_subir)
    ba = sub.add_parser("bajar", help="descarga el banco desde su URL base (otra máquina)")
    ba.add_argument("base_url")
    ba.set_defaults(fn=cmd_bajar)
    av = sub.add_parser("avatar", help="registra un avatar generado en avatares/")
    av.add_argument("archivo")
    av.add_argument("--estilo", required=True)
    av.add_argument("--look", required=True)
    for campo in ("pose", "origen", "referencias"):
        av.add_argument(f"--{campo}")
    av.set_defaults(fn=cmd_avatar)
    return p


if __name__ == "__main__":
    argumentos = construir_parser().parse_args()
    argumentos.prefijo_explicito = "--prefijo" in sys.argv
    argumentos.banco = argumentos.banco.expanduser()
    argumentos.banco.mkdir(parents=True, exist_ok=True)
    argumentos.fn(argumentos)
