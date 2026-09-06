# Copy con voz humana para carruseles

Este documento es para quien escribe el `carrusel.json`: Claude, un agente o una persona. Dice cómo suena una lámina que alguien leería en voz alta sin pena. Los nombres de campos, layouts y looks son los de `templates/carrusel.schema.json`. `scripts/qa.mjs` mide una parte de estas reglas y bloquea el render cuando fallan. Lo que el QA no puede medir (si suena a folleto) lo mides tú con la prueba de la sección 9.

Tres cosas que el render hace solo. No las escribas a mano:

- La flecha del `loop` y la de «Desliza» en la portada las pone el CSS. Escribe el `loop` sin flecha ni puntos suspensivos.
- Las comillas de `cita` las pone el CSS. Escribe la cita sin comillas.
- `*palabra*` pinta esa palabra con el color de acento. `**negrita**` engrosa. `\n` parte la línea.

## 1. Longitudes por nivel

Una lámina se lee en menos de 3 segundos con el celular a brazo extendido. Estos topes salen de ahí.

| Campo | Layouts donde vive | Tope | Qué hace el QA |
|---|---|---|---|
| `titulo` de portada | `portada-titulo`, `portada-foto` | 4-7 palabras, una en `*acento*` | error si pasa de 9, aviso si pasa de 7 |
| `titulo` interior | todos menos `cita` | máximo 8 palabras (10 en `dato-hero`, 12 en `texto-pleno`, 6 en `cta-cara`, 5 en `lista`, `comparativa`, `pasos` y `prompt`) | cuenta dentro del total de la lámina |
| `subtitulo` | todos | máximo 12 palabras | idem |
| `kicker` | todos | máximo 3 palabras; uno cada 3 láminas | ninguna |
| `cuerpo` | todos | máximo 25 palabras, 1 o 2 frases | idem |
| `loop` | láminas con `rol: cuerpo` | máximo 8 palabras, sin flecha | avisa si menos de la mitad del cuerpo lo lleva |
| `dato` | `dato-hero` | número y unidad, máximo 6 caracteres (`3,345`, `18%`, `$6`) | ninguna |
| `numero` | `punto-numero` | `01`, `02`... dos dígitos | ninguna |
| `items` | `lista` | máximo 6 (5 si llevan `nota`); cada `texto` de 6 palabras o menos; `nota` de 8 o menos | tope 70 palabras en la lámina |
| `pasos` | `pasos` | máximo 4; `titulo` de 6 palabras; `detalle` de 10 | tope 70 |
| `a` y `b` | `comparativa` | `titulo` de columna de 2 palabras; máximo 3 items de 4 palabras | tope 70 |
| `cita` y `autor` | `cita` | cita de 16 palabras o menos; autor de 5 palabras o menos | cuenta en el total |
| `prompt` | `prompt` | máximo 45 palabras; `etiqueta` mejor omitirla (ver LAYOUTS.md) y usar `kicker` de 3 | tope 70 |
| `boton` | `cta-cara` | 3 palabras, una sola acción, la `palabra_clave` en mayúsculas | error si la palabra clave falta en el CTA |
| `chips` | portada, `texto-pleno` | 3 a 5 chips de 2 palabras o menos | ninguna |
| `caption`, primera línea | raíz del JSON | 125 caracteres o menos | aviso si pasa |
| `caption`, total | raíz | 60-150 palabras en líneas cortas | error si falta la palabra clave |
| `hashtags` | raíz | 3-5 de nicho | error si pasan de 5 |

Tope general: 40 palabras por lámina (error) y 70 en las guardables (`lista`, `pasos`, `comparativa`, `prompt`, `rol: cheatsheet`). Si el ajuste automático tuvo que encoger la letra más de 8% para que cupiera, el QA lo avisa. No pelees con el ajuste: recorta.

## 2. Verbos, persona y una idea por lámina

