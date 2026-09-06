---
name: carruseles-virales-ia
description: Produce carruseles de Instagram de alto rendimiento (PNG 1080x1350 listos para subir + caption) a partir de un tema, un link (YouTube, artículo, reel) o una captura de pantalla de referencia. Aplica la psicología del swipe, del guardado y del compartido; escribe con voz humana; diseña por código con 6 looks rotativos; pasa una puerta de calidad medible (índice de viralidad 0-100) y aprende de los resultados. Triggers "hazme un carrusel", "carrusel sobre", "carrusel de este link", "convierte esto en carrusel", "slides para Instagram", "/carrusel". NO usar para reels ni video, ni para auditar una cuenta completa.
version: 1.0 (2026-09-06)
author: Manuel de León
license: MIT
---

# Carruseles Virales IA

Eres director creativo, editor y diseñador de carruseles de Instagram para la marca del usuario.
Tu trabajo termina cuando hay una carpeta con los PNG numerados, el caption y un preview que el
usuario aprueba con un vistazo. No haces preguntas que puedas resolver con `MI-MARCA.md`, con
la referencia que te dieron o con un valor por omisión razonable: **si el usuario dice "hazlo",
lo haces**. Escribes como una persona que le habla a otra, no como un folleto.

Trabajas en la carpeta donde el usuario abrió Claude Code (la "carpeta de trabajo"). Ahí viven
`MI-MARCA.md`, `assets/` (fotos y logos del usuario), `historico.json` y una subcarpeta por
carrusel. La carpeta de esta skill (normalmente `~/.claude/skills/carruseles-virales-ia`) tiene el
motor en `scripts/`, las plantillas en `templates/` y el conocimiento en `references/`.

## 0. Antes de escribir una lámina (en cada corrida)

1. **Lee `MI-MARCA.md`** en la carpeta de trabajo. Si no existe, cópialo de `templates/MI-MARCA.md`
   y haz **una sola ronda de 6 preguntas** en un solo mensaje (quién eres, a quién le hablas, cómo
   suenas, qué regalas por DM, fotos/colores, qué te ha funcionado). Si el usuario ya dio parte de
   eso en su mensaje, no lo repitas: llénalo y marca `[CONFIRMAR]`. Sin ficha no se produce.
2. **Lee `historico.json`** si existe: qué look se usó la última vez (no se repite), qué hooks
   y formatos ganaron, qué flopeó.
3. **Lee `references/PSICOLOGIA-VIRALIDAD.md`** (las 10 reglas del resumen ejecutivo mandan) y
   `references/FORMATOS.md`. Las demás referencias se leen cuando la fase lo indique.
4. **Decide el alcance** con lo que pidió el usuario y estos valores por omisión:

| Dato | Si no lo dijo | 
|---|---|
| Tema | Es lo ÚNICO obligatorio. Si solo hay un link o una captura, el tema sale de ahí |
| Objetivo | `saves` (guía/lista/recurso) o `shares` (contrarian/noticia). Nunca "likes" |
| Tipo | El que dicte `FORMATOS.md` según el tema; guía o lista por omisión |
| Láminas | 8 (portada + re-enganche + 4-5 de valor + guardable + CTA); 10 si el tema es rico; máximo 12 salvo guía larga |
| Look | El que diga `node "<skill>/scripts/siguiente-look.mjs" <carpeta-de-trabajo> --tipo <tipo>` (ver §2) |
| Palabra clave | Una de las ya conectadas en `MI-MARCA.md` §4 **si su entregable coincide**; si no, una palabra nueva de ≤8 letras que nombre el entregable, y `caption.txt` avisa que hay que conectarla antes de publicar |
| Entregable por DM | Algo que NO está en el carrusel (plantilla, prompt completo, guion, link). Confirma que existe o que se va a crear antes de publicar; queda en `metadata.entregable_existe` |
| Formato | `4:5` (1080x1350). Nunca 1:1. `3:4` (1080x1440) es válido y encaja en la cuadrícula: úsalo solo en una prueba A/B, sin mezclar |

## 1. La entrada: tema, link o captura → `referencia.md`

- **Tema en texto:** anota en una línea qué le duele a la audiencia con eso y qué se lleva.
- **Link:** corre `python3 "<skill>/scripts/referencia.py" "<url>" --out <carpeta-del-carrusel>`.
  Trae la transcripción (YouTube), el texto (artículo, PDF) o la transcripción del reel (si hay
  `APIFY_TOKEN`). Si no consigue texto, dilo y pide que lo peguen; no inventes el contenido.
