# Formatos de carrusel y estructura lámina por lámina

Este documento dice qué carrusel armar y en qué orden van las láminas. Los nombres de `tipo`, `rol`, `layout` y `look` son los del contrato (`templates/carrusel.schema.json` y `scripts/lib/construir-html.mjs`). Si un nombre no está aquí, no existe: `qa.mjs` lo rechaza.

## Vocabulario del contrato

| Campo | Valores permitidos |
|---|---|
| `tipo` | `guia`, `lista`, `recurso`, `noticia`, `tutorial`, `contrarian`, `historia`, `comparativa`, `prompt` |
| `objetivo` | `saves`, `shares`, `comments`, `follows` |
| `rol` (por lámina) | `portada`, `rehook`, `agitacion`, `cuerpo`, `cheatsheet`, `cta` |
| `layout` (por lámina) | `portada-titulo`, `portada-foto`, `punto-numero`, `dato-hero`, `lista`, `comparativa`, `pasos`, `cita`, `texto-pleno`, `prompt`, `cta-cara` |
| `look` | `guia-rapida`, `noticia`, `oscuro-tech`, `recurso`, `bosque`, `editorial-mono` |
| `formato` | `4:5` (1080×1350, por omisión), `3:4`, `1:1`, `9:16` |

Campos de lámina que usa cada layout (los demás se ignoran):

| Layout | Campos que pinta |
|---|---|
| `portada-titulo`, `portada-foto`, `texto-pleno` | `kicker`, `titulo`, `subtitulo`, `chips`, `cuerpo`, `loop` |
| `punto-numero` | `numero`, `titulo`, `subtitulo`, `cuerpo`, `loop` (+ `numero_fantasma`) |
| `dato-hero` | `kicker`, `dato`, `titulo`, `subtitulo`, `cuerpo`, `loop` |
| `lista` | `kicker`, `titulo`, `subtitulo`, `items` (texto o `{idx, texto, nota}`), `loop` |
| `comparativa` | `kicker`, `titulo`, `subtitulo`, `a.titulo`, `a.items`, `b.titulo`, `b.items`, `loop` |
| `pasos` | `kicker`, `titulo`, `subtitulo`, `pasos[{n, titulo, detalle}]`, `loop` |
| `cita` | `kicker`, `cita`, `autor`, `cuerpo`, `loop` |
| `prompt` | `kicker`, `titulo`, `subtitulo`, `etiqueta`, `prompt`, `loop` |
| `cta-cara` | `titulo`, `subtitulo`, `cuerpo`, `boton` + `marca.avatar`, `marca.handle`, `marca.sello` (no pinta `loop`) |

`imagen` (`src`, `pos`, `sangra`, `prompt`) entra en cualquier layout. `numero_fantasma` también. `sin_top` y `sin_bottom` quitan las barras; úsalos solo con foto a sangre (`imagen.pos: "fondo"`) y nunca `sin_bottom` en la portada: quita el «Desliza».

## Reglas que aplican a todos los tipos

Son las que mide `qa.mjs`. Si las rompes, no hay entrega.

| Regla | Medida |
|---|---|
| Número de láminas | 5 a 20. Ideal 7 a 12. Más de 12: parte en serie (2/2). |
| Título de portada | 4 a 7 palabras, máximo 9. Una palabra en `*acento*`. |
| Lámina 2 | `rol: rehook` o `agitacion`. Promesa concreta + `loop`. |
| Palabras por lámina | ≤ 40. Lámina guardable (`lista`, `pasos`, `prompt`, `comparativa`): ≤ 70. |
| `cuerpo` | ≤ 25 palabras. |
| `kicker` | máximo 1 cada 3 láminas. |
| Open loop | `loop` al pie en al menos la mitad de las láminas `cuerpo`. |
| Lámina guardable | al menos una con layout `lista`, `pasos`, `prompt` o `comparativa`, o con `rol: cheatsheet`. |
| Números | al menos 2 láminas con cifra o porcentaje. |
| CTA | una sola lámina `rol: cta`, la última, layout `cta-cara`. `palabra_clave` escrita en `boton` o `cuerpo` y en el caption. |
| Caption | primera línea ≤ 125 caracteres. 3 a 5 hashtags. |
| Tipografía mínima | título 84 px, texto 38 px, micro 30 px. Margen seguro 80 px. Nada crítico en los 140 px inferiores. |

