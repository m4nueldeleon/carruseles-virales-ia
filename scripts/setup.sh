#!/usr/bin/env bash
# setup.sh — Prepara la skill Carruseles Virales IA: verifica Node + Playwright y descarga las
# tipografías libres (licencia OFL) que usan los "looks". No instala nada global sin avisar.
#
#   bash scripts/setup.sh            # verifica y descarga lo que falte
#   bash scripts/setup.sh --fuentes  # solo tipografías
set -euo pipefail
AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FUENTES="$AQUI/assets/fonts"
mkdir -p "$FUENTES"

descargar_fuentes() {
  local base="https://raw.githubusercontent.com/google/fonts/main/ofl"
  # nombre_de_archivo_local|ruta_en_google_fonts
  local lista=(
    "InterTight.ttf|intertight/InterTight%5Bwght%5D.ttf"
    "ArchivoBlack.ttf|archivoblack/ArchivoBlack-Regular.ttf"
    "Archivo.ttf|archivo/Archivo%5Bwdth%2Cwght%5D.ttf"
    "Oswald.ttf|oswald/Oswald%5Bwght%5D.ttf"
    "Manrope.ttf|manrope/Manrope%5Bwght%5D.ttf"
    "SpaceGrotesk.ttf|spacegrotesk/SpaceGrotesk%5Bwght%5D.ttf"
    "BricolageGrotesque.ttf|bricolagegrotesque/BricolageGrotesque%5Bopsz%2Cwdth%2Cwght%5D.ttf"
    "JetBrainsMono.ttf|jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf"
    "Anton.ttf|anton/Anton-Regular.ttf"
  )
  local ok=0 fallo=0
  for par in "${lista[@]}"; do
    local nombre="${par%%|*}" ruta="${par#*|}"
    if [ -s "$FUENTES/$nombre" ]; then ok=$((ok+1)); continue; fi
    if curl -fsSL "$base/$ruta" -o "$FUENTES/$nombre"; then
      echo "  ✓ $nombre"; ok=$((ok+1))
    else
      echo "  ✗ no se pudo bajar $nombre (se usará una fuente del sistema)"; fallo=$((fallo+1))
    fi
  done
  echo "Tipografías listas: $ok · fallidas: $fallo · en $FUENTES"
  cat > "$FUENTES/LICENCIAS.md" <<'LIC'
# Tipografías incluidas
Todas se descargan desde el repositorio público google/fonts y se distribuyen bajo la
SIL Open Font License 1.1 (uso comercial libre). Familias: Inter Tight, Archivo, Archivo Black,
Oswald, Manrope, Space Grotesk, Bricolage Grotesque, JetBrains Mono, Anton.
https://github.com/google/fonts
LIC
}

if [ "${1:-}" = "--fuentes" ]; then descargar_fuentes; exit 0; fi

echo "▶ Node"
if command -v node >/dev/null 2>&1; then echo "  ✓ $(node -v)"; else
  echo "  ✗ Falta Node.js 18+. Instálalo: https://nodejs.org (Mac: brew install node)"; exit 1; fi

echo "▶ Playwright (renderiza los PNG)"
# Los navegadores se guardan fuera de ~/Library/Caches para que un limpiador de disco no los borre.
export PLAYWRIGHT_BROWSERS_PATH="${PLAYWRIGHT_BROWSERS_PATH:-$HOME/.playwright-browsers}"
if node -e "require('playwright')" >/dev/null 2>&1 || NODE_PATH="$(npm root -g 2>/dev/null)" node -e "require('playwright')" >/dev/null 2>&1; then
  echo "  ✓ playwright encontrado"
  if ! NODE_PATH="$(npm root -g 2>/dev/null)" node -e "const p=require('playwright');const fs=require('fs');process.exit(fs.existsSync(p.chromium.executablePath())?0:1)" >/dev/null 2>&1; then
    echo "  · falta el navegador Chromium: instalando en $PLAYWRIGHT_BROWSERS_PATH …"
    CLI="$(npm root -g 2>/dev/null)/playwright/cli.js"; [ -f "$CLI" ] || CLI="$AQUI/node_modules/playwright/cli.js"
    node "$CLI" install chromium && echo "  ✓ Chromium instalado" || echo "  ✗ No se pudo instalar Chromium: node \"$CLI\" install chromium"
  fi
else
  echo "  · playwright no está. Instalando en la carpeta de la skill (no global)…"
  (cd "$AQUI" && npm install --no-audit --no-fund --silent playwright@1.60.0 && npx playwright install chromium) \
    && echo "  ✓ playwright instalado" || { echo "  ✗ No se pudo instalar playwright. Corre a mano: cd \"$AQUI\" && npm install playwright && npx playwright install chromium"; exit 1; }
fi

echo "▶ Tipografías"
descargar_fuentes

echo "▶ Opcionales"
command -v montage >/dev/null 2>&1 && echo "  ✓ ImageMagick (montage) — vista previa en mosaico" || echo "  · ImageMagick no está (opcional): brew install imagemagick"
command -v yt-dlp  >/dev/null 2>&1 && echo "  ✓ yt-dlp — transcripciones de YouTube" || echo "  · yt-dlp no está (para links de YouTube): brew install yt-dlp  ·  o  pip3 install yt-dlp"
python3 -c "import PIL" >/dev/null 2>&1 && echo "  ✓ Pillow — quitar fondos lisos en local (scripts/quitar-fondo.py)" || echo "  · Pillow no está (para quitar fondos en local): pip3 install pillow"
command -v uvx >/dev/null 2>&1 && echo "  ✓ uv — recortes de fotos reales con rembg (scripts/banco-fotos.py recortar)" || echo "  · uv no está (para recortar fotos reales en local): curl -LsSf https://astral.sh/uv/install.sh | sh  ·  o usa --motor higgsfield"
command -v osascript >/dev/null 2>&1 && echo "  ✓ Fotos.app — banco-fotos.py cosechar --album funciona en este Mac" || echo "  · Sin Fotos.app (Linux/WSL): cosecha con --carpeta"
command -v python3 >/dev/null 2>&1 && echo "  ✓ $(python3 -V 2>&1)" || echo "  · Python 3 no está (opcional, para leer links y PDFs)"
echo
echo "✅ Listo. Abre Claude Code en tu carpeta de carruseles y escribe: Hazme un carrusel sobre <tema>"
