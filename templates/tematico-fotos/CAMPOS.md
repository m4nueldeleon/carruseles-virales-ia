# Plantilla temática v2 · campos de `fotos.json`

Lienzo **1080x1350 (4:5)** por omisión (el estándar: 8 de cada 10 carruseles); `"formato": "3:4"` da 1080x1440 y rinde
igual o mejor en cuentas grandes (datos en `carruseles-virales-ia/references/DIRECCION-DE-ARTE.md` §7). Titular en Anton
mayúsculas; `*palabra*` = color de acento; `\n` = salto forzado. Cuerpo en Archivo; `**palabra**` = negrita de acento.
Todas las rutas, relativas a la carpeta del carrusel.

```json
{ "formato": "4:5", "acento": "#FF3B30", "sello": "#FFC93C", "firma": "@manueldeleonmjr", "laminas": [ { "layout": "…", … } ] }
```

## Reglas de Manuel (3-nov-2026) que la plantilla da por hechas

1. **Todo el texto a la izquierda, en el mismo margen (72 px) y anclado arriba** (abajo solo en `sangre` y
   `antes-despues`). Nada centrado a media lámina.
2. **Ninguna lámina de puro texto.** Cada una lleva un recurso que da contexto: escena ilustrada, captura real de
   internet, comparativa, chat de ejemplo, personaje 3D/Pixar, avatar, foto nueva de Manuel o foto real del momento.
3. **Capturas reales de internet** cuando el tema es una noticia, un rumor o una herramienta: el post o el tuit que
   circula, la nota del medio, el verificador, la página oficial. Con fuente y fecha en la tarjeta; si no está
   comprobado, con la estampa «Sin comprobar»; si un verificador lo desmintió, «Falso».
4. **Un solo estilo de Manuel de la portada al cierre**: todo avatar (Pixar/3D/dibujo) o todo fotos reales. Si el
   carrusel va en mundo Pixar, el cierre lleva el avatar, no la foto («al final pusiste mi foto… consistencia»).
5. El `sello` va recto y en el margen del titular; las estampas giradas solo sobre capturas.
6. Sin serie, sin número de lámina, sin paginador, sin frases de transición.

## Lo que dice el estudio de 50 carruseles de más de 10k likes (`carruseles-virales-ia/references/ESTUDIO-50-VIRALES.md`)

- **Plantilla fija, cambia una sola cosa**: el mismo molde en las láminas intermedias (misma escena, mismo personaje,
  misma tarjeta en el mismo lugar); es el patrón más fuerte del estudio.
- **Portada**: una imagen que ocupe ≥ 70 %, ≤ 15 palabras, una sola idea que se entienda sin leer.
- **La prueba es real**: capturas de apps y tuits reales, fotos del hecho, documentos; señala el detalle con `circulos`.
- **Comparar** (✕/✓, sin IA/con IA) dispara comentarios.
- **La última lámina entrega algo** (el n.º 1, el desenlace, la tabla); la acción va en un botón corto o en el caption.

## Layouts

