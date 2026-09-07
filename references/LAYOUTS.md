# Contrato carrusel.json y los 11 layouts

`carrusel.json` es el único archivo que separa a quien escribe (Claude, Hermes o una persona) de quien renderiza (`scripts/render.mjs`) y de quien revisa (`scripts/qa.mjs`). Todo lo que no esté aquí no existe para el render. Los nombres de looks, layouts y campos son exactos: una letra distinta y el campo se ignora en silencio.

Fuente de verdad: `templates/carrusel.schema.json` (qué campos hay) y `scripts/lib/construir-html.mjs` (qué hace cada uno). Este documento los traduce a reglas de escritura.

## Cómo se arma una lámina

Antes de escribir, entiende dónde cabe el texto. Todas las medidas salen de `templates/base.css`.

| Zona | Medida | Qué pasa ahí |
|---|---|---|
| Lienzo | 1080 × 1440 px en `3:4` (1350 en `4:5`, 1080 en `1:1`, 1920 en `9:16`) | Fondo a sangre |
| Margen seguro | 80 px por lado | Ningún texto lo cruza. QA marca error si lo hace |
| Barra superior | y = 56 px | Etiqueta de serie a la izquierda, contador `01/08` a la derecha |
| Área de contenido | de 150 px arriba a 150 px abajo, 920 px de ancho | Aquí vive todo el texto de la lámina: 1,140 px de alto en 3:4, 1,050 en 4:5 |
| Barra inferior | y = 52 px desde abajo | `@handle` a la izquierda; a la derecha `Desliza →` en portada o `3 de 8` |
| Franja tapada por Instagram | últimos 140 px | Nada crítico ahí: QA avisa |

Si el contenido no cabe, el HTML reduce la letra hasta 15%. QA avisa cuando la reducción pasa de 8% y marca error si aun con 15% desborda. La regla práctica: escribe para que quepa sin reducción.

Tres niveles tipográficos por lámina, no más: título (84 a 156 px), subtítulo o cuerpo (38 a 60 px), micro (30 a 38 px). QA marca aviso por debajo de esos mínimos (84, 38 y 30) y error por debajo de 30 px.

## Raíz del JSON

| Campo | Obligatorio | Tipo | Regla |
|---|---|---|---|
| `version` | no | entero | Siempre `1` |
| `slug` | sí | texto | Solo `a-z`, `0-9` y guiones. Es el nombre de carpeta y del HTML |
| `fecha` | no | texto | `AAAA-MM-DD` de publicación prevista |
| `marca` | sí | objeto | Ver abajo. `handle` es obligatorio |
| `look` | sí | enum | `guia-rapida`, `noticia`, `oscuro-tech`, `recurso`, `bosque`, `editorial-mono` |
| `formato` | no | enum | `3:4` (default, 1080x1440: el que prioriza Instagram y el de la cuadrícula del perfil), `4:5` (1080x1350), `1:1`, `9:16`. Todas las láminas comparten formato |
| `serie` | no | texto | Etiqueta de la barra superior en todas las láminas. 1 a 3 palabras |
| `tema` | no | texto | Una frase. No se renderiza |
| `tipo` | no | enum | `guia`, `lista`, `recurso`, `noticia`, `tutorial`, `contrarian`, `historia`, `comparativa`, `prompt` |
| `objetivo` | no | enum o arreglo de 2 | `saves`, `shares`, `comments`, `follows` (o `["saves","shares"]`: principal + secundaria) |
| `palabra_clave` | no | texto | La palabra del CTA. Debe aparecer en la lámina `cta` y en el `caption`; si falta en alguno, QA da error |
| `entregable` | no | texto | Qué se manda por DM cuando comentan la palabra |
| `referencia` | no | texto | Link o archivo de origen |
| `slides` | sí | arreglo | Entre 5 y 20 objetos. QA avisa arriba de 12 |
| `caption` | sí | texto | Primera línea ≤125 caracteres: es el segundo gancho |
| `hashtags` | no | arreglo | Máximo 5. QA da error con 6 o más y avisa con 0 |
| `notas` | no | texto | Para el equipo. No se renderiza |

