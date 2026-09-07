# Protocolos por formato

Cada formato es un producto distinto y se trata distinto: una imagen única vive del reenvío en dos segundos, un carrusel-noticia vive de la prueba y la ventana de 48 horas, un reel-portada vive del gate por palabra clave, un dossier vive del tiempo de lectura. Lo que funciona en uno mata al otro. Regla de trabajo nueva: ante una referencia o una idea, no se produce una sola pieza; se proponen 3 o 4 versiones en formatos distintos (imagen única, carrusel corto de 5, carrusel de 8-10 y el formato de la referencia), cada una con su portada renderizada, y se elige mirando las portadas en `portada-270.jpg`, no leyendo el JSON. Los ocho protocolos que siguen salen del estudio de 23 posts documentado en `ANATOMIA-REFERENCIAS.md` y de una verificación contra la evidencia: cada regla lleva su etiqueta. REGLA = observado en las referencias del formato. NOTA = idiosincrático de una sola referencia. CONTRATO = política del motor de la skill (schema, qa.mjs, layouts). MARCA = decisión de `MI-MARCA.md` o de dirección de arte. HIPÓTESIS = sin evidencia, se mide antes de fijarse. Los nombres de `tipo`, `layout` y `look` son los del contrato descrito en `FORMATOS.md`.

Nota de motor (2026-09-07): las versiones por formato también se producen por API con `scripts/escribir.mjs --formato-plan <imagen-unica|carrusel-5|carrusel-8|referencia>`, que mete en el prompt solo el capítulo que toca más «Cómo elegir el formato» y «Lo que se repite». La imagen única ya tiene rama en QA: `scripts/qa.mjs --imagen-unica` acepta 1 lámina sin rehook, guardable ni lámina de CTA (el CTA vive en el caption), pide `pie: ""` y `sin_top: true` y ajusta el índice; sigue pendiente el look `nota-blanca` y los layouts `meme-*` (mientras, `texto-pleno` o `portada-titulo` con imagen).

---

## Formato: carrusel-educativo («Pizarrón con evidencia»)

Definir → probar → sintetizar → bautizar → pedir. Objetivo: leads por palabra clave hacia una escalera real.

### Cuándo usarlo y cuándo no

Úsalo cuando hay una confusión real entre dos o tres términos o fenómenos que el dueño de negocio YA OYE y no distingue (pueden ser siglas: la referencia vivió de AEO/GEO/SEO), y esa confusión se puede DEMOSTRAR con pantallas reales tomadas por la marca (Google con respuesta de IA, ChatGPT, Maps, WhatsApp, una factura). Sirve para la serie «Lo que salió hoy y qué cambia para tu negocio el lunes» y para temas de la clase «Negocio en Google y ChatGPT». Funciona cuando el tema admite un método propio con nombre que el lector quiera guardar y ese nombre puede ser la palabra clave del comentario.

No lo uses cuando no existe una captura real que probar (si hay que ilustrar la evidencia, el formato pierde su única ventaja). No para historias, opiniones, listas de herramientas ni noticias sin pantalla. No cuando los conceptos no comparten un mismo hilo (la síntesis no cierra). No cuando el entregable y la palabra clave no están conectados en ManyChat. No para piezas que firman Sinergéticos (look bosque): este es formato de marca personal, de profesor.

### Referencias

- DcnIyI8DCY6 · @apurv_sngh: 7 láminas 4:5, pizarrón manuscrito sobre carbón #2B2B2B + capturas reales anotadas (selección nativa azul + óvalos rojos), Venn, revelado 4→5, acrónimo C.I.T.E que es también la palabra clave, CTA con miniatura de su curso (1:12:46) y escalera a masterclass de pago. 2,871 likes / 950 comentarios (0.331). Única deconstrucción para esta anatomía: N=1.
- Corroboración interna parcial (MI-MARCA §6): «8 páginas para dominar Claude» (921 guardados, 7.6%) respalda la lámina-lista guardable; «Conecta tu Instagram a Claude» respalda fondo oscuro + herramienta. No corroboran manuscrito, capturas anotadas, Venn ni acrónimo.
- Formato: la evidencia es 4:5; SKILL.md fija 3:4 como política operativa con un «~7%» no verificable; ambos válidos para A/B.

### Anatomía

| Pieza | Regla | Evidencia |
|---|---|---|
| Gancho por brecha | REGLA. La lámina 1 define el término desconocido con titular declarativo «ESTO ES [término]»; lo conocido cierra el tríptico. Los términos son los que el lector ya oye. | «THIS IS AEO» en la 1, «THIS IS SEO» en la 3 |
| Fórmula fija de lámina de evidencia | REGLA. Titular manuscrito de 3-5 palabras arriba-izquierda → flecha blanca gruesa y curva → captura al centro-derecha al ~55% del ancho → conclusión roja abajo-izquierda con flecha roja fina. Se repite en todas. | Láminas 1 y 2 completas; la 3 omite la conclusión (decisión propia: incluirla por consistencia) |
| Evidencia anotada en dos capas y en proporción | REGLA. Captura real con la consulta visible; frase clave resaltada con la selección nativa antes de capturar; encima, un óvalo grande si hay una respuesta, varios círculos si hay varios nombres, ninguna en la lámina de lo conocido. | Lámina 1 (selección azul + óvalo), 2 (círculos sobre marcas), 3 (sin anotación) |
| Tríptico sobre un mismo hilo | REGLA. Tantas láminas de evidencia como conceptos; capturas distintas sobre UN tema que escalan (pregunta cotidiana → recomendación → sustantivo). | Tres búsquedas sobre tenis |
| Síntesis dibujada | REGLA. Venn de tres (o tabla de dos) a mano, nombres en rojo, intersección verde, línea a «TU ESTRATEGIA» en el acento propio. Cero texto nuevo. | Lámina 4 |
| Revelado progresivo | REGLA. La lámina siguiente es la misma, píxel por píxel, más una flecha verde y el nombre del método. Observado una vez; sin evidencia sobre repetirlo. | Láminas 4→5 |
| Acrónimo = palabra clave + lámina-checklist | REGLA. Método con acrónimo de 3-4 letras que forma palabra real y ES la palabra del comentario. Una lámina de una fila por letra: letra roja gigante + 1-3 palabras en acento + ícono a mano + una pregunta contestable el lunes. Sin letrero «guarda esto». | Lámina 6 y «COMMENT 'CITE'» |
| Ritmo de densidad | REGLA. 3-9 palabras en las láminas 1-5 con mitad inferior vacía permitida; la checklist llena el cuadro (~40, tope 70); el CTA vuelve a ~14. | Densidad medida de la referencia |
| Roles de color | REGLA. Blanco afirma, rojo señala y concluye, acento propio = «lo tuyo», verde = síntesis; en el CTA puede entrar un quinto color cálido para la palabra clave (o fundirse en el dorado: decisión de marca). | Paleta de las 7 láminas |
| Fondo carbón + capturas oscuras | REGLA. #2B2B2B plano; capturas en modo oscuro para que se fundan; si solo existen en claro, oscurecer o enmarcar. | Láminas 1-3 |
| Texto a mano, legible | REGLA con límite. Escritura real con stylus exportada con alfa; error humano en la forma, nunca en la legibilidad (QA: .titulo ≥84 px, texto ≥38, micro ≥30, margen 80 px). Fuente manuscrita solo como fallback autorizado en DIRECCION-DE-ARTE. | Tipografía de la referencia; flechas finas que se pierden en teléfono |
| Ejemplo mundano con marcas reconocibles | REGLA. La búsqueda es una que el lector pudo hacer hoy; en la lámina «la IA recomienda a otros», los nombres deben reconocerse al instante. | Nike, New Balance, PUMA dentro de la captura |
| Un rostro, solo al final | REGLA. Sin cara en 1-6; foto real de la marca solo en el CTA, donde la voz pasa de enseñar a pedir. | Lámina 7 |
| CTA de tres pisos | REGLA. Titular que promete ver el método aplicado y nombra la herramienta («MIRA CÓMO LO USO CON…»), evidencia propia (miniatura de la clase con duración), palabra clave a mano = método, igual en lámina y caption; el caption añade el escalón siguiente. | Lámina 7 + caption con curso gratis y masterclass |
| Primera línea del caption | REGLA. Nombra los términos y cuantifica las láminas («Con 3 láminas te queda claro…»). Sin «link en bio», sin «guarda esto». Hashtags opcionales. | Caption de la referencia |
| Sin logo, @, numeración ni «Desliza» | REGLA de la referencia; MARCA en Manuel: sello solo en el CTA, @ micro opcional. | Sin marca en las 7 láminas |

### Portada

La portada no es una promesa: es la primera lámina de contenido (definición de lo desconocido + su prueba). Titular manuscrito de 3-5 palabras, 100% blanco, declarativo («ESTO ES…», «ASÍ TE BUSCA LA IA»), sin palabra roja ni pregunta. Captura cotidiana del giro y la ciudad del lector con la consulta visible, frase resaltada, óvalo rojo grande y flecha a la conclusión roja de 3-6 palabras. Sin cara (excepción documentada a «Manuel en portada»). Sin «Desliza». Concurso de la skill: 3-4 candidatas que varían pantalla y titular, no color ni layout, ≥16/20 a 270 px.

### Cuerpo

Lámina 2 = rehook por contraste: la segunda definición con su captura (no una lámina de promesa). Lámina 3 cierra con lo conocido; mitad inferior vacía permitida. Capturas reales en modo oscuro, mismo hilo, consulta visible, datos de terceros tapados, sin barra de estado ni «Sign in». Anotación proporcional en dos capas; flechas de señal engrosadas respecto a la referencia. Lámina 4 síntesis; lámina 5 revelado (mismo fondo + flecha verde + «MÉTODO [ACRÓNIMO]»). Lámina 6 checklist sin kicker, ≈40 palabras (tope 70), nada tocando el borde, acrónimo escrito igual en todas partes. Dos clases de flecha: estructurales blancas curvas, de señal finas rectas de color. Íconos dibujados a mano reconocibles a 40 px.

### Cierre

La checklist es el motivo de guardado; el CTA pide una sola cosa: la palabra. Tres pisos: titular con la herramienta nombrada, evidencia propia real (clase del Lunes con duración visible o captura del resultado), palabra clave a mano dentro de «Comenta [PALABRA] y te la mando por DM». Un rostro real, no Soul. Una palabra = nombre del método, ≤8 letras, la misma en lámina y caption, creada en ManyChat antes de publicar. Entregable fuera del carrusel y que prueba el método aplicado (puede ser largo: la referencia dio 1:12:46); el caption nombra el escalón siguiente real (Club), sin fechas falsas. Caption: primera línea ≤125 caracteres que nombra los términos, 4-6 líneas, ≤2 emojis, sello al final.

### Estilo visual

Paleta: carbón #2B2B2B, blanco tiza #F2F2F2, rojo #E5322D, dorado de marca #C9A84C (sustituye al naranja), verde #2EAA3C; salmón solo en el CTA si se conserva. Prohibido crema, latón, Fraunces, degradados, glow. Tipografía: manuscrita real con stylus; interfaz intacta dentro de las capturas; nunca una sans geométrica limpia en el texto propio. Imágenes: tres tipos (capturas reales oscuras, dibujos a mano, una foto real en el CTA); logos de terceros pequeños dentro de capturas. Composición: 3:4 1080x1440 (política) o 4:5 (evidencia), captura al ~55% del ancho, sin marco ni numeración. Acabado crudo y controlado: trazo con temblor, círculos imperfectos; nada recortado por el borde, nada de interfaz sucia. Las capas manuscritas son assets de origen; se rehacen a mano, no se retoca el PNG final.

### Voz y lo humano

Profesor frente al pizarrón: tuteo, presente, imperativo suave, afirma sin matizar. Segunda persona en 1-6; primera persona solo en el CTA. Términos que el dueño ya oye, probados con pantalla, sin inventar siglas. El humor es el ejemplo cotidiano, nunca sarcasmo ni catastrofismo. Error humano sí en la forma (letras desiguales, círculo que corta una palabra), no en el fondo (nombre del método, ortografía, interfaz). Español neutro en láminas; «la neta» solo en caption. Cada pregunta de la checklist se responde en 5 minutos con el celular.

### Errores que matan

Ilustrar la captura; abrir con lo conocido; fondo o capturas en claro; recortar la consulta o mostrar negocios que nadie reconoce; letra por debajo del QA o flechas de 2 px; romper la fórmula de 4 piezas entre láminas; método distinto de la palabra clave o escrito de dos formas; checklist en párrafos o con kicker; cara en las láminas de evidencia o Soul mezclado con capturas reales; colores sin rol; pulir de más; inventar siglas; publicar sin ManyChat; checklist recortada por el borde; datos de terceros visibles; tres evidencias sin hilo común.

### Checklist

- [ ] Una confusión real entre términos que el dueño ya oye, probable con pantallas reales sobre un mismo hilo.
- [ ] Capturas propias en modo oscuro, consulta visible, terceros tapados, mismo ancho; la de recomendación con marcas reconocibles.
- [ ] Lámina 1 abre por lo desconocido con titular blanco declarativo; todas repiten la fórmula de 4 piezas.
- [ ] Anotación en dos capas y proporcional; flechas de señal engrosadas.
- [ ] Lámina 4 síntesis sin texto nuevo; lámina 5 idéntica + un elemento.
- [ ] Acrónimo de 3-4 letras = palabra real = palabra clave, igual en 5, 6, CTA y caption.
- [ ] Lámina 6 sin kicker, una fila por letra, ≈40 palabras (tope 70), márgenes de 80 px.
- [ ] Roles de color fijos; fondo #2B2B2B plano.
- [ ] Texto a mano (o fuente autorizada con jitter) que pasa el QA y se lee a 270 px.
- [ ] Sin cara en 1-6; en el CTA una foto real con la herramienta nombrada.
- [ ] Palabra clave ≤8 letras conectada en ManyChat con entregable listo antes de publicar.
- [ ] Entregable fuera del carrusel que prueba el método; caption con escalón siguiente, sin fechas falsas.
- [ ] Primera línea del caption nombra los términos y cuantifica láminas; ≤2 emojis; sello; hashtags opcionales.
- [ ] Portada a concurso; firma según MI-MARCA §5; formato único; QA ≥80; alt por lámina.
- [ ] Publicar 17:00 CDMX; medir 48 h y 7 d; métrica propia = comentarios con palabra / likes (referencia 0.33).

### Adaptación a la marca

Traducción directa: «Así te busca la IA cuando alguien pregunta por tu negocio» con tríptico de búsquedas LATAM reales (respuesta de IA → recomendación con clínicas reconocibles → resultados de siempre). Método propio en español que sea palabra real y palabra clave (ejemplo ilustrativo «MÉTODO MAPA»: Máquina, Ayuda, Postura, Alcance). Dorado en lugar de naranja. Nuevo look «pizarron» pendiente en el motor (layouts `pizarron-evidencia` y `checklist-acronimo`, familia manuscrita OFL autorizada, perfil de QA sin penalizar la ausencia de `loop`); mientras, aproximar con `oscuro-tech` + capas PNG manuscritas. Excepción documentada: la portada la protagoniza la evidencia, el rostro va solo en el CTA. Herramienta nombrada con ícono que el dueño reconoce (G de Google, WhatsApp, ChatGPT). Serie natural si es hit: la misma anatomía en WhatsApp, Maps y ChatGPT.

### Láminas y formato en px

7 láminas con tres conceptos (6 si son dos; tope 9): N evidencias · síntesis · revelado · checklist · CTA. 3:4 1080x1440 (@2x) por política de la skill o 4:5 1080x1350 respaldado por la evidencia; mismo formato en todas; márgenes 80 px, franja inferior 150 px; portada legible a 270 px.

---

## Formato: reel («Tarjeta de lanzamiento»)

Una herramienta que ya usas, su límite real, un objeto que lo arregla y una palabra clave. La evidencia son tres reels de una sola portada + caption; el carrusel es derivación de la skill.

### Cuándo usarlo y cuándo no

Úsalo cuando el tema es UNA herramienta que la audiencia ya usa (WhatsApp, ChatGPT, Claude, Excel, Canva) más una limitación real de su negocio que se arregla con un entregable concreto que funciona tal cual y se regala por DM. Cuando el objetivo son comentarios que se vuelven leads (gate), no guardados. Cuando la portada tiene que servir como primer frame de un reel o creativo de pauta y puede ser capítulo de una serie semanal.

No cuando el valor está repartido en muchas láminas con criterio propio (usa `guia`). No sin entregable ni flujo de ManyChat. No para noticia ajena o recap sin nada que aplicar el lunes. No si la «limitación» es inventada o la herramienta ya la resolvió. No cuando se busca guardado: ahí va la variante ranking con su KPI propio, nunca 13 filas en una lámina. Nunca en voz institucional.

### Referencias

- DcIF323Pd3h · @worthknowingmedia: tabla 13×4 letterboxed, 8 colores, logos redibujados, pie LIKE/SHARE; 8,113 likes, 0.41%: pieza de guardado; contraejemplo de densidad, paleta y CTA en imagen.
- DbQJa0cMu6Q · @buildwith.conrad: kicker mono «ONE FILE · NO API KEY», ícono negro sobre crema con foto velada, titular de 4 palabras con punto, handle al 91%; caption de 5 párrafos con tres «sin» y cifras no redondas; likes ocultos, 8,180 comentarios (incluyen auto-respuestas).
- DalaUaasv-G · @buildwith.conrad: tinta + cobre, título de dos líneas, iris 3D, «02 / THE FIX», ✦ @handle; caption con 3 piezas nombradas y 30 min → 90 s; 5,245 likes, 21,944 comentarios (4.18: gate, no distribución).

