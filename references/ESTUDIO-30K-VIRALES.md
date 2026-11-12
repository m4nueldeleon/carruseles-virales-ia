# Estudio de 50 carruseles con más de 30,000 likes (4-nov-2026)

Pedido de Manuel: «una investigación de 50 carruseles que tengan arriba de 30.000 likes», divididos por formato y por
temática, con subdivisiones para autoentrenarse en «dónde usan animaciones, dónde usan fotos reales, dónde usan
efectos, qué colores utilizan y por qué». Amplía `ESTUDIO-50-VIRALES.md` (3-nov, >10k), no lo sustituye.

- **Corpus:** 50 carruseles de 33 cuentas, 37,872 a 2,310,849 likes (mediana 191k), 120 días (ago → 4-nov-2026).
  Salen de 247 carruseles ≥30k encontrados en ~170 cuentas (las 105 del estudio del 3-nov + 68 nuevas de memes,
  marcas, ciencia, noticias, psicología y medios en español). Selección: máximo 2 por cuenta, 5 de deportes y 2 de la
  NASA; **18 lugares para negocios, IA, finanzas y mentalidad** (garyvee, hormozi, leilahormozi, thiago.nigro,
  projetomilhao, nathaliaarcuri, ingenia.ai, wired, exec.sum, forbes, jayshetty, yung_pueblo, startupbroclassic) y
  32 de lo más grande de cualquier tema. 42 en inglés, 4 en español, 4 en portugués.
- **Datos (privado, láminas ajenas):** `Carruseles/_entrenamiento/estudio-2026-11-04-30k/`: `indice.json`,
  `refs/NN-<shortCode>/` (láminas, 3 cuadros por lámina en video, `hoja.jpg`, `meta.json`, `analisis.json` con el
  esquema de `ESQUEMA.md`), `lote-*.md`, `conteos.md` (`contar.py`), `barrido.py` y `armar.py` para repetirlo.
- **Cuidado al leerlo:** a partir de 30k el alcance lo pone sobre todo la fama de la cuenta (NASA, Nike, F1,
  celebridades). Los conteos son correlaciones, no causas. Para Manuel pesan más las 18 del nicho (§2) que el total.

## 1. Por formato y por temática (50)

| Formato | Posts | Mediana likes | Cómo se arma |
|---|---:|---:|---|
| Fotos reales en serie (dump) | 17 | 292k | Fotos sin texto encima; la historia va en el caption. Vive de que la imagen asombre o de quién sale |
| Noticia | 8 | 267k | Foto real a sangre + degradado a negro + titular condensado blanco; cifra clave en un color (amarillo/rojo) |
| Frase-cita | 6 | 92k | Frase a mano sobre un objeto real, o personaje fijo con una frase distinta por lámina |
| Tuit-captura | 5 | 90k | Tarjeta de tuit (propio o ajeno) siempre en el mismo lugar; a veces con video incrustado debajo |
| Producto-anuncio | 3 | 1.6M | Campaña de marca: fotos con grano + un clip en la lámina 2 |
| Antes-después | 2 | 1.0M | Mismo encuadre, dos fechas: «2018 ↑ / 2026 ↓», «31 oct / 1 nov» |
| Meme | 2 | 112k | Una frase fija repetida en todas las láminas; cambia solo la reacción |
| Lista-ranking | 2 | 70k | La misma ficha repetida (título + foto + crédito) |
| Carta / texto largo | 2 | 76k | Testimonio en primera persona con giro, serif, 6 láminas de texto |
| Historia en cómic, chat de IA, otro | 1 c/u | — | Globos de chat sobre fotos del objeto real (30); captura de ChatGPT con círculo rojo (45) |

| Temática | Posts | Mediana likes | Emoción que domina |
|---|---:|---:|---|
| Humor / cultura pop | 12 | 169k | risa, identificación |
| Ciencia / historia | 6 | 221k | asombro |
| Noticias / actualidad | 6 | 335k | ternura, orgullo, indignación |
| Estilo de vida | 6 | 236k | ternura, aspiración |
| Mentalidad / motivación | 5 | 79k | inspiración |
| Diseño / marca | 4 | 1.3M | asombro, aspiración |
| IA / tecnología | 4 | 60k | asombro, indignación |
| Finanzas / dinero | 3 | 65k | miedo-urgencia, curiosidad |
| Deportes, psicología | 2 c/u | — | asombro, identificación |

Mecanismo que más empuja: chisme-noticia 10 · compartir por identificación 10 · asombro-dato 8 · aspiración 8 ·
humor 7 · opinión 5. Solo 1 de 50 es de «guardar por utilidad» (41, el resumen semanal de IA de ingenia.ai).

