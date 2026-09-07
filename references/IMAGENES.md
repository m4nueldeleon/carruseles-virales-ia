# Imágenes del carrusel: qué va por código y qué va por IA

Regla maestra: **todo el texto va por código (HTML). Las imágenes nunca llevan letras.**

Una lámina de carrusel tiene dos capas. La capa de texto la escribe `carrusel.json` y la dibuja `scripts/lib/construir-html.mjs` con las fuentes de `assets/fonts/`. La capa de imagen es un archivo PNG o JPG que se coloca debajo, arriba, a la derecha o al centro. Las dos capas no se mezclan: si una imagen generada trae tipografía, se regenera o se recorta. No se aprovecha "porque quedó bonita".

Por qué es así:
- El texto por código se lee a 1080 px y a 2160 px, se corrige en segundos y pasa por el QA de contraste (`scripts/qa.mjs`). El texto dentro de una imagen no.
- Los modelos de imagen inventan letras falsas. En Instagram, a tamaño de celular, eso se ve como error.
- Un carrusel sin imagen funciona. Un carrusel con una imagen mala no.

Este documento cubre qué tipo de imagen pide cada layout, de dónde sacarla, cómo pedirla por look, a qué tamaño, cómo guardarla y qué revisar antes de renderizar.

## 1. Tipos de imagen por layout

Solo tres cosas del contrato deciden cómo se coloca una imagen: el `layout` de la lámina, el objeto `imagen` (`src`, `pos`, `sangra`, `prompt`) y `marca.avatar`. No hay más campos.

| Layout | Imagen típica | `imagen.pos` por omisión | Qué hace el código |
|---|---|---|---|
| `portada-foto` | Foto o escena a sangre | `fondo` | Cubre toda la lámina (`cover`) y pone encima el `--scrim` del look. El título va sobre el scrim. |
| `portada-titulo` | Ninguna, o ilustración abajo | `abajo` | Franja inferior del 42% de alto, imagen completa (`contain`), apoyada a 110 px del pie. |
| `punto-numero`, `dato-hero`, `texto-pleno`, `cita` | Ilustración abajo o a la derecha | `abajo` | Con `abajo`, el bloque de texto se comprime a la mitad superior (de 130 a 742 px). Con `derecha`, la imagen ocupa el 42% del ancho y el texto los 514 px de la izquierda. |
| `lista`, `pasos`, `comparativa`, `prompt` | Normalmente ninguna | `abajo` | Son láminas densas. Una imagen les roba la mitad del alto y el texto se encoge. Úsala solo si la lista tiene 3 puntos o menos. |
| `cta-cara` | Retrato de quien firma | no usa `imagen`; usa `marca.avatar` | Círculo de 240 px con borde en el color de acento, recortado con `center top` (la cara arriba). |

Notas del contrato:
- `pos: "centro"` existe para cualquier layout. Coloca la imagen entre el 18% y el 62% del alto y empuja el texto abajo. En el look `recurso` la ventana es un poco más grande (desde 130 px, 48% de alto). Es el sitio natural del personaje en `recurso`.
- `sangra: true` solo cambia el modo de `abajo`: pasa de `contain` (se ve completa, con aire) a `cover` (llena la franja y recorta). Úsalo con fotos, nunca con personajes recortados.
- `imagen.prompt` guarda el prompt con el que se generó o se va a generar. Sirve para regenerar y para el histórico. No lo dibuja el código.
- Sin `imagen.src` no hay imagen. `prompt` solo no renderiza nada.

## 2. Fuentes, en este orden

Baja por la lista hasta encontrar la primera que tengas. No saltes al paso 2 si tienes el paso 1.

| Orden | Fuente | Cuándo | Herramienta |
|---|---|---|---|
| 1 | Foto real propia | Portadas con cara, `cta-cara`, capturas de pantalla de tu propia herramienta | `assets/fotos/` de tu carpeta de marca |
| 2 | Ilustración o personaje generado | Guías, recursos, escenas conceptuales, íconos | Higgsfield: `soul_2` para retratos, `soul_location` para escenas, `nano_banana_pro` para íconos 3D e ilustraciones; Element o Soul entrenado con tu propio rostro si ya lo tienes |
| 3 | Foto de stock libre | Objetos, lugares, manos, escritorios. Nunca la "persona que habla" | Pexels (licencia de uso comercial, sin atribución obligatoria) |
| 4 | Nada | Cuando ninguna de las anteriores mejora la lámina | Look tipográfico: `portada-titulo`, `texto-pleno`, `dato-hero`, `editorial-mono` |

