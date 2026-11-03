# 06 · Stack y librerías

**Regla (W7): se usan librerías para todo lo que ya está resuelto.** No se programa a mano un carrusel, un recortador de fotos, una física de pelotas, un arrastrar y soltar ni un compresor de imágenes. Se escribe código propio solo para lo que es del negocio (mensajes de WhatsApp, reglas de publicación, armado de páginas).

**Versiones:** la estable más reciente al empezar la fase 1. Se anotan en `docs/decisiones.md`. No se cambia una herramienta de esta lista sin registrar la decisión; una librería nueva que no esté aquí también se registra (qué resuelve y por qué esa).

## 1. Base

| Necesidad | Elección | Por qué |
|---|---|---|
| Lenguaje | **TypeScript** estricto | Errores al compilar, tipos de la base hasta la pantalla |
| Framework | **Astro** | Manda HTML listo y solo carga JavaScript donde hay interacción (islas). Rápido en celular, cada página indexable. Explicación en `07 §1` |
| Componentes interactivos | **React** (`@astrojs/react`) | Los componentes de 21st.dev son de React; el panel es una app React |
| Alojamiento | **Cloudflare Workers** (`@astrojs/cloudflare`) | Gratis con uso comercial, el dominio ya está en Cloudflare, base y fotos en el mismo lugar |
| Base de datos | **Cloudflare D1** (SQLite) | Pocos datos (productos, fotos, portada); gratis; sin servidor que mantener |
| ORM y migraciones | **Drizzle ORM** + **drizzle-kit** | Esquema en TypeScript, migraciones SQL revisables; mismo ORM del sistema |
| Validación | **Zod** | Un esquema valida formularios del panel y entradas del servidor |
| Operaciones del panel | **Astro Actions** | Funciones de servidor tipadas con validación Zod integrada; sin escribir una API aparte |
| Fotos | **Cloudflare R2** | Almacenamiento de objetos sin cobro por descargas |
| Entrar al panel | **Cloudflare Access** + verificación del token con **jose** | Login por código al correo sin programar cuentas; el servidor revisa el token igual (`13`) |
| Gestor de paquetes | **pnpm** | Rápido y estricto con dependencias |
| Herramienta de Cloudflare | **wrangler** | Desarrollo local con D1 y R2 simulados, migraciones, despliegue |

## 2. Interfaz

| Necesidad | Librería |
|---|---|
| Estilos | **Tailwind CSS** (con `@tailwindcss/vite`) y los tokens de `03` |
| Componentes base (diálogo, menú, pestañas, interruptor, select) | **shadcn/ui** (Radix debajo) — el código queda en el repositorio y se adapta |
| Tipografía | **Geist** (`geist` o `@fontsource-variable/geist`), servida desde el sitio |
| Íconos | **lucide-react** (y `@lucide/astro` o SVG del paquete en páginas sin React) |
| Animaciones de React (componentes de 21st.dev) | **motion** (antes framer-motion) |
| Animaciones de scroll fuera de React (imprimiendo, aparecer al hacer scroll) | **motion** (`scroll()`, `inView()`) |
| Carruseles: portada que se turna y galería de producto | **Embla Carousel** (`embla-carousel`, `embla-carousel-react`, plugins `fade` y `autoplay`) |
| 3D del personalizador | **three** + **@react-three/fiber** + **@react-three/drei** (`Text3D`, `Center`, `OrbitControls`) |
| Física de la alberca | **matter-js** (se carga solo al tocar el botón) |
| Clases condicionales | **clsx** + **tailwind-merge** (vienen con shadcn) |
| Estado compartido entre islas (si hace falta) | **nanostores** + `@nanostores/react` |

## 3. Panel

| Necesidad | Librería |
|---|---|
| Subir fotos (arrastrar o elegir) | **react-dropzone** |
| Mover y hacer zoom para centrar la foto | **react-easy-crop** |
| Bajar el peso y redimensionar en el navegador | **browser-image-compression** (y `canvas` para cortar las versiones) |
| Fotos HEIC del iPhone | **heic2any** (carga diferida, solo si la foto es HEIC) |
| Ordenar fotos y productos arrastrando | **@dnd-kit/core** + **@dnd-kit/sortable** |
| Formularios | **react-hook-form** + **@hookform/resolvers** (Zod) |
| Datos y recarga después de guardar | **@tanstack/react-query** |
| Avisos ("Guardado") | **sonner** |
| Slug a partir del nombre | **@sindresorhus/slugify** |
| Revisar que un archivo es de verdad una imagen (servidor) | **file-type** (o verificación de bytes iniciales si no corre en Workers; ver `13`) |

## 4. SEO, analítica y calidad

| Necesidad | Librería o servicio |
|---|---|
| Sitemap | Ruta propia `/sitemap.xml` (los productos salen de la base; `@astrojs/sitemap` solo ve páginas fijas) |
| Visitas | **Cloudflare Web Analytics** (sin cookies) |
| Pruebas unitarias | **Vitest** |
| Pruebas de punta a punta y capturas | **Playwright** |
| Accesibilidad en pruebas | **@axe-core/playwright** |
| Rendimiento en pruebas | **Lighthouse CI** (`@lhci/cli`) |
| Lint y formato | **ESLint** (con `eslint-plugin-astro`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`) + **Prettier** (con `prettier-plugin-astro` y `prettier-plugin-tailwindcss`) |
| Revisar dependencias | `pnpm audit` y **gitleaks** para secretos |
| Optimizar imágenes de marca y semilla (solo en Node, antes del build) | **sharp** (`scripts/build-assets.mjs`, `scripts/seed.ts`); el adaptador usa `imageService: 'passthrough'` (`15 §3`) |

## 5. Lo que NO se usa

| No | Por qué |
|---|---|
| Next.js | Manda React en todas las páginas; el catálogo casi no tiene interacción (`07 §1`) |
| Vercel | El plan gratis no permite uso comercial |
| CMS externo (Sanity, Strapi, Keystatic…) | El panel propio con el diseño del mockup ya está definido y es pequeño |
| Pasarela de pagos, carrito | No es tienda (W1) |
| jQuery, librerías de UI completas (MUI, Chakra) | Choca con Tailwind/shadcn y pesa |
| Google Fonts | La fuente se sirve desde el sitio |
| Cookies de seguimiento (Google Analytics, píxeles) | No hacen falta y obligarían a banner de cookies |
