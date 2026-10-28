---
name: carruseles-virales-ia
description: Produce carruseles de Instagram útiles y revisados (PNG 1080x1440 listos para subir + caption) a partir de un tema, un link (YouTube, artículo, reel) o una captura de pantalla de referencia. Aplica la psicología del swipe, del guardado y del compartido; escribe con voz humana; diseña por código con 6 looks disponibles; pasa una puerta de calidad medible (QA técnico 0-100; no predice resultados) y aprende de los resultados. Triggers "hazme un carrusel", "carrusel sobre", "carrusel de este link", "convierte esto en carrusel", "slides para Instagram", "/carrusel". NO usar para reels ni video, ni para auditar una cuenta completa.
version: 1.1 (2026-09-22)
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

## Política vigente · 2026-09-22.1

Lee **[CALIDAD-Y-EVIDENCIA.md](references/CALIDAD-Y-EVIDENCIA.md) completa** antes de planificar. Manda sobre reglas editoriales anteriores: máximo tres propuestas textuales por día y una final seleccionada; utilidad, evidencia y guion antes del gasto; activos existentes primero. Si ninguna propuesta cumple, cero finales. No hay garantía de viralidad ni cuota de fotos. Los contratos históricos conservan recibos y schema al reanudar, sin autorizar nuevas variantes pagadas. Los límites efectivos pertenecen al runtime.

## 0. Antes de escribir una lámina (en cada corrida)

1. **Lee `MI-MARCA.md`** en la carpeta de trabajo. Si no existe, cópialo de `templates/MI-MARCA.md`
   y haz **una sola ronda de 6 preguntas** en un solo mensaje (quién eres, a quién le hablas, cómo
   suenas, qué regalas por DM, fotos/colores, qué te ha funcionado). Si el usuario ya dio parte de
   eso en su mensaje, no lo repitas: llénalo y marca `[CONFIRMAR]`. Sin ficha no se produce.
2. **Lee `historico.json`** si existe: qué problemas, recompensas y looks se usaron, qué hooks
   y formatos ganaron, qué flopeó.
3. **Lee `references/CALIDAD-Y-EVIDENCIA.md` completa.** Consulta
   `references/PSICOLOGIA-VIRALIDAD.md` como contexto de hipótesis y `references/FORMATOS.md` como contrato técnico. Las demás referencias se leen cuando la fase lo indique.
4. **Decide el alcance** con lo que pidió el usuario y estos valores por omisión:

| Dato | Si no lo dijo | 
|---|---|
| Tema | Es lo ÚNICO obligatorio. Si solo hay un link o una captura, el tema sale de ahí |
| Objetivo | `saves` (guía/lista/recurso) o `shares` (contrarian/noticia). Nunca "likes" |
| Tipo | El que dicte `FORMATOS.md` según el tema; guía o lista por omisión |
| Láminas | Las mínimas que entreguen el valor y admita el motor. No rellenar hasta ocho. Una imagen o un formato de tres sólo si su rama/adaptador pasa QA |
| Look | El que diga `node "<skill>/scripts/siguiente-look.mjs" <carpeta-de-trabajo> --tipo <tipo>` (ver §2) |
| Palabra clave | Opcional. Sólo si recurso, destino y entrega están comprobados; si no, guardar o compartir según objetivo |
| Entregable por DM | Opcional y existente. El valor prometido queda en la pieza; el recurso externo amplía o facilita copiar. Registrar `metadata.entregable_existe` sin inventar disponibilidad |
| Formato | `3:4` (1080x1440) o `4:5` (1080x1350), uniforme y compatible con el destino. Es una elección de composición, no ranking demostrado |

## 1. La entrada: tema, link o captura → `referencia.md`