### Anatomía

| Pieza | Regla | Evidencia |
|---|---|---|
| Metadato superior | REGLA (3/3 algo pequeño arriba; 2/3 mono gris). Una línea en mayúsculas, tracking 0.15-0.2em, 32-38 px, gris al 40-60%: dos objeciones resueltas o el capítulo. | «ONE FILE · NO API KEY», «02 / THE FIX», eyebrow de DcIF |
| Titular | REGLA. 3-6 palabras en 1-2 líneas, grotesca bold 700-800 (no black), punto final si es frase, sin «!» ni adjetivos; una palabra o la segunda línea en acento. Negación o promesa en dos líneas. | «Claude can't watch YouTube.», «One skill. / Every frame.» |
| Objeto protagonista | REGLA (3/3). Un objeto con sombra o render que encarna el entregable o la metáfora, 20-60% del alto, único bloque de contraste; arriba o abajo del titular. | Ícono, iris, tabla dorada |
| Firma inferior | REGLA (3/3). Handle en la mono y gris del kicker a ~90%, glifo opcional en acento; nunca logo grande ni tagline. | Los tres |
| Sin CTA ni tagline en la imagen | REGLA (2/3). La acción vive en el caption. | La única portada con LIKE/SHARE en imagen dio 33 comentarios |
| Densidad y aire | REGLA (2/3). ≤11 palabras en la imagen y ≥40% libre. | DbQ 60-65% de aire; Dala 40% superior libre |
| Paleta | REGLA (2/3). Fondo pleno + tinta + UN acento máximo, presente también en el objeto; sin metálicos. | DcIF con 8 colores es el contraejemplo |
| Tipografía | REGLA (3/3 dos familias). Grotesca bold + mono; 2-3 tamaños; subtítulo opcional en caja baja a un tercio. La condensada metálica de DcIF no se porta. | Los tres |
| Fondo y textura | NOTA. Foto propia velada al 85% + retícula casi invisible; o grano + partículas + viñeta; o negro liso. | Una opción por referencia |
| Apilamiento | REGLA (3/3 eje centrado). A) kicker → objeto → titular. B) capítulo → titular → objeto → subtítulo. Nada crítico en el 15% superior ni inferior; la firma sí puede ir al 90%. | DbQ y Dala |
| Gancho: límite de una marca prestada | REGLA (2/3). Línea 1 del caption = negación sobre la herramienta + giro («Hasta que le das esto»). | Ambos Conrad |
| Metáfora central | REGLA (2/3). Se elige UNA metáfora de la que salen objeto, titular y palabra clave. | «le di ojos» → iris → EYES |
| Caption = cuerpo | REGLA (2/3). ≈100-130 palabras en 5-6 párrafos: negación + giro → dolor vivido → lo que todos hacen mal → arreglo (UNA pieza con tres «sin» o TRES piezas nombradas) → cifra desproporcionada → palabra en MAYÚSCULAS + «gratis» (+ cadencia) + hashtags. 0-1 emoji, solo en el CTA. | DbQ y Dala; DcIF enciclopédico es el contraejemplo |
| Cifra de prueba | REGLA (3/3). Específica y desproporcionada (antes/después) o dato duro con decimales; nunca inventada. | 2h28 → ~40 s; 30 min → 90 s; $365.3M |
| CTA palabra clave + follow secundario | REGLA (2/3). Una palabra que se escribe sin pensar (4-9 letras), soldada a la metáfora, con «gratis» y DM automático; follow permitido como acción secundaria; prohibido LIKE/SHARE principal. | EYES, BREAKDOWN |
| Entregable de alto valor | REGLA (2/3). Lo que llega por DM es la cosa que funciona tal cual, no un resumen. | El archivo entero, la skill completa |
| Serie y capítulo | NOTA (1/3). Etiqueta de capítulo y cadencia semanal convierten el follow en suscripción. | Dala |
| Sin rostro del creador | REGLA (3/3). El objeto ocupa su lugar; Manuel es variante B a probar y entra en `cta-cara`. | Los tres se distinguen del feed de talking-heads |
| Marca prestada y su logo | EVIDENCIA vs MARCA. La evidencia imita el logo (2/3); Manuel lo nombra en texto y usa objeto propio por derechos. | Asterisco de Claude, 13 logos |
| Variante ranking | NOTA con KPI propio (guardados). Fila = nivel visual + glifo + cifra en acento; ≤4 filas por lámina; escala verificada; dato-sorpresa cruzado. | DcIF |
| Acabado | REGLA (3/3 premium, sin plantilla). Mate keynote o cinematográfico con grano; sin neón, emojis-icono, vidrio ni metálico. | Los tres |

### Portada

1. Marca prestada + límite real vigente; nómbrala en texto, represéntala con objeto propio. 2. UNA metáfora que dé objeto, titular y palabra. 3. Titular 3-6 palabras, bold, sin «!»: negación con punto («ChatGPT no conoce a tus *clientes*.») o promesa en dos líneas con la segunda en acento. 4. Metadato mono 32-38 px gris al 50% con dos objeciones o capítulo. 5. Objeto único con sombra difusa, 20-60% del alto, sin texto dentro; por omisión sin rostro; variante B Manuel con el dispositivo. 6. Apilamiento A o B, eje centrado, fondo del look asignado (nunca crema + latón). 7. Firma `@manueldeleonmjr` en mono a ~90%; sin tagline ni «Desliza» en la versión reel/pauta. 8. Prueba: a 30% de zoom se identifica el objeto y se lee el titular; ≤11 palabras, ≥40% libre; exportar 9:16 y 3:4.

### Cuerpo

El cuerpo real es el caption (≈100-130 palabras). Las láminas 2-N son derivación de la skill, una por párrafo: `rehook` (el dolor vivido + promesa + `loop`), `agitacion` (lo que todos hacen mal), `pasos` o `punto-numero` ×3 (el arreglo), `dato-hero` (la cifra con fuente), `cheatsheet` (la receta corta; la completa va al DM). Variante ranking: láminas de ≤4 filas con tres lecturas, insight cruzado y cheatsheet.

### Cierre

`cta-cara` con Manuel (un solo tipo de rostro), `boton: "Comenta OJOS"`, la misma palabra en cuerpo y caption; «Sigue para la siguiente» permitido como P.D. Palabra en español, MAYÚSCULAS, 4-9 letras, soldada a la metáfora (OJOS, ARCHIVO, FICHA). Entregable que funciona tal cual y se abre sin instalar nada (Doc, PDF, texto, video): política de audiencia. ManyChat probado antes (`entregable_existe`). Medición a 7 días con dos métricas: distribución (reproducciones, alcance, likes) y conversión (comentaristas ÚNICOS ÷ likes, DMs entregados); si únicos ÷ likes ≥0.5 el gate funcionó; <1% es pieza de guardado.

### Estilo visual

Paleta: fondo + tinta + un acento presente en el objeto; portar la estructura, no el color (crema+negro → `guia-rapida`; tinta+cobre → `oscuro-tech`; negro+dorado → `bosque` solo en ranking). Tipografía: Inter Tight 700-800 o Space Grotesk Bold para el titular (120-150 px en portada), JetBrains Mono para kicker y handle (32-38 px), Manrope para el subtítulo; nunca serif ni condensada ultra pesada ni logos ajenos redibujados. Imágenes: objeto generado sin texto con sombra difusa; textura opcional (foto propia velada o grano + partículas); marcas solo como texto. Composición: eje centrado, apilamiento A o B, margen 80 px, nada crítico en los 140 px inferiores ni el 15% superior; recorte 4:5 y central 1080x1440 conservan kicker, objeto y titular. Acabado premium: sombra difusa 40-60 px; sin neón, flechas, vidrio ni metálico.

### Voz y lo humano

Primera persona seca y afirmativa, una cifra por afirmación, cero adjetivos de venta, punto final en el titular. Autoridad prestada, no inventada. La huella humana es la precisión de quien lo midió (cifras en letras, hora de la prueba, foto propia), no el error fingido: 3/3 sin error deliberado. Humor opcional en una línea del caption, nunca requisito. Jerga traducida al resultado (adaptación de audiencia): «API» → «sin contratar nada», «skill» → «receta». Frases de marca: «Te lo digo de verdad», «Aprendí esto a las malas». Nunca la voz institucional de DcIF.

### Errores que matan

Más de 11 palabras o la tabla completa en la portada; CTA o tagline dentro de la imagen; segundo acento, degradado metálico o halo; titular con «!» o adjetivos; portada sin objeto; rostro del creador como default; palabra sin flujo probado; entregable que no funciona tal cual; cifra inventada o escala que contradice la etiqueta; imitar el logo prestado o usar retratos ajenos; kicker o handle grandes o de color; texto crítico en los 140 px inferiores; caption que lo da todo sin reservar nada; crema + latón + serif; error humano fingido; medir el gate con comentarios brutos; reutilizar una palabra clave sin verificar qué manda hoy.

### Checklist

- [ ] Metáfora única de la que salen objeto, titular y palabra.
- [ ] Titular 3-6 palabras, bold 700-800, sin «!», negación con punto o promesa en dos líneas con acento.
- [ ] ≤11 palabras, ≥40% libre, sin CTA ni tagline; legible al 30% de zoom.
- [ ] Un objeto con sombra (20-60% del alto), único bloque de contraste; sin rostro por omisión.
- [ ] Apilamiento A o B con eje centrado; metadato mono 32-38 px gris.
- [ ] Un acento máximo, también en el objeto; look de `siguiente-look.mjs`.
- [ ] Dos familias del paquete; cero serif, condensada o logos ajenos.
- [ ] Margen 80 px; nada crítico en los 140 px inferiores ni el 15% superior; firma a ~90%.
- [ ] Herramienta nombrada en texto y objeto propio; un solo tipo de rostro si aparece Manuel.
- [ ] Caption ≈100-130 palabras en la secuencia fija; 0-1 emoji en el CTA; 3-5 hashtags.
- [ ] Palabra clave única en español, soldada a la metáfora, idéntica en `boton` y caption.
- [ ] Entregable que funciona tal cual y se abre sin instalar; ManyChat probado antes.
- [ ] Jerga traducida a minutos, clientes, mensajes y pesos.
- [ ] Láminas derivadas del caption con `rehook`, `dato-hero` y `cheatsheet`; QA verde.
- [ ] Portada exportada en 9:16 si sirve de cover o pauta.
- [ ] A 7 días: distribución y conversión (comentaristas únicos ÷ likes) en `historico.json`.

### Adaptación a la marca

Gancho: «[Herramienta que ya usas] no puede [X de tu negocio]. Hasta que le das esto». Metadato en español («UN ARCHIVO · SIN PROGRAMAR», «02 / EL ARREGLO»). Objeto sin rostro por omisión; Manuel con celular o tablet como variante B medida. Palabra clave en español (OJOS, ARCHIVO, FICHA, VENDEDOR), sin tope de letras. Entregable abrible sin instalar nada. Cifra de prueba propia («47 WhatsApps contestados en 6 minutos»). Portar estructura, no color. Serie opcional «Cada semana una herramienta de IA para tu negocio». Variante ranking con logos solo de uso permitido y escala verificada fila por fila. Reel primero, carrusel después: si Manuel graba, el video muestra el arreglo funcionando y la tarjeta es el primer frame.

### Láminas y formato en px

Evidencia: 1 portada + caption. Derivación: 7 a 9 láminas (portada-tarjeta, rehook, agitación, arreglo en 1 o 3 láminas, dato-hero, cheatsheet, cta-cara); ranking 10-12. Versión primaria 9:16 1080x1920 con lo crítico en el rectángulo central 1080x1440 (nada crítico en los 240 px superiores ni 320 inferiores; la firma sí a ~90%); versión carrusel 3:4 1080x1440. Titular 120-150 px en portada, cuerpo ≥38 px, micro ≥30, metadato 32-38.

---

## Formato: imagen-unica-meme («La lámina que se reenvía»)

Todo el gancho, el contenido y el remate viven en una lámina; el argumento vive en el caption. Siete referencias.

### Cuándo usarlo y cuándo no

Úsalo cuando el ángulo cabe entero en una lámina que se entiende en 3 segundos (diálogo, chat, gráfica honesta, perfil o notificación intervenidos) o en un mapa que se orienta en 3 y se escanea en 30 (matriz 2×2, starter pack). Sirve para desmontar un cliché que la audiencia repite de memoria, para un test de identidad («yo ese»), para plantar una tesis a contracorriente que valida a un bando y pica al otro, para humanizar el feed sin venta, para probar barato un ángulo antes del carrusel, y para fin de semana. Pregunta de diseño obligatoria: «¿qué dice de sí mismo quien lo reenvía?». Objetivo por subformato: `shares` en diálogo, chat y gráfica; `saves` en starter pack, matriz y tira; `comments` solo en la matriz con provocación calculada. Cadencia: máximo 1 de cada 5 piezas.

No cuando el valor está en el paso a paso (el carrusel se guarda 9 veces más y la imagen única pierde alcance interanual). No si el chiste necesita jerga que ESTA audiencia no reconoce. No cuando se necesita un lead esa semana (ninguna referencia lleva palabra clave). No con cifras reales de la empresa ni saldos presentados como propios de Manuel (montos ficticios redondeados en la UI del «dueño» sí caben). No para rankear personas con nombre ni política, ni para burlarse del empleado: la audiencia es el jefe. No si los objetos del mapa no se reconocen sin leer. Advertencia con datos propios: el humor aquí trae vistas y casi cero guardados; el chiste va pegado a una herramienta o hábito concreto.

### Referencias

- Db50VS1oEGd · matriz 2×2 con ~29 portadas; likes ocultos, 79 comentarios de debate sin CTA. Test de identidad + provocación calculada.
- Db7WjvRgwZ_ · perfil de LinkedIn falso dentro de un tweet; 2,340 / 9 (0.38%). Interfaz secuestrada, titular-reacción de 5 palabras.
- DcMicP4P7pv · chat jefe/empleado con wallet como respuesta; 56,819 / 371 (0.65%). Viñeta de tres tiempos, un bloque de color.
- DbuW4U_MfsB · gráfica de pastel honesta + recorte de cuerpo entero; 42,021 / 35 (0.08%). Siete palabras.
- Dbv12afKvwP · starter pack «MRR maxxing» con 14 satélites; 3,297 / 13 (0.39%). Guardado e identidad.
- DbOsvUNuKZp · diálogo de dos réplicas en texto puro; 17,958 / 84 (0.47%). Inversión de cliché, firma como autor.
- DaxogR4Bh6g · tira de 3 viñetas sin texto + caption ensayo; 1,951 / 33 (1.7%). Repetición con una variable.

### Anatomía

| Pieza | Regla | Evidencia |
|---|---|---|
| Lienzo y fondo | REGLA. Blanco puro plano, sin textura ni barras; en chiste rápido domina el vacío, en mapa es el respiro. | 6/7 blanco (n14 85% vacío); n18 fondo de escena |
| Titular-reacción en voz humana | REGLA (chat, perfil, notificación). 5-7 palabras arriba, gancho y prueba social a la vez; en Manuel es suya y con su nombre, sin emojis. | «Now who is this guy», «Nah this is wild» |
| Tipografía | REGLA. Una familia de sistema por pieza, 1-3 pesos, negro #111 o gris grafito #3E3E3E; mayúsculas en títulos y ejes, caja normal en diálogo y UI. | n11 tres pesos; n14 uno |
| Texto propio | REGLA. Chiste rápido 7-20 palabras; lista intervenida ~40 etiquetas; mapa ≤60 con etiquetas de 2-6 palabras y ≤2 líneas. | n10 7, n14 16, n6 ~20, n5 ~40, n11 ~55 |
| Color | REGLA. Cero color de marca (7/7). El color viene de los objetos o de 1-2 tintas «por defecto» donde vive el dato. | n10 azul + rojo de Paint; n6 bloque de la wallet |
| Ancla legible en miniatura | REGLA. Un elemento domina a 270 px: título ≥30% del ancho, cifra sobre el único color o etiqueta bold arriba (aunque mida ~4% del alto). | «MRR» 35%; «GOOD MARKETER» ~4% |
| Setup → remate | REGLA. Planteamiento arriba, remate abajo o a la derecha; el remate puede ser una imagen sin texto (3/7); filas de menor a mayor. Excepción: el starter pack no tiene orden, el remate va en un satélite. | n6, n10, n18; n5; n11 |
| Plantilla mental prestada | REGLA. Un formato que el lector ya sabe leer en menos de un segundo y UNA variable cambiada. | Chat, perfil, pastel, compass, starter pack, tira, guion |
| Verosimilitud de la interfaz | REGLA. UI nativa con hora, nombre, fechas que cuadran; la credibilidad vive en los metadatos, no en la perfección (n6 tosca y es la más grande). WhatsApp Business, no iMessage. | n5, n6, n11 |
| Objetos y jerarquía (mapas) | REGLA. Starter pack: 10-14 satélites de peso parejo. Matriz: 20-30 fichas con grado por posición; tamaños desiguales; 1-2 pisando el eje; prueba «se reconoce sin leer: sí/no» sin umbral numérico. | n3, n11 |
| Rostro o recorte | NOTA (2/7). Recorte de cuerpo entero a la derecha del mismo alto que la gráfica; avatar con 2-3 rasgos fijos. Una sola cara por pieza; nunca foto viral ajena (MARCA). | n10, n18 |
| Firma | RECOMENDACIÓN (5/7 no firman). Texto plano al mismo cuerpo, justo debajo del bloque; handle solo en mapas; vestuario en la tira. Nunca logo ni marca de agua. | n14, n18 |
| Acabado y error humano | REGLA. «Keynote en 20 minutos por alguien con criterio»; 1-2 imperfecciones decididas y anotadas; nunca en el remate, cifra o palabra clave. Nítido por decisión de marca (la evidencia borrosa no resta). | n3, n5, n6, n10, n11, n14 |
| Composición y márgenes | REGLA. Margen 5-7%; nada toca los bordes salvo el recorte-remate hacia abajo; bloque bajo el centro en texto puro, cruz sobre el centro en matriz; izquierda para diálogo y UI, centrado para título + gráfica. | n14, n5, n10, n3, n6 |
| Caption | REGLA. La imagen hace reír; el caption enseña o baja la guardia. Primera línea ≤125 como titular; después fórmula con escenarios, dato curioso, tesis con aforismo o confesión; 0-2 emojis; 0-3 hashtags. | n6, n18, n5, n14, n10 |
| CTA y palabra clave | REGLA medida. Ninguna lleva CTA; ratio 0.08-1.7%; la pregunta abierta no lo cambia (n11 0.39%). Cierre por pregunta de identificación o por aforismo (4/7). Palabra clave solo con entregable que amplíe la imagen, solo en caption. | Todas |
| Permanencia en dos velocidades | REGLA. Se entiende en 3 s y retiene 20-40 en mapas; en chiste y tira la imagen deja el sentido a medias y el caption lo completa. | n3, n11, n18 |
| Bandera de identidad y tesis | REGLA de fondo. Dos frases antes de renderizar: «quien lo manda está diciendo que ___» y «esto valida a ___ y pica a ___». | n14, n11, n10, n6, n18, n3 |
| Formato | REGLA. Vertical 3:4 o 4:5 (5/7 son 4:5), nunca 1:1. | Todas |

