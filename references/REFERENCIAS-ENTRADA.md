# De una referencia a un carrusel propio

Este documento explica cómo convertir cualquier entrada (un tema, un link, una captura o un carrusel tuyo anterior) en un `carrusel.json` válido para esta skill. Lo lee Claude antes de escribir la primera lámina, y lo puede seguir una persona a mano.

Regla base: la referencia te da el ángulo y la estructura. El texto, las imágenes y el diseño se hacen de cero, en la voz de `templates/MI-MARCA.md`.

## Las 4 entradas y qué produce cada una

| Entrada | Qué haces primero | Qué sale | Herramienta |
|---|---|---|---|
| (a) Tema en texto | Nada que extraer. Vas directo al paso 5 del método (qué aplica a mi audiencia). | Ficha corta + `carrusel.json` | Claude |
| (b) Link (YouTube, artículo, PDF, reel IG/TikTok/FB) | `python3 scripts/referencia.py <url> --out <carpeta>` | `referencia.md` con metadatos + texto | `scripts/referencia.py` |
| (c) Captura o PNG de un carrusel ajeno | Claude lee la imagen con visión y la describe lámina por lámina | `referencia.md` escrito a mano por Claude | Visión de Claude |
| (d) Carrusel propio anterior | Abrir su `carrusel.json` y sus números (guardados, compartidos, alcance, comentarios) | Ficha de "qué repetir / qué cambiar" | `scripts/medir.py` o Insights |

Cualquiera de las cuatro termina en el mismo lugar: una ficha de referencia guardada en `referencia.md` dentro de la carpeta del carrusel, y de ahí el `carrusel.json`.

## (a) Tema en texto

Es la entrada más corta y la más peligrosa: sin referencia, Claude tiende a escribir un carrusel genérico. Antes de escribir, responde por escrito:

1. Quién lo va a guardar y para qué lo va a usar el lunes.
2. Qué número, herramienta o nombre buscable va en la portada.
3. Cuál de los nueve `tipo` del schema es: `guia`, `lista`, `recurso`, `noticia`, `tutorial`, `contrarian`, `historia`, `comparativa` o `prompt`.
4. Qué se reserva para el DM (`entregable`) y con qué `palabra_clave`.

Si no puedes contestar la 1 y la 2, no hay carrusel todavía: busca una referencia (entrada b o c) o pide un dato real a la persona.

## (b) Link: qué hace `referencia.py` y qué hacer cuando falla

```bash
python3 scripts/referencia.py "https://youtu.be/XXXX" --out carruseles/2026-09-08-mi-slug
python3 scripts/referencia.py "https://www.instagram.com/reel/XXXX/" --out carruseles/2026-09-08-mi-slug
python3 scripts/referencia.py articulo.pdf --out carruseles/2026-09-08-mi-slug
python3 scripts/referencia.py "texto pegado directo" --out carruseles/2026-09-08-mi-slug
```

Qué hace por tipo de fuente:

| Fuente | Cómo extrae | Requisito | Metadatos que guarda |
|---|---|---|---|
| YouTube (video o short) | Subtítulos automáticos o manuales, en este orden: idioma pedido, `es-419`, `es`, `en` | `yt-dlp` instalado | título, canal, duración, fecha, vistas, likes |
| Instagram, TikTok, Facebook | Transcribe el audio con el actor `truefetch/video-to-text` de Apify y lo traduce al español | variable `APIFY_TOKEN` | autor, vistas, likes o reacciones, fecha |
| Artículo web | Texto de `<article>` o, si no hay, párrafos, encabezados y listas de más de 40 caracteres | Nada | título, url |
| PDF | `pdftotext` o `PyPDF2` | Uno de los dos | nombre del archivo |
| `.txt` / `.md` | Tal cual | Nada | nombre del archivo |
| Imagen `.png/.jpg/.webp` | No la procesa: deja la nota para que Claude la lea con visión | Nada | ruta absoluta |

El script escribe `referencia.md` con tres partes: metadatos, `## Texto` y `## Notas para el carrusel` con cuatro renglones vacíos (ángulo replicable, gancho literal, qué se guarda o comparte, qué no copiar). Esos cuatro renglones los llena Claude con el método de la siguiente sección. El script nunca inventa: si no consigue texto, escribe `_(sin texto: ver error arriba)_`, imprime el aviso en `stderr` y sale con código 3.

Cuando no hay transcripción, en este orden:

1. **YouTube sin subtítulos.** Abre el video, pon el guion o los puntos clave a mano en `referencia.md` bajo `## Texto`. Anota "transcripción manual" en la primera línea.
2. **Reel sin `APIFY_TOKEN`.** Dos opciones: exporta el token (`export APIFY_TOKEN=...`) y vuelve a correr el script, o copia el texto en pantalla y el caption del reel (ambos son públicos y suelen contener el gancho y la lista completa).
3. **Artículo detrás de login o con muro de pago.** Pega el fragmento que sí ves. No resumas de memoria lo que no leíste.
4. **Nada de lo anterior.** Trata el link como entrada (a): tema en texto. Deja constancia en `notas` del `carrusel.json`: "referencia sin transcripción, se trabajó solo con el título".

Regla dura: si `referencia.md` dice "sin texto", Claude no describe el contenido del video como si lo hubiera visto. Escribe lo que sabe (título, autor, números) y pregunta o marca el hueco.

## (c) Captura o PNG de un carrusel ajeno

Claude lee la imagen directo. Si son varias capturas, se leen en orden y se numeran. Si es una sola captura de la portada, se trabaja solo con la portada y se dice.

Qué se describe por lámina, en este orden y con este nivel de detalle:

| Campo | Qué anotas | Ejemplo de anotación |
|---|---|---|
| Número y rol | Portada, re-gancho, cuerpo, cheatsheet o CTA | "Lámina 1: portada" |
| Texto literal | Todo el texto visible, entre comillas, sin corregir | "7 HERRAMIENTAS DE IA QUE USO CADA DÍA" |
| Jerarquía | Cuántos niveles de texto hay y cuál domina | "Título gigante, subtítulo pequeño, sin cuerpo" |
| Layout equivalente | El `layout` del schema que más se parece | `portada-titulo`, `lista`, `punto-numero`, `dato-hero`, `comparativa`, `pasos`, `cita`, `texto-pleno`, `prompt`, `cta-cara` |
| Elementos | Número grande, chips, foto, logos, flecha "desliza", handle, paginador | "Chips con 3 categorías, flecha abajo a la derecha" |
| Color | Fondo claro u oscuro, un acento o varios | "Fondo crema, acento naranja en una palabra" |
| Open loop | Si el pie de lámina obliga a deslizar | "Sin loop" o "La #3 casi nadie la usa →" |

Al final de la descripción, tres líneas obligatorias:

- **Gancho:** la frase literal de la portada y qué fórmula usa (número, negación, "no X sin", contraste, pregunta cerrada, "se nota", gratis, error).
- **Estructura:** roles en orden, por ejemplo `portada → rehook → cuerpo ×5 → cheatsheet → cta`.
- **CTA:** qué pide (guardar, comentar palabra, seguir) y si reserva algo para el DM.

Si la captura muestra números públicos (guardados, compartidos, likes, comentarios), anótalos con la fecha de la captura. Si no se ven, no se estiman.

## (d) Un carrusel propio anterior

La entrada más barata y la que más se desperdicia. Abre `carrusel.json` y los números de la pieza. Contesta en la ficha:

| Pregunta | Dónde miras | Qué decides |
|---|---|---|
| ¿Guardados por encima de likes? | Insights o `medir.py` | Si sí, el interior era guardable: repite el `layout` de la lámina cheatsheet. |
| ¿Compartidos altos y comentarios bajos? | Insights | El valor se dio completo; la nueva versión reserva algo para el DM con `palabra_clave`. |
| ¿Alcance alto y guardados bajos? | Insights | Portada buena, interior hueco: conserva el gancho, reescribe el cuerpo con datos. |
| ¿Qué `look` y qué `serie` usó? | `carrusel.json` | Si funcionó, mantén `serie` para que la cuenta acumule una colección reconocible. |
| ¿Qué lámina tuvo más caída? | Insights por lámina (si están) | Esa lámina se acorta a menos de 25 palabras o se parte en dos. |

Un carrusel propio se puede convertir en serie: mismo `serie`, mismo `look`, nuevo tema, nueva `palabra_clave`.

## Método de ingeniería inversa en 6 pasos

Se aplica igual a un reel, un artículo, una captura o un carrusel propio. Cada paso produce una línea escrita en la ficha. Método adaptado de Carrusel Studio de Ruva IA (youtube.com/@RuvaIA), que propone tres Big Ideas por brief (segura, punzante, lateral) y elegir estructura según el tipo; aquí se reduce a un solo ángulo final y se amarra a los roles y layouts de este contrato.

### 1. Gancho literal

Copia la primera frase tal cual (los primeros 3 segundos del reel, el título del artículo, el texto de la portada). Clasifícala con una de las fórmulas que `scripts/qa.mjs` reconoce: número, negación inicial, "sin antes", "deja de", contraste, pregunta cerrada, "nadie te enseña", "se nota", gratis, mal, error. Si no encaja en ninguna, el gancho no es la razón del rendimiento: busca la razón en el paso 4.