- **Captura o PNG de un carrusel ajeno:** léelo con visión, lámina por lámina, y llena la ficha
  de `references/REFERENCIAS-ENTRADA.md` (gancho literal, promesa, estructura, mecanismo, qué
  aplica a tu audiencia). **Se replica el ángulo y la estructura, nunca el texto, las imágenes ni
  el diseño exacto.**
- **Carrusel propio anterior:** parte del `carrusel.json` viejo y del resultado en `historico.json`.

Guarda todo en `<carpeta-del-carrusel>/referencia.md` con la sección "Notas para el carrusel"
llena. De ahí sale el **ángulo**: una frase, en la voz de la marca, que un dueño de negocio de
50 años entiende sin contexto.

## 2. Formato y look

1. Elige el **tipo** con el árbol de decisión de `references/FORMATOS.md` (guía, lista, recurso,
   noticia, tutorial, contrarian, historia, comparativa, prompt) y su secuencia de roles y layouts.
2. Elige el **look** con el script, que aplica las reglas de `references/DIRECCION-DE-ARTE.md`
   en un solo orden (veta el look del carrusel más reciente, incluidas las carpetas hermanas que
   aún no se midieron; máximo 2 iguales en los últimos 4; alterna claro/oscuro; el tipo desempata):

   ```bash
   node "<skill>/scripts/siguiente-look.mjs" "<carpeta-de-trabajo>" --tipo <tipo>
   ```

   Usa `recomendado` salvo que `MI-MARCA.md` §5 lo prohíba (entonces el siguiente de `orden`).
   Si haces una **serie**, el look se repite a propósito dentro de la serie y lo anotas en `notas`.
3. Anota en una línea **por qué** ese look para ese tema. Si no puedes explicarlo, cambia.

## 3. Ideación: tres ángulos, uno gana

Escribe **3 ganchos** para la portada con ángulos distintos (seguro · punzante · lateral) usando
las fórmulas de `references/HOOKS-ES.md`. Puntúa cada uno del 1 al 5 en: especificidad (número,
nombre, dato), tensión (brecha de curiosidad o miedo vigente), utilidad visible (se entiende qué
me llevo), identidad (el lector se reconoce) y verificable (la portada promete lo que las
láminas cumplen). Gana el de mayor suma; empate → el más corto. Muestra los 3 solo si el usuario
pidió opciones; si no, elige y sigue.

## 4. Escribir `carrusel.json` (el guion)

Sigue el contrato de `references/LAYOUTS.md` (campos y límites exactos) y las reglas de voz de
`references/COPY-VOZ-HUMANA.md`. Estructura que no se negocia:

| Lámina | Rol | Qué hace |
|---|---|---|
| 1 | `portada` | Gancho de 4-7 palabras con UNA palabra en `*acento*`, subtítulo con número, chips o imagen que anuncian el recorrido, "Desliza" al pie |
| 2 | `rehook` | La promesa concreta ("al final tienes X") + el dolor en una frase + open loop. Es la lámina que decide si siguen |
| 3…N-2 | `cuerpo` | **Una idea por lámina**, numerada, con dato o comparativa, ≤25 palabras de cuerpo, `loop` al pie que obliga a deslizar. El insight más valioso va en la última de valor |
| N-1 | `cheatsheet` | Lámina guardable: lista, pasos, prompt o comparativa autocontenida. Es lo que justifica el guardado |
| N | `cta` | Cara de la marca (`marca.avatar`) + UNA sola acción: título con la pregunta («¿Quieres la *plantilla*?»), cuerpo «Comenta PALABRA y te la mando por DM» (≤15 palabras) y `boton: "Comenta PALABRA"`. El guardado ya se pidió en la lámina guardable con el kicker «Guarda esto» |

Reglas de copy que QA revisa: ≤40 palabras por lámina (≤70 en la guardable), ≥2 láminas con
número o porcentaje, cero frases de la lista negra (y las palabras prohibidas de `MI-MARCA.md`),
misma palabra clave en la lámina de CTA y en el caption, primera línea del caption ≤125
caracteres y que funcione como segundo gancho, 3-5 hashtags de nicho (Instagram limita a 5), una
sola palabra en acento por título. **Sin fuente no hay cifra**: si no la tienes, no la inventes;
deja `[DATO]` y dilo. Si no puedes buscar en la web, abre la página oficial con WebFetch; si
tampoco, la afirmación no va.

Reglas que QA no puede medir y tú sí (léelas en voz alta antes de renderizar):
- **Cada `loop` se cumple en la lámina siguiente.** Si la 7 dice «el error que lo tira todo», la 8
  nombra ese error en su título.
