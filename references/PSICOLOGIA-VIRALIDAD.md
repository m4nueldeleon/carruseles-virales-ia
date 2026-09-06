# Psicología y mecánica de un carrusel viral (Instagram 2026)

Documento maestro de la skill `carruseles-virales-ia`. Sale de 180 hallazgos (`_investigacion/hallazgos.jsonl`) y de una verificación adversarial del 6-sep-2026. Cada regla lleva su cita `[n]` (sección 13, con fecha y tipo); inferencias y opiniones se marcan; lo no confirmado está en la sección 12 y no se usa como regla.

Caso de referencia: @manueldeleonmjr (~500K seguidores, audiencia 35-60 hispanohablante, negocios e IA); solo cifras públicas de sus posts. Los roles (`portada`, `rehook`, `agitacion`, `cuerpo`, `cheatsheet`, `cta`), el campo `loop` y el índice de viralidad son los de `scripts/qa.mjs` y `FORMATOS.md`. Lo que pide cambiar el motor va en la sección 11.

## 1. Resumen ejecutivo: las 10 reglas que más pesan

1. **La portada abre una brecha concreta y cerrable, anclada en algo que el lector ya conoce.** Número, nombre o resultado en 4-7 palabras, una en acento. Un tema no es una brecha; "el error que cometen 9 de 10 dueños al cotizar" sí [44][45][3].
2. **La lámina 2 es una segunda portada.** Instagram "a menudo" vuelve a mostrar el carrusel a quien no deslizó, abriendo en la segunda pieza. La `rehook` se entiende sola y promete qué te llevas al final [4][5][35].
3. **Diseña para tiempo en pantalla y envíos, no para likes.** Las señales que más pesan son watch time, likes y sends; los sends pesan un poco más con desconocidos. Los comentarios no están en ese top 3 [1][2].
4. **Una idea por lámina, ≤4 elementos, ≤25 palabras de cuerpo.** La memoria de trabajo carga ~4 unidades y un adulto lee 3-4 palabras por segundo; lo que no cabe en 5-7 s se parte en dos láminas [49][32][33][50].
5. **El carrusel es el formato de guardado y el final se recuerda.** 9 veces más guardados que la imagen única; se recuerda el pico y el cierre, no la duración. Pico en la última `cuerpo`, `cheatsheet` como pago, 7-12 láminas [40][35][52].
6. **Alta activación más valor práctico.** Asombro (+30%) e indignación útil (+34%) se reenvían; la tristeza baja el reenvío (-16%); lo útil sube 30%. Nunca abras con lástima ni miedo que paraliza [57][59].
7. **El CTA nombra destinatario y servicio, nunca cuota.** "Mándaselo al socio que cotiza a mano" sí; "comparte con 5" y "comenta SÍ" son cebo. "Comenta PALABRA" es zona gris: una vez, como oferta, nunca como condición [8][10][11][12].
8. **Legible en la miniatura o no existe.** 1080x1350, zona segura 80/60 px, nada crítico en los 150 px inferiores, contraste ≥4.5:1, portada legible a 270 px (el grid 3:4 recorta ~34 px por lado) [26][27][29][25].
9. **100% original.** Desde el 30-abr-2026 la originalidad cubre fotos y carruseles; marca de agua, crédito o recorte no son transformación; logos de otras apps no se recomiendan [13][14][15].
10. **3-5 hashtags de nicho; el alcance por palabras clave.** Tope de 5 desde dic-2025 y "ya no son vía de alcance". La keyword va en portada, primera línea del caption y alt text: los posts públicos se indexan en Google [17][18][19][67][22].

## 2. Cómo rankea Instagram los carruseles en 2026

### Hechos oficiales (Meta o Mosseri, fechados)

- **Qué predice el Feed (2023):** que pases unos segundos en el post, comentes, des like, compartas y toques el perfil. El tiempo en pantalla es señal declarada [3].
- **Top 3 (21-ene-2025):** watch time, likes y sends; mirar watch time promedio, likes por alcance y sends por alcance. Likes "ligeramente" más para seguidores, sends "ligeramente" más para no seguidores. No mencionó comentarios (omisión, no exclusión). Insights no da watch time por carrusel ni las ratios: se calculan a mano [1][2].
- **La tasa manda (may-2026):** importa la interacción sobre vistas; el alcance es consecuencia [7].
- **Segunda oportunidad (oct-2024):** si alguien no desliza, "a menudo" se le vuelve a mostrar avanzando a la segunda pieza; más piezas = más interacciones = "más alcance en promedio". Sin documento escrito ni retractación [4][5].
- **Reels tab:** carruseles con música son elegibles (reiterado jun-2025); elegible no es garantía; la música solo se agrega si el carrusel es 100% fotos [4][6][77].
- **Límites:** 20 elementos desde la app; 10 por Graph API o herramientas que la usen. Por API: JPEG ≤8 MB, aspecto 4:5 a 1.91:1, todas recortadas según la primera imagen, `alt_text` ≤1,000 caracteres [20][21][22].
- **Originalidad (30-abr-2026):** cuentas con contenido mayoritariamente ajeno en un mes dejan de recomendarse a no seguidores; solo cuenta comentario propio, remix o edición sustantiva [13][14].
- **Cebo:** pedir votos, shares, comentarios, etiquetas o likes "para fines distintos a un llamado a la acción específico" reduce distribución (política escrita para Facebook; extrapolación a Instagram) [8][9]. En jun-2024 Instagram dijo (video luego retirado) que no recomienda posts que piden "comentar una palabra, número o emoji"; las preguntas abiertas sí [10]. La política de spam prohíbe exigir interacción para acceder a contenido y premios monetarios por interactuar; no prohíbe un recurso por DM si no es condición [11].
- **No penaliza:** "link en bio"; el logo propio (los ajenos sí, declarado para Reels); las etiquetas "AI info" [16][15][76].
- **Hashtags:** máximo 5; con más, no se publica. "Ya no son vía principal de alcance" [17][18][19].
- **Indexación (10-jul-2025):** posts públicos de cuentas profesionales, carruseles incluidos, en Google y Bing [67].