Un `look` mal escrito no rompe el render: cae a `guia-rapida` sin avisar. Revisa el nombre.

### `marca`

| Campo | Obligatorio | Dónde aparece |
|---|---|---|
| `handle` | sí | Barra inferior de todas las láminas y sello del CTA. Con `@` |
| `nombre` | no | No se renderiza; sirve de contexto |
| `avatar` | no | Foto circular de 240 px en `cta-cara`. Ruta relativa a la carpeta del carrusel |
| `sello` | no | Texto que sigue al `@` en el CTA, separado por `·`. Máximo 5 palabras |

## Campos de cada slide

> `alt` (opcional, ≤1,000 caracteres): texto alternativo de la lámina para Instagram, en lenguaje natural y con la palabra clave del tema. No se renderiza; `caption.txt` lo lista para pegarlo al subir. QA avisa si ninguna lámina lo trae.


> `cta-cara` con `imagen` (recorte o derecha) omite el avatar circular: la imagen es el rostro. Sin `imagen`, pinta `marca.avatar`. Además omite la barra inferior por omisión: el `@` ya va en el sello junto al botón. `sin_bottom: false` la fuerza; en cualquier otro layout `sin_bottom: true` la quita (solo con foto a sangre y nunca en portada).


Solo `layout` es obligatorio. `rol` vale `cuerpo` si lo omites.

| Campo | Qué hace | Límite |
|---|---|---|
| `rol` | `portada`, `rehook`, `agitacion`, `cuerpo`, `cheatsheet`, `cta` | Una sola lámina `cta`, al final. Lámina 2 con `rehook` o `agitacion` |
| `layout` | Uno de los 11 de abajo | Exacto |
| `kicker` | Píldora de color arriba del título | ≤3 palabras. Máximo 1 cada 3 láminas |
| `titulo` | Titular. Su tamaño se calcula por caracteres | 4 a 7 palabras en portada; QA da error arriba de 9 |
| `subtitulo` | Línea condensada bajo el título, 60 px | ≤12 palabras |
| `cuerpo` | Párrafo de 50 px | ≤25 palabras; ≤15 si también hay subtítulo |
| `loop` | Frase al pie con flecha `→` que obliga a deslizar | ≤8 palabras. Ponlo en al menos la mitad de las láminas `cuerpo` |
| `numero` | Número de acento de 72 px en `punto-numero`; respaldo de `dato` | `01`, `02`… |
| `numero_fantasma` | Número gigante de 420 px al 8% de opacidad, arriba a la derecha | 1 o 2 caracteres. Mismo número que `numero` |
| `dato` | Cifra de 230 px en `dato-hero` | ≤6 caracteres, incluido `%` o `x` |
| `items` | Lista de `lista` | Ver layout |
| `a`, `b` | Columnas de `comparativa` | Ver layout |
| `pasos` | Pasos de `pasos` | Ver layout |
| `cita`, `autor` | Texto entre comillas y firma | Ver layout |
| `prompt`, `etiqueta` | Bloque monoespaciado y su etiqueta | Ver layout |
| `boton` | Píldora del CTA | ≤3 palabras. Una sola acción |
| `chips` | Fichas de mayúsculas bajo el subtítulo | 3 a 5 chips de ≤2 palabras. Solo en portadas y `texto-pleno` |
| `imagen` | Foto o ilustración | Ver sección de imagen |
| `pie` | Sustituye el texto derecho de la barra inferior | En portada cambia `Desliza` |
| `etiqueta_top` | Sustituye `serie` solo en esa lámina | ≤3 palabras |
| `alinea` | `centro` (default), `arriba`, `abajo` | Los layouts densos van `arriba` solos |
| `centrado` | `true` centra texto y píldoras | Úsalo en citas y CTA |
| `sin_top`, `sin_bottom` | `true` quita la barra correspondiente | Solo con foto a sangre que ya trae su propia jerarquía |
| `clase` | Clase CSS extra | Solo dos valores tienen efecto sin CSS propio: `recorte-suave` (con `imagen.pos: "derecha"` la foto se ajusta entera, pegada abajo a la derecha, en vez de recortarse a cubrir; sirve para recortes con alfa en layouts que no aceptan `recorte`) y `centrado`. Cualquier otra clase se ignora salvo que la definas en tu look |