Tres posiciones fijas dentro de cualquier secuencia:

1. **Lámina 2 = re-enganche.** Repite el dolor o la curiosidad de la portada con otras palabras y promete qué se lleva la persona en la última lámina ("al final tienes los 5 mensajes listos para copiar"). Cierra con `loop`.
2. **El insight más valioso va en la última lámina de `cuerpo`**, que es la penúltima lámina de valor (la última de valor es la cheatsheet). Es el pago por llegar hasta el final. Nunca lo gastes en la lámina 3.
3. **La cheatsheet va justo antes del CTA.** Es la lámina que se guarda: todo el recorrido en una sola pantalla.

El CTA pide una sola acción: comentar la `palabra_clave`. Lo que se entrega por DM (`entregable`) tiene que ser algo que NO está en el carrusel: la plantilla completa, el PDF, el prompt en texto para copiar, el link. Si el carrusel ya lo dio todo, nadie comenta.

## Evidencia del autor (@manueldeleonmjr)

Los tres carruseles con más guardados de la cuenta anuncian la estructura desde la portada:

| Pieza | Alcance | Guardados | Likes | Qué hizo |
|---|---|---|---|---|
| Guía rápida "5 generaciones. 5 formas de vender" | 98,609 | 3,345 | 2,452 | Titular imperativo en dos líneas, subtítulo numérico, chips por categoría, "Desliza →" al pie. Una idea por lámina. |
| "Conecta tu Instagram a Claude" | 54,866 | 3,087 | 1,277 | Herramienta que ya usan + IA. Tres entregables anunciados en portada. |
| Noticia de Claude | 34,882 | 4.23% del alcance | s/d | Titular de contraste + subtítulo con número. |

Lecturas para este documento:

- Los guardados superaron a los likes en las dos primeras. La señal de un carrusel útil es el save, no el like.
- El patrón de portada que se repite es **"N cosas. N formas de X"**: número + categoría + verbo de negocio. Funciona porque la persona ve el mapa completo antes de deslizar.
- La guía de 5 generaciones dejó 36 comentarios con casi 100K de alcance. Entregó todo en las láminas y no reservó nada para el DM. Por eso el CTA con palabra clave y entregable exclusivo es obligatorio.
- Los carruseles con alcance parecido y cero carga útil (noticias ajenas, prueba social, vida personal) se quedan en el like. Regla: si no hay nada que aplicar el lunes, no hay save.

## Los 9 tipos

### guia

- **Cuándo:** N formas de hacer una cosa, cada una con criterio propio (por segmento, por canal, por presupuesto). Tema de negocio universal.
- **Objetivo:** `saves`. Look sugerido: `guia-rapida`.
- **Láminas:** N + 5. Con N = 5 → 10 láminas.
- **Portada:** patrón "N cosas. N formas de X". `chips` con las N categorías. `serie: "Guía rápida"`.

| # | rol | layout | Qué lleva |
|---|---|---|---|
| 1 | `portada` | `portada-titulo` | `titulo` 4-7 palabras con `*acento*`, `subtitulo` numérico, `chips` |
| 2 | `rehook` | `texto-pleno` | Por qué la mayoría lo hace igual para todos + promesa + `loop` |
| 3 a N+2 | `cuerpo` | `punto-numero` ×N | `numero` "01"…, `titulo` = la categoría, `cuerpo` = qué hacer, `loop` |
| N+3 | `cuerpo` | `comparativa` o `dato-hero` | El insight: qué cambia si lo aplicas (cifra o antes/después) |
| N+4 | `cheatsheet` | `lista` | Las N categorías con su regla en una línea cada una |
| N+5 | `cta` | `cta-cara` | `boton: "Comenta GUIA"`; entregable: la versión completa o la plantilla |

### lista