- **Tema en texto:** anota en una línea qué le duele a la audiencia con eso y qué se lleva.
- **Link:** corre `python3 "<skill>/scripts/referencia.py" "<url>" --out <carpeta-del-carrusel>`.
  Trae la transcripción (YouTube), el texto (artículo, PDF) o la transcripción del reel (si hay
  `APIFY_TOKEN`). Un post de Instagram (`/p/`, `/reel/`) trae además caption, dueño, likes,
  comentarios y baja las láminas a `_referencia/NN.jpg`: léelas con visión como una captura (o, sin
  Claude Code, `node "<skill>/scripts/leer-imagen.mjs" <carpeta>/_referencia --out
  <carpeta>/referencia.md --append` escribe la sección «Lectura visual» por API). Si no consigue
  texto, dilo y pide que lo peguen; no inventes el contenido.
- **Captura o PNG de un carrusel ajeno:** léelo con visión, lámina por lámina, y llena la ficha
  de `references/REFERENCIAS-ENTRADA.md` (gancho literal, promesa, estructura, mecanismo, qué
  aplica a tu audiencia). **Se replica el ángulo y la estructura, nunca el texto, las imágenes ni
  el diseño exacto.**
- **Carrusel propio anterior:** parte del `carrusel.json` viejo y del resultado en `historico.json`.

Guarda todo en `<carpeta-del-carrusel>/referencia.md` con la sección "Notas para el carrusel"
llena. De ahí sale el **ángulo**: una frase, en la voz de la marca, que un dueño de negocio de
50 años entiende sin contexto.

## 2. Formato, propuesta y selección

Lee `references/FORMATOS.md` y el capítulo pertinente de `PROTOCOLOS-FORMATO.md` como repertorio de estructuras, no recetas causales. Primero decide qué obtiene el lector; después formato y longitud. El look se elige por legibilidad, función y marca. `scripts/siguiente-look.mjs` es una sugerencia de rotación, no una obligación de regenerar ni una prueba de rendimiento. Se permite mantener identidad de una serie.

## 3. Tres propuestas textuales, una producción

Prepara como máximo tres fichas siguiendo `CALIDAD-Y-EVIDENCIA.md`: situación, promesa, recompensa literal, ejemplo/prueba, fuentes, diferencia frente al histórico y activos existentes. Compara utilidad, especificidad, evidencia, encaje, novedad y coste. Elige una; si ninguna cumple, corrige el concepto sin imágenes pagadas. No renderices tres formatos ni compres cuatro portadas por rutina.

Escribe el guion completo de la elegida y pasa la puerta editorial antes de producir arte. Por API, `scripts/escribir.mjs --formato-plan <imagen-unica|carrusel-5|carrusel-8|referencia>` sigue disponible según el contrato, pero no ejecutar todos los planes por defecto. Usa `--simular carrusel.json` para comprobar render y QA sin pagar API. Los encargos antiguos conservan sus banderas/recibos para reanudar sin repetir gasto.

Una duda concreta de composición puede compararse con dos portadas por código y el mismo activo. Mirar a 270 px y elegir por claridad de promesa y legibilidad; no crea autorización para otra generación. La portada merece revisión real, pero no se le atribuye “el 80% del resultado”.

## 4. Escribir `carrusel.json` (el guion)

Sigue el contrato de `references/LAYOUTS.md` (campos y límites exactos) y las reglas de voz de
`references/COPY-VOZ-HUMANA.md`. Roles del formato largo; adaptar al formato soportado sin inventar requisitos para piezas compactas:

| Lámina | Rol | Qué hace |
|---|---|---|
| 1 | `portada` | Gancho de 4-7 palabras con UNA palabra en `*acento*`, subtítulo con número, chips o imagen que anuncian el recorrido, "Desliza" al pie |
| 2 | `rehook` | Primer ejemplo, prueba o paso que ya paga la promesa. Se entiende sola; no repite la portada |
| 3…N-2 | `cuerpo` | **Una idea por lámina**, con paso, prueba, ejemplo o criterio; ≤25 palabras de cuerpo como pauta de lectura. Los loops son selectivos; aportar valor temprano |
| N-1 | `cheatsheet` | Lámina guardable: lista, pasos, prompt o comparativa autocontenida. Es lo que justifica el guardado |
| N | `cta` | Una acción coherente. La cara es opcional. DM sólo con recurso y entrega comprobados; la recompensa prometida no se retiene para pedir interacción |