### Qué renderiza cada layout

El render ignora los campos que no están en su fila. Si pones `cuerpo` en una `lista`, no aparece.

| Layout | kicker | titulo | subtitulo | cuerpo | loop | Propios |
|---|---|---|---|---|---|---|
| `portada-titulo` | sí | sí | sí | sí | sí | `chips` |
| `portada-foto` | sí | sí | sí | sí | sí | `chips`, `imagen` (fondo) |
| `punto-numero` | no | sí | sí | sí | sí | `numero` |
| `dato-hero` | sí | sí | sí | sí | sí | `dato` (o `numero`) |
| `lista` | sí | sí | sí | no | sí | `items` |
| `comparativa` | sí | sí | sí | no | sí | `a`, `b` |
| `pasos` | sí | sí | sí | no | sí | `pasos` |
| `cita` | sí | respaldo | no | sí | sí | `cita`, `autor` |
| `texto-pleno` | sí | sí | sí | sí | sí | `chips` |
| `prompt` | sí | sí | sí | no | sí | `prompt`, `etiqueta` |
| `cta-cara` | no | sí | sí | sí | no | `boton`; usa `marca.avatar` y `marca.sello` |

`numero_fantasma`, `imagen`, `pie`, `etiqueta_top`, `alinea`, `centrado`, `sin_top` y `sin_bottom` funcionan en cualquier layout.

## Marcado dentro del texto

Tres marcas, nada más:

- `*palabra*` pinta la palabra con el color de acento del look. Úsala en el título de portada (QA avisa si falta) y en una palabra por lámina como máximo.
- `**frase**` pone negrita y tinta plena en `cuerpo` y `subtitulo`.
- `\n` fuerza salto de línea.

Funcionan en `titulo`, `subtitulo`, `cuerpo`, `loop`, `dato`, `cita`, `items[].texto`, `items[].nota`, `a.items`, `b.items`, `pasos[].titulo` y `pasos[].detalle`. No funcionan en `kicker`, `chips`, `autor`, `boton`, `etiqueta`, `a.titulo`, `b.titulo`, `numero` ni en `prompt`: ahí los asteriscos salen tal cual.

Las comillas de la cita las pone el CSS. No las escribas en `cita`.

## Imagen

```json
"imagen": { "src": "assets/ilustracion.png", "pos": "abajo", "sangra": false, "prompt": "..." }
```

| Campo | Regla |
|---|---|
| `src` | Ruta relativa a la carpeta del carrusel, absoluta, `http(s)` o `data:`. Sin `src` no hay imagen |
| `pos` | `fondo`: cubre toda la lámina con un degradado oscuro encima. `abajo`: ocupa el 42% inferior (apoyada a 110 px del pie) y el texto queda entre 130 y 742 px de alto. `derecha`: ocupa el 42% derecho y el texto se queda en los 514 px de la izquierda. `centro`: franja del 18% al 62% de alto y el texto baja debajo |
| `sangra` | Solo con `abajo`. `true` recorta a sangre (cover); `false` muestra completa (contain). PNG con fondo transparente va en `false` |
| `prompt` | No se renderiza. Es la instrucción para generar la imagen si no existe. Termina siempre con "sin texto en la imagen" |

Default de `pos`: `fondo` en `portada-foto`, `abajo` en cualquier otro layout.

Con `derecha` el texto tiene 514 px de ancho: título ≤5 palabras y cuerpo ≤15. Con `abajo` el texto tiene 612 px de alto: título ≤6 palabras, sin cuerpo largo. Con `centro` el texto tiene 360 px de alto: título de una línea y un cuerpo de ≤12 palabras.

