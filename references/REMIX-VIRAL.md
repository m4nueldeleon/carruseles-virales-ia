# Remix de un post viral ajeno · tu versión con las fotos reales

Para cuando el usuario manda el link de un post que está explotando en otra cuenta (un campeón, un lanzamiento, un
momento del día) y quiere **su propia versión**: las fotos reales del momento, un ángulo que le sirva a su audiencia y
su voz. No es copiar: se toma el momento y sus fotos con crédito; el texto, el arco y el diseño son tuyos.

Caso base (2-nov-2026): Kimi Antonelli campeón del mundo de F1. Dos posts de @f1: él de niño con Max Verstappen y con
Lewis Hamilton, y el podio en el que los dos lo cargan en hombros; el segundo, 2018 junto a un Mercedes y 2026 encima
del suyo. Ángulo: «Todo gran logro empieza porque alguien te inspiró». 6 láminas con esta receta, aprobadas y
publicadas el mismo día. Guion: `templates/tematico-fotos/ejemplo.json`.

## Cuándo sí y cuándo no

- **Sí:** un hecho público y reciente con fotos que cuentan la historia solas (antes y después, el ídolo y el fan, el
  primero y el último), y una lección que se puede llevar a la vida o al negocio de tu audiencia.
- **No:** fotos privadas, de menores que no son públicas, o de alguien que no consintió; memes con texto ajeno encima;
  un post cuyo valor es solo el diseño de otro (eso se estudia con `REFERENCIAS-ENTRADA.md`, no se remezcla).
- **Ojo con el alcance prestado:** un tema de deporte o celebridad puede no ser lo que tu audiencia viene a buscar.
  Si la ficha de marca lo marca como tema que no jala, dilo una vez y que decida el usuario; el ángulo tiene que
  aterrizar en algo suyo.

## Receta (≈1 h)

1. **Bajar el post** con `python3 scripts/referencia.py "<url>" --out <carpeta-del-carrusel>` (necesita `APIFY_TOKEN`):
   trae dueño, fecha, likes, comentarios, caption y las láminas a `_referencia/NN.jpg` (1638x2048 en un post 4:5).
   Si mandan dos o más posts, se bajan todos: el segundo puede dar la mejor lámina (en el caso base, la de 2018/2026).
   Sin token: abrir el post en un navegador **sin iniciar sesión**, cerrar el aviso de login y guardar cada lámina
   desde su `<img>` de mayor tamaño. Nunca iniciar sesión de Instagram con un navegador automatizado.
2. **Por qué funcionó** (5 líneas en `referencia.md`): mecanismo (antes → después, ídolo → igual, nadie creía → lo
   logró), la foto que carga la historia, cuántas horas tenía el post, sus números (likes y comentarios **no son**
   guardados ni compartidos) y qué emoción deja.
3. **Verificar los hechos** con dos fuentes (resultado oficial y un medio). Edad, posición, récord: sin fuente no va.
   Escribir la fecha de forma que aguante unos días («el domingo», no «ayer»): el post puede salir mañana.
4. **El ángulo propio**: una frase que tu audiencia se lleva y que el post original no dice. Su caption no se
   traduce ni se parafrasea.
5. **El arco** (5–6 láminas), con la plantilla `templates/tematico-fotos/`:

   | Lámina | Layout | Qué hace |
   |---|---|---|
   | 1 | `impresa` | El pasado como foto impresa y un titular que pica la curiosidad sin decir el final («Este niño le pidió una foto a…») |
   | 2 | `impresa` | El segundo recuerdo (otra persona, otra foto) |
   | 3 | `sangre` | El presente a toda la pantalla, sello del logro y titular abajo: el pago |
   | 4 | `antes-despues` | Si hay un par antes/después, el presente a sangre y el pasado impreso con su año |
   | 5 | `idea` | La lección en una frase, con los recuerdos pequeños abajo |
   | 6 | `cierre` | La pregunta que la vuelve personal y una acción (etiquetar o mandar), con la foto del momento |

   El pasado va impreso (se lee como recuerdo) y el presente a sangre (se lee como el momento): ese contraste cuenta
   la historia sin texto. Para un carrusel de contenido (consejos, pasos, herramientas) la misma plantilla trae
   `texto` (una idea con su explicación sobre foto desenfocada) y `lista` (3–5 puntos numerados: la lámina que se
   guarda).
6. **Crédito en cada foto** («Foto: <dueño> (@cuenta)») y en el caption. Antes de publicar, decirle al usuario que
   las fotos no son suyas y que el dueño puede pedir que se bajen. Las ligas deportivas y de entretenimiento suelen
   hacerlo.
7. **Render y revisión a ojo**: `node templates/tematico-fotos/render.mjs <carpeta>`; mirar cada PNG y
   `portada-270.jpg`. Lo que se revisa:
   - Ningún sello, titular o crédito tapa una cara. En el caso base, el sello del podio tapaba la cara del campeón y
     se bajó junto al titular.
   - El lienzo es 4:5 (1080x1350) desde el 3-nov-2026; una foto de otra proporción pierde bordes: la cara no se tapa con texto.
   - Ninguna lámina de puro texto: capturas reales con fuente, comparativas, personaje o escena (`DIRECCION-DE-ARTE.md` §«Carrusel con contexto visual»).
   - Titulares con saltos forzados (`\n`) donde una palabra queda sola.
   - Los recuerdos chicos no se salen del lienzo.
8. **Caption**: primera línea ≤125 caracteres que cuenta la historia completa en una frase; luego el hecho
   verificado; luego la lección; luego la pregunta y la acción; el crédito; 3–5 hashtags. La acción se escribe como
   pregunta («¿Quién es esa persona para ti? Etiquétala o mándale esto»), no como cadena («etiqueta a 3 amigos»):
   pedir etiquetas en serie es cebo de interacción y las plataformas lo castigan.
9. **Entrega y publicación**: el usuario aprueba las láminas en la conversación. Publicar no es parte de la skill:
   si el usuario lo ordena y tiene un publicador propio con filtros, se usa ese (ensayo primero).
10. **Medir** a las 48 h y a los 7 días con `scripts/medir.py` y anotar `tipo: remix-viral` en `metadata.json`, para
    comparar los remix entre sí y contra los carruseles propios.

## Velocidad

Un remix vale lo que dura el momento. El caso base salió el día siguiente al hecho, con el post original aún
subiendo. Si el momento ya pasó (más de 2–3 días), el ángulo tiene que aguantar solo; si no, mejor no hacerlo.
