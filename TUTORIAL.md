# Tutorial paso a paso: Carruseles Virales IA

Para quien nunca ha abierto una terminal. Al terminar vas a poder escribir «Hazme un carrusel sobre cómo cobrar anticipos» y recibir las 8 láminas en PNG, el texto del post y una vista previa, listos para subir a Instagram desde tu celular.

Tiempo la primera vez: 25 minutos de instalación, 10 minutos para contarle tu marca, 10 minutos para el primer carrusel. Después: una frase por carrusel.

Cómo leer este tutorial: lo que va en recuadro gris se copia y se pega tal cual. Cuando dice «verás», describe lo que aparece en pantalla para que sepas que vas bien.

## Qué necesitas antes de empezar

| Cosa | Para qué | Cuesta |
|---|---|---|
| Cuenta de Claude con plan de pago (Pro o superior) | Claude Code corre con tu cuenta | Tu plan de Claude |
| Una computadora Mac, Linux o Windows con WSL | Ahí se instala todo | Nada |
| Internet | Descarga la skill, un navegador interno (Chromium, unos 150 MB) y las tipografías | Nada |
| Tu foto de cara, de frente, sin texto encima (JPG o PNG) | Va en la última lámina, la del llamado a la acción | Nada |
| 30 minutos sin interrupciones | La instalación tiene pasos que hay que esperar | Nada |

Todo lo que descarga la skill es gratis y de uso comercial libre: tipografías con licencia OFL y un navegador de código abierto. La skill no publica nada por ti y no toca tu cuenta de Instagram.

## Paso 1. Instala Claude Code

Claude Code es la versión de Claude que trabaja dentro de tu computadora: lee y escribe archivos, corre programas y te va contando qué hace.

1. Entra a https://claude.com/claude-code y sigue las instrucciones para tu sistema.
2. Abre la terminal (Paso 2) y escribe `claude`. Presiona Enter.
3. La primera vez se abre el navegador para iniciar sesión con tu cuenta de Claude. Acepta y regresa a la terminal.
4. Verás un recuadro con el logo de Claude y una línea donde escribir. Escribe `/exit` y Enter para salir por ahora.

## Paso 2. Abre la terminal

La terminal es una ventana donde escribes órdenes en texto y la computadora las ejecuta. No hay botones. Escribes, presionas Enter, lees la respuesta.

| Sistema | Cómo abrirla | Qué verás |
|---|---|---|
| Mac | Presiona Cmd + barra espaciadora, escribe `Terminal`, Enter | Una ventana con algo como `tunombre@MacBook ~ %` y el cursor parpadeando |
| Windows | Instala WSL una sola vez (busca «Instalar WSL» en el sitio de Microsoft; es un clic y un reinicio). Después abre la app «Ubuntu» desde el menú Inicio | Una ventana negra con `tunombre@PC:~$` |
| Linux | Ctrl + Alt + T | Parecido a Windows |

Tres cosas que conviene saber:

- El símbolo `~` significa «mi carpeta personal». `~/.claude/skills/` es una carpeta oculta dentro de tu carpeta personal donde viven las skills de Claude.
- Pegar en la terminal: Cmd + V en Mac; clic derecho o Ctrl + Shift + V en Windows y Linux.
- Si escribes algo mal, no pasa nada. La terminal responde `command not found` y vuelves a intentar.

## Paso 3. Instala Node.js

Node.js es el programa que convierte el guion del carrusel en imágenes. La skill lo necesita.

1. Entra a https://nodejs.org y descarga la versión marcada «LTS».
2. Instálalo como cualquier programa (siguiente, siguiente, terminar).
3. Cierra la terminal y ábrela de nuevo. Escribe:

```
node -v
```

Verás algo como `v22.11.0`. Cualquier número de 18 en adelante sirve. Si ves `command not found`, reinicia la computadora y repite.

En Mac también hace falta `git`. Escribe `git --version`. Si aparece una ventana que ofrece instalar las «herramientas de línea de comandos», acepta y espera a que termine.

## Paso 4. Instala la skill

Copia esta línea completa, pégala en la terminal y presiona Enter:

```
curl -fsSL https://raw.githubusercontent.com/m4nueldeleon/carruseles-virales-ia/main/install.sh | bash
```

Qué verás, en este orden:

