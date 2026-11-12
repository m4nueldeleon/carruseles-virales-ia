# LECCIONES · Carruseles Virales IA

Bitácora de lo que se aprendió usando la skill: qué pasó → qué se aprendió → qué regla cambió y en qué
archivo. La más nueva arriba. Las correcciones del usuario se escriben en el momento en el archivo de
`references/` que corresponde (SKILL.md §9); aquí queda el registro de qué cambió y por qué.

## 12-nov-2026 · Las escenas generadas con IA tampoco enseñan el pantalón
- **Qué pasó:** al revisar los 24 carruseles programados, «Las 5 etapas para construir un negocio» (sale el 2-dic) traía
  dos escenas realistas generadas con IA con Manuel de cuerpo entero: sentado en el Eames con la laptop en la pierna y en
  el avión con el celular en el regazo. No eran fotos de la sesión, pero el pantalón se veía igual. Manuel: «hay que
  rehacerlo».
- **Qué se aprendió:** la regla no es de la carpeta de fotos, es de lo que se ve: de la cintura para arriba también
  cuando la imagen es generada. Con el encuadre a la cintura la cara sale al doble de tamaño (420 px contra 179) y el
  parecido medido no empeora (0.41–0.42, igual que sus fotos reales entre sí).
- **Qué cambió:** láminas 01 y 04 rehechas (las anteriores en `_antes-2026-11-12-con-pantalon/` del carrusel);
  `DIRECCION-DE-ARTE.md` § «Fotos de estudio», punto de escenas generadas; prompt del agente diario.

## 11-nov-2026 · De la sesión de estudio solo el recorte sin pantalón (el agente lo enseñaba)
- **Qué pasó:** Manuel: «siempre que vayas a utilizar esas fotos, solo permite que des las fotos después del recorte para
  que no se vean los pantalones». Al revisar, el agente diario cortaba sus 23 recortes «a la cintura» desde
  `03-recortes-png/` (sentado, el pantalón gris asoma arriba de esa línea) y su contexto llevaba las 19 JPG del ciclorama
  como «fondos y momentos». El banco de la skill tenía esas JPG y recortes de cuerpo completo.
- **Qué se aprendió:** la regla del 4-nov estaba escrita en `DIRECCION-DE-ARTE.md`, pero los scripts que arman el banco
  seguían usando la carpeta vieja: una regla que solo vive en la prosa no frena a un pipeline.
- **Qué cambió:** `banco_curado.py` toma `05-sin-pantalon/` (sin la 248, que corta arriba de la barbilla);
  `instalar-mini.sh` ya no copia las JPG de estudio y limpia las viejas; `al_banco_carruseles.py` solo escribe el
  recorte sin pantalón; las 19 JPG y los recortes viejos quedaron en `Carruseles/assets/fotos/_solo-para-recorte-no-usar/`;
  prompts `versionista.md` y `ajuste.md` («tela gris o beige debajo de la camiseta = pantalón: no pasa»);
  `DIRECCION-DE-ARTE.md` § «Fotos de estudio»; candado global `~/.claude/scripts/hooks/fotos-solo-recorte.js`.

## 5-nov-2026 · Cuerpo con diagramas y portada amarillista
- **Qué pasó:** el agente diario entregó el carrusel de Anthropic con tres comparativas de chats seguidas y el de
  noticias con una portada tibia. Manuel pidió las láminas 2-5 «más creativas, con mejor enfoque explicativo, diagramas»
  y el gancho «más amarillista y llamativo».
- **Qué se aprendió:** una comparativa dice qué hacer; un diagrama explica por qué. Y leer la fuente completa evita
  errores: el blog de Anthropic desaconseja dar ejemplos en el manual, así que el cierre dejó de decir «un ejemplo real»
  y pasó a «lo que ya te funcionó» (referencias ricas sí, ejemplos en el prompt no).
- **Qué cambió:** `DIRECCION-DE-ARTE.md` § «Láminas que explican y portadas que frenan»; prompt del agente diario.