### Benchmarks (con muestra y fecha)

- **Socialinsider** (35M posts, 2025): engagement por seguidor carrusel 0.55% vs reel 0.52% vs imagen 0.37%; Q2 2026: 0.50 / 0.48 / 0.33. Ventaja real pero marginal; parte de las cifras "2026" son de 2025 reetiquetadas. Cuentas 100K-1M: 98 guardados y 35,370 vistas por carrusel vs 96 y 16,035 en reels; los reels ganan en comentarios (60 vs 40) [35]. Más de 10 láminas alcanza más, sin cifras por tramo [36]. Tasa de guardado: carrusel; de compartido: reel (0.10% vs 0.08%) [37].
- **Buffer** (4M+ posts, 2022 a oct-2024): reel 1.36x más alcance; carrusel 1.12x más interacción que el reel y 2.14x que la imagen [38]. Sobre alcance: carrusel 6.9% vs reel 3.3% vs imagen 4.4%. Dos años de antigüedad: recalibrar con la cuenta [39].
- **Metricool 2026** (24.4M posts): carrusel 9x guardados, +142% alcance, +310% likes, +67% comentarios, +13% compartidos que la imagen única, publicándose 37% menos. Imagen única: -22% alcance, -46% engagement interanual. El reel sigue siendo descubrimiento: >4x interacciones que la imagen, 8.5 s de watch time [40][41].
- **Metricool + HypeAuditor 2025** (700M posts; tramo 50K-500K): carrusel 824 likes y 15 comentarios vs reel 461/13 e imagen 380/6; alcance 12.8K vs 13.7K. En 500K-1M el carrusel gana en todo [42].

**Lectura:** carrusel = profundidad, guardado y DM; reel = descubrimiento. Se juzga por saves, sends y likes sobre alcance, nunca por alcance bruto [1][7][42].

## 3. La psicología del swipe: por qué siguen deslizando

Principio → regla de lámina → rol.

- **Brecha de información (Loewenstein 1994, revisión).** La curiosidad es privación al fijar la atención en un hueco; sigue una U invertida: máxima cuando ya sé bastante y falta poco. → `portada`: brecha con referente concreto, anclada en lo que el lector vive; solo se cierra deslizando [44].
- **La curiosidad se paga con sorpresa (Kang 2009).** Activa la recompensa y mejora el recuerdo semanas después, sobre todo de lo que el sujeto adivinó mal. → `cuerpo`: cada `loop` se cumple con un dato que contradice la conjetura [45].
- **Retomar lo interrumpido (Ghibellini y Meier 2025, 59 publicaciones).** Zeigarnik no replica (ratio 0.99); Ovsiankina sí: lo interrumpido se retoma el 67% de las veces. → `loop`: corta a mitad de una idea ("falta el más caro"), no "sigue deslizando". Explica la segunda oportunidad. Extrapolación desde laboratorio [46][4].
- **Fluidez (Alter y Oppenheimer 2009).** Lo fácil de procesar se juzga más verdadero. → todos: frases ≤12 palabras, tipografía grande, contraste alto [47].
- **Fuente difícil = tarea difícil (Song y Schwarz 2008).** Sube 83% el tiempo estimado y baja la disposición. → `cta` y `pasos`: las láminas más legibles [48].
- **Cuatro unidades (Cowan 2001).** La memoria de trabajo promedia ~4 chunks; agrupar es la vía principal. → ≤4 elementos por lámina; 8 pasos se agrupan en 3-4 fases anunciadas con chips [49].
- **Coherencia y segmentación (Mayer).** Quitar lo extraño (d≈0.86) y segmentar (d≈0.70). → cero decoración sin función; si no cabe legible, son dos láminas [50].
- **Posición serial (Murdock 1962).** Se recuerdan los primeros 3-4 y los últimos. → `rehook` lleva la tesis; las 4-7 llevan pruebas con gancho propio; la `cheatsheet` la repite [51].
- **Pico y final (Alaybek 2022, r = 0.58).** Se recuerda lo más intenso y el cierre; la duración casi no cuenta. → insight más fuerte en la última `cuerpo`; cierre con recompensa [52].
- **Interrupción que persuade (Kupor y Tormala 2015).** Una pausa sube persuasión solo con argumentos sólidos. → layout distinto cada 2-3 láminas antes del argumento fuerte [53].
- **Gradiente de meta (Kivetz 2006).** El esfuerzo acelera cerca de la recompensa. → numeración y `loop` "el último es el más importante" [54].
- **Progreso regalado (Nunes y Drèze 2006).** Dos sellos de regalo subieron el completado de 19% a 34%. → `rehook` entrega ya el primer valor [55].
- **Pie en la puerta (Freedman y Fraser 1966).** Un sí chico multiplica el sí grande (53% vs 22%). → cada swipe es un micro-sí; la palabra clave se pide al final [56].