- Tú, siempre. «Usted» solo si MI-MARCA lo pide. Nunca el «nosotros» de empresa.
- Verbo al frente, en imperativo o presente: Copia, Guarda, Prueba, Dicta, Pide, Mide, Cronometra, Deja de, Empieza.
- Frases de 15 palabras o menos. Una frase de 12 seguida de una de 3 suena a persona.
- Una idea por lámina. Si aparece «y», «además», «también» o «por otro lado» uniendo dos ideas, son dos láminas. El QA avisa cuando ve dos o más «además/también» en la misma lámina.
- Voz activa. «ChatGPT arma el PDF», no «el PDF es generado por la IA».
- Sin anuncios. «En esta guía veremos» se borra. Entra por el hecho.
- Verbos que suenan a folleto y no se usan: descubre, desbloquea, potencia, transforma, revoluciona, maximiza, optimiza, impulsa, eleva.

## 3. Datos como arma

- Toda afirmación fuerte lleva número o comparativa (antes/después, A contra B). Si no tiene número, es opinión: bájala de tono o quítala.
- Números específicos, no redondos. `3,345` y no «más de 3 mil». `18%` y no «casi 20%». Los redondos suenan a promesa; los raros suenan a verdad.
- Formato: coma de miles (`98,609`), porcentaje pegado (`18%`), moneda cuando hay ambigüedad (`$6 USD`).
- Sin fuente no se publica. La fuente va en `notas` del JSON (URL, o «Insights del post, fecha»). Si el dato es de un tercero, el tercero aparece en la lámina, en `pie` o en la `nota` del item.
- El QA pide al menos 2 láminas con número. La meta real es 4 de cada 8.
- No inventes. Si no hay cifra, pon el hecho concreto: un día, una hora, un nombre de herramienta.

### Lo que enseñan los carruseles de @manueldeleonmjr

Cifras públicas de cuatro carruseles de la cuenta, tomadas de sus posts (2026).

| Carrusel (primera línea del caption) | Alcance | Guardados | Compartidos | Likes | Guardan |
|---|---|---|---|---|---|
| «5 generaciones. La mayoría de las marcas solo le habla a 2.» | 98,609 | 3,345 | 1,160 | 2,452 | 3.39% |
| «La IA ya gestiona Instagram de los más grandes. ¿Tú cuándo?» | 54,866 | 3,087 | 1,439 | 1,277 | 5.63% |
| «La IA no llegó a tocar la puerta de Wall Street. Ya entró.» | 34,882 | 1,474 | 709 | 1,198 | 4.23% |
| «La IA puede aprender procesos, pero no piensa como un humano: replica instrucciones, patrones y también errores.» | 36,179 | 80 | 21 | 711 | 0.22% |

Qué hizo cada pieza:

- **5 generaciones.** Número en la portada, estructura visible desde la primera lámina (una píldora tipo «guía rápida» y chips por generación), una idea por lámina. Más guardados que likes: la gente lo guardó para usarlo.
- **Instagram + IA.** Herramienta que ya usan más una IA con nombre, y demo dentro. 2.4 guardados por cada like.
- **Wall Street.** Una noticia traducida a consecuencia para el dueño. Frase larga seguida de una de dos palabras: «Ya entró».
- **El contraejemplo.** Alcance parecido al de Wall Street y 18 veces menos guardados (80 contra 1,474). La portada tiene 20 palabras, tres sustantivos apilados («instrucciones, patrones y también errores») y un caption que cierra con «potenciar» tu capacidad. Es un folleto. Nadie guarda un folleto.

La lección: la portada da alcance; el copy interior, concreto y útil, da guardados y compartidos.

## 4. Lista negra de frases de IA y cadencias de máquina

Las frases de la primera tabla son error en `qa.mjs`: bloquean el render. Bórralas y reescribe con el reemplazo. Seis de ellas no están en la lista de `qa.mjs` y las revisas tú: «hoy en día», «sin lugar a dudas», «en conclusión», «profundiza en», «es importante destacar» y «cabe mencionar».

