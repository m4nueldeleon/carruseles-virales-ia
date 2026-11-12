# Estudio de 50 carruseles con más de 10,000 likes (3-nov-2026)

Pedido de Manuel: «haz una investigación de cuáles son los elementos gráficos, estéticos y audiovisuales de unos 50
carruseles que tengan arriba de 10 mil likes para que entiendas cómo lo que te estoy pidiendo hace sentido».

- **Corpus:** 50 carruseles de 24 cuentas (de 105 revisadas; 120 días: 6-jul → 3-nov-2026). 36 en inglés, 9 en
  portugués, 5 en español (en español casi nadie pasa de 10k: ingenia.ai y xataka). Entre ellos: garyvee,
  projetomilhao, ingenia.ai, claudeai, codiesanchez, nathaliaarcuri, chatgpt, hormozi, wired, simonsinek, openai,
  forbes, nytimes, xataka.
- **Datos:** `Carruseles/_entrenamiento/estudio-2026-11-03/` (privado; láminas ajenas, no van al repo): `indice.json`,
  `refs/NN-<shortCode>/` con `hoja.jpg` y `analisis.json`, resúmenes `lote-*.md`, `proporciones.md`.
- Conteos hechos con código sobre los 50 `analisis.json`; las lecturas visuales son de agentes con visión. Son
  correlaciones de cuentas grandes, no causas.

## 1. Lo que dicen los números

| Medida | Resultado |
|---|---|
| Recursos más usados (posts que lo traen) | foto real de terceros 26 · tipografía pura 22 · logo de marca 18 · captura de app 14 · dibujo 13 · comparativa 11 · collage 11 · letra a mano 10 · foto del creador 10 · tarjeta de tuit 10 · meme 8 · dataviz 8 · antes/después 5 · captura de noticia 4 · cómic 3 · 3D 3 |
| Láminas de puro texto | 72 de 356 (20 %), concentradas en 18 posts; casi todas de marcas enormes (WIRED, Hormozi, Simon Sinek, Yung Pueblo) o como pausa/desenlace |
| Alineación del texto | izquierda 27 · centro 17 · mixta 6. Centro solo para titular corto bajo un objeto, subtítulo sobre foto, meme o globo de cómic |
| Láminas por carrusel | mediana 6 |
| Palabras en la portada | mediana 14; los 15 con más likes, 12; los 15 con menos, 20. La portada con más texto de cada lote fue la de menos likes |
| Palabras por lámina | mediana ~19 |
| Proporción | 4:5 36 · 3:4 12 · 1:1 1 (en los 558 bajados, 3:4 tuvo mejor mediana: ver `DIRECCION-DE-ARTE.md` §7) |

## 2. Los 8 patrones (con el post que lo muestra)

1. **Plantilla fija, cambia una sola cosa.** Es el patrón más fuerte: 7–9 de cada 10 por lote. El mismo molde en cada
   lámina y solo cambia el contenido: el mismo monito y la misma mesa con más billetes (18); los mismos dos personajes
   en el mismo sillón por 14 láminas (20); la misma tarjeta de tuit en el mismo lugar sobre fotos distintas (29, 34);
   dos pedestales, el plato mal y el bien hecho (35); la fila del ranking (41). El ojo solo lee lo que cambia. **Esto
   es la «consistencia» que pide Manuel**: mismo estilo, mismo personaje, misma retícula de la portada al cierre.
2. **La prueba es real.** El recurso principal casi nunca es un diseño inventado: fotos reales del hecho, documentos,
   fotogramas, tuits con su resultado, capturas de ChatGPT, Claude, X o iMessage (41–50: 6 de 10; 21–30: foto real en
   7). Interfaces que el público ya conoce se leen al instante y dan credibilidad. Un caso de IA contado con las
   capturas del chat y la foto del resultado con un círculo rojo de zoom, casi sin texto propio (14).
3. **Portada = una sola idea visual que se entiende sin leer.** Imagen que ocupa 70–100 % del cuadro, ≤ 15 palabras:
   frase a mano sobre un objeto real (01, 03), una lupa roja sobre grava (14), ojos que se van cansando (33), foto con
   cara reconocible arriba y titular condensado en mayúsculas abajo sobre negro, con cifras y nombres en el color de
   marca (21, 22, 24). Nada de interfaz ni collage en la portada; la única con kicker fue la de menos likes (50).
4. **Comparar dispara comentarios.** Díptico A/B (02: 4,444 comentarios), queja contra respuesta en dos globos (05,
   08), plato quemado contra bien hecho (35), antes/después de un prompt (24).
