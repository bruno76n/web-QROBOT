# Informe de la fase 9

## Resumen
La página de venta del sistema para talleres (Quick Cerebro) quedó completa y **oculta**. Tiene tres páginas: principal, precios y descargar. Las 10 pantallas del sistema están dibujadas en HTML con los datos de ejemplo del taller «Eje Z». En `pnpm dev` las tres páginas se ven iguales a las maquetas y pasan los flujos M, N y P en Chromium. En el build de producción, `/talleres` y todo lo que cuelga de esa ruta responden 404, y nada las enlaza: ni el menú, ni el footer, ni Aprende, ni el sitemap, ni `robots.txt`. `site.system.enabled` sigue en `false`.

Se hizo con el **plan v2** (sin calculadora, pantallas en HTML). La versión hecha con el plan v1 quedó en la rama `fase-9-v1` y no se fusiona. Por instrucción del dueño, la fase se hizo **sin la fase 8** (se leyó `informe-fase-7.md` en lugar del 8) y **sin desplegar**: el punto 5 de 9.11 no se hizo.

La base la construyó un solo hilo. Después, 7 agentes trabajaron en paralelo, cada uno en su rama y con sus propios archivos: 4 en pantallas del sistema y 3 en páginas. Al final se integró todo en `fase-9`.

## Pasos
| Paso | Estado | Commit | Notas |
|---|---|---|---|
| 9.1 Lógica pura | Listo | `feafa39` | `visibility`, `plans` (`limitLabel`), `platform`, `bars`, `siteNav`; 100 % de cobertura en `src/lib/system/` y `nav.ts` |
| 9.2 Compartir sin duplicar | Listo | `dded1c9` | `Faqs` a `site/` (con `side`), tokens una sola vez en `:root`, variantes `outline`/`outlineLight`, header que puede irse con el scroll, `@lucide/astro`. Aprende, catálogo y header idénticos a `main` en capturas |
| 9.3 Datos y textos | Listo | `f797d78` | `site.system` provisional, `config/system.ts`, `system-demo.ts` (Eje Z), `es.system`, guardia de encendido |
| 9.4 Cerrojo | Listo | `e5d14a0` | Middleware + página + sin prerender; `system-hidden.spec.ts`; `pnpm security` revisa cerrojos, HTML estático y atributos `style` |
| 9.5 Layout y piezas | Listo | `de8848b` | `SystemLayout`, `SystemNav`, `Wordmark`, `ModuleIcon`, `ModuleKick`, `SectionHead`, `Stage`, `Specs`, `FeatureSection`, `PlanBand`, `EndCta` |
| 9.6 Pantallas del sistema | Listo | `30bdeb8` y ramas de 4 agentes | Piezas `Ui*` y `system-ui.css`; `UiSidebar`, `UiHome`, `UiFloats`, `UiPiece`, `UiOrder`, `UiPrinters`, `UiFilaments`, `UiPurchases`, `UiStock`, `UiQuote`, `UiReports` |
| 9.7 Principal | Listo | `87508ed` | 15 secciones de `25 §7.1`; `ModuleIndex`, `CostFormula`, `AlertsTable`, `RolesTable`, `DataFacts`; flujo M |
| 9.8 Precios | Listo | `961121a` | `PeriodToggle` (único script de la página), `CompareTable`; flujo N |
| 9.9 Descargar | Listo | `cd17ec2` | Botón por `User-Agent` en el servidor con `Vary`, `PlatformList`; flujo P |
| 9.10 Llamado de Aprende y sitemap | Listo | `5010316` | Solo con `systemVisible` |
| 9.11 Revisión y cierre | Listo **sin desplegar** | `e18701b`, `338ed0d`, `5ba6d23` | Integración, WebKit (proyectos condicionales), axe, revisión de Safari sobre todo el build, documentos. Despliegue no hecho (instrucción del dueño) |

## Pruebas
- **Unitarias, de servidor y de componentes (Vitest): 514 en verde.** Incluyen las invariantes de los planes, la guardia de encendido (falla con la dirección provisional `.example` y con instaladores vacíos) y que los datos de ejemplo cuadren entre pantallas (`tests/system-demo*.test.ts`). También prueban el llamado de Aprende y el sitemap con la página visible y oculta.
- **Seguridad: `pnpm security` 8/8.** `tests/security/system-hidden.spec.ts` con el build de producción: `/talleres`, `/talleres/`, `/talleres/precios`, `/talleres/descargar`, `/talleres/x`, `/%74alleres` y `/talleres%2Fprecios` dan 404 con la página 404 de la web, y nada menciona `/talleres`. También se revisan los cerrojos, que no haya HTML estático y que no haya atributos `style`.
- **Playwright, sitio público: 247 en verde** (2 saltadas, como antes).
- **Playwright, con `pnpm dev`: 117 en verde.** Incluye el panel y las 54 de Para talleres: flujos M, N y P, ligas (menú, footer, llamado de Aprende y sitemap) y axe sin errores serios en las 3 páginas, todo en 390, 820 y 1440. axe también se revisó a mano en 360.
- **WebKit: no se pudo correr aquí** porque no está instalado. Los proyectos `webkit-w390` y `webkit-w1440` se activan solos donde sí lo esté.
- **Rendimiento:** `pnpm size` en verde, y la revisión de Safari 14 (sin `requestIdleCallback` ni *lookbehind*) cubre todos los scripts del build, incluidos los de las páginas ocultas. `system-ui.css` pesa 5.9 KB comprimido (meta: 8). Los presupuestos de JS de las 3 páginas (`25 §11`) y Lighthouse **se miden al encender**, porque mientras tanto las rutas dan 404 en el build.

