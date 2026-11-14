# 25 · Para talleres

La página de venta del sistema para talleres (nombre provisional: **Quick Cerebro**) dentro de la web de Quick Robot: qué hace, cuánto cuesta y dónde se descarga. **Se construye, se prueba y se publica oculta**: nadie puede entrar hasta que el sistema salga y el dueño la encienda (§2, §13).

Maquetas: `reference/mockups/talleres/` (empieza por `index.html`). Reglas de celular, tableta, escritorio y Safari: las de `24`, con lo propio en §8.

---

## 1. Qué es

| | |
|---|---|
| **Para quién** | Dueños de talleres de impresión 3D en México: de 1 a 10 impresoras (casi siempre Bambu Lab), venden por WhatsApp, Facebook y Mercado Libre, llevan costos y pedidos en libreta o Excel |
| **Qué tiene que lograr** | Que entiendan en segundos qué hace el sistema, vean el precio sin buscarlo y empiecen la prueba de 14 días |
| **Marca** | Quick Robot es la marca madre (como Adobe con sus programas). La página lleva el estilo de la web (`03`); el panel del sistema es neutro y aparece solo en las capturas. Q-404 no es la cara del sistema: solo sale en la foto del taller (§7.1, «Hecho en un taller») |
| **Qué no hace** | Cuentas, registro, entrar, pagos ni descargas propias. Todo eso vive en el sistema; la web solo **enlaza** a `site.system.appUrl` y a los archivos de `site.system.downloads` (§4) |

Tres páginas: principal, precios y descargar. Las pantallas de crear cuenta y entrar son del sistema (su fase de nube), no de esta web.

## 2. Oculta hasta que el sistema salga

**Un solo interruptor:** `site.system.enabled` (`false`). Todo lo de esta sección se decide con una sola constante:

```ts
// src/config/system.ts
export const systemVisible = isSystemVisible({ enabled: site.system.enabled, dev: import.meta.env.DEV });
```

`isSystemVisible` (pura, en `src/lib/system/visibility.ts`) devuelve `enabled || dev`: en `pnpm dev` las páginas se ven para construirlas y probarlas; en cualquier build (`pnpm preview`, producción) solo con el interruptor encendido.

**Mientras esté apagado:**

1. **Doble cerrojo**, como el panel (`CLAUDE.md` regla 5):
   - **Middleware:** si `isSystemPath(pathname)` y no `systemVisible` → `context.rewrite('/404')` antes de todo lo demás (después de la redirección de la barra final). `isSystemPath` decodifica la ruta antes de compararla (`/%74alleres` y `/talleres%2Fprecios` también cuentan) y acepta `/talleres` y lo que cuelga de `/talleres/`, nada más (`/talleresx` no).
   - **Cada página** de `src/pages/talleres/` empieza con `if (!systemVisible) return Astro.rewrite('/404');`.
2. **Nunca prerender:** las páginas llevan `export const prerender = false` (como todas). Un HTML estático en `dist/` lo serviría Cloudflare sin pasar por el Worker. `pnpm security` lo revisa (§12).
3. **Ninguna liga:** el menú del header, el footer, el llamado `system` de Aprende (`21 §4.6`) y el sitemap solo incluyen `/talleres` con `systemVisible`. La lista del menú se arma en un solo lugar (`siteNav()`, §6) para el header y el footer.
4. **`robots.txt` no menciona `/talleres`:** un `Disallow` anunciaría la ruta.
5. **Capturas:** viven en `public/brand/talleres/` (las arma `build-assets`, §4) y existen aunque nada las enlace. Son pantallas con datos de ejemplo, sin nada privado; se acepta (`decisiones.md`).
6. **Repositorio:** el código, las maquetas y los precios están en GitHub. Si el repositorio es público, cualquiera los puede leer ahí; para que nada se vea antes de tiempo, el repositorio tiene que ser privado (pendiente del dueño, `01`).

**Para encenderla:** §13.

## 3. Rutas

| Ruta | Página | Maqueta |
|---|---|---|
| `/talleres` | Principal | `talleres.html` |
| `/talleres/precios` | Precios | `precios.html` |
| `/talleres/descargar` | Descargar | `descargar.html` |

En el servidor, en cada visita, como el resto (`07`). Con el interruptor apagado, las tres y cualquier otra bajo `/talleres/` responden **404** (§2). Salidas al sistema: «Probar gratis» → `appUrl + signUpPath`; «Entrar» → `appUrl + signInPath`. Ligas externas con `rel="noopener"`.