Reglas de cada escalón:

**Foto real propia.** Es la única fuente que construye confianza con quien no te conoce. Manda en la portada y en el CTA. Guárdala una vez en `assets/fotos/` y apúntala desde `MI-MARCA.md` (sección 5). Para `marca.avatar` usa un cuadrado con la cara en el tercio superior: el código la recorta con `center top`.

**Generado con IA.** Higgsfield primero; nano-banana como segunda opción cuando Higgsfield no aplica. Los generadores de imagen que se cobran por llamada en pasarelas multi-modelo quedan fuera: cuestan más por imagen y el resultado fue peor en retrato. Un personaje generado se reutiliza en todo el carrusel para que las láminas se sientan de la misma serie: mismo prompt base, cambia solo la acción.

**Stock.** Pexels sirve para contexto (una mesa, una ciudad, un teclado). No sirve para representar al autor ni a su cliente: la gente reconoce el stock y baja la confianza. Descarga la versión más grande y guárdala local; no enlaces la URL del sitio en `imagen.src`.

**Nada.** El "sin imagen" es un resultado válido, no un fallo. Adaptado de Carrusel Studio de Ruva IA (youtube.com/@RuvaIA): cuando no hay foto, el default es el carrusel tipográfico, no un relleno. Los looks `editorial-mono` y `oscuro-tech` están diseñados para vivir sin imagen.

## 3. Recetas de prompt por look

Cada receta es un molde. Rellena el sujeto y conserva el resto. La última línea va siempre, sin excepción:

```
Absolutely no text, no letters, no words, no signage, no captions, no logos, no UI anywhere in the image.
```

Los modelos la ignoran a veces. Por eso hay checklist al final: si salió con letras, se regenera.

| Look | Fondo del look (`FONDO_EFECTIVO`) | Qué imagen pide | Modelo sugerido |
|---|---|---|---|
| `guia-rapida` | hueso `#EDE7DC` | Personaje de caricatura plana sobre fondo liso, colores planos, contorno limpio | `nano_banana_pro` |
| `oscuro-tech` | negro `#141316` | Ícono 3D con halo cálido, un solo objeto, fondo negro | `nano_banana_pro` |
| `noticia` | azul `#0A2560` | Escena fotográfica con espacio negativo oscuro arriba o abajo para el titular | `soul_location` |
| `recurso` | crema `#FBF7F0` | Personaje central sobre crema, cuerpo entero o tres cuartos, sombra suave | `nano_banana_pro` o `soul_2` con fondo quitado |
| `bosque` | verde `#113D2F` | Objeto o escena con luz cálida, tonos verde y ámbar, sin personas | `soul_location` |
| `editorial-mono` | papel `#F4F3EF` | Sin imagen. Si hay foto: blanco y negro, alto contraste, grano fino | foto real o Pexels, convertida a B/N |

Moldes de prompt (rellena `[sujeto]`):

**guia-rapida (personaje plano)**
```
Flat vector cartoon character, [sujeto: a business owner in her 40s holding a tablet],
simple geometric shapes, thick clean outlines, solid fill colors (electric blue, black, off-white),
full body, centered, plain solid off-white background #EDE7DC, no gradients, no shadows, no texture.
Absolutely no text, no letters, no words, no signage, no captions, no logos, no UI anywhere in the image.
```

**oscuro-tech (ícono 3D)**
```
Single 3D icon of [sujeto: a glowing chat bubble connected to a smartphone], glossy plastic and matte
black materials, soft warm orange rim light, subtle glow halo, centered, isolated on pure black background,
studio render, 4k, no environment.
Absolutely no text, no letters, no words, no signage, no captions, no logos, no UI anywhere in the image.
```

**noticia (escena fotográfica con hueco para el título)**
```
Editorial news photograph, [sujeto: a trading floor at night seen from above], cinematic, cool blue tones,
deep shadows, the lower half of the frame is dark and empty for overlay, shot on 35mm, photorealistic,
vertical 4:5 composition.
Absolutely no text, no letters, no words, no signage, no captions, no logos, no UI anywhere in the image.
```

