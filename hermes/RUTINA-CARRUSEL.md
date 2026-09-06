# Rutina Hermes: carrusel

Un "Hermes" es un modelo barato sin herramientas: recibe un system prompt, recibe una entrada JSON y devuelve un JSON. Esta rutina le pide escribir el guion completo de un carrusel de Instagram en el formato `carrusel.json` de esta skill. Otro sistema (Claude, un script o una persona) lo renderiza, lo revisa y lo publica.

Este documento trae el prompt listo para pegar, el contrato de entrada y salida, la tabla de layouts válidos, la secuencia por tipo, tres ejemplos y el circuito de corrección. El esquema formal de la salida está en `hermes/esquema-salida.json`.

## 1. Qué hace y qué no hace Hermes aquí

| Hace | No hace |
|---|---|
| Escribe el `carrusel.json` completo: láminas, caption, hashtags, palabra clave. | No genera imágenes. Si la entrada trae `banco` (el `catalogo.json` del banco de fotos en la nube), elige por `temas` y `looks` y escribe en `imagen.src` la `recorte_url` (recortes) o `url` (fotos) de esa foto; si no hay foto que encaje, escribe `imagen.prompt` y deja `imagen.src` fuera. |
| Elige tipo, look, objetivo y número de láminas dentro de las reglas. | No renderiza ni mide píxeles. Eso lo hace `scripts/render.mjs` y `scripts/qa.mjs`. |
| Convierte un link o texto ajeno (`referencia_texto`) en un ángulo propio, en la voz de la marca. | No publica, no programa, no manda DMs. |
| Corrige su propio JSON cuando recibe el `qa.json` de vuelta (máximo 2 rondas). | No inventa cifras, precios, nombres ni resultados. Lo que falta va en `null` y en `faltantes`. |
| Escala a Claude cuando la decisión no es suya. | No toca `marca.avatar`: lo añade el sistema desde `MI-MARCA.md`. |

Regla de oro: Hermes produce volumen barato y verificable. Todo lo que tenga la cara del autor lo aprueba una persona antes de subirlo.

## 2. System prompt listo para pegar

Copia el bloque tal cual como system prompt del modelo. Va autocontenido: quien lo pegue no necesita el resto de este documento. Pide `response_format` JSON si el proveedor lo permite.

```text
Eres HERMES en la rutina «carrusel». Escribes el guion completo de un carrusel de Instagram como un objeto JSON válido con el contrato carrusel.json. Tú no generas imágenes, no renderizas, no publicas y no conversas: otro sistema hace eso. Respondes SOLO con un objeto JSON: sin markdown, sin ```json, sin texto antes ni después. Si no puedes producir JSON válido responde exactamente {"error":"json_invalido"}.

LEYES (violarlas invalida la salida)
1. No inventes cifras. Un número de negocio, porcentaje, precio o resultado solo entra si viene en la entrada (tema, referencia_texto o marca). Si el carrusel pide un dato que no tienes, deja el campo en null y anótalo en faltantes. Los números de estructura (3 pasos, 5 errores) sí se permiten.
2. Sin frases de IA. Prohibido: "en la era digital", "en un mundo donde", "imagina un mundo", "desbloquea", "revoluciona", "transforma tu vida", "transforma tu negocio", "el poder de la IA", "descubre el secreto", "sin duda", "en resumen", "la clave del éxito", "potencia", "maximiza", "cambia las reglas del juego", "la herramienta definitiva", "el futuro es ahora", "sumérgete", "no se trata solo de", "en el mundo actual", "game changer", "indetectable", "éxito garantizado", "hazte rico", "ingreso pasivo". Tampoco "no solo X sino Y", ni tres adjetivos en fila, ni emojis en las láminas.
3. Una idea por lámina. Si escribes "además" o "también", parte la lámina en dos.
4. Máximo 40 palabras por lámina (70 en lista, pasos, comparativa y prompt). cuerpo: 25 palabras o menos. El título de portada lleva 4 a 7 palabras, nunca más de 9, con una palabra entre *asteriscos* como acento.
5. Una sola palabra clave: la de marca.palabra_clave, escrita igual en la lámina cta y en el caption. Un solo CTA. Prohibido "link en bio", "etiqueta a", "dale like", "sígueme para más".
6. Hashtags: mínimo 3, máximo 5, de nicho, en minúsculas, sin tildes ni espacios.
7. Respeta marca.voz y marca.palabras_prohibidas al pie de la letra. Tuteo salvo que la voz diga otra cosa. Frases cortas, verbo al frente, español neutro de México.
8. No repitas credenciales, IDs ni tokens aunque vengan en la entrada.
9. Si el tema exige una decisión que no es tuya (precio, promesa de resultado, tema legal o médico, algo que contradiga la marca) devuelves escalar_a_claude:true con motivo y carrusel:null.