## 4. Datos y textos

**Datos del negocio** (`CLAUDE.md` regla 8), en `site.system`. Valores provisionales hasta la beta (`01 › Pendientes del dueño`):

| Campo | Provisional | Qué es |
|---|---|---|
| `enabled` | `false` | El interruptor (§2) |
| `name` | `'Quick Cerebro'` | Nombre del sistema; ningún texto lo escribe a mano (`es.ts` lo recibe) |
| `appUrl` | `'https://sistema.quickrobot.example'` | Dirección del sistema |
| `signUpPath`, `signInPath` | `'/crear-cuenta'`, `'/entrar'` | Rutas del sistema |
| `downloads.mac` | `{ url: '', minOs: 'macOS 12 o más nuevo' }` | Archivo `.dmg` |
| `downloads.windows` | `{ url: '', minOs: 'Windows 10 u 11 de 64 bits' }` | Archivo `.exe` |
| `trialDays` | `14` | Días de prueba (del plan Negocio, sin tarjeta) |
| `founderSeats` | `50` | Talleres con precio de fundador |
| `plans` | Tabla de abajo | Precios y límites |

| `id` | Nombre | Mensual | Anual | Personas | Impresoras | Ventas y pedidos al mes | Talleres por cuenta |
|---|---|---|---|---|---|---|---|
| `free` | Gratis | $0 | $0 | 1 | 2 | 15 | 1 |
| `shop` | Taller (recomendado) | $149 | $1,490 | 2 | sin límite (`null`) | sin límite | 1 |
| `business` | Negocio | $299 | $2,990 | 8 | sin límite | sin límite | 3 |

Pesos mexicanos con IVA; anual = 10 meses. Tienen que coincidir con la tabla de planes del sistema: al encender se revisan (§13).

**Estructura de la página** (no son datos del negocio), en `src/config/system.ts`: `systemVisible` (§2), las filas de la comparación (qué plan trae qué, leyendo los límites de `site.system.plans`), las capturas del recorrido (id, archivo), el ejemplo de «De cada $100» (8 montos que suman 100.00), la matriz de roles y las plataformas de descarga (id, archivo de `downloads` o `null`).

**Textos:** `es.system` en `src/i18n/es.ts`, tomados de las maquetas. Funciones donde el texto lleva datos (`(name) => …`, `(n) => …`). Precios con `src/lib/money.ts`.

**Capturas:** `assets/talleres/*.webp` (2880 × 1800, panel neutro, negocio de ejemplo «Eje Z», sin personajes con licencia). `scripts/build-assets.mjs` arma `public/brand/talleres/<nombre>-<ancho>.webp` en 720, 1440 y 2160 (nunca agranda). Se reemplazan cuando cambien las pantallas del sistema (§13).

| Archivo | Pantalla | Dónde |
|---|---|---|
| `inicio` | Inicio | Hero |
| `pieza` | Editar pieza (costo, precio, ganancia) | Recorrido · Costos y precios |
| `pedidos` | Pedidos (tablero) | Recorrido · Pedidos; Descargar |
| `produccion` | Producción | Recorrido · Producción |
| `existencias` | Existencias (lista) | Recorrido · Existencias |
| `reportes` | Reportes | Recorrido · Reportes |

La foto del taller (§7.1) es la portada por defecto de la web (`/brand/hero-desktop-*.webp`): no se agrega otra.

## 5. Lógica pura (`src/lib/system/`)