Reglas de copy que QA revisa: ≤40 palabras por lámina (≤70 en la guardable), números sólo cuando orientan o tienen fuente, cero frases de la lista negra (y las palabras prohibidas de `MI-MARCA.md`),
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
  guardable: «Mándaselo a tu socio que sigue cotizando a mano». No convertir esta frase en obligación ni afirmar pesos de ranking no verificados; evitar cadenas de interacción.
- **Originalidad explícita**: cero capturas ajenas, cero memes con texto encima; toda cita
  externa lleva ángulo propio. Desde abril de 2026 la política de contenido original cubre fotos
  y carruseles.
- **`alt` por lámina** (≤1,000 caracteres, lenguaje natural con la palabra clave del tema): no se
  renderiza, pero Instagram y Google indexan ese texto. `caption.txt` los lista para pegarlos al
  subir.

Guarda el JSON en `<carpeta-de-trabajo>/<AAAA-MM-DD>-<slug>/carrusel.json`.

## 5. Recursos visuales con función

Antes de renderizar, identifica por lámina qué recurso explica, demuestra, permite reconocer el tema o aporta identidad. **No hay mínimo editorial de imágenes ni rostro obligatorio.** Una pieza tipográfica o un diagrama pueden resolverlo; respeta las restricciones reales del renderer/adaptador. Reutiliza banco, fotos y capturas propias antes de pagar. Una generación nueva necesita justificar qué añade y por qué un activo existente no basta.

Repetir foto o retícula es válido cuando la información avanza. No generar para rellenar espacio, rotar estilo o cumplir una cuota. Si el motor exige un activo, reutiliza uno pertinente; no simules soporte de cero assets. Para tutoriales, la captura real prueba la acción; una pantalla generada no la sustituye. Manuel aparece cuando aporta o el brief lo pide, con identidad y procedencia consistentes.

Recursos de personalidad que existen en el motor (úsalos, con medida: dos o tres por carrusel):
`==palabra==` marcador tipo plumón en título o cuerpo · `sticker` píldora girada ·
`imagen.panel` bloque de acento detrás del recorte · `imagen.duotono` foto a un tono del look ·
`grano` textura fina · `foto-texto` (foto arriba, texto abajo) · `numero_fantasma` · chips.

Cómo se consigue cada imagen (`references/IMAGENES.md`):
- **La cara de la marca.** Hay tres bancos y se elige por lo que la pieza necesita:
  **avatares** (`avatares` en `assets/fotos/reales/catalogo.json`, un estilo por look) cuando el
  carrusel quiere ser dinámico y llamativo, que es la mayoría; **fotos reales**
  (`assets/fotos/reales/catalogo.json`: situación, fondo, lado del sujeto, looks y temas,
  `recorte` PNG con alfa y `url` pública) cuando la pieza pide credibilidad sobria; el
  **personaje generado** (`assets/fotos/soul/`) cuando falta una escena que ninguno cubre.
  Los avatares se generan **desde las fotos reales**, con poses que hacen algo (señalar,
  levantar la palma, mostrar el celular) y líneas de acción: `references/AVATARES.md` trae los
  prompts y la trampa del color (el avatar lleva el acento del look en la piel, así que no va
  sobre un `panel` de ese mismo acento). Un carrusel usa una sola de las tres fuentes. Si el banco no tiene la pose que pide el tema, se amplía con
  `scripts/banco-fotos.py` (cosechar → hoja → curar → recortar → anotar → subir) y queda para
  la próxima vez. Si `MI-MARCA.md` trae `banco_url`, el banco vive en la nube: en una máquina
  nueva `banco-fotos.py bajar <banco_url>` lo trae entero, y `imagen.src` acepta esas URL.