- **Cuándo:** N ítems independientes (herramientas, errores, prompts cortos). Vale por variedad, no por profundidad.
- **Objetivo:** `saves` + `shares`. Look: `guia-rapida` u `oscuro-tech`.
- **Láminas:** N + 4. N entre 5 y 7.
- **Portada:** el número va en el título ("7 errores que *cuestan* clientes").

| # | rol | layout | Qué lleva |
|---|---|---|---|
| 1 | `portada` | `portada-titulo` | Número + sustantivo + consecuencia |
| 2 | `rehook` | `texto-pleno` | A quién le pasa y qué se lleva al final + `loop` |
| 3 a N+2 | `cuerpo` | `punto-numero` ×N | Un ítem por lámina, `cuerpo` ≤ 25 palabras, `loop`. El ítem más fuerte va al final, no al principio |
| N+3 | `cheatsheet` | `lista` | Los N ítems en una pantalla, `items` de una línea |
| N+4 | `cta` | `cta-cara` | Entregable: la lista extendida (los 15 que no cupieron) o el checklist en PDF |

### recurso

- **Cuándo:** algo gratis de una marca que la audiencia ya conoce (curso, herramienta, certificado). Solo si de verdad es gratis: si el certificado se paga, dilo en la lámina.
- **Objetivo:** `shares`. Es la pieza que se reenvía a un hijo, socio o empleado. Look: `recurso`.
- **Láminas:** 7.
- **Portada:** marca reconocible + "gratis" en el título. Sin logos de terceros como imagen: escribe el nombre.

| # | rol | layout | Qué lleva |
|---|---|---|---|
| 1 | `portada` | `portada-titulo` o `portada-foto` | "[Institución] regala [cosa]", `kicker: "Gratis"` |
| 2 | `rehook` | `texto-pleno` | Para quién es y qué te ahorra + `loop` |
| 3 | `cuerpo` | `dato-hero` | `dato` = esfuerzo real ("4 h", "5 módulos") |
| 4 | `cuerpo` | `pasos` | Cómo conseguirlo. Paso 1 = la frase de búsqueda literal entre comillas |
| 5 | `cuerpo` | `texto-pleno` | Reencuadre a negocio: "certifica a tu equipo en vez de pagar agencia" |
| 6 | `cheatsheet` | `lista` | Qué incluye, con `nota` de duración por ítem |
| 7 | `cta` | `cta-cara` | Entregable: el link directo (evita escribir la búsqueda) |

### noticia

- **Cuándo:** un link o captura de algo que cambió esta semana. Caduca en 7 días.
- **Objetivo:** `shares` + `comments`. Look: `noticia`.
- **Láminas:** 7 a 8.
- **Portada:** titular de contraste + `subtitulo` con el número. El titular no puede prometer más de lo que el subtítulo respalda.

| # | rol | layout | Qué lleva |
|---|---|---|---|
| 1 | `portada` | `portada-titulo` | Titular + `subtitulo` numérico |
| 2 | `rehook` | `texto-pleno` | Qué cambió, en una frase. Fuente en `pie` |
| 3 | `cuerpo` | `dato-hero` | La cifra central |
| 4 y 5 | `cuerpo` | `texto-pleno` ×1-2 | Qué significa para un negocio de la audiencia |
| 6 | `cuerpo` | `comparativa` | `a.titulo: "Antes"`, `b.titulo: "Desde hoy"` |
| 7 | `cheatsheet` | `lista` | 3 cosas que hacer esta semana |
| 8 | `cta` | `cta-cara` | Entregable: el link original + resumen |

### tutorial

- **Cuándo:** enseñas a hacer algo en orden, con botones o pantallas reales.
- **Objetivo:** `saves`. Look: `oscuro-tech`.
- **Láminas:** pasos + 5. Con 4 pasos → 9.
- **Portada:** resultado + tiempo ("Cotización lista en *3 minutos*").