### 2. Promesa

En una frase: qué se lleva la persona al terminar. Formato fijo: "Al terminar, sabes/tienes ___ sin ___". Si la promesa de la referencia es exagerada (indetectable, garantizado, hazte rico), anótala y márcala como no replicable: `qa.mjs` la rechaza y la audiencia de 35 a 60 años también.

### 3. Estructura por roles

Traduce la pieza a los roles del schema: `portada`, `rehook`, `agitacion`, `cuerpo`, `cheatsheet`, `cta`. Un reel de 40 segundos se lee así: gancho (0-3 s) = `portada`; promesa (3-8 s) = `rehook`; cada tip o paso = una lámina `cuerpo`; el resumen o el prompt dictado = `cheatsheet`; el cierre = `cta`. Cuenta las láminas resultantes: entre 7 y 12 es el rango que rinde (5 es el mínimo que acepta `qa.mjs`); más de 12 se parte en serie; 20 es el máximo de Instagram.

### 4. Mecanismo psicológico

Por qué se guarda o se comparte. En la cuenta del autor (@manueldeleonmjr) los cuatro mecanismos con evidencia pública son:

| Mecanismo | Señal | Evidencia pública |
|---|---|---|
| Recurso con nombre buscable de una marca conocida (universidad, empresa de software) | Se guarda para después y se reenvía a un hijo, socio o empleado | Piezas de recurso gratis con guardados que superan a los likes (1,069 guardados contra 1,044 likes en una de ellas) y tasas de compartido de 3% a 5% |
| Prompt o configuración dictada palabra por palabra | Se guarda como activo para copiar | Un reel con el prompt completo en pantalla: 7,398 guardados |
| Herramienta que ya usan + IA = resultado concreto | Se comparte por la rivalidad o la combinación de marcas reconocibles | Carrusel "Conecta tu Instagram a Claude": 54.9K de alcance, 3,087 guardados contra 1,277 likes |
| Estructura visible desde la portada (chips, "N cosas. N formas de X") | La gente pasa láminas porque sabe qué viene | Carrusel guía rápida de 5 generaciones: 98.6K de alcance, 3,345 guardados por encima de 2,452 likes |

El contraejemplo también es público: ese carrusel de 98.6K dejó 36 comentarios porque entregó todo el valor en las láminas y no reservó nada para el DM. En cambio, los reels con una sola palabra clave dicha y escrita dejaron 7,641 y 3,790 comentarios. Anota en la ficha cuál de los cuatro mecanismos usa la referencia y si reservó algo para el DM.

### 5. Qué aplica a MI audiencia

Cruza la referencia con `MI-MARCA.md`, sección 2 (a quién le hablas). Tres preguntas, tres respuestas de una línea:

- ¿Mi audiencia tiene ese dolor o es un dolor de otro perfil (diseñadores de 25 en vez de dueños de negocio de 45)?
- ¿Puede ejecutar los pasos con lo que ya tiene (celular, WhatsApp, la herramienta gratuita)?
- ¿Qué cambia si lo cuento como dueño de negocio: qué tarea manual deja de hacer, qué le cuesta hoy?

Si la respuesta a la primera es "no", se descarta la referencia o se cambia el ejemplo central. Un carrusel bien hecho para la audiencia equivocada no genera guardados.

### 6. Ángulo propio en la voz de la marca

Escribe el título de portada nuevo: 4 a 7 palabras, máximo 9, con una palabra en acento marcada como `*palabra*`. Debe usar una fórmula de gancho del paso 1, pero con un sujeto distinto al de la referencia. Regla de comprobación: si pones la portada de la referencia y la tuya lado a lado, deben compartir la fórmula y no compartir ninguna frase de más de tres palabras. Después escribe `subtitulo` (la promesa del paso 2 en 12 palabras o menos) y decide `tipo`, `objetivo`, `look` y `serie`.

## Regla ética y de originalidad

Instagram aplica desde abril de 2026 una política de contenido original: reduce la distribución de piezas que reproducen contenido ajeno sin transformación y prioriza al creador original. Además de la política, copiar deja de funcionar: la audiencia de la referencia no es la tuya.

Qué se replica y qué no:

| Se replica | No se replica nunca |
|---|---|
| El ángulo (la idea central, reformulada) | El texto de las láminas, ni traducido ni parafraseado línea por línea |
| La estructura por roles y el número aproximado de láminas | Las imágenes, capturas o ilustraciones de la referencia |
| La fórmula del gancho (no la frase) | El diseño exacto: mismos colores, misma tipografía, misma composición |
| El mecanismo psicológico | Los logos de terceros en portada sin permiso (riesgo de derechos) |
| El tipo de CTA (palabra clave, guardar, comentar) | Las cifras ajenas sin fuente |