| Archivo | Funciones | Casos obligatorios |
|---|---|---|
| `visibility.ts` | `isSystemPath(pathname)`, `isSystemVisible({ enabled, dev })` | `/talleres`, `/talleres/`, `/talleres/precios` → sí; `/talleresx`, `/aprende/talleres`, `/` → no; `/%74alleres` y `/talleres%2Fprecios` → sí; ruta mal codificada (`/%E0%A4%A`) → no y sin error |
| `plans.ts` | `recommendPlan({ printers, people, orders }, plans)` → el plan más barato cuyos límites cubren los tres (si ninguno, el último y `contact: true`); `planReasons(...)` → claves de motivo con su número (`freeLimits`, `printers`, `twoPeople`, `roles`, `orders`, `contact`); `planPrice(plan, 'monthly' \| 'yearly')`; `yearlyPerMonth(plan)` (redondeado al peso) | 1 impresora, 1 persona, 10 → Gratis · 12, 2, 30 → Taller con `printers: 12` · 3 personas → Negocio con `roles` · 10 personas → Negocio con `contact` · 2, 1, 15 → Gratis (los límites son «hasta») · 3, 1, 0 → Taller · anual de Taller = $1,490 y $124 al mes |
| `platform.ts` | `detectPlatform(userAgent)` → `'mac' \| 'windows' \| 'mobile' \| 'other'` | Safari y Chrome de Mac → `mac`; Edge y Chrome de Windows → `windows`; iPhone, Android → `mobile`; iPad que se presenta como Mac → `mac` (aceptado: abajo están todas las opciones); Linux, vacío → `other` |
| `money-split.ts` | `splitSegments(items)` → cada parte con su inicio y ancho en % para la barra de «De cada $100» | Suma 100; partes de 0 no rompen; el ejemplo de `config/system.ts` da los mismos anchos de la maqueta |

Y en `src/lib/cost.ts` (se mueve desde `src/lib/learn/`, §6): `profitAt(cost, price)` → `{ profit, times } | null` (`null` sin precio o con costo 0; ganancia negativa permitida). Caso: costo $21.04 y precio $120 → $98.96 y 5.7 veces.

## 6. Componentes: reutilizar antes que crear

**Lo que ya existe y se usa** (o se mueve para que lo usen dos secciones; el comportamiento de Aprende no cambia y sus pruebas siguen pasando):

| Pieza | Hoy | Cambio |
|---|---|---|
| `CostCalculator.astro` | `src/components/learn/` | Pasa a `src/components/site/`. Props nuevas: `withPrice` (agrega «Precio de venta» y el bloque de ganancia con `profitAt`), `title` y `headingLevel` (`h2` en Aprende, `h3` en Para talleres). Sus estilos `.calc*` salen de `learn.css` al componente. Sus ids (`calc-h`, `c-*`) admiten un prefijo para no chocar |
| `cost.ts` | `src/lib/learn/` | Pasa a `src/lib/cost.ts` (con `profitAt`) |
| `parseAmount` | `src/lib/learn/tables.ts` | Pasa a `src/lib/number.ts` (lo usan las tablas de Aprende y la calculadora) |
| `Faqs.astro` | `src/components/learn/` | Pasa a `src/components/site/`. Props nuevas: `title` y `headingId` (Aprende pasa `es.learn.faq`). Sus estilos `.faq` al componente |
| `Button.astro` + `button-variants.ts` | Variantes `black` y `green` | Se agregan `outline` (blanco con borde `--line`, borde `--ink` al pasar el mouse) y `outlineLight` (transparente con borde blanco, para el cierre oscuro) |
| `Header.astro` | Fijo arriba | Prop `sticky` (por defecto `true`): en Para talleres el header se va con el scroll y se queda la barra del producto. Ligas de `siteNav()` |
| `Footer.astro` | Ligas de `es.header.nav` | Ligas de `siteNav()` |
| `siteNav()` | — | Nueva, en `src/lib/nav.ts` (pura): las ligas del menú; agrega «Para talleres» (`{ label, short: 'Talleres', href: '/talleres' }`) solo si recibe `systemVisible = true`. Header y footer la llaman con la constante |
| `BaseLayout.astro` | — | Prop `stickyHeader` que pasa a `Header` |
| `Picture.astro` | Imágenes de `public/brand/` | Capturas y foto del taller |
| `Cta.astro` (Aprende) | `system` no muestra nada | Con `systemVisible`: `ctaText` y botón a `/talleres` (`21 §4.6`) |
| Tokens | `global.css` + copias en `.learn` | `--ink-3`, `--green-d`, `--red`, `--red-l`, `--amber`, `--amber-l` pasan a `:root` (`03 §2`); `.learn` deja de repetir los que ya están en `:root` |

**Nuevos**, en `src/components/system/` (cada uno con sus estilos en su `<style>`):