### Portada

La portada ES la pieza. Concurso de 3-4 versiones cruzando dos chistes con dos plantillas mentales, ≥16/20 a 270 px; si ninguna pasa se cambia el chiste. Dos frases en `notas` (identidad y bando). Setup arriba en ≤7 palabras (títulos «Razones para X:», pie «Ranking de dueños según…», pregunta del contador, cliché entre comillas). Titular-reacción de Manuel en chat/perfil/notificación. Ancla legible (título 96-140 px, ejes ≥56, chat ≥36, etiquetas ≥28, firma al mismo cuerpo). Remate abajo o derecha sin explicación; puede ser imagen. Cero barras, kicker, chips, «Desliza», halo, paleta de look ni color de marca. Firma en texto plano o handle en mapas; si compite con el chiste, se quita. Prueba de los 3 segundos con alguien de 50 años. 1-2 imperfecciones decididas.

### Cuerpo

No hay láminas: el cuerpo es el caption. Primera línea ≤125 caracteres que sostiene la pieza sola. Variante «clase» (5-12 líneas con fórmula o tres escenarios con fuente), «confesión» (1-3 frases; si el chiste viene traducido, se reconoce), «dato curioso» (2-3 oraciones). Una frase citable. Traducción cultural total, cero anglicismos. Sin CTA duro; cierre con pregunta de identificación o frase citable. 0-3 hashtags al final; 0-2 emojis.

### Cierre

Firma: «Manuel de León.» en texto plano al mismo cuerpo bajo el bloque (recomendación, no requisito); «@manueldeleonmjr» solo en mapas; vestuario en la tira. Última línea del caption: pregunta que modela el reenvío («¿A quién se lo mandas?», «Yo, el de la rebanada grande») o aforismo de giro. Palabra clave solo si existe entregable que amplíe la imagen (lista por cuadrante, checklist PDF), una, ≤8 letras, solo en caption, `entregable_existe` marcado. Sembrado de comentarios de identificación en la primera hora (política de skill). Medición: KPI `share_rate` (≥1% fuerte, ≥3% hit) y alcance contra la mediana vigente de `historico.json`; en mapas también `saves`; si los likes están ocultos se miden absolutos. Máximo 1 de cada 5 piezas; preferible fin de semana; el carrusel con palabra clave va la semana siguiente.

### Estilo visual

Paleta: #FFFFFF, tinta #111111, gris grafito #3E3E3E para diálogo, grises de UI solo si se simula una app; cero color de marca ni de look; tintas por defecto (azul ultramar #1010A8 + rojo #B80000 en gráfica). Este formato es el séptimo look «nota-blanca». Tipografía: una familia de `assets/fonts/` (Inter Tight 900 mayúsculas para títulos y ejes; Manrope 500-600 para diálogo y UI; etiquetas ≥28 px); nunca Fraunces ni serif ni mezclar la palabra en acento con otra familia. Imágenes: capturas reales que el público reconoce (WhatsApp Business, Sheets, notificación con monto ficticio), recortes PNG del banco real o Soul (una cara), logos e iconos reales, stock recortado como metáfora; sin emojis como iconos, sin fotos virales ajenas, sin ilustración IA genérica ni robot blanco. Composición por subformato: diálogo (bloque izquierda 44-60% del alto), título + gráfica (título arriba, dos columnas), chat (titular-reacción + marco al 85%), perfil (columna de logos + texto), matriz (cruz con flechas, 5-8 fichas por cuadrante, pie en itálica), starter pack (bloque central ≥30%, 10-14 satélites), tira (3 franjas con marco). Acabado hecho a mano con criterio, nítido, sin sombras unificadas ni rejilla perfecta.

### Voz y lo humano

Compadre directo, deadpan, primera persona; dice el chiste como quien ya lo vivió y no lo explica. Toma partido: valida al dueño que ya usa la IA en lo aburrido y pica al que espera el prompt mágico. Humor desde el lado del dueño, con autoburla; los personajes son el contador que no contesta, el sobrino que sabe de compus, la agencia de $30 mil, el WhatsApp a las 11 pm. Nadie humillado; ni autores ni gurús con nombre; la provocación de la matriz se hace con hábitos y herramientas queridos en el cuadrante incómodo. Clichés que se desmontan: «la IA va a quitar empleos», «eso es para empresas grandes», «mi sobrino me lo hace». Español neutro con un regionalismo por pieza («compadre», «la neta»), nunca «wey»; números 1,250.00. Error humano decidido y legible; nunca typos en remate, cifra o palabra clave. Verosimilitud antes que pulido; montos ficticios del «dueño», nunca ingresos de Manuel. Sin emojis en la lámina (MARCA); 0-2 en caption.

### Errores que matan

Explicar el chiste dentro de la imagen; meter barras, kicker, «Desliza» o color de marca; más de 20 palabras en chiste rápido o etiquetas de más de 2 líneas; ilustración IA genérica, robot blanco, emojis 3D o retícula perfecta; cifras reales de la empresa o saldo presentado como propio; humor que humilla o critica personas con nombre; jerga en inglés o de programador; referencias pop que la audiencia no vive; objetos del mapa que no se reconocen; matriz sin favoritos en el cuadrante incómodo; CTA duro dentro de la imagen; logo o marca de agua sobre el chiste; ilegible a 270 px; copiar la pieza sin adaptar ni confesar; error en el remate o la cifra; más de 1 de cada 5 piezas; mezclar rostro real y Soul; pedirle al meme guardados o leads que no da.

### Checklist

- [ ] Dos frases en `notas`: identidad de quien lo manda; a quién valida y a quién pica.
- [ ] Prueba de 3 segundos con alguien de 50 años sin caption.
- [ ] Texto propio dentro del tope del subformato; remate en un renglón o en imagen.
- [ ] Setup arriba, remate abajo o derecha; filas de menor a mayor; starter pack con remate en un satélite.
- [ ] Chat/perfil/notificación: titular-reacción de Manuel con su nombre, sin emojis.
- [ ] Plantilla mental nombrada y una sola variable cambiada.
- [ ] Fondo #FFFFFF plano; cero barras, kicker, chips, «Desliza», halo, paleta ni color de marca.
- [ ] Una familia, 1-3 pesos; título ≥96, ejes ≥56, chat ≥36, etiquetas ≥28; margen 54-76 px.
- [ ] Color solo de objetos o 1-2 tintas por defecto.
- [ ] Ancla legible en `portada-270.jpg`.
- [ ] Interfaz simulada con app real, hora, nombre y fechas que cuadran; montos ficticios del «dueño».
- [ ] Mapa: lista «se reconoce sin leer» sin ningún «no»; 3-5 favoritos en el cuadrante incómodo; cero personas con nombre.
- [ ] Rostro 0 o 1 tipo; nunca foto viral ajena; recorte a la derecha si aplica.
- [ ] Cero emojis en lámina; cero ilustración IA genérica; logos con plan B si se pauta.
- [ ] 1-2 imperfecciones decididas, ninguna en remate, cifra o palabra clave.
- [ ] Firma en texto plano al mismo cuerpo o handle en mapas; sin logo ni eslogan.
- [ ] Humor desde el dueño; nadie humillado; cero anglicismos; regionalismo ≤1.
- [ ] Caption: primera línea ≤125; cuerpo clase/confesión/dato; frase citable; cierre por pregunta o aforismo; 0-2 emojis; 0-3 hashtags.
- [ ] Palabra clave solo con entregable, ≤8 letras, solo en caption; nunca dentro de la imagen.
- [ ] Mecanismo adaptado, no copiado; referencia anotada con shortCode.
- [ ] `metadata.json` con `objetivo` por subformato, KPI `share_rate`, cuenta como 1 de las últimas 5.
- [ ] Nota de motor: hasta que existan `tipo: imagen-unica-meme`, `look: nota-blanca` y los layouts `meme-*`, esta lista es el QA y la pieza se registra con `tipo: contrarian` sin `look`.

### Adaptación a la marca

Punto de vista invertido: Manuel es el dueño; la IA es la que ya hizo el trabajo; la autoburla es sobre él. Siete subformatos listos: (1) diálogo «La IA va a reemplazar a tu gente…» / «Compadre, creo que la estás usando mal.»; (2) chat de WhatsApp Business con captura REAL del asistente que contestó 47 chats y remate «Entendible, buen día»; (3) gráfica honesta «Razones por las que un dueño quiere IA» con recorte de Manuel; (4) matriz «Le sirve al negocio / Le roba tiempo» × «Lo hace simple / Se complica» con 20-25 fichas y 3-5 favoritos en el cuadrante incómodo; (5) starter pack «IA EN TU NEGOCIO (la parte aburrida)» con iconos reales en vez de emojis; (6) tira de 3 viñetas con Manuel del Soul y metáfora propia (el Excel con un error copiado a 200 cotizaciones); (7) perfil intervenido «Este sí es un CV de dueño de negocio» con 4 filas. Firma en texto plano; español neutro; humor que no ofende; palabra clave solo con entregable; medición por `share_rate`. Pendiente de motor: `imagen-unica-meme` y `nota-blanca` en el schema, layouts `meme-*`, rama de QA para 1 lámina, excluir `nota-blanca` de la rotación de `siguiente-look.mjs`.

### Láminas y formato en px

1 (imagen única). Variante puente solo con `saves` y entregable: 5 láminas (la imagen como portada + 4 en el mismo look blanco). 3:4 1080x1440 o 4:5 1080x1350, ambos válidos; nunca 1:1; PNG nítido o JPG q≥90; margen 54-76 px; legible a 270 px.

---

## Formato: carrusel-noticia («Ya pasó, y esto es lo que cambia para tu negocio»)

Dos rutas: (A) lanzamiento o integración, «salió y ya se puede hacer esto»; (B) documento íntegro, «el memo, el guion, las reglas, tal cual». Cinco referencias.

### Cuándo usarlo y cuándo no

Úsalo cuando algo cambió esta semana y le mueve el piso al dueño: salió un modelo o herramienta, dos apps que ya usa se conectaron, o existe un documento real y completo que se puede mostrar íntegro. Ruta A dentro de las 24-48 h del hecho (lo que respalda el corpus; el «caduca en 7 días» es criterio del motor). Ruta B es evergreen. Objetivo `shares` + `comments`; con palabra clave, además leads. Antecedente propio: «Claude ya hace más dinero que todos en la bolsa de New York» (34,882 de alcance, 1,474 guardados).

No cuando la noticia no se traduce a «qué hace el lunes el dueño de una empresa de 10 personas» (clones de Minecraft, guerra de modelos, trading). No cuando el gancho es ajeno y lo que vendes es otra cosa (advertorial). No sin prueba propia ni fuente verificable. No cuando es tutorial, lista u opinión. No cuando el documento contiene cifras vetadas, datos de clientes o nómina. No cuando la única imagen posible es un rostro ajeno o un fotograma.

### Referencias

- DcWBVVoDl1D · @activeprogrammer · 8 láminas, 1,827 / 20 (1.1%): portada híbrida, lámina «el prompt que se usó», giro en la 4; advertorial con pruebas dudosas.
- DbvNSj5guuc · @janbasx · 5 láminas, 1,665 / 2,797 (1.68): URGENTE, antes/después, dolor vs solución con vistas, clase pixelada + CLASE; replicado en capcut-claude (QA 97, sin publicar ni medir).
- DblQtr1GOjn · @passionateincome · 5 láminas, 13,320 / 124 (0.93%): memo íntegro con typo heredado e interlineado 2x; FOMO impersonal.
- Dao-1TiGfdg · @simplyougrow · 10 láminas, 20,182 / 132 (0.65%): sándwich 1-8-1, foto del objeto físico, páginas crudas, cierre clon de la portada.
- DanncceFr0b · @technology · 8 láminas, 13,331 / 234 (1.76%): key visual oficial, plantilla de dos zonas, un caso + un número + un clip; deepfake en el cierre.

### Anatomía

| Pieza | Regla | Evidencia |
|---|---|---|
| Portada partida | REGLA (4/5 + variante). Imagen de reconocimiento en el 50-65% superior; franja oscura (35-50%) con el titular. Variante: foto a sangre con tarjeta oscura. | DcWB, DblQtr, Dao, Dannc; DbvN |
| Reconocimiento del tema en 0.3 s | REGLA (5/5 nombre; 4/5 objeto). Nombre de la herramienta en el titular y su objeto visible (captura, logo en círculo, key visual, folder con el tema escrito). Manuel es la firma, el tema es el reconocimiento. | Dashboard, folder, Tesla, logo Stratton, esfera |
| Titular condensado de 10-24 palabras | REGLA (4/5). Mayúsculas del look, 3-5 líneas, cada línea una unidad de sentido; el motor limita `titulo` a 9: repartir en `titulo` + `subtitulo`. | 15, 24, 11, 13 palabras |
| Acento en 1-4 palabras | REGLA (4/5). Solo las que cargan el resultado; un acento por carrusel; segundo color una vez o nunca. | CLAUDE; STRATTON OAKMONT + GOING VIRAL; GPT-5.6 SOL |
| Swipe explícito en portada, ausente en la última | REGLA (4/5). `pie: Desliza`; `cta-cara` sin barra inferior. | Mano amarilla, SWIPE FOR MORE, pastilla verde |
| Gatillos del titular | REGLA (5/5). Hecho consumado + vigencia + prueba social + exclusividad honesta. MARCA: BRUTAL, INSANE y URGENTE rinden; Manuel las sustituye por decisión de voz. | Los cinco titulares |
| Lámina 2 = prueba sola | REGLA (5/5 prueba; 4/5 sin texto). La captura, el antes/después, la foto del documento, la página 1: 0-30 palabras, sin promesa ni `loop`. | Dashboard, carpeta, memo 1/3, clip, «Así es» |
| El tema escrito dentro de la prueba | REGLA (4/5). Título del dashboard, rótulo del folder, membrete, De/Para. | DcWB, DbvN, Dao, DblQtr |
| Cifras con unidad en el mismo bloque | REGLA (5/5). Cada afirmación viaja con número; decimales solo si son propios; fuente en `pie` (corrección al antipatrón de 5/5). | «14 seconds later», «12-16 vídeos», 1994, 90 MINUTES |
| Prueba social numérica visible | REGLA (4/5). Contadores de vistas, captura del perfil, «going viral». | DbvN L4, DblQtr L5, Dao, Dannc |
| Oscuro para texto, claro para la prueba | REGLA (5/5). Alternancia oscuro → claro → oscuro. | Los cinco |
| Una plantilla constante | REGLA (2/5 + 1 negativa). Dos zonas, documento a sangre o tarjetas: lo que no cambia es la altura del texto. DcWB la varía y se nota. | Dannc, DblQtr, Dao, DbvN |
| Marca propia en portada | NOTA (4/5; 2/5 en todas; 2/5 la quitan del contenido). En la skill: barras superior e inferior. | Wordmarks y monogramas |
| El giro «se ve increíble, pero» | NOTA (1/5) adoptada como MARCA: qué sí hace, qué no, qué exige. Corrige el «hype en láminas, matiz en caption». | DcWB L4; antiejemplo Dannc |
| Antes / Ahora del mismo caso | REGLA (2/5). Ítems paralelos, mismo encuadre; posición libre. | DbvN L2 y L4; Dannc L5 |
| Copiable regalado o retenido | REGLA (3/5 la regalan; 1/5 la esconde). Versión corta en lámina, completa por DM. | DcWB L3, Dao L7, DblQtr; DbvN pixelado |
| Teaser del entregable | REGLA (3/5). Mostrar que hay algo más fuera de alcance, sin FOMO impersonal. | Clase pixelada, «never see this page», waitlist |
| Cierre que cambia de registro | REGLA (4/5; clon exacto 1/5). `cta-cara` hermana de la portada. | Dao L10 clon; Dannc, DblQtr, DbvN |
| CTA con palabra clave y su costo | REGLA por métricas. Sin palabra: 0.65-1.1%; pregunta abierta: 1.76%; palabra clave: 168%. Follow solo como P.D. Trade-off: los sin palabra tienen 7-12x más likes; medir ambas variantes. | Los cinco |
| Densidad variable, idea por línea | REGLA (5/5). ≤12 palabras por línea, cuerpo ≈40-44 px; denso funciona con interlineado 2x. QA: ≤40 palabras en láminas de texto; el documento va como imagen. | Dannc 8-12; DblQtr 110-170 |
| Permanencia | REGLA (4/5). Clips propios o documento que se lee con zoom; el número de láminas lo decide el material. | 2/8, 1/5, 7/8 con video; documentos |
| Crudeza en la prueba, no en el diseño | REGLA (4/5). Captura tal cual, typo del original, foto con celular; portada y cierre pulidos. Las faltas de ortografía de DbvN no se copian. | DcWB, DblQtr, Dao, Dannc |
| Tono | REGLA (4/5 sin humor; 4/5 impersonal; 1/5 segunda persona). Segunda persona en láminas (el único con leads), postura en el caption; la primera persona en lámina es HIPÓTESIS. | DbvN; DblQtr caption |
| Logos de terceros | REGLA (3/5). Reales, pequeños, máximo dos. | Dao 1; DbvN 4 (antiejemplo) |