**recurso (personaje central sobre crema)**
```
Friendly illustrated character, [sujeto: a man in his 50s pointing at a floating document], semi-flat
style with soft shading, warm coral and black accents, centered, standing, plain solid cream background
#FBF7F0, generous empty space above the head.
Absolutely no text, no letters, no words, no signage, no captions, no logos, no UI anywhere in the image.
```

**bosque (objeto con luz cálida)**
```
Cinematic still life photograph, [sujeto: a brass key resting on dark green velvet], warm amber side light,
deep forest green background, shallow depth of field, moody, photorealistic, vertical composition.
Absolutely no text, no letters, no words, no signage, no captions, no logos, no UI anywhere in the image.
```

**editorial-mono (foto B/N)**
No se genera. Se toma una foto real y se pasa a blanco y negro con contraste alto. Si no hay foto, la lámina va sin imagen.

Trampas conocidas de los modelos:
- `soul_2` en su estilo por omisión mete un marco de negativo de película con marcas de color. No obedece al prompt que lo prohíbe. Recorta el centro después de generar (en un 2048 × 2048, quédate con los 1860 × 1860 centrales) o elige un estilo sin marco.
- `soul_location` sale a 2048 × 1152 en 16:9. Para un fondo 4:5 pide 4:5 si el modelo lo acepta; si no, genera en 1:1 o 3:4 y recorta. No estires una imagen 16:9 a 4:5.
- Los trabajos son asíncronos. Genera en tandas de 8 o menos y espera el resultado; si mandas más en paralelo, los extras rebotan por límite de tasa.
- Para consistencia entre láminas, pasa la primera imagen aprobada como referencia de estilo a las siguientes (imagen de entrada + mismo prompt base).

## 4. Proporción y tamaño

El render sale a escala 2 (`--escala 2` por omisión): una lámina 4:5 se captura a 2160 × 2700. La imagen de origen debe aguantar ese tamaño sin verse borrosa.

| Uso (`pos`) | Tamaño mínimo | Tamaño ideal | Formato |
|---|---|---|---|
| `fondo` en 4:5 | 1080 × 1350 | 2160 × 2700 | JPG calidad 90 o PNG |
| `fondo` en 1:1 | 1080 × 1080 | 2160 × 2160 | JPG o PNG |
| `fondo` en 9:16 | 1080 × 1920 | 2160 × 3840 | JPG o PNG |
| `abajo` (42% del alto, `contain`) | 1080 de ancho | 2160 × 1140 | PNG con transparencia |
| `centro` (44% del alto, `contain`) | 1080 de ancho | 2160 × 1200 | PNG con transparencia |
| `derecha` (42% del ancho, `cover`) | 460 × 1350 | 920 × 2700 | JPG o PNG |
| `marca.avatar` (círculo 240 px) | 480 × 480 | 960 × 960 | JPG o PNG |

Reglas:
- Formato del carrusel: 4:5 por omisión. 1:1 solo si toda la serie es 1:1. Los formatos válidos del contrato son `4:5`, `3:4`, `1:1` y `9:16`.
- Personajes e íconos que van en `abajo` o `centro` se entregan en PNG con fondo transparente. Genera sobre fondo liso y pásalos por `remove_background`. Un personaje con un rectángulo de fondo distinto al del look se nota de inmediato.
- Si la imagen llega chica (menos de 1080 px de ancho), pásala por `upscale_image` antes de guardarla. No dejes que el navegador la estire.
- Si la imagen es 16:9 y la necesitas a 4:5 con más cielo o más piso, usa `outpaint_image` para extender y luego recorta. Extender es mejor que estirar.
- Deja aire en la composición: el margen seguro es de 80 px por lado y hay 140 px al pie que Instagram tapa o recorta en el grid. Nada importante de la imagen (una cara, un objeto clave) va en esas franjas.
- Con `fondo` el scrim del look oscurece la parte baja para que el título se lea. Compón la escena con el sujeto en la mitad superior y espacio vacío abajo. Adaptado de Carrusel Studio de Ruva IA (youtube.com/@RuvaIA): toda foto de fondo lleva una viñeta que oscurece borde y pie; aquí ya la pone el look con `--scrim`, no la agregues a la imagen.

## 5. Marcas, apps y productos: el logo REAL, nunca uno dibujado

Cuando la lámina habla de una herramienta con nombre (CapCut, Claude, WhatsApp, Excel, Canva),
va **su logo de verdad, bajado de internet**. Un ícono inventado por la IA con la forma
aproximada de la app se lee como falso y le quita autoridad a la pieza. Esto no es opcional.