## 4-nov-2026 (noche, 3) · Tweets: Pixar con mundos distintos gana a pizarrón
- **Qué pasó:** Manuel pidió las dos versiones del carrusel de tweets (escenas Pixar y Manuel dibujado con pizarrón) y
  que yo eligiera la más cool. Elegí Pixar: cada lámina es otro mundo (calle, carrera en el cielo, fábrica, oficina,
  tienda); el pizarrón repite la misma pared y el mismo pizarrón en las 5, y ya lo usa el de reacciones.
- **Regla:** el pizarrón sirve cuando la idea se dibuja (excusas, conceptos); cuando la frase es una situación, gana
  la escena que la actúa en su propio lugar.

## 4-nov-2026 (noche, 2) · Le encantaron las animaciones; tuits con escena; piel con color
- **Qué pasó:** Manuel: «el primero me encantó de las animaciones» (Manuel dibujado con pizarrón), «lo que pasó la
  última semana igual» (Pixar al mando de logos reales), Canva «más color a la piel», tuits «hay que ver algo cool».
- **Qué cambió:** `DIRECCION-DE-ARTE.md` § «Lo que Manuel corrigió…» puntos 8–10; `componer-recorte.sh` con piel
  cálida; tuits rehechos con una escena Pixar por frase.

## 4-nov-2026 (noche) · Sin glow; Manuel dibujado con pizarrón; logos reales con Manuel al mando
- **Qué pasó:** Manuel: el halo de los recortes «se ve muy chafa, como hecho con Canva»; el de reacciones «más como
  muñequito de Manuel dibujado con pizarrón»; en el de IA «los íconos y marcas reales y cómo Manuel controla eso».
  Le gustó Canva. Programó pastelería (5-nov), WhatsApp (6-nov) e IA (7-nov) a las 17:00.
- **Qué cambió:** `scripts/componer-recorte.sh` (light wrap, sombra, color igualado, sin glow) y
  `DIRECCION-DE-ARTE.md` § «Lo que Manuel corrigió…» puntos 6–7 y § «Fotos de estudio».

## 4-nov-2026 (tarde, 3) · Revisión de los 6 de prueba: punch, fondos, imagen que nombra el tema
- **Qué pasó:** Manuel revisó los 6 (reacciones, pastelería, WhatsApp, IA de la semana, tuits, Canva): reacciones con
  mucho texto y fondos genéricos; WhatsApp sin nada de WhatsApp; Canva poco parecido al original; pastelería sí, con
  más pares y más variedad. «Aprende de todo eso».
- **Qué cambió:** `DIRECCION-DE-ARTE.md` § «Lo que Manuel corrigió al ver 6 carruseles de prueba»; scripts nuevos
  `scripts/integrar-recorte.sh` y `scripts/circulo.sh`; prompt del agente diario.

## 4-nov-2026 (tarde, 2) · Ciclorama nunca; recortes que nacen de algún lado
- **Qué pasó:** los carruseles de prueba usaron fotos de la sesión de estudio con la cortina blanca a sangre (tuits y
  una escena) y recortes que flotaban con el banco y las piernas a la vista. Manuel: «No quiero que NUNCA se vean las
  fotos del ciclorama blanco, solo eran para el recorte» y «que mis fotos entiendas de dónde nace el recorte… edítalas,
  ponles efectos».
- **Qué cambió:** `DIRECCION-DE-ARTE.md` § «Fotos de estudio: solo recortes, y bien integrados»; prompt del agente
  diario; memoria del banco de fotos.

## 4-nov-2026 (tarde) · «Que no todos sean iguales todos los slides»
- **Qué pasó:** de 6 carruseles de prueba (uno por formato del estudio 30k), en 4 todas las láminas tenían la misma
  composición (mismo fondo, mismo recorte en el mismo lugar, misma tarjeta). Manuel: «que no todos sean iguales todos
  los slides, si no es el formato, eso desconecta».
