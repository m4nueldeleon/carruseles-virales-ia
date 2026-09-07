# Graph Report - carruseles-virales-ia  (2026-09-06)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 479 nodes · 595 edges · 45 communities (31 shown, 14 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.85)
- Token cost: 1,137 input · 404 output

## Graph Freshness
- Built from commit: `dc230e08`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- JSON Schema Metadata
- Content Schema Definitions
- Photo Catalog Management
- Editorial Content Types
- Playwright Automation Scripts
- HTML Slide Generator
- File Writing Utilities
- Schema Validation Rules
- Output Schema Definitions
- Slide Element Properties
- Brand Profile Metadata
- Visual Style Selection
- Cloud Storage Sync
- Layout and Social Elements
- Generic Schema Properties
- Carousel Schema Definition
- Image Styling Properties
- Marketing Copy Components
- Reference Material Processing
- Text Alignment Options
- Methodology Documentation
- Side Placement Options
- Environment Setup Scripts
- Alt Text Schema
- Sticker Element Schema
- Measurement Scripts
- Button Element Schema
- Body Text Schema
- Data Point Schema
- Visual Texture Schema
- Kicker Text Schema
- Loop Element Schema
- Carousel Data Files
- Carousel Examples
- Installation Scripts
- Viral Psychology Research
- Packaging Scripts
- pie
- sin_top
- subtitulo
- Hermes Routine
- Carruseles Virales IA README
- Avatars Reference
- Step-by-Step Tutorial

