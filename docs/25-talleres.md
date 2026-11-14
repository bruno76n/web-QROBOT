# 25 · Para talleres

La página de venta del sistema para talleres (nombre provisional: **Quick Cerebro**) dentro de la web de Quick Robot: qué hace cada módulo, cuánto cuesta y dónde se descarga. **Se construye, se prueba y se publica oculta**: nadie puede entrar hasta que el sistema salga y el dueño la encienda (§2, §13).

Maquetas: `reference/mockups/talleres/` (empieza por `index.html`). Reglas de celular, tableta, escritorio y Safari: las de `24`, con lo propio en §8.

---

## 1. Qué es

| | |
|---|---|
| **Para quién** | Dueños de talleres de impresión 3D en México: de 1 a 10 impresoras (casi siempre Bambu Lab), venden por WhatsApp, Facebook y Mercado Libre, llevan costos y pedidos en libreta o Excel |
| **Qué tiene que lograr** | Que entiendan qué hace cada módulo del sistema, vean el precio sin buscarlo y empiecen la prueba de 14 días |
| **Marca** | Quick Robot es la marca madre (como Adobe con sus programas). La página lleva el estilo de la web (`03`) con el nombre del sistema en grande, como el del footer. Las **pantallas del sistema se dibujan en HTML** (§6.3), con interfaz neutra (sin morado): son la referencia del diseño del sistema que se distribuye (ronda 3 del sistema). Q-404 no aparece: solo el logo en el header y en el ícono de la barra |
| **Qué dice** | Solo lo que el sistema hace: cada frase sale de sus reglas (`qr-sys/docs/04` y `06`). Nada de leer el archivo del laminador, logo en cotizaciones, importar desde Excel ni varios talleres por cuenta: el sistema no lo tiene |
| **Tono** | Página de producto grande: cada sección lleva arriba el **nombre del módulo** (con su ícono del menú) y como título una **frase de impacto** concreta del taller 3D («Sabes cuánto ganas antes de imprimir.», «Tus impresoras no descansan. Tú sí.»); debajo, los detalles concretos. Nada de frases de relleno («lleva tu negocio al siguiente nivel») |
| **Vocabulario** | En tablas, pantallas y detalles, el de un sistema: Fecha de entrega, Estado, Folio, Saldo, Disponible, Stock bajo, Crítico, Vencido, Tiempo restante, Ganancia bruta, Ganancia neta. Nada coloquial («para cuándo», «lo que debe», «se acaba») |
| **Qué no hace** | Cuentas, registro, inicio de sesión, pagos ni descargas propias. Todo eso vive en el sistema; la web solo **enlaza** a `site.system.appUrl` y a los archivos de `site.system.downloads` (§4) |

Tres páginas: principal, precios y descargar. Las pantallas de crear cuenta e iniciar sesión son del sistema (su fase de nube), no de esta web.

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
5. **Sin archivos sueltos:** las pantallas del sistema son HTML dentro de las páginas (no hay capturas ni fotos propias en `public/`).
6. **Repositorio:** el código, las maquetas y los precios están en GitHub. Si el repositorio es público, cualquiera los puede leer ahí; para que nada se vea antes de tiempo, el repositorio tiene que ser privado (pendiente del dueño, `01`).

**Para encenderla:** §13.

## 3. Rutas

| Ruta | Página | Maqueta |
|---|---|---|
| `/talleres` | Principal | `talleres.html` |
| `/talleres/precios` | Precios | `precios.html` |
| `/talleres/descargar` | Descargar | `descargar.html` |

En el servidor, en cada visita, como el resto (`07`). Con el interruptor apagado, las tres y cualquier otra bajo `/talleres/` responden **404** (§2). Salidas al sistema: «Probar gratis» y «Crear cuenta» → `appUrl + signUpPath`; «Iniciar sesión» → `appUrl + signInPath`. Ligas externas con `rel="noopener"`.

## 4. Datos y textos

**Datos del negocio** (`CLAUDE.md` regla 8), en `site.system`. Valores provisionales hasta la beta (`01 › Pendientes del dueño`):

