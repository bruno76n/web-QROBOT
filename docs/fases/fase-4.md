# Fase 4 · Inicio

**Objetivo:** el inicio completo, sección por sección, igual al mockup, usando la portada del panel y los productos de la base.

**Al terminar existe:** `/` con hero, Navidad, ¿Qué se te antoja?, Video, Imprimiendo, Q-404, Alberca y Pedido; el header cambia al pasar el hero; los flujos B y E pasan.

**Antes de empezar, leer:** `CLAUDE.md` · `docs/informe-fase-3.md` · este archivo. Tener abierto `reference/mockups/index.html` en cada paso.

---

## Pasos

Para **cada** sección: primero su lógica pura (si tiene) con prueba, después la sección, después la comparación con el mockup en 390, 820 y 1440 y su fila en `progreso.md`.

### 4.1 Hero
- **Hacer:** `Hero.astro` con `getHero()`; una portada en `<picture>`; varias con la isla `HeroSlides.tsx` (Embla (desliza) + autoplay con el intervalo del panel; sin autoplay con movimiento reducido); foto por defecto si no hay portadas; nombre gigante en una línea con la cabeza al final; el header en modo `over-hero`.
- **Consultar:** `04 §2.1`, `03 §5`, `11 §3`, `15 §3` (precarga), `10 §2` (`getHero`).
- **Listo cuando:** flujo E pasa (con el panel de la fase 2).

### 4.2 Navidad
- **Hacer:** `Navidad.astro` + `<script>` con `season.ts`; tarjetas con `listChristmasPicks()`; oculta fuera de temporada; robot quieto con movimiento reducido.
- **Consultar:** `04 §2.2`, `05 §2` (Navidad), `10 §6` (fechas), `10 §8` (hora y modo de prueba), `16 §4` (casos de temporada).
- **Prueba:** con la fecha simulada en septiembre la sección no está; en diciembre sí, con el contador correcto. La fecha se simula en los dos lados: cabecera `x-test-now` para el servidor (`10 §8`) y `page.clock` de Playwright para el navegador.

### 4.3 ¿Qué se te antoja?
- **Hacer:** `src/config/ideas.ts`; `Ideas.astro` que envuelve el componente externo. **Seguir `11 §4` al pie de la letra:** si `src/components/external/` ya tiene el componente, usarlo y aplicar su cambio obligatorio (en táctil, la foto de la fila a la mitad de la pantalla al hacer scroll); si no, crear el reemplazo sencillo, anotarlo en `progreso.md` y **seguir**.
- **Consultar:** `04 §2.3`, `05 §3`, `11 §4`.
- **Listo cuando:** tocar una idea lleva a `#pedido=<id>` (el pedido se conecta en 4.8).

### 4.4 Video
- **Hacer:** `Video.astro` con portada (hoy un cuadro del video, `public/media/`), botón y datos; reproduce `site.video.src` si no es `null`, si no queda deshabilitado.
- **Consultar:** `04 §2.4`, `05 §2` (Video), `10 §6` (`site.video`), `15 §3` (video).

### 4.5 Imprimiendo
- **Hacer:** `Imprimiendo.astro` + `<script>` con `scroll()` de `motion`; render `assets/q404/q404-impresion.webp`; contador de capas; final con liga.
- **Consultar:** `04 §2.5`, `05 §2` (Imprimiendo).

### 4.6 Q-404
- **Hacer:** `src/config/q404.ts` (6 combinaciones con su render); `Q404.astro` + `<script>`; precio desde con `getProductPrice('q-404')`.
- **Consultar:** `04 §2.6`, `05 §2` (Q-404), `05 §5` (mensaje), `03 §5`.

### 4.7 Alberca
- **Hacer:** `Alberca.astro` + `<script>` que importa `matter-js` al tocar; canvas sin clics; Vaciar, Escape y vaciado automático; texto para lectores de pantalla; versión reducida.
- **Consultar:** `04 §2.7`, `05 §2` (Alberca), `11 §3`, `11 §7`.
- **Prueba:** `matter-js` no está en el JS inicial del inicio; al tocar, aparece el canvas y al pulsar Escape desaparece.

### 4.8 Pedido
- **Hacer:** `Pedido.astro` + `OrderComposer.tsx`: campos, plurales, mensaje, `hashchange` para ideas y Navidad ("Apartar un regalo"), huecos que crecen.
- **Consultar:** `04 §2.8`, `05 §2` (Pedido), `05 §3`, `05 §5`, `11 §3` (Pedido: `hashchange`, `#pedido=navidad`, huecos que crecen).
- **Listo cuando:** flujo B pasa.

### 4.9 Inicio completo
- **Hacer:** revisar el inicio entero en los tres anchos contra el mockup (orden, espacios entre secciones, transiciones), Lighthouse y axe del inicio.
- **Consultar:** `03`, `15 §1–2`.

---

## No hacer en esta fase
- Contador de toques (fase 5).
- Integración final de componentes externos que lleguen después de 4.3 (fase 5, último paso).

## Cierre
- Flujos B y E pasan, más todos los anteriores.
- Lighthouse del inicio ≥ metas; `pnpm size` en verde.
- `progreso.md` con cada sección; `docs/informe-fase-4.md`.