## 4. La psicología del guardar y del compartir

- **Activación, no valencia (Berger y Milkman 2012; ~7,000 artículos del NYT, email 2008-2009).** +1 DE de enojo sube 34% las odds de reenvío; asombro +30%; ansiedad +21%; tristeza -16%. → `portada` y `dato-hero`: asombro ("un agente lo hace en 4 minutos") o indignación contra un sistema, nunca contra personas [57].
- **Valor práctico (misma fuente).** +30%, igual que el asombro; se invierte en lo blogueado: lo útil viaja por canal privado, lo polémico por el público. → `cheatsheet` completa dentro (el DM es el email de hoy); la opinión que provoca comentarios va en el caption [57].
- **Compartir es gestión de imagen (Berger 2014).** Cinco funciones: impresión, regulación emocional, información, vínculo, persuasión. Se habla de quién se quiere ser. → quien reenvía queda como "el empresario que ya entiende la IA" [58].
- **STEPPS (Berger 2013, marco cualitativo).** Moneda social, disparadores, emoción, visibilidad, valor práctico, historias. → mínimo 4 de 6 (umbral interno); ancla el tema a un momento recurrente ("la próxima vez que cotices por WhatsApp") [59].
- **El receptor decide (NYT 2011; 2,500 compartidores).** 94% evalúa si le sirve al receptor; 68% comparte para definir quién es. → el pedido de envío nombra una persona concreta [60].
- **Identidad consistente (PLoS One 2023).** Se reenvía lo coherente con la identidad propia. → la IA se encuadra en la identidad que ya tienen (dueño, líder), no "techie" [61].
- **Auto-mejora (Frontiers 2025).** Compartir contenido de crecimiento eleva la imagen de quien comparte. → todo carrusel es capacitación o sistema, nunca truco [62].
- **Guardar y enviar son dos psicologías (inferencia).** Guardar es utilidad para el yo futuro; enviar compromete la reputación ahora. → la `cheatsheet` pide el guardado ("Guarda esto"); el envío se pide con destinatario en caption o subtítulo de la guardable; la palabra clave solo en la `cta` [58][12].
- **Datos propios (públicos).** En "5 generaciones" los guardados (3,345) superaron a los likes con 98,609 de alcance [70]. "¿Tú cuándo?" guardó al 5.6% y trajo 334 seguidores [71]. "8 páginas gratuitas" guardó al 7.6% [73]. El número no es condición; la utilidad accionable sí.

## 5. Diseño para móvil: reglas medibles

| Regla | Valor | Fuente |
|---|---|---|
| Lienzo | 1080x1350 (4:5), igual en todas; la primera fija el recorte. 3:4 (1080x1440, alto derivado) es válido desde may-2025 y encaja en el grid; no se mezcla | [22][23][26] |
| Grid del perfil | 3:4 desde ene-2025: un 4:5 pierde ~34 px por lado. Solo la `portada` debe sobrevivir; "Ajustar vista previa" corrige | [24][25] |
| Zona segura | ≥80 px arriba y abajo, ≥60 a los lados; nada crítico en los 150 px inferiores ni 100 superiores. Estimaciones de terceros | [27] |
| Tipografía | La skill exige título ≥84 px, texto ≥38, micro ≥30: más estricto que los 60-90 / 28-36 de las guías, a propósito (audiencia 35-60, miniatura 270 px) | [28] |
| Contraste | ≥4.5:1 en todo texto (el grande pasaría con 3:1), ≥7:1 ideal; aplica a texto en imágenes | [29] |
| Palabras | Portada 4-7 (máx. 9); cuerpo ≤25; lámina ≤40; guardable ≤70; frases ≤12 | [32][33][34] |
| Segundos | ~4 palabras/s (238-278 ppm), ~3 en texto no trivial. Portada 2-3 s = ≤8 palabras; cuerpo 5-7 s = 20-28. Dwell meta ≥60 s en 10-12 láminas (reel: 8.5 s) | [32][33][40] |
| Elementos | ≤4 por lámina; ≤7 en la guardable | [49] |
| Jerarquía | 3 niveles, 2 familias, 4 colores; palabra con información en las 2 primeras del título; bloques largos nunca centrados (patrón F) | [30][63][28] |
| Rostro | Fotos con cara: 38% más likes (1.1M fotos, 2014, fotos sueltas). Rostro real en `portada` ≥25% del alto, ojos en el 60% central, sin título encima | [31] |
| Sangrado | Solo formas o fotos cruzan, nunca texto; asoma ≥120 px. Sin estudio | [69] |
| Marcas de agua | Ninguna de herramientas; logo propio pequeño sí | [15] |
| Exportación | 1080 px exactos, sRGB; JPEG ≤8 MB si va por API; alt text por lámina con la keyword natural | [22][66] |
| Láminas | 7-12 estándar; >10 suma alcance (sin cifras); la finalización cae según blogs sin metodología. 11-14 solo si cada lámina aporta; ≤10 por API | [36][75][21] |

## 6. Anatomía lámina por lámina

**Portada (`portada`).** Brecha concreta, 4-7 palabras, una en acento; subtítulo con número o estructura ("5 tipos. 5 formas de cerrar."); chips que anuncian el recorrido (el lector ve el mapa antes de deslizar); "Desliza" al pie; sensación de incompleto (1 de 5). Keyword literal del tema en el título: el texto en pantalla alimenta búsqueda e indexación [44][49][67]. Nada de "Tips de IA", stock ni logo dominante [63].