**De dónde sacarlo, en este orden:**

1. **El ícono oficial de la app en la tienda.** La API pública de la App Store devuelve el
   icono a 512 px sin autenticación y es la fuente más confiable y estable:
   ```bash
   curl -s "https://itunes.apple.com/search?term=<app>&entity=software&limit=3&country=us" \
     | python3 -c "import json,sys; [print(r['trackName'],'|',r['sellerName'],'|',r['artworkUrl512']) for r in json.load(sys.stdin)['results']]"
   ```
   Verifica el `sellerName` antes de bajarlo: hay imitaciones con nombres parecidos.
2. **El sitio oficial de la marca** (sala de prensa, `/brand`, `/press`), o el icono que sirve la
   propia app (`https://<dominio>/images/...`).
3. Repositorios de marcas como último recurso, y solo si el archivo se ve idéntico al oficial.
   Los CDN que exigen clave (`brandfetch`, `logo.dev`) devuelven 403: no pierdas tiempo ahí.

**Cómo montarlo en la lámina.** Los iconos de app son cuadrados; recórtalos con esquinas
redondeadas y móntalos sobre fondo transparente, como se ven en un teléfono. Dos marcas que se
conectan se leen mejor como `icono + icono` con un signo del color del acento en medio,
dibujado con formas (no con tipografía, que la imagen no lleva letras):

```python
from PIL import Image, ImageDraw
LADO, RADIO, GAP = 420, 96, 150
def icono_redondeado(ruta, lado=LADO, radio=RADIO):
    im = Image.open(ruta).convert("RGBA").resize((lado, lado), Image.LANCZOS)
    if im.getchannel("A").getextrema()[0] < 250:          # si trae alfa, ponle su fondo de marca
        fondo = Image.new("RGBA", im.size, (240, 234, 220, 255)); fondo.alpha_composite(im); im = fondo
    mascara = Image.new("L", (lado, lado), 0)
    ImageDraw.Draw(mascara).rounded_rectangle([0, 0, lado - 1, lado - 1], radius=radio, fill=255)
    im.putalpha(mascara); return im
```

Guárdalo en `assets/img/NN-<marca-a>-mas-<marca-b>.png` y anota en `imagen.prompt` de dónde salió
cada logo. **Un logo de tercero nunca es el protagonista de la portada** ni sugiere patrocinio.

## 5b. Logos de terceros (criterio general)

Cuando la lámina habla de una herramienta (un modelo, una app), el logo real ayuda a que se entienda. Dos fuentes que funcionan:

1. **Simple Icons**: `https://cdn.simpleicons.org/SLUG` devuelve el logo en SVG monocromo. Acepta color: `https://cdn.simpleicons.org/SLUG/ffffff` para blanco sobre `oscuro-tech`. Busca el slug en simpleicons.org.
2. **Favicon oficial**: `https://www.google.com/s2/favicons?domain=DOMINIO&sz=128`. Es a color pero chico (128 px). Sirve para chips y listas, no para portadas.

Cómo se usa:
- Descárgalo a `assets/img/` y referéncialo local. Un enlace remoto en `imagen.src` funciona en el código, pero el render de Playwright puede correr sin red y la lámina sale sin logo.
- Verifica que renderice: abre `slides-src/index.html` o mira `preview.jpg`. Un SVG con `currentColor` sobre fondo del mismo tono desaparece.
- Un logo va como acompañante (chip, esquina, junto a un ícono), no como imagen de fondo.

Advertencia de derechos: los logos son marcas registradas. Mencionar una herramienta y mostrar su logo pequeño para identificarla es uso habitual. Poner el logo de un tercero como protagonista de la portada, o combinarlo con tu marca como si fueran socios, sí expone a un reclamo y a que Instagram baje la pieza. Si el logo es el protagonista, sustitúyelo por un ícono 3D genérico del look `oscuro-tech` y deja el nombre en el título, por código.

## 6. Imágenes de personas reales

