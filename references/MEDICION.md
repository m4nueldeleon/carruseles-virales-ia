# Medir y aprender

Este documento dice qué medir después de publicar un carrusel, cuándo, con qué umbrales y qué decisión dispara cada resultado. También explica cómo `scripts/medir.py` guarda esos números y cómo la skill los usa para el siguiente carrusel. Los nombres de campos (`look`, `tipo`, `palabra_clave`, `entregable`, `objetivo`) son los del contrato `templates/carrusel.schema.json`. Los nombres de métricas son los que escribe `medir.py`.

Regla de fondo: un carrusel que no se mide no enseña nada. Mide dos veces (48 h y 7 días), anota una línea de aprendizaje y sigue.

## Qué métricas importan y por qué

Un carrusel tiene dos públicos: seguidores y no seguidores. Lo que decide si sale del primero al segundo es lo que la gente hace con él, no lo que siente. Orden de prioridad:

| # | Métrica | Campo en `medir.py` | Qué mide | Por qué manda |
|---|---|---|---|---|
| 1 | Compartidos | `shares`, `share_rate` | Envíos por DM y a historias | Señal número uno del ranking para no seguidores. Un envío es una recomendación personal. |
| 2 | Guardados | `saves`, `save_rate` | Gente que lo quiere para después | Mide valor aplicable. Un carrusel útil tiene más guardados que likes. |
| 3 | Comentarios con palabra clave | `comments` (total) + `comentarios_clave` (a mano) | Personas que pidieron el `entregable` | Es la conversión. Lo que entra al embudo. |
| 4 | Seguidores por pieza | `follows` | Cuentas que te siguieron desde ese post | Convierte alcance en base. Para carruseles (FEED) la API sí lo trae: `media_follows`. En la app está en Actividad del perfil. |
| 5 | Vistas entre alcance | `views` / `reach` | Veces en pantalla por cuenta única | ≥ 1.5 indica que pasan láminas o regresan. Es un proxy, no una métrica oficial de deslizamiento. |
| 6 | Alcance | `reach` | Cuentas únicas | Es el resultado, no la causa. Sirve para calcular tasas y comparar contra la mediana. |
| 7 | Likes | `likes` | Aprobación pasiva | Va al final. Pesa poco para no seguidores y no dice si el contenido se aplica. |

Las tasas se calculan sobre alcance, no sobre seguidores:

- `save_rate` = guardados / alcance × 100
- `share_rate` = compartidos / alcance × 100

`medir.py` las calcula solo. Los umbrales de referencia para una cuenta de 100K a 1M (adaptados de la metodología de auditoría de Instagram 2026, con confianza media):

| Tasa | Bajo | Normal | Fuerte | Viral |
|---|---|---|---|---|
| `share_rate` | < 0.5% | 0.5 a 1% | 1 a 2% | ≥ 3% |
| `save_rate` | < 1% | 1 a 2.5% | 2.5 a 5% | ≥ 5% |
| `save_rate` + `share_rate` | < 0.6% | 0.6 a 1.5% | ≥ 1.5% | ≥ 5% |

Estos números son de arranque. En cuanto tengas 8 carruseles medidos, la mediana de tu propia cuenta manda (ver protocolo).

### Evidencia del autor (@manueldeleonmjr)

Tres carruseles públicos de la cuenta, con lo que hicieron:

| Pieza | Alcance | Guardados | Compartidos | Likes | Seguidores | Qué pasó |
|---|---|---|---|---|---|---|
| Guía rápida "5 generaciones. 5 formas de vender" | 98,609 | 3,345 | 1,160 | 2,452 | 163 | Guardados por encima de likes. `save_rate` 3.4%, `share_rate` 1.2%. Entregó todo en láminas y dejó pocos comentarios: no reservó nada para el DM. |
| "Conecta tu Instagram a Claude" | 54,866 | 3,087 | 1,439 | 1,277 | 334 | Guardados 2.4 a 1 sobre likes. `share_rate` 2.6%: herramienta que ya usan + IA se comparte. El mejor en seguidores por pieza. |
| Noticia de IA en Wall Street | 34,882 | 1,474 | 709 | s/d | 226 | `save_rate` 4.2%, `share_rate` 2.0%. Titular de contraste + subtítulo con cifra. |

Lo que enseñan para este documento: los tres superaron por 6 a 18 veces la mediana de alcance de carrusel de la cuenta ese año. El alcance llegó después de los guardados y compartidos, no antes. Y el que más seguidores dejó no fue el de más alcance: fue el que más se compartió.