| # | rol | layout | Qué lleva |
|---|---|---|---|
| 1 | `portada` | `portada-titulo` | Resultado + tiempo |
| 2 | `rehook` | `texto-pleno` | Qué tienes al terminar + qué necesitas (plan gratis o de pago, dilo) + `loop` |
| 3 a P+2 | `cuerpo` | `punto-numero` ×P | Un paso por lámina. `titulo` = acción en imperativo, `cuerpo` = dónde está el botón |
| P+3 | `cuerpo` | `texto-pleno` | El error que rompe el paso 3 (el insight) |
| P+4 | `cheatsheet` | `pasos` | Los P pasos en una pantalla, `detalle` de una línea |
| P+5 | `cta` | `cta-cara` | Entregable: video del proceso o el prompt/configuración completa |

### contrarian

- **Cuándo:** vas contra una creencia común y tienes evidencia (dato o caso propio).
- **Objetivo:** `shares`. Look: `editorial-mono`.
- **Láminas:** 7 a 8.
- **Portada:** "No necesitas X" o "X está *mal*". La negación al frente.

| # | rol | layout | Qué lleva |
|---|---|---|---|
| 1 | `portada` | `portada-titulo` | La negación |
| 2 | `agitacion` | `texto-pleno` | "Te dijeron que…" + qué te cuesta creerlo + `loop` |
| 3 | `cuerpo` | `cita` o `texto-pleno` | La tesis en una frase |
| 4 | `cuerpo` | `dato-hero` | Evidencia 1: el número |
| 5 | `cuerpo` | `punto-numero` | Evidencia 2: el caso |
| 6 | `cuerpo` | `texto-pleno` | Qué hacer en su lugar (el insight) |
| 7 | `cheatsheet` | `comparativa` | `a.titulo: "Mito"`, `b.titulo: "Realidad"`, 3 ítems por columna |
| 8 | `cta` | `cta-cara` | Entregable: el análisis completo o la plantilla alternativa |

### historia

- **Cuándo:** una experiencia real con conflicto, decisión y resultado medible. Sin conflicto no hay historia: usa `guia`.
- **Objetivo:** `comments` + `follows`. Look: `bosque` o `editorial-mono`.
- **Láminas:** 8 a 9.
- **Portada:** `portada-foto` con foto real y frase corta. Nunca una lámina sin titular.

| # | rol | layout | Qué lleva |
|---|---|---|---|
| 1 | `portada` | `portada-foto` | Frase de 4-7 palabras sobre la foto, `imagen.pos: "fondo"` |
| 2 | `rehook` | `texto-pleno` | Cómo estaba todo antes + `loop` |
| 3 | `cuerpo` | `texto-pleno` | Lo que pasó |
| 4 | `cuerpo` | `texto-pleno` | La decisión |
| 5 | `cuerpo` | `dato-hero` | El resultado con número |
| 6 | `cuerpo` | `cita` | La lección, con `autor` = tú |
| 7 | `cheatsheet` | `lista` | Cómo aplicarlo, 3 puntos |
| 8 | `cta` | `cta-cara` | Pregunta abierta + palabra clave. Entregable: el detalle que no cupo |

### comparativa

- **Cuándo:** dos opciones enfrentadas (herramienta A vs B, método viejo vs nuevo) y un criterio claro para decidir.
- **Objetivo:** `shares`. Look: `oscuro-tech`.
- **Láminas:** 7 a 8.
- **Portada:** "A *vs* B" + para qué.

| # | rol | layout | Qué lleva |
|---|---|---|---|
| 1 | `portada` | `portada-titulo` | A vs B |
| 2 | `rehook` | `texto-pleno` | El criterio con el que se compara + `loop` |
| 3 a 5 | `cuerpo` | `comparativa` ×2-3 | Un criterio por lámina (precio, tiempo, resultado). `a` y `b` con 2-3 ítems |
| 6 | `cuerpo` | `dato-hero` | El número que decide |
| 7 | `cheatsheet` | `comparativa` | `a.titulo: "Usa A si"`, `b.titulo: "Usa B si"` |
| 8 | `cta` | `cta-cara` | Entregable: tabla completa o prueba grabada |

### prompt

- **Cuándo:** el valor es un texto que se copia literal (prompt, configuración, instrucciones del sistema).
- **Objetivo:** `saves`. Look: `oscuro-tech`.
- **Láminas:** 6 a 7.
- **Portada:** qué produce el prompt, no "un prompt". ("El prompt que *cotiza* por mí").