| Frase de IA | Reemplazo humano |
|---|---|
| en la era digital · en el mundo actual · hoy en día | Nada. Empieza por el hecho. |
| en un mundo donde · imagina un mundo | Nada. |
| desbloquea tu potencial | Di qué va a poder hacer: «Cotiza en 3 minutos». |
| lleva tu negocio al siguiente nivel | El número: «Pasa de 4 a 11 cotizaciones al día». |
| revoluciona · transforma tu vida/negocio | El verbo concreto: «cambia cómo cobras». |
| el poder de la IA | «Lo que hace ChatGPT con tu lista de precios». |
| descubre el secreto | «Así lo hago yo». |
| sin duda · sin lugar a dudas | Nada. |
| en resumen · en conclusión | Cierra con una acción o una fecha. |
| la clave del éxito | Nada. |
| potencia tus resultados · maximiza tu potencial | Verbo más número. |
| cambia las reglas del juego · game changer | «Esto no existía en enero». |
| la herramienta definitiva · el futuro es ahora | Nombre de la herramienta y qué hace. |
| sumérgete · profundiza en | «Mira», «entra a», «revisa». |
| no se trata solo de X | Una frase afirmativa. |
| es importante destacar · cabe mencionar | Di la cosa. |
| éxito garantizado · hazte rico · ingreso pasivo · indetectable | Nunca. Además violan las políticas de la plataforma. |

El QA también avisa por cebos de interacción: «etiqueta a un amigo», «dale like», «sígueme para más», «link en bio», «métete a mi perfil». Cámbialos por una sola acción con palabra clave.

Las cadencias no las detecta ningún programa. Las detectas tú al leer en voz alta.

| Cadencia de máquina | Cómo suena | Reemplazo |
|---|---|---|
| Tricolón decorativo | «rápido, confiable y escalable» | Enumera 2 o 4, o pon el dato. Nunca tres adjetivos en `chips`. |
| Antítesis simétrica | «No es X. Es Y.» · «no solo... sino también» | Una afirmativa con número. |
| Cierre motivacional | «¡Tú puedes!» · «El momento es ahora» · «Empieza hoy» | Una acción concreta y la palabra clave. |
| Conector encabezando | «Sin embargo», «Además», «Por otro lado» al abrir el `cuerpo` | Quítalo. La lógica se sostiene sola. |
| Frases del mismo largo | Todas de 14 palabras | Alterna 12 y 3. |
| Gerundios encadenados | «implementando... logrando... consolidando» | Verbo conjugado: «puse», «bajó». |
| Pregunta retórica hueca | «¿La clave? ¿El resultado?» | Afirma. |
| Signo de admiración en portada | «¡Esto cambia todo!» | Nunca en portada. Adaptado de Carrusel Studio de Ruva IA (youtube.com/@RuvaIA). |
| Emojis como viñetas | un cohete o un dedo antes de cada item | Usa `items` con `idx`; el render pone el índice. |

## 5. Los ocho movimientos para reescribir con voz propia

Adaptados de la skill sin-huella-ia (su archivo `COMO-REESCRIBIR.md`; no forma parte de esta skill) al tamaño de una lámina. Se aplican en este orden a cada lámina que suene a folleto.

1. **Quita el arranque y entra por el hecho.** Borra la frase que anuncia. La lámina empieza en la frase más concreta que tengas.
2. **Mete una cifra rara.** `18%`, `4 minutos`, `3,345`. Si no la tienes, un hecho concreto: «el martes», «en la sucursal de Zapopan».
3. **Rompe el ritmo.** Después del `cuerpo` de 18 palabras, un `loop` de 3.
4. **Cambia el adjetivo por el dato.** Donde diga «robusto», «integral», «clave», pregúntate qué número estabas evitando.
5. **Quita los conectores de encabezado.** Lee la primera palabra de cada `cuerpo`. Si tres empiezan con conector, quita dos.
6. **Baja de registro.** Escribe como habla la persona de MI-MARCA: «platicar», «chamba», «ya quedó». Si la lámina se publicaría igual en Madrid y en Guadalajara, está en neutro de doblaje.
7. **Mete una imperfección a propósito.** Una autocorrección o un paréntesis que se sale del tema. Una por carrusel, en el `rehook` o en el caption. Nunca en `dato-hero`.
8. **Léelo en voz alta.** Si te tropiezas o te da pena decirlo frente a alguien, esa frase se cambia.

## 6. Ortografía del español que delata máquina

Tomado de la skill sin-huella-ia (su archivo `ESPANOL.md`; no forma parte de esta skill). Estas señales pesan más que cualquier palabra suelta porque son faltas, no estilo.