**Lámina 2 (`rehook` o `agitacion`).** Segunda portada: reformula la promesa con el dato más fuerte, dice qué te llevas al final, entrega ya el primer valor y cierra con `loop`. Prohibido "como te decía". Abre por la promesa; el costo va después [4][5][55][51].

**Cuerpo (láminas 3 a N-2).** Una idea numerada con dato o comparativa; `loop` en la mitad al menos, cumplido en la siguiente con algo que contradiga la conjetura; layout distinto cada 2-3 láminas; el ítem más fuerte al final [45][53][51][54].

**Pico (última `cuerpo`).** La cifra más fuerte, el antes/después o el error que lo tira todo: el 60-70% del recorrido, lo que se recuerda [52].

**Guardable (`cheatsheet`, N-1).** Todo en una pantalla: lista, pasos, prompt o comparativa, ≤70 palabras, kicker "Guarda esto". Es el valor práctico completo que justifica guardar y reenviar; nada de remitir al link [57][40][16].

**CTA (`cta`, N).** Cara real, mismo sistema visual (un CTA que parece anuncio hunde el guardado), una sola acción: pregunta en el título, "Comenta PLANTILLA y te la mando por DM" como oferta, `boton` con la palabra. El entregable no está en el carrusel. Va al final porque el lector ya lleva 8-10 micro-síes [63][11][56].

## 7. Formatos que más se guardan y comparten, y su mecanismo

| Tipo | Objetivo | Mecanismo | Evidencia |
|---|---|---|---|
| `guia` | saves | Mapa completo en portada, ≤5 categorías, numeración (gradiente de meta), cheatsheet con las N reglas | [49][54][70] |
| `lista` | saves, shares | Lista finita; el ítem más fuerte al final (recencia) | [51][73] |
| `recurso` | shares | Valor práctico + reciprocidad; se reenvía a hijo, socio o empleado | [57][60] |
| `noticia` | shares, comments | "Creías X / ya es Y": asombro y hecho consumado | [57][72] |
| `tutorial` | saves | Pasos legibles (fuente difícil = tarea difícil); resultado y tiempo real en la lámina 2 | [48][55] |
| `contrarian` | shares | Creencia → "No." → alternativa ≤6 palabras; indignación contra un sistema; posiciona al que comparte | [57][58] |
| `historia` | comments, follows | Confesión con arco abierto; vulnerabilidad = reciprocidad; da comentarios, no guardados | [58][60] |
| `comparativa` | shares | Un criterio por lámina, ≤4 por columna; el número que decide como pico | [49][52] |
| `prompt` | saves | Texto copiable completo dentro; el DM entrega la versión en texto | [57][11] |

Lo que no funciona en esta audiencia (datos propios): alcance prestado (chisme tech, humor) trae vistas y casi cero guardados; el contraste sobre meta-contenido de Instagram no interesa a dueños de negocio [71][72]. El carrusel mixto imagen + video rindió 2.33% vs 1.80% en 2020, sin réplica: probar, no asumir [43].

## 8. Caption, hashtags y CTA: qué señal dispara cada uno

- **Primera línea (≤125 caracteres, cifra de terceros).** Segundo gancho con la keyword; nada esencial después del salto [68][66].
- **Cuerpo del caption.** Corto, con lo que las láminas no dicen; los captions largos sin relación con el contenido son baja calidad [65][9].
- **Keywords y alt text.** Búsqueda e indexación leen caption, alt text y texto en pantalla; los hashtags clasifican, no distribuyen. Una keyword principal y 1-2 secundarias, una vez [67][66][19].
- **Hashtags.** 3-5 de nicho al final; más de 5 no se publica. En Metricool 2026 correlacionan con menos vistas (-31.7%) y las preguntas con más comentarios (+203%); correlación, no causa [17][18][41].
- **Jerarquía de CTA.** 1) enviar a alguien (alcance a no seguidores), 2) guardar, 3) comentar la palabra clave (lead). El de envío nombra persona y situación, sin cuota; el de palabra clave va una vez, como oferta [1][12][11]. Las cifras de ManyChat (+156% comentarios) son del proveedor; los comentarios no están en el top 3: la automatización captura leads, no alcance [74][1].
- **Horario.** Publicar cuando la audiencia está activa no sube el alcance por sí solo (Mosseri) y los estudios no coinciden; evita antes de las 8 y después de las 22 hora local; la constancia pesa más que la hora [64].

## 9. Anti-patrones que matan el alcance

1. Cebo explícito: "etiqueta a 3", "comenta SÍ", "dale like si", "comparte con 5" [8][10].
2. Exigir interacción para recibir algo, o premio por interactuar [11].
3. Portada sin promesa: tema vago, stock, logo grande, foto sin titular [63][44].
4. Lámina 2 dependiente de la 1: desperdicia la segunda oportunidad [4].
5. Capturas, plantillas o frases ajenas sin transformación [13][14].
6. Marcas de agua de herramientas [15].
7. Más de 25 palabras de cuerpo, párrafos, fuente decorativa, pastel sobre pastel, texto en los 150 px inferiores [47][48][27][63].
8. Formato 1:1 o ratios mezclados [26][22].
9. Varios CTA compitiendo o un CTA que parece anuncio [63].
10. Promesa que las láminas no cumplen: clickbait para Meta y credibilidad quemada [9].
11. Abrir con tristeza, miedo paralizante o resignación [57].
12. Bloques de hashtags (no se publican) y "link en bio" como razón del post [18][16].
13. Optimizar para likes o alcance bruto en vez de tasas [7][1].