1. «Instalando Carruseles Virales IA» y una descarga rápida.
2. «Node» con una palomita y tu versión.
3. «Playwright (renderiza los PNG)». Si no lo tienes, dice «Instalando en la carpeta de la skill (no global)» y se queda un rato: baja un navegador interno de unos 150 MB. Espera; tarda de 1 a 5 minutos.
4. «Tipografías» y nueve renglones con palomita. Termina con «Tipografías listas: 9 · fallidas: 0».
5. «Opcionales»: te dice si tienes ImageMagick, yt-dlp y Python 3. No son obligatorios. Python y yt-dlp solo hacen falta para carruseles a partir de un link.
6. «Skill instalada en: /Users/tunombre/.claude/skills/carruseles-virales-ia» y tres líneas de instrucciones.

Si algo sale con una equis, lee el mensaje: dice exactamente qué falta y cómo instalarlo. Corrige y vuelve a pegar la misma línea. Se puede correr las veces que quieras; si ya está instalada, solo la actualiza.

## Paso 5. Crea tu carpeta de trabajo

Aquí van a vivir tus carruseles, tu ficha de marca y tus resultados. Una carpeta por marca. Nunca mezcles dos marcas en la misma carpeta.

1. En el escritorio o en Documentos crea una carpeta llamada `mis-carruseles`. Hazlo con el Finder o el Explorador, como siempre.
2. Adentro crea la carpeta `assets` y, dentro de esa, `fotos`. Copia ahí tu foto de cara con un nombre simple, sin espacios ni acentos: `avatar.jpg`. Si tienes logo en PNG con fondo transparente, ponlo en `assets/logos/logo.png`.
3. Abre la terminal en esa carpeta:
   - Mac: escribe `cd ` (con un espacio después), arrastra la carpeta `mis-carruseles` desde el Finder hasta la ventana de la terminal y presiona Enter.
   - Windows (WSL): las carpetas de Windows están en `/mnt/c/`. Escribe `cd /mnt/c/Users/TuUsuario/Desktop/mis-carruseles` y Enter.
4. Comprueba que estás dentro con `pwd` (imprime la carpeta actual). Debe terminar en `mis-carruseles`.

Estructura que queda:

```
mis-carruseles/
└── assets/
    ├── fotos/avatar.jpg
    └── logos/logo.png        (opcional)
```

## Paso 6. Abre Claude en esa carpeta

Con la terminal dentro de `mis-carruseles`, escribe:

```
claude
```

La primera vez en una carpeta nueva pregunta si confías en sus archivos («Do you trust the files in this folder?»). Elige «Yes, proceed». Verás el recuadro de Claude con la línea para escribir.

Regla: abre Claude siempre desde `mis-carruseles`. Si lo abres desde otra carpeta, no encuentra tu ficha de marca y te vuelve a hacer las preguntas.

## Paso 7. La primera conversación: tu ficha de marca

Escribe tu primer pedido:

```
Hazme un carrusel sobre los 5 errores al cotizar
```

Como todavía no existe `MI-MARCA.md`, Claude te hace 6 preguntas en un solo mensaje. Responde con tus palabras, también en un solo mensaje. Ten a la mano:

| Pregunta | Qué contestar | Ejemplo |
|---|---|---|
| 1. Quién eres | Nombre público, tu @ de Instagram, a qué te dedicas en una frase y el «sello» que va junto a tu @ en la última lámina | «Laura Méndez, @lauracotiza, ayudo a talleres a cobrar bien. Sello: Cotizaciones que sí se pagan» |
| 2. A quién le hablas | Edad, situación, dónde están, 3 cosas que les duelen, qué ya intentaron | «Dueños de taller de 40 a 60 años, México. Les duele que no les contestan la cotización» |
| 3. Cómo suenas | Tuteo o usted, 3 frases que dices tal cual (sácalas de un audio de WhatsApp), palabras que nunca usarías, si usas emojis | «Tuteo. Digo “a ver, vamos por partes”. Nunca digo “emprendedor”. Cero emojis en las láminas» |
| 4. Qué regalas por DM | Qué le mandas a quien comenta una palabra clave, y cuál es la palabra | «Una plantilla de cotización en PDF. Palabra: COTIZA» |
| 5. Fotos y colores | La ruta de tu foto (`assets/fotos/avatar.jpg`), logo, colores si tienes, looks que no quieres | «Foto en assets/fotos/avatar.jpg. Sin colores fijos. No quiero el look oscuro-tech» |
| 6. Qué te ha funcionado | Tus 3 mejores posts y por qué, lo que no funcionó, temas del trimestre, temas prohibidos | «Mi mejor post fue una lista de 7 frases para cobrar. Prohibido hablar de precios de mis cursos» |

