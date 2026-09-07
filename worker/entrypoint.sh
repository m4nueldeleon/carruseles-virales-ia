#!/usr/bin/env bash
# entrypoint.sh: arranque del contenedor del worker. Valida las variables, pone la skill al día, baja el
# banco de fotos si hace falta y lanza `node /skill/worker/index.mjs`. Los argumentos se pasan al worker.
set -uo pipefail

SKILL_DIR="${SKILL_DIR:-/skill}"
PRIVADO_DIR="${PRIVADO_DIR:-/privado}"
TRABAJO_DIR="${TRABAJO_DIR:-/trabajo}"
BANCO_DIR="${BANCO_DIR:-$PRIVADO_DIR/assets/fotos/reales}"
export SKILL_DIR PRIVADO_DIR TRABAJO_DIR

decir() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] entrypoint: $*"; }

# 1. Sin base de datos ni almacén de imágenes el worker no puede ni empezar: se detiene con el motivo.
faltan=()
for variable in SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY BLOB_READ_WRITE_TOKEN; do
  [ -n "${!variable:-}" ] || faltan+=("$variable")
done
if [ "${#faltan[@]}" -gt 0 ]; then
  decir "Faltan variables obligatorias en .env: ${faltan[*]}"
  decir "Copia .env.ejemplo a .env, llénalo y vuelve a levantar: docker compose up -d"
  exit 1
fi

# 2. Sin la clave de Anthropic el worker arranca en modo espera: el bucle sigue vivo y cada pedido que reclama
#    se marca como error con «Falta la clave de Anthropic en el servidor» hasta que la agregues y reinicies.
if [ -z "${ANTHROPIC_API_KEY:-}" ]; then
  decir "AVISO: falta ANTHROPIC_API_KEY. Arranco en modo espera: cada pedido se marcará como error con el texto «Falta la clave de Anthropic en el servidor»."
fi
if [ ! -f "$PRIVADO_DIR/MI-MARCA.md" ]; then
  decir "AVISO: no existe $PRIVADO_DIR/MI-MARCA.md. Copia la ficha de la marca a privado/; hasta entonces los pedidos saldrán como error."
fi
mkdir -p "$TRABAJO_DIR"

# 3. Skill al día (el worker vive dentro de ella). Sin red se sigue con la versión de la imagen.
if [ -d "$SKILL_DIR/.git" ]; then
  if git -C "$SKILL_DIR" pull --ff-only --quiet; then
    decir "skill al día: $(git -C "$SKILL_DIR" log -1 --format='%h %s' | cut -c1-100)"
  else
    decir "AVISO: no se pudo actualizar la skill (¿sin red?); sigo con la versión de la imagen"
  fi
fi
if [ -f "$SKILL_DIR/package.json" ]; then
  (cd "$SKILL_DIR" && npm install --no-audit --no-fund --silent) || decir "AVISO: npm install de la skill falló"
fi
bash "$SKILL_DIR/scripts/setup.sh" --fuentes >/dev/null 2>&1 || decir "AVISO: no se pudieron verificar las tipografías"

# 4. Banco de fotos. Si ya hay catálogo en BANCO_DIR se usa (y se refresca cada 24 h solo si la carpeta es
#    escribible). Si no hay, se baja de BANCO_URL: a BANCO_DIR cuando se puede escribir ahí, y si privado/ está
#    montado de solo lectura, a TRABAJO_DIR/_banco. El worker recibe la ruta final en BANCO_DIR.
bajar_banco() {
  decir "bajando el banco de fotos a $1 (lo que ya existe se salta)…"
  python3 "$SKILL_DIR/scripts/banco-fotos.py" --banco "$1" bajar "$BANCO_URL" \
    || decir "AVISO: no se pudo bajar el banco de fotos; las láminas saldrán sin fotos del banco"
}
viejo() { [ -n "$(find "$1" -mmin +1440 2>/dev/null)" ]; }
if [ -n "${BANCO_URL:-}" ]; then
  if [ -f "$BANCO_DIR/catalogo.json" ]; then
    if [ -w "$BANCO_DIR" ] && viejo "$BANCO_DIR/catalogo.json"; then bajar_banco "$BANCO_DIR"; fi
  else
    destino="$BANCO_DIR"
    if ! { mkdir -p "$destino" 2>/dev/null && [ -w "$destino" ]; }; then
      destino="$TRABAJO_DIR/_banco"
      mkdir -p "$destino"
      decir "AVISO: $BANCO_DIR no es escribible (montaje de solo lectura); el banco vive en $destino"
    fi
    if [ ! -f "$destino/catalogo.json" ] || viejo "$destino/catalogo.json"; then bajar_banco "$destino"; fi
    BANCO_DIR="$destino"
  fi
fi
export BANCO_DIR
if [ -f "$BANCO_DIR/catalogo.json" ]; then decir "banco de fotos: $BANCO_DIR"; else decir "banco de fotos: sin catálogo (las láminas saldrán sin fotos del banco)"; fi

exec node "$SKILL_DIR/worker/index.mjs" "$@"