Cuando un dato de la referencia va en una lámina (un porcentaje, un estudio, una cifra de una empresa), se cita en la misma lámina o en el caption: "Fuente: [medio o institución], [año]". Si no puedes citar, no va el dato. Las cifras propias siguen la lista de `MI-MARCA.md`, sección 4 (cifras que sí se publican).

El campo `referencia` del `carrusel.json` guarda el link o el archivo de origen. Sirve para auditoría interna; no se publica en el caption.

## Plantilla de ficha de referencia

Se guarda en `referencia.md`, dentro de la carpeta del carrusel, debajo de lo que escribe `referencia.py` (o completa, si la entrada fue una captura o un tema). Los cuatro primeros renglones son los que el script deja vacíos; el resto los añade Claude.

```markdown
## Notas para el carrusel

- Ángulo replicable (en la voz de la marca, no describir el original): ___
- Gancho literal de la referencia: "___" · fórmula: ___
- Qué se guarda / qué se comparte de esto: ___ (mecanismo: recurso buscable / prompt dictado / herramienta+IA / estructura visible)
- Lo que NO hay que copiar: ___

## Ficha de ingeniería inversa

- Promesa (al terminar, sabes/tienes ___ sin ___): ___
- Estructura por roles: portada → rehook → cuerpo ×N → cheatsheet → cta (N = __)
- Láminas guardables (lista / pasos / prompt / comparativa): ___
- CTA de la referencia y qué reservó para DM: ___
- Números públicos de la referencia (fecha): alcance __ · guardados __ · compartidos __ · likes __ · comentarios __
- Aplica a mi audiencia: sí / no / cambiando el ejemplo a ___
- Título de portada propio (4-7 palabras, *acento*): ___
- Subtítulo propio (≤ 12 palabras): ___
- tipo: ___ · objetivo: ___ · look: ___ · serie: ___
- palabra_clave: ___ · entregable por DM: ___
- Datos ajenos que se citan (fuente, año): ___
```

Con la ficha llena, el `carrusel.json` se escribe sin volver a la referencia. Si al escribir una lámina tienes que abrir el original otra vez, es señal de que estás copiando texto y no estructura.

## Ejemplo 1: reel de YouTube convertido a carrusel guía

Referencia hipotética: un short en inglés de un creador de productividad, "3 ways I use NotebookLM to study faster". Extracción:

```bash
python3 scripts/referencia.py "https://youtube.com/shorts/XXXX" --out carruseles/2026-09-14-juntas-a-manual
```

`referencia.md` queda con los subtítulos automáticos en inglés (el script probó `es`, `es-419` y cayó a `en`). Ficha resultante, resumida:

- Gancho literal: "Stop rereading your notes" · fórmula: negación inicial ("deja de").
- Promesa: al terminar, sabes convertir tus apuntes en resúmenes y cuestionarios sin releerlos.
- Estructura: portada → rehook → cuerpo ×3 → cta. Cuatro láminas de valor; corto para carrusel.
- Mecanismo: herramienta gratuita de una marca conocida + resultado concreto. Se guarda.
- Aplica a mi audiencia: no como está (estudiantes). Sí cambiando el ejemplo a juntas de trabajo grabadas.
- Título propio: `Tus juntas ya son un *manual*` (5 palabras, fórmula de contraste).
- Subtítulo: "NotebookLM lo escribe solo. Gratis y sin instalar nada."
- tipo: `guia` · objetivo: `saves` · look: `guia-rapida` · serie: "Guía rápida".
- palabra_clave: `MANUAL` · entregable: PDF con las 5 preguntas exactas que se le hacen a NotebookLM.
- No copiar: la frase "stop rereading", los ejemplos de exámenes, la captura de pantalla del creador.

Esqueleto de `slides` (solo `rol` y `layout`, el copy va aparte):

| # | rol | layout | Qué lleva |
|---|---|---|---|
| 1 | portada | portada-titulo | `titulo` con acento, `subtitulo`, `chips`: Juntas · Cursos · Manuales |
| 2 | rehook | texto-pleno | Promesa y `loop`: "Son 4 pasos y el primero es subir un audio →" |
| 3 | cuerpo | pasos | Pasos 1 y 2 (`n`, `titulo`, `detalle` ≤ 10 palabras cada uno) |
| 4 | cuerpo | pasos | Pasos 3 y 4 |
| 5 | cuerpo | dato-hero | `dato`: "30 min" · `titulo`: "De junta grabada a manual de inducción" |
| 6 | cheatsheet | prompt | `kicker`: "Pregunta 1 de 5" · `prompt`: la primera pregunta literal |
| 7 | cuerpo | comparativa | `a`: "Hoy (a mano)" · `b`: "Con NotebookLM" |
| 8 | cta | cta-cara | `boton`: "Comenta MANUAL" · `cuerpo`: qué llega por DM |

