# LECCIONES · Carruseles Virales IA

Bitácora de lo que se aprendió usando la skill: qué pasó → qué se aprendió → qué regla cambió y en qué
archivo. La más nueva arriba. Las correcciones del usuario se escriben en el momento en el archivo de
`references/` que corresponde (SKILL.md §9); aquí queda el registro de qué cambió y por qué.

## 21-oct-2026 · Actualización general de skills

- Revisión contra el estándar de skills (descripción, tamaño, referencias, portabilidad): la skill ya
  cumplía. En SKILL.md solo cambió §9: cada corrección también se registra aquí.
- `references/AVATARES.md`: matiz al «3D tipo Pixar no funciona». Ese fallo fue con `nano_banana_pro`; el
  19-oct-2026 un personaje 3D estilo animación hecho con `gpt_image_2` (calidad `high`, tres fotos reales
  nítidas como referencia) sí conservó el parecido y quedó aprobado. `gpt_image_2_5` sale con la cara ancha.
- Verificado que `assets/fotos/reales/catalogo.json`, `assets/fotos/soul/` y `assets/img/NN-*.png` son
  rutas de la carpeta de trabajo del usuario o del carrusel (salidas), no archivos que falten en el repo.
- Se crea este archivo para que el ciclo de aprendizaje tenga un registro fijo.