| Componente | Qué hace | Maqueta |
|---|---|---|
| `SystemLayout.astro` (`src/layouts/`) | `BaseLayout` con `stickyHeader={false}`, `SystemNav`, `<main class="system">` y `src/styles/system.css` (solo lo común: títulos `t-h1`/`t-h2`, `.lead`, `.link`, bandas de color, márgenes de ancla bajo la barra, letra de 17 px en celular como las maquetas, el encabezado de sección `.sec-h`, el marco de tablas `.tbl-wrap` y la palomita `--check`) | Todas |
| `SystemNav.astro` | Barra del producto (ícono, nombre, Funciones · Precios · Descargar, Entrar, Probar gratis); en celular las ligas van en un `<details>` (sin script) | `.pbar` |
| `AppWindow.astro` | Ventana de la app con una captura (`Picture`), recorte con punto de interés por captura en celular, `priority` para el hero | `.win` |
| `SectionHead.astro` | `h2` y frase (sin doble filete, §7). Sus estilos están en `system.css`, porque `Faqs` con `wide` pinta el mismo encabezado | `.sec-h` |
| `MoneySplit.astro` | «De cada $100»: barra en SVG (anchos como atributos, con `splitSegments`) y leyenda | `.money` |
| `FeatureTour.astro` | Recorrido: pestañas en escritorio, acordeón en celular y tableta (+ script) | `.tour` |
| `Flow.astro` | Del archivo a la entrega: 5 pasos con su cuadrito de la app | `.flow` |
| `RolesTable.astro` | Qué ve cada rol | `.roles` |
| `PlanBand.astro` | Los 3 planes en una banda (portada y precios). Pinta el mensual con el anual debajo; cada precio (`[data-plan-price]`) lleva los textos de los dos periodos en `data-monthly-*` y `data-yearly-*` (`amount`, `per`, `note`), así `PeriodToggle` solo cambia texto | `.plans` |
| `PeriodToggle.astro` | Mensual o anual (+ script; sin JavaScript se ve el mensual y la línea «o $1,490 al año») | `.seg` |
| `PlanFinder.astro` | ¿Qué plan te toca? (+ script con `recommendPlan`) | `.finder` |
| `CompareTable.astro` | Comparación completa | `.cmp` |
| `PlatformList.astro` | Mac, Windows, navegador y celular; la del equipo marcada | `.plats` |
| `EndCta.astro` | Cierre oscuro con uno o dos botones | `.s-end` |

**Scripts** como los de Aprende (`07 §1`, `CLAUDE.md` reglas 13 y 17): arrancan en `astro:page-load`, limpian en `astro:before-swap` con `AbortController`, sin `innerHTML`, con las reglas de Safari de `24 §5`. Cero React en estas páginas.

## 7. Pantallas

**Sin doble filete** (las dos líneas morada y verde de `03 §4`): el dueño lo quitó de estas páginas; los títulos de sección van solos. El color de marca queda en el botón verde del cierre, la ganancia en verde y el foco morado.

### 7.1 Principal (`/talleres`)

| Sección | Contenido | Comportamiento |
|---|---|---|
| Barra del producto | Ícono (cabeza de Q-404 sobre cuadro negro) y nombre; Funciones · Precios · Descargar; Entrar; **Probar gratis** | Fija arriba (`position: sticky; top: 0`); el header de la web se va con el scroll. Liga actual subrayada |
| Hero | «Tu taller 3D, en orden.» a la izquierda; frase, **Probar 14 días gratis** y Ver precios a la derecha; tres datos con palomita (Sin tarjeta · Web, Mac y Windows · En pesos y en español); la ventana con **Inicio** debajo, a todo lo ancho | La captura es la imagen principal (`fetchpriority="high"` y precarga) |
| Franja | «Lee el archivo de» Bambu Studio, OrcaSlicer, PrusaSlicer · «Una cuenta en» Navegador, Mac, Windows, Celular | Texto, sin logos de otras marcas |
| De cada $100 (`#funciones`) | Título, frase y la barra con su leyenda; «Ejemplo de un taller con 13 ventas en 30 días» | Gris oscuro = costo, verde = ganancia (la regla de color del sistema). La barra tiene nombre accesible con todos los montos |
| Recorrido | 5 temas: Costos y precios · Pedidos con anticipo · Producción por impresora · Existencias y filamento · Reportes. Cada uno: frase, captura y 3 puntos | Escritorio: lista a la izquierda (siempre uno abierto), captura a la derecha; ↑ ↓ entre temas. Celular y tableta: acordeón (uno abierto a la vez; se puede cerrar) |
| Del archivo a la entrega | 5 pasos numerados unidos por una línea gris de 2 px: archivo → precio → pedido con anticipo → impresora → entrega y cobro, con el ejemplo de 20 servilleteros | Escritorio en fila; celular y tableta en columna con la línea a la izquierda |
| Equipo | Matriz Dueño · Administración · Ventas · Taller | En celular, la tabla se desliza con la primera columna fija (`24 §3`) |
| Tus datos | Copia diaria · Descarga todo · Cada taller por separado · Nada se borra | Texto en 2 columnas |
| Calculadora (`#calculadora`) | `CostCalculator` con precio y su llamado «¿Tienes el archivo del laminador?» | La de Aprende (`21 §6.4`) |
| Hecho en un taller | Foto del taller (recorte con las piezas y Q-404), «Lo usamos todos los días en nuestro taller.», liga a `/` | — |
| Precios | `PlanBand` y «Comparar los planes» | Mensual |
| Preguntas | `Faqs` con 6 preguntas | `<details>` |
| Cierre | «Tu primera pieza con costo real, en 5 minutos.» Probar gratis · Descargar la app | Banda oscura |