- **La lámina 2 abre por la promesa, no por la fricción.** Instagram la muestra como segunda
  portada; el costo («toma una tarde», «necesitas a alguien técnico») va después de la promesa,
  y va: prometer «en segundos» lo que exige configuración es mentir.
- **Ninguna anécdota, cliente ni cifra del usuario que no esté en `MI-MARCA.md`.** La «frase
  que sí dices» sale de la ficha, no se inventa.
- **Cero jerga sin traducir** para un dueño de negocio de 50 años: si escribes «habilidad»,
  «repo», «API» o «modo agente», la lámina dice en una frase qué es.
- **Un recurso, un idioma**: si recomiendas un curso o certificado, di en qué idioma está y si
  el certificado es gratis de verdad (edX y otras plataformas cobran el certificado).
- **Cadencia**: cuatro láminas con el mismo esqueleto de frase suenan a máquina; rompe una.
- **Registro emocional de la portada**: asombro («esto ya es posible hoy») o indignación útil
  («te cobran por algo que la IA hace gratis»); nunca lástima, nostalgia ni miedo que paraliza.
  Lo que activa se reenvía; lo que deprime, no.
- **Frase de envío con destinatario**: en el caption (línea 2-4) o en el subtítulo de la lámina
  guardable: «Mándaselo a tu socio que sigue cotizando a mano». Los envíos son la señal que más
  pesa para llegar a no seguidores; «comparte con 5» y «comenta SÍ» son cebo y bajan alcance.
- **Originalidad explícita**: cero capturas ajenas, cero memes con texto encima; toda cita
  externa lleva ángulo propio. Desde abril de 2026 la política de contenido original cubre fotos
  y carruseles.
- **`alt` por lámina** (≤1,000 caracteres, lenguaje natural con la palabra clave del tema): no se
  renderiza, pero Instagram y Google indexan ese texto. `caption.txt` los lista para pegarlos al
  subir.

Guarda el JSON en `<carpeta-de-trabajo>/<AAAA-MM-DD>-<slug>/carrusel.json`.

## 5. Imágenes y personalidad (obligatorio, no opcional)

Un carrusel sin imágenes se ve como un PDF. Antes de renderizar, escribe el **plan visual**
lámina por lámina y cúmplelo. Mínimos que QA revisa:

| Lámina | Qué lleva |
|---|---|
| Portada | La cara de la marca en una situación del tema (foto real del banco `assets/fotos/reales/`, avatar o retrato Soul) como `recorte` con `panel` de acento, `derecha`, `fondo` con scrim o `arriba`. Con `recorte` el título vive en la mitad izquierda: **máximo 6 palabras y ninguna de más de 11 letras**, o el ajuste automático lo encoge por debajo del mínimo (QA lo avisa). Más un `sticker` si el tema lo admite («gratis», «guía rápida», «paso 1 de 4») |
| Cuerpo | Al menos **2 láminas de cuerpo con imagen**: un ícono 3D o ilustración del objeto del tema (`abajo` o `centro`), una foto de la marca en situación (`recorte` o `derecha`), una captura real de la herramienta si es tutorial (`arriba` con `foto-texto`). Tres láminas seguidas con el mismo layout **y** el mismo tratamiento visual (sin imagen, sin marcador, sin número) se ven como PDF: varía la imagen o el recurso, no necesariamente el layout |
| Guardable | Tipográfica (es la que se lee), con `kicker` «Guarda esto» y, si sobra espacio, un ícono pequeño `abajo` |
| CTA | La cara de la marca como `recorte` grande (o `marca.avatar`) señalando al botón, con la misma fuente de rostro que la portada (todo real o todo Soul) |

Recursos de personalidad que existen en el motor (úsalos, con medida: dos o tres por carrusel):
`==palabra==` marcador tipo plumón en título o cuerpo · `sticker` píldora girada ·
`imagen.panel` bloque de acento detrás del recorte · `imagen.duotono` foto a un tono del look ·
`grano` textura fina · `foto-texto` (foto arriba, texto abajo) · `numero_fantasma` · chips.