| Campo | Provisional | Qué es |
|---|---|---|
| `enabled` | `false` | El interruptor (§2) |
| `name` | `'Quick Cerebro'` | Nombre del sistema; ningún texto lo escribe a mano (`es.ts` lo recibe) |
| `appUrl` | `'https://sistema.quickrobot.example'` | Dirección del sistema |
| `signUpPath`, `signInPath` | `'/crear-cuenta'`, `'/entrar'` | Rutas del sistema |
| `downloads.mac` | `{ url: '', minOs: 'macOS 12 o posterior' }` | Archivo `.dmg` |
| `downloads.windows` | `{ url: '', minOs: 'Windows 10 u 11 de 64 bits' }` | Archivo `.exe` |
| `trialDays` | `14` | Días de prueba (del plan Negocio, sin tarjeta) |
| `founderSeats` | `50` | Talleres con precio de fundador |
| `plans` | Tabla de abajo | Precios y límites |

| `id` | Nombre | Mensual | Anual | Usuarios | Impresoras | Ventas y pedidos al mes |
|---|---|---|---|---|---|---|
| `free` | Gratis | $0 | $0 | 1 | 2 | 15 |
| `shop` | Taller (recomendado) | $149 | $1,490 | 2 | ilimitadas (`null`) | ilimitados (`null`) |
| `business` | Negocio | $299 | $2,990 | 8, con roles | ilimitadas | ilimitados |

Pesos mexicanos con IVA; anual = 10 meses. Tienen que coincidir con la tabla de planes del sistema: al encender se revisan (§13).

**Estructura de la página** (no son datos del negocio), en `src/config/system.ts`: `systemVisible` (§2); los **módulos** en el orden del menú del sistema (grupo, ícono, clave de texto); la **fórmula** del costo (4 filas y el total); las **alertas** (alerta, cuándo aparece, acción); la **matriz de roles**; las filas de la **comparación** (leyendo los límites de `site.system.plans`); las **plataformas** (id, archivo de `downloads` o `null`).

**Datos de ejemplo de las pantallas**, en `src/config/system-demo.ts`: el taller «Eje Z» al 13 de noviembre de 2026, una sola fuente para todas las pantallas (§6.3). Los números cuadran entre sí y una prueba lo revisa (§12): 13 ventas por $6,270 en 30 días (5 semanas de $50, $1,550, $1,690, $1,630 y $1,350), ganancia bruta $5,077, gastos $2,707, ganancia neta $2,370; de cada $100: gastos del negocio $43.00, material $8.70, máquina $5.40, extras e insumos $2.00, comisiones $1.40, reserva por fallos $0.90, luz $0.70 y ganancia neta $37.90; por canal: WhatsApp 8 ventas $4,620, Facebook Marketplace 3 ventas $1,150, Mercado Libre 2 ventas $500 con $85 de comisión; el servilletero con logo: material $17.01 + máquina $7.50 + luz $0.90 + extras $0.00, reserva por fallos de 5 % = **$26.75**, precio $120, ganancia $93.25 (77.7 %, 4.5×), $72.85 por Mercado Libre (17 %), precio mínimo $39.00 (margen 30 %); el pedido #3: $2,350, pagado $1,000, saldo $1,350; existencias: 25 piezas, 10 apartadas, 15 disponibles; compras sugeridas: 4 artículos por $1,292.

**Textos:** `es.system` en `src/i18n/es.ts`, tomados de las maquetas. Las etiquetas de las pantallas del sistema en `es.system.ui` (con el vocabulario de §1). Funciones donde el texto lleva datos (`(name) => …`, `(n) => …`). Precios con `src/lib/money.ts`.


## 5. Lógica pura (`src/lib/system/`)