### 7.2 Precios (`/talleres/precios`)

Encabezado con `h1`, frase y `PeriodToggle` → `PlanBand` → **¿Qué plan te toca?** (impresoras 1–20, personas 1–10, ventas y pedidos al mes 0–100 de 5 en 5; el máximo se lee «20 o más»; resultado con plan, precio, motivos y botón) → Precio de fundador → `CompareTable` → Preguntas sobre el pago → Cierre.

Mensual o anual cambia los precios de la banda **y** el resultado del buscador de plan. Sin JavaScript: mensual con su línea anual debajo, y el buscador muestra Taller (el recomendado) sin motivos.

### 7.3 Descargar (`/talleres/descargar`)

Encabezado con el botón principal **según el equipo** (`detectPlatform` con el `User-Agent`, en el servidor; respuesta con `Vary: User-Agent`): Mac → «Descargar para Mac», Windows → «Descargar para Windows», celular u otro → «Abrir en el navegador». A la derecha, la ventana con **Pedidos**. Debajo `PlatformList` (la fila del equipo marcada «Para tu equipo»), Lo que suma la app, Instalar en Mac y en Windows, Cierre. Sin JavaScript.

Mientras `downloads.*.url` esté vacío (antes de encender), los botones de descarga apuntan a `/talleres/descargar#mac` / `#windows`; encender sin archivos no se puede (§13).

## 8. Dispositivos y navegadores

Valen `24 §1, §2, §4, §5`. Lo propio:

| Componente | Celular (≤ 760) | Tableta (761–1099) | Escritorio (≥ 1100) |
|---|---|---|---|
| Header de la web | Se va con el scroll. ≤ 480: «Talleres» en lugar de «Para talleres» (el nombre completo queda para lectores de pantalla) | Se va con el scroll | Se va con el scroll |
| Barra del producto | 54 px; nombre, flecha que abre las ligas y Probar gratis | 60 px; todo en una fila | Igual |
| Hero | Título, frase, botones y datos en columna; captura recortada en vertical en la parte que importa | Una columna | Título a la izquierda, frase y botones a la derecha |
| Capturas | Recorte vertical (125 %) con el punto de interés de cada captura | Completas | Completas |
| De cada $100 | Leyenda en una columna | Dos columnas | Texto a la izquierda, barra a la derecha |
| Recorrido | Acordeón | Acordeón | Pestañas |
| Del archivo a la entrega | Columna con la línea a la izquierda | Igual | Fila de 5 |
| Planes | Uno debajo de otro | Igual hasta 899; desde 900, tres columnas | Tres columnas |
| ¿Qué plan te toca? | Controles arriba, resultado abajo | Igual | Resultado a la derecha, fijo al hacer scroll |
| Comparación | Tres columnas angostas | Completa | Completa |
| Plataformas | Una por bloque | Igual hasta 899 | Fila con nombre, qué es y botón |

**Safari 14:** proporciones de las capturas con el truco de `padding-top` (sin `aspect-ratio`), sin `inset`, el menú de la barra con `<details>`, deslizadores con estilos `-webkit-` y `-moz-` (el relleno con `--p` que pone el script), `-webkit-backdrop-filter`. Lo que no esté en `24 §5` se revisa con la lista de la fase 9.

## 9. Seguridad