- Tu propia cara: foto real o un Element/Soul entrenado con tu rostro. Si la del CTA es generada, dilo en `notas` del carrusel y no la uses como "foto".
- Otras personas reales (clientes, equipo, invitados): solo con permiso por escrito. Sin permiso, no aparecen. Un pixelado no es permiso.
- Capturas de pantalla con nombres, fotos de perfil o comentarios de terceros: tapa lo que identifique a la persona antes de guardar la captura en `assets/`.
- Personas generadas: nunca las presentes como reales. Si un retrato generado sirve como personaje ("una dueña de negocio"), que se vea ilustración o que el caption lo diga. Un retrato fotorrealista generado, sin aviso, presentado como cliente o testimonio, es engaño y no sale de esta skill.
- Personajes públicos: no se generan con IA ni se usan sus fotos sin licencia. Se nombran por código en el texto.

## 7. Cómo guardar y referenciar

La carpeta del carrusel es la unidad de trabajo. Todo lo que la lámina necesita vive adentro.

```
mi-carrusel/
├── carrusel.json
├── assets/
│   ├── img/
│   │   ├── 01-portada-oficina-noche.jpg
│   │   ├── 03-personaje-tablet.png
│   │   └── 07-icono-burbuja.png
│   └── fotos/
│       └── avatar.jpg
├── slides-src/      (lo genera render.mjs)
└── slides/          (lo genera render.mjs: 01.png … NN.png)
```

Reglas de nombre y referencia:
- `assets/img/NN-descripcion.ext`, donde `NN` es el número de lámina con cero a la izquierda y la descripción va en minúsculas con guiones. Así se sabe a qué lámina pertenece sin abrir el JSON.
- Fotos reales reutilizables (avatar, retratos) van en `assets/fotos/`, no en `img/`, para copiarlas de un carrusel a otro.
- En el JSON, la ruta es relativa a `carrusel.json`: `"src": "assets/img/03-personaje-tablet.png"`. El código la resuelve desde la carpeta del carrusel y la convierte a relativa desde `slides-src/`. También acepta rutas absolutas, `http(s)://` y `data:`; usa local salvo que tengas una razón.
- Guarda el prompt en `imagen.prompt` junto al `src`. Cuando haya que regenerar, ahí está.
- Ejemplo completo de una lámina con imagen:

```json
{
  "rol": "cuerpo",
  "layout": "punto-numero",
  "numero": "03",
  "titulo": "Pídele el *resumen* antes de leer",
  "cuerpo": "Pega el documento y pide tres puntos. Luego decides si vale tu hora.",
  "imagen": {
    "src": "assets/img/03-personaje-tablet.png",
    "pos": "abajo",
    "prompt": "Flat vector cartoon character, a business owner in her 40s reading a tablet, ... Absolutely no text ..."
  }
}
```

- Si el carrusel se comparte o se versiona, la carpeta viaja con sus `assets/`. `slides/` y `slides-src/` se regeneran y no se versionan.

## 8. Checklist de imagen antes de renderizar

Pasa cada imagen por esta lista. Una respuesta "no" bloquea el render de esa lámina.

- [ ] La imagen no tiene letras, números, logos ni elementos de interfaz. Se revisó a tamaño real, no en miniatura.
- [ ] El tamaño cumple la tabla de la sección 4 (mínimo 1080 px de ancho para `fondo`, `abajo` y `centro`).
- [ ] La proporción coincide con el uso: `fondo` en la proporción del carrusel; `derecha` vertical; avatar cuadrado.
- [ ] Los personajes e íconos en `abajo` o `centro` son PNG con transparencia, sin halo blanco en el borde.
- [ ] Nada importante cae en los 80 px de margen ni en los 140 px del pie.
- [ ] Con `pos: "fondo"`, la mitad inferior es oscura o vacía y el título se lee sobre el scrim. `scripts/qa.mjs` reporta el contraste; el texto principal debe quedar en 4.5:1 o más, ideal 7:1.
- [ ] **El texto que cae ENCIMA de la foto se lee.** No es lo mismo que el contraste contra el fondo del look: lo que hay detrás de esas letras son los píxeles de la foto. `scripts/qa.mjs` lo mide sobre el PNG renderizado, columna por columna del ancho de cada palabra, y **bloquea** (error, no aviso) si un tramo del texto queda por debajo de 3:1 contra lo que tiene debajo. Salidas cuando salta: `"panel": true` detrás de la foto, otro `imagen.pos`, `"sin_top": true` para el contador o `"pie": ""` para el «Desliza». Caso real que pasaba por bueno: el `@handle` en gris oscuro sobre un zapato negro, 100/100 en el QA viejo y unas letras que en el celular no existen.
- [ ] La imagen es del look: paleta y estilo de la tabla de la sección 3. Un ícono 3D negro en `guia-rapida` no pasa.
- [ ] Un mismo personaje en todas las láminas donde aparece (mismo prompt base, misma referencia).
- [ ] Fuente y derechos claros: propia, generada, Pexels, o logo pequeño de identificación. Sin capturas de terceros con datos visibles.
- [ ] Personas reales con permiso. Personas generadas señaladas como tales.
- [ ] Archivo guardado en `assets/img/NN-descripcion.ext` o `assets/fotos/`, ruta relativa en `imagen.src`, prompt en `imagen.prompt`.
- [ ] Se abrió `slides-src/index.html` o `preview.jpg` y la imagen aparece en la posición esperada. Una ruta rota no da error: la lámina sale sin imagen.