| Archivo | Funciones | Casos obligatorios |
|---|---|---|
| `visibility.ts` | `isSystemPath(pathname)`, `isSystemVisible({ enabled, dev })` | `/talleres`, `/talleres/`, `/talleres/precios` → sí; `/talleresx`, `/aprende/talleres`, `/` → no; `/%74alleres` y `/talleres%2Fprecios` → sí; ruta mal codificada (`/%E0%A4%A`) → no y sin error |
| `plans.ts` | `planPrice(plan, 'monthly' \| 'yearly')`; `yearlyPerMonth(plan)` (redondeado al peso); `limitLabel(value)` (`null` → «Ilimitadas» o «Ilimitados» según la fila) | Anual de Taller = $1,490 y $124 al mes; Negocio = $2,990 y $249; Gratis = $0 en los dos |
| `platform.ts` | `detectPlatform(userAgent)` → `'mac' \| 'windows' \| 'mobile' \| 'other'` | Safari y Chrome de Mac → `mac`; Edge y Chrome de Windows → `windows`; iPhone, Android → `mobile`; iPad que se presenta como Mac → `mac` (aceptado: abajo están todas las opciones); Linux, vacío → `other` |
| `bars.ts` | `pct(value, max)` → 0–100 (redondeado a 2 decimales, sin negativos, `max` 0 → 0); `columns(points, cap)` → `{ y, h }` en % del alto para cada barra | `pct(43, 43)` = 100; `pct(-1, 10)` = 0; `pct(5, 0)` = 0; `columns([{ v: 1690 }], 2000)` → `{ y: 15.5, h: 84.5 }` |

## 6. Componentes: reutilizar antes que crear

### 6.1 Lo que ya existe y se usa

Se mueve lo que usan dos secciones; el comportamiento de Aprende no cambia y sus pruebas siguen pasando:

| Pieza | Hoy | Cambio |
|---|---|---|
| `Faqs.astro` | `src/components/learn/` | Pasa a `src/components/site/`. Props nuevas: `title`, `headingId`, `headingClass` y `side` (Para talleres: título a la izquierda en escritorio). Sus estilos `.faq` al componente |
| `Button.astro` + `button-variants.ts` | Variantes `black` y `green` | Se agregan `outline` (blanco con borde `--line`, borde `--ink` al pasar el mouse) y `outlineLight` (transparente con borde blanco, para el cierre oscuro) |
| `Header.astro` | Fijo arriba | Prop `sticky` (por defecto `true`): en Para talleres el header se va con el scroll y se queda la barra del producto. Ligas de `siteNav()` |
| `Footer.astro` | Ligas de `es.header.nav` | Ligas de `siteNav()` |
| `siteNav()` | — | Nueva, en `src/lib/nav.ts` (pura): las ligas del menú; agrega «Para talleres» (`{ label, short: 'Talleres', href: '/talleres' }`) solo si recibe `systemVisible = true`. Header y footer la llaman con la constante |
| `BaseLayout.astro` | — | Prop `stickyHeader` que pasa a `Header` |
| `Cta.astro` (Aprende) | `system` no muestra nada | Con `systemVisible`: `ctaText` y botón a `/talleres` (`21 §4.6`) |
| Tokens | `global.css` + copias en `.learn` | `--ink-3`, `--green-d`, `--red`, `--red-l`, `--amber`, `--amber-l`, `--amber-d` pasan a `:root` (`03 §2`); `.learn` deja de repetir los que ya están en `:root` |
| Íconos | `lucide-react` | `@lucide/astro` (`06`): los de la barra lateral del sistema y de los módulos. La maqueta dibuja trazos parecidos; en la web van los de lucide (`house`, `package`, `receipt`, `clipboard-list`, `disc`, `shopping-bag`, `printer`, `layers`, `archive`, `shopping-cart`, `users`, `wallet`, `chart-column`, `settings`, …) |

La **calculadora de costo se queda en Aprende** (`21 §6.4`): la página del sistema no lleva calculadora.

### 6.2 Nuevos de la página

En `src/components/system/`, cada uno con sus estilos en su `<style>`:

| Componente | Qué hace | Maqueta |
|---|---|---|
| `SystemLayout.astro` (`src/layouts/`) | `BaseLayout` con `stickyHeader={false}`, `SystemNav`, `<main class="system">`, `src/styles/system.css` (solo lo común: títulos `t-h1`/`t-h2`, bandas, márgenes de ancla bajo la barra) y `src/styles/system-ui.css` (§6.3) | Todas |
| `SystemNav.astro` | Barra del producto (ícono, nombre, Módulos · Precios · Descargar, Iniciar sesión, Probar gratis); en celular las ligas van en un `<details>` (sin script) | `.pbar` |
| `Wordmark.astro` | El nombre del sistema en grande (`h1`), en una línea | `.wordmark` |
| `ModuleKick.astro` | Nombre del módulo con su ícono del menú, arriba del título de una sección | `.kick` |
| `ModuleIcon.astro` | El ícono de lucide de cada módulo o sección (claves de `config/system.ts`); decorativo | `.ic` |
| `SectionHead.astro` | `ModuleKick` opcional, `h2` y frase | `.sec-h` |
| `ModuleIndex.astro` | Los 13 módulos en 3 grupos (Vender, Taller, Negocio) con ícono, nombre y qué hace | `.mods` |
| `FeatureSection.astro` | Sección de un módulo: `ModuleKick`, título, frase, `Specs` y la pantalla del sistema sobre su fondo lila (`Stage`); variantes `rev` (pantalla a la izquierda en escritorio), `soft` (fondo gris), `wide` (texto arriba, pantalla a todo lo ancho), `dark` (fondo negro, fondo de la pantalla gris oscuro) | `.feat` |
| `Specs.astro` | Lista de detalles: nombre en negritas y qué hace | `.specs` |
| `Stage.astro` | Fondo lila redondeado donde va una pantalla | `.stage` |
| `CostFormula.astro` | La fórmula del costo (4 filas y el total en negro) | `.formula` |
| `AlertsTable.astro` | Alerta, cuándo aparece y acción; en celular, filas apiladas | `.alerts` |
| `RolesTable.astro` | Módulos que ve cada rol; en celular cabe completa («Admin.») | `.roles` |
| `DataFacts.astro` | Copias de seguridad, exportación a Excel, información separada | `.facts3` |
| `PlanBand.astro` | Los 3 planes en una banda (principal y precios). Cada precio lleva los textos de los dos periodos en `data-monthly-*` y `data-yearly-*`, así `PeriodToggle` solo cambia texto. `trialNote={false}` (precios) deja la nota sin la frase de la prueba; el slot va en la línea de la nota («Comparar planes» en la principal) | `.plans` |
| `PeriodToggle.astro` | Mensual o anual (+ script; sin JavaScript se ve el mensual y la línea «o $1,490 al año») | `.seg` |
| `CompareTable.astro` | Comparación completa | `.cmp` |
| `PlatformList.astro` | Mac, Windows, navegador y celular; la del equipo marcada «Tu equipo» | `.plats` |
| `EndCta.astro` | Cierre oscuro «Tu taller merece un cerebro.» con uno o dos botones | `.s-end` |

En `system.css` también vive lo que comparten la principal y Descargar: el fondo del hero (`.hero-stage`, blanco que termina en lila) y la tabla base (`.tbl-wrap`).

### 6.3 Pantallas del sistema (ilustraciones en HTML)

No son capturas: son HTML y CSS con los datos de `system-demo.ts`. Así se ven nítidas en cualquier pantalla, en celular muestran su versión de celular y sirven de referencia para el diseño del sistema que se distribuye. En `src/components/system/ui/`:

| Componente | Pantalla | Dónde |
|---|---|---|
| `UiFrame.astro` | `<figure role="img" aria-label="…">` con la descripción completa de la pantalla; ventana con barra (`chrome`) o tarjeta | Todas |
| `UiSidebar.astro` | Barra lateral del sistema: negocio, Buscar ⌘K, Inicio y los 3 grupos con contadores | Inicio |
| `UiHome.astro` | Inicio: ventas de 30 días con ganancia bruta, gastos, ganancia neta y por cobrar; ventas por semana; alertas con su acción; en impresión; próximas entregas | Hero; Descargar |
| `UiFloats.astro` | Dos avisos que flotan sobre la pantalla del hero («Pedido #2 listo para entregar», «Ganancia neta · 30 días $2,370»); decorativos (`aria-hidden`), solo desde 1240 px | Hero |
| `UiPiece.astro` | Costo de una pieza: desglose con barra y %, costo, precio de lista (por valor o por fórmula), ganancia, margen, veces el costo, precio mínimo y ganancia por canal | Costo por pieza |
| `UiOrder.astro` | Pedido: estados con fecha, total, pagado, saldo, fecha de entrega, artículos con origen (existencias / por imprimir), impresora, avance y tiempo restante, fin estimado, pagos y acciones | Pedidos |
| `UiPrinters.astro` | Impresoras: trabajo actual con avance y tiempo restante, siguiente en cola, horas de uso, mantenimiento e inversión recuperada; producción de 30 días | Producción e impresoras |
| `UiFilaments.astro` + `UiPurchases.astro` | Filamentos (costo/g, disponible con barra, estado) y compras sugeridas por proveedor | Filamento, insumos y compras |
| `UiStock.astro` | Existencias con variantes, apartadas, disponibles, estado y sets armables | Existencias |
| `UiQuote.astro` | Cotización: datos del negocio, folio, fecha, vigencia, cliente, artículos, total y pie de página | Cotizaciones y notas de venta |
| `UiReports.astro` | Reportes: periodo, 5 cifras, ventas por semana, distribución de cada $100, productos con más ganancia y por canal | Reportes |
| `UiPill`, `UiMeter`, `UiBar`, `UiButton`, `UiColumns` | Estado con punto, barra de avance, barra horizontal, botón dibujado, columnas por semana | Dentro de las pantallas |

**Reglas de diseño de las pantallas** (`system-ui.css`, prefijo `.ui`):

- Interfaz neutra: blanco, gris `#f6f6f8` de fondo y líneas `#e9e9ee`. **Sin morado.**
- **Una gráfica, un color:** costos y ventas en gris (`#4a4a53` y `#dedee5`); **verde solo para ganancia**; ámbar y rojo solo para estados, siempre con texto («Stock bajo», «Crítico», «Urgente»). Nada de barras de 8 colores.
- Números tabulares, alineados a la derecha en tablas; etiquetas de valor directas sobre las columnas; leyenda solo donde hay dos series.
- Botones y campos **dibujados** (`<span>`), sin ligas ni botones reales: la pantalla es una imagen (`role="img"`).
- Anchos y altos de las barras como atributos de SVG (`width="62%"`, `y`, `height` con `bars.ts`), nunca `style`.

**Scripts** como los de Aprende (`07 §1`, `CLAUDE.md` reglas 13 y 17): arrancan en `astro:page-load`, limpian en `astro:before-swap` con `AbortController`, sin `innerHTML`, con las reglas de Safari de `24 §5`. Solo `PeriodToggle` lleva script; las pantallas del sistema, no. Cero React en estas páginas.

## 7. Pantallas

**Sin doble filete** (las dos líneas morada y verde de `03 §4`): el dueño lo quitó de estas páginas. El color de marca queda en el fondo lila de las pantallas, el nombre de cada módulo arriba de su título, los grupos de Módulos y los marcadores de los detalles (morado), y el botón del cierre y el plan recomendado (verde).

### 7.1 Principal (`/talleres`)

| Sección | Módulo arriba · título | Contenido | Comportamiento |
|---|---|---|---|
| Barra del producto | — | Ícono (cabeza de Q-404 sobre cuadro negro) y nombre; Módulos · Precios · Descargar; Iniciar sesión; **Probar gratis** | Fija arriba (`position: sticky; top: 0`); el header de la web se va con el scroll. Liga actual subrayada |
| Hero | **Quick Cerebro** (en grande) · «El cerebro de tu taller de impresión 3D.» | Frase «Sabe cuánto te cuesta cada gramo, qué imprime cada máquina, qué pedido se entrega mañana y cuánto ganaste este mes.»; **Probar 14 días gratis** y Ver precios; 14 días gratis · Sin tarjeta · Web, Mac y Windows; `UiHome` a todo lo ancho con `UiFloats` | La pantalla empieza sobre blanco y termina sobre el lila |
| Módulos (`#modulos`) | «13 módulos. Cero libretas.» | `ModuleIndex` | Tres columnas en escritorio; una en celular |
| Costo (`#costo`) | Costo por pieza · «Sabes cuánto ganas antes de imprimir.» | `CostFormula`, 5 detalles y `UiPiece` | — |
| Pedidos (`#pedidos`) | Pedidos · «Ningún pedido se te escapa.» | 5 detalles y `UiOrder` | `rev soft` |
| Producción (`#produccion`) | Producción e impresoras · «Tus impresoras no descansan. Tú sí.» | 4 detalles y `UiPrinters` | — |
| Filamento (`#filamento`) | Filamento, insumos y compras · «Ningún rollo vacío a mitad de un pedido.» | 4 detalles arriba; `UiFilaments` y `UiPurchases` lado a lado | `wide soft` |
| Existencias (`#existencias`) | Existencias · «Lo que ya imprimiste también es dinero.» | 4 detalles y `UiStock` | `rev` |
| Documentos (`#documentos`) | Cotizaciones y notas de venta · «Cotiza como empresa grande.» | 3 detalles y `UiQuote` (hoja de máximo 560 px) | `soft` |
| Reportes (`#reportes`) | Reportes · «Ganancia real, no la de la libreta.» | 4 detalles arriba y `UiReports` a todo lo ancho | `wide dark` |
| Alertas (`#alertas`) | Alertas · «Te avisa antes de que sea problema.» | `AlertsTable` con las 7 alertas de Inicio | En celular, filas apiladas con la acción a la derecha |
| Equipo (`#equipo`) | Equipo · «Tu equipo trabaja. Tus números quedan contigo.» | `RolesTable` | Fondo lila |
| Datos (`#datos`) | Datos · «Respaldado todos los días.» | `DataFacts` | Tres columnas con línea arriba |
| Precios | «Paga por taller, no por impresora.» | `PlanBand`, nota y «Comparar planes» | Fondo gris; mensual |
| Preguntas | «Preguntas» | `Faqs` con 7 preguntas; título a la izquierda en escritorio | `<details>` |
| Cierre | «Tu taller merece un cerebro.» | 14 días del plan Negocio, gratis y sin tarjeta · Crear cuenta · Descargar app | Banda oscura |

### 7.2 Precios (`/talleres/precios`)

Encabezado con `h1` «Precios», «Paga por taller, no por impresora. El plan Gratis no vence.» y `PeriodToggle` → `PlanBand` → Prueba y Precio de fundador (dos bloques de texto con línea arriba) → Comparación (`CompareTable`) → Pago (`Faqs`, 5 preguntas) → Cierre.

Mensual o anual cambia los precios de la banda. Sin JavaScript: mensual con su línea anual debajo.

### 7.3 Descargar (`/talleres/descargar`)

Encabezado con `h1` «Descargar», frase y el botón principal **según el equipo** (`detectPlatform` con el `User-Agent`, en el servidor; respuesta con `Vary: User-Agent`): Mac → «Descargar para Mac», Windows → «Descargar para Windows», celular u otro → «Abrir en el navegador»; debajo, `UiHome` sobre lila. Después `PlatformList` (la fila del equipo marcada «Tu equipo»), Instalación en Mac y en Windows y Cierre. Sin JavaScript.

Mientras `downloads.*.url` esté vacío (antes de encender), los botones de descarga apuntan a `/talleres/descargar#mac` / `#windows`; encender sin archivos no se puede (§13).

## 8. Dispositivos y navegadores

Valen `24 §1, §2, §4, §5`. Lo propio:

| Componente | Celular (≤ 760) | Tableta (761–1099) | Escritorio (≥ 1100) |
|---|---|---|---|
| Header de la web | Se va con el scroll. ≤ 480: «Talleres» en lugar de «Para talleres» (el nombre completo queda para lectores de pantalla) | Se va con el scroll | Se va con el scroll |
| Barra del producto | 54 px; nombre, flecha que abre las ligas y Probar gratis | 60 px; todo en una fila | Igual |
| Nombre en grande | 13.4 vw (mínimo 56 px), en una línea | Igual | Hasta 200 px |
| Hero | Columna | Columna | Subtítulo a la izquierda; frase, botones y datos a la derecha |
| `UiHome` | Versión de celular: barra de arriba con menú, cifras en 2 × 2, 3 alertas sin botón, en impresión; sin barra lateral ni próximas entregas | Sin barra lateral | Con barra lateral |
| Pantallas en tarjeta | Una columna dentro; tablas sin las columnas secundarias en ≤ 480 (`hide-xs`: costo/g, estado de existencias, ventas y comisión por canal) | Completas | Completas |
| Secciones de módulos | Texto y pantalla en columna | Igual | Texto 5/12 y pantalla 7/12 (`rev` invierte) |
| Planes | Uno debajo de otro | Igual hasta 899; desde 900, tres columnas | Tres columnas |
| Comparación | Tres columnas angostas | Completa | Completa |
| Plataformas | Una por bloque | Igual hasta 899 | Fila con nombre, qué es y botón |

**Safari 14:** sin `aspect-ratio`, sin `inset`, sin `gap` en flex (márgenes; `gap` solo en grid, con `grid-gap` antes), el menú de la barra con `<details>`, `-webkit-backdrop-filter`, `position: -webkit-sticky`. Lo que no esté en `24 §5` se revisa con la lista de la fase 9.

## 9. Seguridad

- **Cerrojo** de §2 (middleware + página + sin prerender + sin ligas).
- **CSP sin cambios:** la dirección del sistema y las descargas son ligas (navegación), no recursos que cargue la página.
- **Sin atributos `style` nuevos** (la regla que ya sigue Aprende, `decisiones.md`: los `style=""` de las maquetas pasan a clases). Los anchos y altos de las barras van como atributos de SVG; el color de cada filamento, como `fill` del círculo. Nada de manejadores en el HTML (`onclick`, `onsubmit`): el script escucha el evento.
- **Nada de `set:html` ni `innerHTML`** (regla 11).
- El `User-Agent` solo elige el botón; no se guarda ni se registra.
- No hay formularios.

## 10. SEO y compartir (al encender)

- Títulos y descripciones en `es.system.seo`: «{nombre} · Sistema para talleres de impresión 3D», «Precios · {nombre}», «Descargar · {nombre}». Canónica de cada página.
- JSON-LD `SoftwareApplication` (nombre, `applicationCategory: BusinessApplication`, `operatingSystem: 'Web, macOS, Windows'`, `offers` con los 3 planes en MXN) en `/talleres`.
- Las 3 rutas en el sitemap (solo con `systemVisible`).
- Imagen al compartir propia (`/brand/og-talleres.jpg`, pendiente del dueño); mientras falte, la de la web.

## 11. Rendimiento

| Página | JS al abrir | Notas |
|---|---|---|
| `/talleres` | ≤ 6 KB | Mensual o anual de la banda de precios; las pantallas no llevan script; sin React |
| `/talleres/precios` | ≤ 6 KB | Mensual o anual |
| `/talleres/descargar` | ≤ 4 KB | Sin scripts propios (el servidor elige el botón) |

Las pantallas son HTML y SVG: sin imágenes que esperar. `system-ui.css` comprimido ≤ 8 KB. Lighthouse con las metas de `15 §1` al encender (las URLs entran a `lighthouserc.json` en ese momento).

## 12. Pruebas

| Tipo | Qué |
|---|---|
| Unitarias | Los casos de §5; `siteNav(true/false)`; invariantes de los datos: anual = 10 × mensual, un solo plan recomendado, cada fila de la comparación usa un límite que existe; **datos de ejemplo** (`system-demo.ts`): las semanas suman las ventas, la ganancia por canal suma la ganancia bruta, de cada $100 suma 100.00, el desglose de la pieza da su costo con la fórmula de `21 §6.4`, existencias = apartadas + disponibles, las compras suman su total |
| Guardia de encendido | Si `site.system.enabled` es `true`: `appUrl` y `downloads.*.url` son `https://` y no están vacíos, `name` no está vacío. Si no, la prueba falla y no se puede fusionar |
| Seguridad (build de producción, `pnpm preview`) | `tests/security/system-hidden.spec.ts`: `/talleres`, `/talleres/`, `/talleres/precios`, `/talleres/descargar`, `/talleres/x`, `/%74alleres`, `/talleres%2Fprecios` → 404 con la página 404 de la web; el HTML de `/`, `/catalogo`, `/aprende` y `/aprende/negocio/costo` no contiene `/talleres`; ni el sitemap ni `robots.txt` |
| `pnpm security` | Ningún `.html` con `talleres` en `dist/`; ningún archivo de `src/pages/talleres/` exporta `prerender = true`; cada uno contiene el cerrojo de §2; ningún `style=` en `src/components/system/` |
| Flujos (Playwright con `pnpm dev`, en Chromium y WebKit: `e2e/dev-talleres.spec.ts` M, `dev-talleres-precios.spec.ts` N, `dev-talleres-descargar.spec.ts` P y `dev-talleres-ligas.spec.ts` para el menú, el footer, el llamado de Aprende y el sitemap; WebKit con los proyectos `webkit-w390` y `webkit-w1440` de `playwright.admin.config.ts`, que se activan solo si WebKit está instalado) | **M** principal: el nombre en grande en una línea en 360; `#modulos` lleva a Módulos debajo de la barra; cada pantalla del sistema tiene `role="img"` y nombre accesible; en 390 `UiHome` sin barra lateral · **N** precios: Anual → Taller $1,490 y «Equivale a $124 al mes»; Mensual regresa a $149 · **P** descargar con `User-Agent` de Mac, de Windows y de iPhone → su botón y su fila marcada |
| Visual | Las 3 páginas contra las maquetas en 360, 390, 820 y 1440; sin scroll horizontal |
| Accesibilidad | axe sin errores serios en las 3 páginas (con `pnpm dev`, `e2e/dev-talleres-a11y.spec.ts`, en 390, 820 y 1440) |
| Regresión de Aprende | Las pruebas de Aprende siguen pasando sin cambios después de mover preguntas y tokens |

Las pruebas de cabeceras y CSP (`headers.spec.ts`) y Lighthouse solo corren sobre el build de producción: las 3 rutas se agregan a `e2e/urls.ts` y a `lighthouserc.json` **al encender** (§13), no antes (darían 404).

## 13. Encender (cuando el sistema salga)

Lo hace Claude Code con el prompt «Para talleres · Encender» (`prompts.md`), en una rama, con estos datos del dueño:

1. **Nombre final** del sistema (`site.system.name`).
2. **Precios y límites** confirmados con la beta (`site.system.plans`), iguales a los del sistema.
3. **Dirección del sistema** y rutas de registro e inicio de sesión (`appUrl`, `signUpPath`, `signInPath`).
4. **Archivos de descarga** (Mac y Windows) y sus requisitos (`downloads`).
5. **Revisión de lo que dice la página contra el sistema:** roles y lo que ve cada uno, copias automáticas (últimas 7), exportación a Excel, alertas y sus umbrales, solo lectura si un cargo no se completa. Lo que no exista se quita del texto (`es.system`), de la comparación y de las pantallas. Si el diseño del sistema ya existe, las pantallas de §6.3 se ajustan a él.
6. **Factura de la suscripción:** si se da, se agrega la pregunta «¿Emiten factura de la suscripción?» a Pago.
7. **Imagen al compartir** (`/brand/og-talleres.jpg`).
8. `site.system.enabled = true`; las 3 rutas a `e2e/urls.ts` y `lighthouserc.json`; todas las pruebas, `pnpm security`, `pnpm size`, Lighthouse.
9. Desplegar, revisar en vivo (las 3 páginas, el menú, el footer, el llamado de Aprende, el sitemap) y mandar el sitemap otra vez en Search Console.

## 14. Diferencias con las maquetas

| Maqueta | Web |
|---|---|
| «Quick Cerebro» escrito en el HTML | `site.system.name` |
| Ligas a `#probar`, `#entrar`, `#mac` | `appUrl + …` y `downloads.*.url` |
| El botón de Descargar lo elige el navegador | Lo elige el servidor con el `User-Agent` (§7.3) |
| `window.PLANES` en un `<script>` del HTML | El script importa `site.system.plans` (se empaqueta) |
| Íconos dibujados en `ui.py` | `@lucide/astro` (§6.1) |
| Pantallas armadas por `talleres/ui.py` (generador de las maquetas) | Componentes de `src/components/system/ui/` con `system-demo.ts` |
| Base compartida en `reference/mockups/_base.css` y `_base.js` | `global.css`, los componentes compartidos y sus estilos |
| `_ui.css` | `src/styles/system-ui.css` |

## 15. Después

- Precios leídos del sistema (un endpoint público) en lugar de `site.ts`, para que nunca se desalineen.
- Contar toques a «Probar gratis» y a las descargas (como los de WhatsApp, `18`).
- Testimonios de talleres de la beta (con su permiso).
- Página de novedades del sistema.
