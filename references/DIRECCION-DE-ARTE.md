# Dirección de arte de un carrusel

Este documento se lee antes de escribir `carrusel.json`, no después de renderizar. Define qué look usar, cómo se compone cada lámina y cómo se revisan los PNG. Todo lo que aquí se nombra (looks, layouts, campos) existe con ese nombre exacto en `templates/carrusel.schema.json`, `templates/base.css`, `templates/looks/*.css` y `scripts/lib/construir-html.mjs`. Si un nombre no está ahí, no existe.

La medida manda sobre el gusto. Cada regla trae un número para que se pueda contar.

## 1. El look por omisión de la IA está prohibido

Cuando a un modelo se le pide "un carrusel bonito" sin más, produce siempre lo mismo: fondo crema o beige (`#f5f1ea`, `#faf7f1`, `#efeae0`), acento latón u ocre (`#b08947`, `#bc7c3a`), texto espresso, titular en `Fraunces` o `Instrument Serif`, tarjetas de vidrio con borde translúcido, un resplandor difuminado detrás del título y un epígrafe en versalitas arriba de cada lámina. Se ve "premium" en la primera pieza y hace invisible a la marca en la quinta, porque miles de cuentas publican exactamente eso.

Por eso en esta skill:

| Prohibido por reflejo | Qué se usa en su lugar |
|---|---|
| `Fraunces`, `Instrument Serif`, cualquier serif display "porque se ve editorial" | Solo las 9 familias empaquetadas en `assets/fonts/`: Inter Tight, Archivo Black, Archivo, Oswald, Manrope, Space Grotesk, Bricolage Grotesque, JetBrains Mono, Anton |
| Crema + latón + espresso como paleta | Una de las 6 paletas de `templates/looks/`, sin modificar los hex |
| Resplandores, halos que laten, degradados morado/azul | Profundidad con filetes (`--filete`), placas (`--card`) y contraste de tamaño. El único halo permitido es el del look `oscuro-tech`, que ya viene en su CSS |
| Tarjetas de vidrio para agrupar | `lista` con filete superior, `comparativa` con dos columnas, `pasos` con número grande |
| Un kicker en cada lámina | Máximo 1 `kicker` cada 3 láminas |
| Una palabra en serif dentro de un título sans | `*palabra*` en el título: el acento es color, no otra familia |
| Emoji como icono o logotipo | Ilustración propia o imagen generada con `imagen.prompt` (sin texto dentro de la imagen) |

Esta lista se adapta de la skill `direccion-de-arte` del autor. La razón de fondo: la audiencia tiene 35 a 60 años, lee en el celular y a brazo extendido; el "look de IA" reduce el contraste y sube el ruido justo donde menos aguanta el ojo.

### Rotar looks es obligatorio

`node scripts/siguiente-look.mjs <carpeta-de-trabajo> --tipo <tipo>` aplica estas reglas en un solo orden y mira también las carpetas hermanas del día (no solo `historico.json`, que se llena al medir). Usa su `recomendado`.


Dos carruseles consecutivos no pueden llevar el mismo look. Antes de elegir, lee `historico.json` (lo escribe `scripts/medir.py` en la carpeta padre de los carruseles; cada renglón trae `slug`, `fecha`, `look`, `tipo`, `reach`, `saves`, `save_rate`). Reglas:

1. El `look` del último renglón queda vetado para el carrusel nuevo.
2. En los últimos 4 renglones ningún look puede aparecer más de 2 veces.
3. Alterna fondo claro y fondo oscuro: claros son `guia-rapida`, `recurso` y `editorial-mono`; oscuros son `noticia`, `oscuro-tech` y `bosque`. Si el anterior fue oscuro, el nuevo es claro, salvo que el tipo de contenido no lo permita (ver fichas).
4. Si no existe `historico.json`, elige por tipo de contenido con la tabla de la sección 2 y anótalo en `notas`.