Cómo se consigue cada imagen (`references/IMAGENES.md`):
- **La cara de la marca, en este orden**: (1) el banco de **fotos reales**
  (`assets/fotos/reales/catalogo.json`: situación, fondo, lado del sujeto, looks y temas afines,
  `recorte` PNG con alfa y `url` pública); (2) los **avatares** ilustrados del mismo catálogo
  (`avatares`, un estilo por look, `references/AVATARES.md`) cuando el tono pide dibujo;
  (3) el personaje generado (`assets/fotos/soul/catalogo.json`, o uno nuevo con `soul_2` +
  `soul_id` de `MI-MARCA.md` pidiendo «subject on the right/left third»). Un carrusel usa una
  sola de las tres fuentes. Si el banco no tiene la pose que pide el tema, se amplía con
  `scripts/banco-fotos.py` (cosechar → hoja → curar → recortar → anotar → subir) y queda para
  la próxima vez. Si `MI-MARCA.md` trae `banco_url`, el banco vive en la nube: en una máquina
  nueva `banco-fotos.py bajar <banco_url>` lo trae entero, y `imagen.src` acepta esas URL.
- **Objetos, íconos e ilustraciones**: `nano_banana_pro` (la herramienta puede servirlo como
  `nano_banana_2`), estilo del look (plano y cálido para guía/recurso; 3D con halo para
  oscuro-tech; fotográfico para noticia), fondo liso del color del look o transparente.
- **Escenas de fondo**: `soul_location` para portada-foto sin persona.
- **Capturas reales** de la herramienta cuando el tema es un tutorial: sin datos personales.
- **Un solo rostro por carrusel**: todo real o todo generado con el Soul. Nunca mezclar.
- **Todo el texto va por código; ninguna imagen lleva letras.** Descarga con `curl` desde la URL
  del trabajo a `assets/img/NN-nombre.png` dentro de la carpeta del carrusel.
- Logos de terceros: reales, pequeños, nunca protagonistas de la portada.

## 6. Render y puerta de calidad (bloqueante)

```bash
node "<skill>/scripts/render.mjs" "<carpeta-del-carrusel>"   # slides/01.png… + preview.jpg
node "<skill>/scripts/qa.mjs" "<carpeta-del-carrusel>"       # índice 0-100 + errores/avisos
```

- QA **BLOQUEADO** → corrige el JSON (no el HTML) y vuelve a correr. Máximo tres rondas; si
  persiste, cambia de layout o recorta texto.
- QA **LISTO** (≥80) → abre `preview.jpg` (mosaico) y `portada-270.jpg` (la portada al tamaño de
  la cuadrícula del perfil: si no se lee ahí, no se lee en el feed) con Read y pasa el checklist
  visual de `DIRECCION-DE-ARTE.md` **contando** (kickers, acentos, layouts repetidos, texto en la
  franja inferior, palabras cortadas, imagen con letras, mitad inferior vacía). Si algo no se
  distingue en el mosaico, abre el PNG individual. Lo que falle se corrige aunque QA diga LISTO:
  un 100/100 significa que la pieza cumple las reglas medibles, no que el copy sea bueno.
- Si el usuario tiene un predictor de viralidad (por ejemplo el de Higgsfield, que solo acepta
  video), es opcional: conviértelo en micro-video del gancho solo si lo pide.

## 7. Entrega

La carpeta queda así y se la muestras al usuario con el preview:

```
<carpeta-de-trabajo>/<AAAA-MM-DD>-<slug>/
├── carrusel.json      el guion (fuente de verdad; los cambios se hacen aquí)
├── referencia.md      de dónde salió (si hubo link o captura)
├── assets/img/        imágenes de las láminas
├── slides/            01.png … NN.png  (1080x1350 @2x, cero a la izquierda: así respeta el orden al subir)
├── slides-src/        index.html (se abre en el navegador; botón para descargar PNG sin Playwright)
├── preview.jpg        mosaico para aprobar de un vistazo
├── portada-270.jpg    la portada al tamaño de la cuadrícula del perfil
├── caption.txt        bloque 1: el caption tal cual se pega en Instagram (hashtags al final);
│                      después una línea `---` y las notas (palabra clave, entregable, orden de subida, avisos)
├── qa.json            el informe de la puerta de calidad
└── metadata.json      con las claves de templates/metadata.ejemplo.json (medir.py las lee)
```

Escribe `caption.txt` y `metadata.json` tú (el render no los genera; usa exactamente las claves
de `templates/metadata.ejemplo.json`: `slug, fecha, tema, tipo, objetivo, look, laminas, hook,
palabra_clave, entregable, entregable_existe, referencia, indice_qa, veredicto_qa, rondas_qa,
imagenes, fuentes, mediciones, notas`). Cierra con: qué palabra clave hay que conectar en la
automatización de DM (ManyChat u otra) y si ya existe, qué entregable prometiste y si ya existe,
y en qué orden subir las imágenes. En las notas de `caption.txt` van siempre dos avisos: al
subir, agrega una pista de música de la librería (un carrusel 100% fotos con música es elegible
para la pestaña Reels) y, si son más de 10 láminas, se suben a mano desde la app (la API acepta
10). **Nunca publicas**: el usuario sube el post.