## Qué no usar

| Métrica | Por qué no |
|---|---|
| `media_reel_avg_watch_time`, `media_reel_skip_rate`, `media_reel_total_watch_time` | Son de reels. Para un carrusel llegan vacías o en cero. Watch time no existe en carrusel. |
| `media_engagement` | Suma likes + comentarios + guardados sin distinguir. Esconde la señal que importa. |
| Impresiones | Retiradas de la API en abril de 2025. Usa `views`. |
| Likes como métrica principal | Un carrusel con 2,000 likes y 40 guardados es entretenimiento, no valor. |
| Seguidores totales del día | Mezcla el efecto de todas las piezas. Usa `follows` por pieza. |
| Alcance a las 6 horas | Demasiado pronto. Instagram da a los carruseles una "segunda oportunidad" (muestra la lámina 2 a quien no deslizó) y el alcance sigue subiendo 2 a 5 días. |
| Comentarios totales como conversión | Cuenta solo los que traen la `palabra_clave`. Los demás son conversación, no pedido. |

## Protocolo: 48 horas y 7 días

Dos mediciones por carrusel. Ni más ni menos. La primera dice si vale la pena empujarlo. La segunda es el veredicto.

### La mediana de la cuenta

Todo umbral es relativo a la mediana de alcance de tus carruseles, no a un número fijo:

1. Con 8 o más carruseles en `historico.json`: mediana de `reach` de los últimos 90 días (o de los últimos 20 carruseles si publicas poco).
2. Con menos de 8: usa los umbrales absolutos de la tabla de tasas y, como línea de flop, alcance < 1% de tus seguidores.
3. Recalcula la mediana cada mes. No la congeles.

Clasificación:

| Resultado | Alcance a 7 días | Además |
|---|---|---|
| **Hit** | ≥ 3× mediana | `share_rate` o `save_rate` en "fuerte" o más |
| **Normal** | 0.5× a 3× mediana | tasas en "normal" |
| **Flop** | < 0.5× mediana | o tasas en "bajo" aunque el alcance sea normal |

Un carrusel con alcance normal y `share_rate` alto (≥ 1.5%) NO es normal: es un hit que Instagram todavía no distribuyó. Trátalo como hit.

### A las 48 horas

Mide `reach`, `views`, `saves`, `shares`, `comments`, `follows` y cuenta a mano los comentarios con la `palabra_clave`. Decisiones que se toman aquí y no después:

| Caso a 48 h | Señal | Decisión |
|---|---|---|
| Pinta a hit | `share_rate` ≥ 1.5% o `save_rate` ≥ 2.5%, alcance ya ≥ 1× mediana | Pautar ahora (ver abajo). Responder cada comentario con palabra clave dentro de la hora. Preparar la parte 2 de la serie. |
| Pinta a normal | Tasas entre 0.5 y 1.5%, alcance entre 0.5× y 1× mediana | Nada. Esperar a 7 días. No pautar. |
| Muere en la portada | Alcance < 0.3× mediana, `views` / `reach` < 1.3 | La portada no detiene el pulgar. Anotar el hook como perdedor. No volver a usarlo en 60 días. |
| Deslizan pero no actúan | `views` / `reach` ≥ 1.5, `save_rate` < 0.6% y `share_rate` < 0.3% | La portada funciona y el cuerpo no. Falta lámina guardable o dato. Repetir el hook con otro cuerpo. |
| Guardan, no comentan | `save_rate` ≥ 2% y comentarios con palabra clave < 0.1% del alcance | El `entregable` no vale más que el carrusel. Cambiar entregable, no el carrusel. |

### A los 7 días

Vuelve a medir todo. Esta es la que va a la bitácora y la que decide el siguiente carrusel:

| Veredicto | Decisión sobre formato y serie | Decisión sobre hook | Decisión sobre pauta |
|---|---|---|---|
| Hit | Repetir `tipo` y `look` en una serie de 3 (mismo `serie`, mismo `look`, otro tema). Publicar la parte 2 en ≤ 14 días. | Guardar la fórmula del hook (no el texto) como ganadora. Reusarla en el siguiente tema. | Si no se pautó a 48 h y `share_rate` ≥ 1.5%, pautar ahora. |
| Normal | Nada cambia. Rotar `look` en el siguiente. | Probar otra fórmula de hook con el mismo tema si el tema tiene tirón (`save_rate` ≥ 1.5%). | No pautar. |
| Flop | No repetir esa combinación `tipo` + tema en 60 días. Rotar `look`. | Marcar el hook como flop. Si la portada tenía logos de terceros o imagen genérica, ese es el primer sospechoso. | Nunca pautar un flop. |