## Tamaño automático del título

El render mide los caracteres del título (sin asteriscos) y elige la clase.

| Caracteres | Clase | Tamaño | Cabe en |
|---|---|---|---|
| ≤16 | `t-xl` | 156 px | 1 o 2 líneas |
| ≤30 | `t-l` | 128 px | 2 o 3 líneas |
| ≤46 | `t-m` | 108 px | 3 líneas |
| ≤68 | `t-s` | 92 px | 4 líneas |
| >68 | `t-xs` | 84 px | Reescribe: es demasiado |

Excepciones: `texto-pleno` usa cortes en 22, 40 y 60 caracteres. `lista`, `comparativa`, `pasos` y `prompt` fijan el título en 88 px pase lo que pase. `punto-numero` limita `t-xl` y `t-l` a 112 px para no pelear con el número.

## Los 11 layouts

Cada ejemplo es un objeto válido dentro de `slides`. Los límites son los que caben sin reducción de letra y sin que QA marque desbordamiento ni exceso de palabras (40 por lámina normal, 70 por lámina guardable).

### `portada-titulo`

Portada sin foto. El título llena la lámina; el look pone forma y color.

```json
{ "rol": "portada", "layout": "portada-titulo",
  "titulo": "5 números que *salvan* tu negocio",
  "subtitulo": "Revísalos cada lunes en 10 minutos.",
  "chips": ["Flujo", "Margen", "Cobranza"] }
```

Límites: título 4 a 7 palabras con una en `*acento*` y de preferencia un número, negación o pregunta; subtítulo ≤12 palabras; chips de 3 a 5; sin `cuerpo` o ≤15 palabras.

### `portada-foto`

Portada con foto a sangre y degradado. El texto va abajo para no tapar la cara.

```json
{ "rol": "portada", "layout": "portada-foto", "alinea": "abajo",
  "titulo": "Deja de *perseguir* pagos",
  "subtitulo": "El sistema que cobra por ti.",
  "imagen": { "src": "assets/portada.jpg", "pos": "fondo" } }
```

Límites: los de `portada-titulo`. Foto con el sujeto en el tercio superior y fondo limpio abajo. Sin `chips` si la foto ya es la protagonista.

### `punto-numero`

Un punto de una lista larga, uno por lámina. Número de acento arriba y número fantasma al fondo.

```json
{ "rol": "cuerpo", "layout": "punto-numero", "numero": "01", "numero_fantasma": "1",
  "titulo": "Flujo de caja a *30 días*",
  "cuerpo": "Cuánto entra y cuánto sale en el mes que viene. Si el saldo es negativo, todo lo demás espera.",
  "loop": "El segundo casi nadie lo mira" }
```

Límites: título ≤8 palabras; cuerpo ≤25; loop ≤8. No lleva `kicker`: úsalo en otra lámina.

### `dato-hero`

Una cifra de 230 px con su explicación. Es la lámina que se comparte.

```json
{ "rol": "cuerpo", "layout": "dato-hero", "kicker": "Dato",
  "dato": "10 min",
  "titulo": "cada lunes. *Eso es todo.*",
  "cuerpo": "Más tiempo no da mejores decisiones. Da más pretextos para no decidir.",
  "loop": "Así se hace en 4 pasos" }
```

Límites: `dato` ≤6 caracteres (`82%`, `3x`, `$40K`); título ≤10 palabras que se lean como continuación de la cifra; cuerpo ≤20. Si falta `dato`, usa `numero`.

### `lista`

La lámina guardable. Numeración automática `01`, `02`… salvo que pongas `idx`.