Si algo no lo sabes, escribe «no sé». La skill lo deja en blanco y no inventa. Claude guarda todo en `mis-carruseles/MI-MARCA.md` y no vuelve a preguntar. Puedes abrir ese archivo con cualquier editor de texto y corregirlo cuando quieras.

Lo más valioso de la ficha son las 3 frases que sí dices y la palabra clave. Las frases hacen que el carrusel suene a ti. La palabra clave es lo que la gente comenta para recibir el regalo por mensaje directo: una sola palabra, corta, fácil de escribir en el celular.

## Paso 8. Recibe tu primer carrusel

Con la ficha guardada, Claude sigue solo. Verás que va narrando:

1. Define el ángulo: una frase que un dueño de negocio de 50 años entiende sin contexto.
2. Escribe 3 ganchos para la portada, los puntúa y elige uno.
3. Escribe el guion lámina por lámina en un archivo llamado `carrusel.json`.
4. Si el tema lo pide, genera o pide imágenes. Nunca con letras dentro.
5. Corre el render (`render.mjs`). Claude pide permiso antes de ejecutar cada programa. Responde «Yes». Si te cansa, elige la opción de no volver a preguntar en esta sesión.
6. Corre la puerta de calidad (`qa.mjs`). Verás algo así:

```
QA · cotizar-sin-perder-dinero · 8 láminas · look editorial-mono
Índice de viralidad: 97/100 → LISTO   (gancho 24/24 · estructura 41/41 · legibilidad 17/28 · copy 15/15)
  · [7] Texto de 36px en .item («básico · recomendado · completo»): mínimo 38px.
  · [3] Texto pequeño «Guía rápida» con contraste 2.8:1.
```

Los renglones con punto son avisos: restan puntos pero no frenan. Los renglones con equis son errores: Claude los corrige en el guion y vuelve a renderizar, hasta tres rondas.

7. Abre el preview, lo revisa con un checklist y te lo muestra.
8. Cierra diciéndote tres cosas: qué palabra clave conectar en tu automatización de mensajes, qué prometiste entregar y en qué orden subir las imágenes.

Tiempo: de 5 a 12 minutos según cuántas imágenes genere.

## Paso 9. Qué archivos aparecen

Dentro de `mis-carruseles` aparece una carpeta con la fecha y el tema, por ejemplo `2026-09-06-cotizar-sin-perder-dinero`. Adentro:

| Archivo | Qué es | Qué haces con él |
|---|---|---|
| `carrusel.json` | El guion completo: textos, look, orden. Es la fuente de verdad | No lo edites a mano la primera vez; pide los cambios a Claude |
| `slides/01.png` … `08.png` | Las láminas, 1080x1350 (el doble si se renderizó a 2x), numeradas con cero a la izquierda | Estas son las que subes a Instagram, en ese orden |
| `preview.jpg` | Mosaico con todas las láminas en miniatura | Ábrelo con doble clic. Es la aprobación de un vistazo |
| `caption.txt` | El texto del post, los hashtags, la palabra clave y lo que prometiste por DM | Copias el texto y los hashtags al celular |
| `slides-src/index.html` | La versión web de las láminas | Se abre en el navegador. Trae un botón para descargar los PNG si el render fallara |
| `qa.json` | El informe de la puerta de calidad | Solo para curiosos |
| `metadata.json` | Tema, look, gancho, palabra clave | Aquí se anotan los resultados después |
| `referencia.md` | De dónde salió el contenido (solo si diste un link o una captura) | Contexto |

En la raíz de `mis-carruseles`, después del primer resultado medido, aparece `historico.json`: la memoria de la skill. Con ella rota los looks y repite lo que funcionó.

## Paso 10. Revisa el preview en 60 segundos

Abre `preview.jpg`. Revisa contando, no opinando:

1. Portada: cuenta las palabras del título. Deben ser 4 a 7. Cuenta las palabras en color: exactamente 1. Tapa la mitad de abajo con la mano: ¿entiendes qué te vas a llevar?
2. Lámina 2: promete algo concreto («al final tienes…») y termina con una frase que obliga a seguir.
3. Cuerpo: una idea por lámina. Si una lámina dice «y además», son dos láminas.
4. Penúltima lámina: es la que vale la pena guardar (lista, pasos, prompt o comparativa). Debe entenderse sola, sin las demás.
5. Última lámina: tu cara, una sola acción («Comenta COTIZA y te mando la plantilla») y tu @.
6. Cifras: cada número que aparece tiene fuente. Si Claude dejó `[DATO]`, es porque no la encontró: ponla tú o pide que quite la afirmación.

