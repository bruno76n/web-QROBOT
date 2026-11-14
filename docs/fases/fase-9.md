# Fase 9 · Para talleres (oculta)

**Objetivo:** construir las páginas de venta del sistema para talleres (`/talleres`, `/talleres/precios`, `/talleres/descargar`) iguales a las maquetas, reutilizando lo que ya existe, y publicarlas **ocultas**: en producción responden 404 y nada las enlaza hasta que el sistema salga (`25 §2`).

**Al terminar existe:** en `pnpm dev`, las 3 páginas completas con las pantallas del sistema dibujadas en HTML, «Para talleres» en el menú y el footer, y el llamado `system` de Aprende. En el build de producción (y en el dominio), las 3 rutas responden 404, no hay ligas ni entradas en el sitemap, y las pruebas lo comprueban. Las preguntas y los tokens que comparten Aprende y Para talleres viven una sola vez.

**Antes de empezar, leer:** `CLAUDE.md` · `docs/informe-fase-8.md` · `docs/progreso.md` · `docs/25-talleres.md` completo · este archivo. En cada paso, solo lo que indica "Consultar". Rama `fase-9` desde `main` con la fase 8 fusionada.

**Regla de la fase:** `site.system.enabled` se queda en `false`. Encenderlo no es parte de esta fase (`25 §13`).

---

## Pasos

### 9.1 Lógica pura
- **Hacer:** en `src/lib/system/`: `visibility.ts` (`isSystemPath`, `isSystemVisible`), `plans.ts` (`planPrice`, `yearlyPerMonth`, `limitLabel`), `platform.ts` (`detectPlatform`), `bars.ts` (`pct`, `columns`). En `src/lib/nav.ts`: `siteNav(systemVisible)` con las ligas de `es.header.nav` y, si recibe `true`, «Para talleres» (con su nombre corto). Cada archivo con su prueba.
- **Consultar:** `25 §2, §5, §6.1` (fila de `siteNav`), `16 §4`.
- **Listo cuando:** pasan todos los casos obligatorios de `25 §5`; cobertura de `src/lib/` ≥ 90 %.

### 9.2 Compartir sin duplicar
- **Hacer**, sin cambiar lo que se ve en Aprende ni en el resto de la web:
  1. `Faqs.astro` → `src/components/site/`, con `title` y `headingId`; sus estilos `.faq` al componente.
  2. Tokens `--ink-3`, `--green-d`, `--red`, `--red-l`, `--amber`, `--amber-l`, `--amber-d` a `:root` en `global.css`; `.learn` deja de repetir los que ya están en `:root`.
  3. `button-variants.ts`: variantes `outline` y `outlineLight` (con su prueba).
  4. `Header.astro` con prop `sticky` y `BaseLayout.astro` con `stickyHeader` (por defecto, como hoy). Header y footer arman sus ligas con `siteNav(systemVisible)` (en este paso `systemVisible` todavía no existe: usar `false`; se conecta en 9.3).
  5. `@lucide/astro` (`06`), si no está instalado: anotarlo en `decisiones.md`.
  6. Actualizar las importaciones de Aprende. Actualizar `03 §2` (tokens), `08` (carpetas) y `11` (componentes compartidos).
- **Consultar:** `25 §6.1`, `03 §2`, `07 §1`.
- **Listo cuando:** todas las pruebas de Aprende pasan **sin cambiar sus expectativas**; capturas de `/aprende/filamentos/pla` (preguntas) y del header en 390, 820 y 1440 iguales a las de antes del paso; `git grep` encuentra los estilos de las preguntas solo en su componente y cada token una sola vez. La calculadora de Aprende no se toca.

### 9.3 Datos y textos
- **Hacer:** en `src/config/site.ts`, los campos de `site.system` de `25 §4` con sus valores provisionales (`enabled: false`). `src/config/system.ts`: `systemVisible` (`25 §2`) y la estructura de la página (módulos, fórmula, alertas, roles, comparación, plataformas). `src/config/system-demo.ts`: los datos de ejemplo de las pantallas (`25 §4`). `es.system` y `es.system.ui` en `es.ts` con los textos de las maquetas (`reference/mockups/talleres/`) y el vocabulario de `25 §1`. Conectar `systemVisible` a header y footer (9.2.4). Anotar en `progreso.md` los valores provisionales (`01 › Pendientes del dueño`).
- **Consultar:** `25 §1, §4`, `05 §1`.
- **Prueba:** las invariantes de los planes y de los datos de ejemplo, y la guardia de encendido de `25 §12` (con `enabled: true` en la prueba, la guardia falla con las direcciones vacías).