| Señal | Regla | En el JSON |
|---|---|---|
| Raya larga (—) como conector | No se usa. Punto o dos puntos. | Ningún campo lleva «—». |
| Comillas curvas inglesas (“ ”) | Rectas o angulares (« »). | En `cita` ninguna: el CSS las pone. |
| Title Case | Mayúscula solo en la primera palabra y en nombres propios. «Cinco formas de cerrar», no «Cinco Formas De Cerrar». | Aplica a `titulo`, `subtitulo`, `items`, `pasos`. El `kicker` se escribe en minúsculas; el CSS lo sube. |
| «en resumen», «en conclusión» | No se cierra así. Se cierra con acción. | Prohibido en el último `cuerpo` y en el caption. |
| Puntos suspensivos de suspenso | El `loop` va sin «...». La flecha ya hace el trabajo. | `loop` termina sin signo. |
| Signos de apertura | Si hay pregunta, lleva «¿». La admiración no entra en portada. | `titulo` de portada sin «¡». |
| Corrección de dictamen en canal informal | «Con base en» y «el cual» suenan a máquina en Instagram. No escribas mal a propósito; escribe como se platica. | `cuerpo` y caption. |
| Anglicismos con palabra en español | Embudo, no funnel. Gancho, no hook. Guardados, no saves. | Todo texto que lee la audiencia. Los nombres de herramientas se quedan (ChatGPT, Claude). |
| Números | Coma de miles, porcentaje pegado, sin abreviar minutos («3 minutos», no «3 min»). | `dato`, `cuerpo`, `items`. |

## 7. Cómo se usa MI-MARCA.md

La skill lee `templates/MI-MARCA.md` (la copia llena del usuario) antes de escribir una sola lámina. Cada sección alimenta un campo concreto. Los huecos vacíos no se rellenan con suposiciones: se preguntan o se dejan fuera.

| Sección de MI-MARCA | Qué se hace con ella |
|---|---|
| §1 Sello | Va en `marca.sello`, junto al handle en `cta-cara`. Tal cual, sin adornar. |
| §2 Qué les duele (3 cosas) | El `rehook` nombra uno de los tres dolores con las palabras del usuario, no con las tuyas. |
| §2 Nivel de explicación | Si dice «como receta de cocina», los `pasos` llevan `detalle`. Si dice «técnico», no. |
| §3 Tuteo o usted | Se aplica a todas las láminas y al caption sin mezclar. |
| §3 Frases que sí dices | Una por carrusel, dos máximo, literal. Van en `rehook`, en `cita` con `autor` del propio usuario, o en el caption. Nunca en `dato-hero`. |
| §3 Palabras que nunca usarías | Se suman a la lista negra. El QA solo revisa la global; estas las revisas tú. |
| §3 Emojis | «Nunca en las láminas» es el valor por omisión. En el caption, lo que diga la ficha. |
| §3 Regionalismos permitidos | Entran en `cuerpo`, `loop` y caption. No en la portada: la portada es para todos. |
| §4 Recursos por DM | `entregable` es uno de ellos. Debe ser algo que NO está en el carrusel. |
| §4 Palabras clave que ya usas | `palabra_clave` es una de esas. Una palabra, en mayúsculas, en `boton` y en el caption. |
| §4 Cifras que SÍ puedes publicar | Las únicas que entran, con su fuente en `notas`. |
| §4 Cifras que NO se publican | Nunca, aunque el tema las pida. Se reemplazan por comparativa sin monto o se quita la lámina. |
| §6 Tus 3 mejores piezas | Se copia la estructura del gancho, no el texto. |
| §6 Temas prohibidos | Si el tema pedido cae ahí, se dice antes de escribir. |

Las cuatro dimensiones que definen una voz (formalidad, regionalismo, emojis y lista negra propia) están adaptadas de Carrusel Studio de Ruva IA (youtube.com/@RuvaIA). Si «Frases que sí dices» está vacío, pide tres antes de escribir. Un audio de WhatsApp transcrito sirve.

## 8. Portada y caption

Fórmulas de gancho que pasan el QA (busca número, negación, «deja de», «sin antes», contraste antes/ahora, «contra», pregunta cerrada, «nadie te dice», «se nota», «gratis», «mal», «error»):