```json
{ "rol": "cheatsheet", "layout": "lista",
  "titulo": "Los *5* números",
  "items": [
    { "texto": "Flujo de caja a 30 días", "nota": "Entradas menos salidas del mes que viene" },
    { "texto": "Margen bruto por producto", "nota": "Qué vendes con ganancia y qué por costumbre" },
    { "texto": "Días de cobranza", "nota": "Cuánto tardas en ver el dinero" },
    { "texto": "Costo de adquisición", "nota": "Lo que te cuesta cada cliente nuevo" },
    { "texto": "Utilidad neta real", "nota": "Después de impuestos y de tu sueldo" }
  ],
  "loop": "Cómo revisarlos sin contador" }
```

Límites: título ≤5 palabras (una línea a 88 px); ≤5 items con `nota` o ≤6 sin nota; `texto` ≤6 palabras para que quede en una línea; `nota` ≤8 palabras; total ≤70 palabras. Los items también pueden ser strings simples: `"items": ["Flujo", "Margen"]`.

### `comparativa`

Dos columnas. La columna `b` lleva el título en color de acento: ahí va lo correcto.

```json
{ "rol": "cuerpo", "layout": "comparativa",
  "titulo": "Lo que *revisa* la mayoría",
  "a": { "titulo": "Cada mes", "items": ["Ventas totales", "Saldo en banco", "Lo que dice el contador"] },
  "b": { "titulo": "Cada lunes", "items": ["Flujo a 30 días", "Margen por producto", "Días de cobranza"] },
  "loop": "El cambio toma 10 minutos" }
```

Límites: título ≤5 palabras; `a.titulo` y `b.titulo` ≤2 palabras (van en mayúsculas en 390 px de ancho); ≤3 items por columna de ≤4 palabras cada uno (a 38 px caben 20 caracteres por línea; más de dos líneas rompe el ritmo).

### `pasos`

Secuencia numerada con número grande a la izquierda.

```json
{ "rol": "cuerpo", "layout": "pasos",
  "titulo": "Tu revisión de los *lunes*",
  "pasos": [
    { "titulo": "Descarga el estado de cuenta", "detalle": "Solo los últimos 30 días" },
    { "titulo": "Suma lo que entra en 30 días", "detalle": "Facturas por cobrar con fecha" },
    { "titulo": "Resta lo que tienes que pagar", "detalle": "Nómina, renta, proveedores" },
    { "titulo": "Anota el saldo y compáralo", "detalle": "Contra el lunes anterior" }
  ],
  "loop": "Hay un atajo con IA" }
```

Límites: título ≤5 palabras; ≤4 pasos; `titulo` de paso ≤6 palabras; `detalle` ≤10 palabras. `n` es opcional: sin él numera 1, 2, 3.

### `cita`

Una frase entre comillas de acento y una firma. Sin subtítulo.

```json
{ "rol": "agitacion", "layout": "cita", "centrado": true,
  "cita": "Ventas es vanidad. Utilidad es cordura. Caja es realidad.",
  "autor": "Dicho de tesorería",
  "loop": "Y la caja se revisa así" }
```

Límites: `cita` ≤16 palabras (96 px, hasta 7 líneas); `autor` ≤5 palabras. No escribas comillas: el CSS las pone. Si omites `cita`, el render usa `titulo`.

### `texto-pleno`

Solo tipografía. Para el rehook de la lámina 2, la agitación o un manifiesto.

```json
{ "rol": "rehook", "layout": "texto-pleno",
  "titulo": "La mayoría revisa *ventas*. Y nada más.",
  "cuerpo": "Por eso venden más y se quedan sin dinero. Los cinco de aquí abajo lo evitan.",
  "loop": "Empieza por el que más duele" }
```

Límites: título ≤12 palabras (arriba de 60 caracteres baja a 92 px); cuerpo ≤25; total ≤40 palabras.

### `prompt`

Bloque monoespaciado para copiar. Se guarda y se comparte.

```json
{ "rol": "cuerpo", "layout": "prompt", "kicker": "Copia esto",
  "titulo": "Pégalo con tu *estado de cuenta*",
  "prompt": "Actúa como director financiero. Con este estado de cuenta calcula: flujo neto a 30 días, los 3 gastos que más pesan y un riesgo que no estoy viendo. Responde en 5 líneas, sin tecnicismos.",
  "loop": "¿Quieres la plantilla completa?" }
```