- **Cerrojo** de §2 (middleware + página + sin prerender + sin ligas).
- **CSP sin cambios:** la dirección del sistema y las descargas son ligas (navegación), no recursos que cargue la página.
- **Sin atributos `style` nuevos** (la regla que ya sigue Aprende, `decisiones.md`: los `style=""` de las maquetas pasan a clases). Los anchos de la barra de $100 y de las barritas de los pasos van como atributos de SVG; el punto de interés de cada captura, como regla de CSS por captura (`[data-shot="…"]`); el relleno de los deslizadores, con `element.style.setProperty` desde el script. Nada de manejadores en el HTML (`onsubmit`, `onclick`): la CSP no deja correr código en línea; el script escucha el evento.
- **Nada de `set:html` ni `innerHTML`** (regla 11).
- El `User-Agent` solo elige el botón; no se guarda ni se registra.
- No hay formularios que manden datos: el buscador de plan y la calculadora calculan en el navegador.

## 10. SEO y compartir (al encender)

- Títulos y descripciones en `es.system.seo`: «{nombre} · Sistema para talleres de impresión 3D», etc. Canónica de cada página.
- JSON-LD `SoftwareApplication` (nombre, `applicationCategory: BusinessApplication`, `operatingSystem: 'Web, macOS, Windows'`, `offers` con los 3 planes en MXN) en `/talleres`.
- Las 3 rutas en el sitemap (solo con `systemVisible`).
- Imagen al compartir propia (`/brand/og-talleres.jpg`, pendiente del dueño); mientras falte, la de la web.

## 11. Rendimiento

| Página | JS al abrir | Notas |
|---|---|---|
| `/talleres` | ≤ 20 KB | Recorrido y calculadora; sin React |
| `/talleres/precios` | ≤ 15 KB | Mensual o anual y buscador de plan |
| `/talleres/descargar` | ≤ 8 KB | Sin scripts propios (el servidor elige el botón) |

Hero: captura con `fetchpriority="high"` y precarga; las demás `loading="lazy"`. `sizes`: hero `(max-width: 760px) 100vw, 1232px`; recorrido `(max-width: 1099px) 100vw, 800px`; foto del taller `(max-width: 1099px) 100vw, 660px`; captura de Descargar (imagen principal de esa página, con precarga) `(min-width: 1100px) 700px, 100vw`. Lighthouse con las metas de `15 §1` al encender (las URLs entran a `lighthouserc.json` en ese momento).

## 12. Pruebas

| Tipo | Qué |
|---|---|
| Unitarias | Los casos de §5; `siteNav(true/false)`; `CostCalculator` con y sin precio; invariantes de los datos: anual = 10 × mensual, un solo plan recomendado, cada fila de la comparación usa un límite que existe, el ejemplo de $100 suma 100.00 |
| Guardia de encendido | Si `site.system.enabled` es `true`: `appUrl` y `downloads.*.url` son `https://`, no están vacíos ni usan un dominio de ejemplo (`.example`, `.test`), `name` no está vacío (`src/lib/system/guard.ts`, `tests/system-data.test.ts`). Si no, la prueba falla y no se puede fusionar |
| Seguridad (build de producción, `pnpm preview`) | `tests/security/system-hidden.spec.ts`: `/talleres`, `/talleres/`, `/talleres/precios`, `/talleres/descargar`, `/talleres/x`, `/%74alleres`, `/talleres%2Fprecios` → 404 con la página 404 de la web; el HTML de `/`, `/catalogo`, `/aprende` y `/aprende/negocio/costo` no contiene `/talleres`; ni el sitemap ni `robots.txt` |
| `pnpm security` | Ningún `.html` con `talleres` en `dist/`; ningún archivo de `src/pages/talleres/` exporta `prerender = true`; cada uno contiene el cerrojo de §2 |
| Flujos (Playwright con `pnpm dev`, en Chromium y WebKit; un archivo por página: `e2e/dev-talleres-principal.spec.ts` M y O, `dev-talleres-precios.spec.ts` N, `dev-talleres-descargar.spec.ts` P, y `dev-talleres-ligas.spec.ts` para el menú, el footer, el llamado de Aprende y el sitemap. WebKit con los proyectos `webkit-w390` y `webkit-w1440` de `playwright.admin.config.ts`, que se activan solo si WebKit está instalado) | **M** recorrido: abrir Pedidos en escritorio (Costos se cierra), ↓ pasa a Producción; en 390, cerrar y abrir · **N** precios: Anual → Taller $1,490 y «Equivale a $124 al mes»; 1/1/10 → Gratis; 12 impresoras → Taller con «Con 12 impresoras…»; 3 personas → Negocio; 10 personas → «escríbenos» · **O** calculadora con precio $120 → ganancia $98.96 y 5.7 veces; precio $15 → ganancia negativa en rojo · **P** descargar con `User-Agent` de Mac, de Windows y de iPhone → su botón |
| Visual | Las 3 páginas contra las maquetas en 360, 390, 820 y 1440; sin scroll horizontal |
| Accesibilidad | axe sin errores serios en las 3 páginas (con `pnpm dev`, `e2e/dev-talleres-a11y.spec.ts`, en 390, 820 y 1440) |
| Regresión de Aprende | Las pruebas de Aprende siguen pasando sin cambios después de mover calculadora, preguntas y tokens; capturas de `/aprende/negocio/costo` iguales |