La rotación no es capricho: en el feed del perfil las portadas se ven en cuadrícula de 3. Tres portadas iguales seguidas parecen un solo post.

## 2. Ficha de los 6 looks

Los nombres son los valores exactos del campo `look`. Las tipografías se nombran por rol: display (`.titulo`, `.dato`, `.cita`), sub (`.sub`, `.numero`, `.idx`), cuerpo (`.cuerpo`, `.item .txt`, `.paso .t`) y etiqueta (`.top`, `.bottom`, `.kicker`, `.chip`). Cuerpo y etiqueta son iguales en todos los looks: Manrope y Space Grotesk. Lo que cambia es display, sub, paleta y caso.

| look | Fondo | Tinta | Acento | Display | Sub | Sirve para |
|---|---|---|---|---|---|---|
| `guia-rapida` | `#EDE7DC` hueso | `#0E0E10` | `#0044DD` azul eléctrico | Inter Tight 900, MAYÚSCULAS | Oswald, MAYÚSCULAS | guías, listas, "N cosas" |
| `noticia` | `#071B4A` azul profundo (radial hasta `#143B8F`) | `#FFFFFF` | `#FFD200` amarillo | Archivo Black, MAYÚSCULAS | Manrope | news-jacking, datos, lanzamientos |
| `oscuro-tech` | `#0B0B0D` negro con halo cálido | `#FFFFFF` | `#FF7A1A` a `#FF3D6E` en degradado (solo en `*acento*`) | Inter Tight 900, caja baja | Manrope | herramientas, integraciones, "X + IA" |
| `recurso` | `#FBF7F0` crema con barra superior coral | `#141210` | `#BE4B2F` coral | Inter Tight 900, MAYÚSCULAS | Manrope 700 | recursos gratis, listas numeradas de cosas concretas |
| `bosque` | `#0F3D2E` verde profundo | `#F3EDE0` hueso | `#E0B24A` ámbar | Bricolage Grotesque 800, caja baja | Manrope | piezas de comunidad o evento, descanso entre looks |
| `editorial-mono` | `#F4F3EF` papel | `#0A0A0A` | `#C81E12` rojo | Archivo Black, caja baja | Space Grotesk 700 | contrarian, mitos vs realidad, manifiestos |

### `guia-rapida`

Hueso, negro y azul eléctrico. El título va en mayúsculas apretadas (`letter-spacing -0.03em`), el subtítulo en Oswald condensada, los `chips` alternan negro y azul y anuncian el recorrido. Dos círculos blancos translúcidos en las esquinas dan aire sin meter ruido. Número fantasma en azul al 7%.

Evidencia: es el look del carrusel "5 generaciones" del autor: 98,609 de alcance y 3,345 guardados, más guardados que likes (2,452). La portada era un titular imperativo de dos líneas en negro con una palabra en color, subtítulo con número, chips con los apartados y "Desliza" al pie.

Úsalo cuando el contenido es una guía con estructura visible: "7 prompts", "5 formas de", "3 errores". Combina con `punto-numero` en el cuerpo y `lista` o `pasos` como lámina guardable.

No lo uses para noticias (el hueso le quita urgencia) ni para piezas con foto grande de fondo: el scrim claro lava la imagen.

### `noticia`

Azul profundo con degradado radial hacia arriba, titular blanco en Archivo Black mayúsculas con UNA palabra en amarillo. Foto a sangre opcional con `imagen.pos: "fondo"`; el scrim del look oscurece el 55% inferior para que el texto no compita.

Evidencia: es el look del carrusel de Wall Street: 34,882 de alcance, 1,474 guardados y 226 seguidores nuevos. Funcionó porque el dato respaldaba al titular en la misma lámina.

Úsalo para "X acaba de hacer Y", cifras de un reporte, lanzamientos de una herramienta. La portada lleva `portada-foto` si hay una imagen propia o generada; si no, `portada-titulo` con `dato-hero` en la lámina 2.