Dos pruebas más, adaptadas de Carrusel Studio de Ruva IA (youtube.com/@RuvaIA):

- Lee todas las láminas en voz alta. Si algo suena a folleto, se reescribe.
- Aleja el preview hasta que no puedas leer el texto. Si aun así distingues cuál es la portada, cuál la lámina guardable y cuál el cierre, el ritmo visual está bien. Si las ocho se ven iguales, pide más variación.

Última prueba: abre `slides/01.png` y hazlo chiquito, del tamaño de un timbre postal. Así se ve en la cuadrícula de tu perfil. Si el título no se lee ahí, pide otra portada.

## Paso 11. Pide cambios

Todo cambio se hace en el guion y se vuelve a renderizar. Nunca retoques un PNG a mano: al siguiente render se pierde.

| Quieres | Escribe | Qué pasa |
|---|---|---|
| Otro estilo visual | «Cambia el look a editorial-mono» | Cambia el `look`, renderiza y vuelve a pasar QA. Looks disponibles: guia-rapida, noticia, oscuro-tech, recurso, bosque, editorial-mono |
| Menos láminas | «Hazlo más corto, 7 láminas» | Reestructura sin perder la lámina guardable ni el cierre |
| Otra portada | «Otra portada» o «Dame 3 portadas» | Propone 3 títulos con subtítulo y eliges |
| Menos texto en una lámina | «La lámina 5 tiene mucho texto, déjala en 20 palabras» | Recorta y renderiza |
| Otro tono | «Suena a folleto, hazlo como si me lo contaras en un café» | Reescribe con las frases de tu ficha |
| Otra palabra clave | «Cambia la palabra clave a PLANTILLA» | La cambia en la lámina de cierre y en el caption a la vez |
| Elegir el gancho tú | «Dame 3 ganchos y yo elijo» | Muestra los 3 ángulos puntuados y espera |
| Serie | «Haz una serie de 3 sobre esto» | Tres carruseles con el mismo look, numerados |
| Desde un link | «Carrusel de este link: https://…» | Saca la transcripción o el texto y parte de ahí |
| Desde una captura | Arrastra la imagen a la terminal y escribe «Convierte esta captura en un carrusel con mi voz» | Copia el ángulo y la estructura; nunca el texto ni el diseño |

Cada cambio tarda de 1 a 3 minutos porque vuelve a renderizar todo.

## Paso 12. Súbelo a Instagram desde el celular

Antes de subir:

1. Conecta la palabra clave en tu automatización de mensajes directos (ManyChat o la que uses): cuando alguien comente esa palabra, se le manda el regalo. Si no tienes automatización, contesta a mano. No publiques sin tener el regalo listo.
2. Pasa las imágenes al celular sin que pierdan el nombre ni la calidad: AirDrop (Mac a iPhone), Google Drive o iCloud. WhatsApp comprime las fotos y les borra el nombre; si es tu único camino, mándalas como «Documento».

En la app de Instagram:

1. Toca «+» y elige «Publicación».
2. Toca el icono de «Seleccionar varios» (dos cuadros encimados).
3. Toca las imágenes en orden: primero `01`, luego `02` y así hasta la última. Cada una recibe un número azul. Verifica que el número azul coincida con el contador impreso en la esquina superior derecha de cada lámina («03/08»). Ese contador está ahí justo para esto.
4. Si Instagram recorta a cuadrado, toca el icono de expandir (dos flechas) para respetar el 4:5 completo.
5. «Siguiente». No apliques filtros. «Siguiente».
6. Pega el texto de `caption.txt`: desde la primera línea hasta los hashtags. Las últimas líneas del archivo (palabra clave y entregable) son notas para ti; no van en el post.
7. Verifica que la palabra clave está escrita igual en el texto y en la última lámina (mismas mayúsculas).
8. «Compartir».

Publica cuando puedas quedarte 60 minutos cerca del celular. Contesta cada comentario con la palabra clave, aunque la automatización ya haya mandado el regalo.

## Paso 13. Anota los resultados a las 48 horas

La skill mejora con tus números, no con corazonadas. A las 48 horas, y otra vez a los 7 días:

1. En Instagram abre el post y toca «Ver estadísticas». Anota: cuentas alcanzadas, guardados, compartidos, comentarios y seguidores que llegaron por ese post.
2. En Claude, desde `mis-carruseles`, escribe:

```
Mide el carrusel de cotizar: alcance 12055, guardados 921, compartidos 262, comentarios 154, seguidores 38
```

Claude corre el script de medición y anota los números en `metadata.json` y en `historico.json`. Si prefieres hacerlo sin Claude:

```
python3 ~/.claude/skills/carruseles-virales-ia/scripts/medir.py 2026-09-06-cotizar-sin-perder-dinero --manual reach=12055 saves=921 shares=262 comments=154 follows=38
```

Cómo leer el resultado:

| Señal | Qué significa | Qué hace la skill después |
|---|---|---|
| Guardados por encima de likes | Carrusel útil. Es la señal que Instagram premia | Repite el formato y arma serie |
| Guardados entre 3% y 6% del alcance | Zona de las mejores piezas del autor (ver abajo) | Mismo tipo, otro tema |
| Alcance de 3 veces tu mediana o más | Hit | Serie de 3 con el mismo esqueleto |
| Alcance de la mitad de tu mediana o menos | Flop | No repite ese gancho ni ese tema tal cual |
| Muchos likes, pocos guardados | Entretuvo pero no sirvió para el lunes | Más carga útil, menos opinión |

Para calibrar, tres piezas públicas de la cuenta del autor (@manueldeleonmjr): la guía «5 generaciones, 5 formas de vender» llegó a 98,609 cuentas con 3,345 guardados y 2,452 likes; «Conecta tu Instagram a Claude» llegó a 54,866 con 3,087 guardados y 334 seguidores nuevos; una noticia sobre Claude llegó a 34,882 con 1,474 guardados y 226 seguidores. En las tres, el guardado superó al like y la portada anunciaba la estructura completa desde el primer vistazo.

## Alternativa sin terminal: claude.ai

Si no quieres instalar nada, la skill también funciona dentro de claude.ai, con menos automatización.

1. Consigue el archivo `carruseles-virales-ia.skill`. El repositorio no lo incluye: se genera con `bash scripts/empaquetar.sh` desde una terminal (queda en `dist/`). Si no tienes terminal, pídeselo a quien te compartió la skill.
2. En claude.ai entra a Configuración → Capacidades → Skills → Cargar skill y sube el archivo.
3. Abre un chat nuevo y escribe: «Hazme un carrusel sobre los 5 errores al cotizar». Te hace las mismas 6 preguntas. Guarda tus respuestas en tus notas: en claude.ai no hay carpeta de trabajo, así que pegas la ficha al inicio de cada conversación.
4. Claude entrega `carrusel.json` y un archivo `index.html`. Descarga el HTML y ábrelo con Chrome (doble clic).
5. Abajo a la derecha hay un botón «Descargar PNG». Tócalo: baja `01.png`, `02.png` y las demás, una por una, al doble de resolución. Chrome pregunta si permites varias descargas; di que sí. Requiere internet, porque la librería que convierte la página en imagen se carga desde la red.
6. El caption lo copias del chat.

Qué cambia respecto a la terminal:

| | Terminal (Claude Code) | claude.ai |
|---|---|---|
| Puerta de calidad automática (contraste, desbordes, palabras) | Sí: `qa.mjs` con índice 0-100 | No. Revisas con el Paso 10 |
| Tipografías de los looks | Las 9 descargadas | Las del sistema, salvo que el `.skill` se haya empaquetado con `--con-fuentes` |
| Memoria de tu marca y de resultados | `MI-MARCA.md` y `historico.json` | Pegas la ficha en cada chat |
| Medición a 48 h | `medir.py` | A mano, en tus notas |
| Imágenes generadas | Con el generador que tengas conectado | Solo si tu plan lo permite |

Sirve para empezar. Si vas a publicar más de un carrusel por semana, instala la terminal.

## 10 problemas frecuentes