### 9.4 Cerrojo
- **Hacer:** en `src/middleware.ts`, la regla de `25 §2` (después de la redirección de la barra final y antes de todo lo demás). Las 3 rutas en `src/pages/talleres/` con el cerrojo de página y un contenido mínimo (se completan en 9.7–9.9). `tests/security/system-hidden.spec.ts` (build de producción) con las rutas de `25 §12`. En `scripts/security.mjs`: ningún `.html` con `talleres` en `dist/`, ningún `prerender = true` en `src/pages/talleres/`, el cerrojo en cada página, ningún `style=` en `src/components/system/`. Actualizar `04 §1` (rutas ocultas), `13 §3` y `§10` (el cerrojo y las revisiones nuevas), `14 §3` (sitemap).
- **Consultar:** `25 §2, §3, §9, §12`, `13 §2–3, §10`, `10 §9` (cómo se ocultan las rutas de desarrollo).
- **Listo cuando:** con `pnpm preview` las rutas de la lista responden 404 con la página 404 de la web; con `pnpm dev`, 200; `pnpm security` en verde.

### 9.5 Layout, barra del producto y piezas de la página
- **Hacer:** `SystemLayout.astro`, `SystemNav.astro`, `Wordmark.astro`, `SectionHead.astro`, `Stage.astro`, `Specs.astro`, `FeatureSection.astro`, `EndCta.astro` y `src/styles/system.css` (solo lo común de `25 §6.2`). Sin doble filete (`25 §7`).
- **Consultar:** `25 §6.2, §7, §8`, `reference/mockups/talleres/` (`.pbar`, `.wordmark`, `.sec-h`, `.feat`, `.stage`, `.specs`, `.s-end`), `24 §1–2`.
- **Listo cuando:** header + barra + una sección de ejemplo + cierre iguales a las maquetas en 360, 390, 820 y 1440; el header de la web se va con el scroll y la barra se queda arriba; en celular el menú de la barra abre y cierra con el teclado.

### 9.6 Pantallas del sistema
- **Hacer:** `src/components/system/ui/` (`25 §6.3`): primero las piezas (`UiFrame`, `UiPill`, `UiMeter`, `UiBar`, `UiButton`, `UiColumns`, `UiSidebar`), después las pantallas (`UiHome`, `UiFloats`, `UiPiece`, `UiOrder`, `UiPrinters`, `UiFilaments`, `UiPurchases`, `UiStock`, `UiQuote`, `UiReports`), con los datos de `system-demo.ts` y los textos de `es.system.ui`. Estilos de `reference/mockups/talleres/_ui.css` → `src/styles/system-ui.css`. Anchos y altos de barras con `bars.ts`, como atributos de SVG.
- **Consultar:** `25 §6.3, §8, §9`, `reference/mockups/talleres/_ui.css` y las pantallas dentro de `talleres.html`.
- **Listo cuando:** cada pantalla igual a la de la maqueta en 360, 390, 820 y 1440 (en 390 la versión de celular de `UiHome`); ningún `style=`; cada una con `role="img"` y su descripción.

### 9.7 Página principal
- **Hacer:** `src/pages/talleres/index.astro` con las secciones de `25 §7.1` en orden: hero (`Wordmark`, `UiHome` y `UiFloats`), Módulos (`ModuleIndex`), las 7 secciones de módulos (`FeatureSection` con su pantalla; Costo con `CostFormula`; Reportes en `dark`), Alertas (`AlertsTable`), Equipo (`RolesTable`), Datos (`DataFacts`), `PlanBand` (+ `PeriodToggle` sin control visible: mensual), `Faqs`, `EndCta`. Las ligas de «Probar gratis», «Crear cuenta» e «Iniciar sesión» salen de `site.system`.
- **Consultar:** `25 §7.1, §8, §9`, `reference/mockups/talleres/talleres.html`.
- **Prueba (Playwright con `pnpm dev`, `e2e/dev-talleres.spec.ts`; precios y descargar tienen el suyo, `25 §12`):** flujo **M** de `25 §12`.
- **Listo cuando:** comparada con la maqueta en 360, 390, 820 y 1440; sin scroll horizontal; filas en `progreso.md`.

