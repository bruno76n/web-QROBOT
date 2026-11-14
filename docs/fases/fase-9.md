# Fase 9 · Para talleres (oculta)

**Objetivo:** construir las páginas de venta del sistema para talleres (`/talleres`, `/talleres/precios`, `/talleres/descargar`) iguales a las maquetas, reutilizando lo que ya existe, y publicarlas **ocultas**: en producción responden 404 y nada las enlaza hasta que el sistema salga (`25 §2`).

**Al terminar existe:** en `pnpm dev`, las 3 páginas completas, con «Para talleres» en el menú y el footer, y el llamado `system` de Aprende. En el build de producción (y en el dominio), las 3 rutas responden 404, no hay ligas ni entradas en el sitemap, y las pruebas lo comprueban. La calculadora, las preguntas y los tokens que comparten Aprende y Para talleres viven una sola vez.

**Antes de empezar, leer:** `CLAUDE.md` · `docs/informe-fase-8.md` · `docs/progreso.md` · `docs/25-talleres.md` completo · este archivo. En cada paso, solo lo que indica "Consultar". Rama `fase-9` desde `main` con la fase 8 fusionada.

**Regla de la fase:** `site.system.enabled` se queda en `false`. Encenderlo no es parte de esta fase (`25 §13`).

---

## Pasos

### 9.1 Lógica pura
- **Hacer:** en `src/lib/system/`: `visibility.ts` (`isSystemPath`, `isSystemVisible`), `plans.ts` (`recommendPlan`, `planReasons`, `planPrice`, `yearlyPerMonth`), `platform.ts` (`detectPlatform`), `money-split.ts` (`splitSegments`). En `src/lib/nav.ts`: `siteNav(systemVisible)` con las ligas de `es.header.nav` y, si recibe `true`, «Para talleres» (con su nombre corto). Cada archivo con su prueba.
- **Consultar:** `25 §2, §5, §6` (fila de `siteNav`), `16 §4`.
- **Listo cuando:** pasan todos los casos obligatorios de `25 §5`; cobertura de `src/lib/` ≥ 90 %.

### 9.2 Compartir sin duplicar
- **Hacer**, sin cambiar lo que se ve en Aprende ni en el resto de la web:
  1. `CostCalculator.astro` → `src/components/site/`, con `withPrice`, `title`, `headingLevel` y prefijo de ids; sus estilos `.calc*` salen de `learn.css` al componente. `src/lib/learn/cost.ts` → `src/lib/cost.ts` con `profitAt` (y su prueba). `parseAmount` → `src/lib/number.ts`.
  2. `Faqs.astro` → `src/components/site/`, con `title` y `headingId`; sus estilos `.faq` al componente.
  3. Tokens `--ink-3`, `--green-d`, `--red`, `--red-l`, `--amber`, `--amber-l` a `:root` en `global.css`; `.learn` deja de repetir los que ya están en `:root`.
  4. `button-variants.ts`: variantes `outline` y `outlineLight` (con su prueba).
  5. `Header.astro` con prop `sticky` y `BaseLayout.astro` con `stickyHeader` (por defecto, como hoy). Header y footer arman sus ligas con `siteNav(systemVisible)` (en este paso `systemVisible` todavía no existe: usar `false`; se conecta en 9.3).
  6. Actualizar las importaciones de Aprende. Actualizar `03 §2` (tokens), `08` (carpetas), `11` (componentes compartidos) y `21 §6.4` (dónde vive la calculadora).
- **Consultar:** `25 §6`, `21 §6.4`, `03 §2`, `07 §1`.
- **Listo cuando:** todas las pruebas de Aprende pasan **sin cambiar sus expectativas**; capturas de `/aprende/negocio/costo`, `/aprende/filamentos/pla` (preguntas) y del header en 390, 820 y 1440 iguales a las de antes del paso; `git grep` encuentra los estilos de la calculadora y de las preguntas solo en su componente y cada token una sola vez.

### 9.3 Datos, textos y capturas
- **Hacer:** en `src/config/site.ts`, los campos de `site.system` de `25 §4` con sus valores provisionales (`enabled: false`). `src/config/system.ts`: `systemVisible` (`25 §2`) y la estructura de la página (filas de la comparación, capturas del recorrido, ejemplo de $100, roles, plataformas). `es.system` en `es.ts` con los textos de las maquetas (`reference/mockups/talleres/`). `scripts/build-assets.mjs`: `assets/talleres/*.webp` → `public/brand/talleres/<nombre>-<ancho>.webp` en 720, 1440 y 2160. Conectar `systemVisible` a header y footer (9.2.5). Anotar en `progreso.md` los valores provisionales (`01 › Pendientes del dueño`).
- **Consultar:** `25 §4`, `05 §1`, `15 §3`.
- **Prueba:** las invariantes y la guardia de encendido de `25 §12` (con `enabled: true` en la prueba, la guardia falla con las direcciones vacías).

### 9.4 Cerrojo
- **Hacer:** en `src/middleware.ts`, la regla de `25 §2` (después de la redirección de la barra final y antes de todo lo demás). Las 3 rutas en `src/pages/talleres/` con el cerrojo de página y un contenido mínimo (se completan en 9.6–9.8). `tests/security/system-hidden.spec.ts` (build de producción) con las rutas de `25 §12`. En `scripts/security.mjs`: ningún `.html` con `talleres` en `dist/`, ningún `prerender = true` en `src/pages/talleres/`, el cerrojo en cada página. Actualizar `04 §1` (rutas ocultas), `13 §3` y `§10` (el cerrojo y las revisiones nuevas), `14 §3` (sitemap).
- **Consultar:** `25 §2, §3, §9, §12`, `13 §2–3, §10`, `10 §9` (cómo se ocultan las rutas de desarrollo).
- **Listo cuando:** con `pnpm preview` las rutas de la lista responden 404 con la página 404 de la web; con `pnpm dev`, 200; `pnpm security` en verde.