Límites: título ≤5 palabras; `prompt` ≤45 palabras (a 40 px monoespaciado caben 34 caracteres por línea y 9 líneas). El bloque no interpreta `*acento*`: escribe texto limpio. Los saltos de línea reales sí se respetan.

`etiqueta` existe pero hoy conviene omitirla: se pinta a 30 px (QA avisa: mínimo 38) con el color de acento del look sobre el fondo negro del bloque. Medido con `qa.mjs`: error de contraste en `guia-rapida` (2.6:1), aviso en `editorial-mono` (3.4:1) y `recurso` (3.9:1), limpio en `bosque`, `noticia` y `oscuro-tech`. Si la usas, ≤3 palabras y solo en esos tres looks. El `kicker` cumple la misma función sin ese problema.

### `cta-cara`

Última lámina. Foto circular, título, una sola acción en píldora y el sello de marca.

```json
{ "rol": "cta", "layout": "cta-cara", "centrado": true,
  "titulo": "¿Quieres la *plantilla*?",
  "cuerpo": "Comenta LUNES y te la mando por DM. Sin registro.",
  "boton": "Comenta LUNES" }
```

Límites: título ≤6 palabras; cuerpo ≤15 palabras y debe contener `palabra_clave` en mayúsculas; `boton` ≤3 palabras. El avatar sale de `marca.avatar` y el sello de `marca.handle` + `marca.sello`. No renderiza `kicker` ni `loop`.

## Ejemplo completo: 8 láminas

Marca ficticia `@tumarca`, tema de negocios. Medido con `node scripts/qa.mjs`: 100/100, veredicto LISTO, sin observaciones.

```json
{
  "version": 1,
  "slug": "5-numeros-cada-lunes",
  "fecha": "2026-09-14",
  "marca": { "nombre": "Tu Marca", "handle": "@tumarca", "avatar": "assets/avatar.jpg", "sello": "Finanzas para dueños" },
  "look": "guia-rapida",
  "formato": "4:5",
  "serie": "Guía rápida",
  "tema": "Los 5 números que un dueño revisa cada lunes",
  "tipo": "guia",
  "objetivo": "saves",
  "palabra_clave": "LUNES",
  "entregable": "Plantilla de revisión semanal en Google Sheets",
  "slides": [
    { "rol": "portada", "layout": "portada-titulo",
      "titulo": "5 números que *salvan* tu negocio",
      "subtitulo": "Revísalos cada lunes en 10 minutos.",
      "chips": ["Flujo", "Margen", "Cobranza"] },
    { "rol": "rehook", "layout": "texto-pleno",
      "titulo": "La mayoría revisa *ventas*. Y nada más.",
      "cuerpo": "Por eso venden más y se quedan sin dinero. Los cinco de aquí abajo lo evitan.",
      "loop": "Empieza por el que más duele" },
    { "rol": "cuerpo", "layout": "punto-numero", "numero": "01", "numero_fantasma": "1",
      "titulo": "Flujo de caja a *30 días*",
      "cuerpo": "Cuánto entra y cuánto sale en el mes que viene. Si el saldo es negativo, todo lo demás espera.",
      "loop": "El segundo casi nadie lo mira" },
    { "rol": "cuerpo", "layout": "dato-hero", "kicker": "Dato",
      "dato": "10 min",
      "titulo": "cada lunes. *Eso es todo.*",
      "cuerpo": "Más tiempo no da mejores decisiones. Da más pretextos para no decidir.",
      "loop": "Aquí están los 5" },
    { "rol": "cheatsheet", "layout": "lista",
      "titulo": "Los *5* números",
      "items": [
        { "texto": "Flujo de caja a 30 días", "nota": "Entradas menos salidas del mes que viene" },
        { "texto": "Margen bruto por producto", "nota": "Qué vendes con ganancia y qué por costumbre" },
        { "texto": "Días de cobranza", "nota": "Cuánto tardas en ver el dinero" },
        { "texto": "Costo de adquisición", "nota": "Lo que te cuesta cada cliente nuevo" },
        { "texto": "Utilidad neta real", "nota": "Después de impuestos y de tu sueldo" }
      ],
      "loop": "Cómo revisarlos sin contador" },
    { "rol": "cuerpo", "layout": "pasos",
      "titulo": "Tu revisión de los *lunes*",
      "pasos": [
        { "titulo": "Descarga el estado de cuenta", "detalle": "Solo los últimos 30 días" },
        { "titulo": "Suma lo que entra en 30 días", "detalle": "Facturas por cobrar con fecha" },
        { "titulo": "Resta lo que tienes que pagar", "detalle": "Nómina, renta, proveedores" },
        { "titulo": "Anota el saldo y compáralo", "detalle": "Contra el lunes anterior" }
      ],
      "loop": "Hay un atajo con IA" },
    { "rol": "cuerpo", "layout": "prompt", "kicker": "Copia esto",
      "titulo": "Pégalo con tu *estado de cuenta*",
      "prompt": "Actúa como director financiero. Con este estado de cuenta calcula: flujo neto a 30 días, los 3 gastos que más pesan y un riesgo que no estoy viendo. Responde en 5 líneas, sin tecnicismos.",
      "loop": "¿Quieres la plantilla completa?" },
    { "rol": "cta", "layout": "cta-cara", "centrado": true,
      "titulo": "¿Quieres la *plantilla*?",
      "cuerpo": "Comenta LUNES y te la mando por DM. Sin registro.",
      "boton": "Comenta LUNES" }
  ],
  "caption": "5 números que revisas cada lunes en 10 minutos. Comenta LUNES y te mando la plantilla por DM.\n\nVender más no arregla la caja. Revisarla sí.\n\nGuárdalo para el próximo lunes.",
  "hashtags": ["#finanzasparadueños", "#flujodecaja", "#pymesmexico", "#negociosconia"],
  "notas": "Ejemplo de referencia de la skill. Marca y datos ficticios."
}
```

