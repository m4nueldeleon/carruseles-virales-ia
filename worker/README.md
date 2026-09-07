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
| Enlaces del pedido | Solo `http` y `https` hacia internet. Un enlace que apunte a la red interna del servidor se rechaza con «Ese enlace no se puede abrir desde el servidor», y también si llega ahí por una redirección. Ver «El portero de enlaces» abajo |
| Logos de apps | Si la entrada menciona CapCut, Claude, ChatGPT, WhatsApp, Canva, Excel, Notion, Instagram, TikTok, YouTube o Gemini (con mayúscula), se pide su logo real con `--logos` |

## Cuánto cuesta y cómo se frena

La API de Anthropic se cobra por token. Cada llamada que hace `escribir.mjs` deja su consumo en el log;
el worker lo lee al vuelo, lo convierte a dólares con la tabla de precios de `worker/lib/costos.mjs`
(dólares por millón de tokens, confirmados el 7-sep-2026 en la página de precios de Anthropic) y lo guarda
en la base: `carrusel_version.costo_usd` por versión y `carrusel_pedido.costo_usd` por pedido.

Medido el 7-sep-2026 con llamadas reales, un pedido normal de 4 versiones pasó de **$1.41 a $0.66**.
De dónde sale la diferencia:

| Palanca | Qué se hizo | Qué se midió |
|---|---|---|
| El caché ahora se lee | Lo que no cambia entre versiones (rutina, reglas de copy, ficha de la marca, banco, histórico y referencia) va junto y primero en el system, con el punto de corte al final. Antes el corte estaba detrás del capítulo del protocolo, que cambia con el formato: el prefijo cambiaba en cada versión y `cache_read_input_tokens` era **0 siempre** | La entrada sin cachear baja de ~18,400 tokens por versión a ~2,400. La v2 de un pedido lee 20,576 tokens de caché a 0.1x en vez de pagarlos a precio lleno |
| El razonamiento va acotado | El cliente nunca mandaba `thinking` ni `output_config`, así que Opus 5 razonaba con esfuerzo `high` sin que nadie lo pidiera. Ahora va `adaptive` + `effort` (por omisión `low`, `ESCRIBIR_ESFUERZO`) | La salida baja de ~5,200 tokens por versión a ~2,200, y el índice de QA **no bajó** en ninguno de los tres formatos probados (95→95, 82→82, 98→98) |
| Cada tarea con su modelo | Elegir el formato y leer una captura de referencia no escriben el carrusel: van con `ANTHROPIC_MODELO_AUXILIAR` (`claude-sonnet-5`) y sin razonamiento. La escritura se queda en Opus | Leer una captura de 3 láminas: $0.177 con Opus (y la ficha salía **truncada**, sin los apartados 8, 9 y 10) contra $0.058 con Sonnet 5 y la ficha entera |

El ttl del caché es de 5 minutos (`ESCRIBIR_CACHE_TTL`) y no de una hora, porque **cada lectura renueva los
cinco minutos**: medido en un pedido de 4 versiones seguidas, la última llamada ocurrió a los 188 segundos
de la primera y los huecos entre versiones fueron de 40 a 58 segundos. La escritura de 5 minutos cuesta
1.25x la entrada; la de una hora, 2x. Si tus pedidos son lentos o lanzas varios de la misma marca dentro de
la hora, `ESCRIBIR_CACHE_TTL=1h` sale a cuenta.

| Freno | Qué hace |
|---|---|
| `COSTO_TOPE_PEDIDO_USD` (3) | Si un pedido lo pasa, la versión en curso **se corta en el acto** y el pedido queda en `error` con un texto que dice cuánto llevaba, cuál es el tope y cuántas versiones alcanzó a generar. Las versiones que ya salieron se conservan |
| `COSTO_TOPE_DIA_USD` (20) | Al alcanzarlo el worker **deja de tomar trabajo nuevo** y lo dice en el log. Los pedidos pendientes se quedan en la cola (no dan error) y se retoman al día siguiente |
| `COSTO_AVISO_DIA_PCT` (80) | Aviso en el log al llegar a esa parte del tope diario, una vez al día |

La cuenta del día se guarda en `TRABAJO_DIR/_costos/gasto-AAAA-MM-DD.json`, así que reiniciar el
contenedor no borra lo gastado. El día es el día local del contenedor (`TZ`).

Si la base todavía no tiene las columnas de gasto (falta aplicar la migración `0007` de la app), el worker
lo detecta a la primera escritura, avisa una vez y sigue guardando las versiones sin esas columnas: nunca
se pierde un carrusel por no poder apuntar su coste.

## El portero de enlaces