## 10. Rúbrica del índice de viralidad

Hoy `qa.mjs` reparte gancho 24, estructura 41, legibilidad 28 y copy 15 (suma 108, tope 100). La evidencia pide reequilibrar: portada y lámina 2 deciden si el resto existe, y el ranking premia tiempo en pantalla y envíos.

| Familia | v1 | v2 | Por qué |
|---|---|---|---|
| Gancho (portada + rehook) | 24 | 30 | Brecha, "unos segundos" y segunda oportunidad [44][3][4] |
| Estructura (loops, pico, guardable, CTA, láminas) | 41 | 35 | Sigue siendo la mayor: Ovsiankina, pico-final, gradiente, valor práctico [46][52][54][57] |
| Legibilidad | 28 | 20 | Condición necesaria, no diferenciador; ya bloquea por error [47][29] |
| Copy (lista negra, caption, hashtags, cebo) | 15 | 15 | El cebo y la primera línea mueven señales; los hashtags poco [8][19] |

**Criterios nuevos para v2 (medibles por código):**

1. Autonomía de la lámina 2: error con "como te decía", "como vimos", "continúa" [4].
2. `loop` en la lámina 2 (hoy solo cuenta en `cuerpo`) [54].
3. Frase de envío con destinatario ("mándaselo a", "envíaselo a") en caption o subtítulo de la guardable; aviso si falta [1][12][60].
4. Keyword del tema (campo `keyword`) en título de portada, primera línea del caption y `alt` de la portada [67][22].
5. `alt` por lámina; aviso si falta [22][66].
6. ≤4 `items`/`chips`/`pasos` en cuerpo, ≤7 en la guardable [49].
7. Pico: la última `cuerpo` usa `dato-hero`, `comparativa` o `cita`, o trae cifra [52].
8. Frases ≤12 palabras: aviso si el promedio por lámina supera 14 [47][34].
9. Láminas 1-3 ligeras: rehook ≤30 palabras en total [32][75].
10. Cebo ampliado ("comenta sí", "comenta con", "comparte con N", "sígueme y") y "link en bio" reclasificado como CTA que compite, no penalización [8][10][16].
11. Modo API: si `metadata.publicacion` es `api`, N>10 es error [21].
12. Registro emocional (aviso suave): portada con frases de resignación ("ya es tarde") [57].

## 11. Ajustes que esta evidencia pide a la skill

| # | Archivo | Regla actual | Regla propuesta | Fuente |
|---|---|---|---|---|
| 1 | `HOOKS-ES.md` (intro) | "23.8% se va en la primera lámina (Luis López Comunicación)" | Quitar la cifra: sin fuente primaria, no es de Metricool. Dejar "la portada decide" y el dato propio (69% de abandono sin promesa) | [78], §12 |
| 2 | `HOOKS-ES.md` ("La lámina 2 también es una portada") | "Instagram vuelve a mostrar el carrusel" | "a menudo (no siempre) vuelve a mostrar" | [4][5] |
| 3 | `qa.mjs` (CEBO) | "link en bio" se marca como cebo | Aviso como "CTA que compite", no penalización; añadir "comenta sí", "comenta con", "comparte con \d", "comenta el emoji", "sígueme y" | [16][8][10] |
| 4 | `SKILL.md` §4 + `qa.mjs` | Solo "Comenta PALABRA"; no se pide envío | Frase de envío con destinatario en el caption (línea 2-3) o en el `subtitulo` de la guardable; QA v2 avisa si falta | [1][12][60] |
| 5 | `qa.mjs` | `loop` solo en `cuerpo` | Aviso si la lámina 2 no trae `loop` | [54][55] |
| 6 | `qa.mjs` | No mide dependencia de la lámina 2 | Error con "como te decía", "como vimos", "continúa" | [4] |
| 7 | `qa.mjs` + `metadata.json` | N>12 aviso, N>20 error | Si `publicacion == "api"`, N>10 es error; `caption.txt` avisa que 11-20 se suben a mano | [21][20] |
| 8 | `LAYOUTS.md`, `carrusel.json`, `render.mjs` | Sin alt text | Campo `alt` (≤1,000 caracteres, keyword natural); QA avisa si falta; `caption.txt` lo lista para pegar | [22][66][67] |
| 9 | `qa.mjs` (UI) y `FORMATOS.md` | Franja inferior 140 px | 150 px (estimación más conservadora); opcional | [27] |
| 10 | `qa.mjs` | No limita elementos | Aviso si cuerpo >4 `items`/`chips`/`pasos` o guardable >7 | [49] |
| 11 | `SKILL.md` §0, `FORMATOS.md` | "4:5. Nunca 1:1" (3:4 existe sin regla) | 4:5 por omisión; anotar que 3:4 es válido, encaja en el grid y se prueba en A/B sin mezclar | [23][25][26] |
| 12 | `SKILL.md` §8 / `MEDICION.md` | reach, saves, shares, comments | Añadir likes/alcance y sends/alcance (a mano); comparar por tasas. "Nunca likes" se conserva como objetivo, no como métrica | [1][7] |
| 13 | `FORMATOS.md` / `caption.txt` | Sin mención de música | Nota fija: "Al subir, agrega pista de la librería (carrusel 100% fotos) para la pestaña Reels" | [4][6][77] |
| 14 | `SKILL.md` §4 (reglas que QA no mide) | Nada sobre emoción ni originalidad | "La portada activa (asombro o indignación útil), nunca lástima ni miedo que paraliza" y "cero capturas ajenas o plantillas copiadas; toda cita externa lleva ángulo propio" | [57][13][14] |
| 15 | `qa.mjs` (índice) | 24/41/28/15 | 30/35/20/15 y los 12 criterios de §10 | §10 |

