# Notas del agente «Ligas» (paso 9.9)

Rama `fase-9-ligas`. Llamado `system` de Aprende y sitemap de Para talleres.

## Qué se hizo

- `src/components/learn/Cta.astro`: con `cta === 'system'` y `systemVisible`, el mismo bloque `.ap-cta` que el de WhatsApp con el `ctaText` de la página y un botón negro (`.btn`, sin `.wa`) a `/talleres` (`systemBase`) con `es.learn.cta.system(site.system.name)` («Conoce Quick Cerebro →»). Sin `systemVisible` no pinta nada. Comentario de cabecera al día.
- `src/pages/sitemap.xml.ts`: suma `/talleres`, `/talleres/precios` y `/talleres/descargar` (después de `/privacidad`) solo con `systemVisible`. Lo demás igual.
- Pruebas:
  - `tests/learn-cta.astro.test.ts` (proyecto `astro`, API de contenedor, `vi.mock('@/config/system')` con un getter para cambiar el interruptor por prueba): `system` visible (texto + botón negro a `/talleres`), visible sin `ctaText` (solo el botón), oculto (vacío, sin `/talleres`), `whatsapp` sin cambios con el interruptor en ambos sentidos, `none` vacío.
  - `tests/sitemap.test.ts` (proyecto `unit`, consultas de D1 simuladas con `vi.mock`): sin `systemVisible` no aparece `talleres` y el resto sigue; con él, las 3 rutas.
  - `e2e/dev-talleres-ligas.spec.ts` (con `pnpm dev`, 390/820/1440): liga «Para talleres» a `/talleres` en el menú del header y en el footer; `/aprende/negocio/costo` muestra el llamado con su texto y el botón negro a `/talleres` (y lleva ahí); `/sitemap.xml` con las 3 rutas.

## Decisiones

- **`system` sin `ctaText`:** `docs/21 §4.6` no da texto por defecto para este llamado y no hay uno en `es.ts`; se pinta solo el botón (sin `<p>` vacío). Hoy las 4 páginas con `cta: system` traen `ctaText`. Si se quiere un texto por defecto, ver «Pedidos».
- **Botón:** se usa la clase `.btn` de `learn.css` (fondo `--ink`, texto blanco, 8 px), no `Button.astro`, para que sea el mismo bloque y estilo que el botón de WhatsApp del llamado (que también es `.btn`). Sin `target="_blank"`: es una liga interna.
- **Ruta:** se toma de `systemBase` (`src/lib/system/visibility.ts`) en el llamado y en el sitemap, para no repetir `/talleres`.
- **Lugar en el sitemap:** tras las páginas fijas (`/privacidad`) y antes de Aprende.

## Diferencias con la maqueta

Ninguna maqueta de Aprende trae el llamado `system`; se usa el bloque del llamado de WhatsApp (`.ap-cta`) con botón negro, como pide `docs/21 §4.6`. Capturas en 360, 390, 820 y 1440 de `/aprende/negocio/costo` con `pnpm dev`: fondo menta, botón negro con esquinas de 8 px; en ≤ 560 px el texto arriba y el botón a todo el ancho (como el de WhatsApp); en 820 y 1440 texto a la izquierda y botón a la derecha; sin scroll horizontal.

## Pedidos fuera de mis archivos

- Ninguno obligatorio.
- Opcional: si se quiere texto por defecto para `cta: system` sin `ctaText`, agregar `es.learn.cta.systemText` (texto a decidir) y usarlo en `Cta.astro`.

## Revisiones

- `pnpm lint`, `pnpm typecheck`, `pnpm test` (58 archivos, 494 pruebas) y `pnpm security` (7/7) en verde.
- `e2e/dev-talleres-ligas.spec.ts`: 9/9 (390, 820, 1440).
- `tests/security/system-hidden.spec.ts` con `pnpm preview` (build de esta rama): 6/6; nada enlaza a `/talleres`, ni el sitemap.

## Tabla para `progreso.md`

| Página | 360 | 390 | 820 | 1440 | Notas |
|---|---|---|---|---|---|
| `/aprende/negocio/costo` (llamado `system`) | igual | igual | igual | igual | Mismo bloque que el llamado de WhatsApp con botón negro; sin maqueta propia del llamado `system` |