| # | rol | layout | Qué lleva |
|---|---|---|---|
| 1 | `portada` | `portada-titulo` | Resultado del prompt |
| 2 | `rehook` | `texto-pleno` | Qué sale mal con el prompt genérico + `loop` |
| 3 | `cuerpo` | `prompt` | El prompt, `kicker: "Copia esto"`. `prompt` ≤ 45 palabras (≤ 70 en toda la lámina) |
| 4 | `cuerpo` | `prompt` | Variante o segunda parte (opcional) |
| 5 | `cuerpo` | `comparativa` | `a.titulo: "Sin prompt"`, `b.titulo: "Con prompt"`: la respuesta que da la IA |
| 6 | `cheatsheet` | `lista` | 3 reglas para adaptarlo a tu negocio |
| 7 | `cta` | `cta-cara` | Entregable: el prompt en texto para pegar (nadie transcribe de una imagen) |

## Frameworks narrativos mapeados a roles

Adaptado de Carrusel Studio de Ruva IA (youtube.com/@RuvaIA). El framework decide la emoción; los roles del contrato deciden dónde cae cada fase.

| Framework | Secuencia de roles y layouts | Va bien con |
|---|---|---|
| **AIDA** (atención, interés, deseo, acción) | `portada` → `rehook` (interés) → `cuerpo` ×N con `dato-hero` en el deseo → `cheatsheet` → `cta` | `guia`, `lista`, `recurso` |
| **PAS** (problema, agitación, solución) | `portada` = problema → `agitacion` (`texto-pleno`) → `cuerpo` ×N = solución en `punto-numero` o `pasos` → `cheatsheet` → `cta` | `tutorial`, `contrarian`, `prompt` |
| **BAB** (antes, después, puente) | `portada` = antes (`dato-hero` o `texto-pleno`) → `rehook` = después con cifra → `cuerpo` = el puente en `pasos` → `cheatsheet` → `cta` | `historia`, `comparativa` |
| **Viaje del héroe condensado** | `portada` = status quo → `rehook` = lo que cambió → `cuerpo` `texto-pleno` = crisis → `cuerpo` `cita` = el insight → `cuerpo` `dato-hero` = transformación → `cheatsheet` = lección → `cta` | `historia` |
| **Lista pura** | `portada` → `rehook` → `punto-numero` ×N → `cheatsheet` `lista` → `cta` | `lista`, `guia` |
| **Mito vs realidad** | `portada` = la premisa negada → `agitacion` = "te dijeron que" → `cuerpo` = por qué falla (`dato-hero` + `punto-numero`) → `cuerpo` = la verdad → `cheatsheet` `comparativa` (Mito / Realidad) → `cta` | `contrarian`, `noticia` |

Regla de Ruva IA que se conserva: todo carrusel lleva gancho, contexto, tesis, evidencia, insight y CTA. Si falta uno, se siente incompleto. En este contrato: gancho = `portada`, contexto = `rehook`/`agitacion`, tesis y evidencia = `cuerpo`, insight = última lámina `cuerpo`, guardable = `cheatsheet`, acción = `cta`.

## Árbol de decisión: 7 preguntas para elegir el tipo

Responde en orden. La primera que dé "sí" decide.

1. **¿Parte de un link o captura de algo que pasó esta semana?** → `noticia`.
2. **¿El valor es un texto que se copia tal cual (prompt, configuración)?** → `prompt`.
3. **¿Regalas algo de una marca que la audiencia ya conoce y es gratis de verdad?** → `recurso`.
4. **¿Enseñas a hacer algo en orden, con pantallas o botones reales?** → `tutorial`.
5. **¿Vas contra una creencia común y tienes un dato o caso que lo sostenga?** → `contrarian`.
6. **¿Es una experiencia propia con conflicto y resultado medible?** → `historia`.
7. **¿Son dos opciones enfrentadas con un criterio para decidir?** → `comparativa`.