## God Nodes (most connected - your core abstractions)
1. `enum` - 13 edges
2. `construir_parser()` - 12 edges
3. `null` - 10 edges
4. `enum` - 10 edges
5. `enum` - 10 edges
6. `string` - 9 edges
7. `cargar_catalogo()` - 8 edges
8. `cmd_cosechar()` - 8 edges
9. `cmd_curar()` - 8 edges
10. `incorporar()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `enum` --extends--> `bosque`  [EXTRACTED]
  templates/carrusel.schema.json → hermes/esquema-salida.json
- `enum` --extends--> `editorial-mono`  [EXTRACTED]
  templates/carrusel.schema.json → hermes/esquema-salida.json
- `enum` --extends--> `guia-rapida`  [EXTRACTED]
  templates/carrusel.schema.json → hermes/esquema-salida.json
- `enum` --extends--> `oscuro-tech`  [EXTRACTED]
  templates/carrusel.schema.json → hermes/esquema-salida.json
- `enum` --extends--> `contrarian`  [EXTRACTED]
  templates/carrusel.schema.json → hermes/esquema-salida.json

## Import Cycles
- None detected.

## Communities (45 total, 14 thin omitted)

### Community 0 - "JSON Schema Metadata"
Cohesion: 0.05
Nodes (44): 1:1, 3:4, 4:5, 9:16, description, type, description, type (+36 more)

### Community 1 - "Content Schema Definitions"
Cohesion: 0.08
Nodes (36): type, properties, type, type, type, properties, type, type (+28 more)

### Community 2 - "Photo Catalog Management"
Cohesion: 0.17
Nodes (31): ArgumentParser, a_jpeg(), cargar_catalogo(), cargar_entrada(), cmd_anotar(), cmd_avatar(), cmd_bajar(), cmd_catalogo() (+23 more)

### Community 3 - "Editorial Content Types"
Cohesion: 0.09
Nodes (32): bosque, comparativa, contrarian, editorial-mono, guia, guia-rapida, historia, lista (+24 more)

### Community 4 - "Playwright Automation Scripts"
Cohesion: 0.06
Nodes (24): cargarPlaywright(), args, carpeta, CEBO, { chromium }, conImagen, cta, data (+16 more)

### Community 5 - "HTML Slide Generator"
Cohesion: 0.09
Nodes (28): bloqueImagen(), claseTitulo(), construirHTML(), cuerpoSlide(), esc(), FONDO_EFECTIVO, fontFaces(), FORMATOS (+20 more)

### Community 6 - "File Writing Utilities"
Cohesion: 0.08
Nodes (24): args, bloque, carpeta, carpetaTrabajo, DIR_SKILL, entrada, extraerJson(), fallo() (+16 more)

### Community 7 - "Schema Validation Rules"
Cohesion: 0.08
Nodes (26): anyOf, description, maximum, minimum, type, type, description, items (+18 more)

### Community 8 - "Output Schema Definitions"
Cohesion: 0.09
Nodes (21): additionalProperties, allOf, $defs, entrada, description, anyOf, required, title (+13 more)

### Community 9 - "Slide Element Properties"
Cohesion: 0.10
Nodes (22): type, type, type, type, type, type, properties, type (+14 more)

### Community 10 - "Brand Profile Metadata"
Cohesion: 0.12
Nodes (17): handle, required, palabra_clave, description, type, type, properties, required (+9 more)

### Community 11 - "Visual Style Selection"
Cohesion: 0.13
Nodes (15): args, candidatos, carpeta, CLAROS, orden, OSCUROS, POR_TIPO, puntua() (+7 more)

### Community 12 - "Cloud Storage Sync"
Cohesion: 0.24
Nodes (12): archivos_del_banco(), bajar_banco(), leer_env(), Path, banco_nube.py — sube y baja el banco de fotos a un almacén con URL pública…, Lee ~/.vercel-blob-cli/.env sin dependencias; el entorno del proceso tiene…, PUT a Vercel Blob; devuelve la URL pública. Sobrescribe si ya existe (mismo…, Sube fotos, recortes y avatares; devuelve el catálogo con `url` por archivo y… (+4 more)

### Community 13 - "Layout and Social Elements"
Cohesion: 0.17
Nodes (12): layout, titulo, items, type, items, maxItems, type, required (+4 more)

### Community 14 - "Generic Schema Properties"
Cohesion: 0.18
Nodes (12): properties, type, properties, type, anyOf, items, a, b (+4 more)

### Community 15 - "Carousel Schema Definition"
Cohesion: 0.20
Nodes (9): caption, look, slides, slug, marca, required, $schema, title (+1 more)

### Community 16 - "Image Styling Properties"
Cohesion: 0.20
Nodes (10): properties, type, type, duotono, imagen, panel, pos, prompt (+2 more)

### Community 17 - "Marketing Copy Components"
Cohesion: 0.25
Nodes (8): agitacion, cheatsheet, cta, cuerpo, portada, rehook, rol, enum

### Community 18 - "Reference Material Processing"
Cohesion: 0.50
Nodes (7): apify_video(), articulo(), limpiar_vtt(), main(), pdf(), Path, youtube()

### Community 19 - "Text Alignment Options"
Cohesion: 0.40
Nodes (5): abajo, arriba, centro, enum, alinea

### Community 21 - "Side Placement Options"
Cohesion: 0.50
Nodes (4): derecha, izquierda, sticker_lado, enum

### Community 22 - "Environment Setup Scripts"
Cohesion: 0.67
Nodes (3): descargar_fuentes(), PLAYWRIGHT_BROWSERS_PATH, setup.sh script

### Community 23 - "Alt Text Schema"
Cohesion: 0.50
Nodes (4): description, maxLength, type, alt

### Community 24 - "Sticker Element Schema"
Cohesion: 0.50
Nodes (4): sticker, description, maxLength, type

### Community 26 - "Button Element Schema"
Cohesion: 0.67
Nodes (3): description, type, boton

### Community 27 - "Body Text Schema"
Cohesion: 0.67
Nodes (3): description, type, cuerpo

### Community 28 - "Data Point Schema"
Cohesion: 0.67
Nodes (3): description, type, dato

### Community 29 - "Visual Texture Schema"
Cohesion: 0.67
Nodes (3): description, type, grano

### Community 30 - "Kicker Text Schema"
Cohesion: 0.67
Nodes (3): description, type, kicker

### Community 31 - "Loop Element Schema"
Cohesion: 0.67
Nodes (3): description, type, loop

## Knowledge Gaps
- **247 isolated node(s):** `description`, `type`, `description`, `type`, `description` (+242 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `properties` connect `Slide Element Properties` to `Editorial Content Types`, `pie`, `sin_top`, `subtitulo`, `Layout and Social Elements`, `Generic Schema Properties`, `Image Styling Properties`, `Marketing Copy Components`, `Text Alignment Options`, `Side Placement Options`, `Alt Text Schema`, `Sticker Element Schema`, `Button Element Schema`, `Body Text Schema`, `Data Point Schema`, `Visual Texture Schema`, `Kicker Text Schema`, `Loop Element Schema`?**
  _High betweenness centrality (0.202) - this node is a cross-community bridge._
- **Why does `properties` connect `JSON Schema Metadata` to `Brand Profile Metadata`, `Editorial Content Types`, `Layout and Social Elements`, `Carousel Schema Definition`?**
  _High betweenness centrality (0.148) - this node is a cross-community bridge._
- **Why does `enum` connect `Editorial Content Types` to `Content Schema Definitions`?**
  _High betweenness centrality (0.114) - this node is a cross-community bridge._
- **Are the 9 inferred relationships involving `construir_parser()` (e.g. with `cmd_anotar()` and `cmd_avatar()`) actually correct?**
  _`construir_parser()` has 9 INFERRED edges - model-reasoned connections that need verification._
- **What connects `description`, `type`, `description` to the rest of the system?**
  _247 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `JSON Schema Metadata` be split into smaller, more focused modules?**
  _Cohesion score 0.045454545454545456 - nodes in this community are weakly interconnected._
- **Should `Content Schema Definitions` be split into smaller, more focused modules?**
  _Cohesion score 0.08095238095238096 - nodes in this community are weakly interconnected._