Si una lámina no pasa el checklist y no hay tiempo de arreglar la imagen, quítale `imagen` y déjala tipográfica. Es mejor que publicar una imagen a medias.

## Taller: lo que aprendimos generando de verdad (2026-09-06)

1. **Descargar el resultado.** Las herramientas de imagen por MCP devuelven una URL (`rawUrl`) del trabajo terminado, no un archivo local. Bájala con `curl -sL "<url>" -o assets/img/NN-nombre.png` dentro de la carpeta del carrusel. Anota en `imagen.prompt` el prompt y el modelo real que usó la herramienta (puede sustituir el modelo pedido: `nano_banana_pro` se sirvió como `nano_banana_2`; no falla, solo cambia el nombre).
2. **Quitar fondos.** `remove_background` de Higgsfield acepta el `job_id` de la generación (`media_id: <job_id>, media_type: "image"`) y devuelve un PNG con transparencia en ~20 s. Para un archivo local con fondo liso: `python3 scripts/quitar-fondo.py entrada.png salida.png` (Pillow; inundación desde las esquinas). Fondos complejos: un servicio de recorte.
3. **Un solo rostro por carrusel.** Si la portada lleva un retrato generado con el personaje del usuario (Soul), el CTA también; si la portada es foto real, el CTA es foto real. Dos versiones de la misma persona en una pieza se notan y contradicen el mensaje «se nota cuando lo hizo la IA».
4. **Retrato de fondo en la portada (`portada-foto`).** El sujeto ocupa un lado (o la mitad superior) y el titular el otro; con `alinea: "abajo"` el título queda bajo el rostro, nunca encima de la cara ni sobre ropa oscura que baje el contraste. Pide el retrato con «plain background, subject on the right third» o recórtalo con `pos: "derecha"`.
5. **`abajo` corta la parte baja.** Una imagen con `pos: "abajo"` termina 110 px arriba del borde para no chocar con la barra del handle; si la imagen es apaisada (16:9) queda chica. Genera en 4:3 o 1:1 y con el sujeto centrado.
6. **Ilustración en el cuerpo: una, no cinco.** Un ícono 3D o personaje en una lámina de cuerpo reactiva la atención; en todas, cansa y compite con el texto.

## Los tres bancos de rostro (obligatorio en cada carrusel)

La cara del usuario en una situación del tema es lo que da personalidad y lo que la audiencia
reconoce en el feed. La carpeta de trabajo guarda tres bancos, y se usan en este orden:

| Banco | Dónde | Qué tiene | Cuándo |
|---|---|---|---|
| **Fotos reales** | `assets/fotos/reales/` + `catalogo.json` (`fotos`) | Fotos de estudio y de eventos ya curadas, reducidas a 3000 px, con `recorte` PNG con alfa y `url` pública si el banco está en la nube. Cada una anotada: situación, fondo, lado del sujeto, lado libre para el texto, looks y temas afines | Primera opción siempre. Portada y CTA salen de aquí salvo que el tema pida dibujo |
| **Avatares** | mismo `catalogo.json` (`avatares`) | La cara real dibujada en el estilo de cada look (vector, pop-art, pintura con neón, papel recortado, linograbado, grabado), con su `-recorte.png` | Láminas de cuerpo con humor, cheatsheets, carruseles donde la foto pesa demasiado. Receta en `AVATARES.md` |
| **Personaje generado** | `assets/fotos/soul/` + `catalogo.json` | Retratos fotorrealistas del personaje entrenado (Soul) en situaciones: laptop, pizarrón, café, escenario, mostrador… | Cuando ninguna foto real cuenta la situación del tema y no hay tiempo de sesión. Nueva pose: `soul_2` + `soul_id` de `MI-MARCA.md`, «subject on the right/left third, plain background, no text» |