| Fórmula | Ejemplo de 4-7 palabras |
|---|---|
| Error o negación | «Deja de *cotizar* a mano» |
| Contraste antes/ahora | «Antes 3 días. Ahora *3 minutos*» |
| Lista finita | «5 *prompts* que copio cada lunes» |
| Confesión con número | «Perdí 11 clientes por *tardar*» |
| Contrarian | «No necesitas más *leads*» |
| Pregunta cerrada | «¿Tu *cotización* tarda más de un día?» |

Las fórmulas de confesión y contrarian están adaptadas de Carrusel Studio de Ruva IA (youtube.com/@RuvaIA).

El caption es el segundo gancho. Estructura:

1. Primera línea de 125 caracteres o menos. Distinta a la portada: no repitas el título.
2. Dos o tres líneas cortas de contexto en primera persona (qué pasó, cuándo).
3. Una línea que diga qué hay en el carrusel.
4. Una sola acción con la `palabra_clave` en mayúsculas y el `entregable`.
5. Una pregunta que se pueda contestar en una palabra.

Los hashtags van en el campo `hashtags`, no dentro del caption. Bloques de una línea con aire entre ellos. Nunca un párrafo de seis líneas. El esqueleto de caption (contexto, puente al carrusel, acción, pregunta) está adaptado de Carrusel Studio de Ruva IA (youtube.com/@RuvaIA).

## 9. Prueba final: voz alta y checklist de 10 puntos

Lee las láminas seguidas, en voz alta, con cronómetro. Cada una debe caber en 3 segundos. Si en alguna te tropiezas, te da pena o suena a publicación motivacional de LinkedIn, se reescribe con los ocho movimientos. Luego pasa la lista:

1. La portada tiene 4-7 palabras, una fórmula de gancho y una `*palabra*` en acento.
2. Ninguna frase de la lista negra y ninguna cadencia (tricolón, antítesis, cierre motivacional).
3. Cada lámina de cuerpo tiene una idea, `cuerpo` de 25 palabras o menos y `loop` de 8 o menos sin flecha.
4. Hay al menos 4 láminas con número específico y cada cifra tiene fuente en `notas`.
5. Verbos al frente, tú, presente. Ninguna frase pasa de 15 palabras.
6. Hay una frase de 5 palabras o menos después de una larga.
7. Hay una lámina guardable (`lista`, `pasos`, `prompt` o `comparativa`) con 6 items o menos.
8. El CTA pide una sola acción; la `palabra_clave` está en `boton` y en el caption; el `entregable` no está dentro del carrusel.
9. Sin raya como conector, sin comillas curvas, sin Title Case, sin «en resumen».
10. Suena a la persona de MI-MARCA: hay una frase suya y el texto no se publicaría igual en Madrid, Bogotá y Guadalajara.

Si falla el punto 1, el 2 o el 8, no pasa a render. Cuando pase los diez, corre `node scripts/qa.mjs <carpeta>` y atiende lo que marque.

## 10. Seis ejemplos antes/después

Nicho: negocios e IA. Cada par muestra el JSON de la lámina como lo lee `construir-html.mjs`.

### Ejemplo 1. Portada (`portada-titulo`)

Antes (9 palabras, verbo de folleto, sin número):

```json
{ "rol": "portada", "layout": "portada-titulo",
  "titulo": "Descubre cómo la inteligencia artificial puede transformar tu negocio" }
```

Después (7 palabras, contraste, una palabra en acento):

```json
{ "rol": "portada", "layout": "portada-titulo",
  "titulo": "3 días para *cotizar*. Ellos: 3 minutos.",
  "subtitulo": "El flujo completo, con el prompt", "chips": ["Cotización", "ChatGPT", "PDF"] }
```

Por qué: entra por el hecho, el número es raro, la promesa cabe en una pantalla.

### Ejemplo 2. Rehook (`texto-pleno`)

Antes:

```json
{ "rol": "rehook", "layout": "texto-pleno",
  "cuerpo": "En un mundo donde la competencia es feroz, la velocidad de respuesta es clave para el éxito de cualquier emprendedor." }
```

Después (16 palabras, anécdota con día y minutos, loop de 6):

