# 🎠 Carruseles Virales IA

**Dale un tema, un link o una captura. Recibe un carrusel de Instagram listo para subir.**

Una skill gratuita de [Claude Code](https://claude.com/claude-code) que produce carruseles de
Instagram de alto rendimiento: las 8-12 láminas en PNG (1080x1350, numeradas), el caption con la
palabra clave y un preview para aprobar de un vistazo. No es una plantilla de Canva: es el
**método completo** de un carrusel que la gente termina, guarda y comparte, escrito para que una
IA lo ejecute con criterio sobre tu marca.

- 🧠 **Psicología del swipe** — brecha de curiosidad, open loops, una idea por lámina, la lámina guardable, el CTA único. Con fuentes, no con corazonadas.
- 🪝 **Ganchos que funcionan en español** — fórmulas probadas con ejemplos reales y un sistema de 3 ángulos puntuados.
- ✍️ **Voz humana** — lista negra de frases de IA, longitudes por lámina, prueba de leer en voz alta.
- 🎨 **6 looks rotativos diseñados por código** — guía rápida, noticia, oscuro-tech, recurso, bosque, editorial-mono. Cero look genérico de IA.
- 🖼️ **Tu cara en cada carrusel** — banco de fotos reales tuyas (cosechadas de una carpeta o de Fotos de Mac, curadas por hojas de contacto, recortadas sin fondo y anotadas por tema), avatares dibujados en el estilo de cada look y, si lo tienes, tu personaje generado. Recortes sobre paneles de color, stickers, marcador de plumón, foto arriba + texto abajo, íconos 3D. Todo el texto va por código; ninguna imagen lleva letras.
- ☁️ **Banco en la nube** — `banco-fotos.py subir` manda fotos, recortes y avatares a un almacén con URL pública (Vercel Blob) y `bajar` lo trae en otra máquina; las láminas aceptan esas URL, así que la skill funciona igual en tu laptop, en un servidor o en claude.ai.
- ✅ **Puerta de calidad medible** — `qa.mjs` revisa desbordes, tamaños mínimos, contraste, palabras por lámina, clichés, CTA y palabra clave, y calcula un índice de viralidad 0-100.
- 📈 **Aprende de tus resultados** — anota alcance, guardados y compartidos a las 48 h y 7 días; el histórico rota looks y repite lo que ganó.
- 🤖 **Contrato JSON** — `carrusel.json` lo puede escribir Claude, otra IA barata (ver `hermes/`) o una persona; el render es el mismo.

## Instalación (2 minutos)

Necesitas [Claude Code](https://claude.com/claude-code) instalado. Después, en tu terminal:

```bash
curl -fsSL https://raw.githubusercontent.com/m4nueldeleon/carruseles-virales-ia/main/install.sh | bash
```

O manual:

```bash
git clone https://github.com/m4nueldeleon/carruseles-virales-ia.git ~/.claude/skills/carruseles-virales-ia
bash ~/.claude/skills/carruseles-virales-ia/scripts/setup.sh
```

El setup verifica Node y Playwright (renderiza los PNG) y descarga las tipografías libres (OFL).
Todo es **gratis y de uso comercial libre**.

> 🐣 ¿Nunca has usado una terminal? Sigue el **[TUTORIAL.md](TUTORIAL.md)**, paso a paso desde cero.
> ¿Prefieres claude.ai sin terminal? `bash scripts/empaquetar.sh` genera un `.skill` para subirlo en
> Configuración → Capacidades → Skills; el HTML trae un botón para descargar los PNG desde el navegador.

## Uso

Crea una carpeta para tus carruseles, abre ahí Claude Code y escribe:

```
Hazme un carrusel sobre los 5 errores al cotizar
```

La primera vez te hace 6 preguntas sobre tu marca y las guarda en `MI-MARCA.md`. Después va
directo: ángulo, guion lámina por lámina, imágenes, render, puerta de calidad y entrega.

También puedes pedir:

```
Carrusel de este link: https://www.youtube.com/watch?v=...
Convierte esta captura en un carrusel con mi voz        (arrastra la imagen)
Dame 3 ganchos para un carrusel sobre WhatsApp con IA
Cambia el look a oscuro-tech
Haz una serie de 4 carruseles sobre certificados gratis
Mide este carrusel: https://www.instagram.com/p/...
```

## Qué entrega

```
mis-carruseles/
├── MI-MARCA.md                       tu ficha (una vez)
├── assets/fotos/reales/              tu banco: fotos, recortes/, avatares/ y catalogo.json
├── assets/fotos/soul/                retratos de tu personaje generado (opcional)
├── historico.json                    lo que ya publicaste y cómo le fue
└── 2026-09-06-cotizar-sin-perder-dinero/
    ├── carrusel.json                 el guion (fuente de verdad)
    ├── slides/01.png … 08.png        listos para subir, en orden
    ├── preview.jpg                   mosaico para aprobar
    ├── caption.txt                   caption + hashtags + palabra clave
    ├── qa.json                       la puerta de calidad
    └── metadata.json                 tema, look, gancho, resultados
```

Mira un ejemplo completo con marca ficticia en [`ejemplos/`](ejemplos/).

## Qué hay adentro

| Carpeta | Contenido |
|---|---|
| `SKILL.md` | El cerebro: las 8 fases, valores por omisión, reglas que no se rompen |
| `references/` | Psicología de la viralidad (con fuentes) · ganchos en español · formatos y estructura · dirección de arte y los 6 looks · contrato JSON y layouts · imágenes · copy con voz humana · referencias de entrada · medición |
| `scripts/` | `render.mjs` (JSON → PNG + preview + portada a tamaño de cuadrícula) · `qa.mjs` (puerta de calidad + índice) · `siguiente-look.mjs` (qué look toca) · `referencia.py` (link o captura → ficha) · `quitar-fondo.py` (fondo liso → transparencia) · `medir.py` (resultados → histórico) · `escribir.mjs` (escribe el guion con la API de Anthropic, para servidores y asistentes) · `setup.sh` · `empaquetar.sh` |
| `templates/` | `MI-MARCA.md` · `carrusel.schema.json` · `base.css` · `looks/*.css` |
| `hermes/` | Rutina y esquema para que un modelo barato escriba el `carrusel.json` y este motor lo renderice |
| `ejemplos/` | Un carrusel completo renderizado |

## Sin Claude Code: la API de Anthropic

`scripts/escribir.mjs` escribe el `carrusel.json` y el caption con Claude por API (llave en
`ANTHROPIC_API_KEY` o en `~/.anthropic-cli/.env`), renderiza, corre QA y corrige una ronda. Sirve
para un servidor, un cron o un asistente como Hermes; las imágenes se generan aparte con la
herramienta que tengas.

```bash
node scripts/escribir.mjs --tema "5 errores al cotizar" --carpeta ./mis-carruseles --tipo lista
```

## Requisitos

- macOS, Linux o Windows (WSL)
- [Claude Code](https://claude.com/claude-code)
- Node.js 18+ (el setup instala Playwright si falta)
- Opcional: Python 3 + Pillow (links, PDFs y el banco de fotos), `yt-dlp` (YouTube), `uv` (recortes de fotos con rembg en local), un MCP de imágenes (Higgsfield, Gemini, fal.ai…) para ilustraciones, avatares y personajes, y una cuenta de Vercel (gratis) si quieres el banco en la nube

## Filosofía

Instagram distribuye lo que la gente **termina, guarda y manda**. Un carrusel gana cuando la
portada promete algo concreto, la segunda lámina obliga a seguir, cada lámina dice una sola cosa,
hay una lámina que vale la pena guardar y el cierre pide una sola acción que entrega algo que no
estaba en el post. Esta skill convierte eso en reglas medibles y en código, sobre TU marca y con
TU voz. Los datos que respaldan cada regla están en `references/PSICOLOGIA-VIRALIDAD.md`.

## Créditos

Las estructuras narrativas se apoyan, con atribución, en ideas de **Carrusel Studio** de
[Ruva IA](https://www.youtube.com/@RuvaIA). Las tipografías son de [google/fonts](https://github.com/google/fonts) (OFL).

## Licencia

MIT. Úsala, modifícala y compártela. El índice de viralidad mide si una pieza cumple las reglas
que suben la probabilidad de alcance; no garantiza resultados.