No cambian: 40 palabras por lámina y 70 en la guardable, 4-7 de portada, mínimos tipográficos, CTA único con palabra clave, rotación de looks y rango 7-12 láminas. La evidencia sobre >10 láminas y sobre finalización es débil en ambos sentidos: se mide con la cuenta antes de mover el aviso de 12.

## 12. Lo que NO pudimos confirmar y lo descartado

### Descartado en la verificación adversarial

- **[i=131] "23.8% abandona en la primera slide".** La frase existe en el blog sin fuente; Metricool 2026 no publica abandono por lámina y no tiene acceso a esa métrica. Se retira de `HOOKS-ES.md` [78].
- **[i=130] "Carrusel con engagement 0.72%, ~2x alcance y ~4x interacciones vs imagen" (atribuido a Metricool 2026).** El "4x" es de los reels; el 0.72%, el "+1.69% sobre reels", el "+24.76%" y el "76%/75% en 3 días" no están en la fuente pública. Se sostiene: 9x guardados y mejora en las métricas principales [40][41].

### Sin fuente primaria (no se usan como regla)

- Finalización o swipe-through por número de láminas (tablas de Flockx, Reelbase, Adpicto); el único desglose es de 2020 [43].
- "Sends pesan 3-5x más que likes", "1 save = 10 likes", "7-10 slides dan 23% más engagement", "carrusel 10% vs imagen 7% vs reel 6%": solo en blogs; Meta no publica multiplicadores.
- Documento escrito de Meta sobre la segunda oportunidad, OCR del texto en imágenes, tiempo o insights por lámina, caracteres visibles del caption o píxeles que tapa la UI.
- Postura oficial que exima o condene por nombre el "comenta PALABRA y te lo mando por DM".
- Estudio que mida brecha de curiosidad, Zeigarnik o gradiente de meta dentro de carruseles: toda traducción es inferencia.
- Comparativa foto vs ilustración vs tipografía; efecto del sangrado o del indicador "desliza"; rendimiento 3:4 vs 4:5.
- Datos por audiencia hispanohablante o nicho IA/negocios; los creadores hispanos del nicho publican video.
- Memo de Mosseri del 31-dic-2025 ("raw, real human content"): solo en blogs. "Trial carousels": no existen.
- Cifras de Hormozi, Abdaal, Matt Gray, Chris Do, Dan Koe: de pago o autodeclaradas.
- Efecto medido de los clichés de IA en el copy: no se investigó.

Método: parte de la verificación se hizo sin buscador web y con páginas del Centro de ayuda que no devuelven texto. Lo oficial quedó respaldado por fuente primaria o por dos coberturas independientes; donde solo hubo una, se dice.

## 13. Fuentes