Por qué pasa QA: portada de 6 palabras con número y acento; lámina 2 con `rol: rehook`; las 4 láminas `cuerpo` cierran con `loop`; hay dos láminas guardables (`lista` y `prompt`); hay números en 6 láminas; una sola `cta` al final con `LUNES` en la lámina y en la primera línea del caption (94 caracteres); 4 hashtags; ninguna lámina normal pasa de 40 palabras ni ninguna guardable de 70.

## Qué mide QA y con qué umbral

| Regla | Aviso | Error |
|---|---|---|
| Láminas | >12 | <5 o >20 |
| Palabras en portada | 8 a 9 | >9 |
| Palabras por lámina normal | | >40 |
| Palabras por lámina guardable (`lista`, `pasos`, `prompt`, `comparativa`, `cheatsheet`) | >70 | |
| Reducción automática de letra | >8% | Desborda aun con 15% |
| Tamaño de texto | Título <84 px, cuerpo <38 px, micro <30 px | Cualquier texto <30 px |
| Contraste del texto principal | <4.5:1 (ideal ≥7:1) | <3:1 |
| Margen seguro (80 px) | | Texto que lo cruza |
| Franja inferior (140 px) | Texto crítico ahí | |
| CTA | Última lámina no es `cta` | 0 o más de 1 lámina `cta` |
| `palabra_clave` | | Falta en caption o en la lámina `cta` |
| Hashtags | 0 | >5 |
| Frases de IA en el copy | | Cualquiera de la lista negra de `qa.mjs` |

Corre `node scripts/qa.mjs <carpeta>` después de cada cambio al JSON. Sale con código 1 si hay errores.

## Errores frecuentes al escribir el JSON