Ocho láminas, cuatro guardables (`pasos` ×2, `prompt`, `comparativa`), dos con números (láminas 5 y 6), un solo CTA al final con la `palabra_clave` que también va en el caption. Pasa las reglas de estructura de `qa.mjs`.

## Ejemplo 2: captura de un carrusel de lista convertida a versión propia

Referencia hipotética: captura de una cuenta de marketing, 9 láminas. Descripción por visión, resumida:

- Lámina 1 (portada, `portada-titulo`): "7 HERRAMIENTAS DE IA QUE USO TODOS LOS DÍAS". Fondo negro, título en blanco, "7" en amarillo. Flecha abajo a la derecha. Sin subtítulo.
- Lámina 2 (rehook, `texto-pleno`): "La mayoría son gratis. La #4 me ahorra 2 horas diarias." Con loop.
- Láminas 3 a 9 (cuerpo, `punto-numero`): una herramienta por lámina, número grande a la izquierda, nombre y una línea de uso. Sin capturas.
- Lámina 10 (cta, `cta-cara`): "Guarda este post y sígueme para más". Sin palabra clave, sin entregable.

Ficha resultante:

- Gancho: fórmula de número + "todos los días" (rutina real). Funciona por la promesa de utilidad inmediata.
- Estructura: portada → rehook → cuerpo ×7 → cta. Diez láminas. Sin cheatsheet: la lista completa vive repartida y nadie la ve junta.
- Mecanismo: lista de herramientas (se guarda). Reservó nada para DM: comentarios bajos previsibles.
- Aplica a mi audiencia: sí, si el criterio deja de ser "las que yo uso" y pasa a ser "las tareas que tu equipo sigue haciendo a mano".
- Título propio: `7 tareas que tu equipo hace *a mano*` (8 palabras: dentro del máximo de 9; QA avisa que el ideal es 4 a 7).
- Subtítulo: "Y la herramienta gratis que las hace en minutos."
- tipo: `lista` · objetivo: `shares` · look: `oscuro-tech` (fondo distinto al de la referencia por look, no por imitación) · serie: "Lista útil".
- palabra_clave: `TAREAS` · entregable: tabla con las 7 tareas, la herramienta y el prompt de arranque.
- No copiar: el orden de las herramientas, la frase de la lámina 2, el amarillo sobre negro, el CTA de "sígueme".

Cambios de estructura frente a la referencia:

| Referencia | Versión propia | Por qué |
|---|---|---|
| 7 láminas `punto-numero`, una por herramienta | 4 láminas `punto-numero` (tareas 1 a 4) + 1 lámina `lista` con las tareas 5, 6 y 7 (`items` con `texto` y `nota`) | Baja de 10 a 9 láminas y crea la lámina guardable que faltaba |
| Sin cheatsheet | Lámina `lista` como `rol: cheatsheet` con las 7 tareas en una sola vista (≤ 70 palabras) | Es lo que justifica el guardado |
| CTA "guarda y sígueme" | `cta-cara` con `boton`: "Comenta TAREAS" y `cuerpo` que describe la tabla | Convierte alcance en comentarios y seguidores |
| Sin loop en el cuerpo | `loop` en al menos la mitad de las láminas de cuerpo | Sostiene el deslizamiento |

Resultado: 9 láminas, misma fórmula de gancho, estructura mejorada, cero frases compartidas con el original.

## Lista de verificación antes de pasar al `carrusel.json`

- [ ] `referencia.md` existe y sus cuatro renglones de "Notas para el carrusel" están llenos.
- [ ] El gancho propio comparte fórmula con la referencia, no palabras (ninguna frase de más de 3 palabras en común).
- [ ] Hay al menos una lámina guardable (`lista`, `pasos`, `prompt` o `comparativa`) y al menos 2 láminas con números.
- [ ] Hay una sola lámina `cta`, al final, con la `palabra_clave` que también aparece en el caption.
- [ ] Los datos ajenos llevan fuente en lámina o caption.
- [ ] Ninguna imagen ni captura proviene de la referencia.
- [ ] El campo `referencia` del JSON apunta al link o archivo de origen.
