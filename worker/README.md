# Worker del Generador de carruseles

El proceso que corre en un servidor (VPS) y atiende el módulo «Generador de carruseles» del Centro de
Control de Marca. Vigila la tabla `carrusel_pedido` de Supabase; por cada pedido pendiente produce de 1 a
4 versiones del carrusel con esta skill (`scripts/escribir.mjs` escribe el guion, `render.mjs` lo pinta,
`qa.mjs` lo califica), sube las láminas a Vercel Blob e inserta una fila por versión en `carrusel_version`.
También aplica las correcciones que el equipo pide desde la app (`carrusel_correccion`).

Todo lo privado (claves, ficha de la marca, banco de fotos) entra por variables de entorno y por una
carpeta montada. El código de esta carpeta es público y no lleva ningún dato de ninguna marca.

## Cómo funciona una vuelta

```
cada WORKER_INTERVALO_S (15 s)
  ├─ mantenimiento: git pull de la skill (30 min) · banco de fotos (24 h) · huérfanos (10 min) · limpieza (diaria)
  ├─ ¿hay un pedido pendiente?  → lo reclama (PATCH atómico) → procesando
  │     entrada (idea/texto/link/imagen) → entrada/referencia.md
  │     formatos según `versiones` → por cada uno: escribir.mjs → carrusel.zip → Vercel Blob → carrusel_version
  │     pedido listo (con título) o error (con un motivo en español)
  └─ si no, ¿hay una corrección pendiente? → base (versión indicada, elegida o última)
        escribir.mjs --correccion --base → nueva versión n = máx + 1 → corrección aplicada
```

Concurrencia 1: un pedido a la vez, una versión a la vez. El servidor tiene 2 CPU y Chromium es pesado.

Carpeta de trabajo por pedido en `TRABAJO_DIR/<pedido_id>/`:

```
<pedido_id>/
├── MI-MARCA.md, historico.json   copia de la carpeta privada (qa.mjs los busca junto a la versión)
├── entrada/referencia.md         de dónde salió (+ _referencia/NN.jpg si el link trajo láminas, imagen.jpg si fue captura)
├── v1/ … vN/                     carrusel.json, slides/01.png…, preview.jpg, portada-270.jpg, qa.json, caption.txt, carrusel.zip
└── base-vN.json                  el guion base de una corrección cuando la versión ya no estaba en disco
```

## Requisitos en el servidor

- Docker y Docker Compose v2.
- 2 CPU, 4 GB de RAM (el contenedor se limita a 3 GB), unos 10 GB de disco (la imagen pesa ~2.5 GB;
  cada pedido de 4 versiones deja ~100 MB en `trabajo/` durante 7 días).
- Salida a internet hacia: `api.anthropic.com`, tu proyecto de Supabase, `blob.vercel-storage.com`,
  `github.com` (git pull), y según lo que se pida `youtube.com` (yt-dlp) y `api.apify.com` (reels).

## Despliegue paso a paso

1. Copia esta carpeta al servidor (solo `worker/`, no toda la skill: la imagen la clona sola):

   ```bash
   scp -r worker/ usuario@servidor:~/ccm-carruseles
   ssh usuario@servidor
   cd ~/ccm-carruseles
   ```

2. Crea el `.env` a partir del ejemplo y llénalo (ver la tabla de variables más abajo):

   ```bash
   cp .env.ejemplo .env
   nano .env
   ```

3. Crea `privado/` con lo que la skill necesita de la marca. Desde la laptop, parado en la carpeta privada
   de carruseles (la que tiene `MI-MARCA.md`):

   ```bash
   ssh usuario@servidor 'mkdir -p ~/ccm-carruseles/privado/assets/fotos ~/ccm-carruseles/trabajo'
   scp MI-MARCA.md historico.json usuario@servidor:~/ccm-carruseles/privado/
   scp -r assets/fotos/reales usuario@servidor:~/ccm-carruseles/privado/assets/fotos/   # opcional
   ```

   Si no copias el banco de fotos pero pones `BANCO_URL` en el `.env`, el contenedor lo baja solo la
   primera vez a `trabajo/_banco` (porque `privado/` va montado de solo lectura). Si lo copias a
   `privado/assets/fotos/reales/`, se usa ese y no se toca.

