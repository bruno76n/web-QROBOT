# Informe de la fase 3

## Resumen
`/catalogo`, `/catalogo/[categoria]`, `/producto/[slug]`, `/404`, `/500`, `/sitemap.xml` y `/robots.txt` existen, con los productos de la base, y se ven igual que los mockups en 390, 820 y 1440. Los links de WhatsApp salen con el mensaje exacto de `05 §5` (también sin JavaScript), el personalizador de nombre arma el mensaje y muestra la vista 3D solo al tocarla, y cada producto se comparte con su foto, título con precio y datos estructurados. Lighthouse en celular da 100 en las cuatro categorías.

## Pasos
| Paso | Estado | Commit | Notas |
|---|---|---|---|
| 3.1 Consultas públicas y `Picture` | Listo | `5e2faae` | un producto oculto no sale en ninguna consulta (probado); `srcset` solo con anchos reales |
| 3.2 Tarjeta y catálogo | Listo | `71e4ba2` | pestañas como links reales, 404 para categoría desconocida, estado vacío |
| 3.3 Página de producto | Listo | `1460820` | galería Embla, color, personalización, cantidad, ficha, relacionados; link base en HTML |
| 3.4 Personalizador de nombre | Listo | `087d1bc` | vista fija SVG + vista 3D (three/R3F) que carga al tocar; fuente 3D con Ñ y acentos |
| 3.5 SEO y compartir | Listo | `ef415d3` | head completo, JSON-LD, sitemap, robots, 301 sin barra final |
| 3.6 Páginas de error | Listo | `d92bcf9` | `/404` con Q-404 y `/500` con "Intentar de nuevo" |
| 3.7 Rendimiento y accesibilidad | Listo | `e8bc846` | Lighthouse CI, axe, `pnpm size` en las páginas nuevas |

## Pruebas
- **Vitest: 212 pruebas** (nuevas: consultas públicas, `photos`, `customizer`, `seo` con JSON-LD contra el esperado, fuente 3D).
- **Seguridad (`pnpm security`, 5/5):** incluye CSP sin errores de consola en las 6 páginas públicas, y que `jsonLdString` no deja cerrar la etiqueta con texto de producto. `gitleaks` sigue sin correr en este entorno.
- **Playwright público: 108 pruebas** (36 × 3 anchos), todas verdes: flujos A, C y G, producto sin colores ni personalización, sin JavaScript, sitemap, robots, 301, 404 y 500, navegación catálogo → producto → catálogo sin errores de CSP, prioridad y carga perezosa de imágenes, axe sin errores serios y layout sin desbordes.
- **Playwright del panel:** los flujos D y F ahora incluyen su mitad pública (el producto subido aparece en el catálogo y en su página; el oculto da 404 y no sale; el orden se refleja). Corrida completa: **48 pruebas (16 × 3 anchos) verdes**.
- **Rendimiento:** `pnpm size`: inicio 5.5 KB, catálogo 8.6 KB (meta 25), producto 18.3 KB (meta 70), 404 5.5 KB (meta 8). Lighthouse celular de `/`, `/catalogo` y `/producto/llaveros-con-nombre`: 100 / 100 / 100 / 100, LCP 0.8–1.4 s, CLS 0, TBT 0. La prueba de red confirma que three, R3F y la fuente 3D no se bajan hasta tocar la vista.

## Comparación con el mockup
| Página / sección | 390 | 820 | 1440 |
|---|---|---|---|
| Catálogo | igual (pestañas sin contadores; tarjetas sin "c/u") | igual | igual |
| Personalizador 3D | igual (vista 3D real en lugar de capas CSS; botones ← →) | igual | igual |
| Producto | igual (migas con el nombre al final) | igual | igual |
| 404 y error | sin mockup | sin mockup | sin mockup |

## Decisiones tomadas
`docs/decisiones.md`, entrada "Fase 3". La más importante: **la página de producto y el personalizador se hicieron sin React** (Astro + `<script>` + `embla-carousel`) porque `react-dom` solo pesa 64 KB comprimido y el presupuesto de `15 §2` es de 70 KB para toda la página (la versión con islas React daba 98 KB); se actualizaron `11 §3` y `15 §2`. También: excepción acotada a `set:html` para JSON-LD con escape, `trailingSlash: 'ignore'` con 301 propio, imagen de fotos en la CSP, y `pnpm size` más estricto (cuenta islas e imports).

## Pendientes del dueño
Los de antes (WhatsApp, redes, dominio, fecha de Navidad, video). Con el **dominio real**: cambiarlo en `src/config/site.ts` (la CSP y los links lo toman de ahí) y crear el dominio de fotos `img.<dominio>` con su regla de `nosniff` (`17 §1`).

## Bloqueado o dudoso
1. Cloudflare (Access, despliegue, dominio de fotos) y el CI de GitHub siguen bloqueados como en las fases 1 y 2.
2. En el build de producción las fotos apuntan a `img.quickrobot.example`, que no existe: por eso las pruebas públicas y Lighthouse las contestan ellas mismas. Con el dominio real no hace falta.
3. El Q-404 de la página de producto y las fotos de ejemplo se ven chicas (son ≤ 530 px), como se esperaba (`09 §4`).

## Cómo probarlo
```bash
pnpm dev                       # http://localhost:4321/catalogo y /producto/llaveros-con-nombre
pnpm test && pnpm security
pnpm build && pnpm size && pnpm e2e:public
pnpm e2e:admin                 # incluye la mitad pública de los flujos D y F
pnpm lhci                      # Lighthouse en celular (necesita Chrome: CHROME_PATH)
```