| layout | Para qué | Campos (* = obligatorio) |
|---|---|---|
| `escena` | Ilustración (Pixar/3D) o foto a sangre con el titular arriba sobre un velo. Portadas y láminas de «esto te pasa a ti» | `fondo`*, `titulo`*, `cuerpo`, `sello`, `pos` («50% 100%»), `bajar` (px que baja la escena para que el titular no tape una cara), `velo` (52 = % de alto), `tam` (100), `top` (78) |
| `capturas` | 1–2 capturas reales con contexto: titular y cuerpo arriba, tarjetas abajo | `titulo`*, `capturas`* [{src*, x*, y*, w*, giro, fuente («Fuente · fecha»), estampa («Sin comprobar» / «Falso»), alto (recorta la tarjeta), pos}], `cuerpo`, `fondo` (desenfocado), `elementos`, `tam` (92) |
| `comparativa` | ✕ contra ✓: antes/después, mal/bien, captura contra banco. Cada columna con imagen **o** chat de ejemplo | `titulo`*, `mal`* y `bien`* {etiqueta*, src **o** chat {mensajes [{de: cliente/tu/nota, t, hora}]}, pos, ajuste («contain»), claro (fondo blanco), pie}, `cuerpo`, `fondo`, `topComp` (430), `altoComp`, `tam` (92) |
| `lista` | 3–5 puntos numerados: la que se guarda. Deja la derecha a un personaje | `titulo`*, `items`* [{t*, d}] (t ≤ 6 palabras, d ≤ 12), `anchoTexto` (690 con personaje), `elementos`, `fondo`, `separacion` (48), `hueco` (36), `tam` (92) |
| `cierre` | Pregunta → explicación → botón → firma, a la izquierda; retrato recortado (PNG con alfa) abajo a la derecha. Sirve también de portada con retrato (con `sello`) | `titulo`*, `sello`, `cuerpo`, `accion` (texto del botón), `palabra` (palabra clave de ManyChat si existe), `retrato` {src*, w (640), x}, `anchoTexto` (620), `fondo`, `tam` (96) |
| `tuit` | Sus frases como tuits (patrón Hormozi del estudio de 50 virales): foto suya (o avatar) a sangre que se funde a negro y tarjeta de tuit propia, siempre en el mismo lugar. Solo frases de Manuel, nunca un tuit ajeno recreado | `fondo`*, `tuit`* {nombre*, usuario*, avatar (PNG), texto* (`**…**` = resaltado), verificado}, `pos`, `velo` (62), `topTuit` (alto−560) |
| `sangre` | El momento a toda la pantalla; sello y titular abajo (caras libres arriba) | `foto`*, `titulo`*, `pos` («50% 0%»), `sello`, `cuerpo`, `credito`, `tam` (100), `abajo` (96) |
| `impresa` | Un recuerdo: foto impresa sobre la misma foto desenfocada | `titulo`*, `foto`*, `pos`, `credito`, `marco` {x,y,w,h,giro}, `tam` (110) |
| `antes-despues` | El presente a sangre y el pasado impreso con su año | `foto`*, `antes`* {src*, etiqueta, pos, zoom, origen}, `titulo`*, `credito`, `tam` (92) |
| `idea` | La lección con 1–2 fotos chicas abajo | `titulo`*, `fondo`, `cuerpo`, `recuerdos` [{src, pos}], `tam` (108) |
| `texto` | Una idea con su explicación **y** un recurso (`foto` impresa, `capturas` o `elementos`); nunca sola | `titulo`*, `cuerpo`, `fondo`, `foto`, `fotoPos`, `marco`, `capturas`, `elementos`, `tam` (100) |

Cualquier layout acepta `capturas`, `marcas` [{t*, x*, y*, giro, color, tam}] (estampa de texto: «Confidencial»), `circulos` [{x*, y*, w*, h, giro, color}] (óvalo rojo que señala el detalle en una captura o foto) y `elementos` [{src*, x*, y*, w*, giro, voltear, z}] (PNG con transparencia:
personaje 3D, avatar de Manuel, recorte de foto, ícono, logo real). `fondo` acepta `efecto`: «borroso» (por omisión),
«tenue» o «» (nítido).

- Coordenadas en px del lienzo 1080x1350. Margen 72; deja 90 px libres abajo (la app tapa el pie).
- La plantilla achica el titular si no cabe a lo ancho, pero no a lo alto: con 4 renglones o más, baja `tam`.
- Nada de texto dentro de las imágenes generadas: todo el texto lo pone la plantilla. Las capturas reales sí traen su
  texto (es la prueba).
- Un chat de comparativa es un **ejemplo** (la plantilla le pone la marca «Ejemplo»): nunca lo presentes como captura
  real de un cliente.