5. **El detalle se señala.** Círculo de zoom rojo con flecha sobre la foto (28), flecha a mano que une un tuit con su
   respuesta (21), resaltado amarillo sobre el texto de una captura (34, 40).
6. **Un color amarra lo distinto.** Cuando las piezas no se parecen (memes, capturas, tuits), un solo color de marca
   las tiñe o las subraya (37); una cifra gigante sola sirve de pausa (11, 15).
7. **El creador aparece, aunque no siempre en foto.** Gary en video b/n o **dibujado como el mentor de la escena**,
   con su firma siempre en el mismo lugar (01, 03, 05, 08); Hormozi con sus frases como tuits sobre fotos suyas en
   escenario, clase y podcast fundidas a negro (29); el youtuber en las 12 fotos de su comparativa (02).
8. **El cierre premia, no pide.** En 9 de 10 (41–50) la última lámina entrega el n.º 1, el desenlace o el mejor caso;
   el CTA va en el caption («comenta PALABRA»). Cuando hay CTA en lámina, cambia de paleta a propósito para avisar
   que es venta (17, 19) o es la maqueta del perfil con manos señalando «Seguir» (10, 24).

## 3. Repertorio de formatos para Manuel (técnica, no contenido)

| Formato | Cómo se ve | Ejemplo |
|---|---|---|
| Escena fija con su avatar | Avatar Pixar de Manuel y un dueño de negocio en la misma escena; en cada lámina cambia el diálogo (objeción → respuesta); al final rompen la cuarta pared y piden la palabra | 05, 08, 20 |
| Sus frases como tuits | Tarjeta de tuit con su foto y @, siempre en el mismo lugar, sobre fotos reales suyas (escenario, clase, oficina) fundidas a negro | 29, 12 |
| «Le pregunté a la IA…» | 3 capturas reales: prompt → contexto → respuesta; la primera en «pensando…»; el resultado con círculo rojo | 14, 43 |
| Sin IA / con IA | Díptico con el mismo encuadre: lo mismo hecho a mano y con IA | 02, 35 |
| Noticia de IA con prueba | Plantilla negra fija: foto o captura real arriba, titular condensado abajo, cifra y nombre en el color de marca; ≤ 30 palabras por lámina | 10, 21, 22 |
| Internet reaccionando | Tuits reales sobre una noticia de IA con resaltado amarillo y círculo | 34, 40 |
| Ranking con cuenta regresiva | Retratos recortados, píldora roja/verde de cambio, hasta el n.º 1 en la última | 41 |
| Su clase en fotogramas | Pantalla partida con subtítulo tipo película; CTA de palabra clave sobre una foto | 44, 38 |
| Tutorial con diagrama fijo | El mismo diagrama en cada lámina con el nodo de turno resaltado; tabla final para guardar | 36 |
| Frase a mano | La frase gancho escrita a mano sobre un objeto de su mundo, con su firma | 01, 03 |

## 4. Qué no se copia

- Frases atribuidas a famosos sin verificar (21) y rostros de famosos usados como gancho sin contexto (24): con Manuel
  van con fuente y estampa «Sin comprobar» o no van.
- Humor ofensivo (22); consejos patrocinados escondidos en una lista (50).
- Portadas sin texto o de puro texto y carruseles enteros de frases (23, 26, 45): solo funcionan con audiencias que ya
  siguen a la marca.
- El look crema con serif editorial (31, 36): choca con el veto de Manuel a crema y Fraunces. Se copia el método (una
  gráfica por lámina con el título que dice la conclusión), no el look.

## 5. Reglas que entran a la skill y al agente diario

1. Plantilla fija por carrusel: un molde para las láminas intermedias, mismo estilo de Manuel (todo avatar o todo
   foto real), un color de acento que amarra.
2. Portada: una imagen que ocupe ≥ 70 %, ≤ 15 palabras, una sola idea; sin kicker.
3. Cada lámina con prueba o recurso: captura real con fuente, foto real, comparativa, escena o personaje. Puro texto
   solo como pausa (una cifra gigante) y como máximo 1 por carrusel.
4. Texto a la izquierda; centrado solo bajo un objeto centrado o como subtítulo sobre foto.
5. Señalar el detalle (círculo rojo, flecha, resaltado) en capturas y fotos.
6. La última lámina entrega algo (el n.º 1, el desenlace, la tabla que se guarda); la acción va en el caption o en
   un botón corto, nunca una lámina de puro «sígueme».