Una regla más: dos flops seguidos con el mismo `look` y temas distintos → aparcar ese `look` 30 días. Tres hits con el mismo `tipo` → ese `tipo` se vuelve el default de la cuenta hasta que deje de serlo.

### Cómo pautar un hit

Adaptado de la metodología de auditoría de Instagram 2026 (sección de pauta). Objetivo: comprar alcance a no seguidores, no likes.

- Ads Manager → objetivo Tráfico → ubicación de conversión "Perfil de Instagram" → publicación existente (el carrusel ya publicado, para no perder la prueba social).
- Excluir audiencia personalizada de la cuenta de Instagram (últimos 90 días). Ya te siguen; no pagues por ellos.
- Presupuesto de prueba: 3 días. Si el costo por seguidor sube más del doble del día 1 al día 3, apagar.
- Si lo haces desde la app de iOS con "Promocionar", la tienda cobra comisión. Hazlo desde el navegador o Ads Manager.
- Mide con la métrica "Seguidores de Instagram" de Ads Manager y anota `follows` de la pauta aparte del orgánico.

## Cómo anotar con `scripts/medir.py`

`medir.py` guarda cada medición en `metadata.json` (dentro de la carpeta del carrusel) y actualiza `historico.json` (en la carpeta padre, donde viven todos los carruseles).

### Antes de medir: `metadata.json` debe existir

`medir.py` lee de `metadata.json` los campos `slug`, `fecha`, `look`, `tipo`, `hook` y `palabra_clave` para escribir el renglón del histórico. Si el archivo no existe, lo crea vacío y el histórico queda sin `look` ni `hook`, que es justo lo que la skill necesita para aprender. Por eso, al publicar, escribe el archivo con esos campos copiados de `carrusel.json`:

```json
{
  "slug": "5-tipos-de-cliente",
  "fecha": "2026-09-08",
  "look": "guia-rapida",
  "tipo": "guia",
  "objetivo": "saves",
  "hook": "5 tipos de cliente. 5 formas de cerrar.",
  "palabra_clave": "CIERRE",
  "entregable": "guion de respuesta por tipo de cliente (PDF)",
  "indice_qa": 84
}
```

`hook` es el `titulo` de la lámina 1 sin los asteriscos del acento. `indice_qa` es el índice de viralidad que dejó `qa.mjs` en `qa.json`; anotarlo aquí permite calibrarlo después.

### Camino 1: Windsor.ai (API de Instagram)

Requiere dos variables de entorno. Nunca las escribas en el repo ni en `metadata.json`:

```bash
export WINDSOR_API_KEY="..."     # tu llave de Windsor.ai
export IG_ACCOUNT_ID="..."      # el identificador de la cuenta conectada en Windsor
python3 scripts/medir.py carruseles/5-tipos-de-cliente --permalink https://www.instagram.com/p/XXXXXXXX/
```

Qué hace: consulta el conector `instagram` de Windsor con los campos `media_reach`, `media_views`, `media_saved`, `media_shares`, `media_like_count`, `media_comments_count`, `media_follows` y `media_profile_visits`, busca la fila cuyo `media_permalink` contiene el código del link y guarda `reach`, `views`, `saves`, `shares`, `likes`, `comments`, `follows`, `profile_visits` con `fuente: "windsor"`.

Detalles que fallan:

- La ventana por omisión es de 60 días (`--dias 60`). Si el carrusel es más viejo, sube el número: `--dias 120`.
- El `--permalink` tiene que ser el del post, no el de una lámina ni el de un share. Formato `https://www.instagram.com/p/CODIGO/`.
- `follows` puede llegar vacío en las primeras horas. Si a los 7 días sigue vacío, anótalo a mano con `--manual`.
- Windsor no da comentarios con palabra clave. Eso se cuenta a mano siempre.

### Camino 2: a mano desde Insights de la app

Abre el post → "Ver estadísticas". Copia Alcance, Visualizaciones, Guardados, Compartidos, Me gusta, Comentarios y, en Actividad del perfil, Seguimientos. Cuenta los comentarios con la palabra clave.