No lo uses para tutoriales paso a paso ni para listas largas: el Archivo Black en mayúsculas ocupa mucho ancho y las láminas densas se aprietan. Tampoco uses fotogramas de películas o material de terceros como fondo: funcionó una vez y es un riesgo de derechos.

### `oscuro-tech`

Negro con un halo naranja tenue al centro (ya viene en el CSS, no agregues otro). Título en caja baja con tracking negativo; la palabra en `*acento*` se pinta con degradado naranja a rosa. Chips y kicker en blanco al 10%.

Evidencia: es el look de "Conecta tu Instagram a Claude": 54,866 de alcance, 3,087 guardados y 334 seguidores reales. El titular era "herramienta + herramienta = resultado" con iconos al centro.

Úsalo para integraciones, comparativas de herramientas, "cómo conecto A con B", prompts para copiar (`prompt` se ve nativo sobre negro).

No lo uses dos veces seguidas ni después de `bosque` o `noticia` (tres oscuros al hilo en la cuadrícula). No lo uses para temas de dinero o negocio tradicional: el halo naranja lee "tech" y descoloca al lector de 50 años.

### `recurso`

Crema con una barra superior de 112px en coral que lleva serie y paginador, pie de 120px con filete. Título en mayúsculas negras con la palabra fuerte en coral; el personaje o la ilustración va al centro con `imagen.pos: "centro"` y el título baja al 60% de la altura. "Desliza" se dibuja como píldora con borde coral.

Evidencia: es el look de "8 páginas para dominar Claude": 921 guardados sobre 12,055 de alcance, 7.6% de tasa de guardado, la más alta de la cuenta.

Úsalo para recursos, herramientas gratis, "N páginas / N apps / N plantillas". Cada lámina de cuerpo es un `punto-numero` con un solo recurso y una línea que dice para qué sirve.

No lo uses para opinión o contrarian: el coral y el contador `01/09` prometen catálogo, no postura.Lleva ilustración o personaje en la portada y en una o dos láminas de cuerpo; el resto va tipográfico, como en todos los looks.

### `bosque`

Verde profundo, hueso y ámbar en proporción 60-30-10. Es la firma de la empresa del autor, refinada para carrusel: el ámbar es el ÚNICO acento. Display en Bricolage Grotesque 800 caja baja. Admite láminas claras con `"clase": "claro"` (fondo hueso, tinta verde oscuro) para descansar la vista a mitad del recorrido.

Evidencia: no hay una portada ganadora atribuible a este look; su respaldo es de marca, no de métrica. Trátalo como el look de identidad y mídelo con `medir.py` antes de darle prioridad.

Úsalo para piezas de comunidad, eventos y cuando la cuenta lleva 3 o 4 carruseles con looks fuertes y necesita uno que firme.

No lo uses para noticias ni herramientas: el verde no lee urgencia ni tecnología. No mezcles ámbar con otro acento aunque el tema "pida" azul.

### `editorial-mono`

Papel, tinta y un golpe rojo. Sin degradados, sin círculos, sin halo. Un filete negro de 160px arriba del contenido en cada lámina. El `numero_fantasma` aquí NO es fantasma: se pinta rojo sólido a 260px y empuja el contenido a 420px del borde superior (clase `con-numero` automática).

Evidencia: sin métrica propia todavía. Se adapta de la lógica "número gigante + regla corta" de Carrusel Studio de Ruva IA (youtube.com/@RuvaIA), que la usa para láminas de reglas numeradas.

Úsalo para "lo que nadie te dice", mitos vs realidad, manifiestos de 5 reglas, `cita` con autor. Es el descanso natural después de `oscuro-tech` o `noticia`.

No lo uses cuando hay más de 40 palabras por lámina: el Archivo Black a 84px ya ocupa 2 líneas con 5 palabras. No lo uses con fotos de fondo: el papel no las sostiene.

### Cómo se elige, en orden