Un link pegado en la app lo abre el servidor, no el navegador de quien lo pegó. Sin portero, ese link sirve
para leer los servicios internos del VPS o el punto de metadatos de la nube. El portero vive en dos sitios,
porque hay dos caminos que bajan cosas de internet: `worker/lib/red.mjs` (Node, imágenes del pedido) y
`scripts/referencia.py` (Python, referencias de link). Los dos siguen las mismas dos reglas.

**Se decide sobre los bytes de la dirección, no sobre cómo está escrita.** Una misma dirección se escribe de
muchas formas y una lista de patrones de texto siempre se queda corta — así se coló el IPv6 mapeado
`::ffff:127.0.0.1`, que el analizador de URL normaliza a `::ffff:7f00:1` antes de llegar al filtro. La
dirección se expande a sus 16 (o 4) bytes y ahí se decide. Queda fuera:

| Familia | Qué cubre |
|---|---|
| IPv4 privadas y locales | `0/8`, `10/8`, `127/8`, `169.254/16` (metadatos de nube), `172.16/12`, `192.168/16` |
| IPv4 reservadas | `100.64/10` (red de operador y de varias nubes), `192.0/16`, `198.18/15`, de `224` en adelante (multicast, reservado y `255.255.255.255`) |
| IPv6 | `::`, `::1`, `fc00::/7`, `fe80::/10`, `ff00::/8` y el prefijo NAT64 `64:ff9b::/32` |
| IPv4 escondidas en IPv6 | mapeada `::ffff:a.b.c.d`, compatible `::a.b.c.d`, traducida `::ffff:0:a.b.c.d` y 6to4 `2002:a.b.c.d::` — se saca la IPv4 y se le aplica la tabla de arriba |
| Nombres | `localhost` y parientes, sufijos `.local` `.internal` `.localhost` `.home.arpa` `.lan`, y cualquier host sin punto (así se llaman los contenedores vecinos dentro de Docker) |
| IPv4 mal escritas | `2130706433`, `0177.0.0.1`, `0x7f000001`. Node las normaliza a la forma punteada y caen por bytes; si alguna llegara sin normalizar no se adivina cómo la leería el sistema (macOS lee `0177.0.0.1` como `177.0.0.1` y glibc como `127.0.0.1`): se bloquea |

**Se conecta a la dirección que ya se aprobó.** Si se revisa el nombre y después se deja que la librería lo
resuelva otra vez por su cuenta, un dominio con TTL cero puede contestar una dirección pública en la primera
consulta y una interna en la segunda (el «reenganche de DNS»). Por eso `traerSeguro` no usa `fetch`: usa
`node:http`/`node:https` con un `lookup` fijo que devuelve solo la IP aprobada, y el nombre original sigue
viajando en la cabecera `Host` y en el saludo TLS, así que el certificado se sigue verificando contra el
dominio de verdad. Cada salto de una redirección pasa otra vez por el portero antes de pedirse, y hay tope
de 5 saltos y de 64 MB por descarga.

Las pruebas de esto (`node --test worker/pruebas/unidad.test.mjs`) levantan un servicio interno de verdad en
`127.0.0.1` e intentan alcanzarlo con las 25 formas de la tabla, por Node y por Python, y comprueban que el
servicio no recibió ni una sola petición. No se prueba llamando al filtro con una dirección escrita a mano:
esa prueba daba falsa tranquilidad, porque comprobaba el filtro contra el texto que el filtro ya esperaba.


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
| `ANTHROPIC_MODELO_AUXILIAR` | No | Modelo de lo que NO escribe el carrusel: elegir formato y leer capturas (por omisión `claude-sonnet-5`) |
| `ESCRIBIR_ESFUERZO` | No | Cuánto razona el modelo antes de escribir: `low` (por omisión), `medium`, `high`, `xhigh`, `max` |
| `ESCRIBIR_CACHE_TTL` | No | Vida del prefijo cacheado: `5m` (por omisión) o `1h` |
| `ANTHROPIC_MAX_TOKENS` | No | Techo de una respuesta. Vacío = el del esfuerzo (low 8000 · medium 12000 · high 20000). Es una red, no un ahorro: se cobra lo generado |
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
| `COSTO_TOPE_PEDIDO_USD` | No | Dólares como máximo por pedido (3). 0 = sin tope |
| `COSTO_TOPE_DIA_USD` | No | Dólares como máximo al día (20). 0 = sin tope |
| `COSTO_AVISO_DIA_PCT` | No | Porcentaje del tope diario en el que se avisa en el log (80) |
| `COSTO_PRECIOS_JSON` | No | Precios por millón de tokens para modelos que la tabla del código no conoce |
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