- **Marcas y apps con nombre propio** (CapCut, Claude, WhatsApp, Excel): su **logo real**, bajado
  de internet, nunca uno dibujado por la IA. La API de la App Store lo da a 512 px sin clave;
  móntalo con esquinas redondeadas sobre fondo transparente (receta en `IMAGENES.md` §5).
- **Ningún PNG con fondo sólido**: el fondo del slide es un degradado y la caja del PNG se ve.
  Todo objeto va con transparencia (genera sobre fondo liso y pasa `remove_background`).
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
node "<skill>/scripts/qa.mjs" "<carpeta-del-carrusel>"       # QA técnico 0-100 + errores/avisos
node "<skill>/scripts/qa.mjs" "<carpeta>" --imagen-unica      # pieza de 1 lámina: sin rehook, guardable ni lámina de CTA
```

- QA **BLOQUEADO** → corrige el JSON (no el HTML) y vuelve a correr. Máximo una ronda automática de corrección material; si
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
palabra_clave, entregable, entregable_existe, palabra_clave_conectada, publicaría, referencia,
indice_qa, veredicto_qa, rondas_qa, imagenes, fuentes, mediciones, notas`; `publicaría` es tu
veredicto honesto de si lo subirías tal cual, y `palabra_clave_conectada` si el flujo de DM ya
responde a esa palabra). Cierra con: qué palabra clave hay que conectar en la
automatización de DM (ManyChat u otra) y si ya existe, qué entregable prometiste y si ya existe,
y en qué orden subir las imágenes. En las notas de `caption.txt`, distingue restricciones del canal comprobadas de sugerencias. La música es opcional si el destino la permite; no genera audio ni vídeo por rutina. Verifica el límite vigente del canal antes de entregar una pieza larga. **Nunca publicas**: el usuario sube el post.

## 8. Medir y aprender

A las 48 h y a los 7 días: `python3 "<skill>/scripts/medir.py" <carpeta> --permalink <url>` (con
Windsor.ai) o `--manual reach=… saves=… shares=… comments=…` desde Insights de la app. El script
anota `metadata.json` (con `save_rate`, `share_rate` y `like_rate` sobre alcance: se comparan
tasas, no totales) y actualiza `historico.json`. Antes del siguiente carrusel, lee el histórico:
compara edades, objetivos y formatos semejantes. ≥3x o <0.5x son alertas internas, no prueba causal; una pieza aislada no convierte un tema en ganador o perdedor. Detalle en `references/MEDICION.md`.

## 9. Autoentrenamiento (cada corrección se aprende en el momento)

Cuando el usuario corrige algo («no uses X», «así no», «me gustó Y, hazlo siempre»), la
corrección se escribe en la skill **antes de terminar el turno**, no en una nota mental: la regla
va al archivo de `references/` que corresponde (imágenes, avatares, layouts, copy, formatos), la
excepción de marca va a `MI-MARCA.md`, y si el motor lo permite se convierte en una comprobación
de `scripts/qa.mjs` para que no dependa de la memoria de nadie. Registra en `LECCIONES.md` (raíz de la
skill) la fecha, qué cambió y en qué archivo. No hagas commit, push ni publicación sin autorización explícita. Mantén cambios privados y comprobables; el empaquetado se hace cuando corresponda al alcance. Cuando el usuario manda links de
referencia para aprender, se deconstruyen con `references/REFERENCIAS-ENTRADA.md` §«Estudio en
lote» y el resultado entra a `ANATOMIA-REFERENCIAS.md` y `PROTOCOLOS-FORMATO.md`.

## Lo que el usuario puede pedirte