4. Levanta el worker:

   ```bash
   docker compose up -d --build
   docker compose logs -f
   ```

   Cuando veas `Worker de carruseles arrancando` seguido de la línea de resumen (`anthropic=sí ·
   supabase=sí · blob=sí`), ya está atendiendo pedidos. La primera construcción tarda unos minutos
   (baja la imagen de Playwright, instala Pillow y yt-dlp, clona la skill y baja las tipografías).

## Ver qué está haciendo

```bash
docker compose logs -f --tail 200          # en vivo
docker compose logs --since 2h | grep -i "pedido"
docker compose ps                          # ¿está arriba?
```

Cada línea lleva fecha y hora. Lo que vas a ver por pedido: `reclamado` → `formatos: …` → una línea por
versión (`v1 carrusel-8: 8 láminas, look …, QA 92 LISTO`) → `listo: 4/4 versiones en 5.2 min`. Si una
versión falla, sale `AVISO: v2 (imagen-unica) falló: <motivo>` y el pedido sigue con las demás.
El progreso de `escribir.mjs` (rondas de QA, render) aparece con el prefijo `escribir:`.

## Actualizar

- **La skill se actualiza sola.** Cada `SKILL_PULL_MIN` minutos (30) el worker hace `git pull --ff-only`
  en `/skill`; también al arrancar. Los cambios en `scripts/`, `templates/` y `references/` se usan en el
  siguiente pedido sin hacer nada.
- **El código del worker vive en la skill** (`worker/`), así que el pull también lo trae, pero el proceso
  en marcha no se recarga solo: cuando el pull toca `worker/`, el log avisa y basta con
  `docker compose restart`.
- **La imagen** (Dockerfile, entrypoint, versión de Playwright, dependencias del sistema) se reconstruye
  copiando de nuevo la carpeta y corriendo `docker compose up -d --build`.
- **Probar una rama antes de mezclarla a `main`:** `SKILL_RAMA=feat/lo-que-sea` en el `.env` y
  `docker compose up -d --build`. Vuelve a `main` cuando termines.

## Límites y tiempos

| Qué | Valor |
|---|---|
| Concurrencia | 1 pedido a la vez, 1 versión a la vez |
| Tiempo típico | 1 a 2 min por versión (2 rondas de QA); 3 a 8 min por pedido de 4 versiones; 1 a 2 min por corrección |
| Tope por versión | `WORKER_TIMEOUT_VERSION_MIN` (25 min); pasado el tope la versión se cancela y el pedido sigue |
| Versiones fallidas | El pedido sale `listo` con las que sí salieron y una nota en `error` que dice cuál falló y por qué; si ninguna sale, `error` |
| Huérfanos | Un pedido o corrección con más de `WORKER_HUERFANO_MIN` (90) minutos en `procesando` se marca `error` (el servidor se reinició a medias) |
| Disco | Las carpetas de `trabajo/` se borran a los `TRABAJO_RETENCION_DIAS` (7) días; las láminas ya viven en Vercel Blob |
| Instagram | La API acepta 10 láminas; con más de 10 se suben a mano desde la app (lo dice `caption.txt`) |
| Enlaces del pedido | Solo `http` y `https` hacia internet. Un enlace que apunte a la red interna del servidor (localhost, 10.x, 172.16-31.x, 192.168.x, 169.254.169.254, nombres `.local`/`.internal` o sin punto) se rechaza con «Ese enlace no se puede abrir desde el servidor», y también si llega ahí por una redirección |
| Logos de apps | Si la entrada menciona CapCut, Claude, ChatGPT, WhatsApp, Canva, Excel, Notion, Instagram, TikTok, YouTube o Gemini (con mayúscula), se pide su logo real con `--logos` |

## Protocolo de estados

### `carrusel_pedido`