### 9.5 Layout, barra del producto y piezas comunes
- **Hacer:** `SystemLayout.astro`, `SystemNav.astro`, `AppWindow.astro`, `SectionHead.astro`, `EndCta.astro` y `src/styles/system.css` (solo lo común de `25 §6`). Sin doble filete (`25 §7`).
- **Consultar:** `25 §6–8`, `reference/mockups/talleres/` (`.pbar`, `.win`, `.sec-h`, `.s-end`), `24 §1–2`.
- **Listo cuando:** header + barra + cierre iguales a las maquetas en 360, 390, 820 y 1440; el header de la web se va con el scroll y la barra se queda arriba; en celular el menú de la barra abre y cierra con el teclado.

### 9.6 Página principal
- **Hacer:** `src/pages/talleres/index.astro` con las secciones de `25 §7.1` en orden: hero (captura con prioridad y precarga), franja, `MoneySplit`, `FeatureTour` (+ script), `Flow`, `RolesTable`, Tus datos, `CostCalculator withPrice` con su llamado, Hecho en un taller, `PlanBand`, `Faqs`, `EndCta`. Las ligas de «Probar gratis» y «Entrar» salen de `site.system`.
- **Consultar:** `25 §7.1, §8, §9`, `reference/mockups/talleres/talleres.html`.
- **Prueba (Playwright con `pnpm dev`, `e2e/dev-talleres-principal.spec.ts`; las otras páginas tienen el suyo, `25 §12`):** flujos **M** y **O** de `25 §12`.
- **Listo cuando:** comparada con la maqueta en 360, 390, 820 y 1440; sin scroll horizontal; filas en `progreso.md`.

### 9.7 Precios
- **Hacer:** `src/pages/talleres/precios.astro`: encabezado con `PeriodToggle` (+ script), `PlanBand` (cambia con el periodo), `PlanFinder` (+ script con `recommendPlan`), precio de fundador, `CompareTable`, `Faqs` (Sobre el pago), `EndCta`.
- **Consultar:** `25 §7.2`, `reference/mockups/talleres/precios.html`.
- **Prueba:** flujo **N**.
- **Listo cuando:** igual a la maqueta en los 4 anchos; sin JavaScript se ve el mensual con su línea anual.

### 9.8 Descargar
- **Hacer:** `src/pages/talleres/descargar.astro`: el botón principal con `detectPlatform` en el servidor y `Vary: User-Agent`, `PlatformList`, Lo que suma la app, Instalar, `EndCta`. Sin scripts propios.
- **Consultar:** `25 §7.3`, `reference/mockups/talleres/descargar.html`.
- **Prueba:** flujo **P** (con `User-Agent` de Mac, de Windows y de iPhone).

### 9.9 Llamado de Aprende y sitemap
- **Hacer:** `Cta.astro` muestra el llamado `system` con `systemVisible` (`21 §4.6`); el sitemap suma las 3 rutas con `systemVisible`. Revisar que con `pnpm preview` nada enlace a `/talleres` (la prueba de 9.4 ya lo cubre) y que con `pnpm dev` el menú, el footer y el llamado sí aparezcan.
- **Consultar:** `21 §4.6`, `25 §2`, `14 §3`.

### 9.10 Revisión y cierre
- **Hacer:**
  1. Proyectos `webkit-w390` y `webkit-w1440` en `playwright.admin.config.ts` para `e2e/dev-talleres-*.spec.ts`: flujos M–P en Chromium y WebKit.
  2. axe sin errores serios en las 3 páginas (con `pnpm dev`).
  3. La revisión de Safari de `pnpm size` (`requestIdleCallback`, lookbehind) se extiende a **todos** los `.js` de `dist/_astro/`, así cubre los scripts de las páginas ocultas. El presupuesto de `25 §11` y Lighthouse se miden al encender (las rutas dan 404 en el build); anótalo en el informe.
  4. Actualizar `15 §2` (presupuestos de Para talleres, «se mide al encender»), `16 §1` (glosario: Para talleres → `system`, plan → `plan`), `20`, `progreso.md`.
  5. Desplegar a producción **con el interruptor apagado** (`17`): `pnpm build && pnpm exec wrangler deploy`. Revisar en vivo: `/talleres`, `/talleres/precios`, `/talleres/descargar` y `/%74alleres` → 404; el menú, el footer, una página de Aprende con llamado `system` y `sitemap.xml` sin `/talleres`. Si faltan credenciales, dejar la lista exacta en el informe.
- **Consultar:** `25 §12`, `24 §6`, `17`.

---

## No hacer en esta fase
- Encender `site.system.enabled` ni agregar las rutas a `e2e/urls.ts` o `lighthouserc.json` (`25 §13`).
- Cuentas, registro, entrar o pagos en la web: viven en el sistema (`25 §1`).
- Cambiar textos de Aprende o del resto de la web (solo mover piezas compartidas).
- React en estas páginas.

## Cierre
- Todas las pruebas, `pnpm security` en verde; Aprende sin cambios visibles.
- `docs/informe-fase-9.md` con **pendientes del dueño** (los de `25 §13` y repositorio privado, `25 §2`) y **cómo encender** (prompt «Para talleres · Encender»). `progreso.md` al día.
