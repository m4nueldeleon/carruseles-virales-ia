# syntax=docker/dockerfile:1
# Imagen del worker del Generador de carruseles (Centro de Control de Marca).
#
# Base: la imagen oficial de Playwright sobre Ubuntu noble, que ya trae Node y Chromium con todas sus
# dependencias del sistema. La versión de la imagen y la del paquete npm `playwright` DEBEN coincidir:
# el paquete busca la revisión exacta de Chromium de su versión en PLAYWRIGHT_BROWSERS_PATH.
# Etiquetas disponibles: curl -s https://mcr.microsoft.com/v2/playwright/tags/list
ARG PLAYWRIGHT_VERSION=1.56.1
FROM mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-noble

ARG PLAYWRIGHT_VERSION
# Repo público de la skill (el worker vive dentro, en worker/) y la rama que se clona.
# En producción main; para probar una rama antes de mezclarla: --build-arg SKILL_RAMA=feat/x (o SKILL_RAMA en .env).
ARG SKILL_REPO=https://github.com/m4nueldeleon/carruseles-virales-ia
ARG SKILL_RAMA=main

ENV DEBIAN_FRONTEND=noninteractive \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright \
    SKILL_DIR=/skill \
    PRIVADO_DIR=/privado \
    TRABAJO_DIR=/trabajo \
    NODE_ENV=production \
    PYTHONUNBUFFERED=1

# Herramientas del sistema: pip (para Pillow y yt-dlp), git (la skill se actualiza sola con git pull),
# zip (carrusel.zip descargable) y poppler-utils (pdftotext, referencias en PDF).
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 python3-pip git zip poppler-utils ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Pillow (banco de fotos, quitar-fondo.py) y yt-dlp (transcripciones de YouTube).
# --break-system-packages porque Ubuntu noble protege el Python del sistema y aquí no hay virtualenv.
RUN pip3 install --no-cache-dir --break-system-packages pillow yt-dlp

# El paquete npm de playwright, global y en la MISMA versión que la imagen. scripts/lib/playwright.mjs lo
# encuentra vía `npm root -g`. No se instala dentro de /skill para no ensuciar el repo que hace git pull.
RUN npm install -g --no-audit --no-fund playwright@${PLAYWRIGHT_VERSION}

# La skill se clona en build (clon superficial: basta para hacer git pull después). Si trae package.json se
# instalan sus dependencias, y se bajan las tipografías libres (OFL) que usan los looks.
RUN git clone --depth 1 --branch ${SKILL_RAMA} ${SKILL_REPO} ${SKILL_DIR} \
 && cd ${SKILL_DIR} \
 && if [ -f package.json ]; then npm install --no-audit --no-fund; fi \
 && bash scripts/setup.sh --fuentes

# El entrypoint viene de la carpeta worker/ copiada al VPS (contexto de build), no del clon: así el arranque
# no depende de que el git pull funcione.
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh && mkdir -p ${PRIVADO_DIR} ${TRABAJO_DIR}

WORKDIR ${SKILL_DIR}
ENTRYPOINT ["/entrypoint.sh"]