### 9.8 Precios
- **Hacer:** `src/pages/talleres/precios.astro`: encabezado con `PeriodToggle` (+ script), `PlanBand` (cambia con el periodo), Prueba y Precio de fundador, `CompareTable`, `Faqs` (Pago), `EndCta`.
- **Consultar:** `25 §7.2`, `reference/mockups/talleres/precios.html`.
- **Prueba:** flujo **N**.
- **Listo cuando:** igual a la maqueta en los 4 anchos; sin JavaScript se ve el mensual con su línea anual.

### 9.9 Descargar
- **Hacer:** `src/pages/talleres/descargar.astro`: el botón principal con `detectPlatform` en el servidor y `Vary: User-Agent`, `UiHome` sobre lila, `PlatformList`, Instalación, `EndCta`. Sin scripts propios.
- **Consultar:** `25 §7.3`, `reference/mockups/talleres/descargar.html`.
- **Prueba:** flujo **P** (con `User-Agent` de Mac, de Windows y de iPhone).

### 9.10 Llamado de Aprende y sitemap
- **Hacer:** `Cta.astro` muestra el llamado `system` con `systemVisible` (`21 §4.6`); el sitemap suma las 3 rutas con `systemVisible`. Revisar que con `pnpm preview` nada enlace a `/talleres` (la prueba de 9.4 ya lo cubre) y que con `pnpm dev` el menú, el footer y el llamado sí aparezcan.
- **Consultar:** `21 §4.6`, `25 §2`, `14 §3`.

### 9.11 Revisión y cierre
- **Hacer:**
  1. Proyectos `webkit-w390` y `webkit-w1440` en `playwright.admin.config.ts` para `e2e/dev-talleres*.spec.ts`: flujos M, N y P en Chromium y WebKit.
  2. axe sin errores serios en las 3 páginas (con `pnpm dev`).
  3. La revisión de Safari de `pnpm size` (`requestIdleCallback`, lookbehind) se extiende a **todos** los `.js` de `dist/_astro/`, así cubre los scripts de las páginas ocultas. El presupuesto de `25 §11` y Lighthouse se miden al encender (las rutas dan 404 en el build); anótalo en el informe.
  4. Actualizar `15 §2` (presupuestos de Para talleres, «se mide al encender»), `16 §1` (glosario: Para talleres → `system`, plan → `plan`, pantalla del sistema → `ui`), `20`, `progreso.md`.
  5. Desplegar a producción **con el interruptor apagado** (`17`): `pnpm build && pnpm exec wrangler deploy`. Revisar en vivo: `/talleres`, `/talleres/precios`, `/talleres/descargar` y `/%74alleres` → 404; el menú, el footer, una página de Aprende con llamado `system` y `sitemap.xml` sin `/talleres`. Si faltan credenciales, dejar la lista exacta en el informe.
- **Consultar:** `25 §12`, `24 §6`, `17`.

---

## No hacer en esta fase
- Encender `site.system.enabled` ni agregar las rutas a `e2e/urls.ts` o `lighthouserc.json` (`25 §13`).
- Cuentas, registro, inicio de sesión o pagos en la web: viven en el sistema (`25 §1`).
- Calculadora en estas páginas: se queda en Aprende.
- Capturas del sistema: las pantallas son HTML (`25 §6.3`).
- Cambiar textos de Aprende o del resto de la web (solo mover piezas compartidas).
- React en estas páginas.

## Cierre
- Todas las pruebas, `pnpm security` en verde; Aprende sin cambios visibles.
- `docs/informe-fase-9.md` con **pendientes del dueño** (los de `25 §13` y repositorio privado, `25 §2`) y **cómo encender** (prompt «Para talleres · Encender»). `progreso.md` al día.