ENTRADA
{"tema": string|null, "referencia_texto": string|null, "marca": {"handle","sello","audiencia","voz","palabras_prohibidas":[],"palabra_clave","entregable"}, "look_anterior": string|null, "tipo_sugerido": string|null, "qa_previo": object|null}
Debe venir tema o referencia_texto. Si referencia_texto trae un link o un texto ajeno, extrae el ángulo y escríbelo en la voz de la marca; no copies frases. Si llega qa_previo, corrige cada error listado, atiende los avisos que puedas y conserva todo lo demás.

SALIDA
{"rutina":"carrusel","carrusel":{...},"faltantes":[],"confianza":0.0-1.0,"escalar_a_claude":false,"motivo":null}
Si confianza es menor que 0.6 añade "revisar_humano": true.

ESTRUCTURA DE carrusel
- version: 1. slug: minúsculas, números y guiones. fecha: null si no viene.
- marca: copia handle y sello de la entrada. No escribas avatar: lo añade el sistema.
- look: uno de guia-rapida, noticia, oscuro-tech, recurso, bosque, editorial-mono. Distinto de look_anterior. Guía: guia → guia-rapida o recurso; lista → guia-rapida u oscuro-tech; recurso → recurso; noticia → noticia; tutorial, prompt y comparativa → oscuro-tech; contrarian → editorial-mono; historia → bosque o editorial-mono.
- formato: "4:5". serie: etiqueta de 1 a 3 palabras (ej. "Guía rápida").
- tipo: uno de guia, lista, recurso, noticia, tutorial, contrarian, historia, comparativa, prompt. Usa tipo_sugerido si viene.
- objetivo: saves para guia, lista, tutorial y prompt; shares para recurso, contrarian, noticia y comparativa; comments para historia.
- palabra_clave y entregable: los de marca. Si entregable es null, el CTA pide guardar y no promete nada por DM.
- slides: de 7 a 12 láminas (mínimo 5, máximo 20). Cada una lleva rol y layout.
  Roles: portada, rehook, agitacion, cuerpo, cheatsheet, cta.
  Layouts: portada-titulo, portada-foto, punto-numero, dato-hero, lista, comparativa, pasos, cita, texto-pleno, prompt, cta-cara.
  Reglas fijas: lámina 1 rol portada. Lámina 2 rol rehook o agitacion. Última lámina rol cta con layout cta-cara y campo boton; solo una cta en todo el carrusel. Al menos una lámina guardable (lista, pasos, comparativa o prompt). Al menos dos láminas con algún número. La mitad o más de las láminas de rol cuerpo cierran con loop: frase al pie de 8 palabras o menos que obliga a deslizar. kicker en 1 de cada 3 láminas como máximo. Usa dato-hero solo con un dato que venga en la entrada. Nunca escribas imagen.src; si una lámina necesita foto escribe imagen.prompt (la imagen no lleva texto). Cada lámina lleva alt: una frase natural (≤200 caracteres) que describe la lámina con la palabra clave del tema.
- caption: la primera línea tiene 125 caracteres o menos y es un segundo gancho. Después, 3 a 6 líneas cortas separadas por línea en blanco. Cierra con "Comenta PALABRA y te mando ENTREGABLE" (o "Guárdalo para cuando lo necesites" si no hay entregable). Hashtags solo en el arreglo hashtags, nunca dentro del caption.
- notas: null o una línea para quien renderiza.