## 2. Lo que cambia en el nicho de Manuel (18 de negocios, IA, finanzas y mentalidad)

| Medida | Nicho (18) | General (32) |
|---|---|---|
| Mediana de likes | 60k | 356k |
| Formato que más sale | frase-cita 6 · fotos 3 · noticia 3 · tuit 2 | fotos 14 · noticia 5 · producto 3 |
| Palabras en la portada (mediana) | 14.5 | 4 |
| Texto | izquierda 9 · centro 5 · mixta 4 | centro 24 |
| Con video | 5 de 18 | 8 de 32 |
| CTA del caption | ninguno 8 · link 4 · pregunta 3 · comenta-palabra 3 | ninguno 24 |

Lectura: lo grande gana con una imagen sin texto porque la cuenta ya trae a la gente; **en el nicho, la portada
lleva un gancho escrito (≈15 palabras) y el texto va a la izquierda**. Se confirma la regla de portada ≤15 palabras
de `ESTUDIO-50-VIRALES.md`; no se copia la portada muda de las marcas.

## 3. Dónde usan animación (13 de 50)

1. **Nunca de adorno: el video prueba lo que una foto no puede.** Cercanía (26: la jirafa a metros, «estuvimos ahí»),
   escala (22: el iPod gigante junto al real), reacción (27: el gesto que cambia), voz y llanto (15: testimonio con
   subtítulo palabra a palabra), revelar el escenario (07: la cámara se aleja y aparece la Tierra).
2. **La portada fija engancha y el video entra en la lámina 2** (07, 09, 29, 31, 33). La portada se mueve solo en 5: en 23 apenas
   (un Doodle que «respira») y en 17, 27, 40 y 41 porque todo el carrusel es video.
3. **El video va dentro de un molde fijo, no suelto:** en la pantalla del asiento de un avión que continúa la
   metáfora de la portada (33); en un recuadro 16:9 bajo un tuit propio, en las 6 láminas, ≈5 min partidos en 6 (40);
   solo se mueve el recuadro de imagen y el texto queda fijo (41, las 15 láminas).
4. **Subtítulos de una palabra a la vez**, con la palabra activa en caja o en rojo (15, 29, 31): obligan a leer al
   ritmo de la voz.
5. Dentro del clip, lo abstracto se explica con **claymation 3D** y titulares de periódico con marcatextos (40).

## 4. Dónde usan fotos reales y dónde ilustración (48 de 50 con foto real; 9 con ilustración)

- **Foto real de terceros en 27 posts, del creador en 13, archivo histórico en 5.** Para qué: emoción 17 · prueba 12 ·
  humor 11 · contexto 8.
- **Archivo + presente** es la prueba más fuerte: la foto vieja en B/N y la actual a color (04, 30: Polaroids de 1978).
- **Selfie que da la verdad junto a la foto producida** (26): la producida hace la portada, la de celular prueba.
- **La ilustración siempre tiene un trabajo**: personaje fijo con actitud que dice una frase distinta por lámina (34),
  claymation solo para conceptos abstractos (40), catálogo propio (21). Ninguna es relleno.
- **3D tipo Pixar: 1 de 50** (y era catálogo de Netflix). Lectura para Manuel: su avatar Pixar sirve como
  *personaje fijo* (molde 34) o para conceptos; la prueba (capturas, fotos suyas, del alumno, del resultado) va real.

## 5. Efectos (31 de 50 sin ningún efecto de diseño)

Los efectos **señalan, no adornan**. Los que aparecen, cada uno con su trabajo:

| Efecto | Para qué | NN |
|---|---|---|
| Color selectivo sobre B/N | Señala a los protagonistas sin flechas | 04 |
| Degradado a negro bajo el titular | Legibilidad sobre foto real | 20, 31, 37 |
| Marco (tarjeta de tuit, post, Polaroid, pantalla) | Que parezca encontrado, no diseñado | 14 posts |
| Círculo-inserto con contorno + etiqueta | La prueba ampliada dentro de la foto | 08, 37, 45 |
| Marcatextos / resaltado | La línea que importa en una captura | 39, 40 |
| Grano de película | Época, autenticidad | 02, 07, 09, 32 |
| Texto hecho del objeto | El mensaje vive en la escena (aerosol en el fuselaje, «SWIPE» de nubes) | 33 |
| Split dos fechas | Antes/después sin palabras | 04, 21 |

Ninguno usa glow decorativo, stickers de relleno ni sombras de plantilla.

## 6. Colores y por qué