1. Lee `historico.json` y aplica la rotación (sección 1).
2. Cruza `tipo` con la tabla: `guia`/`lista` → `guia-rapida` o `recurso`; `noticia` → `noticia`; `tutorial`/`prompt` → `oscuro-tech`; `recurso` → `recurso`; `contrarian`/`historia` → `editorial-mono`; `comparativa` → `oscuro-tech` o `editorial-mono`; comunidad o evento → `bosque`.
3. Si los dos candidatos sobreviven a la rotación, gana el que alterna claro/oscuro con el anterior.
4. Anota en `notas` el look descartado y por qué. Eso alimenta la siguiente elección.

## 3. Reglas de composición medibles

Todo esto ya está en `base.css`; aquí se nombra para que se revise, no para que se reescriba.

| Regla | Valor | Dónde vive |
|---|---|---|
| Lienzo | 1080 × 1350 px (`formato` `4:5`, por omisión). `3:4` = 1080×1440, `1:1` = 1080×1080, `9:16` = 1080×1920 | `FORMATOS` en `construir-html.mjs` |
| Margen seguro | 80 px en los 4 lados. Ningún texto lo cruza; solo `.bg` y `.img-abajo` sangran | `--safe` |
| Franja inferior | 140 px sin texto crítico. Ahí solo van `.bottom` (handle y paginador) o el botón del CTA. Instagram recorta esa zona en la cuadrícula 3:4 y la tapa en Reels | `--ui-bottom` |
| Área de contenido | de 150 px a 1200 px de alto (1350 − 150). Denso (`lista`, `comparativa`, `pasos`, `prompt`) alinea arriba; el resto centra | `.contenido` |
| Tres niveles por lámina | Nivel 1 (display) ≥ 84 px. Nivel 2 (sub o cuerpo) ≥ 38 px. Nivel 3 (micro: top, bottom, chips, kicker, autor) ≥ 30 px | `.titulo.t-xs`, `.item small`, `.top` |
| Ratio nivel 1 : nivel 3 | ≥ 2.5. Con título a 84 y micro a 32 da 2.6; con `t-xl` a 156 da 4.9. Si el ajuste automático baja el título por debajo de 84 px (el mínimo que revisa `qa.mjs`), hay que recortar texto | script `fit` en el HTML |
| Un solo acento por lámina | Una palabra en `*acento*` en el título, o un `dato`, o un `numero`. Nunca dos elementos compitiendo por el color | `--acento` |
| 60-30-10 | 60% fondo, 30% tinta, 10% acento. En una lámina de 1080×1350 el acento no pasa de ~145,000 px² (un título de una línea a 100 px, un chip, un botón) | proporción de área |
| Esqueleto constante | 80% de las láminas usan el mismo layout de cuerpo (`punto-numero` o `texto-pleno`). El 20% restante es la variación: `dato-hero`, `comparativa`, `pasos`, `lista`, `cita`, `prompt` | campo `layout` |
| Una familia de layout por uso | `lista`, `comparativa`, `pasos`, `prompt`, `cita` y `dato-hero` aparecen máximo una vez cada uno por carrusel, salvo que el tipo lo pida (`comparativa` repite `comparativa` por criterio, `prompt` admite dos `prompt`, `tutorial` abre y cierra con `pasos`; ver FORMATOS.md). En guías y listas de 9 láminas o más se permite dos veces `lista` | campo `layout` |
| Máximo 1 kicker cada 3 láminas | En 9 láminas, 3 kickers. El kicker ubica ("Paso 2 de 5"), no declama | campo `kicker` |
| Palabras por lámina | ≤ 40 en láminas normales, ≤ 70 en guardables (`lista`, `pasos`, `prompt`, `comparativa`, rol `cheatsheet`). `cuerpo` ≤ 25 palabras | `qa.mjs` |
| Reducción automática | El HTML reduce la letra hasta 15% si no cabe. Más de 8% es un aviso de QA: reescribe, no aceptes la reducción | `data-ajuste` |
| Contraste | Texto crítico ≥ 4.5:1 contra su fondo; ideal ≥ 7:1 para lectores de 35 a 60 años. Debajo de 3:1 bloquea la entrega | `qa.mjs` |
| Esquinas | Una sola escala: 24 px (`--radio`) para placas y 999 px para píldoras. Nada intermedio | `--radio` |