1. **Comillas tipográficas.** `“titulo”` no es JSON. Usa comillas rectas `"` para claves y valores. Dentro del texto sí puedes usar las tipográficas.
2. **Coma final.** Una coma después del último elemento de un arreglo o de un objeto rompe el archivo. `render.mjs` avisa: "carrusel.json no es JSON válido".
3. **Look mal escrito.** `guia_rapida`, `Guia-rapida` u `oscuro tech` no fallan: el render cae a `guia-rapida` sin decirlo. Copia el nombre de la tabla de la raíz.
4. **Layout mal escrito.** `portada_titulo` o `cta` a secas renderizan una lámina genérica con título y cuerpo, sin lo que hace especial al layout. Los 11 nombres van con guion y en minúsculas.
5. **Campos inventados.** `subtitle`, `body`, `bullets`, `imagen_url`, `hook`, `texto` a nivel de slide: ninguno existe. El render los ignora y la lámina sale vacía. Los únicos campos son los de la tabla de slides.
6. **Campo fuera de su layout.** `cuerpo` en `lista`, `kicker` en `punto-numero` o `loop` en `cta-cara` no aparecen. Revisa la tabla "Qué renderiza cada layout".
7. **`items` como objetos sin `texto`.** Cada item objeto necesita `texto`. `{ "titulo": "..." }` sale en blanco.
8. **Pasos como strings.** `pasos` es un arreglo de objetos con `titulo`. `["Paso 1", "Paso 2"]` no renderiza.
9. **Comillas escritas en `cita`.** Salen dobles: las del texto y las del CSS.
10. **Acento sin cerrar.** `*palabra` sin el segundo asterisco sale con el asterisco visible. Lo mismo con `**`.
11. **`palabra_clave` en minúsculas en el CTA.** QA compara en mayúsculas, pero el lector no: escríbela igual en `palabra_clave`, en `cuerpo` del CTA, en `boton` y en el caption.
12. **Ruta de imagen absoluta de otra máquina.** Usa rutas relativas a la carpeta del carrusel (`assets/portada.jpg`) para que el mismo JSON renderice en cualquier equipo.
13. **`sin_bottom` en la portada.** Quita el `Desliza →`, que es lo único que le dice al lector que hay más láminas.
14. **`hashtags` como texto.** Es un arreglo: `["#uno", "#dos"]`, no `"#uno #dos"`.
15. **Dos ideas en una lámina.** Si escribes "además" o "también" dos veces, QA avisa. Parte la lámina en dos.

## Recursos de personalidad (añadidos el 2026-09-06)

| Recurso | Cómo se pide en el JSON | Para qué |
|---|---|---|
| Recorte de persona sobre panel | `"imagen": {"src": "assets/img/01-manuel.png", "pos": "recorte", "panel": true}` (PNG con alfa; el sujeto sale por el borde derecho; `recorte-izquierda` para el otro lado) | Portada y CTA con presencia; el texto ocupa la mitad izquierda Con `recorte` la columna de texto mide ~440 px: título de 6 palabras como máximo y ninguna de más de 11 letras (o el ajuste la encoge bajo los 84 px y QA avisa). |
| Foto arriba, texto abajo | `"layout": "foto-texto"` + `"imagen": {"src": "…", "pos": "arriba"}` | Rehook con la persona en situación, tutoriales con captura |
| Marcador de plumón | `==palabras==` en título o cuerpo | Subrayar el dato o la frase que se lleva el lector (una por lámina) |
| Sticker | `"sticker": "gratis"`, `"sticker_lado": "izquierda"` (≤22 caracteres) | Portada y una lámina de cuerpo, máximo dos por carrusel |
| Duotono | `"imagen": {…, "duotono": true}` | Foto de fondo o derecha teñida con el acento del look (noticia, oscuro-tech, editorial-mono) |
| Grano | `"grano": true` | Textura fina en láminas tipográficas de looks claros |

Regla de dosis: dos o tres recursos por carrusel, no todos en todas las láminas. El esqueleto (barras, pager, tipografía) es lo que da consistencia; los recursos dan ritmo.
