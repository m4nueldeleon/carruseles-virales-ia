# Ejemplos

Cada carpeta es un carrusel completo tal como lo deja la skill: `carrusel.json` (el guion),
`slides/` (los PNG numerados), `preview.jpg`, `caption.txt`, `qa.json` y `metadata.json`.

| Carpeta | Tipo | Look | Índice QA |
|---|---|---|---|
| `2026-09-06-cotizar-sin-perder-dinero/` | lista (guía de errores) | editorial-mono | 97/100 |

La marca de los ejemplos es ficticia (`@tumarca`). Para re-renderizar:

```bash
node scripts/render.mjs ejemplos/2026-09-06-cotizar-sin-perder-dinero
node scripts/qa.mjs ejemplos/2026-09-06-cotizar-sin-perder-dinero
```