- **Qué se aprendió:** «plantilla fija» es el hilo, no la composición. Se repite solo lo que el formato exige.
- **Qué cambió:** `DIRECCION-DE-ARTE.md` § «Que no todas las láminas se vean iguales», regla 7 en
  `ESTUDIO-30K-VIRALES.md` §9 y el prompt del agente diario (`agente-carruseles/prompts/versionista.md`).

## 4-nov-2026 · Estudio de 50 carruseles de más de 30,000 likes
- **Qué pasó:** Manuel pidió 50 carruseles >30k divididos por formato y temática, y saber dónde usan animación, fotos
  reales, efectos y qué colores y por qué, «para que te autoentrenes». Se barrieron ~170 cuentas con Apify (4.47 USD
  las 68 nuevas), se eligieron 50 (18 del nicho, 32 de cualquier tema) y cinco agentes con visión los fichó con un
  esquema cerrado; los conteos los hace `contar.py`.
- **Qué se aprendió:** arriba de 30k manda la fama (fotos sin texto de NASA, Nike, F1); en el nicho la portada lleva
  gancho escrito (~15 palabras) y texto a la izquierda. El video nunca es adorno: prueba cercanía, escala, reacción o
  voz, casi siempre desde la lámina 2. Los efectos señalan, no adornan (31 de 50 sin efectos). 3D tipo Pixar: 1 de 50;
  el avatar sirve como personaje fijo, la prueba va real. El cambio de paleta marca el giro o la venta.
- **Qué cambió:** `references/ESTUDIO-30K-VIRALES.md` (nuevo), lectura obligada en SKILL.md paso 3, y moldes nuevos en
  el prompt del agente diario (`agente-carruseles/prompts/versionista.md`). Datos en
  `Carruseles/_entrenamiento/estudio-2026-11-04-30k/`. Trampa: hosts viejos del CDN de IG (`*.fna.fbcdn.net`) a veces
  no resuelven; cambiar el host por `scontent.cdninstagram.com` con la misma ruta funciona.

## 3-nov-2026 (noche) · El agente diario pide y recibe recursos reales (plantilla v2)
- **Qué pasó:** el agente de carruseles seguía haciendo texto sobre fotos desenfocadas. Se le dio el mismo
  repertorio que los dos carruseles hechos a mano del día (Gates contra Musk en mundo Pixar con capturas reales;
  «dueño peligroso» con fotos reales y comparativas con chat). Ensayo en el mini: 6 láminas en mundo Pixar
  (escena fija de una panadería de noche, 3 comparativas con chat de ejemplo, lista con el avatar, cierre con el
  avatar), 2 ilustraciones (5.5 créditos), pasó la revisión a la primera; 11 min, 1.77 USD de Claude.
- **Qué se aprendió:** el modelo pide y el pipeline hace: con `recursos.json` el versionista no necesita navegar ni
  generar (sin WebFetch, sin llaves), y la segunda llamada corta («ajuste», ~0.5 USD) que mira recursos y render
  preliminar es la que acomoda posiciones. Lo que no se puede medir no se le deja al gusto del modelo: «ninguna
  lámina de puro texto» y «un solo estilo de Manuel» ahora son reglas de la revisión automática (el fondo
  desenfocado no cuenta como recurso). Un personaje cortado a las rodillas que flota se ve roto: va pegado abajo.
  Un tema de contenido no pide capturas; las capturas entran cuando el tema es noticia o herramienta.
- **Qué cambió:** `agente-carruseles/`: `lib/recursos.py` y `lib/capturar.mjs` (nuevos: URL solo públicas, capturas
  a 2x, Higgsfield cuenta creator con tope de 12 imágenes y 40 créditos al día y caché de prompts),
  `lib/version.py` (layouts v2, revisión nueva, recursos + ajuste), `lib/entrega.py` (empaca capturas, elementos,
  retratos y comparativas), `prompts/versionista.md` (plantilla v2, reglas del 3-nov y formatos del estudio),
  `prompts/ajuste.md` (nuevo), `banco_curado.py` (23 recortes de estudio a la cintura + avatar Pixar al banco del
  mini), `config.json` «recursos», pruebas y README.