1. **La foto pone el color; el diseño se queda neutro** (blanco o negro) para que la imagen pese (24, 30, 32, 35, 36).
   El objeto real da el hilo: el naranja del libro (30), la monarca (24).
2. **Un solo acento cálido contra un mundo neutro** (07 rojo contra gris lunar; 01 naranja contra azul noche); en el
   diseño, un acento con una sola función: la palabra clave, la cifra o dónde mirar (20 amarillo #FFE600, 41 morado).
3. **Negro + blanco + rojo = noticia** (37, 20). **Blanco de X o Instagram = captura auténtica** (10, 31, 38, 40).
4. **B/N = pasado, color = presente** (04, 29), sin escribirlo.
5. **El cambio de paleta a mitad marca el giro o la venta** (27 de 50): de tuits blancos a fondos góticos donde
   empieza la tienda (38); de video saturado a comentarios grises (31); cierre en otro papel para que el CTA no
   parezca otra frase (34). Si el carrusel vende, el color avisa.
6. Contraste alto en 25, medio en 15.

## 7. Moldes para Manuel (técnica, no contenido)

| Molde | Cómo se ve con Manuel | Visto en |
|---|---|---|
| Misma frase, distinta reacción | Una frase fija («cuando el cliente dice "lo voy a pensar"») en las 6 láminas; cambia la cara del avatar o del dueño. Publicar el día del dolor (cierre de mes, declaración anual) | 27, 21 |
| Dos fechas | Split «domingo 11 p.m. / lunes con IA» o foto vieja real en B/N ↑ y actual ↓; la última rompe el patrón | 04, 21 |
| Personaje fijo + participación | Avatar en la misma pose y fondo en todas; penúltima «deja la tuya y publico las mejores»; cierre en otro estilo | 34 |
| Noticia de IA con plantilla fija | Foto o clip real arriba fundido a negro, titular condensado blanco, cifra en un color; láminas de prueba (anuncio oficial, dato) | 20, 37, 41 |
| Resumen semanal que se guarda | «Lo que pasó en IA esta semana»: una noticia por lámina, misma retícula, solo cambia el recuadro de prueba | 41 |
| Tuit propio + clip | Su frase como tuit + recuadro con un pedazo de clase + flecha →; la clase partida en 6 (con video, solo cuando el motor lo soporte) | 40 |
| Prueba con comentarios reales | Video o foto del resultado de un alumno + 4–5 comentarios reales capturados, uno por lámina | 31 |
| Historia con globos de chat | Fotos del objeto real (la libreta del negocio de un alumno) con 2–4 globos por lámina y suspenso al final | 30 |
| Nota a mano + voz | Frase escrita a mano en un objeto de su mundo, firma; lámina 2 Manuel a cámara en B/N | 29, 33 |
| Contenido → venta | 2–4 láminas que regalan y la venta en la última, con cambio de color | 37, 38, 40 |

## 8. Qué no se copia

- Portadas sin texto y dumps de fotos sin historia: funcionan por la fama (01, 02, 03, 05, 07, 09).
- Política, tragedia y miedo como gancho (37, 40, 44, 46), groserías (33, 38), lujo sin lección (26 recibió «gurú»).
- Fotos y fotogramas ajenos sin permiso (Getty, agencias, catálogo de series); frases de famosos sin verificar.
- Serif editorial sobre papel crema (34, 36): choca con el veto de Manuel; se copia el método, no el look.

## 9. Reglas que entran a la skill y al agente diario

1. Toda animación tiene un trabajo (prueba, escala, reacción, voz o revelado) y va de la lámina 2 en adelante; la
   portada queda fija salvo que todo el carrusel sea video (41).
2. Lo que prueba va real (captura, foto suya, del alumno, del resultado); el avatar Pixar es personaje fijo o concepto.
3. Un acento de color con una sola función; el resto neutro o el color de la foto. Cambiar de paleta solo para marcar
   el giro o la venta.
4. Los efectos señalan (círculo, marcatextos, color selectivo, degradado para leer); ninguno de adorno.
5. Buscar la fecha: si el tema tiene un día (cierre de mes, Buen Fin, declaración anual), se publica ese día y la
   portada lo dice.
6. En el nicho, portada con gancho escrito ≤15 palabras y texto a la izquierda; la portada sin texto es de marcas.
7. **Molde fijo ≠ láminas idénticas** (Manuel, 4-nov-2026: «si no es el formato, eso desconecta»): se repite el hilo
   (personaje, tarjeta, acento); encuadre, tamaño, fondo y layout cambian de lámina a lámina. Ver `DIRECCION-DE-ARTE.md`.
