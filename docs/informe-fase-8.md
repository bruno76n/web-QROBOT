# Informe de la fase 8

## Resumen
El panel ya tiene la pestaña **Aprende**:
- **Lista:** las 118 páginas, con búsqueda, filtros por tema y por estado, e interruptor de publicar en cada fila.
- **Editor:** título, subtítulo, en corto, cuerpo con vista previa, etiquetas, relacionadas, fuentes, preguntas que se reordenan y llamado.
- **Buscador:** el bloque muestra su estado, el botón «Actualizar buscador» y las búsquedas sin resultado de los últimos 30 días.

Guardar una página rehace su texto de búsqueda y la actualiza en Meilisearch si está configurado. Todo funciona y está probado en local.

**La publicación en producción (8.4) no se hizo:** este entorno no tiene credenciales de Cloudflare ni Meilisearch. Abajo están los pasos exactos para hacerla desde la Mac.

La fase se hizo después de la 9 (Para talleres), sobre `main` con la 9 fusionada. Primero se hicieron las acciones (8.1). Después trabajaron dos agentes en paralelo, cada uno con sus archivos: la lista y el editor (8.2), y el bloque del buscador (8.3).

## Pasos
| Paso | Estado | Commit | Notas |
|---|---|---|---|
| 8.1 Acciones del panel | Listo | `68067e8`, `d42387c`, `fe436f4`, `7626061` | 6 acciones con `guard`. Funciones del importador compartidas (`pageSearchText`, `faqRecords`, `unknownMarks`). `updateLearnPageIndex` actualiza una página en Meilisearch. Si Meilisearch falla, la página queda guardada y el panel lo avisa (`SEARCH_NOT_UPDATED`) |
| 8.2 Lista y editor | Listo | `9ee27c3`, `55443dc`, `597b6f8`, `3a3274c` | `/admin/aprende`. Vista previa con el árbol de `markdown.ts`, sin `dangerouslySetInnerHTML`. En celular, lista y editor en pantallas separadas |
| 8.3 Buscador | Listo | `dea3f92`, `d0d955c`, `4ce48cf` | Estado del índice, «Actualizar buscador» y búsquedas sin resultado (sin IP ni fecha por búsqueda) |
| 8.4 Producción | **Bloqueado** | — | Sin credenciales de Cloudflare ni Meilisearch (ver «Bloqueado o dudoso») |
| 8.5 Cierre | Listo | `18794dd` y este informe | Integración: barra del panel en celular, revisión de Safari de `pnpm size`, axe en la pestaña |

## Pruebas
- **Unitarias, de servidor y de componentes (Vitest): 554 en verde.** Cada acción tiene su camino feliz y cada error. La cobertura de lo nuevo en `src/server/` es de alrededor del 95 %.
- **Seguridad: `pnpm security` 8/8.** Las 6 acciones nuevas responden 401 sin sesión, también con una entrada inválida (`tests/security/admin-routes.spec.ts`).
- **Panel, con `pnpm dev`: 144 en verde** en 390, 820 y 1440:
  - **Pestaña Aprende:** buscar, filtrar, abrir con `?p=`, editar el título y una pregunta, guardar y ver el cambio en la página pública, ocultar (404) y publicar.
  - **Errores y avisos:** el error de un bloque `[[…]]` desconocido y el aviso de cambios sin guardar.
  - **Buscador:** búsquedas sin resultado contadas y el botón sin Meilisearch.
  - **axe:** sin errores graves en la pestaña.
  - **Base local:** las pruebas recargan el contenido de Aprende al empezar y al terminar, así que queda como los archivos.
- **Sitio público: 247 en verde.**
- **`pnpm size`:** en verde.
  - La revisión de Safari 14 cubre ahora los scripts de página del build y el código fuente de todo script del navegador.
  - Comprobé que detecta un problema creando un archivo temporal con `requestIdleCallback`.

## Comparación con el mockup
La pestaña Aprende usa los componentes y estilos de Productos (`reference/mockups/admin.html`), revisada en 390, 820 y 1440:

| Pantalla | 390 | 820 | 1440 | Notas |
|---|---|---|---|---|
| Aprende · lista y editor | igual | igual | igual | Mismo aspecto que Productos; en celular, pantallas separadas |
| Aprende · buscador | igual | igual | igual | Bajo la lista |
| Barra del panel | diferencia aceptada | igual | igual | En ≤ 860 px las pestañas se deslizan y se quita «Ver catálogo ↗»; en ≤ 480 px queda la cabeza de Q-404 |

## Decisiones tomadas
`docs/decisiones.md`: «2026-11-14 · Fase 8 · Acciones del panel de Aprende» y «2026-11-14 · Fase 8 · Pestaña Aprende del panel».

## Pendientes del dueño
- **Dónde corre Meilisearch** (Cloud o servidor propio, `22 §2`). Mientras tanto, el buscador usa D1, que ya tolera errores de dedo.
- **Decisiones de `content/aprende/README.md`:** anticipo y formas de pago, envíos, urgentes y personajes con licencia. Las páginas `encargar/pago` y `encargar/personajes` siguen ocultas.
- **Fotos de fallas** para las páginas de problemas.
- **Credenciales de Cloudflare** para publicar (`progreso.md › Bloqueos`).

## Bloqueado o dudoso
**8.4 Producción:** se hace desde la Mac, con `wrangler` autenticado. Aprende todavía no está en producción, así que el importador solo agrega páginas.
1. Si hay Meilisearch: en `wrangler.jsonc`, poner `MEILI_HOST` con la dirección. Correr `pnpm learn:search-setup` con `MEILI_MASTER_KEY` en la terminal, y después `pnpm exec wrangler secret put MEILI_SEARCH_KEY` y `pnpm exec wrangler secret put MEILI_WRITE_KEY` con las llaves que imprime. Sin Meilisearch, se omite este paso: el buscador usa D1.
2. `pnpm exec wrangler d1 migrations apply quick-robot-web --remote` (aplica la `0007`; la fase 8 no agrega migraciones).
3. `pnpm learn:import --remote --yes` (agrega `--sync` si hay Meilisearch). **Sin `--overwrite`:** solo agrega páginas y no toca las editadas en el panel.
4. `pnpm build && pnpm exec wrangler deploy`.
5. Revisar en vivo:
   - `/aprende`, un tema, una ficha y el glosario.
   - Una búsqueda con resultado y una sin resultado.
   - Que `/admin/aprende` pida entrar (Access ya cubre `/admin*`).
   - El sitemap.
   - Que `/talleres` siga dando 404.
6. En iPhone y en Safari de Mac, la lista de `24 §6` punto 3.
7. Anotar en `17 §8` lo que se creó y la fecha.

**WebKit:** sin probar aquí. En la Mac: `pnpm exec playwright install webkit` y `pnpm e2e`.

## Pasos manuales después de publicar
- Mandar el sitemap otra vez en Search Console.
- Revisar cada semana «Búsquedas sin resultado» en la pestaña Aprende para escribir respuestas nuevas en `content/aprende/` (o editar las existentes desde el panel).

## Cómo probarlo
```bash
pnpm install
pnpm dev                     # http://localhost:4321/admin/aprende (sesión de desarrollo)
pnpm test && pnpm lint && pnpm typecheck && pnpm security
pnpm e2e                     # público y panel (incluye la pestaña Aprende)
pnpm build && pnpm size
```
