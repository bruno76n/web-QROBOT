# content/aprende

Contenido de Aprende para cargar a D1 con `pnpm learn:import` (`docs/21 §8`). Se generó el 2026-11-13 a partir de `docs/23-aprende-contenido.md`. Después de la primera carga, lo que se edite en el panel manda (el importador no sobrescribe páginas editadas en el panel salvo con `--overwrite`).

```
content/aprende/
├─ paginas/
│  ├─ index.md                  portada (slug '')
│  ├─ filamentos.md             página del tema
│  ├─ filamentos/pla.md         una página por archivo; la ruta es el slug
│  ├─ …
│  └─ glosario.md               glosario (términos en el frontmatter)
├─ datos/
│  ├─ filamentos.json           tabla de filamentos, chips, interruptores y niveles de calor
│  ├─ impresoras.json           volumen de impresión de 30 impresoras
│  ├─ mantenimiento.json        calendario
│  └─ datos-curiosos.json       banco para la portada
├─ buscador.json                sinónimos y palabras vacías (Meilisearch y búsqueda en D1)
└─ fuentes.json                 id, nombre y liga de cada fuente
```

## Página

```markdown
---
slug: filamentos/pla          # ruta después de /aprende/; '' = portada
kind: sheet                   # home · section · sheet · article · problem · glossary
topic: filamentos             # id de src/config/learn.ts ('' en la portada)
title: PLA
subtitle: El filamento más usado. Fácil de imprimir, rígido y con muchos colores.
summary: Para figuras, decoración y piezas de interior…   # «En corto»; sale en el buscador
filters: []                   # ids de los chips del tema al que pertenece
tags: [pla, pla mate, …]      # palabras con las que alguien lo buscaría
related: [filamentos/petg, …] # slugs; deben existir
sources: [bambu-tabla, …]     # ids de fuentes.json
audience: all                 # all · shops · clients
published: true
order: 1                      # orden dentro del tema
reviewed: 2026-11
cta: whatsapp                 # whatsapp · system · none
ctaText: …                    # opcional
chips: [{ id, label }]        # solo páginas de tema
faqs:                         # opcional
  - q: ¿El PLA es biodegradable?
    a: Solo en composta industrial…
---

## Datos

| Dato | Valor |
…

> **Dato curioso.** El PLA se hace con almidón…
```

### Marcas en el cuerpo

Cada una en su propio párrafo:

| Marca | Pinta |
|---|---|
| `[[tabla:filamentos]]` | Tabla de filamentos con filtros |
| `[[tabla:impresoras]]` | Tabla de impresoras |
| `[[tabla:mantenimiento]]` | Calendario de mantenimiento |
| `[[cabe-mi-pieza]]` | Herramienta ¿Cabe mi pieza? |
| `[[calculadora-costo]]` | Calculadora de costo |

Cuadros: `> **Dato curioso.** …`, `> **Truco.** …`, `> **Cuidado.** …`. Ligas internas: `[texto](/aprende/tema/pagina)`.

## Agregar una página

1. Copia un archivo parecido en `paginas/<tema>/<slug>.md` y cambia el frontmatter y el cuerpo.
2. `pnpm learn:import` (local) y revisa en `pnpm dev`.
3. En producción: `pnpm learn:import --remote --yes --sync`.

## Ajustes respecto a `docs/23`

- Cuerpos de las páginas de tema escritos aparte (sin los bloques «Pantalla, de arriba a abajo»).
- `maquinas/volumen-de-impresion` usa las marcas `[[cabe-mi-pieza]]` y `[[tabla:impresoras]]` en lugar de la tabla escrita.
- `encargar/por-que-cuesta` lleva los textos corregidos («El precio incluye…», «Trabajo», «Pasos»).
- `negocio/costo` lleva `[[calculadora-costo]]` antes del ejemplo.
- Sin nombre del sistema en textos públicos, salvo en `ctaText` con `cta: system` (oculto hasta que salga).

## Pendientes del dueño (no se importan)

| Página | Falta | Estado |
|---|---|---|
| `encargar/pago` | Porcentaje de anticipo, formas de pago, si se factura | `published: false` |
| `encargar/personajes` | Política para personajes y marcas con licencia | `published: false` |
| `encargar/tiempos` | Si se aceptan urgentes y con qué cargo | Línea quitada |
| `encargar` | Envíos: zonas, paquetería, quién paga | Pregunta quitada |
| `encargar/colores` | Catálogo de colores ligado al inventario | Línea quitada |
