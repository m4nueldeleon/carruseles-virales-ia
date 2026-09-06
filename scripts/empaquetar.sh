#!/usr/bin/env bash
# empaquetar.sh — Genera dist/carruseles-virales-ia.skill (zip) para subir la skill a claude.ai
# (Configuración → Capacidades → Skills → Cargar). Excluye node_modules, .git y salidas.
#   bash scripts/empaquetar.sh [--con-fuentes]
set -euo pipefail
AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NOMBRE="$(basename "$AQUI")"
mkdir -p "$AQUI/dist"
SALIDA="$AQUI/dist/$NOMBRE.skill"
rm -f "$SALIDA"
EXCL=(-x "*/node_modules/*" -x "*/.git/*" -x "*/dist/*" -x "*/.DS_Store" -x "*/__pycache__/*" -x "*/graphify-out/*" -x "*/MI-MARCA.md")
[ "${1:-}" = "--con-fuentes" ] || EXCL+=(-x "*/assets/fonts/*.ttf")
(cd "$(dirname "$AQUI")" && zip -qr "$SALIDA" "$NOMBRE" "${EXCL[@]}")
echo "✅ $SALIDA ($(du -h "$SALIDA" | cut -f1))"
[ "${1:-}" = "--con-fuentes" ] || echo "   Sin tipografías (usa --con-fuentes para incluirlas, +2.5 MB). En claude.ai el HTML cae a fuentes del sistema."