| Estado | Quién lo pone | Cuándo |
|---|---|---|
| `pendiente` | La app | Al crear el pedido |
| `procesando` | El worker | Al reclamarlo (`worker_inicio`); también mientras aplica una corrección de ese pedido |
| `listo` | El worker | Al menos una versión salió. `titulo` = título de la portada de la primera versión (sin marcado). Si alguna versión falló, `error` lleva la nota `Se generaron 3 de 4 versiones. La v2 (imagen-unica) falló: …` |
| `error` | El worker | Ninguna versión salió, o no se pudo leer la entrada, o falta algo en el servidor. `error` lleva un texto para el equipo, sin trazas (las trazas van al log) |
| `archivado` | La app | Nunca lo toca el worker |

Textos de error que el equipo puede ver: `Falta la clave de Anthropic en el servidor` ·
`Falta MI-MARCA.md en la carpeta privada del servidor` · `No pude leer el contenido del link. … Pega el
texto o la transcripción como entrada de tipo texto.` · `No pude descargar la imagen del pedido (…)` ·
`No se pudo generar ninguna versión. Último motivo: …` · `El proceso se interrumpió a mitad del trabajo
(el servidor se reinició). Vuelve a pedirlo.`

Formatos por número de versiones (`versiones`): 1 → `carrusel-8` · 2 → `carrusel-5`, `imagen-unica` ·
3 → `referencia`, `imagen-unica`, `carrusel-5` (con link o captura) o `imagen-unica`, `carrusel-5`,
`carrusel-8` (con idea o texto) · 4 → `referencia` (o un segundo `carrusel-8` con otro ángulo si no hay
referencia), `imagen-unica`, `carrusel-5`, `carrusel-8`.

### `carrusel_version`

| Campo | Qué lleva |
|---|---|
| `n` | 1…N en el orden en que se produjeron; las correcciones siguen contando (máx + 1) |
| `formato` | El formato que se pidió para esa ranura (`imagen-unica`, `carrusel-5`, `carrusel-8`, `referencia`) |
| `look`, `tipo`, `laminas` | Del guion |
| `carrusel_json`, `qa_json`, `indice_qa`, `veredicto_qa` | El guion completo y el informe de la puerta de calidad |
| `slides_urls`, `preview_url`, `portada_url`, `zip_url` | En Vercel Blob bajo `ccm/carruseles/<pedido_id>/v<n>/` |
| `caption` | El bloque pegable de `caption.txt` (hasta la línea `---`) |
| `estado` | Nace `propuesta`; la app la pasa a `elegida`, `descartada` o `archivada` |
| `origen_correccion_id` | La corrección que la generó, si fue una corrección |

### `carrusel_correccion`

| Estado | Quién | Cuándo |
|---|---|---|
| `pendiente` | La app | Al pedir la corrección (con `version_id` opcional; sin él se corrige la versión elegida o la última) |
| `procesando` | El worker | Al reclamarla. Solo reclama correcciones de pedidos en `listo` o `error` |
| `aplicada` | El worker | Salió la versión nueva: `version_resultado_id`, `aplicada_en`; el pedido vuelve a `listo` |
| `error` | El worker | No salió: `error` con el motivo; el pedido vuelve al estado que tenía |

## Variables de entorno

Todas se documentan sin valores en `.env.ejemplo`.