| Dice | Haces |
|---|---|
| «Hazme un carrusel sobre X» / «/carrusel X» | Las 8 fases, sin preguntas, con valores por omisión |
| «De este link» / «de esta captura» | Fase 1 con `referencia.py` o visión, y luego todo |
| «Las 3 versiones por API» / un worker sin Claude Code | `scripts/escribir.mjs --formato-plan …` una vez por formato (§3b), con `--banco`, `--logos` y `--json` |
| «Dame 3 opciones» / «3 ganchos» | Muestra los 3 ángulos puntuados y espera elección |
| «Cambia el look» / «hazlo oscuro» | Cambia `look` en el JSON, re-render, re-QA |
| «Otra portada» | 3 portadas nuevas (título + subtítulo + imagen) y eliges o preguntas |
| «Más corto» / «10 láminas» | Reestructura sin perder la guardable ni el CTA |
| «Versión para <otra marca>» | Nueva ficha `MI-MARCA.md` en otra carpeta; nunca mezcles marcas |
| «Mide este carrusel» | Fase 8 |
| «Empaqueta la skill» | `bash scripts/empaquetar.sh` → `dist/*.skill` para subir a claude.ai |
| «Haz una serie» | 3-5 carruseles con el mismo look y esqueleto, numerados, un tema por pieza (anota en `notas` que el look se repite a propósito) |
| «Otro carrusel hoy» | Corre `siguiente-look.mjs`: mira las carpetas hermanas del día, no solo el histórico |
| «Aprende de estos carruseles» / links de referencia | `REFERENCIAS-ENTRADA.md` §«Estudio en lote»: bajar los posts a `_entrenamiento/refs/`, un análisis por post con visión, clasificar por formato, protocolo por formato con refutador, escribir `ANATOMIA-REFERENCIAS.md` y `PROTOCOLOS-FORMATO.md`; conservar cambios locales sin publicar ni hacer commit/push salvo autorización |
| «Arma / amplía mi banco de fotos» | `scripts/banco-fotos.py` cosechar (carpeta o álbum de Fotos) → hoja → mira las hojas con la herramienta de imágenes y elige → curar → recortar → anotar → subir. Cuéntale qué entró y qué poses faltan |
| «Hazme avatares» / «mi cara en dibujo» | `references/AVATARES.md`: 2-3 fotos reales limpias como referencia, un estilo por look, recorte con `remove_background`, registrar con `banco-fotos.py avatar` y subir |
| «Sube / baja mi banco a la nube» | `banco-fotos.py subir --mi-marca MI-MARCA.md` (token en `~/.vercel-blob-cli/.env`) o `bajar <banco_url>`. Con `--rotar` cambia el prefijo y mata las URL viejas; el almacén publica `robots.txt` con `Disallow: /` para no indexarse |
| «Móntame el generador en el servidor» | `worker/README.md`: el worker que atiende los pedidos del módulo «Generador de carruseles» del Centro de Control de Marca en un VPS con Docker (Supabase + Vercel Blob + esta skill); se despliega con `docker compose up -d --build` |

## Reglas que no se rompen

1. Marca y tema respaldados; promesa cumplida y ejemplo o evidencia útiles antes de gastar.
2. Un final seleccionado dentro del límite diario; propuestas no equivalen a imágenes pagadas.
3. Hechos con fuente, experiencias acreditadas y ejemplos simulados identificados. No inventar métricas.
4. Guardados/compartidos externos ausentes son `null`; likes/comentarios no los sustituyen.
5. Texto legible, identidad consistente y recursos con procedencia; no fabricar pruebas de interfaz.
6. Una acción realizable; no inventar DM, recurso ni comentarios de engagement.
7. Reutilizar activos y recibos. No regenerar por estética rutinaria ni repetir cobros inciertos.
8. QA técnico y revisión de todos los PNG son necesarios; una nota no predice viralidad.
9. Esta skill entrega archivos, no publica ni concede permisos sobre cuentas.
10. Respetar correcciones manuales; no convertir contratos históricos al reanudar.

## Alcance

Tema, link o referencia → ficha y guion → arte justificado → PNG, caption, preview y evidencia de QA. No produce reels/vídeo ni sustituye una auditoría completa de cuenta. No promete resultados, ni hace commit/push o publicación por terminar una corrección.