Reglas de uso:

1. Portada: elige la foto cuya situación cuente el tema (celular = WhatsApp, café en evento =
   autoridad, mano en el mentón = decidir, señalando = dato o CTA, riendo = contrarian). El
   catálogo tiene `temas` justo para esto: búscalo antes de generar nada.
2. Recortes con alfa (`recortes/`): sirven para `pos: "recorte"` sobre un `panel` o sobre el
   fondo del look. Los de fotos reales se hacen con `scripts/banco-fotos.py recortar` (rembg,
   modelo `birefnet-portrait`, el único que respetó traje oscuro sobre fondo oscuro) o con
   `remove_background` de Higgsfield (subiendo la foto: `media_upload` → `curl PUT` →
   `media_confirm`). Los de generaciones, con `remove_background` y el `job_id`. El recorte local
   por inundación (`quitar-fondo.py`) solo sirve para ilustraciones sobre fondo liso.
3. Un carrusel usa **una sola fuente de rostro** (todo real, todo avatar del mismo estilo o todo
   Soul), dos o tres apariciones (portada, una lámina de cuerpo, CTA) y nunca la misma pose dos veces.
4. Todo lo nuevo entra al banco con su línea en `catalogo.json` para la próxima vez.

### Cómo se alimenta el banco de fotos reales (`scripts/banco-fotos.py`)

```
banco-fotos.py --banco <carpeta>/assets/fotos/reales cosechar --carpeta ~/Fotos/Sesion --paso 5 --max 52
banco-fotos.py --banco … cosechar --album "Eventos 2026" --max 40      # Fotos.app de macOS, por AppleScript
banco-fotos.py --banco … hoja                                          # hojas de contacto numeradas
banco-fotos.py --banco … curar --aceptar "3:traje-azul-brazos-cruzados,7:camisa-blanca-riendo" --rechazar-resto
banco-fotos.py --banco … recortar --todos                               # PNG con alfa (rembg vía uvx)
banco-fotos.py --banco … anotar real-01 --situacion "…" --fondo "…" --sujeto centro --looks guia-rapida,recurso --temas decidir,dudas
banco-fotos.py --banco … subir                                          # Vercel Blob → url en el catálogo
```

- **Cosechar** copia candidatas a `_entrada/` reducidas a 3000 px, salta capturas de pantalla,
  miniaturas y repetidas. La búsqueda por nombre en Fotos.app devuelve capturas donde aparece
  el nombre, no la persona: usa **álbumes** («sesión de estudio», «eventos») o carpetas del disco.
- **Hoja** genera `hoja-N.jpg` con 24 fotos numeradas; se eligen mirando (Claude puede verlas con
  la herramienta de lectura de imágenes) por nitidez, fondo limpio y pose útil.
- **Curar** acepta con un slug y borra el resto; **recortar** hace el PNG con alfa y limpia el
  halo; **anotar** escribe lo que la skill usa para elegir.
- **Subir** manda fotos, recortes y avatares a un almacén con URL pública (Vercel Blob; token en
  `~/.vercel-blob-cli/.env`) y escribe `url`, `recorte_url` y `base_url` en el catálogo. Así el
  banco está disponible desde cualquier máquina (`banco-fotos.py bajar <base_url>`), desde
  claude.ai (las láminas cargan la imagen por URL) y para Higgsfield (`media_import_url`).
- **Público pero invisible.** Cada `subir` publica un `robots.txt` con `Disallow: /` en la raíz
  del almacén: nada se indexa en buscadores. Con `--rotar`, el banco se vuelve a subir bajo un
  prefijo impredecible (`banco-<12 hex>`), se borra el prefijo anterior y, si pasas
  `--mi-marca MI-MARCA.md`, la ficha recibe la nueva `banco_url`. Un link filtrado deja de servir
  en la siguiente rotación. Prográmala mensual (launchd, cron) si el banco lleva fotos personales;
  los entregables (`entregables/`) no rotan porque viven en los DM ya enviados. Consecuencia: un
  `carrusel.json` que apunte a la URL de la nube se re-renderiza solo si copiaste la imagen a
  `assets/img/` del carrusel, que es lo que la skill hace siempre.
