# Avatares con estilo a partir de las fotos reales

Un avatar es la cara de la marca dibujada en el estilo del look. Sirve cuando la foto real
pesa demasiado (láminas de cuerpo, cheatsheet, CTA con humor) o cuando el carrusel quiere
un tono distinto al de la foto de estudio. **Nunca sustituye a la foto real en la portada
por omisión**: la portada lleva la cara real salvo que el tema pida ilustración.

## Un estilo por look (probado el 2026-09-06)

| Look | Estilo | Prompt base (en inglés al modelo) | Fondo que pedir |
|---|---|---|---|
| guia-rapida | Vector plano | flat vector illustration, clean geometric shapes, bold black outlines, limited palette (electric blue #0044DD, bone white, black) | plain solid bone-white |
| noticia | Pop-art de medios tonos | pop-art halftone comic illustration, bold ink outlines, Ben-Day dots, palette deep navy #071B4A + bright yellow #FFD200 + white + black | plain solid deep navy |
| oscuro-tech | Pintura semirrealista con neón | semi-realistic digital painting, near-black background, orange-to-pink neon rim light on face and shoulders, painterly but faithful, no cartoon exaggeration | near-black |
| recurso | Papel recortado | layered paper cut-out illustration, craft-paper textures, soft drop shadows between layers, palette cream #FBF7F0 + terracotta #BE4B2F + warm brown | plain solid cream |
| bosque | Linograbado a dos tintas | two-color linocut print, carved block-print texture with visible tool marks, deep forest green #0F3D2E ink + amber #E0B24A highlights on bone paper | plain bone paper |
| editorial-mono | Grabado a una tinta | one-color ink engraving, editorial newspaper style, fine cross-hatching, high contrast black ink on paper white | paper-white |

Estilos que **no** funcionaron: 3D tipo Pixar (redondea la cara y el parecido se pierde) y
cualquier estilo generado desde una foto oscura o de baja resolución (el modelo inventa
rasgos). Descartado también «caricatura exagerada»: el público de 35-60 lo lee como burla.

## Receta (Higgsfield, desde Claude Code)

1. **Referencias**: 2-3 fotos reales del banco (`assets/fotos/reales/`), nítidas, fondo liso,
   cara de frente y un tres cuartos. Si ya están en la nube (`url` en `catalogo.json`),
   `media_import_url` con esa URL devuelve el `media_id`; si no, `media_upload` → `curl PUT`
   → `media_confirm`. Los `media_id` viven 24 h: no los guardes como permanentes.
2. **Generación**: `generate_image_batch` con `nano_banana_pro`, `aspect_ratio 3:4`,
   `resolution 2k`, `medias: [{role: "image_references", value: <media_id>} × 3]` y el
   prompt: `"<estilo> avatar of the man in the reference photos. Keep his exact facial
   features: <3-4 rasgos concretos: forma de cara, pelo, barba o sin barba, ojos, tono de
   piel> so he is clearly recognizable. Waist-up, <pose>, <ropa>. <paleta>. Plain solid
   <fondo> background. No text, no logo, no watermark."` Un avatar por pose; 4-6 por tanda.
3. **Recorte**: `remove_background {media_id: <job_id>, media_type: "image"}` sobre cada
   generación; descarga el PNG a `avatares/<nombre>-recorte.png`. El fondo liso hace que
   el recorte salga limpio a la primera.
4. **Registro**: `scripts/banco-fotos.py avatar <archivo> --estilo <estilo> --look <look>
   --pose "<pose>" --origen <job_id> --referencias real-01,real-03,real-11`, y luego
   `banco-fotos.py subir` para que el avatar tenga URL.

Nombre de archivo: `avatar-NN-<estilo>-<look>-<pose>.png` (y su `-recorte.png`).

## Cómo se usa en una lámina

- El avatar entra como `imagen.src` con `pos: "recorte"` o `"derecha"`, igual que una foto.
- Un carrusel usa **una sola cara**: o fotos reales o un solo estilo de avatar, nunca mezcla
  estilos ni mezcla foto real con avatar en láminas contiguas (rompe la identidad).
- El estilo debe ser el del look de ese carrusel (tabla de arriba). Un avatar pop-art en un
  carrusel `recurso` se ve pegado.
- Poses útiles por rol: portada → brazos cruzados o mano en el mentón; cuerpo → explicando
  con las manos, señalando, mostrando el celular; CTA → riendo o señalando a cámara.

## Cuándo pedir avatares nuevos

- Falta la pose que pide el tema (p. ej. «escribiendo en el celular», «con una taza»).
- Cambia el look de rotación y no hay avatar de ese estilo.
- El usuario cambió de imagen (corte de pelo, barba, lentes): regenera la tanda con fotos nuevas.