Tres notas de oficio que vienen adaptadas de Carrusel Studio de Ruva IA (youtube.com/@RuvaIA): el texto de los títulos siempre alineado a la izquierda (el centrado solo con `"centrado": true` y solo en `cita`, `dato-hero` o `cta-cara`); el número fantasma (`numero_fantasma`) como recurso de ritmo en láminas numeradas, no en todas; y una lámina de descanso a mitad del recorrido cuando el carrusel pasa de 9 láminas (en `bosque` es `"clase": "claro"`; en los demás looks es un `dato-hero` o una `cita` con mucho aire).

Sobre las imágenes: `imagen.pos` admite `fondo`, `abajo`, `derecha` y `centro`. Con `fondo` el look aplica su scrim automáticamente; no agregues capas. Con `abajo` la imagen ocupa el 42% inferior (567 px en 4:5, apoyada a 110 px del pie) y el contenido queda entre 130 y 742 px de alto. Con `derecha` la imagen ocupa el 42% del ancho y el contenido se queda en los 514 px de la izquierda. Si la imagen se genera, el `imagen.prompt` termina siempre con "no text, no letters, no watermark": el texto lo pone el HTML, nunca la imagen.

## 4. Reglas de portada

La portada decide el 80% del alcance. Es la única lámina que Instagram muestra sin que nadie deslice y la que aparece en la cuadrícula del perfil. Las reglas salen de la auditoría de la cuenta del autor (septiembre 2026): las tres portadas con más guardados compartían la misma anatomía, y la única lámina publicada sin titular hizo 36,000 de alcance con 0 seguidores nuevos.

| Elemento | Regla | Campo |
|---|---|---|
| Titular | 4 a 7 palabras (tope duro 9). Imperativo o número al frente. Dos líneas máximo a 108 px o más | `titulo` |
| Palabra imán | UNA palabra en `*acento*`, la que carga el resultado ("*gratis*", "*3 minutos*", "*sin cámara*"). Nunca dos | `titulo` |
| Subtítulo numérico | Una línea con cifra concreta: "7 prompts, 1 hora", "3 apps, cero costo". Sin número, no hay promesa medible | `subtitulo` |
| Anuncio del recorrido | 3 a 5 `chips` con los apartados, o una ilustración propia que muestre el objeto del que trata la pieza. Si el carrusel gira sobre una herramienta, la herramienta se ve | `chips` o `imagen` |
| Rostro o personaje | Si el tema lo admite (opinión, historia, "yo lo probé"), foto del autor en plano medio con gesto activo (cejas arriba, boca a mitad de frase, dedo a cámara) en `portada-foto`. Para guías y recursos, mejor ilustración: el rostro compite con los chips | `layout`, `imagen` |
| "Desliza" | Siempre al pie, a la derecha del handle. El HTML lo pone solo en la lámina 1; no lo dupliques en el título ni en `cuerpo` | `pie` (por omisión "Desliza") |
| Etiqueta de serie | Arriba a la izquierda, en versalitas: "Guía rápida", "Recurso", "Noticia". Ubica, no vende | `serie` |
| Coherencia | La portada dice lo mismo que la primera línea del `caption` y que la lámina 2. Si la portada promete 7 y el cuerpo trae 5, se corrige la portada | `caption` |

Lo que descalifica una portada: titular de más de 9 palabras; sin titular; dos palabras en acento; faltas de ortografía ("asta", "paginas"); leetspeak o texto pixelado; fotograma crudo sin scrim; iconos o logotipos de terceros que no sean el logotipo real y con licencia; una promesa que el interior no respalda ("indetectable", "garantizado"); emoji como icono.

