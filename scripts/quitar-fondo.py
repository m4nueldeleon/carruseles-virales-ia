#!/usr/bin/env python3
"""quitar-fondo.py — Quita un fondo liso (blanco, crema, beige, gris) de un PNG/JPG local y deja
transparencia, sin servicios externos. Sirve para personajes e ilustraciones generadas sobre fondo
liso. Para fondos complejos usa el removedor de tu herramienta de imagen (Higgsfield acepta el
job_id de una generación en remove_background) o un servicio de recorte.

  python3 scripts/quitar-fondo.py entrada.png salida.png [--tolerancia 28] [--suavizado 2]

Requiere Pillow (pip install pillow). Estrategia: inundación desde las 4 esquinas con tolerancia
de color; el borde se suaviza para que no quede recortado a cuchillo.
"""
from __future__ import annotations
import argparse, sys
from collections import deque

try:
    from PIL import Image, ImageFilter
except ImportError:
    print("Falta Pillow: pip install pillow", file=sys.stderr); sys.exit(2)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("entrada"); ap.add_argument("salida")
    ap.add_argument("--tolerancia", type=int, default=28, help="0-255; sube si queda halo del fondo, baja si se come el sujeto")
    ap.add_argument("--suavizado", type=int, default=2, help="radio del desenfoque del borde")
    a = ap.parse_args()
    im = Image.open(a.entrada).convert("RGBA")
    w, h = im.size
    px = im.load()
    esquinas = [px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1]]
    ref = tuple(sum(c[i] for c in esquinas) // 4 for i in range(3))
    tol = a.tolerancia
    mascara = Image.new("L", (w, h), 255)  # 255 = sujeto, 0 = fondo
    mp = mascara.load()
    visitado = bytearray(w * h)
    q = deque([(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)])
    while q:
        x, y = q.popleft()
        i = y * w + x
        if visitado[i]:
            continue
        visitado[i] = 1
        r, g, b, _ = px[x, y]
        if abs(r - ref[0]) + abs(g - ref[1]) + abs(b - ref[2]) > tol * 3:
            continue
        mp[x, y] = 0
        if x > 0: q.append((x - 1, y))
        if x < w - 1: q.append((x + 1, y))
        if y > 0: q.append((x, y - 1))
        if y < h - 1: q.append((x, y + 1))
    if a.suavizado > 0:
        mascara = mascara.filter(ImageFilter.GaussianBlur(a.suavizado))
    im.putalpha(mascara)
    im.save(a.salida, "PNG")
    fondo_pct = 100 * sum(1 for v in mascara.getdata() if v < 128) / (w * h)
    print(f"{a.salida}: {w}x{h}, fondo quitado {fondo_pct:.0f}% (color de referencia {ref})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