### Portada

`portada-foto` con scrim o `portada-titulo` con Manuel en `recorte` sobre `panel` + el objeto de la noticia (icono oficial pequeño, captura con nombre legible, documento con título). Titular 10-24 palabras en 3-5 líneas (frase fuerte en `titulo`, resto en `subtitulo`), 1-4 palabras en `*acento*`, fórmulas 4 y 5 de HOOKS-ES. Número en portada opcional (0/5 en el corpus). Gatillos apilados; registro sobrio. `sticker` opcional («Ya se puede», «Documento completo»). Logos reales ≤2. `pie: Desliza` obligatorio. Marca propia en posición fija. Concurso de 3-4 portadas juzgadas a 270 px. Registro emocional: asombro o exclusividad honesta; nunca miedo. Prohibido rostro ajeno, fotograma, deepfake o key visual ajeno como protagonista (por derechos y marca; en el corpus rinden).

### Cuerpo

Lámina 2: prueba sola (`foto-texto` arriba o a sangre), 0-30 palabras, sin promesa ni `loop`, con el tema escrito dentro. Lámina 3: el pedido literal → «40 segundos después» → tres ítems → cifra con fuente. Lámina 4: las cartas sobre la mesa (qué no hace todavía, qué exige). Lámina 5: qué cambia el lunes con un oficio con nombre. Lámina 6: `comparativa` Antes / Desde hoy del mismo caso, ≤3 ítems por lado. Prueba social numérica propia en alguna lámina. Lámina N-1: `cheatsheet` corta (`prompt` o `lista`), ≤70 palabras, sin `loop`; la completa va al DM; teaser del entregable. Ruta B: el documento se MUESTRA fotografiado o escaneado con sus marcas, legible sin zoom; nunca retipografiado (pendiente layout `documento`). Texto: ≤40 palabras, frases ≤12, un `==marcador==`, misma altura en todas. Capturas propias enmarcadas con criterio de miniatura. ≥2 láminas de cuerpo con imagen. Jerga traducida en la misma frase. Clip propio como lámina mixta si existe. Sin fuente no hay cifra.

### Cierre

`cta-cara` hermana de la portada: misma fuente de rostro, Manuel señalando al botón, sello, sin «Desliza». Acción primaria única «Comenta PALABRA»; follow solo como P.D. («Sígueme y revisa tus solicitudes de mensaje»); nunca link en bio, cuenta ajena ni FOMO. Entregable = lo que el carrusel NO dio (paso a paso completo, PDF del documento, prompt entero), existente antes de publicar, con teaser. Palabra ≤8 letras que nombre el entregable (CAPCUT, MEMO, GUION), igual en lámina y caption, conectada en ManyChat. Caption: primera línea ≤125 con el hecho, postura de Manuel en primera persona, fuente o link, todo matiz que la lámina no sostiene, pregunta abierta distinta de la palabra, frase de envío, 3-5 hashtags, ≤2 emojis. Timing: ruta A ≤48 h a las 17:00 CDMX. Medir a 48 h y 7 días comparando con y sin palabra clave.

### Estilo visual