1. Mosseri, post sobre señales de ranking, 21-ene-2025. https://www.instagram.com/p/DFFyRp-pINJ/ (oficial)
2. Social Media Today, algorithm insights, 22-ene-2025. https://www.socialmediatoday.com/news/instagram-shares-algorithm-insights-2025/738034/ (reporte)
3. Instagram, "Ranking Explained", 31-may-2023. https://about.instagram.com/blog/announcements/instagram-ranking-explained (oficial)
4. Social Media Today, Mosseri sobre carruseles, 17-oct-2024. https://www.socialmediatoday.com/news/ig-chief-recommends-posting-carousels-improve-reach/730232/ (reporte)
5. Navarra, cita de Mosseri en Threads, 24-oct-2024. https://www.threads.com/@mattnavarra/post/DBgmZcEoiZb (reporte)
6. @creators, carruseles con música en Reels, 20-jun-2025. https://www.threads.com/@creators/post/DLIOdJLKiXw/ (oficial)
7. Social Media Today, engagement rate vs alcance, 26-may-2026. https://www.socialmediatoday.com/news/instagram-engagement-rates-provide-insight-into-reach/ (reporte)
8. Meta Transparency Center, Engagement bait, consultado 6-sep-2026. https://transparency.meta.com/features/approach-to-ranking/content-distribution-guidelines/engagement-bait/ (oficial)
9. Meta Transparency Center, Types of content we demote, jul-2025. https://transparency.meta.com/features/approach-to-ranking/types-of-content-we-demote/ (oficial)
10. Social Media Today, CTAs y alcance, 2-jun-2024. https://www.socialmediatoday.com/news/instagram-certain-ctas-impact-post-reach/717732/ (reporte)
11. Meta, Normas comunitarias: Spam, 27-jun-2024. https://transparency.meta.com/policies/community-standards/spam/ (oficial)
12. Influencer Marketing Hub, sends per reach playbook, 3-mar-2026. https://influencermarketinghub.com/instagram-sends-per-reach-playbook/ (reporte)
13. PetaPixel, políticas contra reposts, 30-abr-2026. https://petapixel.com/2026/04/30/new-instagram-policies-target-reposted-content/ (reporte)
14. Instagram for Creators, "Rewarding original creators", 30-abr-2026. https://creators.instagram.com/blog/rewarding-original-creators-on-instagram (oficial)
15. Social Media Today, logo propio en Reels, 23-oct-2024. https://www.socialmediatoday.com/news/instagram-clarifies-including-your-own-logo-on-a-reel-is-ok/730852/ (reporte)
16. PetaPixel, "link in bio" no afecta, 25-jul-2025. https://petapixel.com/2025/07/25/link-in-bio-rumor-not-true-says-instagram-chief/ (reporte)
17. Social Media Today, límite de hashtags, 18-dic-2025. https://www.socialmediatoday.com/news/instagram-implements-new-limits-on-hashtag-use/808309/ (reporte)
18. Instagram Help Center, 5 etiquetas por publicación. https://help.instagram.com/351460621611097 (oficial)
19. Social Media Today, Mosseri sobre hashtags, 8-abr-2025. https://www.socialmediatoday.com/news/instagram-chief-answers-creator-questions/744813/ (reporte)
20. Instagram Help Center, hasta 20 fotos o videos. https://help.instagram.com/269314186824048/ (oficial)
21. Meta for Developers, Content Publishing (API v25.0). https://developers.facebook.com/docs/instagram-platform/content-publishing/ (oficial)
22. Meta for Developers, POST /{ig-user-id}/media. https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media/ (oficial)
23. PetaPixel, soporte 3:4, 29-may-2025. https://petapixel.com/2025/05/29/instagram-finally-adds-support-for-34-aspect-ratio-photos/ (reporte)
24. Kapwing, grid 3:4, act. 2026. https://www.kapwing.com/resources/instagrams-new-grid-layout-size-and-dimensions-2025/ (reporte)
25. Boderia, grid cheat sheet, 31-ago-2026. https://www.boderia.io/insights/expert-cheat-sheet-to-instagram-grid-update-2025 (reporte)
26. Oktopost, grid y 4:5, 28-ene-2025. https://www.oktopost.com/blog/instagram-changed-grid-layout-heres-everything-know-far/ (reporte)
27. Veeso, safe zone, 5-ago-2026. https://veeso.ai/blog/instagram-carousel-safe-zone-guide (reporte)
28. Contentdrips, tamaño y tipografía, 27-ago-2026. https://contentdrips.com/blog/2026/05/instagram-carousel-size-format/ (opinión)
29. W3C, WCAG 2.2 SC 1.4.3. https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html (estándar oficial)
30. Nielsen Norman Group, patrón F, rev. 19-ago-2026. https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/ (estudio)
31. Georgia Tech/Yahoo Labs, rostros en Instagram, CHI 2014. https://news.gatech.edu/news/2014/03/20/face-it-instagram-pictures-faces-are-more-popular (estudio)
32. Brysbaert, velocidad de lectura, JML 2019. https://www.sciencedirect.com/science/article/abs/pii/S0749596X19300786 (estudio)
33. Trauzettel-Klosinski y Dietz, IReST, IOVS 2012. https://pubmed.ncbi.nlm.nih.gov/22661485/ (estudio)
34. Nielsen Norman Group, lectura en móvil, dic-2016. https://www.nngroup.com/articles/mobile-content/ (estudio)
35. Socialinsider, Instagram Benchmarks 2026 (35M posts), 20-feb-2026. https://www.socialinsider.io/social-media-benchmarks/instagram (estudio)
36. Socialinsider, carruseles, 9-ene-2026. https://www.socialinsider.io/blog/instagram-carousel/ (estudio)
37. Socialinsider, Engagement Report (15M posts), oct-2025 a mar-2026. https://www.socialinsider.io/social-media-benchmarks/instagram-engagement-report (estudio)
38. Buffer, alcance y engagement (4M+ posts), 23-oct-2024. https://buffer.com/resources/instagram-reach-engagement-analysis/ (estudio)
39. Buffer, mejor formato, 19-mar-2026. https://buffer.com/resources/data-best-content-format-social-media/ (estudio)
40. Metricool, Instagram Study 2026 (24.4M posts), 16-jun-2026. https://metricool.com/press-release-instagram-study-2026/ (estudio)
41. Reason.Why, estudio Metricool 2026, 17-jun-2026. https://www.reasonwhy.es/actualidad/estudio-instagram-metricool-2026 (reporte)
42. Metricool + HypeAuditor, Content Playbook 2025 (700M posts). https://metricool.com/wp-content/uploads/Instagram-Content-Playbook-2025.pdf (estudio)
43. YouGov / Socialinsider, 10 slides (22M posts), 31-ago-2020. https://yougov.com/articles/31680-carousel-posts-using-all-10-slides-instagram-have- (estudio histórico)
44. Loewenstein, "The psychology of curiosity", Psychological Bulletin, 1994. https://www.cmu.edu/dietrich/sds/docs/loewenstein/PsychofCuriosity.pdf (revisión teórica)
45. Kang et al., "The wick in the candle of learning", Psychological Science, 2009. https://pubmed.ncbi.nlm.nih.gov/19619181/ (estudio)
46. Ghibellini y Meier, meta-análisis Zeigarnik/Ovsiankina, 1-jul-2025. https://www.nature.com/articles/s41599-025-05000-w (estudio)
47. Alter y Oppenheimer, fluidez, PSPR 2009. https://api.crossref.org/works/10.1177/1088868309341564 (estudio)
48. Song y Schwarz, "If it's hard to read, it's hard to do", 2008. https://pubmed.ncbi.nlm.nih.gov/19000208/ (estudio)
49. Cowan, "The magical number 4", BBS 2001. https://memory.psych.missouri.edu/assets/doc/articles/2001/cowan-bbs-2001.pdf (estudio)
50. Mayer, principios de aprendizaje multimedia, 2008. https://www.researchgate.net/publication/23478495_Applying_the_Science_of_Learning_Evidence-Based_Principles_for_the_Design_of_Multimedia_Instruction (estudio)
51. Murdock, efecto de posición serial, 1962. https://www.researchgate.net/publication/232580580_The_serial_position_effect_of_free_recall (estudio)
52. Alaybek et al., meta-análisis pico-final, OBHDP 2022. https://www.sciencedirect.com/science/article/abs/pii/S0749597822000334 (estudio)
53. Kupor y Tormala, "Persuasion, interrupted", JCR 2015. https://academic.oup.com/jcr/article-abstract/42/2/300/1817845 (estudio)
54. Kivetz, Urminsky y Zheng, goal-gradient, JMR 2006. https://home.uchicago.edu/ourminsky/Goal-Gradient_Illusionary_Goal_Progress.pdf (estudio)
55. Nunes y Drèze, endowed progress, JCR 2006. https://papers.ssrn.com/sol3/papers.cfm?abstract_id=991962 (estudio)
56. Freedman y Fraser, foot-in-the-door, JPSP 1966. https://pubmed.ncbi.nlm.nih.gov/5969145/ (estudio)
57. Berger y Milkman, "What makes online content viral?", JMR 2012. https://jonahberger.com/wp-content/uploads/2013/02/ViralityB.pdf (estudio)
58. Berger, revisión de boca a boca, JCP 2014. https://faculty.wharton.upenn.edu/wp-content/uploads/2014/12/WOM-Review.pdf (estudio)
59. Knowledge at Wharton, Berger sobre STEPPS, 13-mar-2013. https://knowledge.wharton.upenn.edu/article/contagious-jonah-berger-on-why-things-catch-on/ (reporte)
60. NYT Customer Insight Group, "The Psychology of Sharing" (2011), vía Contently, 24-feb-2012. https://contently.com/2012/02/24/psychology-of-sharing/ (estudio)
61. PLoS One, retuits e identidad, 2023. https://pmc.ncbi.nlm.nih.gov/articles/PMC10202284/ (estudio)
62. Frontiers in Psychology, compartir auto-mejora, 20-oct-2025. https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2025.1666105/full (estudio)
63. Adpicto, carousel best practices 2026, may-2026. https://www.adpicto.com/en/blog/instagram-carousel-best-practices-2026 (opinión)
64. Hootsuite, best time to post (1M+ posts), jul-2026. https://blog.hootsuite.com/best-time-to-post-on-instagram/ (reporte)
65. Later, longitud del caption, 24-jun-2025. https://later.com/blog/instagram-caption-length/ (reporte)
66. Later, Instagram SEO, 1-may-2026. https://later.com/blog/instagram-seo/ (reporte)
67. PPC Land, indexación en Google, 10-jul-2025. https://ppc.land/instagram-content-becomes-searchable-on-google-starting-july-10/ (reporte)
68. Sendible, límite de caracteres, 2025-2026. https://www.sendible.com/insights/instagram-character-limit (reporte)
69. Zaps.design, carrusel sangrado, 29-abr-2026. https://zaps.design/blog/seamless-instagram-carousel-guide (opinión)
70. @manueldeleonmjr, "5 generaciones", 22-jul-2026 (98,609 alcance, 3,345 guardados). https://www.instagram.com/p/DbG9shnluCa/ (dato propio público)
71. @manueldeleonmjr, "¿Tú cuándo?", 1-jul-2026 (54,866 alcance, 3,086 guardados). https://www.instagram.com/p/DaQvR0elr8k/ (dato propio público)
72. @manueldeleonmjr, "Wall Street. Ya entró", 18-may-2026 (34,882 alcance, 1,474 guardados). https://www.instagram.com/p/DYfyFPOEXso/ (dato propio público)
73. @manueldeleonmjr, "8 páginas gratuitas", 13-jul-2026 (12,055 alcance, 921 guardados). https://www.instagram.com/p/DawGaYQlYZt/ (dato propio público)
74. ManyChat, comment-to-DM guide, 17-jun-2026. https://manychat.com/blog/instagram-quick-automation-comment-to-dm-guide/ (opinión, proveedor)
75. Flockx, carruseles 2026 (tabla sin metodología). https://flockx.io/blog/instagram-carousels-2026 (opinión)
76. Meta Newsroom, etiquetado de contenido IA, sep-2024. https://about.fb.com/news/2024/04/metas-approach-to-labeling-ai-generated-content-and-manipulated-media/ (oficial)
77. Instagram Help Center, música en publicación con varias fotos. https://help.instagram.com/1223433768344104/ (oficial)
78. Luis López Comunicación, captions por slide, 18-may-2026 (cifra 23.8% refutada). https://www.luislopezcomunicacion.es/blog/carruseles-instagram-captions-por-slide.html (reporte)