Las pruebas de cabeceras y CSP (`headers.spec.ts`) y Lighthouse solo corren sobre el build de producción: las 3 rutas se agregan a `e2e/urls.ts` y a `lighthouserc.json` **al encender** (§13), no antes (darían 404).

## 13. Encender (cuando el sistema salga)

Lo hace Claude Code con el prompt «Para talleres · Encender» (`prompts.md`), en una rama, con estos datos del dueño:

1. **Nombre final** del sistema (`site.system.name`).
2. **Precios y límites** confirmados con la beta (`site.system.plans`), iguales a los del sistema.
3. **Dirección del sistema** y rutas de registro y entrar (`appUrl`, `signUpPath`, `signInPath`).
4. **Archivos de descarga** (Mac y Windows) y sus requisitos (`downloads`).
5. **Capturas** nuevas si cambiaron las pantallas (`assets/talleres/`, mismos nombres; sin datos reales de clientes ni personajes con licencia).
6. **Revisión de lo que promete la página contra el sistema:** leer el archivo del laminador (Bambu Studio, OrcaSlicer, PrusaSlicer), roles y bitácora, logo en cotizaciones y notas, cargar desde Excel, copias diarias y descarga de todo, solo lectura si no pasa un cobro, uso en el celular. Lo que no exista se quita del texto (`es.system`) y de la comparación.
7. **Factura de la suscripción:** si se da, se agrega la pregunta «¿Dan factura?» a Sobre el pago.
8. **Imagen al compartir** (`/brand/og-talleres.jpg`).
9. `site.system.enabled = true`; las 3 rutas a `e2e/urls.ts` y `lighthouserc.json`; todas las pruebas, `pnpm security`, `pnpm size`, Lighthouse.
10. Desplegar, revisar en vivo (las 3 páginas, el menú, el footer, el llamado de Aprende, el sitemap) y mandar el sitemap otra vez en Search Console.

## 14. Diferencias con las maquetas

| Maqueta | Web |
|---|---|
| «Quick Cerebro» escrito en el HTML | `site.system.name` |
| Ligas a `#probar`, `#entrar`, `#mac` | `appUrl + …` y `downloads.*.url` |
| El botón de Descargar lo elige el navegador | Lo elige el servidor con el `User-Agent` (§7.3) |
| `window.PLANES` en un `<script>` del HTML | El servidor pasa los planes y los textos ya escritos en `data-finder-data` (JSON); el script no importa `site` ni `es` |
| El periodo y el buscador comparten una variable | El periodo avisa con el evento `system:period`; `PlanBand` trae los textos de los dos periodos en `data-*` |
| Recorrido: «−» en la pestaña abierta y banda gris tras el paso 5 en escritorio | Sin signo (en escritorio no se cierra) y línea de 2 px |
| Nombre del plan en precios con el tamaño del navegador | 22 px, como en la principal |
| La calculadora usa ids (`c-g`, `r-t`…) | La de Aprende con `data-*` (`CostCalculator`) |
| `onsubmit="return false"` en los formularios | El script escucha `submit` |
| Base compartida en `reference/mockups/_base.css` y `_base.js` | `global.css`, los componentes compartidos y sus estilos |
| Las capturas se leen de `assets/talleres/` | `public/brand/talleres/` (las arma `build-assets`) |

## 15. Después

- Precios leídos del sistema (un endpoint público) en lugar de `site.ts`, para que nunca se desalineen.
- Contar toques a «Probar gratis» y a las descargas (como los de WhatsApp, `18`).
- Testimonios de talleres de la beta (con su permiso).
- Página de novedades del sistema.