## 3-nov-2026 (tarde) · Estudio de 50 carruseles de más de 10,000 likes
- **Qué pasó:** Manuel pidió investigar ~50 carruseles de más de 10k likes para entender por qué pide capturas, muñecos,
  avatares, comparativas y consistencia. Se bajaron 558 carruseles de 105 cuentas grandes (Apify, 4.29 USD), se eligieron
  50 variados de 24 cuentas y cinco agentes con visión llenaron un `analisis.json` por post.
- **Qué se aprendió:** el patrón más fuerte es la plantilla fija donde cambia una sola cosa (eso es la consistencia que
  pide); la prueba es real (fotos, capturas de apps y tuits); portada de una idea visual con ≤ 15 palabras; comparar
  dispara comentarios; el detalle se señala; el cierre entrega algo. Texto a la izquierda en 27 de 50. En 3:4 las
  cuentas grandes rinden igual o mejor que en 4:5.
- **Qué cambió:** `references/ESTUDIO-50-VIRALES.md` (nuevo), plantilla con layout `tuit` (sus frases como tuits sobre
  su foto) y `circulos`, `CAMPOS.md`, `SKILL.md` fase 0, `DIRECCION-DE-ARTE.md` §7 corregido; agente diario:
  `contexto/PLANTILLA.md` y `prompts/versionista.md`.

## 3-nov-2026 · Carruseles con contexto visual, 4:5 y texto alineado
- **Qué pasó:** Manuel revisó los 3 del agente diario: le gustó el tema Gates contra Musk pero no la ejecución
  («textos desalineados», «mal orden de textos» en el cierre, «no me gusta la estética», «los tamaños no son los
  correctos»); la lámina 3 del de «dueño peligroso» con «mucho texto» pedía comparativas, antes/después y ejemplos; y
  exigió capturas reales de internet, muñecos 3D/Pixar, avatar suyo y fotos nuevas «para que la gente tenga contexto».
  Pidió además estudiar ~50 carruseles de más de 10,000 likes y autoentrenar la skill.
- **Qué se aprendió:** en el radar del nicho, 80 % de los carruseles y los 8 que pasaron 10k son 4:5; en 558 carruseles de
  cuentas grandes el 3:4 rinde igual o mejor (DIRECCION-DE-ARTE §7): el tamaño no es causal. Manuel pidió consistencia:
  el carrusel en mundo Pixar no cierra con su foto real, y el sello girado se lee desacomodado. La
  lámina de texto sobre fondo desenfocado es la que Manuel llama «la mitad»: cada lámina necesita un recurso que dé
  contexto. Una escena con un personaje que engaña no debe llevar las referencias del avatar de Manuel.
- **Qué cambió:** plantilla `templates/tematico-fotos/` v2 (4:5, layouts `escena`, `capturas`, `comparativa` con chat
  de ejemplo, `cierre` nuevo, `elementos` y `capturas` en cualquier lámina; la v1 en `_v1-3x4/`), `CAMPOS.md`,
  `references/DIRECCION-DE-ARTE.md` §«Carrusel con contexto visual» y §7, `SKILL.md` (formato 4:5, capturas reales con
  fuente, par avatar + persona real). Agente diario: `agente-carruseles/contexto/PLANTILLA.md`.

## 2-nov-2026 · Remix de un post viral ajeno (Antonelli campeón)
- **Qué pasó:** Manuel mandó dos posts de @f1 (Antonelli de niño con Max y con Lewis; el podio en el que los dos lo
  cargan; 2018 junto a un Mercedes y 2026 encima del suyo) y pidió un carrusel «con las fotos reales» sobre «todo gran
  logro empieza porque alguien te inspiró», con un cierre para etiquetar a quien te inspira. Lo aprobó y se publicó el
  mismo día. Después pidió que la skill sepa «inspirarse de otros carruseles», en una sola skill.
