#!/usr/bin/env python3
"""tarjeta_logo.py: monta iconos de app como tarjetas con esquinas redondeadas (22 % del lado) y borde
navy sobre fondo transparente, como se ven en un teléfono, y compone pares «a + b» con el signo en el
color de acento del look. El «+» se dibuja con formas, no con tipografía: la imagen no lleva letras.

  tarjeta_logo.py tarjeta <icono.png> <salida.png> [--lado 512] [--borde #0A2560]
  tarjeta_logo.py par <a.png> <b.png> <salida.png> --acento #0044DD [--gap 150]

Requiere Pillow (pip3 install pillow). Lo invoca scripts/lib/logos.mjs; también sirve a mano.
"""
from __future__ import annotations

import argparse
import sys

try:
    from PIL import Image, ImageDraw
except ImportError:
    sys.exit("Falta Pillow: pip3 install pillow")

SUPERMUESTREO = 4  # los bordes redondeados se dibujan a 4x y se reducen para que salgan suaves


def hex_a_rgb(valor: str) -> tuple:
    h = valor.strip().lstrip("#")
    if len(h) != 6:
        raise ValueError(f"color inválido: {valor}")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def tarjeta(entrada: str, salida: str, lado: int = 512, borde: str = "#0A2560") -> None:
    im = Image.open(entrada).convert("RGBA").resize((lado, lado), Image.LANCZOS)
    if im.getchannel("A").getextrema()[0] < 250:  # si el icono trae alfa, ponle un fondo claro detrás
        fondo = Image.new("RGBA", im.size, (240, 234, 220, 255))
        fondo.alpha_composite(im)
        im = fondo
    radio = round(lado * 0.22)
    grande = lado * SUPERMUESTREO
    mascara = Image.new("L", (grande, grande), 0)
    ImageDraw.Draw(mascara).rounded_rectangle([0, 0, grande - 1, grande - 1], radius=radio * SUPERMUESTREO, fill=255)
    im.putalpha(mascara.resize((lado, lado), Image.LANCZOS))
    grosor = max(4, round(lado * 0.012))
    capa = Image.new("RGBA", (grande, grande), (0, 0, 0, 0))
    ImageDraw.Draw(capa).rounded_rectangle(
        [0, 0, grande - 1, grande - 1], radius=radio * SUPERMUESTREO,
        outline=hex_a_rgb(borde) + (255,), width=grosor * SUPERMUESTREO)
    im.alpha_composite(capa.resize((lado, lado), Image.LANCZOS))
    im.save(salida)


def par(a: str, b: str, salida: str, acento: str, gap: int = 150, margen: int = 24) -> None:
    ia, ib = Image.open(a).convert("RGBA"), Image.open(b).convert("RGBA")
    alto = max(ia.height, ib.height)
    lienzo = Image.new("RGBA", (ia.width + gap + ib.width + 2 * margen, alto + 2 * margen), (0, 0, 0, 0))
    lienzo.alpha_composite(ia, (margen, margen + (alto - ia.height) // 2))
    lienzo.alpha_composite(ib, (margen + ia.width + gap, margen + (alto - ib.height) // 2))
    # el «+»: dos barras redondeadas centradas en el hueco, dibujadas a 4x para bordes limpios
    cx, cy = margen + ia.width + gap // 2, margen + alto // 2
    brazo, grosor = round(gap * 0.56), round(gap * 0.56 * 0.26)
    s = SUPERMUESTREO
    capa = Image.new("RGBA", (lienzo.width * s, lienzo.height * s), (0, 0, 0, 0))
    d = ImageDraw.Draw(capa)
    color = hex_a_rgb(acento) + (255,)
    d.rounded_rectangle([(cx - brazo // 2) * s, (cy - grosor // 2) * s, (cx + brazo // 2) * s, (cy + grosor // 2) * s], radius=(grosor // 2) * s, fill=color)
    d.rounded_rectangle([(cx - grosor // 2) * s, (cy - brazo // 2) * s, (cx + grosor // 2) * s, (cy + brazo // 2) * s], radius=(grosor // 2) * s, fill=color)
    lienzo.alpha_composite(capa.resize(lienzo.size, Image.LANCZOS))
    lienzo.save(salida)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    t = sub.add_parser("tarjeta")
    t.add_argument("entrada")
    t.add_argument("salida")
    t.add_argument("--lado", type=int, default=512)
    t.add_argument("--borde", default="#0A2560")
    p = sub.add_parser("par")
    p.add_argument("a")
    p.add_argument("b")
    p.add_argument("salida")
    p.add_argument("--acento", required=True)
    p.add_argument("--gap", type=int, default=150)
    args = ap.parse_args()
    try:
        if args.cmd == "tarjeta":
            tarjeta(args.entrada, args.salida, args.lado, args.borde)
        else:
            par(args.a, args.b, args.salida, args.acento, args.gap)
    except (OSError, ValueError) as e:
        print(f"tarjeta_logo: {e}", file=sys.stderr)
        return 1
    print(args.salida)
    return 0


if __name__ == "__main__":
    sys.exit(main())
