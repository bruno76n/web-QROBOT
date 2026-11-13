# Informe de la fase 6

## Resumen
La base de Aprende está terminada en local. `pnpm learn:import` carga las **118 páginas** de `content/aprende/` (116 publicadas y 2 ocultas a la espera del dueño) con sus 66 preguntas, las 4 tablas de datos, las 48 fuentes y la configuración del buscador en D1, sin errores ni avisos. Las consultas de `docs/21 §9` devuelven cada página lista para pintarse en 2 viajes a D1. Todavía no hay páginas públicas (fase 7) ni nada en producción.

## Pasos
| Paso | Estado | Notas |
|---|---|---|
| 6.1 Alcance, dependencias y decisiones | Listo | `mdast-util-from-markdown`, `micromark-extension-gfm`, `mdast-util-gfm`, `@types/mdast`, `yaml`, `meilisearch` (y `tsx` para correr scripts con el alias `@/`), registradas en `06` y `decisiones.md`; `--lilac` en `global.css` y `03`. `pnpm audit --prod`: sin altas ni críticas (queda una moderada de `astro` que ya existía) |
| 6.2 Lógica pura | Listo | `src/lib/learn/`: `markdown`, `content`, `import`, `fit`, `cost`, `heat`, `search-docs`; `learnQuoteMessage` y `learnMissMessage` en `whatsapp.ts`. Cobertura de `src/lib/learn` 94 % |
| 6.3 Configuración y textos | Listo | `src/config/learn.ts` (11 temas), `site.system.enabled = false`, `es.ts › learn` |
| 6.4 Esquema y migración | Listo | 5 tablas y sus índices, migración `0007_petite_triathlon`; `09`, `08` y `10` al día |
| 6.5 Importador | Listo | `pnpm learn:import` con `--if-empty`, `--overwrite`, `--prune`, `--remote --yes` y `--sync` (esta última solo avisa que el buscador llega en la fase 7). `pnpm dev` lo corre con `--if-empty`. **`--remote` no se probó contra producción** (sin credenciales, y no se debe); su SQL sí se prueba |
| 6.6 Consultas | Listo | `getLearnHome`, `getLearnTopic`, `getLearnPage`, `listLearnSitemap`, `searchLearnD1` |

## Pruebas
- **Vitest: 381** (antes 237 + los de la fase). Nuevas: `markdown` (28), `fit`, `cost`, `heat`, `content`, `search-docs`, `import` (13), `learn-import` en D1 (9), `queries/learn` (21), esquema de Aprende y `tests/learn-content.test.ts` (la carga real: 118 páginas, 2 ocultas, sin avisos).
- Casos obligatorios de `21 §15` y `22 §13` de esta fase: todos cubiertos (incluye el ejemplo de costo → `$21.04`, los casos de `fit` en 256³, la inyección con `<script>`, `<img onerror>`, `javascript:` y `data:`, la segunda carga sin cambios, la página editada en el panel y el error con archivo y campo).
- **Cada página publicada se carga en 3 viajes a D1 o menos** (se prueba con las 115 reales; en la práctica son 2). La portada, un tema y el glosario también.
- Búsqueda en D1: «se despega» encuentra `problemas/primera-capa` por sinónimo; el filtro por tema funciona; mayúsculas y acentos no importan; páginas ocultas y portada nunca salen; `%` y `_` no rompen la consulta.
- **`pnpm security`: 5/5.** `pnpm lint` y `pnpm typecheck`: limpios.
- Playwright: no cambió nada visible; la suite pública y del panel de `bab72c0` sigue igual.

## Comparación con el mockup
No aplica: esta fase no tiene pantallas.

## Decisiones tomadas
En `docs/decisiones.md` («Fase 6: librerías de Aprende» y «Fase 6: ajustes mínimos para que el contenido pase la validación»). Lo principal:
- Se entrecomillaron las etiquetas numéricas de 3 páginas (`'1.75'`, `'0.2'`…): YAML las leía como número. El texto no cambió.
- El esquema acepta `null` en cinco datos de filamentos (la fuente no los da) y `ams: 'dry'` (PVA/BVOH).
- Ids estables por página (`learn-<slug>`) para que local y producción coincidan; el importador conserva el id de una fila que ya exista.
- `search_text` guarda tres líneas normalizadas (título · etiquetas · resto) para ordenar la búsqueda en D1.

## Pendientes del dueño
- **Dónde corre Meilisearch** (Cloud o servidor propio): hasta entonces el buscador usa D1.
- Anticipo y formas de pago, envíos, urgentes y personajes con licencia: `encargar/pago` y `encargar/personajes` siguen ocultas.
- Fotos de fallas para «Cuando algo sale mal» (después).

## Bloqueado o dudoso
- La migración `0007` y la carga del contenido **no están en producción** (no era parte de la fase). Se aplican en la fase 8 con `pnpm db:migrate --remote` y `pnpm learn:import --remote --yes`.
- `learn:import --remote` y `syncLearnIndex` quedan sin probar de punta a punta hasta tener credenciales y Meilisearch.
- `docs/06` y `CLAUDE.md` todavía nombran three/R3F/drei del personalizador que ya se quitó (no es de esta fase).

## Cómo probarlo
```bash
pnpm install
pnpm learn:import              # 118 nuevas la primera vez; "sin cambios: 118" la segunda
pnpm learn:import --overwrite  # vuelve a escribir también las editadas en el panel
pnpm test && pnpm lint && pnpm typecheck && pnpm security
```