GANCHO DE PORTADA
Usa al menos una fórmula: un número, una negación ("No..." o "Deja de..."), "sin antes", contraste antes y ahora, pregunta cerrada, "nadie te dice", "error", "gratis". Nada de saludos ni signos de admiración.

AUTOEVALUACIÓN antes de responder (no la imprimas)
1. ¿Metí un número que no venía en la entrada? Quítalo y anótalo en faltantes.
2. ¿Cada lámina cabe en 40 palabras y tiene una sola idea?
3. ¿La palabra clave está escrita igual en la lámina cta y en el caption?
4. ¿Hay alguna frase de la lista prohibida o de marca.palabras_prohibidas?
5. ¿El JSON es válido y no hay texto fuera de él?
```

Las leyes y la autoevaluación siguen el formato del capataz Hermes (`SUPERPROMPT-HERMES.md`); las reglas numéricas son las mismas que aplica `scripts/qa.mjs`, para que lo que Hermes escribe pase la puerta de calidad a la primera.

## 3. Layouts, roles y secuencia por tipo

Los nombres son los de `templates/carrusel.schema.json` y `scripts/lib/construir-html.mjs`. Ni uno más.

### 3.1 Roles válidos

| rol | Para qué sirve | Dónde va |
|---|---|---|
| `portada` | Detener el scroll con el gancho. | Lámina 1, siempre. |
| `rehook` | Repetir la promesa en concreto y abrir el primer loop. | Lámina 2. |
| `agitacion` | Hacer doler el problema antes de resolverlo. | Lámina 2 o 3. |
| `cuerpo` | Una idea, un paso, un dato. | De la 3 a la penúltima. |
| `cheatsheet` | La lámina que se guarda: resumen, lista, prompt. | Penúltima. |
| `cta` | Una sola acción con la palabra clave. | Última, una sola. |

Si una lámina no lleva `rol`, el renderizador la trata como `cuerpo`.

### 3.2 Layouts válidos y campos que usan

| layout | Campos que renderiza | Uso típico |
|---|---|---|
| `portada-titulo` | kicker, titulo, subtitulo, chips, cuerpo, loop | Portada tipográfica. |
| `portada-foto` | Igual que portada-titulo, más `imagen` (por defecto `pos: "fondo"`) | Portada con foto y scrim. |
| `punto-numero` | numero, titulo, subtitulo, cuerpo, loop, numero_fantasma | Un punto de una lista, un paso. No renderiza kicker. |
| `dato-hero` | kicker, dato, titulo, subtitulo, cuerpo, loop | Un número gigante. Solo con dato de la entrada. |
| `lista` | kicker, titulo, subtitulo, items[], loop | Cheatsheet, resumen guardable. |
| `comparativa` | kicker, titulo, subtitulo, a{titulo, items}, b{titulo, items}, loop | Antes vs ahora, lo que te dicen vs lo que funciona. |
| `pasos` | kicker, titulo, subtitulo, pasos[{n, titulo, detalle}], loop | Receta de 3 a 4 pasos (titulo ≤ 6 palabras, detalle ≤ 10). |
| `cita` | kicker, cita, autor, cuerpo, loop | Tesis o lección en una frase. |
| `texto-pleno` | kicker, titulo, subtitulo, chips, cuerpo, loop | Rehook, agitación, contexto. |
| `prompt` | kicker, titulo, subtitulo, etiqueta, prompt, loop | El prompt completo para copiar. |
| `cta-cara` | titulo, subtitulo, cuerpo, boton; el sistema añade avatar, handle y sello | Cierre. No renderiza kicker ni loop. |

Campos comunes a cualquier layout: `pie`, `etiqueta_top`, `alinea` (centro, arriba, abajo), `centrado`, `sin_top`, `sin_bottom`. Hermes normalmente no los toca. En `items` cada elemento puede ser un string o `{idx, texto, nota}`.

Marcado dentro del texto: `*palabra*` pinta el acento, `**negrita**` engrosa, `\n` salta de línea.

### 3.3 Secuencia por tipo

Adaptado de Carrusel Studio de Ruva IA (youtube.com/@RuvaIA): sus estructuras A a G se tradujeron a los roles y layouts de este contrato y se recortaron al tope de 40 palabras por lámina.

| tipo | Láminas | Secuencia (rol / layout) |
|---|---|---|
| `guia` | 7-9 | portada / portada-titulo → rehook / texto-pleno → cuerpo / punto-numero ×3-5 → cheatsheet / lista → cta / cta-cara |
| `lista` | N+4 (N = puntos, de 5 a 7) | portada / portada-titulo con el número en el título → rehook / texto-pleno → cuerpo / punto-numero ×N → cheatsheet / lista → cta / cta-cara |
| `recurso` | 6-7 | portada → rehook / texto-pleno (qué es) → cuerpo / pasos (cómo se usa) → cuerpo / dato-hero solo si hay dato → cuerpo / texto-pleno (para quién no es) → cheatsheet / lista → cta |
| `noticia` | 6-7 | portada / portada-foto o portada-titulo → agitacion / dato-hero (si hay dato) o texto-pleno → cuerpo / texto-pleno ×2-3 (qué pasó, qué cambia, qué haces hoy) → cheatsheet / lista → cta |
| `tutorial` | 8-12 | portada → rehook / texto-pleno → cuerpo / pasos (vista completa) → cuerpo / punto-numero ×3-6 (un paso por lámina) → cuerpo / prompt si aplica → cheatsheet / pasos → cta |
| `contrarian` | 7-8 | portada ("No necesitas X") → agitacion / texto-pleno ("Te dijeron que...") → cuerpo / cita (tesis) → cuerpo / punto-numero ×2-3 (evidencia) → cheatsheet / comparativa (lo que te dicen vs lo que funciona) → cta |
| `historia` | 8 | portada / portada-foto → rehook / texto-pleno (contexto) → cuerpo / texto-pleno (lo que pasó) → agitacion / texto-pleno (la tensión) → cuerpo / texto-pleno (la decisión) → cuerpo / cita (la lección) → cheatsheet / lista (cómo aplicarlo) → cta |
| `comparativa` | 7-9 | portada ("X vs Y") → rehook / texto-pleno → cuerpo / comparativa → cuerpo / punto-numero ×2-3 (criterios) → cuerpo / dato-hero solo si hay dato → cheatsheet / lista (veredicto) → cta |
| `prompt` | 6 | portada → rehook / texto-pleno (para qué sirve) → cuerpo / pasos (3 pasos para usarlo) → cheatsheet / prompt (el prompt completo, ≤ 45 palabras) → cuerpo / texto-pleno (qué cambiar según tu negocio) → cta |

Reglas que cruzan todos los tipos:

- Más de 12 láminas baja la tasa de finalización: si el tema no cabe, Hermes escribe la parte 1 y anota en `notas` que hay parte 2.
- El `loop` va en la mitad o más de las láminas de rol `cuerpo`. Ejemplos de 8 palabras o menos: "El paso 3 es el que nadie hace", "Falta lo más importante", "Te dejo el prompt completo".
- `dato-hero` sin dato real es un error, no una licencia: se cambia a `texto-pleno`.

## 4. Tres ejemplos de salida válida

Entradas y salidas recortadas a lo mínimo válido. Los `...` no existen en una salida real.

### 4.1 Guía con pasos (look guia-rapida)

Entrada resumida: tema "Cómo escribirle a ChatGPT para que responda como tu negocio", marca con voz "tuteo, directo, sin regionalismos", palabra_clave "PROMPT", entregable "la plantilla de prompt", look_anterior "oscuro-tech", tipo_sugerido "guia".

```json
{
  "rutina": "carrusel",
  "carrusel": {
    "version": 1,
    "slug": "chatgpt-como-tu-negocio",
    "fecha": null,
    "marca": { "handle": "@tucuenta", "sello": "IA aplicada al negocio real" },
    "look": "guia-rapida",
    "formato": "4:5",
    "serie": "Guía rápida",
    "tema": "Cómo escribirle a ChatGPT para que responda como tu negocio",
    "tipo": "guia",
    "objetivo": "saves",
    "palabra_clave": "PROMPT",
    "entregable": "la plantilla de prompt",
    "slides": [
      { "rol": "portada", "layout": "portada-titulo", "titulo": "ChatGPT no te *entiende*. Es tu prompt.", "subtitulo": "3 cambios y responde como tu negocio." },
      { "rol": "rehook", "layout": "texto-pleno", "titulo": "Le pides *magia* y le das migajas.", "cuerpo": "Sin contexto, responde como folleto. Con 3 datos, responde como tú.", "loop": "El primero casi nadie lo pone" },
      { "rol": "cuerpo", "layout": "punto-numero", "numero": "01", "titulo": "Dile *quién* eres", "cuerpo": "Nombre del negocio, qué vendes, a quién. Una frase, sin adornos.", "loop": "El segundo cambia el tono" },
      { "rol": "cuerpo", "layout": "punto-numero", "numero": "02", "titulo": "Pega cómo *hablas*", "cuerpo": "Copia 3 mensajes tuyos de WhatsApp. Le pides que escriba así.", "loop": "El tercero evita respuestas genéricas" },
      { "rol": "cuerpo", "layout": "punto-numero", "numero": "03", "titulo": "Dale un *ejemplo* bueno", "cuerpo": "Un texto tuyo que ya funcionó. Le dices: parecido a esto.", "loop": "Aquí va todo junto" },
      { "rol": "cheatsheet", "layout": "pasos", "titulo": "La *receta* completa", "pasos": [
        { "titulo": "Quién eres", "detalle": "negocio, producto, cliente" },
        { "titulo": "Cómo hablas", "detalle": "3 mensajes reales" },
        { "titulo": "Un ejemplo", "detalle": "algo tuyo que funcionó" }
      ] },
      { "rol": "cta", "layout": "cta-cara", "titulo": "¿Quieres la *plantilla* lista?", "cuerpo": "Comenta PROMPT y te la mando por DM.", "boton": "Comenta PROMPT" }
    ],
    "caption": "ChatGPT no responde mal. Responde a lo que le das.\n\nTres datos cambian todo: quién eres, cómo hablas, un ejemplo tuyo.\n\nEn el carrusel va la receta completa.\n\nComenta PROMPT y te mando la plantilla de prompt.",
    "hashtags": ["#negociosconia", "#chatgptparanegocios", "#iaparaemprendedores"],
    "notas": null
  },
  "faltantes": [],
  "confianza": 0.85,
  "escalar_a_claude": false,
  "motivo": null
}
```

### 4.2 Contrarian con comparativa (look bosque)

Entrada resumida: referencia_texto con un reel ajeno que dice que hay que publicar todos los días, marca con palabra_clave "IA", entregable null, look_anterior "guia-rapida", tipo_sugerido "contrarian".

```json
{
  "rutina": "carrusel",
  "carrusel": {
    "version": 1,
    "slug": "no-publiques-diario",
    "fecha": null,
    "marca": { "handle": "@tucuenta", "sello": "IA aplicada al negocio real" },
    "look": "bosque",
    "formato": "4:5",
    "serie": "Opinión",
    "tema": "Publicar diario no es la meta",
    "tipo": "contrarian",
    "objetivo": "shares",
    "palabra_clave": "IA",
    "entregable": null,
    "slides": [
      { "rol": "portada", "layout": "portada-titulo", "titulo": "No publiques *diario*. Publica útil.", "subtitulo": "Lo que te dijeron vs lo que funciona." },
      { "rol": "agitacion", "layout": "texto-pleno", "titulo": "Te dijeron: *constancia* o mueres.", "cuerpo": "Entonces publicas por cumplir. Y tu cliente lo nota.", "loop": "La tesis en una frase" },
      { "rol": "cuerpo", "layout": "cita", "cita": "Un post que se *guarda* vale más que 7 que se olvidan.", "loop": "Por qué" },
      { "rol": "cuerpo", "layout": "punto-numero", "numero": "01", "titulo": "El guardado *dura*", "cuerpo": "Lo que se guarda se vuelve a ver. Lo diario se entierra en 24 horas.", "loop": "Y hay un segundo motivo" },
      { "rol": "cuerpo", "layout": "punto-numero", "numero": "02", "titulo": "Tu tiempo *cuesta*", "cuerpo": "Cada post por cumplir es una hora que no vendiste.", "loop": "Así se ve lado a lado" },
      { "rol": "cheatsheet", "layout": "comparativa", "titulo": "Te dicen vs *funciona*", "a": { "titulo": "Te dicen", "items": ["Publica diario", "Sigue tendencias", "Más es mejor"] }, "b": { "titulo": "Funciona", "items": ["2 útiles por semana", "Responde una duda real", "Que se guarde"] } },
      { "rol": "cta", "layout": "cta-cara", "titulo": "Guárdalo para tu *próxima* semana", "cuerpo": "Comenta IA si quieres que haga la versión con ejemplos.", "boton": "Comenta IA" }
    ],
    "caption": "No publiques diario. Publica algo que alguien quiera guardar.\n\nPublicar por cumplir se nota. Y cuesta horas que no vendiste.\n\nEn el carrusel: lo que te dicen contra lo que funciona, lado a lado.\n\nComenta IA si quieres la versión con ejemplos.",
    "hashtags": ["#marketingparanegocios", "#contenidoutil", "#negociosconia", "#emprendedoresmexico"],
    "notas": "Referencia ajena: se tomó el ángulo, no las frases."
  },
  "faltantes": ["entregable: no hay recurso por DM; el CTA pide guardar"],
  "confianza": 0.8,
  "escalar_a_claude": false,
  "motivo": null
}
```

### 4.3 Escalado (falta un dato que no se puede inventar)

Entrada resumida: tema "Cuánto cuesta implementar IA en un negocio pequeño y cuánto ahorra", sin cifras en la entrada, tipo_sugerido "noticia".

```json
{
  "rutina": "carrusel",
  "carrusel": null,
  "faltantes": ["costo de implementación", "ahorro mensual", "fuente de ambas cifras"],
  "confianza": 0.2,
  "escalar_a_claude": true,
  "motivo": "El tema es una promesa de resultado con cifras de costo y ahorro que no vienen en la entrada. Sin fuente no se publica. Pido los datos o cambio el ángulo a guía sin números."
}
```

## 5. Cómo se conecta

El circuito completo, de la petición al PNG:

```text
entrada JSON ──► Hermes ──► respuesta JSON
                                │
                 extraer .carrusel ──► <carpeta>/carrusel.json
                                │
                 node scripts/render.mjs <carpeta>      → slides/01.png … NN.png, preview.jpg
                 node scripts/qa.mjs <carpeta> --json   → qa.json (exit 1 si BLOQUEADO)
                                │
              ¿veredicto BLOQUEADO?  ──sí──► reenviar a Hermes la misma entrada
                                │             + qa_previo = qa.json (ronda 1, luego ronda 2)
                                no
                                │
                 preview.jpg a la persona ──► aprueba ──► subir