- **Qué se aprendió:** el pasado en foto impresa y el presente a sangre cuentan la historia sin texto; el segundo post
  dio la mejor lámina (antes y después); el sello del podio tapaba la cara del campeón (se bajó junto al titular);
  «ayer» caduca: «el domingo» aguanta la semana; las fotos ajenas van con crédito y con aviso de derechos;
  `referencia.py` con `APIFY_TOKEN` baja el post completo (dueño, likes, láminas) sin abrir navegador.
- **Qué cambió:** `references/REMIX-VIRAL.md` (nuevo), `templates/tematico-fotos/` (plantilla, `render.mjs` y
  `ejemplo.json`; reproduce las láminas publicadas), `SKILL.md` (descripción con disparadores nuevos, §1 y tabla de
  pedidos, versión 1.2).

## 1-nov-2026 (cierre) · Aprobado: el carrusel temático
- **Qué pasó:** la v3 temática (mundo Frankenstein, cuadros del video, miniatura en el cierre, sin plantilla) fue la
  primera que Manuel aprobó: «estos carruseles sí me gustaron», y pidió entender por qué conviene para futuros videos.
- **Qué se aprendió:** un QA de 95 no predijo nada: le gustó la versión que el motor no puede calificar. Lo que le
  gustó es metáfora + identidad + prueba real + hueco hacia el video, sin señales de IA.
- **Qué cambió:** `references/FORMATOS.md` § «Carrusel que lleva a un video: temático (APROBADO)», que remite a
  `clase-a-youtube/references/CARRUSEL-TEMATICO.md`.

## 1-nov-2026 (tarde) · «¿Por qué hacemos carruseles tan feos?»
- **Qué pasó:** Manuel rechazó los colores y el esqueleto del motor (serie, números, paginador, frases al pie: «delatan
  que está hecho con IA»), pidió la lámina del vuelo «mucho más gráfica» con cuadros del video, su cara bien en el
  cierre («el secreto está dentro del video de YouTube») y una portada temática más completa.
- **Qué se aprendió:** sus ilustraciones le gustan; el esqueleto de plantilla no. Para piezas temáticas, plantilla
  propia a sangre (`clase-a-youtube/lanzamiento/carrusel.html`: portada, texto, cuadros, pantallas, video).
- **Qué cambió:** `MI-MARCA.md` §8 (Carruseles), `references/DIRECCION-DE-ARTE.md` § «Lo que delata la plantilla».

## 1-nov-2026 · Carrusel radical que lleva al video de YouTube
- **Qué pasó:** la primera versión (guía de 6 piezas, 10 láminas, QA 95) no le gustó a Manuel: «hazlo más radical y
  viral» y dictó la estructura de 5 láminas; luego pidió el tema «logo de ChatGPT con vida tipo Frankenstein y su
  computadora». Se mandó a Salma por WhatsApp como archivos con el caption.
- **Qué se aprendió:** para llevar a un video gana la noticia en primera persona (asombro → qué es → lo usé → en mi
  negocio → tutorial). El QA bajó a 75 por fórmulas de gancho y la palabra «secreto», pero manda lo que dicta Manuel. El
  marcador `==…==` en un cuerpo que se parte en dos renglones se lee como tachado: usar `**…**`. Un logo negro sobre un
  look oscuro desaparece: invertirlo. Gemini (nano-banana) llegó a su tope gratis: Higgsfield `gpt_image_2_5` en la
  cuenta creator.
- **Qué cambió:** `references/FORMATOS.md` § «Carrusel que lleva a un video». Carrusel en
  `Carruseles/2026-11-01-primer-empleado-ia/` (la v1 en `_v1-guia/`).

## 21-oct-2026 · Actualización general de skills