## Comparación con el mockup
Tabla completa en `docs/progreso.md › Para talleres`. Las 3 páginas se midieron sección por sección contra las maquetas en 360, 390, 820 y 1440, sin scroll horizontal. Todo coincide salvo dos diferencias aceptadas:
- **Reportes de 761 a 959 px:** los paneles van en una columna (+513 px a 820), porque en la maqueta la tabla «Por canal» se sale de su panel.
- **Tablas de filamentos y existencias a 360:** aprietan sus celdas para no salirse de la tarjeta; la altura es la misma.

En todas: header real de la web, íconos de lucide, botones 2–4 px más anchos (`Button.astro`) y verde y gris de texto un tono más oscuros por contraste.

## Decisiones tomadas
`docs/decisiones.md`: «2026-11-14 · Fase 9 (plan v2) · Para talleres». Lo principal:
- La rama v1 se guardó aparte.
- Hubo agentes en paralelo.
- Contraste de las pantallas: `--green-text` y `--ink-2`.
- Lo calculado no se escribe.
- Existencias de la maqueta que no cuadraban.
- Reportes en tabletas angostas.
- Menú de la barra en celular.
- `PlanBand` con nota corta y slot.
- Botón de Descargar en celular.
- Texto del llamado de `negocio/costo` (ya no promete leer el archivo del laminador).
- JSON-LD al encender.
- `slugify` del panel y Safari anterior a 17.

## Pendientes del dueño
Antes de encender (`docs/25 §13`):
1. **Nombre final** del sistema (provisional: «Quick Cerebro»).
2. **Precios y límites** confirmados con la beta. Provisionales: Gratis $0 · Taller $149 / $1,490 · Negocio $299 / $2,990.
3. **Dirección del sistema** y rutas de registro e inicio de sesión. Provisionales: `https://sistema.quickrobot.example`, `/crear-cuenta` y `/entrar`. La guardia no deja encender con un dominio de ejemplo.
4. **Archivos de descarga** de Mac y Windows y sus requisitos (hoy sin archivo; los botones llevan a su fila).
5. **Revisión de lo que dice la página contra el sistema:** roles, copias, exportación a Excel, alertas y sus umbrales, solo lectura si no se completa un cargo. Si el diseño del sistema cambió, también las pantallas.
6. **Factura de la suscripción** (si se da, una pregunta más en Pago).
7. **Imagen al compartir** (`/brand/og-talleres.jpg`).
8. **Repositorio privado:** mientras el repositorio sea público, el código, las maquetas y los precios se pueden leer en GitHub aunque la página esté oculta (`25 §2`).

**Cómo encender:** con los datos de arriba, el prompt «Para talleres · Encender» de `docs/prompts.md`. Ese paso agrega las 3 rutas a `e2e/urls.ts` y `lighthouserc.json`, mide presupuestos y Lighthouse, despliega y revisa en vivo.

## Bloqueado o dudoso
- **Despliegue:** no se hizo (instrucción del dueño; la fase 8 tampoco está hecha). Para desplegar con el interruptor apagado: `pnpm build && pnpm exec wrangler deploy`, con las credenciales de Cloudflare de `progreso.md › Bloqueos`. Después, revisar en vivo que `/talleres`, `/talleres/precios`, `/talleres/descargar` y `/%74alleres` den 404, y que el menú, el footer, `/aprende/negocio/costo` y `sitemap.xml` no mencionen `/talleres`.
- **WebKit (Safari):** sin probar aquí. En la Mac: `pnpm exec playwright install webkit` y `pnpm e2e:admin`, que corren los flujos M, N y P en iPhone 13 y en 1440.
- **Panel en Safari anterior a 17:** `slugify` usa una expresión con *lookbehind* y bandera `v`, así que crear un producto podría fallar ahí. No es de esta fase; queda anotado.

## Cómo probarlo
```bash
pnpm install
pnpm dev                     # http://localhost:4321/talleres, /talleres/precios y /talleres/descargar
pnpm test && pnpm lint && pnpm typecheck && pnpm security
pnpm e2e                     # público (preview: /talleres da 404) y con pnpm dev (flujos M, N, P, ligas y axe)
pnpm build && pnpm size
```