| Variable | Obligatoria | Para qué |
|---|---|---|
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Sí | Base de datos del Centro de Control de Marca (service key: salta RLS a propósito) |
| `BLOB_READ_WRITE_TOKEN` | Sí | Vercel Blob, donde viven las láminas |
| `ANTHROPIC_API_KEY` | Para producir | Sin ella el worker arranca en modo espera y cada pedido sale como error «Falta la clave de Anthropic en el servidor» |
| `ANTHROPIC_MODEL` | No | Modelo que escribe (por omisión `claude-opus-5`) |
| `APIFY_TOKEN` | No | Transcribir reels de Instagram, TikTok y Facebook; sin él siguen YouTube, artículos y PDF |
| `BANCO_URL` | No | URL base del banco de fotos en la nube para bajarlo si `privado/` no lo trae |
| `SKILL_DIR`, `PRIVADO_DIR`, `TRABAJO_DIR` | No | `/skill`, `/privado`, `/trabajo` dentro del contenedor |
| `BANCO_DIR` | No | Dónde está el banco (por omisión `PRIVADO_DIR/assets/fotos/reales`; el entrypoint lo cambia a `TRABAJO_DIR/_banco` si tuvo que bajarlo) |
| `WORKER_INTERVALO_S` | No | Segundos entre vueltas cuando no hay nada (15) |
| `SKILL_PULL_MIN` | No | Minutos entre `git pull` de la skill (30) |
| `BANCO_REFRESCO_H` | No | Horas entre refrescos del banco (24; solo si la carpeta es escribible) |
| `WORKER_HUERFANO_MIN` | No | Minutos en `procesando` para dar un trabajo por muerto (90) |
| `TRABAJO_RETENCION_DIAS` | No | Días que se guardan las carpetas de trabajo (7) |
| `WORKER_TIMEOUT_VERSION_MIN` | No | Tope por versión (25) |
| `ESCRIBIR_RONDAS` | No | Rondas de corrección con QA que hace `escribir.mjs` (2) |
| `WORKER_APPS_CONOCIDAS` | No | Lista de apps cuyos logos se piden (separadas por coma) |
| `WORKSPACE_ID` | No | Si se define, solo atiende los pedidos de esa marca |
| `TZ` | No | Zona horaria de los logs |
| `SKILL_RAMA` | No | Rama de la skill que clona la imagen (`main`) |

## Pruebas locales (sin Docker, sin base de datos, sin API)

Desde la raíz de la skill:

```bash
node --test worker/pruebas/unidad.test.mjs        # funciones puras: formatos, logos, caption, zip, config
for f in worker/*.mjs worker/lib/*.mjs; do node --check "$f"; done
bash -n worker/entrypoint.sh

# Pedido de prueba completo (worker/pruebas/pedido.ejemplo.json): imprime lo que insertaría en la base,
# usa el carrusel de ejemplo de la skill en lugar de la API y no sube nada.
mkdir -p /tmp/ccm-prueba/privado /tmp/ccm-prueba/trabajo && cp templates/MI-MARCA.md /tmp/ccm-prueba/privado/
PRIVADO_DIR=/tmp/ccm-prueba/privado TRABAJO_DIR=/tmp/ccm-prueba/trabajo node worker/index.mjs --una-vez --simular
```

Cuando `scripts/escribir.mjs` acepte `--simular <carrusel.json>`, el worker lo usa; mientras tanto copia el
ejemplo de `ejemplos/` por su cuenta (lo dice en el log). Con `--sin-subir` (sin `--simular`) el worker
habla con la base de datos real pero no sube nada a Vercel Blob: las URL quedan vacías.

## Problemas frecuentes

| Síntoma | Qué pasa | Qué hacer |
|---|---|---|
| `Faltan variables obligatorias en .env` y el contenedor se reinicia | Falta Supabase o el token de Blob | Llenar `.env` y `docker compose up -d` |
| Los pedidos salen `error: Falta la clave de Anthropic en el servidor` | `ANTHROPIC_API_KEY` vacía | Ponerla en `.env` y `docker compose restart` |
| `error: Falta MI-MARCA.md en la carpeta privada del servidor` | `privado/` vacío | Copiar la ficha (paso 3 del despliegue) |
| `No pude leer el contenido del link` con un reel | Falta `APIFY_TOKEN` | Ponerlo, o pedir el carrusel pegando el texto |
| `No se pudieron subir las imágenes: falta BLOB_READ_WRITE_TOKEN` | Token vacío o revocado | Revisar el token en Vercel |
| `carrusel_correccion no tiene relación declarada con carrusel_pedido` | La migración no declaró la clave foránea `pedido_id` | Añadirla; mientras tanto las correcciones se reclaman sin filtrar por marca |
| Render que muere sin motivo con varios pedidos seguidos | Chromium sin memoria compartida o sin RAM | Ya van `shm_size: 1g` y `mem_limit: 3g`; subirlos si el servidor lo permite |
| `AVISO: no se pudo actualizar la skill` | Sin salida a github.com | Se sigue con la versión que hay; revisar la red |