- Revisión contra el estándar de skills (descripción, tamaño, referencias, portabilidad): la skill ya
  cumplía. En SKILL.md solo cambió §9: cada corrección también se registra aquí.
- `references/AVATARES.md`: matiz al «3D tipo Pixar no funciona». Ese fallo fue con `nano_banana_pro`; el
  19-oct-2026 un personaje 3D estilo animación hecho con `gpt_image_2` (calidad `high`, tres fotos reales
  nítidas como referencia) sí conservó el parecido y quedó aprobado. `gpt_image_2_5` sale con la cara ancha.
- Verificado que `assets/fotos/reales/catalogo.json`, `assets/fotos/soul/` y `assets/img/NN-*.png` son
  rutas de la carpeta de trabajo del usuario o del carrusel (salidas), no archivos que falten en el repo.
- Se crea este archivo para que el ciclo de aprendizaje tenga un registro fijo.

## 2026-11-06 · Réplicas literales y hora de publicar
- Manuel, al mandar 18 links: «generes literal que lo repliques igual pero con los textos en español, con los avatar de mi marca y con mis @». Cuando él manda una referencia y dice «igual» o «literal», se conservan objetos, composición y texto (traducido); no se cambia el tema. Mi primer intento cambió los juguetes por objetos «más de negocio»: no era lo pedido. Con `--image-references` el original y `gpt_image_2_5` sale casi idéntico por 2.75 créditos. Sin marca ajena; cifras viejas se corrigen (arnés y brief en `Carruseles/_referencias-manuel/`).
- Un carrusel programado a las 17:00 lo frenó el espaciado de 180 min: Repurpose sube reels a las 16:10–16:53 y otro a las 17:37. La hora de carrusel de @manueldeleonmjr es 12:50, uno por día. `programar.sh` ya reintenta cada 30 min y avisa si no salió.

## 2026-11-06 · Tablero de revisión de réplicas
Manuel pidió marcar en una sola pantalla qué se queda, qué se revisa y qué cambia. Quedó en `Carruseles/_referencias-manuel/_harness/tablero/` (`python3 servidor.py`, http://127.0.0.1:8742): lee `catalogo.json`, guarda en `datos/estado.json` y cada «Mandar a Claude» escribe `datos/ronda-N.json` y `datos/senal`. Al aplicar una ronda: poner en `estado.json` el texto `corregido` de cada pieza y volver a dejarla sin marcar, para que se revise otra vez.

## 2026-11-06 · Correcciones de Manuel a las réplicas (ronda 1)
- **Recorte (otra vez):** en la pirámide se le veía el pantalón porque el recorte siguió de largo. Antes de usar una foto del banco, leer su corte en `catalogo/encuadres.json` (`planos`, `lineas_png`, y si `ok` es falso no se corta ahí) y cortar en una línea válida, con el borde escondido en el borde de la lámina. Nada de cadera, piernas ni banco.
- **Captura real:** un cierre de «sígueme» lleva captura real del perfil de Instagram, no tarjeta dibujada. Se saca con Playwright en vista de iPhone, sin sesión (`instagram.com/manueldeleonmjr`), recortada al encabezado.
- **Arroba siempre:** aunque el original no lo traiga, toda pieza lleva @manueldeleonmjr, en pequeño si es meme o lámina única.
- **Ícono con el nombre:** si una lámina nombra una app, va su logo real al lado.
- **CTA por palabra:** carrusel que recomienda recursos o sistemas cierra con palabra clave (SEIS, PLAYLIST) y no con «sígueme». Sin automatización conectada no se programa.
- **Una sola lámina:** `ig carrusel` exige 2; una pieza de 1 imagen se publica con `ig post`.
- **Generar con Manuel de molde (r14, 6-nov):** `gpt_image_2_5` le ensancha la quijada y lo envejece. Una segunda pasada que pida solo adelgazar la cara lo corrige; los ojos siguen saliendo algo más chicos. Medir parecido contra fotos reales y que Manuel lo vea.
