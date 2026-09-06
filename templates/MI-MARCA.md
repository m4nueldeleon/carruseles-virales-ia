# MI-MARCA.md — la ficha que la skill lee antes de escribir una sola lámina

> Llena esto una vez. Claude te hará las preguntas la primera vez y lo guardará aquí.
> Lo que esté entre corchetes `[ ]` es un hueco: si no lo sabes, déjalo vacío; la skill no inventa.

## 1. Quién eres

- **Nombre público:** [Tu nombre o el de la marca]
- **Cuenta de Instagram:** [@tucuenta] · seguidores aprox.: [ ]
- **Una frase de a qué te dedicas (como se la dirías a alguien en una fiesta):** [ ]
- **Sello (lo que va junto al @ en la última lámina):** [ej. «IA aplicada al negocio real»]

## 2. A quién le hablas

- **Edad y situación:** [ej. dueños de negocio de 35 a 60 años, poca experiencia digital]
- **Dónde están:** [ej. México, LATAM, hispanos en EUA]
- **Qué les duele (3 cosas concretas):** [ ]
- **Qué ya intentaron y no les funcionó:** [ ]
- **Nivel de explicación:** [ej. paso a paso, como receta de cocina / técnico]

## 3. Cómo suenas

- **Tuteo o usted:** [ ]
- **Frases que sí dices (copia 3 tal cual, de un audio o un WhatsApp):** [ ]
- **Palabras que NUNCA usarías:** [ ]
- **Emojis:** [no / 1-2 en el caption / nunca en las láminas]
- **Regionalismos permitidos:** [ej. mexicanos ligeros: «la neta», «órale»]

## 4. Qué vendes y qué regalas

- **Escalera de oferta (de gratis a caro):** [ej. recurso gratis → seminario → membresía → programa]
- **Recursos que puedes entregar por DM (lo que se promete en el CTA):** [ej. PDF de prompts, plantilla, link]
- **Palabras clave que ya usas para DM (ManyChat u otro):** [ej. IA, CLUB, PROMPT]
- **Cifras que SÍ puedes publicar (con fuente):** [ ]
- **Cifras que NO se publican:** [ ]

## 5. Cómo te ves

- **Fotos reales tuyas (rutas en `assets/fotos/`):** [ej. assets/fotos/avatar.jpg — cara para la lámina de CTA]
- **Banco de fotos reales (`assets/fotos/reales/` + `catalogo.json`):** [de dónde salen: carpeta de la sesión de estudio, álbum «X» de Fotos, carpeta de eventos. 10-17 fotos en poses distintas, con `recorte` PNG sin fondo y anotadas por situación, fondo, lado del sujeto, looks y temas. Se alimenta con `scripts/banco-fotos.py` (cosechar → hoja → curar → recortar → anotar)]
- **Avatares (`assets/fotos/reales/avatares/`):** [un estilo por look generado desde 2-3 fotos reales limpias; ver references/AVATARES.md. Anota qué fotos son las referencias]
- **banco_url:** [URL base del banco en la nube, p. ej. https://<store>.public.blob.vercel-storage.com/banco — la escribe `banco-fotos.py subir`; en otra máquina `banco-fotos.py bajar <banco_url>`. Token en ~/.vercel-blob-cli/.env, nunca en esta ficha]
- **Personaje generado (`assets/fotos/soul/` + `catalogo.json`):** [opcional: si tienes un personaje entrenado (Higgsfield Soul), anota el id y la skill genera poses nuevas por tema]
- **Logo (ruta en `assets/logos/`, PNG con fondo transparente):** [ ]
- **Colores de marca (si tienes, en hex):** [ ]
- **Looks que prefieres de la skill:** [guia-rapida · noticia · oscuro-tech · recurso · bosque · editorial-mono]
- **Looks que no quieres:** [ ]
- **Personaje o avatar de IA (si existe: Higgsfield Soul / Element, id):** [ ]

## 6. Lo que ya sabes que funciona

- **Tus 3 mejores piezas y por qué (hook + formato + números):** [ ]
- **Lo que ya probaste y no funcionó:** [ ]
- **Temas que quieres empujar este trimestre:** [ ]
- **Temas prohibidos:** [ ]

## 7. Medición

- **Cómo vas a medir (Windsor.ai, Insights de la app, otro):** [ ]
- **ID de cuenta para la API (si aplica):** [ ]