```bash
python3 scripts/medir.py carruseles/5-tipos-de-cliente --manual reach=12055 views=21400 saves=921 shares=262 likes=440 comments=154 follows=38 comentarios_clave=97
```

Cada par `clave=valor` se guarda tal cual (los enteros como número). Puedes agregar claves propias: `comentarios_clave`, `dms_enviados`, `follows_pauta`. Esas claves extra quedan en `metadata.json` pero NO pasan al histórico, que solo lleva `reach`, `saves`, `shares`, `comments`, `follows`, `save_rate` y `share_rate`.

### Qué guarda

En `metadata.json`, una lista `mediciones` con una entrada por corrida:

```json
"mediciones": [
  { "fuente": "windsor", "reach": 6120, "views": 9800, "saves": 140, "shares": 41, "likes": 220, "comments": 31, "follows": 9, "profile_visits": 88, "save_rate": 2.29, "share_rate": 0.67, "medido_en": "2026-09-10T09:30" },
  { "fuente": "manual", "reach": 12055, "views": 21400, "saves": 921, "shares": 262, "likes": 440, "comments": 154, "follows": 38, "comentarios_clave": 97, "save_rate": 7.64, "share_rate": 2.17, "medido_en": "2026-09-15T08:10" }
]
```

En `historico.json`, un renglón por `slug`: `slug`, `fecha`, `look`, `tipo`, `hook`, `palabra_clave`, `reach`, `saves`, `shares`, `comments`, `follows`, `save_rate`, `share_rate`, `medido_en`. **La última medición pisa a la anterior** en el histórico. Por eso el orden importa: mide a 48 h, mide a 7 días, y el histórico se queda con la de 7 días. `metadata.json` conserva las dos.

Si necesitas comparar 48 h contra 7 días para varios carruseles, lee `mediciones` de cada `metadata.json`; no lo busques en el histórico.

## Cómo usa la skill el histórico

Antes de proponer un carrusel nuevo, la skill lee `historico.json` de la carpeta padre. Con menos de 5 renglones no cambia nada: usa los defaults. Con 5 o más, aplica estas reglas en orden:

### 1. Rotar `look`

- No repetir el `look` del carrusel anterior, salvo que el nuevo sea parte de la misma `serie`.
- Un `look` con dos flops seguidos (temas distintos) se aparca 30 días.
- Un `look` con el mejor promedio de `save_rate` + `share_rate` en los últimos 10 carruseles se propone primero cuando el `objetivo` es `saves` o `shares`.
- Adaptado de Carrusel Studio de Ruva IA (youtube.com/@RuvaIA): el sistema visual se guarda y se reutiliza; se cambia a fondo solo cuando la marca cambia, no por aburrimiento. Aquí eso se traduce en rotar entre los seis looks del contrato, no en inventar uno nuevo por carrusel.

### 2. Reutilizar hooks ganadores

Se reutiliza la fórmula, no la frase. De cada hit, la skill extrae el patrón de la portada:

| Hook del hit | Fórmula extraída | Cómo se reusa |
|---|---|---|
| "5 generaciones. 5 formas de vender." | N cosas. N formas de X. | "4 tipos de cliente. 4 formas de cerrar." |
| "Conecta tu Instagram a Claude" | Conecta [herramienta que ya usas] a [IA] | "Conecta tu WhatsApp a ChatGPT" |
| "La IA ya entró a Wall Street" | [Actor] ya [verbo de hecho consumado] | "La IA ya cotiza por ti" |

Regla: una fórmula ganadora se reusa máximo 3 veces seguidas. A la cuarta, aunque siga funcionando, se cambia; el público la reconoce y deja de detenerse.

### 3. No repetir un flop

- Misma combinación `tipo` + tema con `reach` < 0.5× mediana: no se propone en 60 días.
- Mismo hook (misma fórmula y mismo tema) de un flop: no se propone nunca sin cambiar al menos dos de tres: fórmula, tema o `look`.
- Si un `entregable` dejó comentarios con palabra clave < 0.1% del alcance en dos carruseles, ese entregable se retira.

### 4. Calibrar el índice de viralidad

`qa.mjs` calcula un índice de 0 a 100 antes de publicar: gancho (24 puntos), estructura (41), legibilidad (28) y copy (15). Mide forma, no tema. El histórico es lo que dice si la forma predice el resultado en tu cuenta:

1. Cuando tengas 10 carruseles con `indice_qa` en `metadata.json` y resultado a 7 días, arma una tabla: `indice_qa`, `share_rate`, `save_rate`, veredicto.
2. Si los carruseles con índice ≥ 80 tienen mediana de `share_rate` mayor que los de índice < 80, el índice sirve. Sigue usando 80 como corte.
3. Si no hay diferencia, el índice está midiendo cosas que a tu público no le importan. Busca qué componente sí separa hits de flops (casi siempre es `gancho`) y exige más ahí: por ejemplo, no publicar con `gancho` < 20 aunque el total pase de 80.
4. Si los hits comparten una fórmula de hook que `qa.mjs` no reconoce (el aviso "El gancho no usa ninguna fórmula probada" salió y aun así fue hit), agrega esa fórmula a `FORMULAS_HOOK` en `scripts/qa.mjs`. Así el índice aprende de tu cuenta.

No cambies los pesos del índice antes de tener 10 mediciones. Con menos, el ruido manda.

## Bitácora por carrusel

Una línea por carrusel. Vive en `BITACORA.md` junto a `historico.json`. Se llena a los 7 días, no antes. Los números salen de `metadata.json`; la última columna la escribe una persona.

| Fecha | Slug | Look | Tipo | Hook (fórmula) | Palabra clave | Entregable | 48 h (reach / save% / share%) | 7 d (reach / save% / share% / follows / clave) | Veredicto | Aprendizaje (una línea) |
|---|---|---|---|---|---|---|---|---|---|---|
| 2026-09-08 | 5-tipos-de-cliente | guia-rapida | guia | N cosas. N formas de X. | CIERRE | Guion por tipo (PDF) | 6,120 / 2.3 / 0.7 | 12,055 / 7.6 / 2.2 / 38 / 97 | Hit | El entregable que no está en el carrusel duplicó los comentarios con palabra clave respecto al anterior. |
| 2026-09-11 | noticia-modelo-nuevo | noticia | noticia | [Actor] ya [hecho] | LUNES | Lista de 3 acciones | 1,900 / 0.4 / 0.2 | 2,300 / 0.5 / 0.2 / 1 / 4 | Flop | Portada con logo ajeno y sin cifra. La noticia sola no se guarda; falta la consecuencia para el dueño. |

Reglas de la bitácora:

- El aprendizaje es una sola frase con sujeto y consecuencia. "Funcionó bien" no es un aprendizaje. "La cheatsheet en la lámina 7 concentró el 60% de los guardados según los comentarios" sí lo es.
- Si el aprendizaje contradice a uno anterior, gana el más reciente y se anota la contradicción.
- Cada 10 carruseles, lee la columna de aprendizajes completa y resume tres reglas. Esas tres reglas van a `templates/MI-MARCA.md`, sección 6 ("Lo que ya sabes que funciona"). Ahí es donde la skill las lee la próxima vez.

## Checklist de medición

- [ ] `metadata.json` escrito al publicar con `slug`, `fecha`, `look`, `tipo`, `hook`, `palabra_clave`, `entregable`, `indice_qa`.
- [ ] Medición a 48 h con `medir.py` (Windsor o `--manual`). Comentarios con palabra clave contados a mano.
- [ ] Decisión de 48 h tomada: pautar, esperar o marcar hook.
- [ ] Medición a 7 días con `medir.py`. Es la que queda en `historico.json`.
- [ ] Veredicto contra la mediana de la cuenta: hit ≥ 3×, flop < 0.5×.
- [ ] Renglón en `BITACORA.md` con aprendizaje de una línea.
- [ ] Hits: fórmula de hook guardada y parte 2 de la serie en ≤ 14 días.
- [ ] Flops: combinación `tipo` + tema bloqueada 60 días; `look` revisado.
- [ ] Cada 10 carruseles: calibrar `indice_qa` contra `share_rate` y actualizar `MI-MARCA.md`.

## Claves de metadata.json

Las claves canónicas están en `templates/metadata.ejemplo.json` (`slug, fecha, tema, tipo, objetivo, look, laminas, hook, palabra_clave, entregable, entregable_existe, referencia, indice_qa, veredicto_qa, rondas_qa, imagenes, fuentes, mediciones, notas`). `medir.py` lee `slug, fecha, look, tipo, hook, palabra_clave` para el histórico y añade `mediciones[]`.

`medir.py` también calcula `like_rate` (likes ÷ alcance). Se comparan tasas contra la mediana de la cuenta, nunca totales: la señal de ranking es interacción sobre alcance.
