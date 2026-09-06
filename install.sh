#!/usr/bin/env bash
# Instalador de la skill Carruseles Virales IA para Claude Code.
# Uso: curl -fsSL https://raw.githubusercontent.com/m4nueldeleon/carruseles-virales-ia/main/install.sh | bash
set -euo pipefail

DESTINO="$HOME/.claude/skills/carruseles-virales-ia"
REPO_URL="https://github.com/m4nueldeleon/carruseles-virales-ia.git"

echo "🎠 Instalando Carruseles Virales IA…"

if ! command -v git >/dev/null 2>&1; then
  echo "❌ Falta git. Instálalo primero:"
  echo "   Mac:    xcode-select --install"
  echo "   Ubuntu: sudo apt install git"
  exit 1
fi

if [ -d "$DESTINO/.git" ]; then
  echo "↻ Ya existe una instalación — actualizando…"
  git -C "$DESTINO" pull --ff-only
else
  mkdir -p "$HOME/.claude/skills"
  git clone --depth 1 "$REPO_URL" "$DESTINO"
fi

bash "$DESTINO/scripts/setup.sh" || true

echo ""
echo "✅ Skill instalada en: $DESTINO"
echo ""
echo "Cómo usarla:"
echo "  1. Crea una carpeta para tus carruseles (ej. mis-carruseles) y abre ahí una terminal"
echo "  2. Escribe: claude"
echo "  3. Dile:    Hazme un carrusel sobre <tema>   (o pega un link, o arrastra una captura)"
echo "     La primera vez te hará 6 preguntas sobre tu marca y las guardará en MI-MARCA.md."