```json
{ "rol": "rehook", "layout": "texto-pleno",
  "titulo": "Le compran al que *contesta*",
  "cuerpo": "Pedí precio a tres negocios el martes. Uno contestó en 4 minutos. A ese le compré.",
  "loop": "Así se arma en una tarde" }
```

Por qué: sin «en un mundo donde», sin «clave», con hecho concreto y una frase de cuatro palabras al final.

### Ejemplo 3. Punto de cuerpo (`punto-numero`)

Antes:

```json
{ "rol": "cuerpo", "layout": "punto-numero", "numero": "02",
  "titulo": "Optimiza tus procesos con automatización inteligente",
  "cuerpo": "Aprovecha el poder de la IA para maximizar tu productividad y potenciar tus resultados de forma sostenible." }
```

Después:

```json
{ "rol": "cuerpo", "layout": "punto-numero", "numero": "02",
  "titulo": "Dicta la *cotización* al celular",
  "cuerpo": "Grabas 40 segundos con los datos. ChatGPT arma el PDF con tu formato. Tú solo revisas el precio.",
  "loop": "El paso 3 se lo saltan todos" }
```

Por qué: verbo al frente, herramienta con nombre, 18 palabras en tres frases de distinto largo.

### Ejemplo 4. Dato (`dato-hero`)

Antes:

```json
{ "rol": "cuerpo", "layout": "dato-hero", "dato": "+3K",
  "titulo": "Los guardados son fundamentales",
  "cuerpo": "Los guardados son una métrica fundamental que refleja el valor percibido de tu contenido." }
```

Después (cifra exacta, comparativa, fuente en `notas` del carrusel):

```json
{ "rol": "cuerpo", "layout": "dato-hero", "dato": "3,345",
  "titulo": "Guardados. Más que *likes*.",
  "cuerpo": "Un carrusel de 5 generaciones: 98,609 de alcance, 3,345 guardados, 2,452 likes. Lo guardaron para usarlo.",
  "loop": "Qué tenía que los otros no" }
```

Por qué: «+3K» es redondo y sin fuente; `3,345` con sus dos comparativas es un hecho.

### Ejemplo 5. Lámina guardable (`lista`)

Antes:

```json
{ "rol": "cheatsheet", "layout": "lista", "titulo": "Estrategias clave",
  "items": ["Implementa una estrategia integral de contenido", "Aprovecha el poder de la IA para escalar",
            "Optimiza tu embudo de conversión", "Potencia la experiencia del cliente"] }
```

Después (4 items de 8 palabras o menos, nota de 10 o menos, un verbo por item):

```json
{ "rol": "cheatsheet", "layout": "lista", "titulo": "Hazlo *hoy*, en este orden",
  "items": [
    { "texto": "Pide precio a tu propio negocio", "nota": "Cronometra. Más de 2 horas: hay problema." },
    { "texto": "Copia tu última cotización a ChatGPT", "nota": "Dile: «este es mi formato»." },
    { "texto": "Dicta la siguiente en 40 segundos", "nota": "Con la app del celular, nota de voz." },
    { "texto": "Manda el PDF antes de 10 minutos", "nota": "Mide cuántas cierran en la semana." } ],
  "loop": "Te dejo el prompt exacto" }
```

Por qué: cada item es una acción que se puede hacer hoy; las notas traen número o instrucción, no adjetivo.

### Ejemplo 6. CTA (`cta-cara`)

Antes (cuatro acciones compitiendo, dos cebos que el QA marca):

```json
{ "rol": "cta", "layout": "cta-cara",
  "titulo": "¡No te pierdas esta oportunidad!",
  "cuerpo": "Sígueme para más contenido de valor, dale like, guarda este post y descubre el secreto del éxito. Link en bio." }
```

Después (una acción, palabra clave en mayúsculas, entregable que no está en el carrusel):

```json
{ "rol": "cta", "layout": "cta-cara",
  "titulo": "Comenta *COTIZA*",
  "cuerpo": "Te mando el prompt completo por DM, con el formato de PDF listo para poner tu logo.",
  "boton": "Comenta COTIZA" }
```

Por qué: una sola acción, la misma palabra en `boton` y en `palabra_clave`, y lo que se promete es distinto de lo que ya se vio.