| Problema | Qué ves | Solución |
|---|---|---|
| 1. Claude Code no responde | `command not found: claude` | Claude Code no quedó instalado o la terminal no lo ve. Cierra la terminal, ábrela otra vez y repite `claude`. Si sigue, repite el Paso 1 |
| 2. Falta git o Node | «Falta git. Instálalo primero» o «Falta Node.js 18+» | Mac: escribe `xcode-select --install` y acepta. Node: Paso 3. Cierra y abre la terminal. Vuelve a pegar el instalador del Paso 4 |
| 3. No encuentra Playwright | «No encuentro playwright. Corre: bash …/setup.sh» | Pega: `bash ~/.claude/skills/carruseles-virales-ia/scripts/setup.sh`. Necesita internet y baja unos 150 MB. Si falla, escribe `cd ~/.claude/skills/carruseles-virales-ia && npm install playwright && npx playwright install chromium` |
| 4. Fuentes raras | Las láminas salen con una letra con remates, tipo Times, distinta a la del ejemplo | No se descargaron las tipografías. Pega: `bash ~/.claude/skills/carruseles-virales-ia/scripts/setup.sh --fuentes` y pide a Claude «vuelve a renderizar» |
| 5. La imagen no aparece | Una lámina sale sin foto, o el cierre sin tu cara | La ruta está mal o el archivo no existe. Revisa que `assets/fotos/avatar.jpg` exista con ese nombre exacto (mayúsculas y extensión cuentan: `.jpg` no es `.JPG`). Dile a Claude «la imagen de la lámina 3 no aparece, revisa la ruta en el JSON» |
| 6. Texto cortado o encimado | QA dice «desborda NN px» o «sale del margen seguro», o en el preview un título pisa el pie | Sobra texto. Pide «acorta la lámina 5 a 25 palabras» o «cambia la lámina 5 a layout lista». Nunca edites el PNG |
| 7. QA bloqueado | «Índice de viralidad: 62/100 → BLOQUEADO» y renglones con equis | Cada renglón dice la lámina y la causa: más de 40 palabras, una frase de la lista negra de IA, la palabra clave que no está en el caption o en el cierre, contraste debajo de 3:1. Claude los corrige solo; si después de tres rondas sigue, pide «cambia de layout esa lámina» |
| 8. Vuelve a hacer las 6 preguntas | Claude pregunta por tu marca aunque ya contestaste | Abriste Claude en otra carpeta. Escribe `/exit`, comprueba con `pwd` que estás en `mis-carruseles` y vuelve a abrir `claude` |
| 9. Render falló | «carrusel.json no es JSON válido» o «Render falló:» | El guion quedó con un error de escritura (una coma, una comilla). Dile a Claude «el JSON no es válido, arréglalo y vuelve a renderizar» |
| 10. Instagram desordena las láminas | La portada no sale primera | Seleccionaste fuera de orden o el celular perdió los nombres al pasar por WhatsApp. Vuelve a seleccionar tocando `01` primero y guíate por el contador impreso en cada lámina («03/08») |

Dos más que salen solo en claude.ai: si el botón «Descargar PNG» no hace nada, no hay internet o el navegador bloqueó las descargas múltiples (Chrome muestra un aviso arriba a la derecha; permítelas). Si solo baja la primera imagen, revisa la barra de descargas: las demás están ahí, bajan con 0.4 segundos de diferencia.

## Qué hace por dentro (para curiosos)

1. Lee `MI-MARCA.md` y `historico.json`: tu voz, tu regalo, qué look tocó la vez pasada.
2. Convierte la entrada (tema, link o captura) en `referencia.md` y saca un ángulo en una frase.
3. Elige tipo (guía, lista, recurso, noticia, tutorial, contrarian, historia, comparativa, prompt) y look. El look rota: nunca repite el anterior.
4. Escribe 3 ganchos, los puntúa en 5 criterios y se queda con uno.
5. Escribe `carrusel.json`: portada, re-enganche, cuerpo de una idea por lámina, lámina guardable y cierre con una sola acción.
6. Decide imágenes por lámina. Todo el texto va por código; ninguna imagen lleva letras.
7. Renderiza con un navegador interno: `carrusel.json` pasa a `index.html` y de ahí a `slides/NN.png` y `preview.jpg`.
8. Pasa la puerta de calidad: mide desbordes, tamaños mínimos (título 84 px, texto 38 px, micro 30 px), margen seguro de 80 px, contraste, palabras por lámina, frases de IA, palabra clave y hashtags. Calcula el índice 0-100. Con errores no hay entrega.
9. Espera tus números a las 48 h y los guarda para el siguiente.

Todo está escrito en `SKILL.md` y en `references/`. Puedes leerlo, cambiarlo y mejorarlo.

Dudas o mejoras: abre un issue en https://github.com/m4nueldeleon/carruseles-virales-ia/issues