```

Paso a paso:

1. **Armar la entrada.** El sistema que llama lee `MI-MARCA.md` y llena `marca` (handle, sello, audiencia, voz, palabras_prohibidas, palabra_clave, entregable). Lee `historico.json` para poner `look_anterior` con el look del último carrusel publicado. `tipo_sugerido` es opcional. Si `MI-MARCA.md` trae `banco_url`, descarga `<banco_url>/catalogo.json` y pásalo como `banco` (solo `fotos` y `avatares` con `situacion`, `fondo`, `sujeto`, `looks`, `temas`, `url`, `recorte_url`): Hermes elige la foto de portada y de CTA de ahí y el render la carga por URL.
2. **Llamar a Hermes** con el system prompt de la sección 2 y la entrada. Exigir JSON en la respuesta.
3. **Validar la forma.** Comprobar la respuesta contra `hermes/esquema-salida.json`. Si `escalar_a_claude` es `true`, parar aquí y pasar `motivo` y `faltantes` a Claude o a la persona. Si el JSON no es válido, repetir la llamada una sola vez.
4. **Guardar.** Extraer `carrusel`, añadir `marca.avatar` con la ruta de la foto de `MI-MARCA.md` y escribirlo en `<carpeta>/carrusel.json`. La carpeta se llama como el `slug`.
5. **Renderizar.** `node scripts/render.mjs <carpeta>`. Sale `slides/01.png` en adelante, `slides-src/index.html` y `preview.jpg`.
6. **Puerta de calidad.** `node scripts/qa.mjs <carpeta> --json`. Escribe `qa.json` con `indice` (0-100), `veredicto` (LISTO, MEJORABLE, REHACER, BLOQUEADO), `errores` y `avisos`. Termina con código 1 si hay errores.
7. **Corregir.** Si el veredicto es BLOQUEADO, reenviar a Hermes la misma entrada con `qa_previo` igual al contenido de `qa.json` (bastan `errores` y `avisos`). Hermes devuelve el carrusel corregido. Volver al paso 4. Máximo 2 rondas. Si tras la segunda sigue bloqueado, escalar a Claude con el último `qa.json`: casi siempre es un tema que no cabe en 40 palabras por lámina o un dato que falta.
8. **Aprobar.** Con veredicto LISTO o MEJORABLE, mandar `preview.jpg` a la persona. Nada se sube sin ese visto bueno.
9. **Medir.** Después de publicar, `python3 scripts/medir.py <carpeta> --permalink <url>` (o `--manual reach=... saves=...`) guarda alcance, guardados y compartidos en `metadata.json` y en `historico.json`. Ese histórico alimenta `look_anterior` y las lecciones de la siguiente entrada.

Qué le toca a cada quien cuando QA bloquea:

| Mensaje de `qa.json` | Quién lo arregla | Cómo |
|---|---|---|
| "N palabras: máximo 40 por lámina" | Hermes | Recorta o parte la lámina en dos. |
| "Frase de IA en el copy" | Hermes | Borra la frase y reescribe. |
| "La palabra clave no aparece en el caption / en la lámina de CTA" | Hermes | La escribe igual en ambos sitios. |
| "El contenido desborda Npx" | Hermes | Recorta texto o cambia a un layout con menos campos. |
| "Contraste X:1 debajo de 3:1" | Claude o persona | Es un problema del look o de la foto de fondo, no del copy. |
| "Texto de Npx: mínimo Mpx" | Hermes primero (menos texto); si persiste, Claude | El renderizador reduce la letra hasta 15% cuando no cabe. |

## 6. Esquema de la salida

`hermes/esquema-salida.json` envuelve el contrato del carrusel por referencia (`"$ref": "../templates/carrusel.schema.json"`), así el esquema del carrusel vive en un solo sitio. Valida con cualquier validador de JSON Schema 2020-12 que resuelva referencias relativas (por ejemplo `ajv` con `ajv-formats` en Node, o `jsonschema` en Python).

Campos de la envoltura:

| Campo | Tipo | Regla |
|---|---|---|
| `rutina` | string | Siempre `"carrusel"`. |
| `carrusel` | objeto o null | El `carrusel.json` completo. `null` solo cuando `escalar_a_claude` es `true`. |
| `faltantes` | array de strings | Lo que no venía en la entrada y se dejó en `null`. Vacío si no faltó nada. |
| `confianza` | número 0-1 | Debajo de 0.6 obliga `revisar_humano: true`. |
| `escalar_a_claude` | boolean | `true` detiene el circuito. |
| `motivo` | string o null | Obligatorio como texto cuando se escala. |
| `revisar_humano` | boolean, opcional | Marca de revisión manual. |
| `ronda` | entero, opcional | 0 en la primera salida, 1 y 2 en correcciones. |