Si todo dio "no": tienes N ítems. Si son independientes entre sí (herramientas, errores), es `lista`. Si son N formas de hacer una misma cosa con criterio (por segmento, por canal, por etapa), es `guia`. En duda, `guia`: es el tipo con más guardados en la cuenta del autor.

## Cómo escribir el `loop`

El `loop` es una frase de 3 a 8 palabras al pie que obliga a deslizar. El render le agrega la flecha; no la escribas.

| Sirve | No sirve |
|---|---|
| "El tercero casi nadie lo hace" | "Sigue leyendo" |
| "Aquí es donde se pierde el dinero" | "Continúa" |
| "El que más guarda va al final" | "Desliza para más" |
| "Esto cambia en la 6" | "Y hay más" |

Ponlo en la lámina 2 y en al menos la mitad de las de `cuerpo`. No lo pongas en la cheatsheet ni en el CTA.

## Cómo escribir el CTA (`cta-cara`)

```json
{
  "rol": "cta",
  "layout": "cta-cara",
  "titulo": "¿Quieres la *plantilla* completa?",
  "cuerpo": "Comenta PLANTILLA y te la mando por DM.",
  "boton": "Comenta PLANTILLA"
}
```

- `palabra_clave` en mayúsculas, la misma en `boton`, en el caption y en la respuesta automática.
- Una sola acción. Nada de "guarda, comparte y sígueme".
- `marca.avatar` con foto real: la cara al final es lo que convierte alcance en seguidores.
- El `entregable` tiene que existir antes de publicar. Si el DM no entrega, la mecánica se quema.

## Checklist antes de renderizar

- [ ] `tipo` y `objetivo` elegidos con el árbol.
- [ ] Portada con patrón "N cosas. N formas de X" o negación o dato, 4-7 palabras, `*acento*`.
- [ ] Lámina 2 con `rol: rehook` o `agitacion`, promesa y `loop`.
- [ ] Insight más fuerte en la última lámina `cuerpo`.
- [ ] Una lámina `cheatsheet` con layout `lista`, `pasos`, `prompt` o `comparativa`, ≤ 70 palabras.
- [ ] ≥ 2 láminas con cifras.
- [ ] Última lámina `rol: cta`, layout `cta-cara`, `palabra_clave` en `boton` y en caption.
- [ ] `entregable` definido y NO contenido en el carrusel.
- [ ] Máximo 12 láminas. Si hay más, serie.
- [ ] `node scripts/qa.mjs <carpeta>` sin errores.

## Ajustes que salieron de las pruebas (2026-09-06)

- **Tutorial con 5 o más pasos**: la lámina guardable va en `lista` (el layout `pasos` cabe hasta 4). Si son 5-7 pasos, `lista` con `nota` corta por paso.
- **Varios recursos en una pieza** («N certificaciones gratis de marcas conocidas»): el tipo es `lista`, no `recurso`. `recurso` es para UN solo recurso con su dato de esfuerzo y sus pasos para conseguirlo.
- **Una `comparativa` dentro del cuerpo de una lista** está permitida cuando aclara una confusión frecuente («Ojo: tres que parecen gratis y no»). Cuenta como lámina de cuerpo, no como la guardable.
- **Tiempos de configuración**: la portada de un tutorial no promete «en 3 minutos» ni «en segundos» si el paso 1 exige instalar o configurar. Se promete el resultado; el tiempo real va en la lámina 2 después de la promesa.
- **Idioma y costo real** en `recurso` y `lista` de recursos: cada ítem dice en qué idioma está y si el certificado (no solo el curso) es gratis. edX/HarvardX cobran el certificado verificado; Google AI Essentials cobra por mes; CS50 da certificado gratis. Verificar el día que se escribe.
- **El loop compromete**: si el `loop` de la lámina N promete «el error que lo tira todo», el título de la lámina N+1 nombra ese error. QA no lo mide; se revisa leyendo en voz alta.
- **CTA de una sola acción**: `boton: "Comenta PALABRA"`, título con la pregunta, cuerpo ≤15 palabras que dice qué llega por DM. La lámina guardable ya pidió el guardado con el kicker «Guarda esto».