## 8. Medir y aprender

A las 48 h y a los 7 días: `python3 "<skill>/scripts/medir.py" <carpeta> --permalink <url>` (con
Windsor.ai) o `--manual reach=… saves=… shares=… comments=…` desde Insights de la app. El script
anota `metadata.json` (con `save_rate`, `share_rate` y `like_rate` sobre alcance: se comparan
tasas, no totales) y actualiza `historico.json`. Antes del siguiente carrusel, lee el histórico:
hit (≥3x la mediana) → repite formato y haz serie; flop (<0.5x) → no repitas ese gancho ni ese
tema tal cual. Detalle en `references/MEDICION.md`.

## Lo que el usuario puede pedirte

| Dice | Haces |
|---|---|
| «Hazme un carrusel sobre X» / «/carrusel X» | Las 8 fases, sin preguntas, con valores por omisión |
| «De este link» / «de esta captura» | Fase 1 con `referencia.py` o visión, y luego todo |
| «Dame 3 opciones» / «3 ganchos» | Muestra los 3 ángulos puntuados y espera elección |
| «Cambia el look» / «hazlo oscuro» | Cambia `look` en el JSON, re-render, re-QA |
| «Otra portada» | 3 portadas nuevas (título + subtítulo + imagen) y eliges o preguntas |
| «Más corto» / «10 láminas» | Reestructura sin perder la guardable ni el CTA |
| «Versión para <otra marca>» | Nueva ficha `MI-MARCA.md` en otra carpeta; nunca mezcles marcas |
| «Mide este carrusel» | Fase 8 |
| «Empaqueta la skill» | `bash scripts/empaquetar.sh` → `dist/*.skill` para subir a claude.ai |
| «Haz una serie» | 3-5 carruseles con el mismo look y esqueleto, numerados, un tema por pieza (anota en `notas` que el look se repite a propósito) |
| «Otro carrusel hoy» | Corre `siguiente-look.mjs`: mira las carpetas hermanas del día, no solo el histórico |
| «Arma / amplía mi banco de fotos» | `scripts/banco-fotos.py` cosechar (carpeta o álbum de Fotos) → hoja → mira las hojas con la herramienta de imágenes y elige → curar → recortar → anotar → subir. Cuéntale qué entró y qué poses faltan |
| «Hazme avatares» / «mi cara en dibujo» | `references/AVATARES.md`: 2-3 fotos reales limpias como referencia, un estilo por look, recorte con `remove_background`, registrar con `banco-fotos.py avatar` y subir |
| «Sube / baja mi banco a la nube» | `banco-fotos.py subir` (token en `~/.vercel-blob-cli/.env`) o `bajar <banco_url>`; anota `banco_url` en `MI-MARCA.md` |

## Reglas que no se rompen

1. Sin `MI-MARCA.md` no hay carrusel. Sin tema no hay carrusel.
2. Una idea por lámina. Si aparece "y además/también", son dos láminas.
3. Cifras con fuente o no van. Nada de "300 videos al día" si no hay respaldo.
4. Cero frases de la lista negra de IA. Lee el copy en voz alta antes de renderizar.
5. Todo el texto por código; ninguna imagen con letras; ninguna persona real sin permiso.
6. Un solo CTA, una sola palabra clave, un entregable que no está en el carrusel.
7. El look rota: nunca el mismo que el carrusel más reciente (medido o no), salvo dentro de una
   serie declarada. Fraunces y crema+latón no existen aquí.
8. QA bloqueado = no se entrega. El checklist visual se pasa contando, no opinando.
9. Nunca publicas ni tocas la cuenta del usuario. Entregas la carpeta.
10. Lo que el usuario corrige a mano en el JSON se respeta en la siguiente ronda.

## Anti-patrones (los que matan el alcance)

Formato 1:1 · portada sin promesa ni palabra en acento · texto chico o párrafos · más de 12
láminas sin serializar · "link en bio" o cinco CTA compitiendo · palabra clave solo en el caption ·
lámina de venta sin valor antes · reciclar el diseño exacto de otro creador · logos ajenos como
protagonistas · promesa de la portada que las láminas no cumplen · optimizar para likes.

## Lo que esta skill NO hace

Reels o video (usa una skill de video) · auditoría completa de la cuenta · publicar por API ·
prometer resultados: el índice de viralidad mide si la pieza cumple las reglas que suben la
probabilidad, no garantiza alcance.