Paleta: look `noticia` (#071B4A radial hacia #143B8F, blanco, acento amarillo #FFD200 en 1-4 palabras del título y 3-4 por lámina); bloques claros solo para la prueba; segundo color una vez o ninguno; sin crema+latón, sin grano por dirección de arte. Tipografía: Archivo Black mayúsculas para display (84-156 px, 3-5 líneas), Manrope ≥38-44 px de cuerpo sin negritas, Space Grotesk 30-38 px para etiquetas; nunca serif; en ruta B la tipografía del documento real. Imágenes por orden: captura propia con el nombre legible; Manuel real o avatar del look (un tipo); foto con celular del objeto físico y escaneos a sangre; logo real ≤2; capturas de prueba social propias; texto puro en copiable. Prohibidos: foto-IA de terceros, rostros ajenos, fotogramas, key visuals ajenos como protagonista, PNG con fondo sólido, imágenes con letras generadas. Composición 3:4: portada partida, interiores con una plantilla constante y texto a la misma altura, margen 80 px, nada crítico en los 140 px inferiores, barras con `serie` y pager. Acabado pulido en portada y cierre, crudo en la prueba; recursos con dosis: `sticker`, `==marcador==`, `duotono`.

### Voz y lo humano

Segunda persona directa en láminas (colega que te pasa el dato); postura en primera persona en el caption; la primera persona en lámina se prueba y se mide. Hecho consumado sin gritar («Ya se puede», «Desde hoy»). Frases cortas, verbo al frente, afirmación + pregunta retórica + respuesta de una línea; romper el esqueleto una vez. Español pan-LATAM («videos», «mensaje», «embudo»). Cero jerga sin traducir. Humor casi ninguno, sobrio y protagonizado por Manuel; nunca partido en guerras de marcas (con la consecuencia asumida: el comentario viene de la palabra o la pregunta). Error humano en la prueba (captura sin retocar, subrayado a mano, typo del original), nunca en el texto del motor. Cultura pop solo compartida y con juicio. La verdad va en la lámina y se repite en el caption. Cifras propias con decimales si están medidas; ajenas redondeadas con fuente; nunca las vetadas. Palabras prohibidas de MI-MARCA fuera. Siempre la pregunta «¿qué hace el lunes el dueño de 10 personas con esto?».

### Errores que matan

Bait-and-switch; prometer en portada lo que las láminas no entregan; hype en láminas y verdad solo en caption; autoridad falsa o comprada como prueba; rostro o imagen ajena en portada; texto denso sin interlineado ni cuerpo grande, capturas ilegibles, frames negros; CTA que regala la conversión (cuenta ajena, link en bio ajeno, FOMO, «te traemos noticias»); palabra sin flujo conectado; promesa inflada («todo automático», «24/7»); faltas de ortografía «para verse humano», alturas de texto que cambian, BUILD por BUILT; más de dos logos o logo ajeno protagonista; jerga de programador y guerras de bandos; promesas de retorno financiero; publicar fuera de las 48 h; retipografiar el documento; glorificar sin juicio a una firma condenada; documento propio con cifras vetadas; citar un carrusel propio no medido como «demostrado»; 1:1, texto en la franja inferior, rostro mezclado.

### Checklist

- [ ] Hecho ≤48 h o documento real y completo; responde «qué hace el lunes el dueño de 10 personas».
- [ ] Cada cifra con fuente en `pie` o propia y medida; ninguna de comunicado pagado o benchmark sin fuente.
- [ ] Portada: tema reconocible en 0.3 s (nombre + objeto), Manuel en situación, franja oscura 35-50% con titular de 10-24 palabras repartido en `titulo` + `subtitulo`, 1-4 en acento, `pie: Desliza`, sello propio, ≤1 sticker; legible a 270 px.
- [ ] Cero rostros ajenos, fotogramas o key visuals a sangre; logos reales ≤2 y pequeños.
- [ ] Lámina 2 = prueba propia sola con el tema escrito dentro, 0-30 palabras, sin promesa ni `loop`.
- [ ] Lámina 3 = pedido literal → «X segundos después» → tres ítems → cifra con unidad.
- [ ] Lámina 4 = cartas sobre la mesa; la verdad en lámina y caption.
- [ ] `comparativa` Antes / Desde hoy del mismo caso, ≤3 ítems por lado.
- [ ] Prueba social numérica propia, sin cifras vetadas.
- [ ] `cheatsheet` corta (`prompt` o `lista`, ≤70 palabras, sin `loop`) + teaser del entregable.
- [ ] Ruta B: páginas REALES fotografiadas o escaneadas, legibles sin zoom, ninguna retipografiada.
- [ ] Texto ≤40 palabras, frases ≤12, un `==marcador==`, misma altura en todas, ≥2 láminas de cuerpo con imagen, prueba legible en miniatura.
- [ ] Jerga traducida en la misma frase; ortografía perfecta en el motor.
- [ ] `cta-cara`: mismo rostro, acción única «Comenta PALABRA», follow solo como P.D., entregable existente fuera del carrusel, palabra ≤8 letras conectada.
- [ ] Caption: primera línea ≤125, postura en primera persona, fuente, matiz, pregunta abierta, P.D. de solicitudes, 3-5 hashtags, ≤2 emojis.
- [ ] Sin palabras prohibidas, cifras vetadas, promesas de retorno ni «todo automático».
- [ ] `formato: 3:4`, look `noticia` o el de la rotación, `tipo: noticia`, `objetivo: [shares, comments]`, `serie`, 5-10 láminas.
- [ ] QA ≥80, checklist visual contando, `publicaría: true` honesto; no citar como probado lo que no tiene `mediciones`.
- [ ] Publicación ≤48 h a las 17:00 CDMX; medir 48 h y 7 d; comparar con y sin palabra clave.

### Adaptación a la marca

El esqueleto sí, el contenido no. Ruta A: «[Herramienta] ya hace [resultado] y dueños de negocio ya lo usan así», 5-8 láminas de un caso + un número + una captura propia, dentro de las 24-48 h. Ruta B con material PROPIO mostrado como documento real: «El memo que le mandé a mi equipo el día que metimos IA», «Las 5 reglas de uso de ChatGPT en mi empresa», «El guion que usan mis cerradores» (sin cifras vetadas); impreso, firmado y fotografiado. Segundo ángulo: «El memo de Musk traducido a un negocio de 20 personas en México». Lámina «el pedido que le hice» traducida al negocio. Giro «en el demo se ve increíble, pero» con Manuel como héroe de su propio caso. Rostro real para sobriedad o avatares pop-art del look `noticia` para llamar la atención, un tipo por carrusel. Prueba social propia (alcance real, WhatsApps sin datos). Ambición de dueño («3 videos a la semana sin depender de nadie»). Actualizar el tipo `noticia` de FORMATOS.md: titular 10-24, L2 sin promesa, L3 pedido + resultado, prueba social, teaser, follow como P.D., ventana 48 h, dos rutas; pendientes layout `documento` y lámina mixta con clip. Conversión: ManyChat con palabra + entregable + P.D., y medir el costo en likes.

### Láminas y formato en px

8 por omisión (portada · prueba · pedido y resultado · cartas sobre la mesa · qué cambia el lunes · antes/desde hoy · copiable + teaser · CTA). Variante captación: 5. Variante documento: 6-10. Evidencia: 8, 5, 5, 10, 8 (mediana 8). Nunca más de 10 (la API acepta 10; arriba de 12, serie). 3:4 1080x1440 (@2x) por decisión del motor; el corpus va 4/5 en 4:5 sin razón de rendimiento; 4:5 solo para A/B declarado; nunca 1:1; portada verificada a 270 px.
---

## Formato: carrusel-lista («Un ítem por lámina»)

N cosas accionables con veredicto de una línea, en la misma retícula, con el eje del veredicto repetido en cada lámina y palabra clave al final. Cuatro referencias.

### Cuándo usarlo y cuándo no

Úsalo cuando el tema son 5 a 10 ítems independientes y accionables (comprar, instalar, ver, copiar el lunes): herramientas con logo, objetos concretos, recursos con nombre exacto, ganchos listos, pares «IA a secas vs IA con tu experiencia». Dos subvariantes: (a) objeto-titular, la imagen reconocible carga el ítem (Db4IK3PmZVj, DaYqCibCD55); (b) ítem-texto, el texto es el ítem y la imagen da unidad (DavhSnZDP4x, DaTPfaFkScW), los de más comentarios. Requiere un eje de veredicto que se repite en cada lámina y, si se quieren comentarios, un entregable extendido para el DM. Es el formato más barato de la skill.

No cuando cada ítem necesita más de una o dos líneas (`guia` o `tutorial`); no para noticia, historia o un solo recurso; no si los ítems no son accionables ni tienen nombre exacto; no cuando el objetivo son comentarios y no hay palabra clave conectada (sin compuerta vive de likes: 9,518 likes / 32 comentarios / cero DMs); no con más de 10 ítems (se parte en serie).

### Referencias

- Db4IK3PmZVj · @boldinvestor · 9,518 / 32 (0.34%): 10 láminas idénticas, póster como titular, eje repetido, barras sin números, sin portada ni cierre ni CTA.
- DavhSnZDP4x · @juanbertorello.ia · 4,320 / 1,649 (38%): hot take + 42 skills en 5 láminas plantilla, numeración continua, mascota por capa, frase-takeaway, CTA con réplica de la caja de comentarios; 10 tarjetas a 22 px.
- DaYqCibCD55 · @zacharyszpak · 2,027 / 1 (0.05%): 5 objetos comprables, uno por lámina, solape objeto-título, razón + golpe; CTA «sígueme».
- DaTPfaFkScW · @waysuccess_ · 3,972 / 268 (6.75%): portada que se entiende sin leer, «misma foto, dos textos» en todas las láminas, etiquetas IA/HUMANO fijas, cierre en tres pasos con MARCA.
- Herencia de la skill (sin evidencia externa): portada a concurso, guardable opcional, `cta-cara`, rotación de looks, QA.

### Anatomía

| Pieza | Regla | Evidencia |
|---|---|---|
| Retícula única en las láminas de ítem | REGLA (4/4). Misma posición de número, título, imagen, razón y pie; cambian solo número, imagen y texto. | Las cuatro |
| Eje del veredicto repetido | REGLA (3/4). Título del eje, etiquetas de columnas o header de bloque en cada lámina; cualquier lámina se entiende sola. `etiqueta_top` o `kicker` fijo. | «FAMA VS VALOR» ×10; IA/HUMANO ×5; «CAPA N» |
| Un ítem por lámina, accionable, nombre exacto | REGLA (3/4 + adaptación 35-60). Comprar, instalar, ver, copiar; palabra exacta que el lector buscaría. DavhSnZDP4x mete 6-10 por lámina y exige zoom. | «modal», «cedar», 10 películas |
| Una imagen por lámina con tratamiento idéntico | REGLA. Objeto-titular: logo real, producto, póster propio al 40-50%. Ítem-texto: personaje con atributo por bloque o misma foto clonada. Nunca la misma imagen en dos láminas seguidas. | Pósters, productos, mascotas, foto clonada |
| Densidad por lámina | REGLA. Título 2-4 palabras; razón 7-12; total ≤20 (objeto) o ≤30 (par comparativo). | Db4IK3PmZVj, DaYqCibCD55, DaTPfaFkScW |
| Fondo idéntico en interiores | REGLA. Portada y cierre pueden cambiarlo; foto de fondo solo con overlay oscuro. | 4/4 interiores; 2/4 cambian en extremos |
| Uno o dos acentos con función fija | REGLA (3/4 usan dos). El segundo cumple una función en TODAS las láminas, no en cuatro de cinco. | Menta + turquesa; terracota + cian; azul + rojo |
| Display grotesca pesada | REGLA (3/4). Mayúsculas opcionales (2/4). Vetos de marca: serif y mono fuera de `prompt`. | Bebas/Anton, Druk, Poppins |
| Portada que se entiende sin leer y desinfla lo obvio | REGLA (4/4). Imagen-argumento + titular de 3-7 palabras con la comparación que más duele. 0/4 usan el rostro del autor. | Póster con Valor en cero; oso; DiCaprio; dos manos |
| Portada y cierre rompen la retícula | REGLA (3/4). Variante: sin portada, la lámina 1 es el ítem 1. | DaYqCibCD55, DavhSnZDP4x, DaTPfaFkScW; Db4IK3PmZVj |
| Lámina 2 = primer ítem | REGLA (4/4). Sin lámina de promesa intermedia. | Las cuatro |
| Numeración continua visible | REGLA para Manuel (2/4). 01…N sin reiniciar, numeral bien escrito; N anunciado en portada. | DavhSnZDP4x; DaTPfaFkScW (numeral al revés) |
| Razón de una línea | RECOMENDACIÓN (2/4). Razón + remate; el veredicto puro también funciona para likes. | DaYqCibCD55; Db4IK3PmZVj sin porqué |
| Frase-takeaway al pie | OPCIONAL (1/4 + skill). `loop` ≤8 palabras sin flecha. | DavhSnZDP4x |
| Orden | REGLA (1/4 + higiene). Abre el más discutible; alternar veredictos; sin evidencia de «la joya al final». | Db4IK3PmZVj |
| CTA con palabra clave y entregable exclusivo | REGLA. Con palabra: 38% y 6.75%; sin ella: 0.34% y 0.05%. | Las cuatro |
| Receta de la lámina CTA | REGLA (del mejor convertidor). Pregunta en display, palabra sola en caja con comillas, réplica dibujada de la caja de comentarios, remate de 3 palabras; moraleja de dos mitades opcional. | DavhSnZDP4x L7; DaTPfaFkScW L7 |
| Caption como segundo gancho | REGLA. Repite casi textual el ítem más polémico; instrucción directa con la palabra (no «¿qué opinan?»); 0-3 hashtags. | DaTPfaFkScW, DavhSnZDP4x; Db4IK3PmZVj 32 comentarios |
| Firma discreta | HIGIENE (2/4). Handle al pie; el que más convirtió no firma. | Db4IK3PmZVj, DaYqCibCD55 |
| Sin flechas de desliza, barras ni viñetas | REGLA (4/4). `pie` vacío en portada. | Las cuatro |
| Escala visual sin números | NOTA. Dos barras con etiqueta y sin cifra; mientras no exista `medidor`, `dato-hero` con palabra-veredicto o `comparativa`. | Db4IK3PmZVj |
| Solape objeto-título | NOTA. Cuesta cero; nunca sobre la razón. | DaYqCibCD55 |
| Misma imagen, dos textos | NOTA. Todas las láminas `comparativa`, títulos fijos, primera palabra del lado bueno en alerta. | DaTPfaFkScW |
| Personaje con atributo por bloque | NOTA. Misma fuente de rostro con un objeto por ítem solo si el tema es «yo lo hago así». | DavhSnZDP4x |

### Portada

Imagen-argumento obligatoria que cuente la comparación sin leer (la herramienta famosa con la utilidad en cero, dos objetos iguales en manos distintas, el objeto aburrido delante del glamoroso); el rostro de Manuel acompaña, no sustituye. Fórmulas HOOKS-ES 1, 8 o 2: «Antes de meterle IA a tu negocio, invierte en *estas 5*», «ChatGPT escribe *horrible*. Estas 7 instrucciones lo arreglan», «Famosas vs *útiles*». 3-7 palabras, una en acento (con `recorte`, ≤6 y ninguna de más de 11 letras). Promesa numérica visible (subtítulo con N, chips o sticker «1 de 7»): preferencia de la cuenta. Portada y cierre rompen la retícula. Provocación amable, nunca miedo. Sin «Desliza» (`pie` vacío). Concurso de 3-4. N de portada = N de ítems = N del caption.

### Cuerpo

Lámina 2 = ítem 1, el más discutible (si QA avisa por `rehook`, se acepta o se etiqueta esa lámina). Láminas `punto-numero` ×N: `numero` 01…, `numero_fantasma` en todas o ninguna, `titulo` 2-4 palabras exactas, `imagen` con tratamiento idéntico (`pos: centro`), `cuerpo` 7-12 palabras, `etiqueta_top` con el eje, `loop` opcional. Subvariante objeto: logo real 512 px, foto recortada con `quitar-fondo.py` o ilustración sin texto; todas con el mismo tratamiento; nunca marca ajena legible. Subvariante ítem-texto: misma foto clonada en `comparativa` o personaje constante; ≥38 px. Cada ítem responde «¿qué hago con esto el lunes?». Orden: el más discutible abre; sin tres veredictos iguales seguidos; sin imagen repetida en láminas consecutivas. Razón como razón + remate; 0 o 1 golpe de humor por carrusel; romper la sintaxis una vez. Cero jerga. Variante ranking con `dato-hero` («Sí», «No», «Meh») sin porcentajes inventados. Variante «IA a secas vs IA con tu experiencia»: todas `comparativa`, títulos fijos, cifra en cada gancho humano (verbo en primera persona + cifra + error + paréntesis que abre loop), cinco giros de negocio. Sin rostro en el cuerpo por omisión. Foto de fondo solo con overlay.

### Cierre

Guardable opcional (0/4 la tienen): solo con N ≥7 o en ítem-texto; `lista` con N ítems + `nota`, ≤70 palabras, «Guarda esto», mismo alto de bloque aunque cambie N. CTA de texto centrado con una sola instrucción: pregunta en display con una palabra en acento, la palabra sola en caja con comillas, réplica dibujada de la caja de comentarios, remate de 3 palabras; en la skill hoy `cta-cara` sin imagen o `texto-pleno` + `boton`; moraleja de dos mitades opcional («La IA redacta. Tú pones la historia.»). Palabra ≤8 letras que nombre el entregable (LISTA, FICHA, LINKS, KIT), igual en botón y caption, conectada antes de publicar. Entregable = lo que no cupo, el porqué extendido, los links, la configuración. Caption: primera línea ≤125 que repite casi textual el ítem más polémico; instrucción con la palabra; 0-3 hashtags; ≤2 emojis. Prohibido «sígueme» como única acción, pregunta genérica o terminar sin cierre. Objetivo `[saves, shares]` (+ `comments` solo con palabra).

### Estilo visual

Paleta: fondo idéntico en interiores + tinta + un acento y, opcional, un segundo con función fija; la evidencia favorece fondo claro (3/4): `guia-rapida` o `recurso` para listas de cosas concretas, `oscuro-tech` para ranking de herramientas de IA, `editorial-mono` para «antes de X». La imagen del ítem es la única mancha de color libre. No portar crema + terracota con marcas de imprenta ni gris + serif (vetos de marca). Tipografía: Inter Tight 900, Archivo Black o Anton según el look; Oswald para el número; Manrope a 50 px para la razón (nunca <38); ≤3 familias; sin serif ni mono. Imágenes: logo real, foto recortada con sombra natural, ilustración `nano_banana_pro` sin texto, misma foto clonada o personaje constante; ninguna repetida en láminas seguidas; cero pósters, fotogramas, capturas ajenas o marcas legibles; una fuente de rostro por carrusel; foto de fondo solo con overlay. Composición: eje arriba, número con fantasma, título, imagen al centro (`punto-numero` + `imagen.pos: centro`, `foto-texto` o `comparativa`), razón abajo, `loop` al pie, handle en la barra; margen 80 px; la imagen puede solapar el título, nunca la razón; portada y CTA rompen la retícula; sin flechas ni barras de progreso. Acabado plano y cuidado; `grano` solo en looks claros; 2-3 recursos de personalidad por carrusel (sticker, marcador, solape); sin marcas de imprenta ni cuadrícula de cuaderno; sin descuidos reales (cursor, «1#», coma faltante, color suelto, foto repetida).

### Voz y lo humano

Curador con criterio que no se justifica de más: veredicto + una razón y sigue («Esto sí lo uso en mi empresa. Esto no.»). Tuteo; primera persona cuando hay experiencia, imperativa en títulos de ítem; español neutro LATAM, nada de voseo ni inglés. Origen honesto como autoridad («No las inventé: son las que uso cada semana en Sinergéticos») y la herramienta propia colada en la lista sin anunciarse. Humor 0 o 1 golpe seco sobre el proceso, nunca sobre una persona. Lo humano lo aportan la voz tajante, el solape objeto-título, el personaje que cambia, el paréntesis de remate; 3/4 deconstrucciones dicen «ninguno deliberado»: nada de typos fabricados. Cultura pop por nombre o gesto, de su generación. Sin emojis en láminas; sin signos de admiración en portada. El mensaje nunca es «la IA no sirve». Palabras prohibidas fuera; cifras solo propias o con fuente; nunca precios en lámina; nunca Luis.

### Errores que matan

Cambiar la retícula entre ítems; terminar sin palabra clave cuando el objetivo incluye comentarios; portada que no se entiende sin leer (rostro sonriendo sobre panel no cuenta ninguna comparación); ítems no accionables ni con nombre exacto; texto <38 px o varios ítems apretados; romper la regla de color a medias o cambiar el fondo entre ítems; repetir imagen en láminas seguidas; material ajeno con dueño; copiar la piel de la referencia; descuidos reales; jerga de programador en nombres de ítem; lámina de promesa antes del ítem 1 o párrafo de porqué; flechas, barras, contadores, viñetas; más de 10 ítems en un carrusel.

### Checklist

- [ ] Formato uniforme en todas las láminas (`sips` da el mismo tamaño).
- [ ] 7 a 12 láminas (portada + 5-10 ítems + CTA; guardable opcional); >10 ítems, serie con el mismo look.
- [ ] Portada: imagen-argumento que cuenta la comparación sin leer; 3-7 palabras; 1 acento; N visible; `pie` vacío; sin «!»; N coherente en portada, ítems y caption.
- [ ] Lámina 2 = ítem 1, el más polémico.
- [ ] Cada ítem: mismo layout, `etiqueta_top` con el eje, `numero` continuo, `titulo` 2-4 palabras exactas, `imagen.src` distinta con mismo tratamiento, `cuerpo` 7-12, total ≤20 (≤30 en comparativa).
- [ ] Imágenes con el mismo tratamiento, sin letras, sin material ajeno; logos reales; fondo con overlay si es foto.
- [ ] Rostro: 0 o 1 fuente; nunca sustituye a la imagen-argumento.
- [ ] 1 acento; segundo color con la misma función en TODAS las láminas; fondo idéntico en interiores.
- [ ] ≤3 familias, sin serif ni mono; cuerpo ≥38, razón 50 px.
- [ ] Orden: el más discutible abre; sin 3 veredictos iguales seguidos; sin imagen repetida consecutiva.
- [ ] Humor 0 o 1; 0 errores fabricados, 0 numerales invertidos, 0 emojis, 0 flechas, 0 barras.
- [ ] Cada título leído en voz alta a un dueño de ferretería de 55 años sin necesidad de explicar.
- [ ] Guardable (si existe): `lista`, ≤70 palabras, «Guarda esto», mismo alto de bloque.
- [ ] CTA: una instrucción, palabra ≤8 letras en caja/botón, misma en cuerpo y caption, `palabra_clave_conectada` y `entregable_existe` verificados.
- [ ] Entregable descrito y NO presente en las láminas.
- [ ] Caption: primera línea repite el ítem más polémico; instrucción con la palabra; 0-3 hashtags; ≤2 emojis; `alt` por lámina.
- [ ] Cifras solo en la variante comparativa con fuente; ningún porcentaje inventado; ninguna cifra vetada.
- [ ] `qa.mjs` con 0 errores; avisos esperados anotados en `notas` (layout repetido con `src` distinta, lámina 2 = ítem 1, sin guardable, sin cifras, sin hashtags o frase de envío).
- [ ] Look de `siguiente-look.mjs` (claro para cosas concretas; `oscuro-tech` para ranking de IA; `editorial-mono` para «antes de X»); nunca Fraunces ni crema+latón/terracota.
- [ ] `objetivo` declarado; `formato` explícito en `carrusel.json`.

### Adaptación a la marca

Series listas: (1) «Famosas vs *útiles*: 7 herramientas de IA para tu negocio» con logos reales, eje «Famosa / Útil», portada con la más famosa y la barra en cero, entregable LISTA; (2) «Antes de meterle IA a tu negocio, invierte en *estas 5*» (lista de clientes en una hoja, WhatsApp Business configurado, proceso de venta escrito, celular con buen micrófono, una hora bloqueada), entregable FICHA; (3) «Lo que ChatGPT escribe de tu negocio vs lo que tu cliente *sí lee*» en 5 giros con `comparativa` y etiquetas «IA / Tú»; (4) «ChatGPT escribe *horrible*. Estas 7 instrucciones lo arreglan» con el ejemplo real en la lámina 2, entregable CONFIG. Primero la imagen-argumento, después si Manuel acompaña. El villano es ChatGPT o «la IA», nunca Claude Code ni una persona; el marco es «IA a secas vs IA con tu experiencia». Voz mexicana ligera, origen honesto, cultura pop por nombre (Don Ramón, El Chavo, Moneyball). Sin errores fabricados. Densidad para 35-60. Look claro por omisión; `pie` vacío. Compuerta y medición con `save_rate` y `share_rate`. Pendientes de motor: layout `medidor`, caja de comentarios dibujada en el CTA, error por `imagen.src` repetida consecutiva, actualizar el tipo `lista` en FORMATOS.md (quitar «el más fuerte al final», N 5-10, guardable opcional, `comparativa` en todo el cuerpo), unificar `formato` por omisión, permitir `pie` vacío sin aviso.

### Láminas y formato en px

8 por omisión: portada + 6 ítems + CTA. Rango 7-12 (5-10 ítems; guardable opcional con N ≥7 o ítem-texto). Las tres referencias con cierre usan 7; Db4IK3PmZVj 10 sin portada ni cierre. Variante sin portada solo si el ítem 1 se reconoce al instante. Declarar `formato` explícito: 3:4 1080x1440 (render 2160x2880) por la cuadrícula del perfil; las cuatro referencias van en 4:5 sin que la proporción explique su rendimiento; 4:5 como A/B declarado; nunca 1:1.
---

## Formato: carrusel-meme-serie («El trono»)

Dos rondas de risa de tribu, dos de prueba, venta afuera. Una sola referencia (n=1): confirmar cuando entren dos posts más.

### Cuándo usarlo y cuándo no

Úsalo cuando el objetivo es alcance y compartidos entre pares, no guardados; cuando existe una jerarquía real y discutible dentro de un tema que la audiencia reconoce SIN LEER (los 8 elementos son logos, íconos o nombres de ≤2 palabras); cuando el meme retrata a la misma tribu que la prueba (dueños de 35-60 que quieren vender más y trabajar menos horas); y cuando hay al menos una captura de WhatsApp PROPIA, con consentimiento escrito, de un alumno contando un resultado concreto. Sirve como pieza fría de una serie con el mismo escenario y la misma pastilla.

No sin prueba real; no cuando el tema exige explicación; no cuando los elementos solo se pueden expresar en frases (ocho frases son una lista disfrazada); no cuando el ranking humillaría al lector en vez de hacerlo reír de sí mismo; no cuando el resultado del alumno toca cifras no publicables o menciona a Luis; no para vender directo en lámina; no como pieza única sin serie (el escenario propio necesita repetirse para construir familiaridad).

### Referencias

- DbdlyYlDYHg · @wallstreetoasis · 4 láminas (2 memes tier list + 2 capturas de Slack) · 3,249 / 4 (0.0012) · venta en caption con link in bio. La deconstrucción no registra fecha, dimensiones, coordenadas ni hora: todo dato de ese tipo aquí es propuesta. Etiquetas: REGLA (se repite dentro del post), NOTA (idiosincrasia), CONTRATO (skill), MARCA, HIPÓTESIS.
- Skill: SKILL.md (originalidad: cero fotogramas ajenos; un solo rostro; logo de tercero nunca protagonista; prohibido link en bio), PSICOLOGIA-VIRALIDAD (jerarquía de CTA: enviar > guardar > palabra clave; logos de otras apps no recomendados), IMAGENES.md (logo real desde App Store; Simple Icons; censurar capturas ANTES de guardarlas en `assets/`, el repo es público), MEDICION.md (diagnóstico a 48 h), MI-MARCA (emojis nunca en láminas: la captura necesita excepción; palabras ≤8 letras; Manuel en portada y CTA: el meme 1 necesita excepción).

### Anatomía

| Pieza | Regla | Evidencia |
|---|---|---|
| Pastilla de título | REGLA. Rectángulo rojo #c00000 redondeado, texto blanco bold ~60 px, 2-3 palabras que nombran la CATEGORÍA con actitud de tribu (arquetipo o autoparodia), no el veredicto; arriba-izquierda sin tapar al rey. | «Finance bro vest», «Slop bowl» |
| Pirámide 1-2-5 sobre figuras en pose | REGLA. Rey sentado (caja grande), dos guardias de pie (medianas), cinco arrodillados en fila (chicas); los logos van SOBRE figuras humanas en esas poses: la pose se lee como estatus. Sin lista escrita, numeración ni flechas. | L1 y L2 misma distribución |
| Contenido reconocible sin leer | REGLA. Logo real, ícono o nombre ≤2 palabras en caja de contraste (blanca por omisión, oscura si el logo es blanco); tamaño por rango; ≤8 elementos y ~12 palabras por lámina. | 16 logos, cero palabras salvo pastilla; Dig Inn en negro |
| Coherencia de tribu entre meme y prueba | REGLA. El meme retrata a la tribu; la prueba muestra a alguien de esa tribu consiguiendo lo que desea. No hace falta que el rey sea el tema de la prueba. | Chalecos y bowls → ofertas en JPM y GS |
| Segunda ronda con el mismo molde | REGLA. Misma pastilla, escenario y pirámide; cambia categoría y elementos; puede saltar de dominio. Exactamente 2 memes en la referencia; sin evidencia sobre 3. | L2 = L1 con otro tema |
| Corte brusco humor → prueba | REGLA. De escenario teñido a blanco plano vacío sin barras ni título. | L2 → L3 |
| Captura de chat como prueba | REGLA. Chat real de la comunidad (WhatsApp para LATAM), centrada, ~20% de aire, cuerpo ≥40 px aunque quede pixelada; 60-70 palabras. | L3 y L4 |
| Censura asimétrica | REGLA. Alumno tapado con rectángulos grises toscos #c8c8c8; fundador visible con foto real (es el aval); hora conservada. | L3 y L4 |
| Subrayado rojo a mano | REGLA. Trazo irregular bajo UNA frase con el resultado concreto. | «accepeted an offer at JPM»; «offer to join GS» |
| Testimonio en dos voces | REGLA. Alumno: la noticia con resultado en sus palabras (gratitud si la puso). Fundador: felicitación corta + UN detalle que sube la credibilidad (esfuerzo del alumno o dificultad del caso). | L3 (esfuerzo), L4 (visa) |
| Escalada en la segunda prueba | REGLA. Firma más grande o dificultad extra; nunca dos pruebas iguales. | JPM → GS + visa |
| Error humano del alumno y del creador | REGLA. Typos intactos, censura tosca, subrayado que se sale, cajas desiguales, captura pixelada: certificado de autenticidad. Límite: pastilla, rey y frase subrayada legibles; sin typos en pastilla ni caption. | «accepeted», «a good news», cajas inconsistentes |
| Sin marca en memes ni pruebas | REGLA. Sin barra, handle ni paginación: parece captura reenviada. CONTRATO: la firma va solo en el CTA que añade la skill. | L1-L4 |
| Densidad | REGLA. Memes 2-3 palabras (tope ~12 con cajas tipográficas); pruebas 60-70 en formato chat. | Medido |
| Venta fuera de las láminas | NOTA adaptada. WSO vende en caption con link in bio, sin pregunta: 0.0012 comentarios/like. Lección: venta fuera + pregunta sobre el ranking. CONTRATO/MARCA: `cta-cara` con palabra clave; link en bio prohibido por decisión de skill. | Caption y métricas |
| Caption en voz de mentor | REGLA parcial. Primera línea seria, 3 consejos de una línea, cierre comercial; 1-2 emojis en total (MARCA). | Caption |
| Escenario del meme | NOTA no portable tal cual. Fotograma anime con derechos y plantilla ya conocida; lo portable es el concepto (jerarquía con figuras) y la repetición para construir familiaridad propia. | L1-L2 |
| Hashtags mixtos | NOTA. Nicho + uno de humor que declara el uso (compartir). | #financebro #memes |

### Portada

La portada ES el meme 1: sin titular de fórmula, subtítulo, chips, «Desliza» ni cara de Manuel (excepción de QA para `tipo: meme-serie` y a MI-MARCA «Manuel en portada»). Pastilla roja con 2-3 palabras de categoría con actitud («Tu WhatsApp» sí; «Cotización de servilleta» daría el veredicto). El rey es lo que se aspira; los arrodillados lo que la mayoría hace hoy. Elementos reconocibles sin leer, tope ~12 palabras. Al menos una posición discutible, ninguna humillante; el arrodillado es una práctica o herramienta. Escenario propio CON figuras en las tres poses, generado sin texto y teñido a UN tono fijo para toda la serie; nunca fotograma ajeno; HIPÓTESIS: probar en frío con 3 personas de 35-60. Logos: caja tipográfica o Simple Icons por omisión, logo a color solo si el nombre no basta; caja oscura si el logo es blanco. Fila inferior fuera de los 140 px inferiores. Pastilla y rey legibles a 270 px. Autoburla compartida, nunca regaño.

### Cuerpo

Lámina 2 = segundo meme con el mismo molde (misma tribu, dominio libre). Dos memes; un tercero solo como A/B declarado. Lámina 3 = corte total: blanco puro, `sin_top`/`sin_bottom`, captura de WhatsApp centrada con ~20% de aire. Captura PROPIA con consentimiento archivado en la capa privada; original sin censurar NUNCA en la carpeta del carrusel; en `assets/` entra censurada; subrayado como overlay SVG irregular por código. No se corrige nada del alumno ni de Manuel: la respuesta de Manuel se SELECCIONA, no se redacta; sus emojis se quedan (excepción a MI-MARCA anotada). Lámina 4 opcional: segunda prueba que escala. Coherencia de tribu. Guardable (CONTRATO, HIPÓTESIS para este formato): el ranking escrito como `lista` con porqué por elemento, kicker «Guarda esto», pregunta «¿A quién pondrías tú en el trono?», después de las pruebas. Todo texto por código salvo la captura declarada `origen: "captura-propia"` (campo de documentación, no llave de QA).

### Cierre

`cta-cara` (CONTRATO) con la cara de Manuel (misma fuente de rostro que en el chat) y UNA acción: «Comenta RANKING y te mando la lista completa por DM». Palabra ≤8 letras que nombre el entregable (RANKING, TRONO, LISTA), igual en lámina y caption, creada en ManyChat antes de publicar; sembrar 5-10 comentarios (MARCA). Entregable NO incluido: ranking completo con criterios + cómo pasar del arrodillado al trono. Caption: primera línea seria ≤125 que contextualiza sin repetir el chiste, 3 consejos de una línea, pregunta sobre el ranking («¿A quién pondrías en el trono? Alguien va a defender el Excel»), frase de envío con destinatario sin cuota, palabra al cierre, 1-2 emojis, 3-5 hashtags en español. Prohibido link en bio y «métete a mi perfil» (decisión de skill y marca). Línea base de comentarios 0.0012 por like: objetivo a medir, no a asumir. Notas de `caption.txt`: música, orden, palabra por conectar, consentimiento archivado, medir primero `share_rate`.

### Estilo visual

Paleta: escenario teñido a UN tono FIJO para toda la serie (propuesta: azul #0044DD aplicado a la imagen, no vía look; `duotono` tiñe con el acento del look que rota y mataría la pastilla en `editorial-mono`); pastilla roja #c00000 con texto blanco fija; cajas blancas #ffffff (o negras si el logo es blanco); pruebas en blanco puro con texto #1d1c1d de WhatsApp, censura #c8c8c8, subrayado #c00000; guardable y CTA con el look rotativo. Tipografía: pastilla en la grotesca bold del look ~60 px (nunca Fraunces); cajas sin logo en grotesca bold 40-48 px; capturas con la tipografía de WhatsApp ampliada a ≥40 px sin retipear. Imágenes: escenario generado con figuras en tres poses, sin texto, reutilizado en toda la serie; elementos como caja tipográfica, Simple Icons o logo real 512 px con el riesgo anotado; captura propia censurada; avatar real de Manuel en el chat; recorte de Manuel en el CTA coherente con el rostro del chat. Composición 3:4: pastilla arriba-izquierda, rey arriba-centro, guardias a media altura, cinco arrodillados en fila con las cajas fuera de los 140 px inferiores, todo a sangre con `sin_top`/`sin_bottom`; pruebas centradas con ~20% de aire; cambio brusco entre L2 y L3 sin transición. Acabado low-fi en meme y prueba (cajas por rango pero no milimétricas, censura tosca, subrayado irregular, captura pixelada); el meme «limpio» es HIPÓTESIS a marcar como A/B; sin grano, sombras ni stickers; firma solo en el CTA.

### Voz y lo humano

Humor de tribu y autoburla compartida: la burla cae sobre la práctica o la herramienta, nunca sobre la edad, la falta de conocimiento técnico ni una persona con nombre; arquetipos sí (el sobrino que sabe de compus). Cero humor negro, cero política; el desacuerdo amistoso activa («¿Canva de guardia? Ni loco»). La pastilla y los elementos llevan la jerga de la tribu del dueño («Servilleta», «El sobrino», «Excel 2009», «Ahorita»), no de insider financiero ni de programador. Cultura pop universal (trono, podio, mesa directiva), nada de anime ni «slop bowl». Error humano deliberado sí, del alumno y del creador, siempre legible; sin typos en pastilla, guardable ni caption. La voz de Manuel en el chat es la real y se selecciona; en el caption «La neta es que…», «Aprendí esto a las malas»; prohibidas gurú, fácil, secreto, disruptivo. Caption en voz de mentor con frases de una línea. «Comunidad», nunca «seguidores».

### Errores que matan

Pulir la captura (corregir typos, quitar emojis, blur profesional, retipear, editar la respuesta de Manuel); fabricar o editar un testimonio o usar una captura ajena; guardar la captura sin censurar en la carpeta del carrusel; escribir el ranking como lista o frases dentro del meme; escenario sin figuras en pose; pastilla de más de 3 palabras, neutra o con el veredicto; ranking sin fricción o que humilla; teñir el escenario con el acento rotativo; giro sin corte estético; frase-resultado sin subrayado o sin número concreto; prueba de otra tribu; cerrar sin pregunta sobre el ranking ni palabra conectada; logos dibujados por IA o de apps como protagonistas sin plan B; texto de la captura <38 px o arrodillados en los 140 px inferiores; mezclar rostro real y Soul; cifras no publicables; producir la serie sin la excepción completa de QA (`tipo: meme-serie`).

### Checklist

- [ ] Pastilla: 2-3 palabras de categoría con actitud, roja con texto blanco, arriba-izquierda, legible a 270 px.
- [ ] Escenario propio con figuras en tres poses, sin texto, teñido al tono fijo de la serie, mismo archivo en toda la serie, probado en frío.
- [ ] Pirámide 1-2-5 completa; cajas por rango con contraste al logo; cada elemento reconocible sin leer; ≤12 palabras; fila inferior fuera de los 140 px.
- [ ] Al menos una posición discutible; ninguna humillante; el arrodillado es práctica o herramienta.
- [ ] Logos: caja tipográfica o Simple Icons por omisión; logo a color solo si el nombre no basta; riesgo anotado en `referencia.md`.
- [ ] Lámina 2 = mismo molde, otra categoría de la misma tribu; dos memes (tercero solo como A/B).
- [ ] Lámina 3 blanco puro, `sin_top`/`sin_bottom`, captura centrada con ~20% de aire, cuerpo ≥40 px.
- [ ] Captura PROPIA de WhatsApp con consentimiento en la capa privada; en `assets/` ya censurada; Manuel visible; hora conservada.
- [ ] Subrayado rojo a mano bajo UNA frase con número, nombre o tiempo; nada reescrito ni recortado.
- [ ] Respuesta de Manuel real y seleccionada; sus emojis se quedan; excepción anotada.
- [ ] Lámina 4 (si hay) escala; la prueba es de un dueño de negocio pequeño que consiguió lo que la tribu quiere.
- [ ] Guardable después de las pruebas: ranking + porqué, «Guarda esto», pregunta del trono.
- [ ] `cta-cara` con palabra ≤8 letras, misma en lámina y caption; entregable no incluido; `entregable_existe` y `palabra_clave_conectada` honestos.
- [ ] Caption: primera línea seria ≤125, 3 consejos, pregunta sobre el ranking, frase de envío, palabra al cierre, 1-2 emojis, 3-5 hashtags en español, sin link en bio ni cebo.
- [ ] Un solo rostro; cero cifras no publicables, precios ni Luis; palabras prohibidas ausentes.
- [ ] Todo texto por código salvo la captura declarada `origen: "captura-propia"` y los logos.
- [ ] 3:4 1080x1440 en todas (alinear FORMATOS.md y README con SKILL.md); QA ≥80 con la excepción `meme-serie` completa.
- [ ] `caption.txt` con notas de música, orden, palabra por conectar, consentimiento, y medición primero por `share_rate` contra la línea base 0.0012.
- [ ] `metadata.json` marca como A/B toda hipótesis (3 memes, meme limpio, guardable, CTA en lámina).

### Adaptación a la marca

Temas del trono con elementos reconocibles sin leer: «Tu WhatsApp» (Claude/ChatGPT configurado en el trono; WhatsApp Business y «Respuestas guardadas» de guardias; «Servilleta», «El sobrino», «11 pm», «Ahorita», «El celular del dueño» arrodillados), «Cómo cotizas», «IA en tu negocio», «Certificados gratis». Las frases completas van a la guardable y al caption. Escenario propio generado con figuras genéricas en tres poses, teñido a un tono fijo, reutilizado en toda la serie, probado en frío. Prueba = WhatsApp de alumnos del Club Sinergético, LEGENDAR·IA o Bootcamp con consentimiento; original en la capa privada; respuesta de Manuel seleccionada. Coherencia de tribu, no de tema. Humor para 35-60: Manuel se incluye entre los arrodillados de antes. Logos con plan B tipográfico. Excepciones a declarar bajo `tipo: meme-serie`: portada sin `titulo`, sin `rehook`, N de 5-7, `sin_bottom` en portada, `sin_top`/`sin_bottom` sobre blanco, Manuel ausente en portada, emojis en la captura, logos en el meme. Pendiente de motor: layouts `meme-jerarquia` y `captura-chat`; mientras, aproximar con `texto-pleno` + `imagen.pos: fondo` y `foto-texto`. Serie «El trono» a las 17:00 CDMX alternada con guías; diagnóstico a 48 h de MEDICION.md: muere en portada → cambia escenario o pastilla; deslizan pero no actúan → cambia prueba o pregunta; comparten pero no comentan → cambia el entregable. Rostro único entre meme, chat y CTA.

### Láminas y formato en px

6 (mínimo 5, máximo 7): meme 1 · meme 2 · prueba WhatsApp 1 · prueba WhatsApp 2 que escala (opcional) · guardable (CONTRATO) · CTA (CONTRATO). La referencia usa 4 y vende en caption. Por debajo del 7-12 de la skill: la excepción `meme-serie` debe cubrirlo. 3:4 1080x1440 en todas (FORMATOS.md y README aún dicen 4:5: alinear antes de producir); la deconstrucción no registra dimensiones de la referencia. Nada crítico en los 140 px inferiores; pastilla dentro del margen de 80 px; si se prueba 4:5 como A/B, todo el carrusel en el mismo formato.
---

## Formato: imagen-unica-tweet («Dato, prueba y respuesta»)

La captura de publicación en tres bloques. Una sola referencia (n=1) y sin imagen local: cada regla lleva etiqueta EVIDENCIA, SKILL o ADAPTACIÓN. Ningún número de la referencia sirve de meta.

### Cuándo usarlo y cuándo no

Úsalo cuando tienes UNA cifra concreta y rara con fuente citable sobre un tema que la audiencia ya conversa esa semana (lanzamiento de un modelo, cierre con el SAT, Buen Fin, cambio de WhatsApp Business), puedes adjuntarle una prueba visual real y tienes una respuesta humana de ≤20 palabras que desinfle la seriedad. Se lee entero sin zoom en 4-5 segundos y cuesta cero producirlo desde una publicación real. Hipótesis sin dato propio: su métrica es envíos. Úsalo como una de las 3-4 versiones de §3b y como pieza táctica sobre un pico; la frecuencia la decide la prueba A/B del primer mes.

No cuando el objetivo es guardados o leads (el carrusel guarda 9x más; la imagen única pierde alcance interanual). No sin fuente. No cuando la «prueba» sería una captura ajena sin crédito o algo retocado. No cuando el chiste necesita explicación o una referencia que un dueño de 50 años en Lima no tiene. No cuando el tema requiere pasos. No si el remate señala al lector desde fuera.

### Referencias

- Da2n5ECth92 · @faillgram · 16-jul-2026 (víspera del estreno de Nolan) · 479,084 / 1,564 (0.33%) · 1440x1920 · captura ampliada de X: dato + lista por banderas + gráfico oscuro con logos IMAX + autor verificado + respuesta con cabecera recortada. Sin dato de compartidos ni guardados.
- Corroboración interna: PSICOLOGIA-VIRALIDAD (imagen única -22% alcance; jerarquía de CTA; asesino #5 capturas ajenas; 3:4 válido; 150 px inferiores; hashtags clasifican, no distribuyen), SKILL.md («sin fuente no hay cifra»; hit ≥3x mediana de alcance), FORMATOS.md `noticia` (7 días), HOOKS-ES (4-7 palabras, máx 9: la referencia lo excede), MI-MARCA §3 y §5.

### Anatomía

| Pieza | Regla | Evidencia |
|---|---|---|
| Bloque 1: gancho con cifra rara | EVIDENCIA. ≤12 palabras con número específico al frente y UNA palabra en mayúsculas; debajo 4-5 ítems de una línea con viñeta-dato (bandera + cifra). Excepción declarada: excede el máximo de 9 de HOOKS-ES. | «Only 41 cinemas on EARTH…» + 5 banderas |
| Bloque 2: prueba oscura adjunta | EVIDENCIA. Imagen oscura a ancho completo con esquinas nativas en el tercio central; el MISMO elemento repetido con distinto recorte; separa setup y remate sin líneas; puede llevar foto real con tono, acento que viene del contenido y logos reales. ADAPTACIÓN: se ADJUNTA a la publicación real; nunca se inserta después. | Gráfico con el fotograma tres veces, logos IMAX |
| Bloque 3: credencial humana real | EVIDENCIA. Avatar real, nombre en negrita, handle gris, insignia SOLO si la cuenta la tiene de verdad. Nunca dibujar insignias. ADAPTACIÓN: variante A tercero citado con cabecera completa + Manuel responde; variante B todo Manuel. | «Andrey Raychtock ✓» |
| Bloque 4: respuesta que desinfla | EVIDENCIA. ≤20 palabras, mismo tamaño que el gancho, minúsculas sin punto, leída como RESPUESTA, con el lector incluido en la burla. Fórmula: «todos sabemos que la forma correcta de X es [lo peor posible]». | «everybody knows that the right way…» |
| Densidad y legibilidad | EVIDENCIA. ~40-50 palabras, ≤12 por frase, 2-3 líneas por bloque, legible sin zoom en 4-5 s. Excepción al ≤40 del QA. SKILL: nada crítico en los 140-150 px inferiores. | ~45 palabras |
| Fondo y acabado crudo | EVIDENCIA. Blanco de la app, negro grafito, cero retoque ni marca de agua; la captura tal cual sale del teléfono (el borroso ligero es rasgo humano). Sin @ ni sello propios. | Gráfico recomprimido; «cero diseño visible» |
| Composición 3:4 vertical | EVIDENCIA. Una columna alineada a la izquierda con márgenes nativos; dato → prueba → fuente → chiste. SKILL: nunca 1:1, no mezclar 4:5 con 3:4. | 1440x1920 |
| Emoji con función | EVIDENCIA (excepción a MI-MARCA). UN emoji cerrando el gancho y banderas como viñeta; nada más. | 🤯 + banderas |
| Timing | EVIDENCIA. Víspera o día del pico; SKILL: ventana de 7 días. | 16-jul, víspera del estreno |
| Autor del remate recortado | NOTA, no se porta. Toda voz visible lleva cabecera completa. | Respuesta sin nombre |
| CTA, hashtags y caption | EVIDENCIA. Sin CTA ni hashtags; la caption de artículo suena a IA. SKILL: palabra clave única en caption y comentario fijado; hashtags opcionales, máximo 5. El 0.33% no prueba que un CTA suba comentarios. | Caption con pregunta retórica |

### Portada

La imagen completa es la portada; el bloque superior decide el frenado. Concurso de 3 ganchos con ángulos distintos (≥16/20). Gancho ≤12 palabras con la cifra rara al frente y UNA palabra en mayúsculas; sin color de acento. Desglose de 4-5 ítems con viñeta-dato. La cifra tiene fuente en la caption o queda [DATO] y no se publica. Tamaño de captura ampliada; verificar en `portada-270.jpg` que la cifra se lee. Registro emocional observado: asombro.

### Cuerpo

Bloque de prueba = imagen oscura a ancho completo en el tercio central, única zona de color. Muestra el MISMO elemento con distinto recorte o estado, con etiquetas pequeñas (la misma cotización a mano y con IA, el mismo WhatsApp antes y después). Solo material real y propio; sin nombres de clientes, teléfonos ni cifras vetadas. Acento de color dominante que venga del contenido real y logos reales pequeños como autoridad (con licencia; cero fotogramas). La imagen se ADJUNTA a la publicación real. Debajo, la credencial: foto real del banco, «Manuel de León», «@manueldeleonmjr»; un solo rostro; sin sello. Si el dato es de un tercero, su cabecera completa aquí y la de Manuel en la respuesta.

### Cierre

Respuesta en el tercio inferior como réplica: ≤20 palabras, minúsculas sin punto, incluyendo al lector («todos sabemos que…», «yo también»). Prueba mental: ¿a quién se lo mandaría un dueño de negocio? Franja inferior de 140-150 px libre. Caption: primera línea ≤125 como segundo gancho; fuente en una línea; link a la publicación original; UNA palabra clave con entregable, la misma en comentario fijado con ManyChat conectado; hashtags opcionales (máx 5); 1-2 emojis; nada de caption tipo artículo. Registro en `historico.json` con `formato: imagen-unica-tweet`, midiendo `share_rate`, `save_rate` y comentarios con palabra sobre alcance a 48 h y 7 días; hit = ≥3x la mediana de alcance de la cuenta.

### Estilo visual

Paleta: blanco #FFFFFF, texto #0F1419, handle #536471, prueba oscura #0B1B1E (o el negro real de la captura), acento que traiga el contenido (verde real de WhatsApp o el color de la herramienta), insignia solo la real de la red. Look propio `captura-publicacion` para la ruta por código (blanco, sin acentos ni kicker). Tipografía: la de la app capturada; en la ruta por código, sans de sistema cercana (Inter, SF Pro, Roboto) sin imitar la interfaz; regular para gancho y remate, bold solo en el nombre; sin serifas ni condensadas. Imágenes: cuatro tipos y ninguno más (captura completa, prueba oscura adjunta con foto real y logos pequeños, avatar real, insignia real); nada de ilustraciones, 3D, Soul ni stickers. Composición 3:4 (1080x1440 por default; la referencia 1440x1920), una columna a la izquierda, tres tercios (gancho + desglose / imagen / credencial + respuesta). Acabado crudo: sin bordes, sombras, degradados ni marcos; la captura tal cual; si al equipo le parece que «le falta algo», está bien.

### Voz y lo humano

Dos voces en choque separadas como publicación y respuesta: la que sabe (cifra, desglose, prueba, asombro) y la que se ríe de todos incluida ella. Variante A: tercero real firma el dato y Manuel responde; variante B: Manuel firma las dos (ambas sin probar). Primera persona, tuteo, verbo al frente («la neta es que…», «aprendí esto a las malas»). Registro casual sí (minúsculas en la respuesta, una MAYÚSCULA de énfasis), error deliberado no. Humor de anticlímax que incluye al lector (hábito compartido, gremio, uno mismo), nunca a un competidor con nombre. Español neutro LATAM; cero jerga de programador; la herramienta nombrada por lo que hace. Jerga de redes con función. La caption también es humana: como si Manuel le contara el dato a un amigo; pasa el filtro de COPY-VOZ-HUMANA.

### Errores que matan

Fabricar, editar o «mejorar» la captura o la prueba; dibujar una insignia; repostear a un tercero sin crédito o recortar su cabecera; cifra vaga o sin fuente; quitar el bloque oscuro o poner el remate arriba; diseñar de más (degradado, marco, sombra, kicker, sticker, logo, pulir hasta parecer render); más de 12 palabras por frase o ~50 en total; remate que necesita explicación o referencia que la audiencia no tiene; remate que señala al lector desde fuera; publicar sin palabra clave en caption ni comentario fijado, con link en bio o dos CTA; publicar fuera del pico; 1:1 o 4:5 mezclado; datos sensibles en la captura.

### Checklist

- [ ] Cifra específica y rara con fuente citable; si no, [DATO] y no se publica.
- [ ] Gancho ≤12 palabras, cifra al frente, UNA mayúscula; ganó un concurso de 3 ángulos con ≥16/20.
- [ ] Desglose de 4-5 ítems de una línea con viñeta-dato.
- [ ] Prueba real y propia adjunta a la publicación, del MISMO elemento con distinto recorte, oscura, con acento del contenido; sin datos sensibles; logos reales pequeños.
- [ ] La imagen oscura ocupa el tercio central y es la única zona de color.
- [ ] Credencial con foto real, nombre en negrita, handle gris; insignia solo si es real.
- [ ] Respuesta ≤20 palabras, minúsculas sin punto, como réplica, con el lector incluido y un destinatario mental claro.
- [ ] ~40-50 palabras, 2-3 líneas por frase, legible en 5 s; nada crítico en los 140-150 px inferiores.
- [ ] Fondo blanco plano, sin degradados, sombras, marcos, stickers, kicker ni logo; captura tal cual; un emoji con función o banderas como dato.
- [ ] Formato 3:4; la cifra se lee en `portada-270.jpg`.
- [ ] La publicación existe en Threads/X y el link va en la caption; si se renderizó por código, el texto es idéntico al publicado.
- [ ] Caption: primera línea ≤125, fuente, UNA palabra clave con entregable fuera de la imagen, hashtags opcionales (≤5), 1-2 emojis; misma palabra en comentario fijado; ManyChat conectado.
- [ ] Filtro de COPY-VOZ-HUMANA en imagen y caption; sin palabras vetadas ni jerga.
- [ ] Publicada en la víspera o el día del pico (ventana máxima 7 días).
- [ ] QA con perfil `imagen-unica-tweet` (gancho 11-12 palabras, ~45 palabras, un emoji, sin CTA ni @ en la imagen) ≥80; registro en `historico.json`.

### Adaptación a la marca

Esqueleto entero con marcadores (nunca publicar sin sustituir): gancho «Solo el [DATO]% de los negocios en MÉXICO cobra con IA», desglose «MX [DATO] · CO [DATO] · AR [DATO] · CL [DATO] · PE [DATO]», prueba: la misma cotización cobrada por WhatsApp con IA y pedida a mano, credencial Manuel de León @manueldeleonmjr, respuesta «y el [100-DATO]% sigue mandando la foto del estado de cuenta por whatsapp». Ruta A (canónica): Manuel publica el texto real en Threads o X CON la imagen adjunta (o cita a un tercero con cabecera completa), se captura y se recorta a 3:4 sin tocar nada más. Ruta B (por código): layout `publicacion` con campos `texto`, `items`, `prueba`, `autor`, `handle`, `avatar`, `verificado` (solo true si es real), `remate`, `fuente_url`; look `captura-publicacion`; QA compara el texto con lo publicado. Picos de conversación del dueño: cierre mensual con el SAT, declaración anual, Buen Fin y Hot Sale, aguinaldos, inicio de año, cambios de WhatsApp Business, lanzamientos de IA en noticias, los lunes. Credibilidad prestada: tercero real citado o la cara de Manuel con sus seguidores y los logos reales de WhatsApp, SAT o Claude dentro de la prueba: cuál rinde más es lo primero que se mide. Humor que se incluye («todos sabemos que la forma correcta de cotizar es en la servilleta»). Registro casual sí, errores no. Prueba A/B del primer mes: variante A, variante B y carrusel corto de 5 con la misma portada; el resultado decide la cuota real.

### Láminas y formato en px

1 lámina; no se añade CTA en lámina (vive en caption y comentario fijado). 3:4 1080x1440 (la referencia 1440x1920, también 3:4). Resolución nativa del teléfono; @2x opcional sin promesa de rendimiento. Márgenes y esquinas nativos de la app. Franja inferior 140-150 px sin texto crítico. Nunca 1:1; 4:5 solo para A/B sin mezclar en la cuadrícula.
---

## Formato: carrusel-historia («Dossier de personaje»)

Perfil documental: «el poderoso que nadie conoce y que ya decide sobre tu negocio». Una referencia (n=1) más la documentación validada de la skill.

### Cuándo usarlo y cuándo no

Úsalo cuando hay un personaje, empresa o institución real, poco conocida por la audiencia (prueba: un dueño de 50 años en Guadalajara no lo reconoce por nombre), que toma decisiones que afectan al dueño: quién decide qué ve tu cliente en Google, quién fabrica los chips de la IA que pagas, quién diseña el dinero digital. Requisitos: 10-12 hechos verificables con fecha y fuente; cargo verificado como vigente (o narrado en pasado con rango de fechas); una cita textual real con foro y año; tres instituciones o marcas conocidas para dimensionar al desconocido; un puente concreto a facturación, efectivo, SAT, cobros por WhatsApp o precio de las herramientas. Objetivo medible: `comments` + `follows` (la referencia solo tiene comentarios medidos: 2,165 con likes ocultos). Guardados y compartidos son hipótesis.

No cuando el personaje es famoso para la audiencia (Musk, Altman). No cuando el hecho central caducó y no se puede narrar en pasado con fecha (el original presenta como actual un cargo terminado un año antes). No sin fuentes ni fotos con licencia. No para experiencias propias con conflicto y resultado (ese es el `historia` clásico). No cuando el único gancho es conspiración o miedo: fue el motor 1 de los comentarios del original y se renuncia a él por MI-MARCA §6 y PSICOLOGIA §1.6, aceptando el costo. No para criticar personas ni política. No cuando el tema no toca IA aplicada o el dinero del negocio.

### Referencias

- DaSqiV8jLQc · @becomeentrepreneurr · 17 láminas 1440x1800 · 2026-07-02 · 2,165 comentarios, likes ocultos, sin datos de guardados ni alcance. Caption real de 4 párrafos con el dato «Mexico's central bank governor» + follow, 0 hashtags. Hechos verificados: la cita del billete de $100 es de un panel del FMI (19-oct-2020, no «2021»); «license to print money… indirectly» sin fuente verificable; Carstens fue gerente general del BIS de dic-2017 al 30-jun-2025, así que «He's the General Manager» en jul-2026 era falso.
- Skill: FORMATOS.md §historia (comments + follows; 8-9 láminas; look bosque o editorial-mono), LAYOUTS.md (límites de `cita`, `dato-hero`, `lista`, `cta-cara`; `foto-texto` e `imagen.pos: arriba` existen en el motor aunque LAYOUTS aún diga «11 layouts»), base.css `.l-foto-texto` (foto a sangre en el 47% superior con degradado, sin tarjeta redondeada), qa.mjs (>40 palabras error; 4 layouts seguidos aviso; >12 láminas aviso), PSICOLOGIA §1 (brecha anclada en lo conocido; watch time top 3; pico 60-70%), HOOKS-ES (4-7 palabras; el look decide la caja), DIRECCION-DE-ARTE §5 (dominante ≥60%; `cita` y `dato-hero` ≤1; `lista` ≤2 solo con N ≥9), IMAGENES §6 (personajes públicos: ni fotos sin licencia ni generados con IA), MI-MARCA §3-§6.

### Anatomía

| Pieza | Regla | Evidencia |
|---|---|---|
| Portada: brecha de identidad en dos cláusulas | REGLA. Superlativo + «el hombre que dirige el banco que manda a los bancos»; en la skill la cláusula 1 va al título (4-7 palabras, una `*acento*`) y la 2 al `subtitulo` ≤12 con nombre y dos puntos. El look decide la caja. | Titular de 19 palabras en 4 líneas + «Meet Agustín Carstens…:» |
| Plantilla interior: foto arriba + texto abajo | REGLA. `foto-texto` con `imagen.pos: arriba`, título ≤6 palabras, `cuerpo` ≤25 en 2-3 frases de una línea, total ≤40; dominante ≥60% pero nunca 4 seguidas. | 15 láminas idénticas de 25-45 palabras |
| Guion dossier en 15 tiempos (se comprime a 10-12) | REGLA. Quién → qué es anclado en 3 conocidas → origen → escalada → carácter por contraste → logros → postura → cita + reacción → te afecta → ejemplo → bajo perfil en paralelo → críticas → cita-remate → síntesis en 3 frases → nombre. | Láminas 2 a 16 en ese orden |
| Ancla en lo conocido | REGLA. La lámina «qué es» nombra tres instituciones que el lector sí conoce y las subordina al personaje. | «Fed, ECB, Bank of Japan… tell the money printers what to do» |
| Negrita con función única | REGLA. `**frase**` solo en frase-etiqueta, citas y nombre del cierre; `*acento*` una por lámina; `==marcador==` uno. | Bold solo en 4 puntos |
| Cita como prueba y detonador | REGLA. Layout `cita` una vez: ≤16 palabras, `autor` «Nombre · foro · año», reacción de una línea en `cuerpo` sin adjetivos de miedo; segunda cita solo verificable y como negrita. | Lámina 9 + «A chilling preview»; lámina 14 sin fuente |
| «Te afecta a ti» + ejemplo | REGLA. Después de la cita, en la segunda mitad; `dato-hero` con cifra o año y ejemplo para un negocio de 10 personas. | Láminas 10-11 |
| Dos toques de carácter | REGLA. Contraste temprano en prosa («no es tu CEO típico») y bajo perfil tardío en paralelo «Sin X. Sin Y. Solo Z.», una sola vez. | Láminas 6 y 12 |
| Aceleradores de swipe | REGLA. Cliffhanger a mitad de idea; `loop` de 3-8 palabras sin flecha ni «…»; puntos suspensivos solo en `cuerpo`, ≤1 por lámina. | Láminas 10, 11, 14, 16 |
| Contrapunto honesto | REGLA. Quién critica y por qué siguen escuchándolo; se describe, no se juzga. | Lámina 13 |
| Síntesis en tres frases + nombre | REGLA. En la `cheatsheet`: título ≤5, subtítulo = 3 frases paralelas, 3 acciones del lunes; el nombre con epíteto en el título del CTA. | Láminas 15-16 |
| Caption dossier de 4 párrafos + tesis | REGLA. Quién es con el dato de identidad más fuerte, qué es, postura, tesis citable; la skill añade primera línea ≤125, pregunta abierta, frase de envío, palabra clave, 3-5 hashtags (el original 0). | Caption real |
| Mecanismo de los comentarios | REGLA con matiz. Tres motores (polémica ideológica, arquetipo del poderoso desconocido, comentarios sobre el físico); se renuncia al conspirativo y se compensa con pregunta abierta. | 2,165 comentarios sin CTA |
| Fondo negro + acento solo en portada y CTA | NOTA. Lo portable: acento una vez por lámina; el look lo da `siguiente-look.mjs`. | #000000 + #3A8FB7 |
| 17 láminas sin numeración ni flecha | NOTA con costo. Apuesta al tiempo de lectura; en la skill >12 es serie; no fusionar dos ideas por lámina; preferir 12 antes que 10. | 17 láminas, ≈520 palabras |
| Fotos de prensa del personaje | NOTA y riesgo. Cambiar de escena en cada lámina sí; la fuente no (IMAGENES §6). | 16 fotos sin acreditar, dos pixeladas |
| Marca consistente | NOTA. Barras superior e inferior idénticas; sin logos sobre las fotos. | Logo «M» que cambia de tamaño |
| CTA de seguir con captura del perfil y FOMO | NOTA, anti-regla. `cta-cara` con una acción y palabra clave; nunca captura ni FOMO. | Lámina 17 |
| Vigencia de los hechos | REGLA nacida de un error. Cargo, cifra y postura vigentes el día de publicar o narrados en pasado con fechas. | «He's the General Manager» un año después |

### Portada

`portada-foto` en 3:4 con `imagen.pos: fondo` y `alinea: abajo`; sin foto con licencia, Manuel como narrador en `recorte` con `panel` y el nombre del personaje en el subtítulo. Título 4-7 palabras con UNA `*acento*` («El banquero más poderoso que *nadie* conoce», «El mexicano que le dice a la *Fed* qué hacer»); la segunda cláusula al subtítulo o al rehook. Subtítulo ≤12 palabras que presenta al personaje y TERMINA EN DOS PUNTOS. Caja y familia las decide el look. Asombro o indignación útil contra un sistema, nunca miedo. Kicker opcional («Dossier», «Los que deciden»); `serie` y `sticker` «1 de 5» si es serie. «Desliza» siempre. Concurso de 3-4 portadas (superlativo vs pregunta; foto/scrim vs recorte + panel), ≥16/20.

### Cuerpo

Esqueleto de 10 (9-12): 1 portada · 2 `rehook` quién es + qué es anclado en 3 conocidas + frase-etiqueta en negrita o marcador, con cargo real con fecha y `loop` · 3 `foto-texto` origen con fecha · 4 `foto-texto` carácter por contraste + logros (en `lista` si N ≥9, o en prosa) · 5 `foto-texto` postura polémica · 6 `cita` con foro y año + reacción ≤15 palabras · 7 `dato-hero` te afecta a ti con ejemplo para un negocio de 10 personas · 8 `foto-texto` paralelo «Sin X. Sin Y. Solo Z.» + contrapunto (+ cita-remate en negrita solo si es verificable) · 9 `cheatsheet` · 10 `cta-cara`. Plantilla dominante `foto-texto` con `imagen.pos: arriba` en ≥60% de las láminas de cuerpo pero nunca 4 seguidas; título ≤6 palabras, `cuerpo` ≤25 en frases de una línea con `\n`, total ≤40. Cada lámina cambia de escena (sede con `soul_location` sin persona, ícono 3D del objeto con transparencia, logo real pequeño; Manuel en una lámina de cuerpo como máximo); ninguna imagen con letras; sin mapas «por código». ≥2 láminas con cifra o año, con fuente en `metadata.fuentes`. `loop` en la lámina 2 y en ≥ mitad de los cuerpos, cumplido en el título siguiente. El paralelo una sola vez; una lámina en primera persona de Manuel. Contrapunto obligatorio y descriptivo; cero «detrás de la cortina», «mueve los hilos», «por encima de la ley».

### Cierre

Lámina 9 `cheatsheet` (`lista`, kicker «Guarda esto»): título ≤5, subtítulo = 3 frases paralelas ≤12, 3 acciones del lunes (≤6 palabras + `nota` ≤8), total ≤70, sin `loop`. Nombre con epíteto en el título del CTA con `*acento*`. Lámina 10 `cta-cara`: rostro de Manuel (misma fuente que la portada), una acción: «¿Quieres el *expediente* completo?» / «Comenta FICHA y te mando el dossier con fuentes por DM» / `boton` «Comenta FICHA». Entregable NO incluido: PDF con línea de tiempo, fuente de cada dato y las 3 acciones ampliadas. Palabra ≤8 letras (FICHA o DOSSIER caben; elegir una), conectada antes de publicar. Cero FOMO, cero captura de perfil. Caption en 4 párrafos: primera línea ≤125 con el dato de identidad («El mexicano que le dice a la Fed qué hacer y del que nadie habla.»), la institución en una frase, postura + tesis citable, pregunta abierta honesta + frase de envío + palabra clave; 3-5 hashtags. `alt` por lámina con el nombre y la palabra del tema; en la cita, foro y fecha completos. Sello junto al @.

### Estilo visual

Paleta: un solo acento en el lote, una vez por lámina en interiores; fondo uniforme; look de `siguiente-look.mjs --tipo historia` (`bosque` o `editorial-mono`; `oscuro-tech` si es IA/chips; `noticia` si sale de un lanzamiento); nunca copiar el negro + azul acero tal cual; nunca Fraunces ni crema+latón. Tipografía: el look decide familia y caja; ninguna condensada como display; portada 4-7 palabras con una `*acento*`; interiores título ≤6 a 92 px, `cuerpo` a 50 px alineado a la izquierda; negrita solo en frase-etiqueta, citas y nombre; cita a 96 px con comillas por CSS; nada <38 px; ≤3 familias. Imágenes: ningún retrato sin licencia explícita ni personaje público generado con IA; en orden: foto con licencia CC BY o press kit con crédito; si no, nombre tipográfico y sede/objeto/logo pequeño; Manuel narrador en portada y CTA (banco real o Soul, una fuente) y en máximo una lámina de cuerpo; ≥2 láminas de cuerpo con imagen; sin fotos pixeladas, capturas de perfiles ajenos ni logos sobre las fotos. Composición: `foto-texto` dominante, `cita` y `dato-hero` rompen la racha, `lista` ≤2; barras superior e inferior idénticas. Acabado limpio tipo expediente: sin sombras ni bordes; `grano` fino solo en looks claros; kicker sello máximo 1 cada 3 láminas («Confidencial» no); sticker máximo 1; zona segura 80 px; 150 px inferiores libres.

### Voz y lo humano

Narrador de documental en la voz de Manuel: tercera persona para el personaje, primera persona para el puente («yo no sabía esto hasta la semana pasada»); el original es voz de página anónima; Manuel rompe el esqueleto UNA vez con un aparte personal. Frases cortas, declarativas, verbo al frente, sin subordinadas; dato duro con consecuencia para el lector, no con insinuación. Adjetivos con medida y verificables («discreto» sí; «siniestro», «escalofriante», «detrás de la cortina» no). Humor una vez como trampolín, solo si es verificable; nunca a costa del físico, la nacionalidad o la edad. Cultura pop que entienda alguien de 50 en Lima («El mago de Oz» sí; «money printer go brrr» no). Cero emojis en láminas, 1-2 en caption; puntos suspensivos ≤1 por lámina y nunca en el `loop`; siglas traducidas en la misma frase (BIS, CBDC). Imperfección deliberada una por carrusel, en el `rehook` o el caption, nunca en `dato-hero`; nunca faltas de ortografía ni fotos pixeladas. Frases de marca: «Esto es lo que nadie te dice», «Ponme atención», «La neta es que…», «Arriba».

### Errores que matan

Elegir un personaje famoso para la audiencia; publicar un cargo caducado como actual; quitar la lámina «te afecta a ti»; cita sin foro y año o segunda cita sin fuente; sin ancla en tres conocidas; estirar a 15-17 láminas o comprimir metiendo dos ideas por lámina; romper la plantilla en cada lámina o repetirla 4 veces seguidas; tono conspiranoico; fotos sin licencia, retrato generado con IA o pixelado; negrita repartida o confundida con el acento; CTA con FOMO o captura del perfil; titular sin nombre en el subtítulo ni dos puntos, o la segunda cláusula metida a fuerza en el título; mezclar fuentes de rostro o meter a Manuel en 5 láminas; dejar el dato de identidad más fuerte (el personaje es mexicano) en el caption y no en la portada.

### Checklist

- [ ] Personaje real, poco conocido por la audiencia, cuya decisión toca IA o dinero del negocio.
- [ ] Cargo, cifras y postura vigentes a la fecha (o en pasado con rango); cada hecho con fuente; citas con foro y año en `autor` y `alt`.
- [ ] Portada: título 4-7 con UNA `*acento*`, subtítulo ≤12 con el nombre terminado en «:», «Desliza», legible a 270 px; concurso ≥16/20.
- [ ] Lámina 2 `rehook`: promesa, cargo con fecha, 3 instituciones conocidas, frase-etiqueta en negrita o marcador, `loop`.
- [ ] 10 láminas (9-12; >12 serie) con el esqueleto completo.
- [ ] `foto-texto` con `imagen.pos: arriba` en ≥60% del cuerpo, nunca 4 seguidas; `cita` y `dato-hero` una vez; `lista` ≤2; título ≤6; `cuerpo` ≤25; total ≤40 (≤70 guardable).
- [ ] ≥2 láminas de cuerpo con imagen; ninguna con letras; ninguna pixelada; logo pequeño y real; sin logos sobre fotos.
- [ ] Ningún retrato sin licencia ni personaje público generado con IA.
- [ ] Una fuente de rostro para Manuel en portada, CTA y máximo una lámina de cuerpo.
- [ ] Cita ≤16 sin comillas escritas, `autor` ≤5, reacción ≤15 sin adjetivos de miedo; segunda cita solo verificable como negrita.
- [ ] «Te afecta a ti» en `dato-hero` después de la cita; contrapunto descriptivo presente.
- [ ] Negrita solo en frase-etiqueta, citas y nombre; `*acento*` ≤1 por lámina; `==marcador==` ≤1.
- [ ] `loop` 3-8 palabras sin «…» ni flecha en lámina 2 y ≥ mitad de cuerpos; puntos suspensivos ≤1 por lámina en `cuerpo`.
- [ ] Un paralelo «Sin X. Sin Y. Solo Z.» como máximo; una lámina en primera persona; una imperfección deliberada como máximo.
- [ ] Cero palabras de conspiración ni prohibidas de MI-MARCA; siglas traducidas; cero emojis en láminas.
- [ ] `cheatsheet`: título ≤5, 3 frases paralelas ≤12, 3 acciones del lunes, ≤70, sin `loop`.
- [ ] `cta-cara`: una acción, palabra ≤8 letras igual en cuerpo, botón y caption, entregable existente fuera del carrusel; nombre con epíteto; cero FOMO ni captura de perfil.
- [ ] Caption en 4 párrafos con dato de identidad, institución, tesis, pregunta abierta + frase de envío + palabra; 3-5 hashtags; fuentes en la nota.
- [ ] `alt` en cada lámina con nombre y palabra del tema.
- [ ] Look de `siguiente-look.mjs --tipo historia`; un acento en el lote; QA ≥80 y checklist visual contando.

### Adaptación a la marca

Cambia el sujeto, no el esqueleto: los que deciden la IA que usa el dueño y no salen en TV (fundador de TSMC, Lisa Su, Arthur Mensch, Dario Amodei, Demis Hassabis; Huang, Musk y Altman no pasan la prueba). El ángulo LATAM que el original dejó en el caption: «El mexicano que le dice a la Fed qué hacer y del que nadie habla» va en la portada. Vigencia antes que brillo: si el cargo terminó, el dossier se reencuadra en pasado. El tema baja a tierra en la lámina 7 (moneda digital → facturación, efectivo y SAT; chips → precio de los planes de IA; modelo → cómo te encuentran en Google y WhatsApp). 3:4 en 10-12 láminas comprimiendo pares sin perder cita, «te afecta» ni síntesis. Voz: tercera persona para el personaje, Manuel en el rehook y en un aparte; humor una vez; siglas traducidas. Imágenes sin riesgo: Manuel narrador, sede con `soul_location`, íconos 3D, logo pequeño, nombre tipográfico; foto del personaje solo con licencia. Tensión permitida: asombro e indignación útil contra un sistema; prohibido conspiración, política, crítica a la persona; el costo se compensa con la pregunta abierta y sembrando comentarios con la palabra en la primera hora. CTA «Comenta FICHA» → dossier PDF con fuentes. Serie natural «Los que deciden la IA» (uno por semana, mismo look declarado como serie, sticker «1 de 5»); medir a 48 h y 7 días; hit si ≥16,000 de alcance. Dónde vive: subtipo `dossier` de `historia` en FORMATOS.md; `LAYOUTS.md` debe documentar `foto-texto` e `imagen.pos: arriba`; qa.mjs podría avisar cuando un `historia` no tiene `cita` ni `dato-hero`.

### Láminas y formato en px

10 (mínimo 9, máximo 12): portada · rehook · origen · carácter + logros · postura · cita · te afecta (dato-hero) · paralelo + contrapunto · guardable · CTA. El original usa 17 en 4:5 apostando al tiempo de lectura; en la skill >12 es serie y >10 se sube a mano. 3:4 1080x1440 (render @2x); todas las láminas en el mismo formato; 4:5 solo para A/B; nunca 1:1; zona segura 80 px; 150 px inferiores libres; portada legible a 270 px. Nota: DIRECCION-DE-ARTE §5.1 sigue diciendo 1080x1350 y hay que actualizarlo.
---

## Cómo elegir el formato

Árbol de decisión corto a partir del tipo de idea. La regla de trabajo sigue vigente: aun con la rama elegida, se renderizan 3-4 portadas en formatos distintos y se elige mirando.

1. **¿Es un dato duro con fuente?**
   - Cabe en una cifra rara con un remate humano y hay un pico de conversación esta semana → `imagen-unica-tweet` (dato, prueba adjunta, credencial, respuesta).
   - Son 5-10 datos comparables con un eje de veredicto → `carrusel-lista` (variante ranking con tres lecturas por fila).
   - Es una confusión entre 2-3 términos que se prueba con pantallas reales → `carrusel-educativo` (pizarrón con evidencia).

2. **¿Es una noticia?**
   - Salió algo en las últimas 48 h y se puede probar con captura propia → `carrusel-noticia` ruta A.
   - Existe un documento real y completo (memo, guion, reglas) → `carrusel-noticia` ruta B (documento íntegro).
   - La noticia es «una herramienta que ya usas no puede X» y hay entregable que funciona tal cual → `reel` (tarjeta de lanzamiento con gate).

3. **¿Es una opinión?**
   - Es un cliché que la audiencia repite y se desmonta en una segunda línea → `imagen-unica-meme` (diálogo).
   - Es un ranking discutible de hábitos o herramientas → `imagen-unica-meme` (matriz 2×2) si buscas debate, o `carrusel-meme-serie` (El trono) si buscas compartidos entre pares y tienes prueba de alumno.
   - Es un hot take contra la herramienta de moda con N arreglos → `carrusel-lista` (portada de choque + numeración continua).

4. **¿Es un tutorial o receta?**
   - Un arreglo con una pieza o tres piezas nombradas y regalo por DM → `reel`.
   - Varios pasos con criterio propio → `guia` o `tutorial` de FORMATOS.md (fuera de este estudio).

5. **¿Es una historia?**
   - De un personaje o institución poco conocida que decide sobre el negocio del lector → `carrusel-historia` (dossier).
   - Propia, con conflicto y resultado → `historia` clásico de FORMATOS.md.

6. **¿Es humor?**
   - Reconocimiento en dos segundos (chat, perfil, gráfica honesta, tira) → `imagen-unica-meme`; objetivo `shares`; máximo 1 de cada 5 piezas.
   - Humor de tribu como puerta a una prueba real → `carrusel-meme-serie`.

Después de la rama: ¿el objetivo es leads? Entonces la pieza necesita palabra clave conectada y entregable fuera de la pieza (educativo, reel, noticia, lista con compuerta). ¿El objetivo es alcance y reenvío? Entonces sin CTA duro y se mide por `share_rate` (memes, tweet). ¿Guardado? Lista concreta, documento íntegro o dossier con checklist del lunes.

---

## Lo que se repite en todos los que funcionaron

1. **Una prueba visible antes que una explicación.** Los posts con más rendimiento muestran la evidencia (captura real, documento fotografiado, el mismo frame antes y después, la tabla) y dejan el argumento para el caption. Evidencia: n1 capturas anotadas, n8 antes/después, n12 memo íntegro, n15 foto de la carpeta, n22 clip por lámina, n6 la wallet como respuesta.

2. **Reconocimiento en menos de un segundo.** Logos reales, interfaces conocidas, plantillas mentales ya aprendidas (chat, perfil, pastel, compass, tier list, tarjeta de lanzamiento) o un rostro/marca famoso hacen el trabajo del copy. Evidencia: n2 y n9 (logos y pósters), n3 y n11 (objetos), n5 y n6 (UI secuestrada), n13 (tier list), n12 y n15 (rostro célebre), n22 (key visual oficial).

3. **La palabra clave decide los comentarios; nada más lo hace.** Los cuatro posts con gate por DM tienen ratios de 0.33, 1.68, 0.38 y 4.18 comentarios por like; los demás quedan entre 0.0005 y 0.017 aunque tengan pregunta abierta o polémica. Evidencia: n1 (CITE), n8 (CLASE), n16 (DISEÑO), n23 (EYES) frente a n9 («¿qué opinan?» 0.34%), n19 («sígueme» 0.05%), n11 (pregunta 0.39%).

4. **Un acento de color con función fija.** Blanco o negro para afirmar, UN color para lo que importa (la palabra del resultado, la cifra, la palabra clave) y el resto del color viene de los objetos. Evidencia: n1 roles blanco/rojo/naranja/verde, n8 rojo para 3-4 palabras, n22 azul solo en el resultado, n6 un bloque azul, n3 y n11 cero color propio.

5. **Una plantilla que se repite y se rompe solo en portada y cierre.** El lector aprende dónde mirar en la lámina 2 y desliza sin esfuerzo; la variación viene de la imagen, no del layout. Evidencia: n9 (10 láminas idénticas), n19, n20, n21 (15 láminas iguales), n22, n16 (retícula 40/60), n15 (sándwich 1-8-1).

6. **Cifras específicas, no redondas ni vagas.** 41 cines, 14 segundos, 2h28 → 40 segundos, 112 mil vistas, 1930, 90 minutos: el número raro frena el scroll y da autoridad; sin fuente, en la marca de Manuel no va. Evidencia: n17, n4, n7, n8, n12, n22, n23.

7. **La imperfección vive en la prueba, no en el diseño.** Typos del original, capturas pixeladas, censura tosca, subrayados torcidos, portadas de tamaños desiguales: certificado de autenticidad. Portada y cierre pulidos. Solo los posts de nicho joven fingen errores en el copy, y eso no se porta. Evidencia: n12 (typo de Musk), n13 («accepeted»), n15 (perforaciones y sello), n6 (recorte tosco), n3 (portadas pixeladas); contraejemplo n8 (tildes omitidas).

8. **La voz humana está en la precisión y la actitud, no en el error fingido.** «About forty seconds», «1.39 MB → 149 KB», la opinión tajante sin justificar, el titular-reacción de 5 palabras, la confesión en el caption («lo vi en otro lado, es sábado»). Ninguno de los posts que convierten usa typos deliberados en el titular. Evidencia: n7, n23, n3, n9, n14, n5.