Antes de renderizar, escribe el titular en una línea de 35 caracteres de ancho. Si ocupa más de dos renglones, sobra una palabra.

## 5. Checklist visual de los PNG

Se corre sobre `slides/*.png` después de `render.mjs` y de `qa.mjs`. Se cuenta, no se opina. Cada punto tiene un número que se cumple o no.

1. **Dimensiones.** `sips -g pixelWidth -g pixelHeight slides/*.png`: todos 1080 × 1350 (o 2160 × 2700 si se renderizó a 2x). Un PNG con otra medida invalida el lote.
2. **Cantidad y numeración.** Entre 5 y 20 archivos (ideal 7 a 12). El paginador `01/N` de la barra superior coincide con el nombre del archivo en todos.
3. **Portada a tamaño de feed.** Abre `01.png` al 25% (270 px de ancho, lo que mide en la cuadrícula). El titular se lee completo sin acercar. Cuenta las palabras: 4 a 7. Cuenta las palabras en color: exactamente 1.
4. **Ninguna lámina sin nivel 1.** Cada PNG tiene un título, un dato o una cita a 84 px o más. Cuenta láminas con nivel 1: debe ser igual a N.
5. **Margen seguro.** Traza mentalmente (o con una guía a 80 px en Preview) el rectángulo interior: ningún glifo lo cruza salvo fondo e imágenes a sangre. Franja inferior de 140 px: solo handle, paginador o botón de CTA.
6. **Kickers.** Cuenta las píldoras arriba del título. Máximo `ceil(N / 3)`.
7. **Acentos.** Cuenta los colores distintos de acento en todo el lote: 1. Cuenta elementos en acento por lámina: 1 (la palabra del título, o el dato, o el número; no dos).
8. **Familias tipográficas.** Cuenta familias visibles: máximo 3 (display, sub, cuerpo) más JetBrains Mono solo en láminas `prompt`. Si aparece una serif, el render tomó una fuente de sistema por falta de `assets/fonts/`; corre `scripts/setup.sh`.
9. **Layouts.** Cuenta cuántas láminas usan el layout dominante: ≥60% de las láminas de cuerpo (o lo que dicte la secuencia de FORMATOS.md para ese tipo). Cuenta apariciones de `lista`, `comparativa`, `pasos`, `prompt`, `cita`, `dato-hero`: ≤ 1 cada una (2 para `lista` si N ≥ 9; `comparativa`, `prompt` y `pasos` se repiten solo cuando el tipo lo pide).
10. **Ajuste y contraste.** En `qa.json`: `errores` = 0, ningún `ajuste` > 8, ningún aviso de contraste por debajo de 4.5:1 en texto crítico. Si hay un aviso "cae en la franja inferior", se mueve el texto, no se ignora.
11. **CTA.** Exactamente una lámina con rol `cta`, la última. Un solo botón con una sola acción. La `palabra_clave` aparece igual (mismas mayúsculas) en el botón y en el `caption`. Avatar presente y con borde de acento.
12. **Ortografía y material ajeno.** Lee cada lámina en voz alta: 0 faltas, 0 acentos perdidos, 0 emojis crudos, 0 logotipos de terceros que no sean el real, 0 fotogramas de películas o de otras cuentas. "Desliza" solo en la portada.

Si un punto falla, se corrige `carrusel.json` y se vuelve a renderizar. No se retoca el PNG a mano: el PNG es un derivado, el JSON es la fuente.

Un atajo para revisar el lote entero de una vez: un mosaico de 2 filas por 5 columnas con los PNG al 20%. Si ahí se distingue cuál es la portada, cuál el CTA y cuál la lámina guardable sin leer el texto, el ritmo visual está bien. Si las diez se ven iguales, faltó la variación del 20%. Esta revisión por mosaico se adapta de Carrusel Studio de Ruva IA (youtube.com/@RuvaIA).
