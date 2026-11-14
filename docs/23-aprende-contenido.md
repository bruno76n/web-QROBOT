# 23 · Aprende · Contenido

Contenido completo de Aprende (`21`): reglas de redacción, mapa, qué lleva cada pantalla, el texto de cada página, datos curiosos, sinónimos del buscador y fuentes. Investigación de noviembre de 2026.

---

## 0. Cómo se usa este documento

- **Es la referencia**, no lo que se importa. La carga a D1 sale de `content/aprende/` (un archivo por página, generado de este documento el 2026-11-13; formato en `content/aprende/README.md`). Para cambiar el texto de una página: su archivo en `content/aprende/paginas/` y `pnpm learn:import`, o el panel (fase 8). Este documento no se vuelve a importar.
- Los bloques **«Pantalla, de arriba a abajo»** de cada tema son especificación de pantalla y ya están en `21 §4`; no forman parte del contenido.
- Los textos entre corchetes (`[Definir…]`, `[Decidir…]`) son pendientes del dueño (§18): no se importan.
- Los llamados a Quick Cerebro (`cta: system`) se importan pero no se muestran hasta que salga el sistema (`21 §4.6`).
- Las tablas en bloques `yaml` con `tabla:` están como JSON en `content/aprende/datos/` (con claves en inglés).
- Las correcciones de secado de la versión anterior ya están en las maquetas (`reference/mockups/aprende/`).

### Campos: de este documento a los archivos

| Aquí | En `content/aprende/paginas/*.md` |
|---|---|
| `slug` | `slug` (la portada es `''`) |
| `tipo`: portada · seccion · ficha · articulo · problema · glosario | `kind`: home · section · sheet · article · problem · glossary |
| `tema` | `topic` |
| `titulo` · `subtitulo` · `en_corto` | `title` · `subtitle` · `summary` |
| `filtros` · `etiquetas` · `relacionadas` · `fuentes` | `filters` · `tags` · `related` · `sources` |
| `publico`: todos · talleres · clientes | `audience`: all · shops · clients |
| `revisado` | `reviewed` |
| Sección «Preguntas» | `faqs` (`q`, `a`) |
| «Llamado: …» | `cta` y `ctaText` |
| — | `published`, `order`, `chips` (temas), `featured` y `suggestions` (portada), `terms` (glosario) |

---

## 1. Reglas de redacción

Aplican a títulos, subtítulos, botones, tablas, artículos y respuestas del buscador.

### 1.1 Palabras neutras

- Español neutro con tuteo. Sin modismos ni palabras de una sola región.
- «Computadora», no «compu». «Electricidad» o «consumo eléctrico», no «luz» (pero «luz» va en los sinónimos del buscador).
- Términos técnicos en español cuando existen y se entienden: «boquilla» (nozzle), «cama» (bed), «borde» (brim), «relleno» (infill), «laminador» (slicer). La primera vez que aparece, el término en inglés va entre paréntesis, porque así viene en las impresoras y los programas.
- Siglas de materiales tal cual: PLA, PETG, ABS, ASA, TPU, PC, PA.
- Números con unidad y espacio: 57 °C, 0.4 mm, 8 h, 256 mm. Rangos con guion corto: 190–240 °C. Punto decimal (0.2 mm).

### 1.2 Títulos

- Sustantivo directo: «Costo», «Temas», «Secado», «Usos», «Temperaturas», «Fuentes», «Preguntas».
- O la pregunta como la escribe la gente: «¿Por qué se despega la primera capa?».
- Nunca frases de relleno:

| No | Sí |
|---|---|
| Lo que cuesta | Costo |
| Por tema | Temas |
| Para qué sirve | Usos |
| Lo que necesitas saber | (quitar; ir al dato) |
| Todo sobre el PLA | PLA |
| Cómo elegir el filamento perfecto | ¿Qué filamento uso? |
| Descubre… / Explora… | (quitar) |
| La clave está en… | (decir la causa) |
| No solo X, sino también Y | X y Y |
| Sin complicaciones / De forma sencilla | (quitar) |
| Te lo explicamos | (quitar) |
| En el mundo de la impresión 3D | En impresión 3D (o quitar) |
| ¡Listo! / ¡Genial! | (sin exclamaciones en el contenido) |

### 1.3 Frases

- Una idea por frase. Verbo al principio cuando es instrucción: «Seca el filamento», «Baja la temperatura 5 °C».
- Dar el número cuando existe: «la cama a 60 °C», no «la cama caliente».
- Sin adjetivos de venta: «increíble», «perfecto», «ideal», «potente», «revolucionario».
- Sin guion largo (—) en el texto corrido.
- Las causas se escriben de la más común a la menos común.
- Si un dato depende de la marca, se dice: «según Bambu Lab», «revisa la etiqueta del rollo».

---

## 2. Mapa del portal

```
/aprende                         Portada (buscador)
├── /filamentos                  Filamentos
│   ├── tabla                    Tabla de materiales con filtros
│   ├── pla · pla-especiales · pla-cf · petg · petg-cf · abs · asa
│   ├── tpu · pc · nylon · pet-cf · soportes
│   └── secado · guardado · resistencia-al-calor · exterior · boquilla-endurecida
│       rendimiento-del-rollo · diametro · recocido · alimentos · olor-y-humo
├── /maquinas                    Máquinas
│   ├── tipos · cinematica · abierta-o-cerrada · partes · volumen-de-impresion
│   ├── boquillas · placas · multicolor · consumo-electrico
│   └── elegir-impresora · donde-ponerla
├── /laminado                    Laminado
│   ├── archivos · altura-de-capa · paredes · relleno
│   ├── soportes · borde · orientacion · velocidad · enfriamiento
│   └── retraccion · costura · planchado · resistencia
├── /problemas                   Cuando algo sale mal
│   ├── primera-capa · esquinas-levantadas · hilos · boquilla-tapada
│   ├── capas-desplazadas · falta-material · capas-separadas
│   ├── pieza-se-cae · espagueti · filamento-humedo · pie-de-elefante
│   └── soportes-pegados · filamento-roto · marcas-en-paredes
├── /mantenimiento               Mantenimiento
│   ├── calendario · cama · boquilla · limpieza-en-frio
│   ├── lubricacion · bandas · ventiladores · cortador · filtro
│   └── firmware · bitacora
├── /modelos                     Modelos y diseño
│   ├── donde-encontrar · licencias · personajes-y-marcas
│   ├── reglas-de-diseno · holguras · programas · insertos
│   └── dividir-piezas · escaneo
├── /acabado                     Acabado
│   ├── quitar-soportes · lijado · pintura · pegado
│   └── vapor-de-acetona · brillo · recocido (liga a filamentos)
├── /seguridad                   Seguridad
│   ├── emisiones · quemaduras · incendio · ninos-y-mascotas
│   └── piezas-de-carga · alimentos (liga a filamentos)
├── /encargar                    Si vas a encargar una pieza
│   ├── cotizar · por-que-cuesta · tiempos · material · tamano
│   └── precision · colores · personajes · pago
├── /negocio                     Negocio (para talleres)
│   ├── costo · precio · fallos · electricidad · inventario
│   └── modelos-con-licencia
└── /glosario                    Glosario A–Z
```

Orden de los temas en la portada y en el filtro del buscador:

1. Filamentos
2. Cuando algo sale mal
3. Máquinas
4. Laminado
5. Mantenimiento
6. Modelos y diseño
7. Acabado
8. Seguridad
9. Si vas a encargar una pieza
10. Negocio
11. Glosario

«Cuando algo sale mal» va segundo porque es lo que más se busca con prisa.

---

## 3. Portada

```yaml
slug: index
tipo: portada
tema: todos
titulo: Aprende
subtitulo: Respuestas sobre impresión 3D, del taller de Quick Robot.
en_corto: Escribe tu duda o el problema que ves en la pieza. Si no lo encuentras, mándanos foto por WhatsApp.
publico: todos
revisado: 2026-11
```

**Pantalla, de arriba a abajo**

1. **Buscador** (protagonista). Texto del campo: «Busca un material, un problema o una pregunta». Atajos: ⌘K o «/». Sugerencias bajo el campo: «se despega», «PETG», «hilos», «secar filamento», «cuánto cobrar».
2. **Temas.** Los 11 temas del mapa, en lista con el número de respuestas de cada uno. Título del bloque: «Temas».
3. **Filamentos de un vistazo.** Tabla corta: Material · Boquilla · Cama · Calor que aguanta. Filas: PLA, PETG, ABS, ASA, TPU, PC. Liga: «Tabla completa».
4. **Más buscado.** 6 preguntas (las que más se abren en el buscador; al arrancar, estas):
   - ¿Por qué se despega la primera capa?
   - ¿Por qué salen hilos entre las partes de la pieza?
   - ¿PLA o PETG?
   - ¿Qué filamento uso para piezas que van al sol?
   - ¿Cuándo hay que secar el filamento?
   - ¿Por qué una pieza cuesta más que su plástico?
5. **Dato curioso** (rota uno al azar de la lista de abajo en cada visita).
6. **Llamados.** Dos franjas: «¿Tienes taller?» → Quick Cerebro. «¿Necesitas una pieza?» → cotizar por WhatsApp.

**Datos curiosos de la portada** (rotan)

> **Dato curioso.** En un coche estacionado al sol, el tablero llegó a 69 °C en una hora (UC San Diego y Arizona State, 2018). El PLA empieza a deformarse a 57 °C.

> **Dato curioso.** Un rollo de 1 kg de PLA de 1.75 mm mide unos 335 metros.

> **Dato curioso.** La patente de la impresión por filamento fundido venció en 2009. Desde entonces aparecieron las impresoras caseras y bajaron los precios.

> **Dato curioso.** Una pieza impresa aguanta menos golpes entre capas que a lo largo de ellas. En el PLA de Bambu Lab, la diferencia es casi la mitad: 26.6 contra 13.8 kJ/m².

> **Dato curioso.** El PLA se hace con almidón de plantas como el maíz o la caña de azúcar.

> **Dato curioso.** Los bloques de LEGO son de ABS, el mismo tipo de plástico que se imprime en 3D.

**Estado vacío del buscador (sin resultados)**

- Q-404 con el texto: «404: no encontramos «{búsqueda}». Prueba con otras palabras.»
- Debajo: «Temas» (los 11) y «¿Lo preguntamos por ti?» → WhatsApp con el texto de la búsqueda ya escrito.
- Cada búsqueda sin resultados se guarda (sin datos personales) para escribir esas respuestas después.

### Preguntas

- **¿Quién escribe las respuestas?** El taller de Quick Robot. Los datos de materiales y máquinas vienen de los fabricantes; cada página dice de dónde y cuándo se revisó.
- **¿Puedo pedir que agreguen un tema?** Sí, por WhatsApp. Las preguntas que más llegan se publican primero.
- **¿Sirve para cualquier marca de impresora?** Sí. Cuando un paso cambia según la marca, la página lo dice.

---
## 4. Filamentos

### 4.1 Pantalla del tema: Filamentos

```yaml
slug: filamentos
tipo: seccion
tema: filamentos
titulo: Filamentos
subtitulo: Temperaturas, usos y cuidados. Datos de Bambu Lab, revisados en noviembre de 2026.
en_corto: 'PLA o PETG para lo que va dentro de la casa: sirven para lo mismo y el PETG, además, aguanta más golpes y calor. ASA para lo que va al sol. TPU para lo flexible. Los de fibra y los técnicos (PC, nylon) piden impresora cerrada y filamento seco.'
filtros: [decoracion, uso-diario, exterior, calor, flexible, mecanica, soportes]
etiquetas: [filamento, material, plastico, rollo, carrete, temperatura, cual usar]
relacionadas: [filamentos/secado, filamentos/resistencia-al-calor, problemas/hilos, negocio/costo]
fuentes: [bambu-tabla, bambu-guia]
publico: todos
revisado: 2026-11
```

**Pantalla, de arriba a abajo**

1. Ruta, título, subtítulo, «En corto».
2. **Filtros.** Título del bloque: «Uso». Chips de una sola elección:

| Chip | Muestra | Criterio |
|---|---|---|
| Todos | Todos | |
| Decoración | PLA, PLA especiales, PETG | Figuras, regalos, piezas que no cargan peso (el PETG sirve igual) |
| Uso diario | PLA, PETG, PLA-CF | Piezas de casa y oficina, dentro, sin calor |
| Exterior y sol | ASA, PETG | Sol, lluvia y calor de la calle. ASA es la primera opción |
| Calor | ASA, PC, PA-CF, PET-CF (y PETG, ABS en nivel medio) | Ver niveles abajo |
| Flexible | TPU | Se dobla y regresa a su forma |
| Piezas mecánicas | PETG, PETG-CF, PLA-CF, PC, PA-CF, PET-CF | Engranes, soportes, piezas que cargan o rozan |
| Soportes | PVA, BVOH, soportes de Bambu | Material que se quita o se disuelve |

3. **Interruptores** (se combinan con el chip):
   - «Mi impresora es abierta»: oculta los que piden impresora cerrada.
   - «Uso AMS»: oculta los que no entran al AMS (TPU, PET-CF).
   - «Solo boquilla de latón»: oculta los que piden boquilla endurecida.
4. **Tabla de materiales** (ver 4.2). En celular, cada fila es una tarjeta con el nombre arriba y los datos en dos columnas.
5. **Niveles de calor** (leyenda de la columna «Calor que aguanta»):

| Nivel | Temperatura de deformación | Materiales |
|---|---|---|
| Bajo | menos de 60 °C | PLA (57 °C), PLA-CF (55 °C) |
| Medio | 60–90 °C | PETG (69 °C), PETG-CF (74 °C), ABS (87 °C) |
| Alto | 90–150 °C | ASA (100 °C), PC (117 °C) |
| Muy alto | más de 150 °C | PA6-CF (184 °C), PAHT-CF (194 °C), PET-CF (205 °C) |

Nota bajo la tabla: «Temperatura de deformación bajo carga (HDT a 0.45 MPa) de las fichas de Bambu Lab. Una pieza sin peso encima aguanta un poco más; una pieza cargada, menos.»

6. **Fichas.** Lista de materiales con liga a cada ficha.
7. **Cuidados.** Ligas a: Secado · Guardado · Boquilla endurecida · Rendimiento del rollo.
8. Dato curioso (uno), Preguntas, También te puede servir, Fuentes, Llamado.

> **Dato curioso.** El ASA y el ABS se parecen mucho al imprimir, pero el ASA aguanta más calor (100 °C contra 87 °C) y está hecho para resistir el sol.

> **Truco.** Si el filamento truena o hace burbujas al salir de la boquilla, está húmedo. No le subas la temperatura: sécalo.

#### Preguntas

- **¿PLA o PETG?** Para figuras, llaveros y decoración, cualquiera de los dos: decide el precio y los colores que encuentres. El PETG sirve para todo lo que sirve el PLA, pero el PLA no sirve para todo lo del PETG: las piezas que se golpean, se doblan un poco o pueden pasar de 57 °C (un coche, una ventana con sol) van en PETG.
- **¿Qué filamento uso para piezas que van al sol?** ASA. Aguanta 100 °C y resiste los rayos UV. Pide impresora cerrada.
- **¿Cuál es el filamento más resistente?** Depende de qué tiene que resistir. A golpes: TPU, y entre los rígidos, PAHT-CF y PETG. A calor: PET-CF y PAHT-CF. A doblarse (rigidez): PA6-CF y PET-CF.
- **¿Puedo usar filamento de otra marca con estos datos?** Como punto de partida, sí. Cada marca ajusta su fórmula; la etiqueta del rollo manda.
- **¿Qué significa CF y GF?** CF: con fibra de carbono. GF: con fibra de vidrio. Las dos hacen la pieza más rígida y raspan la boquilla de latón.

---

### 4.2 Tabla de materiales

Datos para `src/data/aprende/filamentos.json`. Boquilla y cama: tabla de materiales de Bambu Lab (cama de PEI liso o texturizado). Calor, golpes, rigidez y agua: guía de filamentos de Bambu Lab (pruebas en el plano XY).

```yaml
tabla: filamentos
columnas:
  - material
  - usos
  - boquilla_c          # °C, ±10
  - cama_pei_c          # °C
  - calor_hdt_c         # HDT a 0.45 MPa
  - golpes_kj_m2        # impacto XY
  - rigidez_mpa         # módulo de flexión XY
  - agua_pct            # absorción de agua saturada
  - secado              # horno de aire
  - velocidad_max_mm_s
  - impresora           # abierta | cerrada recomendada
  - endurecida          # si | no | recomendada
  - ams                 # si | no | seco
  - filtros
filas:
  - material: PLA (Basic, Mate, Seda, Tough)
    usos: Figuras, llaveros, decoración, prototipos.
    boquilla_c: 190–240
    cama_pei_c: 45–65
    calor_hdt_c: 57
    golpes_kj_m2: 26.6
    rigidez_mpa: 2750
    agua_pct: 0.43
    secado: 55 °C · 8 h
    velocidad_max_mm_s: 300
    impresora: abierta o cerrada
    endurecida: "no"
    ams: "si"
    filtros: [decoracion, uso-diario]
  - material: PLA-CF
    usos: Piezas rígidas y ligeras, acabado mate.
    boquilla_c: 210–240
    cama_pei_c: 45–65
    calor_hdt_c: 55
    golpes_kj_m2: 23.2
    rigidez_mpa: 3950
    agua_pct: 0.42
    secado: 55 °C · 8 h
    velocidad_max_mm_s: 250
    impresora: abierta o cerrada
    endurecida: "si"
    ams: "si"
    filtros: [uso-diario, mecanica]
  - material: PETG
    usos: Lo mismo que el PLA y piezas de uso diario; aguanta más calor y golpes.
    boquilla_c: 240–270
    cama_pei_c: 60–80
    calor_hdt_c: 69
    golpes_kj_m2: 52.7
    rigidez_mpa: 1670
    agua_pct: 0.32
    secado: 70 °C · 8 h
    velocidad_max_mm_s: 200
    impresora: mejor cerrada
    endurecida: "no"
    ams: "si"
    filtros: [decoracion, uso-diario, exterior, calor, mecanica]
  - material: PETG-CF
    usos: Piezas mecánicas rígidas, soportes, carcasas.
    boquilla_c: 240–270
    cama_pei_c: 60–80
    calor_hdt_c: 74
    golpes_kj_m2: 41.2
    rigidez_mpa: 2910
    agua_pct: 0.30
    secado: 70 °C · 8 h
    velocidad_max_mm_s: 200
    impresora: cerrada recomendada
    endurecida: "si"
    ams: "si"
    filtros: [mecanica, calor]
  - material: ABS
    usos: Piezas que aguantan calor y golpes; se puede alisar con vapor de acetona.
    boquilla_c: 240–280
    cama_pei_c: 90–100
    calor_hdt_c: 87
    golpes_kj_m2: 39.3
    rigidez_mpa: 1880
    agua_pct: 0.65
    secado: 80 °C · 8 h
    velocidad_max_mm_s: 300
    impresora: cerrada recomendada
    endurecida: "no"
    ams: "si"
    filtros: [calor, mecanica]
  - material: ASA
    usos: Piezas de exterior; aguanta sol y calor.
    boquilla_c: 240–280
    cama_pei_c: 90–100
    calor_hdt_c: 100
    golpes_kj_m2: 41.0
    rigidez_mpa: 1920
    agua_pct: 0.45
    secado: 80 °C · 8 h
    velocidad_max_mm_s: 300
    impresora: cerrada recomendada
    endurecida: "no"
    ams: "si"
    filtros: [exterior, calor]
  - material: TPU 95A
    usos: Fundas, topes, llantas, empaques.
    boquilla_c: 200–250
    cama_pei_c: 35–45
    calor_hdt_c: null
    golpes_kj_m2: 125.2
    rigidez_mpa: null
    agua_pct: 1.16
    secado: 70 °C · 8 h (siempre)
    velocidad_max_mm_s: 80
    impresora: abierta o cerrada
    endurecida: "no"
    ams: "no"
    filtros: [flexible]
  - material: PC (policarbonato)
    usos: Piezas que aguantan mucho calor y golpes.
    boquilla_c: 260–290
    cama_pei_c: 100–120
    calor_hdt_c: 117
    golpes_kj_m2: 34.8
    rigidez_mpa: 2310
    agua_pct: 0.25
    secado: 80 °C · 8 h (siempre)
    velocidad_max_mm_s: 300
    impresora: cerrada recomendada
    endurecida: "no"
    ams: "si"
    filtros: [calor, mecanica]
  - material: PA6-CF / PAHT-CF (nylon con fibra)
    usos: Engranes, piezas mecánicas cerca de motores o calor.
    boquilla_c: 260–300
    cama_pei_c: 100–120
    calor_hdt_c: 194        # PAHT-CF; PA6-CF: 184
    golpes_kj_m2: 57.5      # PAHT-CF; PA6-CF: 40.3
    rigidez_mpa: 4230       # PAHT-CF; PA6-CF: 5460
    agua_pct: 0.88          # PAHT-CF; PA6-CF: 2.35
    secado: 80 °C · 8–12 h (siempre)
    velocidad_max_mm_s: 100
    impresora: cerrada recomendada
    endurecida: "si"
    ams: "si"                 # Bambu PA-CF y PAHT-CF
    filtros: [calor, mecanica]
  - material: PET-CF
    usos: Piezas muy rígidas y resistentes al calor; aguanta poco los golpes.
    boquilla_c: 260–300
    cama_pei_c: 100–120
    calor_hdt_c: 205
    golpes_kj_m2: 36.0
    rigidez_mpa: 5320
    agua_pct: 0.37
    secado: 80 °C · 8–12 h (siempre)
    velocidad_max_mm_s: 100
    impresora: cerrada recomendada
    endurecida: "si"
    ams: "no"
    filtros: [calor, mecanica]
  - material: PVA / BVOH
    usos: Soporte que se disuelve en agua.
    boquilla_c: 190–240
    cama_pei_c: 45–65
    calor_hdt_c: null
    golpes_kj_m2: null
    rigidez_mpa: null
    agua_pct: null
    secado: 55 °C · 8 h (siempre)
    velocidad_max_mm_s: null
    impresora: abierta o cerrada
    endurecida: "no"
    ams: "seco"
    filtros: [soportes]
notas:
  - Cama de PEI liso o texturizado de Bambu Lab. Con placa fría (Cool Plate) el PLA va a 35–45 °C.
  - Secado en horno de aire. En la cama de la impresora tarda unas 12 h.
  - Velocidad máxima según la guía de Bambu Lab; otras impresoras pueden necesitar menos.
  - Otras marcas pueden pedir otras temperaturas. Revisa la etiqueta del rollo.
```

Columnas visibles en pantalla (escritorio): Material · Usos · Boquilla · Cama · Calor que aguanta · Golpes · Secado · Impresora · Endurecida · AMS. Rigidez, agua y velocidad van en la ficha de cada material.

---

### 4.3 Fichas de materiales

Cada ficha lleva, en este orden: «En corto» · Datos (tabla de 2 columnas) · Usos · No se recomienda para · Cómo imprimirlo · Dato curioso · Preguntas.

---

```yaml
slug: filamentos/pla
tipo: ficha
tema: filamentos
titulo: PLA
subtitulo: El filamento más usado. Fácil de imprimir, rígido y con muchos colores.
en_corto: Para figuras, decoración y piezas de interior que no cargan peso; para eso también sirve el PETG. Se deforma desde 57 °C, así que no sirve para el coche ni para lugares calientes.
filtros: [decoracion, uso-diario]
etiquetas: [pla, acido polilactico, pla basic, pla mate, pla matte, pla silk, pla seda, pla tough, pla+]
relacionadas: [filamentos/petg, filamentos/pla-especiales, filamentos/resistencia-al-calor, filamentos/recocido]
fuentes: [bambu-tabla, bambu-guia]
publico: todos
revisado: 2026-11
```

#### Datos

| Dato | Valor |
|---|---|
| Boquilla | 190–240 °C |
| Cama | 45–65 °C (PEI) · 35–45 °C (placa fría) |
| Calor que aguanta | 57 °C |
| Golpes | 26.6 kJ/m² |
| Rigidez | 2750 MPa |
| Secado | 55 °C · 8 h |
| Impresora | Abierta o cerrada |
| Boquilla endurecida | No |
| AMS | Sí |
| Velocidad máxima | 300 mm/s |
| Recocido | 50–60 °C · 6–12 h |

#### Variantes

| Variante | Diferencia |
|---|---|
| Basic | El estándar. Brillo medio. |
| Mate (Matte) | Superficie sin brillo; las capas se notan menos. |
| Seda (Silk) | Brillo tipo satín o metálico. Para decoración. |
| Tough | Fórmula que aguanta más golpes que el PLA normal. |
| Con fibra (PLA-CF) | Más rígido; pide boquilla endurecida. Ver su ficha. |

#### Usos

Figuras, llaveros, decoración, maquetas, prototipos, organizadores, piezas de exhibición.

Todo esto también sale en PETG. Entre los dos, elige por precio y por los colores que encuentres.

#### No se recomienda para

- Piezas dentro de un coche o junto a una ventana con sol.
- Piezas que se lavan con agua caliente o en lavavajillas.
- Piezas que cargan peso todo el tiempo (se van venciendo con los meses).
- Exteriores.

#### Cómo imprimirlo

- Ventilador de capa al máximo después de las primeras capas.
- Con impresora cerrada, abre la puerta o la tapa si la cama pasa de 45 °C; si el aire de adentro se calienta, el PLA puede atascarse en el extrusor (Bambu Lab recomienda quitar el vidrio superior con cama arriba de 45 °C).
- Si la pieza se despega, lava la cama con agua y jabón antes de subir temperaturas.

> **Dato curioso.** El PLA se hace con almidón de plantas como el maíz o la caña de azúcar. Por eso huele poco al imprimir.

#### Preguntas

- **¿PLA o PETG para figuras?** Cualquiera de los dos. El PETG sirve para todo lo que sirve el PLA y aguanta más golpes y calor; el PLA no sirve para todo lo del PETG. Si el PETG te sale igual o más barato, úsalo para todo.
- **¿El PLA es biodegradable?** Solo en composta industrial, con calor y humedad controlados. En la tierra o en la basura de la casa tarda años.
- **¿PLA o PLA+?** «PLA+» no es una norma: cada marca le pone ese nombre a su fórmula. Casi siempre aguanta un poco más los golpes. Revisa la ficha de esa marca.
- **¿Por qué mi PLA se rompe en el tubo antes de llegar a la impresora?** Está húmedo o viejo. Sécalo; si sigue quebradizo, úsalo para pruebas.
- **¿El PLA mate es más débil?** Las fórmulas mate llevan cargas para quitar el brillo y pueden ser un poco más frágiles. Para piezas que cargan, usa Basic, Tough o PETG.

---

```yaml
slug: filamentos/pla-especiales
tipo: ficha
tema: filamentos
titulo: PLA con efectos
subtitulo: Madera, mármol, metal y brillo en la oscuridad.
en_corto: Se imprimen como PLA, pero llevan partículas que pueden tapar boquillas chicas o desgastar las de latón. Usa boquilla de 0.4 mm o más.
filtros: [decoracion]
etiquetas: [pla madera, wood, pla marmol, marble, glow, brilla en la oscuridad, fosforescente, pla metal, galaxy, brillos]
relacionadas: [filamentos/pla, filamentos/boquilla-endurecida, maquinas/boquillas]
fuentes: [bambu-tabla, microcenter-glow]
publico: todos
revisado: 2026-11
```

#### Datos

| Efecto | Boquilla | Notas de Bambu Lab |
|---|---|---|
| Madera | 190–240 °C, 0.4 mm o más (no 0.2) | El AMS Lite puede no moverlo bien. Más frágil que el PLA normal. |
| Mármol | 0.4 mm como primera opción; evita 0.2 | Lleva partículas de piedra. |
| Brillo en la oscuridad | 210–240 °C, 0.4 mm recomendada | Boquilla endurecida recomendada si lo usas seguido. AMS Lite no recomendado. |
| Metal | 190–240 °C | Si lleva polvo de metal real, usa boquilla endurecida. |

#### Usos

Decoración, figuras, regalos, letreros, piezas que se ven y no cargan peso.

> **Dato curioso.** El PLA que brilla en la oscuridad lleva aluminato de estroncio. Es un polvo más duro que el latón y desgasta la boquilla por dentro.

#### Preguntas

- **¿Cuánto tiempo brilla?** Depende de cuánta luz recibió antes y del grosor de la pieza. Más luz y paredes más gruesas dan más brillo.
- **¿El PLA de madera se puede lijar y barnizar?** Sí. Lija con grano fino y usa barniz para madera.
- **¿Por qué se tapa la boquilla con estos filamentos?** Las partículas se juntan en boquillas chicas. Usa 0.4 mm o más y no lo dejes caliente sin imprimir mucho tiempo.

---

```yaml
slug: filamentos/pla-cf
tipo: ficha
tema: filamentos
titulo: PLA-CF
subtitulo: PLA con fibra de carbono.
en_corto: Más rígido que el PLA y con acabado mate. Aguanta el mismo calor (55 °C) y menos golpes. Pide boquilla endurecida.
filtros: [uso-diario, mecanica]
etiquetas: [pla-cf, pla cf, pla carbono, fibra de carbono]
relacionadas: [filamentos/boquilla-endurecida, filamentos/petg-cf, filamentos/pla]
fuentes: [bambu-tabla, bambu-guia]
publico: todos
revisado: 2026-11
```

#### Datos

| Dato | Valor |
|---|---|
| Boquilla | 210–240 °C, acero endurecido, 0.4 mm o más |
| Cama | 45–65 °C |
| Calor que aguanta | 55 °C |
| Golpes | 23.2 kJ/m² |
| Rigidez | 3950 MPa (PLA: 2750) |
| Secado | 55 °C · 8 h |
| Impresora | Abierta o cerrada |
| AMS | Sí (Bambu PLA-CF) |
| Velocidad máxima | 250 mm/s |
| Recocido | 55–60 °C · 6–12 h |

#### Usos

Soportes, marcos, piezas que no deben doblarse, drones y modelos de radiocontrol de interior.

#### No se recomienda para

Calor, exteriores, piezas que reciben golpes.

#### Preguntas

- **¿Es más fuerte que el PLA?** Es más rígido (se dobla menos), pero aguanta menos golpes. Si la pieza se golpea, usa PETG.
- **¿Puedo usarlo con boquilla de latón?** Para una prueba corta, sí. Con uso seguido la desgasta y la pieza empieza a salir con falta de material.

---

```yaml
slug: filamentos/petg
tipo: ficha
tema: filamentos
titulo: PETG
subtitulo: Sirve para lo mismo que el PLA y, además, para piezas que se golpean o se calientan un poco.
en_corto: Aguanta más golpes que el PLA (casi el doble) y más calor (69 °C). Deja más hilos al imprimir y se pega mucho a la cama de PEI liso.
filtros: [uso-diario, exterior, calor, mecanica]
etiquetas: [petg, pet-g, pet g, petg hf, petg translucido, pet]
relacionadas: [filamentos/pla, problemas/hilos, filamentos/secado, mantenimiento/cama]
fuentes: [bambu-tabla, bambu-guia, prusa-materiales]
publico: todos
revisado: 2026-11
```

#### Datos

| Dato | Valor |
|---|---|
| Boquilla | 240–270 °C |
| Cama | 60–80 °C |
| Calor que aguanta | 69 °C |
| Golpes | 52.7 kJ/m² |
| Rigidez | 1670 MPa |
| Agua que absorbe | 0.32 % |
| Secado | 70 °C · 8 h |
| Impresora | Mejor cerrada; también imprime en abierta |
| Boquilla endurecida | No |
| AMS | Sí |
| Velocidad máxima | 200 mm/s |

#### Usos

Todo lo del PLA (figuras, llaveros, decoración, maquetas) y, además, soportes de pared, macetas, piezas para el coche, cajas, carcasas y piezas que se doblan un poco sin romperse.

#### No se recomienda para

Piezas que van a estar años al sol (mejor ASA) y piezas cerca de motores o calor fuerte (PC o nylon con fibra).

#### Cómo imprimirlo

- En PEI liso se pega tanto que puede arrancar pedazos de la placa. Usa pegamento en barra como separador o la placa texturizada.
- Ventilador de capa más bajo que con PLA.
- Si salen hilos, sécalo antes de mover la retracción.
- En detalle muy fino deja más hilos que el PLA. Con el filamento seco y la boquilla 5–10 °C más fría casi no se nota.

> **Dato curioso.** La «G» de PETG es de glicol. Se le agrega al PET de las botellas para que no se cristalice y se pueda imprimir.

#### Preguntas

- **¿Puedo usar PETG en lugar de PLA?** Sí, para todo. Sirve para lo mismo y aguanta más golpes y calor. Lo que decide es el precio: si encuentras PETG igual o más barato, no necesitas PLA. Al revés no: el PLA no aguanta lo que aguanta el PETG.
- **¿El PETG aguanta el sol?** Mejor que el PLA. Para piezas que van a estar años al sol, el ASA es mejor opción.
- **¿Por qué mi PETG deja tantos hilos?** Es su comportamiento normal y empeora con humedad. Sécalo y baja la boquilla 5–10 °C.
- **¿Se puede pegar?** Sí, con pegamento instantáneo (cianoacrilato) o epóxico.

---

```yaml
slug: filamentos/petg-cf
tipo: ficha
tema: filamentos
titulo: PETG-CF
subtitulo: PETG con fibra de carbono.
en_corto: Más rígido que el PETG, con acabado mate y 74 °C de resistencia al calor. Pide boquilla endurecida.
filtros: [mecanica, calor]
etiquetas: [petg-cf, petg cf, petg carbono]
relacionadas: [filamentos/petg, filamentos/boquilla-endurecida, filamentos/pla-cf]
fuentes: [bambu-tabla, bambu-guia]
publico: talleres
revisado: 2026-11
```

#### Datos

| Dato | Valor |
|---|---|
| Boquilla | 240–270 °C, acero endurecido |
| Cama | 60–80 °C |
| Calor que aguanta | 74 °C |
| Golpes | 41.2 kJ/m² |
| Rigidez | 2910 MPa |
| Secado | 70 °C · 8 h |
| AMS | Sí (AMS Lite no recomendado) |
| Velocidad máxima | 200 mm/s |
| Recocido | 65–70 °C · 6–12 h |

#### Usos

Soportes, carcasas, piezas de herramienta, accesorios de bicicleta y coche.

---

```yaml
slug: filamentos/abs
tipo: ficha
tema: filamentos
titulo: ABS
subtitulo: Aguanta calor y golpes. Pide impresora cerrada.
en_corto: Aguanta 87 °C y golpes. Se encoge al enfriarse, así que se despega o se agrieta si hay corrientes de aire. Huele más que el PLA; imprime con ventilación.
filtros: [calor, mecanica]
etiquetas: [abs, acrilonitrilo, abs-gf]
relacionadas: [filamentos/asa, problemas/esquinas-levantadas, acabado/vapor-de-acetona, seguridad/emisiones]
fuentes: [bambu-tabla, bambu-guia, ul-top10]
publico: todos
revisado: 2026-11
```

#### Datos

| Dato | Valor |
|---|---|
| Boquilla | 240–280 °C |
| Cama | 90–100 °C |
| Calor que aguanta | 87 °C |
| Golpes | 39.3 kJ/m² |
| Agua que absorbe | 0.65 % |
| Secado | 80 °C · 8 h |
| Impresora | Cerrada (abierta no recomendada) |
| AMS | Sí |
| Recocido | 80–90 °C · 6–12 h |

#### Usos

Carcasas, piezas de coche por dentro, piezas que se van a alisar con acetona.

#### No se recomienda para

Exteriores al sol (se pone amarillo y se debilita; usa ASA). Cuartos sin ventilación.

#### Cómo imprimirlo

- Impresora cerrada y puerta cerrada todo el trabajo.
- Ventilador de capa bajo o apagado.
- Borde (brim) en piezas grandes o con esquinas.

> **Dato curioso.** Los bloques de LEGO son de ABS.

#### Preguntas

- **¿Por qué se agrieta mi pieza de ABS?** Se enfría disparejo: el aire frío encoge unas capas antes que otras. Cierra la impresora y apaga el ventilador de capa.
- **¿ABS o ASA?** Se imprimen igual. ASA si la pieza va afuera; ABS si la vas a alisar con acetona o si es más barato donde compras.
- **¿Es peligroso el olor?** Suelta más partículas y vapores que el PLA. Imprime en un cuarto ventilado y no te quedes junto a la impresora. Ver Seguridad.

---

```yaml
slug: filamentos/asa
tipo: ficha
tema: filamentos
titulo: ASA
subtitulo: Para piezas que van al sol.
en_corto: Se imprime como el ABS, pero resiste los rayos UV y aguanta más calor (100 °C). Es la primera opción para exteriores. Pide impresora cerrada.
filtros: [exterior, calor]
etiquetas: [asa, exterior, intemperie, uv, sol, carro, coche, jardin]
relacionadas: [filamentos/abs, filamentos/exterior, problemas/esquinas-levantadas]
fuentes: [bambu-tabla, bambu-guia, prusa-materiales]
publico: todos
revisado: 2026-11
```

#### Datos

| Dato | Valor |
|---|---|
| Boquilla | 240–280 °C |
| Cama | 90–100 °C |
| Calor que aguanta | 100 °C |
| Golpes | 41.0 kJ/m² |
| Agua que absorbe | 0.45 % |
| Secado | 80 °C · 8 h |
| Impresora | Cerrada (abierta no recomendada) |
| AMS | Sí |
| Recocido | 80–90 °C · 6–12 h |

#### Usos

Piezas de coche por fuera, jardín, letreros de exterior, soportes de cámaras y antenas, piezas de bicicleta y moto.

#### Cómo imprimirlo

Igual que el ABS: impresora cerrada, ventilador bajo, borde en piezas grandes, cuarto ventilado.

#### Preguntas

- **¿Cuánto dura al sol?** Años, mucho más que PLA, PETG o ABS. Los colores claros se calientan menos que los oscuros.
- **¿Se puede pintar?** Sí, con primer para plástico.

---

```yaml
slug: filamentos/tpu
tipo: ficha
tema: filamentos
titulo: TPU
subtitulo: Filamento flexible, como hule.
en_corto: Se dobla y regresa a su forma. Es el que más golpes aguanta. Se imprime lento (menos de 80 mm/s), se seca siempre antes de usarlo y no entra al AMS.
filtros: [flexible]
etiquetas: [tpu, flexible, hule, goma, elastico, 95a, 85a, tpe]
relacionadas: [filamentos/secado, maquinas/multicolor, problemas/hilos]
fuentes: [bambu-tabla, bambu-guia, prusa-materiales]
publico: todos
revisado: 2026-11
```

#### Datos

| Dato | Valor |
|---|---|
| Boquilla | 200–250 °C |
| Cama | 35–45 °C |
| Golpes | 125.2 kJ/m² (casi 5 veces el PLA) |
| Agua que absorbe | 1.16 % |
| Secado | 70 °C · 8 h, siempre |
| Impresora | Abierta o cerrada |
| AMS | No (es muy blando) |
| Velocidad máxima | 80 mm/s |

#### Usos

Fundas de celular, topes, llantas, empaques, correas, protectores de esquinas, pies antiderrapantes.

#### Cómo imprimirlo

- Lento y sin cambios bruscos de velocidad.
- Retracción corta o apagada.
- Desde un portarrollos fuera del AMS.

> **Dato curioso.** El «95A» del TPU es su dureza en la escala Shore A, la que se usa para hules. Mientras más alto el número, más duro. El 85A es más blando que el 95A.

#### Preguntas

- **¿Por qué se atora el TPU en el extrusor?** Al ser blando, se dobla si va rápido o si hay espacio entre los engranes y la entrada de la boquilla. Baja la velocidad.
- **¿El TPU se pega a la cama?** Mucho. En PEI liso, usa pegamento en barra como separador para poder despegarlo.

---

```yaml
slug: filamentos/pc
tipo: ficha
tema: filamentos
titulo: PC (policarbonato)
subtitulo: Calor alto y golpes.
en_corto: Aguanta 117 °C. Pide impresora cerrada, cama de 100–120 °C y filamento seco.
filtros: [calor, mecanica]
etiquetas: [pc, policarbonato, polycarbonate, pc fr]
relacionadas: [filamentos/secado, filamentos/abs, maquinas/abierta-o-cerrada]
fuentes: [bambu-tabla, bambu-guia, prusa-materiales]
publico: talleres
revisado: 2026-11
```

#### Datos

| Dato | Valor |
|---|---|
| Boquilla | 260–290 °C |
| Cama | 100–120 °C |
| Calor que aguanta | 117 °C |
| Golpes | 34.8 kJ/m² |
| Rigidez | 2310 MPa |
| Secado | 80 °C · 8 h, siempre |
| Impresora | Cerrada (abierta no recomendada) |
| Boquilla 0.2 mm | No recomendada |
| Recocido | 85–100 °C · 6–12 h |

#### Usos

Piezas cerca de motores o focos, protecciones, piezas técnicas.

---

```yaml
slug: filamentos/nylon
tipo: ficha
tema: filamentos
titulo: Nylon (PA) y nylon con fibra
subtitulo: PA6-CF, PAHT-CF y PA con fibra de vidrio.
en_corto: Para piezas mecánicas que rozan, cargan o están cerca de calor (hasta 194 °C el PAHT-CF). Absorbe mucha humedad del aire, así que se seca siempre y se imprime desde una caja seca.
filtros: [calor, mecanica]
etiquetas: [nylon, nailon, pa, pa6, pa6-cf, paht-cf, pa-gf, poliamida, engranes]
relacionadas: [filamentos/secado, filamentos/guardado, filamentos/boquilla-endurecida]
fuentes: [bambu-tabla, bambu-guia, bambu-pa-cf]
publico: talleres
revisado: 2026-11
```

#### Datos

| Dato | PAHT-CF | PA6-CF |
|---|---|---|
| Boquilla | 260–300 °C | 260–300 °C |
| Cama | 100–120 °C | 100–120 °C |
| Calor que aguanta | 194 °C | 184 °C |
| Golpes | 57.5 kJ/m² | 40.3 kJ/m² |
| Rigidez | 4230 MPa | 5460 MPa |
| Agua que absorbe | 0.88 % | 2.35 % |
| Secado | 80 °C · 8–12 h | 80 °C · 8–12 h |
| Boquilla | Endurecida, 0.6 mm recomendada | Endurecida, 0.6 mm recomendada |
| Velocidad máxima | 100 mm/s | 100 mm/s |
| Recocido | 90–130 °C · 6–12 h | 90–130 °C · 6–12 h |

#### Usos

Engranes, bujes, bisagras, soportes de motor, piezas de herramientas, piezas de drones.

> **Dato curioso.** El PA6-CF puede absorber hasta 2.35 % de su peso en agua. Un rollo de 1 kg al aire puede ganar más de 20 g de agua.

#### Preguntas

- **¿Por qué mi nylon sale con burbujas?** Humedad. El nylon se humedece en horas; sécalo y aliméntalo desde una caja con desecante.
- **¿Qué es el PAHT?** Nylon de alta temperatura (HT). Aguanta más calor y absorbe menos agua que el PA6.

---

```yaml
slug: filamentos/pet-cf
tipo: ficha
tema: filamentos
titulo: PET-CF
subtitulo: El más resistente al calor de la tabla.
en_corto: Aguanta 205 °C y es muy rígido, pero aguanta poco los golpes entre capas. No entra al AMS.
filtros: [calor, mecanica]
etiquetas: [pet-cf, pet cf, pet carbono]
relacionadas: [filamentos/nylon, filamentos/boquilla-endurecida, filamentos/recocido]
fuentes: [bambu-tabla, bambu-guia]
publico: talleres
revisado: 2026-11
```

#### Datos

| Dato | Valor |
|---|---|
| Boquilla | 260–300 °C, endurecida, 0.6 mm recomendada |
| Cama | 100–120 °C |
| Calor que aguanta | 205 °C |
| Golpes | 36.0 kJ/m² (entre capas: 4.5) |
| Rigidez | 5320 MPa |
| Secado | 80 °C · 8–12 h, siempre |
| AMS | No |
| Velocidad máxima | 100 mm/s |
| Recocido | 90–130 °C · 6–12 h |

#### Usos

Piezas en cofres de motor, soportes junto a fuentes de calor, plantillas de taller.

---

```yaml
slug: filamentos/soportes
tipo: ficha
tema: filamentos
titulo: Materiales de soporte
subtitulo: PVA, BVOH y soportes que se despegan.
en_corto: Se imprimen solo en la zona de contacto con la pieza para que el soporte salga limpio. El PVA y el BVOH se disuelven en agua. Necesitan impresora de varios materiales (AMS o dos boquillas).
filtros: [soportes]
etiquetas: [pva, bvoh, soporte soluble, support, hips, interfaz]
relacionadas: [laminado/soportes, acabado/quitar-soportes, maquinas/multicolor]
fuentes: [bambu-tabla]
publico: talleres
revisado: 2026-11
```

#### Datos

| Material | Se quita | Boquilla | Notas |
|---|---|---|---|
| PVA | Se disuelve en agua | 190–240 °C | Secado 55 °C · 8 h. Al AMS solo seco. |
| BVOH | Se disuelve en agua | 190–240 °C | Al AMS solo seco. |
| Soporte para PLA | Se despega | 190–240 °C | Para piezas de PLA. |
| Soporte para PLA/PETG | Se despega | 190–240 °C | Para PLA y PETG. |

> **Truco.** Usa el material de soporte solo en la capa que toca la pieza (interfaz) y el resto del soporte con el mismo material de la pieza. Gastas mucho menos.

---

### 4.4 Artículos de filamentos

```yaml
slug: filamentos/secado
tipo: articulo
tema: filamentos
titulo: Secado
subtitulo: Cuándo, cómo y a qué temperatura.
en_corto: Todos los filamentos absorben humedad. Si truena al salir de la boquilla, está húmedo. TPU, PC, nylon, PET-CF y PVA se secan siempre antes de usarse.
etiquetas: [secar, humedo, humedad, secador, horno, truena, burbujas, deshidratador]
relacionadas: [filamentos/guardado, problemas/filamento-humedo, problemas/hilos]
fuentes: [bambu-tabla, bambu-secado]
publico: todos
revisado: 2026-11
```

#### Señales de filamento húmedo

- Truena o hace burbujas al salir de la boquilla.
- Salen hilos entre partes de la pieza.
- La superficie sale áspera o con huecos.
- La pieza sale débil y se rompe entre capas.
- El PLA se quiebra solo dentro del tubo.

#### Temperaturas

| Material | Horno de aire | Desecante al imprimir |
|---|---|---|
| PLA, PLA-CF | 55 °C · 8 h | Opcional |
| PETG, PETG-CF | 70 °C · 8 h | Opcional |
| TPU | 70 °C · 8 h | Obligatorio |
| ABS, ASA | 80 °C · 8 h | Opcional |
| PC | 80 °C · 8 h | Obligatorio |
| PA, PA-CF, PAHT-CF, PET-CF | 80 °C · 8–12 h | Obligatorio |
| PVA | 55 °C · 8 h | Obligatorio |

#### Formas de secar

| Forma | Ventaja | Cuidado |
|---|---|---|
| Secador de filamento | Temperatura estable; algunos dejan imprimir mientras secan. | Revisa que llegue a la temperatura del material. |
| Horno de aire (deshidratador) | Cabe más de un rollo. | Mide la temperatura real con un termómetro. |
| Cama de la impresora | No cuesta nada extra. | Tarda unas 12 h; tapa el rollo con una caja. |
| Horno de cocina | | No se recomienda: muchos no mantienen temperaturas tan bajas y pueden deformar el carrete. |

> **Cuidado.** No pases de la temperatura de la tabla. Arriba de esa temperatura el filamento se pega entre vueltas y el carrete se puede deformar.

#### Preguntas

- **¿Cada cuánto hay que secar?** Los que dicen «siempre», antes de cada uso. Los demás, cuando el rollo estuvo abierto días o ves las señales de arriba.
- **¿Un rollo nuevo ya viene seco?** Sale seco de fábrica, en bolsa sellada con desecante. Si la bolsa llegó rota o inflada, sécalo.
- **¿Se puede secar de más?** A la temperatura correcta, no le pasa nada. El problema es pasarse de temperatura.

---

```yaml
slug: filamentos/guardado
tipo: articulo
tema: filamentos
titulo: Guardado
subtitulo: Cómo guardar rollos abiertos.
en_corto: En bolsa con cierre o caja hermética, con desecante. Un higrómetro dentro avisa cuando el desecante ya no sirve.
etiquetas: [guardar, almacenar, caja seca, desecante, silica, gel de silice, higrometro, bolsa]
relacionadas: [filamentos/secado, negocio/inventario]
fuentes: [bambu-tabla]
publico: todos
revisado: 2026-11
```

#### Pasos

1. Al terminar de imprimir, mete el rollo en una bolsa con cierre o en una caja hermética.
2. Agrega un sobre de desecante (gel de sílice).
3. Pon un higrómetro dentro de la caja.
4. Cuando la humedad suba, seca o cambia el desecante (el que cambia de color avisa solo).
5. Anota en la bolsa la fecha en que lo abriste.

> **Truco.** Guarda la punta del filamento metida en los agujeros del carrete. Si se suelta, el rollo se enreda y se atora a media impresión.

#### Preguntas

- **¿Se puede dejar el rollo en el AMS?** Sí, con desecante dentro y la tapa cerrada. Para nylon y TPU, mejor en caja seca.
- **¿El filamento caduca?** No tiene fecha de caducidad, pero la humedad y el sol lo debilitan. Guardado seco y a la sombra dura años.

---

```yaml
slug: filamentos/resistencia-al-calor
tipo: articulo
tema: filamentos
titulo: Resistencia al calor
subtitulo: A qué temperatura se deforma cada filamento.
en_corto: El PLA se deforma desde 57 °C; un coche al sol pasa de esa temperatura en una hora. Para calor, usa PETG (69 °C), ABS (87 °C), ASA (100 °C) o PC (117 °C).
etiquetas: [calor, temperatura, deforma, derrite, coche, carro, sol, hdt, resistente al calor, altas temperaturas]
relacionadas: [filamentos/exterior, filamentos/recocido, filamentos/asa]
fuentes: [bambu-guia, vanos-2018]
publico: todos
revisado: 2026-11
```

#### Temperatura de deformación (HDT a 0.45 MPa)

| Material | Temperatura |
|---|---|
| PLA-CF | 55 °C |
| PLA | 57 °C |
| PETG | 69 °C |
| PETG-CF | 74 °C |
| ABS | 87 °C |
| ASA | 100 °C |
| PC | 117 °C |
| PA6-CF | 184 °C |
| PAHT-CF | 194 °C |
| PET-CF | 205 °C |

#### Temperaturas de referencia

| Lugar | Temperatura |
|---|---|
| Tablero de un coche al sol, después de 1 hora | 69 °C |
| Volante de un coche al sol | 53 °C |
| Asientos de un coche al sol | 51 °C |
| Aire dentro del coche | 47 °C |

Medido en Arizona (UC San Diego y Arizona State, 2018).

#### Qué es la HDT

Es la temperatura a la que una barra del material se dobla una medida fija con un peso encima. La pieza no se derrite a esa temperatura: se ablanda y se deforma si carga algo.

> **Dato curioso.** El PLA recocido aguanta más calor, pero la pieza se encoge y se puede torcer en el horno. Ver Recocido.

#### Preguntas

- **¿Qué filamento uso para una pieza del coche?** Dentro, PETG o ABS. En el tablero o por fuera, ASA.
- **¿El PLA se derrite con agua caliente?** Se ablanda y se deforma. No lo metas al lavavajillas.
- **¿Una pieza blanca aguanta más que una negra?** Al sol, sí: la negra se calienta más.

---

```yaml
slug: filamentos/exterior
tipo: articulo
tema: filamentos
titulo: Exterior
subtitulo: Piezas que van al sol y a la lluvia.
en_corto: ASA es la primera opción. PETG sirve si no le pega el sol todo el día. PLA no, porque se deforma con calor y se debilita al sol.
etiquetas: [exterior, afuera, intemperie, sol, uv, lluvia, jardin, fachada]
relacionadas: [filamentos/asa, filamentos/resistencia-al-calor, acabado/pintura]
fuentes: [bambu-guia, prusa-materiales]
publico: todos
revisado: 2026-11
```

#### Opciones

| Material | Sol directo | Calor | Notas |
|---|---|---|---|
| ASA | Sí | 100 °C | Hecho para exterior. |
| PETG | Por temporadas | 69 °C | Mejor bajo techo o a la sombra. |
| ABS | No | 87 °C | Se pone amarillo y se debilita con el sol. |
| PLA | No | 57 °C | Se deforma con el calor de la calle. |

#### Recomendaciones

- Colores claros: se calientan menos.
- Más paredes (4 o más) y relleno alto: la pieza tarda más en debilitarse.
- Tornillos de acero inoxidable.
- Una mano de pintura con protección UV alarga la vida de cualquier material.

---

```yaml
slug: filamentos/boquilla-endurecida
tipo: articulo
tema: filamentos
titulo: Boquilla endurecida
subtitulo: Para filamentos con fibra o partículas.
en_corto: Los filamentos con fibra de carbono, fibra de vidrio o partículas duras raspan la boquilla de latón por dentro. Para ellos se usa una de acero endurecido.
etiquetas: [boquilla endurecida, acero endurecido, hardened, abrasivo, fibra, cf, gf, latón, desgaste]
relacionadas: [maquinas/boquillas, filamentos/pla-cf, filamentos/nylon]
fuentes: [bambu-tabla]
publico: talleres
revisado: 2026-11
```

#### Qué filamentos la piden

PLA-CF, PETG-CF, ABS-GF, PA6-CF, PA6-GF, PAHT-CF, PET-CF, PPA-CF, PPS-CF y PLA con polvo de metal. Recomendada para PLA que brilla en la oscuridad si se usa seguido.

#### Señales de boquilla gastada

- La pieza sale con falta de material aunque el filamento esté seco.
- La punta de la boquilla se ve redonda o el agujero más grande.
- Hilos y gotas que antes no salían.

#### Antes de imprimir un filamento con fibra

Bambu Lab recomienda calentar la boquilla a 280 °C y limpiar el interior con la llave Allen y la aguja de limpieza, para que no queden restos de otro material.

#### Preguntas

- **¿Puedo usar la endurecida para todo?** Sí. Conduce un poco menos el calor que el latón; si ves falta de material, sube la boquilla 5–10 °C.
- **¿Y la de acero inoxidable?** No es para filamentos con fibra. Bambu Lab no la recomienda para ellos.

---

```yaml
slug: filamentos/rendimiento-del-rollo
tipo: articulo
tema: filamentos
titulo: Rendimiento del rollo
subtitulo: Metros por kilo y gramos por metro.
en_corto: Un rollo de 1 kg de PLA de 1.75 mm mide unos 335 m. El ABS, más ligero, rinde unos 400 m.
etiquetas: [metros, cuanto rinde, rollo, kilo, peso, gramos por metro, cuanto queda]
relacionadas: [negocio/costo, negocio/inventario, filamentos/diametro]
fuentes: [calculo-propio]
publico: todos
revisado: 2026-11
```

#### Tabla (1.75 mm)

| Material | Densidad típica | Metros por kg | Gramos por metro |
|---|---|---|---|
| ABS | 1.04 g/cm³ | 400 m | 2.50 g |
| ASA | 1.07 g/cm³ | 389 m | 2.57 g |
| PA (nylon) | 1.14 g/cm³ | 365 m | 2.74 g |
| PC | 1.20 g/cm³ | 346 m | 2.89 g |
| TPU | 1.21 g/cm³ | 344 m | 2.91 g |
| PLA | 1.24 g/cm³ | 335 m | 2.98 g |
| PETG | 1.27 g/cm³ | 327 m | 3.05 g |

Cálculo: volumen = peso ÷ densidad; largo = volumen ÷ área del filamento (1.75 mm de diámetro). La densidad exacta viene en la ficha técnica de cada marca.

> **Truco.** Para saber cuánto queda en un rollo, pesa una vez el carrete vacío de tu marca y anótalo. Peso del rollo menos peso del carrete = filamento que queda.

---

```yaml
slug: filamentos/diametro
tipo: articulo
tema: filamentos
titulo: "Diámetro: 1.75 o 2.85 mm"
subtitulo: Cuál usa tu impresora.
en_corto: Casi todas las impresoras actuales usan 1.75 mm. Algunas, como las Ultimaker, usan 2.85 mm. No son intercambiables.
etiquetas: [diametro, 1.75, 2.85, 3 mm, grosor del filamento]
relacionadas: [filamentos/rendimiento-del-rollo]
fuentes: []
publico: todos
revisado: 2026-11
```

- Revisa el diámetro en el manual de tu impresora o en el extrusor.
- El filamento de 2.85 mm a veces se vende como «3 mm».
- La etiqueta del rollo dice la tolerancia (cuánto puede variar el diámetro). Mientras menor, más parejo sale el material.

---

```yaml
slug: filamentos/recocido
tipo: articulo
tema: filamentos
titulo: Recocido
subtitulo: Calentar la pieza para que aguante más calor.
en_corto: Se mete la pieza ya impresa a un horno a temperatura baja por varias horas. Aguanta más calor, pero se encoge y se puede torcer. Haz una prueba antes.
etiquetas: [recocer, recocido, annealing, horno, mas resistente al calor]
relacionadas: [filamentos/resistencia-al-calor, filamentos/pla]
fuentes: [bambu-guia]
publico: talleres
revisado: 2026-11
```

#### Temperaturas (guía de Bambu Lab)

| Material | Temperatura | Tiempo |
|---|---|---|
| PLA | 50–60 °C | 6–12 h |
| PLA-CF | 55–60 °C | 6–12 h |
| PETG-CF | 65–70 °C | 6–12 h |
| ABS, ASA | 80–90 °C | 6–12 h |
| PC | 85–100 °C | 6–12 h |
| PA-CF, PAHT-CF, PET-CF | 90–130 °C | 6–12 h |
| PETG | No aplica | |

#### Pasos

1. Imprime una pieza de prueba igual.
2. Métela al horno frío y sube la temperatura poco a poco.
3. Deja el tiempo de la tabla.
4. Apaga y deja enfriar dentro del horno.
5. Mide la pieza de prueba. Si se encogió, ajusta la escala del modelo antes de imprimir la buena.

> **Cuidado.** Un horno de cocina no es preciso a estas temperaturas. Usa un horno de aire o un secador de filamento con termómetro.

---

```yaml
slug: filamentos/alimentos
tipo: articulo
tema: filamentos
titulo: Contacto con alimentos
subtitulo: Vasos, platos, cortadores de galletas.
en_corto: No recomendamos piezas impresas para comida o bebida. Entre las capas quedan huecos donde se acumulan bacterias y no se pueden lavar bien.
etiquetas: [comida, alimentos, vaso, plato, taza, cortador de galletas, molde, food safe, grado alimenticio]
relacionadas: [seguridad/emisiones, filamentos/pla]
fuentes: []
publico: todos
revisado: 2026-11
```

#### Por qué

- Las líneas entre capas guardan restos de comida y bacterias.
- El agua caliente que se usa para lavar deforma el PLA (57 °C).
- Un rollo puede decir «apto para alimentos», pero los pigmentos, la boquilla y el proceso también cuentan.

#### Si de todas formas lo vas a usar

- Cortadores de galletas y moldes de un solo uso, con contacto breve y masa fría.
- Lava a mano con agua fría.
- Cambia la pieza seguido.

---

```yaml
slug: filamentos/olor-y-humo
tipo: articulo
tema: filamentos
titulo: Olor y emisiones por material
subtitulo: Cuáles sueltan más partículas al imprimir.
en_corto: El PLA suelta menos que el nylon o el ABS. Todos sueltan partículas muy finas; imprime con ventilación.
etiquetas: [olor, humo, toxico, vapores, ventilacion, huele]
relacionadas: [seguridad/emisiones, filamentos/abs]
fuentes: [ul-top10]
publico: todos
revisado: 2026-11
```

Ver la página completa en Seguridad › Emisiones.

---
## 5. Máquinas

### 5.1 Pantalla del tema: Máquinas

```yaml
slug: maquinas
tipo: seccion
tema: maquinas
titulo: Máquinas
subtitulo: Tipos de impresora, partes, boquillas, placas y consumo eléctrico.
en_corto: Para piezas de plástico de uso diario se usan impresoras de filamento (FDM). Las de resina dan más detalle y las de polvo (SLS) son industriales.
filtros: [tipos, partes, tamano, boquillas, placas, multicolor, comprar]
etiquetas: [impresora, maquina, impresora 3d, equipo, bambu, prusa, creality, elegoo, anycubic]
relacionadas: [maquinas/elegir-impresora, maquinas/abierta-o-cerrada, mantenimiento/calendario]
fuentes: [formlabs-tipos, all3dp-corexy, bambu-tabla, wikipedia-fff]
publico: todos
revisado: 2026-11
```

**Pantalla, de arriba a abajo**

1. Ruta, título, subtítulo, «En corto».
2. **Filtros** (chips): Tipos · Partes · Tamaño · Boquillas · Placas · Multicolor · Comprar.
3. **Tabla «Tipos de impresión 3D»** (ver 5.2).
4. **Diagrama «Partes de una impresora»**: ilustración de una impresora de filamento con números que ligan a la lista de 5.4.
5. Lista de artículos del tema.
6. Dato curioso, Preguntas, También te puede servir, Fuentes, Llamado.

> **Dato curioso.** La impresión por filamento fundido se patentó a finales de los ochenta con el nombre FDM. Cuando la patente venció en 2009, el proyecto RepRap ya usaba el nombre FFF, y así aparecieron las impresoras caseras.

#### Preguntas

- **¿Qué impresora compro para empezar?** Depende de qué vas a imprimir y cuánto. Ver «Elegir impresora».
- **¿Cuánto tarda una pieza?** De minutos a días. Depende del tamaño, la altura de capa, el relleno y la velocidad de la máquina. El laminador te dice el tiempo antes de imprimir.
- **¿Qué tan grande puede ser una pieza?** Lo que quepa en la impresora: en muchas, 256 × 256 × 256 mm. La medida de cada modelo está en Volumen de impresión. Una pieza más grande se divide en partes y se une.

---

```yaml
slug: maquinas/tipos
tipo: articulo
tema: maquinas
titulo: Tipos de impresión 3D
subtitulo: Filamento, resina y polvo.
en_corto: Filamento (FDM) para piezas resistentes y baratas. Resina (SLA) para detalle fino y superficie lisa. Polvo (SLS) para piezas industriales de nylon sin soportes.
etiquetas: [fdm, fff, sla, msla, dlp, resina, sls, polvo, tipos de impresora, tecnologias]
relacionadas: [maquinas/cinematica, filamentos]
fuentes: [formlabs-tipos]
publico: todos
revisado: 2026-11
```

| Tipo | Cómo funciona | Superficie | Usos | Cuidados |
|---|---|---|---|---|
| Filamento (FDM o FFF) | Derrite un hilo de plástico y lo deposita capa por capa | Capas visibles | Piezas funcionales, prototipos, figuras | Pocos; es la más fácil de mantener |
| Resina (SLA, MSLA, DLP) | Endurece resina líquida con luz | Lisa, detalle muy fino | Joyería, odontología, miniaturas | Guantes, lavado con alcohol y curado con luz UV |
| Polvo (SLS) | Un láser funde polvo de nylon | Rugosa y mate | Piezas industriales, series cortas | Equipo caro; manejo de polvo |

> **Dato curioso.** En SLS la pieza no necesita soportes: el mismo polvo sin fundir la sostiene mientras se imprime.

---

```yaml
slug: maquinas/cinematica
tipo: articulo
tema: maquinas
titulo: Cartesiana o CoreXY
subtitulo: Cómo se mueve la impresora.
en_corto: En una cartesiana de cama móvil, la cama va y viene. En una CoreXY, el cabezal se mueve en X y Y y la cama solo baja. La CoreXY suele ser más rápida y estable con piezas altas.
etiquetas: [corexy, cartesiana, cama movil, bed slinger, cinematica, ejes]
relacionadas: [maquinas/elegir-impresora, maquinas/partes]
fuentes: [all3dp-corexy]
publico: talleres
revisado: 2026-11
```

| Dato | Cartesiana (cama móvil) | CoreXY |
|---|---|---|
| Qué se mueve | Cama en Y, cabezal en X | Cabezal en X y Y; cama en Z |
| Velocidad | Media | Alta |
| Piezas altas y delgadas | Se pueden mover con la cama | Más estables |
| Forma | Abierta, ocupa más fondo | Cubo, fácil de cerrar |
| Mantenimiento | Simple | Bandas más largas |
| Ejemplos | Bambu Lab A1, Prusa MK4, Creality Ender 3 | Bambu Lab X1, P1, P2S; Prusa Core One |

---

```yaml
slug: maquinas/abierta-o-cerrada
tipo: articulo
tema: maquinas
titulo: Impresora abierta o cerrada
subtitulo: Cuándo hace falta el gabinete.
en_corto: Con PLA, TPU y PLA-CF da igual. ABS, ASA, PC, nylon y los de fibra se deforman o se agrietan si la pieza se enfría disparejo; para ellos se recomienda impresora cerrada.
etiquetas: [gabinete, enclosure, cerrada, abierta, camara, carcasa]
relacionadas: [filamentos/abs, problemas/esquinas-levantadas, seguridad/emisiones]
fuentes: [bambu-tabla]
publico: todos
revisado: 2026-11
```

| Material | Abierta | Cerrada |
|---|---|---|
| PLA, PLA-CF, TPU, PVA | Sí | Sí, con la tapa o la puerta abierta si la cama pasa de 45 °C |
| PETG | Sí | Recomendada por Bambu Lab |
| ABS, ASA, PC, PA, PET-CF | No recomendada | Recomendada |

Ventajas de la cerrada: temperatura pareja, menos corrientes de aire, menos ruido, filtro de aire en algunos modelos, menos polvo.

> **Truco.** Un gabinete de cartón o de acrílico ayuda con ABS en una impresora abierta, pero aleja la tarjeta electrónica y la fuente del calor si están dentro.

---

```yaml
slug: maquinas/partes
tipo: articulo
tema: maquinas
titulo: Partes de una impresora
subtitulo: Nombres en español y en inglés.
en_corto: El filamento entra por el extrusor, se derrite en el hotend, sale por la boquilla y se deposita sobre la cama. Motores y bandas mueven todo.
etiquetas: [partes, piezas, extrusor, hotend, boquilla, cama, bandas, motores, ventilador, refacciones]
relacionadas: [maquinas/boquillas, maquinas/placas, mantenimiento/calendario]
fuentes: []
publico: todos
revisado: 2026-11
```

| # | Parte | En inglés | Qué hace |
|---|---|---|---|
| 1 | Portarrollos o AMS | Spool holder | Sostiene el rollo |
| 2 | Sensor de filamento | Filament runout sensor | Pausa si se acaba o se rompe |
| 3 | Tubo de PTFE | PTFE tube / Bowden | Guía el filamento |
| 4 | Extrusor | Extruder | Engranes que empujan el filamento |
| 5 | Hotend | Hotend | Calienta y derrite el plástico |
| 6 | Boquilla | Nozzle | Punta por donde sale el plástico |
| 7 | Disipador y ventilador del hotend | Heatsink, hotend fan | Evita que el calor suba al extrusor |
| 8 | Ventilador de capa | Part cooling fan | Enfría el plástico recién puesto |
| 9 | Cama | Heatbed | Superficie caliente donde se imprime |
| 10 | Placa | Build plate | Lámina removible encima de la cama |
| 11 | Ejes y varillas | Rods, rails | Guían el movimiento |
| 12 | Bandas | Belts | Transmiten el movimiento de los motores |
| 13 | Motores a pasos | Stepper motors | Mueven ejes y extrusor |
| 14 | Husillos | Lead screws | Suben y bajan la cama o el cabezal |
| 15 | Limpiador de boquilla | Nozzle wiper | Quita restos antes de imprimir |
| 16 | Cámara y sensores | Camera, lidar | Vigilan la primera capa y la impresión |

---

```yaml
slug: maquinas/boquillas
tipo: articulo
tema: maquinas
titulo: Boquillas
subtitulo: Tamaños y materiales.
en_corto: La de 0.4 mm es la estándar. La de 0.2 mm da más detalle y es más lenta. La de 0.6 mm imprime hasta el doble de rápido y da piezas más fuertes. La de 0.8 mm es para piezas grandes.
etiquetas: [boquilla, nozzle, 0.2, 0.4, 0.6, 0.8, laton, acero, endurecida, tamano de boquilla]
relacionadas: [filamentos/boquilla-endurecida, mantenimiento/boquilla, laminado/altura-de-capa]
fuentes: [prusa-boquillas, bambu-tabla]
publico: todos
revisado: 2026-11
```

#### Tamaños

| Boquilla | Capa máxima (80 %) | Usos |
|---|---|---|
| 0.2 mm | 0.16 mm | Miniaturas, texto chico, detalle fino. Lenta. |
| 0.4 mm | 0.32 mm | Casi todo. Viene con la impresora. |
| 0.6 mm | 0.48 mm | Piezas funcionales; hasta 2 veces más rápida que la 0.4. |
| 0.8 mm | 0.64 mm | Piezas grandes, macetas, prototipos rápidos. |

La capa no debe pasar del 80 % del diámetro de la boquilla (Prusa).

#### Materiales

| Material | Ventaja | Para |
|---|---|---|
| Latón | Conduce mejor el calor | Filamentos sin fibra |
| Acero endurecido | Aguanta fibras y partículas | CF, GF, brillo en la oscuridad, metal |
| Acero inoxidable | No se oxida | Filamentos sin fibra (no para CF o GF) |
| Punta de rubí o carburo | Dura mucho con abrasivos | Talleres que imprimen fibra todo el día |

> **Dato curioso.** En pruebas de Prusa, una pieza impresa con boquilla de 0.6 mm aguantó 25.6 % más impacto que la misma pieza con 0.4 mm.

#### Preguntas

- **¿Cambio la boquilla si uso otro material?** Solo si el material lo pide (fibra: endurecida) o si quieres otro tamaño.
- **¿Cada cuánto se cambia?** Cuando se gasta o se daña. Con fibra, se gasta mucho más rápido. Ver Mantenimiento › Boquilla.

---

```yaml
slug: maquinas/placas
tipo: articulo
tema: maquinas
titulo: Placas de impresión
subtitulo: PEI liso, PEI texturizado y placas especiales.
en_corto: "PEI texturizado para casi todo: deja la cara de abajo con textura y suelta la pieza al enfriarse. PEI liso deja la cara brillante. Cada placa tiene su rango de temperatura por material."
etiquetas: [placa, cama, pei, texturizada, lisa, cool plate, engineering plate, high temp, superficie]
relacionadas: [mantenimiento/cama, problemas/primera-capa]
fuentes: [bambu-tabla, bambu-pei]
publico: todos
revisado: 2026-11
```

#### Temperatura de cama por placa (Bambu Lab)

| Material | Placa fría (Cool Plate) | Ingeniería (Engineering) | PEI liso (High Temp) | PEI texturizado |
|---|---|---|---|---|
| PLA | 35–45 °C | No recomendada | 45–65 °C | 45–65 °C |
| PETG | No recomendada | 60–80 °C | 60–80 °C | 60–80 °C |
| TPU | No recomendada | 30–35 °C | 35–45 °C | 35–45 °C |
| ABS, ASA | No recomendada | 90–100 °C | 90–100 °C | 90–100 °C |
| PC, PA | No recomendada | 100–120 °C | 100–120 °C | 100–120 °C |

#### Pegamento en barra

Sirve de dos formas: para que pegue más (ABS, PA) y como separador para que no pegue de más (PETG y TPU sobre PEI liso). Para PC y nylon, Bambu Lab recomienda pegamento en barra, no líquido.

> **Cuidado.** Elige en el laminador la placa que tienes puesta. Con otra placa seleccionada, la boquilla queda a otra altura y la primera capa falla.

---

```yaml
slug: maquinas/multicolor
tipo: articulo
tema: maquinas
titulo: Multicolor y AMS
subtitulo: Imprimir varios colores o materiales en una pieza.
en_corto: El AMS cambia de rollo solo. Cada cambio de color tira un poco de filamento (purga). Para ahorrar, imprime cada color como pieza aparte y únelas.
etiquetas: [ams, multicolor, colores, purga, torre de purga, prime tower, desperdicio, cambio de color, cfs, mmu]
relacionadas: [modelos/dividir-piezas, negocio/costo, filamentos/soportes]
fuentes: [bambu-x1-compat]
publico: todos
revisado: 2026-11
```

#### Sistemas

| Sistema | Cómo funciona | Purga |
|---|---|---|
| Cambiador de rollos (AMS de Bambu Lab, CFS de Creality, MMU de Prusa) | Una boquilla; cambia el filamento | Alta: tira filamento en cada cambio |
| Dos boquillas (por ejemplo, Bambu Lab H2D) | Cada boquilla con su material | Menor |
| Cambiador de cabezales (por ejemplo, Prusa XL) | Hasta 5 cabezales | Mínima |

#### Qué no entra al AMS de Bambu Lab

TPU (muy blando), PET-CF, filamentos húmedos o quebradizos, y carretes de cartón sin adaptador.

#### Para tirar menos filamento

- Junta las capas del mismo color (menos cambios).
- Usa el relleno o un objeto de la misma placa como purga («purgar en el relleno» o «purgar en objeto»).
- Divide el modelo por colores e imprime cada parte aparte.

> **Dato curioso.** En una figura de 4 colores con muchos cambios por capa, la purga puede pesar más que la figura. El laminador te dice cuántos gramos se van en purga antes de imprimir.

---

```yaml
slug: maquinas/consumo-electrico
tipo: articulo
tema: maquinas
titulo: Consumo eléctrico
subtitulo: Cuánta electricidad gasta una impresora.
en_corto: Lo que más gasta es calentar la cama. Para saber tu consumo, mide con un medidor de enchufe y multiplica los kWh por el precio de tu recibo.
etiquetas: [luz, electricidad, consumo, watts, kwh, recibo, cfe, gasto de luz]
relacionadas: [negocio/costo, negocio/electricidad]
fuentes: []
publico: todos
revisado: 2026-11
```

#### Cálculo

1. Mide los watts promedio de una impresión completa con un medidor de consumo de enchufe (dan el total en kWh).
2. Si solo tienes los watts: watts × horas ÷ 1000 = kWh.
3. kWh × precio por kWh de tu recibo = costo de electricidad de esa impresión.

Ejemplo: una impresora que promedia 150 W durante 10 h gasta 1.5 kWh.

#### Qué sube el consumo

- Cama a 100 °C o más (ABS, ASA, PC, nylon).
- Impresora abierta en un cuarto frío.
- Secar filamento en la cama de la impresora (12 h).

---

```yaml
slug: maquinas/volumen-de-impresion
tipo: articulo
tema: maquinas
titulo: Volumen de impresión
subtitulo: Medida máxima de pieza en cada impresora.
en_corto: "Es la pieza más grande que sale en una sola impresión: ancho × fondo × alto. Muchas impresoras de tamaño medio dan 256 × 256 × 256 mm. Una pieza más grande se divide en partes y se une."
filtros: [chica, mediana, grande, muy-grande]
etiquetas: [volumen de impresion, build volume, tamano, medidas, medida maxima, que tan grande, cabe, area de impresion, cama grande, pieza grande, bambu, prusa, creality, elegoo, anycubic, qidi, flashforge, sovol, p1s, a1, x1c, h2d]
relacionadas: [modelos/dividir-piezas, maquinas/elegir-impresora, encargar/tamano, maquinas/cinematica]
fuentes: [bambu-lineup, bambu-a1, bambu-a2l, bambu-p2s, bambu-x2d, bambu-h2s, bambu-h2d, bambu-h2c, prusa-mk4s, prusa-core-one-l, eolas-prusa, polymaker-creality, toms-k1c, creality-k2, elegoo-n4pro, elegoo-n4max, elegoo-cc, anycubic-s1, qidi-comparativa, flashforge-ad5x, sovol-sv08]
publico: todos
revisado: 2026-11
```

**Pantalla, de arriba a abajo**

1. Ruta, título, subtítulo, «En corto».
2. **¿Cabe mi pieza?** Tres campos: ancho, fondo y alto en milímetros (o centímetros, con selector). Al escribir, la tabla marca en verde las impresoras donde cabe y dice cómo: «de pie» (tal como la escribiste) o «acostada» (girándola). Regla: la pieza cabe si alguna de sus 6 posiciones entra en ancho, fondo y alto de la impresora. Deja 5 mm de margen por lado.
3. **Filtros.** Título del bloque: «Tamaño». Chips: Todas · Chica (hasta 180 mm) · Mediana (210–270 mm) · Grande (300–350 mm) · Muy grande (más de 350 mm). El tamaño se toma de la medida más corta de la cama. Segundo grupo, «Marca»: Bambu Lab · Prusa · Creality · Elegoo · Anycubic · Qidi · Flashforge · Sovol. Interruptor: «Solo cerradas».
4. **Tabla de impresoras** (abajo). Orden inicial: por marca. Se puede ordenar por volumen.
5. **Dibujo de escala**: los contornos de una cama chica (180 mm), una mediana (256 mm) y una muy grande (420 mm), uno dentro de otro, con una lata de refresco al lado para comparar.
6. Dato curioso, Preguntas, También te puede servir, Fuentes, Llamado.

#### Tabla de impresoras

Datos para `src/data/aprende/impresoras.json`. Medidas de los fabricantes, en milímetros (ancho × fondo × alto).

```yaml
tabla: impresoras
filas:
  - marca: Bambu Lab
    modelo: "A1 mini"
    ancho_mm: 180
    fondo_mm: 180
    alto_mm: 180
    litros: 5.8
    impresora: abierta
    movimiento: cama móvil
    tamano: chica
    nota: ""
    fuentes: [bambu-lineup]
  - marca: Bambu Lab
    modelo: "A1"
    ancho_mm: 256
    fondo_mm: 256
    alto_mm: 256
    litros: 16.8
    impresora: abierta
    movimiento: cama móvil
    tamano: mediana
    nota: ""
    fuentes: [bambu-a1]
  - marca: Bambu Lab
    modelo: "A2L"
    ancho_mm: 330
    fondo_mm: 320
    alto_mm: 325
    litros: 34.3
    impresora: abierta
    movimiento: cama móvil
    tamano: grande
    nota: "Salió en junio de 2026."
    fuentes: [bambu-a2l]
  - marca: Bambu Lab
    modelo: "P1S"
    ancho_mm: 256
    fondo_mm: 256
    alto_mm: 256
    litros: 16.8
    impresora: cerrada
    movimiento: CoreXY
    tamano: mediana
    nota: ""
    fuentes: [bambu-lineup]
  - marca: Bambu Lab
    modelo: "P2S"
    ancho_mm: 256
    fondo_mm: 256
    alto_mm: 256
    litros: 16.8
    impresora: cerrada
    movimiento: CoreXY
    tamano: mediana
    nota: ""
    fuentes: [bambu-p2s]
  - marca: Bambu Lab
    modelo: "X1 Carbon"
    ancho_mm: 256
    fondo_mm: 256
    alto_mm: 256
    litros: 16.8
    impresora: cerrada
    movimiento: CoreXY
    tamano: mediana
    nota: ""
    fuentes: [bambu-lineup]
  - marca: Bambu Lab
    modelo: "X2D"
    ancho_mm: 256
    fondo_mm: 256
    alto_mm: 260
    litros: 17.0
    impresora: cerrada
    movimiento: CoreXY
    tamano: mediana
    nota: "Con las dos boquillas: 235.5 × 256 × 256 mm."
    fuentes: [bambu-x2d]
  - marca: Bambu Lab
    modelo: "H2S"
    ancho_mm: 340
    fondo_mm: 320
    alto_mm: 340
    litros: 37.0
    impresora: cerrada
    movimiento: CoreXY
    tamano: grande
    nota: ""
    fuentes: [bambu-h2s]
  - marca: Bambu Lab
    modelo: "H2D"
    ancho_mm: 325
    fondo_mm: 320
    alto_mm: 325
    litros: 33.8
    impresora: cerrada
    movimiento: CoreXY
    tamano: grande
    nota: "Con las dos boquillas: 300 × 320 × 325 mm. Entre las dos alcanzan 350 × 320 × 325 mm."
    fuentes: [bambu-h2d]
  - marca: Bambu Lab
    modelo: "H2C"
    ancho_mm: 305
    fondo_mm: 320
    alto_mm: 325
    litros: 31.7
    impresora: cerrada
    movimiento: CoreXY
    tamano: grande
    nota: "Con las dos boquillas: 300 × 320 × 325 mm. Entre las dos alcanzan 330 × 320 × 325 mm."
    fuentes: [bambu-h2c]
  - marca: Prusa
    modelo: "MINI+"
    ancho_mm: 180
    fondo_mm: 180
    alto_mm: 180
    litros: 5.8
    impresora: abierta
    movimiento: cama móvil
    tamano: chica
    nota: ""
    fuentes: [eolas-prusa]
  - marca: Prusa
    modelo: "MK4S"
    ancho_mm: 250
    fondo_mm: 210
    alto_mm: 220
    litros: 11.6
    impresora: abierta
    movimiento: cama móvil
    tamano: mediana
    nota: ""
    fuentes: [prusa-mk4s]
  - marca: Prusa
    modelo: "CORE One+"
    ancho_mm: 250
    fondo_mm: 220
    alto_mm: 270
    litros: 14.8
    impresora: cerrada
    movimiento: CoreXY
    tamano: mediana
    nota: ""
    fuentes: [prusa-core-one-l]
  - marca: Prusa
    modelo: "CORE One L"
    ancho_mm: 300
    fondo_mm: 300
    alto_mm: 330
    litros: 29.7
    impresora: cerrada
    movimiento: CoreXY
    tamano: grande
    nota: ""
    fuentes: [prusa-core-one-l]
  - marca: Prusa
    modelo: "XL"
    ancho_mm: 360
    fondo_mm: 360
    alto_mm: 360
    litros: 46.7
    impresora: abierta
    movimiento: CoreXY
    tamano: muy-grande
    nota: "Hasta 5 cabezales. Gabinete opcional."
    fuentes: [eolas-prusa]
  - marca: Creality
    modelo: "Ender-3 V3 SE"
    ancho_mm: 220
    fondo_mm: 220
    alto_mm: 250
    litros: 12.1
    impresora: abierta
    movimiento: cama móvil
    tamano: mediana
    nota: ""
    fuentes: [polymaker-creality]
  - marca: Creality
    modelo: "K1C"
    ancho_mm: 220
    fondo_mm: 220
    alto_mm: 250
    litros: 12.1
    impresora: cerrada
    movimiento: CoreXY
    tamano: mediana
    nota: ""
    fuentes: [toms-k1c]
  - marca: Creality
    modelo: "K2"
    ancho_mm: 260
    fondo_mm: 260
    alto_mm: 260
    litros: 17.6
    impresora: cerrada
    movimiento: CoreXY
    tamano: mediana
    nota: ""
    fuentes: [creality-k2]
  - marca: Creality
    modelo: "K2 Pro"
    ancho_mm: 300
    fondo_mm: 300
    alto_mm: 300
    litros: 27.0
    impresora: cerrada
    movimiento: CoreXY
    tamano: grande
    nota: ""
    fuentes: [creality-k2]
  - marca: Creality
    modelo: "K2 Plus"
    ancho_mm: 350
    fondo_mm: 350
    alto_mm: 350
    litros: 42.9
    impresora: cerrada
    movimiento: CoreXY
    tamano: grande
    nota: ""
    fuentes: [creality-k2]
  - marca: Elegoo
    modelo: "Neptune 4 Pro"
    ancho_mm: 225
    fondo_mm: 225
    alto_mm: 265
    litros: 13.4
    impresora: abierta
    movimiento: cama móvil
    tamano: mediana
    nota: ""
    fuentes: [elegoo-n4pro]
  - marca: Elegoo
    modelo: "Neptune 4 Max"
    ancho_mm: 420
    fondo_mm: 420
    alto_mm: 480
    litros: 84.7
    impresora: abierta
    movimiento: cama móvil
    tamano: muy-grande
    nota: ""
    fuentes: [elegoo-n4max]
  - marca: Elegoo
    modelo: "Centauri Carbon"
    ancho_mm: 256
    fondo_mm: 256
    alto_mm: 256
    litros: 16.8
    impresora: cerrada
    movimiento: CoreXY
    tamano: mediana
    nota: ""
    fuentes: [elegoo-cc]
  - marca: Anycubic
    modelo: "Kobra S1"
    ancho_mm: 250
    fondo_mm: 250
    alto_mm: 250
    litros: 15.6
    impresora: cerrada
    movimiento: CoreXY
    tamano: mediana
    nota: ""
    fuentes: [anycubic-s1]
  - marca: Qidi
    modelo: "Q2"
    ancho_mm: 270
    fondo_mm: 270
    alto_mm: 256
    litros: 18.7
    impresora: cerrada
    movimiento: CoreXY
    tamano: mediana
    nota: "Cámara calentada a 65 °C."
    fuentes: [qidi-comparativa]
  - marca: Qidi
    modelo: "Plus 5"
    ancho_mm: 320
    fondo_mm: 320
    alto_mm: 300
    litros: 30.7
    impresora: cerrada
    movimiento: CoreXY
    tamano: grande
    nota: "Cámara calentada a 65 °C."
    fuentes: [qidi-comparativa]
  - marca: Qidi
    modelo: "Plus4"
    ancho_mm: 305
    fondo_mm: 305
    alto_mm: 280
    litros: 26.0
    impresora: cerrada
    movimiento: CoreXY
    tamano: grande
    nota: "Ya no se fabrica."
    fuentes: [qidi-comparativa]
  - marca: Qidi
    modelo: "Max4"
    ancho_mm: 390
    fondo_mm: 390
    alto_mm: 340
    litros: 51.7
    impresora: cerrada
    movimiento: CoreXY
    tamano: muy-grande
    nota: "Cámara calentada a 65 °C."
    fuentes: [qidi-comparativa]
  - marca: Flashforge
    modelo: "AD5X"
    ancho_mm: 220
    fondo_mm: 220
    alto_mm: 220
    litros: 10.6
    impresora: abierta
    movimiento: CoreXY
    tamano: mediana
    nota: "Hasta 4 colores."
    fuentes: [flashforge-ad5x]
  - marca: Sovol
    modelo: "SV08"
    ancho_mm: 350
    fondo_mm: 350
    alto_mm: 345
    litros: 42.3
    impresora: abierta
    movimiento: CoreXY
    tamano: grande
    nota: "Con gabinete: 350 × 350 × 330 mm."
    fuentes: [sovol-sv08]
notas:
  - Medidas de la ficha de cada fabricante (noviembre de 2026).
  - La zona útil real es unos milímetros menor por la línea de purga, los clips de la placa y las orillas.
  - En impresoras de dos boquillas, la pieza que usa las dos tiene menos ancho que la de una sola boquilla.
  - Un modelo que no está en la tabla se puede agregar con los datos de la ficha de su fabricante.
```

Vista en pantalla:

| Marca | Modelo | Ancho × fondo × alto | Impresora | Notas |
|---|---|---|---|---|
| Bambu Lab | A1 mini | 180 × 180 × 180 mm | Abierta, cama móvil |  |
| Bambu Lab | A1 | 256 × 256 × 256 mm | Abierta, cama móvil |  |
| Bambu Lab | A2L | 330 × 320 × 325 mm | Abierta, cama móvil | Salió en junio de 2026. |
| Bambu Lab | P1S | 256 × 256 × 256 mm | Cerrada, CoreXY |  |
| Bambu Lab | P2S | 256 × 256 × 256 mm | Cerrada, CoreXY |  |
| Bambu Lab | X1 Carbon | 256 × 256 × 256 mm | Cerrada, CoreXY |  |
| Bambu Lab | X2D | 256 × 256 × 260 mm | Cerrada, CoreXY | Con las dos boquillas: 235.5 × 256 × 256 mm. |
| Bambu Lab | H2S | 340 × 320 × 340 mm | Cerrada, CoreXY |  |
| Bambu Lab | H2D | 325 × 320 × 325 mm | Cerrada, CoreXY | Con las dos boquillas: 300 × 320 × 325 mm. Entre las dos alcanzan 350 × 320 × 325 mm. |
| Bambu Lab | H2C | 305 × 320 × 325 mm | Cerrada, CoreXY | Con las dos boquillas: 300 × 320 × 325 mm. Entre las dos alcanzan 330 × 320 × 325 mm. |
| Prusa | MINI+ | 180 × 180 × 180 mm | Abierta, cama móvil |  |
| Prusa | MK4S | 250 × 210 × 220 mm | Abierta, cama móvil |  |
| Prusa | CORE One+ | 250 × 220 × 270 mm | Cerrada, CoreXY |  |
| Prusa | CORE One L | 300 × 300 × 330 mm | Cerrada, CoreXY |  |
| Prusa | XL | 360 × 360 × 360 mm | Abierta, CoreXY | Hasta 5 cabezales. Gabinete opcional. |
| Creality | Ender-3 V3 SE | 220 × 220 × 250 mm | Abierta, cama móvil |  |
| Creality | K1C | 220 × 220 × 250 mm | Cerrada, CoreXY |  |
| Creality | K2 | 260 × 260 × 260 mm | Cerrada, CoreXY |  |
| Creality | K2 Pro | 300 × 300 × 300 mm | Cerrada, CoreXY |  |
| Creality | K2 Plus | 350 × 350 × 350 mm | Cerrada, CoreXY |  |
| Elegoo | Neptune 4 Pro | 225 × 225 × 265 mm | Abierta, cama móvil |  |
| Elegoo | Neptune 4 Max | 420 × 420 × 480 mm | Abierta, cama móvil |  |
| Elegoo | Centauri Carbon | 256 × 256 × 256 mm | Cerrada, CoreXY |  |
| Anycubic | Kobra S1 | 250 × 250 × 250 mm | Cerrada, CoreXY |  |
| Qidi | Q2 | 270 × 270 × 256 mm | Cerrada, CoreXY | Cámara calentada a 65 °C. |
| Qidi | Plus 5 | 320 × 320 × 300 mm | Cerrada, CoreXY | Cámara calentada a 65 °C. |
| Qidi | Plus4 | 305 × 305 × 280 mm | Cerrada, CoreXY | Ya no se fabrica. |
| Qidi | Max4 | 390 × 390 × 340 mm | Cerrada, CoreXY | Cámara calentada a 65 °C. |
| Flashforge | AD5X | 220 × 220 × 220 mm | Abierta, CoreXY | Hasta 4 colores. |
| Sovol | SV08 | 350 × 350 × 345 mm | Abierta, CoreXY | Con gabinete: 350 × 350 × 330 mm. |

> **Dato curioso.** En una cama de 256 × 256 mm, una pieza delgada acostada en diagonal puede medir casi 36 cm. En la práctica, un poco menos por los márgenes.

> **Dato curioso.** La Elegoo Neptune 4 Max tiene unos 85 litros de volumen de impresión; una Bambu Lab A1 mini o una Prusa MINI+, 5.8 litros. Es casi 15 veces más espacio.

#### Preguntas

- **¿Qué pasa si mi pieza no cabe?** Se divide en partes que se unen con clavijas, cola de milano o tornillos, y se pegan. Ver Dividir piezas.
- **¿Puedo usar toda la cama?** Casi toda. La línea de purga, los clips de la placa y la orilla le quitan unos milímetros. El laminador marca la zona útil.
- **¿Por qué con dos boquillas la medida es menor?** Cada boquilla está a un lado del cabezal. Para que las dos lleguen a todos los puntos de la pieza, se pierde un poco de ancho.
- **¿Cómo sé la medida de mi impresora?** En la ficha del fabricante, en el perfil de la impresora dentro del laminador o en esta tabla.
- **¿Conviene una impresora más grande?** Solo si vas a imprimir piezas grandes seguido. Una cama grande tarda más en calentar y gasta más electricidad. Para muchas piezas medianas, dos impresoras medianas sacan más trabajo que una grande.
- **¿La altura cuenta igual?** Sí. Una pieza alta y delgada a veces cabe mejor acostada; cambia la resistencia y los soportes. Ver Orientación de la pieza.

---

```yaml
slug: maquinas/elegir-impresora
tipo: articulo
tema: maquinas
titulo: Elegir impresora
subtitulo: Qué revisar antes de comprar, para casa o para taller.
en_corto: Para vender piezas importa que sea confiable, que tenga refacciones donde vives y que imprima los materiales que te piden. La velocidad viene después.
etiquetas: [comprar, cual comprar, recomendacion, primera impresora, para negocio, bambu, prusa, creality]
relacionadas: [maquinas/volumen-de-impresion, maquinas/cinematica, maquinas/abierta-o-cerrada, maquinas/multicolor]
fuentes: []
publico: todos
revisado: 2026-11
```

| Criterio | Pregunta |
|---|---|
| Materiales | ¿Necesito ABS, ASA o nylon? Entonces, cerrada. |
| Tamaño | ¿Cuál es la pieza más grande que voy a imprimir? (ver Volumen de impresión) |
| Colores | ¿Voy a imprimir en varios colores? Entonces, con cambiador de rollos. |
| Refacciones | ¿Venden boquillas, placas y bandas donde vivo? ¿En cuántos días llegan? |
| Programa | ¿El laminador es gratis y está en español? |
| Monitoreo | ¿Tiene cámara y aviso al celular? |
| Comunidad | ¿Hay guías y videos para repararla? |
| Ruido | ¿Dónde va a estar? |
| Granja | Si voy a tener varias, ¿se pueden mandar trabajos a todas desde un programa? |

> **Truco.** Para un taller, dos impresoras iguales rinden más que dos distintas: comparten refacciones, perfiles y placas.

---

```yaml
slug: maquinas/donde-ponerla
tipo: articulo
tema: maquinas
titulo: Dónde poner la impresora
subtitulo: Lugar, mesa, ventilación y electricidad.
en_corto: Sobre una mesa firme, lejos de corrientes de aire y del sol directo, en un cuarto ventilado y lejos de cosas que se quemen.
etiquetas: [donde poner, mesa, cuarto, ventilacion, no break, ups, regulador, corte de luz]
relacionadas: [seguridad/emisiones, seguridad/incendio, problemas/esquinas-levantadas]
fuentes: [ul-top10]
publico: todos
revisado: 2026-11
```

- Mesa firme que no se mueva con la impresora.
- Lejos de ventanas abiertas, ventiladores y aire acondicionado.
- Sin sol directo sobre la impresora ni sobre los rollos.
- Cuarto ventilado, que no sea donde duermes.
- Lejos de cortinas, papel y solventes.
- Detector de humo en el cuarto.
- No-break (UPS) o regulador: un corte de electricidad a media impresión puede tirar el trabajo. Algunas impresoras retoman donde se quedaron.

---

## 6. Laminado

### 6.1 Pantalla del tema: Laminado

```yaml
slug: laminado
tipo: seccion
tema: laminado
titulo: Laminado
subtitulo: Ajustes del laminador y qué cambia cada uno.
en_corto: El laminador convierte el modelo en capas y le dice a la impresora cómo moverse. Los ajustes que más cambian una pieza son la altura de capa, las paredes, el relleno, los soportes y la orientación.
filtros: [basicos, resistencia, acabado, soportes]
etiquetas: [laminador, slicer, laminar, bambu studio, orca slicer, orcaslicer, prusaslicer, cura, ajustes, perfil, configuracion]
relacionadas: [laminado/resistencia, laminado/soportes, laminado/orientacion]
fuentes: [prusa-boquillas, prusa-diseno]
publico: todos
revisado: 2026-11
```

**Pantalla, de arriba a abajo**

1. Ruta, título, subtítulo, «En corto».
2. **Filtros** (chips): Básicos · Resistencia · Acabado · Soportes.
3. **Tabla «Ajustes y efecto»** (abajo).
4. Lista de artículos del tema.
5. Dato curioso, Preguntas, También te puede servir, Fuentes, Llamado.

#### Ajustes y efecto

| Ajuste | Más alto | Más bajo |
|---|---|---|
| Altura de capa | Más rápido, capas visibles | Más detalle, más tiempo |
| Paredes | Pieza más fuerte | Más rápido, menos material |
| Relleno | Más fuerte y pesada | Más ligera y rápida |
| Velocidad | Menos tiempo | Mejor acabado en voladizos y detalles |
| Temperatura de boquilla | Mejor unión entre capas, más hilos | Menos hilos, capas que se separan |
| Ventilador de capa | Mejores voladizos (PLA) | Mejor unión entre capas (ABS, ASA) |

> **Dato curioso.** Bambu Studio y OrcaSlicer vienen de PrusaSlicer, que a su vez viene de Slic3r. Por eso muchos ajustes se llaman igual en los tres.

#### Preguntas

- **¿Qué laminador uso?** El de la marca de tu impresora: Bambu Studio, PrusaSlicer, Creality Print. OrcaSlicer y UltiMaker Cura funcionan con muchas marcas. Todos son gratis.
- **¿Puedo usar el perfil de otra impresora?** No. Cada perfil tiene medidas, velocidades y límites de su máquina.

---

```yaml
slug: laminado/archivos
tipo: articulo
tema: laminado
titulo: Tipos de archivo
subtitulo: STL, 3MF, OBJ, STEP y G-code.
en_corto: STL es solo la forma. 3MF guarda la forma, los colores, los ajustes y las placas. STEP es el archivo de diseño con medidas exactas. G-code son las instrucciones ya laminadas para una impresora.
etiquetas: [stl, 3mf, obj, step, stp, gcode, g-code, archivo, formato]
relacionadas: [modelos/donde-encontrar, encargar/cotizar]
fuentes: []
publico: todos
revisado: 2026-11
```

| Archivo | Guarda | Se edita en | Notas |
|---|---|---|---|
| STL | Solo la forma, en triángulos | Programas de malla | El más común para descargar |
| 3MF | Forma, colores, ajustes, placas | Laminador | Recomendado para compartir proyectos |
| OBJ | Forma y color o textura | Programas de malla | Común en escaneos |
| STEP | Forma con medidas exactas | Programas de diseño (CAD) | El mejor para modificar piezas técnicas |
| G-code | Instrucciones para una impresora | No se edita | Solo sirve en la impresora y el material para los que se laminó |

---

```yaml
slug: laminado/altura-de-capa
tipo: articulo
tema: laminado
titulo: Altura de capa
subtitulo: Detalle contra tiempo.
en_corto: 0.2 mm es la estándar con boquilla de 0.4. Capas más finas (0.08–0.12 mm) dan más detalle y tardan más. Nunca más del 80 % del diámetro de la boquilla.
etiquetas: [altura de capa, layer height, capa, resolucion, calidad, 0.2, 0.1, 0.12, 0.16, 0.28]
relacionadas: [maquinas/boquillas, laminado/velocidad]
fuentes: [prusa-boquillas]
publico: todos
revisado: 2026-11
```

| Capa | Uso |
|---|---|
| 0.08–0.12 mm | Figuras con detalle, caras, texto pequeño |
| 0.16 mm | Equilibrio entre detalle y tiempo |
| 0.20 mm | Estándar |
| 0.24–0.28 mm | Prototipos, piezas que no se ven |

> **Truco.** Altura de capa variable: el laminador pone capas finas solo donde hay curvas o detalle y gruesas en lo recto.

---

```yaml
slug: laminado/paredes
tipo: articulo
tema: laminado
titulo: Paredes
subtitulo: Perímetros o contornos.
en_corto: Son las líneas del contorno de cada capa. Subir de 2 a 3 o 4 paredes hace una pieza más fuerte que subir mucho el relleno.
etiquetas: [paredes, perimetros, walls, contornos, loops, grosor de pared]
relacionadas: [laminado/relleno, laminado/resistencia]
fuentes: [prusa-diseno]
publico: todos
revisado: 2026-11
```

| Pieza | Paredes |
|---|---|
| Decoración | 2 |
| Uso diario | 3 |
| Mecánica, con tornillos o carga | 4 o más |

---

```yaml
slug: laminado/relleno
tipo: articulo
tema: laminado
titulo: Relleno
subtitulo: Porcentaje y patrón.
en_corto: 10–15 % para figuras, 20–40 % para piezas de uso. El patrón giroide reparte la fuerza en todas direcciones; el de relámpago solo sostiene la tapa y ahorra material.
etiquetas: [relleno, infill, porcentaje, patron, giroide, gyroid, rejilla, grid, panal, honeycomb, relampago, lightning, cubico]
relacionadas: [laminado/paredes, laminado/resistencia, negocio/costo]
fuentes: []
publico: todos
revisado: 2026-11
```

#### Porcentaje

| Pieza | Relleno |
|---|---|
| Figura, decoración | 5–15 % |
| Uso diario | 15–25 % |
| Mecánica | 30–50 % |
| Pieza que se va a lijar o atornillar en todo su cuerpo | 50–100 % |

#### Patrones

| Patrón | Uso |
|---|---|
| Rejilla (grid) | General; rápido |
| Giroide (gyroid) | Fuerza pareja en todas direcciones; buen uso con TPU |
| Cúbico | Piezas funcionales |
| Panal (honeycomb) | Rígido, más lento |
| Relámpago (lightning) | Figuras: solo sostiene las capas de arriba |
| Concéntrico | Piezas flexibles de TPU |

---

```yaml
slug: laminado/soportes
tipo: articulo
tema: laminado
titulo: Soportes
subtitulo: Normales, de árbol y de interfaz.
en_corto: Los voladizos de más de 45° (medidos desde la vertical) necesitan soporte. Los de árbol gastan menos y se quitan mejor en figuras. Los normales son mejores para superficies planas grandes.
etiquetas: [soportes, supports, arbol, tree, organicos, voladizo, overhang, interfaz, distancia z]
relacionadas: [acabado/quitar-soportes, filamentos/soportes, laminado/orientacion, modelos/reglas-de-diseno]
fuentes: [prusa-diseno]
publico: todos
revisado: 2026-11
```

| Tipo | Usos | Quitar |
|---|---|---|
| Normal (rejilla) | Superficies planas grandes, piezas técnicas | Puede dejar marcas |
| Árbol (orgánico) | Figuras, brazos, salientes | Más fácil |
| Interfaz soluble o de otro material | Superficies que deben quedar limpias | Se disuelve o se despega |

Ajustes clave:

- **Ángulo límite:** a partir de qué inclinación pone soporte (45° es lo común).
- **Distancia Z:** espacio entre el soporte y la pieza. Más espacio, más fácil de quitar y peor cara inferior.
- **Solo sobre la cama:** evita que el soporte nazca encima de la pieza.

> **Truco.** Antes de poner soportes, prueba girar la pieza. Muchas piezas dejan de necesitarlos con otra orientación.

---

```yaml
slug: laminado/borde
tipo: articulo
tema: laminado
titulo: Borde y orejas
subtitulo: Brim y brim ears.
en_corto: El borde es una falda de una capa alrededor de la pieza que aumenta la superficie pegada a la cama. Las orejas son discos solo en las esquinas. Sirven contra esquinas levantadas.
etiquetas: [borde, brim, orejas, brim ears, mouse ears, falda, skirt, raft, balsa]
relacionadas: [problemas/esquinas-levantadas, problemas/primera-capa]
fuentes: [bambu-orejas, bambu-warping]
publico: todos
revisado: 2026-11
```

| Opción | Cuándo |
|---|---|
| Borde (brim) | Piezas con poca base, ABS, ASA, PC, piezas altas |
| Orejas (brim ears) | Esquinas que se levantan; deja menos marca que el borde completo |
| Falda (skirt) | Línea separada de la pieza; solo limpia la boquilla antes de empezar |
| Balsa (raft) | Base completa bajo la pieza; casi no se usa con camas de PEI |

---

```yaml
slug: laminado/orientacion
tipo: articulo
tema: laminado
titulo: Orientación de la pieza
subtitulo: Cómo acomodarla en la cama.
en_corto: Las capas son el punto débil. Acomoda la pieza para que la fuerza vaya a lo largo de las capas, con la cara plana más grande sobre la cama y con el menor número de voladizos.
etiquetas: [orientacion, girar, acomodar, posicion, como poner la pieza]
relacionadas: [laminado/resistencia, laminado/soportes]
fuentes: [bambu-guia, prusa-diseno]
publico: todos
revisado: 2026-11
```

Reglas, en este orden:

1. ¿Dónde va a recibir fuerza? Que esa fuerza no separe capas.
2. La cara plana más grande, abajo.
3. Menos voladizos = menos soportes.
4. La cara que se va a ver, lejos de los soportes.
5. Agujeros redondos de pie (vertical) salen más redondos que acostados.

> **Dato curioso.** En las pruebas de Bambu Lab, el PLA aguanta 26.6 kJ/m² de impacto a lo largo de las capas y 13.8 kJ/m² entre capas: casi la mitad.

---

```yaml
slug: laminado/velocidad
tipo: articulo
tema: laminado
titulo: Velocidad
subtitulo: Límites por material.
en_corto: Cada material tiene un límite. Más rápido de lo que el hotend puede derretir da falta de material y piezas débiles.
etiquetas: [velocidad, speed, rapido, lento, mm/s, flujo volumetrico, aceleracion]
relacionadas: [problemas/falta-material, problemas/capas-desplazadas]
fuentes: [bambu-guia]
publico: talleres
revisado: 2026-11
```

| Material | Velocidad máxima (guía de Bambu Lab) |
|---|---|
| PLA | 300 mm/s |
| ABS, ASA, PC | 300 mm/s |
| PLA-CF | 250 mm/s |
| PETG, PETG-CF | 200 mm/s |
| PET-CF, PA-CF | 100 mm/s |
| TPU 95A | 80 mm/s |

El límite real lo pone el flujo: cuántos milímetros cúbicos por segundo derrite el hotend. Los perfiles de cada filamento ya lo traen.

---

```yaml
slug: laminado/enfriamiento
tipo: articulo
tema: laminado
titulo: Enfriamiento
subtitulo: Ventilador de capa por material.
en_corto: PLA, con el ventilador alto. PETG, medio. ABS y ASA, bajo o apagado, porque el aire frío separa las capas.
etiquetas: [ventilador, enfriamiento, cooling, fan, ventilador de capa]
relacionadas: [problemas/capas-separadas, filamentos/abs]
fuentes: [prusa-capas]
publico: talleres
revisado: 2026-11
```

| Material | Ventilador de capa |
|---|---|
| PLA, PLA-CF | Alto |
| PETG | Medio |
| TPU | Medio |
| ABS, ASA, PC, PA | Bajo o apagado |

---

```yaml
slug: laminado/retraccion
tipo: articulo
tema: laminado
titulo: Retracción
subtitulo: Contra hilos y gotas.
en_corto: Antes de moverse de un punto a otro, la impresora jala un poco el filamento hacia atrás para que no gotee. Si hay hilos, primero seca el filamento y baja la temperatura; después ajusta la retracción.
etiquetas: [retraccion, retraction, hilos, stringing, z hop, levantar z]
relacionadas: [problemas/hilos, filamentos/secado]
fuentes: [prusa-hilos]
publico: talleres
revisado: 2026-11
```

- **Distancia:** cuánto jala. En extrusores directos suele ser de 0.5 a 2 mm; en Bowden (tubo largo), más.
- **Velocidad:** qué tan rápido jala. Muy alta puede saltar pasos del motor.
- **Levantar Z (Z hop):** sube la boquilla al moverse. Evita choques, pero puede aumentar los hilos.
- **Evitar cruzar perímetros:** hace que la boquilla viaje por dentro de la pieza.

---

```yaml
slug: laminado/costura
tipo: articulo
tema: laminado
titulo: Costura
subtitulo: Dónde empieza cada capa.
en_corto: Cada capa empieza y termina en un punto, y esos puntos forman una línea visible llamada costura. Se puede alinear, esconder en una esquina, mandar atrás o repartir al azar.
etiquetas: [costura, seam, z seam, linea, cicatriz, marca vertical]
relacionadas: [problemas/marcas-en-paredes, acabado/lijado]
fuentes: []
publico: talleres
revisado: 2026-11
```

| Opción | Resultado |
|---|---|
| Alineada | Una línea recta; fácil de lijar |
| Más cercana o en esquina | Se esconde en esquinas |
| Atrás | En la cara que no se ve |
| Aleatoria | Puntos repartidos; no hay línea pero toda la superficie queda con granitos |

---

```yaml
slug: laminado/planchado
tipo: articulo
tema: laminado
titulo: Planchado
subtitulo: "Ironing: tapas lisas."
en_corto: La boquilla pasa otra vez sobre la última capa casi sin sacar plástico para alisarla. Deja tapas planas casi sin líneas y agrega tiempo.
etiquetas: [planchado, ironing, alisar, tapa lisa, superficie superior]
relacionadas: [acabado/lijado, laminado/costura]
fuentes: []
publico: talleres
revisado: 2026-11
```

Úsalo en placas, letreros y tapas. No sirve en superficies curvas.

---

```yaml
slug: laminado/resistencia
tipo: articulo
tema: laminado
titulo: Piezas más resistentes
subtitulo: Qué ajustar, en orden de efecto.
en_corto: Orientación primero, luego paredes, luego material, luego relleno. Subir el relleno al 100 % es lo que menos rinde por gramo.
etiquetas: [resistente, fuerte, se rompe, mas fuerte, resistencia, aguante]
relacionadas: [laminado/orientacion, laminado/paredes, filamentos]
fuentes: [bambu-guia, prusa-boquillas]
publico: todos
revisado: 2026-11
```

1. **Orientación:** que la fuerza no separe capas.
2. **Paredes:** 3 o 4.
3. **Material:** PETG, PC o nylon según la tabla de Filamentos.
4. **Boquilla más grande:** 0.6 mm da líneas más gruesas y piezas más fuertes.
5. **Temperatura:** en la parte alta del rango del material, para mejor unión entre capas.
6. **Relleno:** 25–40 % con giroide o cúbico.
7. **Filamento seco.**

---
## 7. Cuando algo sale mal

### 7.1 Pantalla del tema: Cuando algo sale mal

```yaml
slug: problemas
tipo: seccion
tema: problemas
titulo: Cuando algo sale mal
subtitulo: Fallas comunes, ordenadas por cómo se ven en la pieza.
en_corto: "La mayoría de las fallas vienen de tres cosas: cama sucia, filamento húmedo o boquilla a mala altura. Revisa esas tres antes de cambiar ajustes."
filtros: [primera-capa, durante, superficie, resistencia, atascos]
etiquetas: [problema, falla, error, sale mal, no imprime, defecto, ayuda]
relacionadas: [problemas/primera-capa, problemas/hilos, problemas/esquinas-levantadas, mantenimiento/calendario]
fuentes: [prusa-primera-capa, prusa-hilos, bambu-warping, bcn3d-desplazamiento]
publico: todos
revisado: 2026-11
```

**Pantalla, de arriba a abajo**

1. Ruta, título, subtítulo, «En corto».
2. **Filtros** (chips por síntoma):

| Chip | Problemas |
|---|---|
| Primera capa | Se despega la primera capa · Pie de elefante |
| Durante la impresión | Esquinas levantadas · La pieza se cae · Espagueti · Capas desplazadas |
| Superficie | Hilos · Marcas en las paredes · Soportes pegados |
| Resistencia | Capas separadas · Falta material |
| Atascos | Boquilla tapada · Filamento roto · Filamento húmedo |

3. **Lista de problemas**: cada renglón con una foto chica de cómo se ve y el título. La foto es lo primero que se lee.
4. **Revisión de 3 minutos** (bloque fijo, antes de la lista):
   1. ¿La cama está limpia? Lávala con agua y jabón.
   2. ¿El filamento está seco? Si truena, sécalo.
   3. ¿En el laminador está la placa y el material correctos?
5. Dato curioso, Preguntas, Llamado («¿No encuentras tu problema? Mándanos foto por WhatsApp»).

Cada página de problema lleva: «En corto» · Cómo se ve · Causas (de la más común a la menos común) · Qué hacer (pasos) · Para que no se repita · Preguntas.

> **Dato curioso.** Los pañuelos faciales con crema o suavizante dejan una capa en la cama que hace que la pieza no pegue. Para limpiar, papel sin aroma o un trapo sin pelusa.

#### Preguntas

- **¿Mando foto?** Sí. Por WhatsApp, con la pieza de lado y de abajo, y el nombre del material y la impresora.
- **¿Cambio varios ajustes a la vez?** No. Cambia uno, imprime una prueba chica y compara.

---

```yaml
slug: problemas/primera-capa
tipo: problema
tema: problemas
titulo: ¿Por qué se despega la primera capa?
subtitulo: La pieza no pega, se mueve o se arrastra con la boquilla.
en_corto: Casi siempre es la cama sucia, la altura de la boquilla o la temperatura de la cama. Empieza por lavar la placa con agua tibia y jabón de trastes.
filtros: [primera-capa]
etiquetas: [no pega, se despega, adhesion, primera capa, cama, base, no se pega, se mueve, first layer]
relacionadas: [mantenimiento/cama, problemas/esquinas-levantadas, maquinas/placas]
fuentes: [prusa-primera-capa, bambu-warping]
publico: todos
revisado: 2026-11
```

#### Cómo se ve

- Las líneas no se aplastan; se ven redondas y separadas.
- La boquilla arrastra el plástico.
- La pieza se despega en las primeras capas.

#### Causas

1. Grasa de los dedos en la placa.
2. Boquilla muy alta (no aplasta) o muy baja (no deja salir plástico).
3. En el laminador está otra placa seleccionada.
4. Cama fría para ese material.
5. Primera capa demasiado rápida.
6. Placa dispareja o gastada.
7. Boquilla parcialmente tapada.

#### Qué hacer

1. Lava la placa con unas gotas de jabón de trastes y agua tibia (no caliente). Sécala con papel sin aroma.
2. Entre impresiones, limpia con alcohol isopropílico.
3. Revisa que la placa del laminador sea la que tienes puesta.
4. Sube la cama 5–10 °C dentro del rango del material.
5. Baja la velocidad de las primeras capas (por ejemplo, al 75 %).
6. Calibra la altura de la boquilla (o corre la calibración automática).
7. Para PETG, ABS, ASA, nylon y TPU, usa pegamento en barra.
8. Agrega borde (brim) en piezas con poca base.

#### Para que no se repita

- No toques la placa con los dedos.
- Lava la placa con agua y jabón cada vez que la adherencia baje.

> **Cuidado.** No bajes la boquilla de más para que pegue: puede rayar la placa y hacer vibrar la impresora.

#### Preguntas

- **¿Puedo limpiar con acetona?** Solo la placa de PEI liso, y a lo mucho una vez al mes. En PEI texturizado o satinado, nunca.
- **¿Sirve cualquier pegamento en barra?** Sí. No hace falta uno especial para impresión 3D.

---

```yaml
slug: problemas/esquinas-levantadas
tipo: problema
tema: problemas
titulo: ¿Por qué se levantan las esquinas?
subtitulo: "Warping: la base se curva hacia arriba."
en_corto: El plástico se encoge al enfriarse y jala las esquinas. Sube la cama, quita corrientes de aire, cierra la impresora y usa borde u orejas.
filtros: [durante]
etiquetas: [warping, se levanta, esquinas, se curva, se dobla, se deforma, despega esquinas]
relacionadas: [laminado/borde, maquinas/abierta-o-cerrada, problemas/primera-capa]
fuentes: [bambu-warping, prusa-capas]
publico: todos
revisado: 2026-11
```

#### Cómo se ve

Las esquinas o las orillas se despegan de la cama y la base queda curva.

#### Causas

1. Cama fría o placa sucia.
2. Corrientes de aire, ventilador de capa alto o puerta abierta.
3. Material que se encoge mucho (ABS, ASA, PC, nylon) en impresora abierta.
4. Pieza con esquinas en punta y mucha base.
5. Sin borde o con borde angosto.

#### Qué hacer

1. Lava la placa.
2. Sube la cama dentro del rango del material.
3. Cierra la puerta y la tapa (con ABS, ASA, PC y nylon).
4. Baja el ventilador de capa.
5. Agrega borde y súbele el ancho, u orejas en las esquinas.
6. Pon pegamento en barra parejo sobre la placa.

#### Para que no se repita

En el diseño, redondea las esquinas de la base o agrega un chaflán.

---

```yaml
slug: problemas/hilos
tipo: problema
tema: problemas
titulo: ¿Por qué salen hilos entre las partes de la pieza?
subtitulo: "Stringing: telarañas entre partes separadas."
en_corto: Filamento húmedo o boquilla muy caliente. Sécalo y baja la temperatura 5–10 °C antes de mover la retracción.
filtros: [superficie]
etiquetas: [hilos, telaraña, stringing, pelos, hebras, babas, oozing, gotea]
relacionadas: [filamentos/secado, laminado/retraccion, filamentos/petg]
fuentes: [prusa-hilos]
publico: todos
revisado: 2026-11
```

#### Causas

1. Filamento húmedo.
2. Boquilla muy caliente.
3. Retracción corta o lenta.
4. Viajes que cruzan la pieza por fuera.
5. Restos de material quemado en la boquilla.

#### Qué hacer

1. Seca el filamento (o prueba con otro rollo para descartar).
2. Baja la boquilla 5–10 °C.
3. Activa «Evitar cruzar perímetros».
4. Revisa la retracción del perfil del material.
5. Limpia la boquilla por fuera.
6. Los hilos finos se quitan con una pistola de calor, pasándola rápido.

> **Truco.** Imprime una «prueba de hilos» (dos torres separadas). Tarda minutos y te dice si el cambio sirvió.

---

```yaml
slug: problemas/boquilla-tapada
tipo: problema
tema: problemas
titulo: ¿Qué hago si se tapa la boquilla?
subtitulo: No sale plástico o sale muy poco.
en_corto: Calienta la boquilla y empuja filamento a mano. Si no sale, haz una limpieza en frío. Si sigue tapada, cambia la boquilla.
filtros: [atascos]
etiquetas: [tapada, atasco, obstruida, no sale, clog, extrusor truena, clic, salta el extrusor]
relacionadas: [mantenimiento/limpieza-en-frio, mantenimiento/boquilla, problemas/falta-material]
fuentes: [bambu-mantenimiento]
publico: todos
revisado: 2026-11
```

#### Cómo se ve

- No sale plástico o sale delgado.
- El extrusor hace clic (los engranes patinan).
- La impresión se detiene a media pieza.

#### Causas

1. Restos de un material de más temperatura (por ejemplo, PETG después de PLA).
2. Calor que sube al extrusor (PLA en impresora cerrada y caliente).
3. Partículas de filamentos con efecto o polvo.
4. Boquilla demasiado cerca de la cama en la primera capa.
5. Filamento de mala calidad o con diámetro irregular.

#### Qué hacer

1. Calienta la boquilla a la temperatura del último material que usaste.
2. Empuja filamento a mano. Si sale, deja que salgan unos centímetros.
3. Si no sale: limpieza en frío (ver Mantenimiento).
4. Si sigue igual: cambia la boquilla o el hotend.

> **Cuidado.** La boquilla está a más de 200 °C. Usa pinzas y no la toques con los dedos.

---

```yaml
slug: problemas/capas-desplazadas
tipo: problema
tema: problemas
titulo: ¿Por qué se recorren las capas?
subtitulo: "Layer shift: la pieza parece cortada y movida de lado."
en_corto: La impresora perdió pasos. Las causas comunes son bandas flojas, velocidad alta o la boquilla chocando con una parte levantada de la pieza.
filtros: [durante]
etiquetas: [capas desplazadas, layer shift, se recorre, escalon, chueca, movida, desfase]
relacionadas: [mantenimiento/bandas, problemas/esquinas-levantadas, laminado/velocidad]
fuentes: [bcn3d-desplazamiento]
publico: todos
revisado: 2026-11
```

#### Causas

1. Bandas flojas o desalineadas.
2. Velocidad o aceleración muy altas.
3. La boquilla chocó con una esquina levantada o con una gota de plástico.
4. Algo estorba el movimiento: un cable, el rollo, la orilla de la mesa.
5. Motor o tarjeta calientes.
6. Polea floja en el eje del motor.

#### Qué hacer

1. Revisa si el desplazamiento es en X o en Y.
2. Tensa las bandas según la guía de tu impresora.
3. Baja velocidad y aceleración de viajes.
4. Activa «Levantar Z» para que la boquilla no arrastre la pieza.
5. Corrige las esquinas levantadas.
6. Revisa que nada toque la impresora al moverse.

---

```yaml
slug: problemas/falta-material
tipo: problema
tema: problemas
titulo: ¿Por qué sale con huecos o con falta de material?
subtitulo: "Subextrusión: líneas delgadas, huecos entre paredes."
en_corto: "Sale menos plástico del que debería. Revisa en este orden: filamento húmedo, boquilla tapada o gastada, velocidad más alta de lo que derrite el hotend, engranes del extrusor sucios."
filtros: [resistencia]
etiquetas: [falta material, huecos, subextrusion, under extrusion, lineas delgadas, porosa, debil]
relacionadas: [problemas/boquilla-tapada, filamentos/boquilla-endurecida, laminado/velocidad]
fuentes: [bambu-mantenimiento]
publico: todos
revisado: 2026-11
```

#### Causas

1. Filamento húmedo.
2. Boquilla parcialmente tapada.
3. Boquilla de latón gastada por filamento con fibra.
4. Velocidad más alta de lo que derrite el hotend.
5. Temperatura baja para ese material.
6. Engranes del extrusor sucios o gastados.
7. Rollo enredado o que gira con dificultad.
8. Diámetro equivocado en el perfil.

#### Qué hacer

Revisa una causa a la vez, en el orden de la lista. Limpia los engranes del extrusor con aire comprimido.

---

```yaml
slug: problemas/capas-separadas
tipo: problema
tema: problemas
titulo: ¿Por qué se separan las capas?
subtitulo: Grietas entre capas, sobre todo en ABS.
en_corto: Las capas se enfrían antes de pegarse. Apaga el ventilador con ABS, cierra la impresora, sube la temperatura 5 °C.
filtros: [resistencia]
etiquetas: [capas separadas, grietas, se abre, delaminacion, se parte, se rompe entre capas]
relacionadas: [laminado/enfriamiento, filamentos/abs, maquinas/abierta-o-cerrada]
fuentes: [prusa-capas]
publico: todos
revisado: 2026-11
```

#### Causas

1. Aire frío sobre la pieza (corrientes, ventilador de capa).
2. Temperatura de boquilla baja.
3. Poco flujo.
4. Filamento húmedo.

#### Qué hacer

1. Con ABS, apaga el ventilador de capa.
2. Cierra la impresora; ABS se imprime en cámara cerrada.
3. Sube la boquilla en pasos de 5 °C.
4. Sube el flujo en pasos de 5 %.
5. Si la pieza tiene que aguantar golpes y no tienes impresora cerrada, cambia a PETG o ASA.

---

```yaml
slug: problemas/pieza-se-cae
tipo: problema
tema: problemas
titulo: ¿Por qué se cae la pieza a media impresión?
subtitulo: Piezas altas y delgadas que se tambalean o se despegan.
en_corto: Las piezas altas y delgadas se mueven con la boquilla. Agrega soportes o borde, baja velocidad y aceleración, o acuéstala o divídela.
filtros: [durante]
etiquetas: [se cae, se tumba, se despega a media, pieza alta, delgada, tambalea]
relacionadas: [laminado/orientacion, laminado/borde, modelos/dividir-piezas]
fuentes: [bambu-warping]
publico: todos
revisado: 2026-11
```

#### Qué hacer

1. Acuesta la pieza si la forma lo permite.
2. Agrega borde ancho.
3. Activa soportes que la sostengan de los lados.
4. Baja velocidad y aceleración.
5. Divide la pieza y únela después.

---

```yaml
slug: problemas/espagueti
tipo: problema
tema: problemas
titulo: ¿Por qué salió un nido de hilos?
subtitulo: "Espagueti: la impresora siguió imprimiendo al aire."
en_corto: La pieza se despegó o le faltó soporte, y la impresora siguió sacando plástico. Arregla la adherencia y revisa los soportes. Si tu impresora tiene cámara con detección de espagueti, actívala.
filtros: [durante]
etiquetas: [espagueti, spaghetti, nido, maraña, bola de hilos, imprimio al aire]
relacionadas: [problemas/primera-capa, laminado/soportes, problemas/pieza-se-cae]
fuentes: []
publico: todos
revisado: 2026-11
```

> **Cuidado.** Si la maraña cubre la boquilla, el plástico puede llegar al hotend. Apaga, deja enfriar y retíralo con cuidado antes de seguir.

---

```yaml
slug: problemas/filamento-humedo
tipo: problema
tema: problemas
titulo: ¿Por qué truena el filamento?
subtitulo: Chasquidos y burbujas al salir de la boquilla.
en_corto: "Está húmedo. El agua hierve dentro de la boquilla. No subas la temperatura: sécalo."
filtros: [atascos]
etiquetas: [truena, chasquidos, burbujas, humedo, vapor, crepita]
relacionadas: [filamentos/secado, filamentos/guardado]
fuentes: [bambu-tabla]
publico: todos
revisado: 2026-11
```

Ver la tabla de temperaturas en Filamentos › Secado.

---

```yaml
slug: problemas/pie-de-elefante
tipo: problema
tema: problemas
titulo: ¿Por qué la base sale más ancha?
subtitulo: Pie de elefante.
en_corto: Las primeras capas se aplastan de más. Sube un poco la boquilla, baja la cama dentro del rango del material o activa la compensación de pie de elefante en el laminador.
filtros: [primera-capa]
etiquetas: [pie de elefante, elephant foot, base ancha, primera capa ancha, rebaba abajo]
relacionadas: [problemas/primera-capa, modelos/reglas-de-diseno]
fuentes: []
publico: todos
revisado: 2026-11
```

En el diseño, un chaflán de 0.5 mm en la orilla de la base lo disimula.

---

```yaml
slug: problemas/soportes-pegados
tipo: problema
tema: problemas
titulo: ¿Por qué no salen los soportes?
subtitulo: Soportes fundidos con la pieza.
en_corto: Hay poco espacio entre el soporte y la pieza. Sube la distancia Z del soporte, usa soporte de árbol o un material de interfaz.
filtros: [superficie]
etiquetas: [soportes pegados, no salen, no se quitan, soporte fundido]
relacionadas: [laminado/soportes, acabado/quitar-soportes, filamentos/soportes]
fuentes: []
publico: todos
revisado: 2026-11
```

---

```yaml
slug: problemas/filamento-roto
tipo: problema
tema: problemas
titulo: ¿Por qué se rompe el filamento en el tubo?
subtitulo: El filamento se quiebra antes de llegar a la boquilla.
en_corto: PLA húmedo o viejo se vuelve quebradizo. Sécalo. Revisa también que el rollo gire libre y que el tubo no tenga curvas cerradas.
filtros: [atascos]
etiquetas: [se rompe, quebradizo, se parte, se truena el filamento, tubo, ptfe]
relacionadas: [filamentos/secado, filamentos/guardado]
fuentes: []
publico: todos
revisado: 2026-11
```

---

```yaml
slug: problemas/marcas-en-paredes
tipo: problema
tema: problemas
titulo: ¿Por qué salen marcas en las paredes?
subtitulo: Ondas, rayas horizontales y la línea de la costura.
en_corto: "Ondas junto a esquinas: vibración (baja la aceleración, revisa bandas y mesa). Rayas a la misma altura: eje Z o capas irregulares. Línea vertical: es la costura."
filtros: [superficie]
etiquetas: [ondas, ghosting, ringing, rayas, bandas, z banding, marcas, costura, linea vertical]
relacionadas: [laminado/costura, mantenimiento/bandas, maquinas/donde-ponerla]
fuentes: []
publico: todos
revisado: 2026-11
```

| Marca | Causa | Qué hacer |
|---|---|---|
| Ondas después de una esquina | Vibración | Mesa firme, bandas tensas, aceleración más baja, calibración de vibración |
| Rayas horizontales repetidas | Eje Z o husillo | Limpia y engrasa los husillos |
| Línea vertical | Costura | Muévela atrás o a una esquina |
| Granitos por toda la superficie | Costura aleatoria o humedad | Cambia la costura, seca el filamento |

---

## 8. Mantenimiento

### 8.1 Pantalla del tema: Mantenimiento

```yaml
slug: mantenimiento
tipo: seccion
tema: mantenimiento
titulo: Mantenimiento
subtitulo: Qué limpiar, qué cambiar y cada cuánto.
en_corto: Antes de cada impresión, cama limpia y limpiador de boquilla sin restos. Cada semana, engranes del extrusor y ventiladores. Cada mes, ejes. Cada tres meses, grasa en los husillos.
filtros: [diario, semanal, mensual, trimestral, por-rollos]
etiquetas: [mantenimiento, limpiar, limpieza, cuidar, servicio, lubricar, refacciones]
relacionadas: [mantenimiento/calendario, mantenimiento/cama, mantenimiento/limpieza-en-frio]
fuentes: [bambu-mantenimiento, prusa-primera-capa]
publico: todos
revisado: 2026-11
```

**Pantalla, de arriba a abajo**

1. Ruta, título, subtítulo, «En corto».
2. **Calendario** (ver abajo) con filtros: Antes de imprimir · Semanal · Mensual · Cada 3 meses · Por rollos.
3. Lista de artículos del tema.
4. **Llamado a Quick Cerebro:** «Quick Cerebro lleva las horas de cada impresora y su historial de mantenimiento.»
5. Dato curioso, Preguntas, Fuentes.

> **Dato curioso.** El cortador de filamento de las Bambu Lab hace entre 5,000 y 7,000 cortes antes de perder el filo.

#### Preguntas

- **¿Qué pasa si no doy mantenimiento?** Primero baja la calidad (hilos, falta de material, marcas). Después vienen atascos y piezas desgastadas que cuestan más que el mantenimiento.
- **¿El calendario sirve para cualquier marca?** Como guía, sí. Las fechas exactas vienen del manual de tu impresora.

---

```yaml
slug: mantenimiento/calendario
tipo: articulo
tema: mantenimiento
titulo: Calendario de mantenimiento
subtitulo: Basado en el de Bambu Lab para la serie X1.
en_corto: Lo diario toma un minuto. Lo semanal, diez. Lo trimestral, media hora.
etiquetas: [calendario, cada cuanto, frecuencia, rutina, checklist, lista]
relacionadas: [mantenimiento/cama, mantenimiento/lubricacion, mantenimiento/bitacora]
fuentes: [bambu-mantenimiento]
publico: todos
revisado: 2026-11
```

```yaml
tabla: mantenimiento
filas:
  - cuando: Antes de cada impresión
    filtro: diario
    tareas:
      - Revisar que el limpiador de boquilla no tenga restos ni esté roto.
      - Revisar que la placa esté limpia.
  - cuando: Cada semana
    filtro: semanal
    tareas:
      - Limpiar con aire comprimido los engranes del extrusor; cambiarlos si están gastados.
      - Limpiar los ventiladores con aire comprimido, con la impresora apagada.
      - Con ABS, limpiar la lente de la cámara con alcohol isopropílico.
  - cuando: Cada mes
    filtro: mensual
    tareas:
      - Revisar y limpiar las varillas con alcohol isopropílico y un trapo sin pelusa.
      - En impresoras de producción, cambiar el filtro de carbón activado.
  - cuando: Cada 3 meses
    filtro: trimestral
    tareas:
      - Engrasar los husillos del eje Z con la grasa que indica el fabricante.
      - Pasar aceite antioxidante en las varillas de acero de los ejes Y y Z.
      - Cambiar el filtro de carbón activado (uso de unas 8 h al día).
  - cuando: Por rollos
    filtro: por-rollos
    tareas:
      - Cambiar el cortador de filamento cada 3–5 rollos (PLA, PETG, ABS, PC) o cada 1–2 rollos con PA-CF o PA-GF.
      - Con ABS o ASA, limpiar varillas cada 5 rollos.
      - Con ABS, limpiar el lidar cada 3–5 días.
  - cuando: Cuando aparece
    filtro: cuando-aparece
    tareas:
      - Si una polea rechina, una gota de aceite ligero sintético. Si no rechina, no se aceita.
      - Si la boquilla está sucia o falta material, limpiarla a 200 °C y hacer limpieza en frío.
      - Cambiar el calcetín de silicón cuando esté roto o flojo.
```

> **Cuidado.** Las varillas de fibra de carbono del eje X no llevan grasa: frena el movimiento y junta polvo. Solo se limpian con alcohol isopropílico.

---

```yaml
slug: mantenimiento/cama
tipo: articulo
tema: mantenimiento
titulo: Limpieza de la cama
subtitulo: Placas de PEI liso, texturizado y satinado.
en_corto: Entre impresiones, alcohol isopropílico. Cuando la pieza deja de pegar, agua tibia y jabón de trastes. Acetona solo en PEI liso, una vez al mes como máximo.
etiquetas: [limpiar cama, placa, pei, alcohol isopropilico, ipa, jabon, acetona, grasa]
relacionadas: [problemas/primera-capa, maquinas/placas]
fuentes: [prusa-primera-capa, bambu-pei]
publico: todos
revisado: 2026-11
```

| Limpieza | Con qué | Cuándo |
|---|---|---|
| Rápida | Alcohol isopropílico y papel sin aroma | Entre impresiones |
| Profunda | Agua tibia (no caliente) y unas gotas de jabón de trastes | Cuando baja la adherencia |
| Acetona | Solo PEI liso | Máximo una vez al mes |

> **Cuidado.** En placas texturizadas y satinadas no uses acetona: daña la superficie.

---

```yaml
slug: mantenimiento/boquilla
tipo: articulo
tema: mantenimiento
titulo: Limpieza y cambio de boquilla
subtitulo: Cuándo limpiar y cuándo cambiar.
en_corto: Si tiene plástico pegado por fuera, caliéntala a 200 °C y límpiala con pinzas o un trapo. Si está gastada o tapada sin remedio, cámbiala siguiendo la guía de tu impresora.
etiquetas: [boquilla, nozzle, limpiar boquilla, cambiar boquilla, hotend, refaccion]
relacionadas: [maquinas/boquillas, mantenimiento/limpieza-en-frio, problemas/boquilla-tapada]
fuentes: [bambu-mantenimiento]
publico: todos
revisado: 2026-11
```

#### Cuándo cambiarla

- Está gastada (agujero más grande o punta redonda).
- Sigue tapada después de la limpieza en frío.
- Vas a imprimir fibra con una boquilla de latón.
- Quieres otro tamaño.

#### Cambio

Cada marca tiene su forma: en algunas se cambia solo la boquilla, en caliente y con llave; en otras se cambia el hotend completo, en frío. Sigue la guía de tu modelo.

> **Cuidado.** Nunca aprietes una boquilla en frío si la guía dice en caliente: puede quedar floja al calentarse y gotear plástico.

---

```yaml
slug: mantenimiento/limpieza-en-frio
tipo: articulo
tema: mantenimiento
titulo: Limpieza en frío
subtitulo: "Cold pull: sacar la suciedad de dentro de la boquilla."
en_corto: Se calienta la boquilla, se empuja filamento, se deja enfriar a medias y se jala de golpe. El filamento sale con la forma de la boquilla y con la suciedad pegada.
etiquetas: [limpieza en frio, cold pull, atomic pull, destapar, sacar suciedad]
relacionadas: [problemas/boquilla-tapada, mantenimiento/boquilla]
fuentes: [bambu-mantenimiento]
publico: todos
revisado: 2026-11
```

#### Pasos

1. Calienta la boquilla a la temperatura de impresión del material que tenía.
2. Empuja a mano un pedazo de filamento (PLA o nylon) hasta que salga por la punta.
3. Baja la temperatura sin dejar de empujar. Con PLA, hasta unos 90 °C.
4. Jala el filamento con firmeza, de un solo movimiento.
5. Revisa la punta: si sale negra o con restos, corta y repite.
6. Repite hasta que la punta salga limpia y del color del filamento.

---

```yaml
slug: mantenimiento/lubricacion
tipo: articulo
tema: mantenimiento
titulo: Lubricación
subtitulo: Qué lleva grasa, qué lleva aceite y qué no lleva nada.
en_corto: Husillos, grasa. Varillas de acero, aceite antioxidante. Poleas, aceite solo si rechinan. Varillas de carbono, nada. Usa lo que indica tu fabricante.
etiquetas: [lubricar, grasa, aceite, engrasar, husillo, varilla, rechina, ruido]
relacionadas: [mantenimiento/calendario]
fuentes: [bambu-mantenimiento]
publico: talleres
revisado: 2026-11
```

| Parte | Con qué | Cada cuánto |
|---|---|---|
| Husillos del eje Z | Grasa (Bambu Lab recomienda BX-300; alternativas: grasa de silicón con PTFE o grasa de litio blanca) | 3 meses |
| Varillas de acero (Y, Z) | Aceite antioxidante, con trapo | 3 meses |
| Rodamientos con ruido | Aceite sintético ligero | Cuando hacen ruido |
| Poleas | Aceite sintético ligero | Solo si rechinan |
| Varillas de carbono | Nada; solo alcohol isopropílico | Revisar cada mes |

---

```yaml
slug: mantenimiento/bandas
tipo: articulo
tema: mantenimiento
titulo: Bandas
subtitulo: Tensión y desgaste.
en_corto: Bandas flojas causan capas desplazadas y círculos ovalados. Muy tensas, desgastan los rodamientos. Revisa la tensión con la guía de tu impresora.
etiquetas: [bandas, correas, belts, tension, flojas, tensar]
relacionadas: [problemas/capas-desplazadas, problemas/marcas-en-paredes]
fuentes: [bcn3d-desplazamiento]
publico: talleres
revisado: 2026-11
```

Señales de que hay que revisarlas: capas desplazadas, círculos que salen ovalados, ondas en las paredes, dientes gastados o hilos sueltos en la banda.

---

```yaml
slug: mantenimiento/ventiladores
tipo: articulo
tema: mantenimiento
titulo: Ventiladores
subtitulo: Hotend, capa y gabinete.
en_corto: "Cada semana, aire comprimido con la impresora apagada. Si un ventilador hace ruido o gira lento, cámbialo: el del hotend evita atascos."
etiquetas: [ventilador, fan, ruido, aire comprimido]
relacionadas: [problemas/boquilla-tapada, laminado/enfriamiento]
fuentes: [bambu-mantenimiento]
publico: talleres
revisado: 2026-11
```

---

```yaml
slug: mantenimiento/cortador
tipo: articulo
tema: mantenimiento
titulo: Cortador de filamento
subtitulo: En impresoras con AMS.
en_corto: Cámbialo cada 3–5 rollos con PLA, PETG, ABS o PC, y cada 1–2 rollos con nylon con fibra. Si no corta, el AMS no puede cambiar de rollo.
etiquetas: [cortador, cuchilla, cutter, ams no cambia, no corta]
relacionadas: [maquinas/multicolor, mantenimiento/calendario]
fuentes: [bambu-mantenimiento]
publico: talleres
revisado: 2026-11
```

---

```yaml
slug: mantenimiento/filtro
tipo: articulo
tema: mantenimiento
titulo: Filtro de carbón activado
subtitulo: En impresoras cerradas que lo traen.
en_corto: Cada 3 meses con uso de unas 8 h al día; cada mes en producción. Atrapa olores; no sustituye la ventilación del cuarto.
etiquetas: [filtro, carbon activado, olor, filtro de aire]
relacionadas: [seguridad/emisiones]
fuentes: [bambu-mantenimiento, ul-top10]
publico: talleres
revisado: 2026-11
```

---

```yaml
slug: mantenimiento/firmware
tipo: articulo
tema: mantenimiento
titulo: Firmware
subtitulo: Actualizaciones de la impresora.
en_corto: Actualiza cuando no haya trabajos pendientes y lee las notas de la versión. Las actualizaciones corrigen fallas y a veces agregan funciones.
etiquetas: [firmware, actualizar, actualizacion, version, update]
relacionadas: [mantenimiento/calendario]
fuentes: []
publico: talleres
revisado: 2026-11
```

- No actualices a media impresión.
- En una granja, actualiza primero una impresora y prueba antes de actualizar las demás.
- Actualiza también el laminador para que los perfiles coincidan.

---

```yaml
slug: mantenimiento/bitacora
tipo: articulo
tema: mantenimiento
titulo: Bitácora de mantenimiento
subtitulo: Qué anotar de cada impresora.
en_corto: Fecha, horas de impresión, qué se hizo y qué pieza se cambió. Con eso sabes cuánto dura cada refacción y cuánto cuesta mantener cada máquina.
etiquetas: [bitacora, registro, historial, horas, control, mantenimiento por horas]
relacionadas: [negocio/costo, mantenimiento/calendario]
fuentes: []
publico: talleres
revisado: 2026-11
```

| Campo | Ejemplo |
|---|---|
| Fecha | 2026-11-13 |
| Impresora | Impresora 2 |
| Horas acumuladas | 1,240 h |
| Tarea | Cambio de boquilla 0.4 mm endurecida |
| Costo | Precio de la refacción |
| Nota | Gastada por PETG-CF |

Llamado: «En Quick Cerebro, cada impresora lleva sus horas y su historial. El costo del mantenimiento entra al costo de cada pieza.»

---
## 9. Modelos y diseño

### 9.1 Pantalla del tema: Modelos y diseño

```yaml
slug: modelos
tipo: seccion
tema: modelos
titulo: Modelos y diseño
subtitulo: Dónde conseguir modelos, qué licencias permiten vender y cómo diseñar piezas que se impriman bien.
en_corto: Hay millones de modelos gratis en MakerWorld, Printables y Thingiverse. Antes de vender una pieza, revisa la licencia. Para diseñar, empieza con Tinkercad y sigue la regla de los 45°.
filtros: [conseguir, licencias, disenar, unir]
etiquetas: [modelos, diseno, disenar, stl, descargar, archivos, gratis, licencia]
relacionadas: [modelos/licencias, modelos/reglas-de-diseno, laminado/archivos]
fuentes: [cc-licencias, all3dp-legal, prusa-diseno]
publico: todos
revisado: 2026-11
```

**Pantalla, de arriba a abajo**

1. Ruta, título, subtítulo, «En corto».
2. **Filtros** (chips): Conseguir · Licencias · Diseñar · Unir piezas.
3. **Tabla «Licencias y venta»** (ver Licencias), visible desde la portada del tema porque es lo que más se pregunta.
4. Lista de artículos del tema.
5. Dato curioso, Preguntas, También te puede servir, Fuentes, Llamado.

> **Dato curioso.** «Gratis para descargar» no quiere decir «libre para vender». Muchos modelos gratis tienen licencia NC (no comercial).

#### Preguntas

- **¿Puedo vender piezas de un modelo que descargué gratis?** Solo si la licencia permite uso comercial. Ver Licencias.
- **¿Me pueden hacer un modelo a la medida?** Sí. Manda medidas, fotos o un dibujo por WhatsApp.

---

```yaml
slug: modelos/donde-encontrar
tipo: articulo
tema: modelos
titulo: Dónde encontrar modelos
subtitulo: Sitios de modelos gratis y de pago.
en_corto: MakerWorld, Printables y Thingiverse son los más grandes y gratuitos. Cults y otros venden modelos. Revisa siempre la licencia y los comentarios con fotos de otras personas.
etiquetas: [makerworld, printables, thingiverse, cults, thangs, descargar modelos, stl gratis, donde bajar]
relacionadas: [modelos/licencias, laminado/archivos]
fuentes: []
publico: todos
revisado: 2026-11
```

| Sitio | De quién | Tipo |
|---|---|---|
| MakerWorld | Bambu Lab | Gratis; muchos con perfiles listos para Bambu |
| Printables | Prusa | Gratis |
| Thingiverse | UltiMaker | Gratis; el más antiguo |
| Cults | Independiente | Gratis y de pago |
| Thangs | Independiente | Buscador de modelos de varios sitios |

> **Truco.** Antes de imprimir, revisa las fotos que suben otras personas («Makes» o «Hechos»). Si nadie lo ha impreso, imprime primero una versión chica.

---

```yaml
slug: modelos/licencias
tipo: articulo
tema: modelos
titulo: Licencias
subtitulo: Qué permite cada licencia Creative Commons.
en_corto: Si la licencia dice NC (no comercial), no puedes vender piezas impresas de ese modelo. BY pide dar crédito al autor. SA pide compartir con la misma licencia. ND no permite modificarlo y compartir el cambio.
etiquetas: [licencia, creative commons, cc, cc by, nc, no comercial, nd, sa, vender, derechos, copyright, uso comercial]
relacionadas: [modelos/personajes-y-marcas, negocio/modelos-con-licencia]
fuentes: [cc-licencias, all3dp-legal]
publico: todos
revisado: 2026-11
```

#### Licencias y venta

| Licencia | Crédito al autor | Vender piezas | Modificar y compartir |
|---|---|---|---|
| CC0 | No obligatorio | Sí | Sí |
| CC BY | Sí | Sí | Sí |
| CC BY-SA | Sí | Sí | Sí, con la misma licencia |
| CC BY-ND | Sí | Sí | No |
| CC BY-NC | Sí | No | Sí, sin vender |
| CC BY-NC-SA | Sí | No | Sí, sin vender y con la misma licencia |
| CC BY-NC-ND | Sí | No | No |
| Licencia propia del sitio o del autor | Revisar | Revisar | Revisar |

#### Para vender sin problemas

- Usa modelos con licencia que permita uso comercial.
- Compra la licencia comercial al autor; algunos la venden por modelo o por membresía.
- Diseña tus propios modelos.
- Guarda captura de la licencia el día que descargaste el modelo.

> **Cuidado.** Esto no es asesoría legal. Si vas a vender en volumen, consulta a un abogado de propiedad intelectual.

---

```yaml
slug: modelos/personajes-y-marcas
tipo: articulo
tema: modelos
titulo: Personajes y marcas
subtitulo: Figuras de películas, videojuegos, equipos y logotipos.
en_corto: Los personajes y logotipos tienen dueño aunque el modelo sea gratis. Para venderlos se necesita permiso del dueño de los derechos, sin importar la licencia del modelo.
etiquetas: [personajes, marcas, logotipos, disney, marvel, pokemon, anime, equipos, fan art, derechos de autor, marca registrada]
relacionadas: [modelos/licencias, encargar/personajes]
fuentes: [all3dp-legal]
publico: todos
revisado: 2026-11
```

- La licencia del modelo la pone quien lo subió, pero el personaje es de su dueño (estudio, editorial, empresa).
- Imprimir para ti es distinto de vender.
- Para piezas con tu propia marca o logotipo, no hay problema.

---

```yaml
slug: modelos/reglas-de-diseno
tipo: articulo
tema: modelos
titulo: Reglas de diseño para imprimir
subtitulo: Voladizos, puentes, paredes, agujeros y texto.
en_corto: Voladizos de hasta 45° sin soporte. Holgura de 0.3 mm entre piezas que encajan. Paredes en múltiplos del ancho de línea. Los agujeros salen un poco más chicos.
etiquetas: [diseno, reglas, voladizo, overhang, puente, bridge, pared minima, grosor, agujeros, tolerancia, texto, chaflan]
relacionadas: [modelos/holguras, laminado/soportes, laminado/orientacion]
fuentes: [prusa-diseno]
publico: talleres
revisado: 2026-11
```

| Regla | Valor | Notas |
|---|---|---|
| Voladizo sin soporte | Hasta 45° desde la vertical | Algunos materiales aguantan hasta 60° |
| Puente sin soporte | Corto y recto | Mientras más largo, más se cuelga |
| Holgura entre piezas | 0.3 mm o más | Ver Holguras |
| Precisión de una impresora de filamento | Alrededor de 0.2 mm | Más en piezas grandes |
| Grosor de pared | Múltiplo del ancho de línea (0.45 mm con boquilla de 0.4) | 0.9 mm = 2 líneas; 1.35 mm = 3 |
| Agujeros horizontales | Forma de gota o rombo arriba | Evita el soporte dentro |
| Agujeros | Salen más chicos | Diseña 0.1–0.2 mm más grandes o termina con broca |
| Base | Chaflán, no redondeo | El redondeo de abajo es un voladizo |
| Texto en relieve | Altura de letra de 5 mm o más con boquilla de 0.4 | Más chico se pierde |

> **Dato curioso.** Una pared de 1 mm con boquilla de 0.4 mm sale peor que una de 0.9 mm: el laminador no puede llenar el espacio que sobra con una línea completa.

---

```yaml
slug: modelos/holguras
tipo: articulo
tema: modelos
titulo: Holguras
subtitulo: Espacio entre piezas que encajan.
en_corto: 0.3 mm es un buen punto de partida para piezas que deben entrar y salir. Imprime una prueba de holguras con tu impresora y tu material antes de un trabajo grande.
etiquetas: [holgura, tolerancia, ajuste, encajar, clearance, presion, tapa, bisagra, print in place]
relacionadas: [modelos/reglas-de-diseno, acabado/pegado]
fuentes: [prusa-diseno]
publico: talleres
revisado: 2026-11
```

| Ajuste | Holgura de partida |
|---|---|
| A presión (no se suelta) | 0.1–0.15 mm |
| Entra y sale con la mano | 0.2–0.3 mm |
| Piezas que se mueven libres | 0.3–0.5 mm |
| Piezas móviles impresas ya armadas | 0.3–0.5 mm |

Son puntos de partida. Cambian con la impresora, el material, la boquilla y la orientación.

---

```yaml
slug: modelos/programas
tipo: articulo
tema: modelos
titulo: Programas de diseño
subtitulo: Gratis y de pago, de fácil a avanzado.
en_corto: Tinkercad para empezar, en el navegador. Fusion u Onshape para piezas técnicas con medidas. Blender para figuras y formas orgánicas.
etiquetas: [programas, software, tinkercad, fusion, fusion 360, onshape, freecad, blender, solidworks, shapr3d, cad, modelar]
relacionadas: [modelos/reglas-de-diseno, laminado/archivos]
fuentes: []
publico: todos
revisado: 2026-11
```

| Programa | Para | Costo |
|---|---|---|
| Tinkercad | Empezar; piezas simples con figuras básicas | Gratis, en el navegador |
| Fusion | Piezas técnicas | Gratis para uso personal no comercial; de pago para negocio |
| Onshape | Piezas técnicas, en el navegador | Plan gratis con documentos públicos |
| FreeCAD | Piezas técnicas | Gratis y libre |
| Blender | Figuras, personajes, formas orgánicas | Gratis y libre |
| Shapr3D | Diseño en iPad | De pago, con plan limitado |

---

```yaml
slug: modelos/insertos
tipo: articulo
tema: modelos
titulo: Insertos roscados
subtitulo: Rosca de metal dentro de una pieza impresa.
en_corto: Se mete con un cautín 10–20 °C más caliente que la temperatura de impresión. Así el tornillo muerde metal y no plástico, y se puede atornillar muchas veces.
etiquetas: [insertos, inserto roscado, heat set, tuerca, rosca, cautin, tornillo]
relacionadas: [modelos/reglas-de-diseno, acabado/pegado]
fuentes: [cnc-kitchen]
publico: talleres
revisado: 2026-11
```

#### Temperatura del cautín

| Material | Cautín |
|---|---|
| PLA | Unos 225 °C |
| PETG | Unos 245 °C |
| ABS | Unos 265 °C |

#### Pasos

1. Diseña el agujero recto (sin cono ni chaflán). Si es ciego, 1 mm más profundo que el inserto.
2. Imprime una prueba de diámetros: los agujeros impresos salen más chicos que en el modelo.
3. Pon el inserto con la punta del cautín y mételo hasta el 90 % de su altura.
4. Termina de empujarlo con una superficie plana para que quede al ras y derecho.
5. Sostén unos segundos: recién metido, tiende a salirse.

> **Truco.** Las puntas para insertos con guía central mantienen el inserto derecho. Para insertos grandes (M5 o más), usa punta gruesa y un poco más de temperatura.

En piezas de resina no se pueden derretir: se pegan con pegamento instantáneo espeso o epóxico.

---

```yaml
slug: modelos/dividir-piezas
tipo: articulo
tema: modelos
titulo: Dividir piezas
subtitulo: Por tamaño, por color o por resistencia.
en_corto: Divide cuando la pieza no cabe, cuando tiene varios colores o cuando otra orientación la hace más fuerte. Las partes se unen con clavijas, colas de milano, imanes o tornillos.
etiquetas: [dividir, cortar modelo, partir, separar, clavijas, cola de milano, imanes, unir piezas, no cabe]
relacionadas: [maquinas/multicolor, acabado/pegado, modelos/holguras]
fuentes: []
publico: talleres
revisado: 2026-11
```

| Unión | Ventaja |
|---|---|
| Clavija (con holgura de 0.2 mm y pegamento) | Alinea y se ve poco |
| Cola de milano | Sin pegamento |
| Imanes | Se arma y se desarma |
| Tornillo con inserto | Fuerte, desarmable |
| Pegado directo | Rápido; menos resistente |

El laminador (Bambu Studio, OrcaSlicer, PrusaSlicer) tiene herramienta de corte que agrega clavijas automáticamente.

> **Dato curioso.** Imprimir cada color como pieza aparte elimina la purga. En una figura de varios colores, esto puede ahorrar más filamento del que lleva la figura.

---

```yaml
slug: modelos/escaneo
tipo: articulo
tema: modelos
titulo: Escaneo 3D
subtitulo: Copiar un objeto real.
en_corto: Un escáner o el celular (fotogrametría) dan una malla del objeto. Sirve para figuras y formas orgánicas. Para piezas técnicas con medidas exactas, es mejor medir con vernier y modelar.
etiquetas: [escanear, escaneo, escaner, fotogrametria, copiar pieza, replicar]
relacionadas: [modelos/programas, encargar/cotizar]
fuentes: []
publico: todos
revisado: 2026-11
```

- El escaneo sale con huecos y ruido; casi siempre hay que limpiarlo.
- Objetos brillantes, negros o transparentes se escanean mal sin un polvo o aerosol de escaneo.
- Para reponer una pieza rota de un aparato, manda la pieza o fotos con medidas.

---

## 10. Acabado

### 10.1 Pantalla del tema: Acabado

```yaml
slug: acabado
tipo: seccion
tema: acabado
titulo: Acabado
subtitulo: Quitar soportes, lijar, pintar y pegar.
en_corto: Primero soportes y rebabas, luego lija de grano grueso a fino, primer, pintura y barniz. Para unir partes, pegamento instantáneo en gel o epóxico.
filtros: [limpiar, lijar, pintar, pegar]
etiquetas: [acabado, pintar, lijar, pegar, terminar pieza, postproceso, post procesado]
relacionadas: [acabado/lijado, acabado/pintura, acabado/pegado]
fuentes: []
publico: todos
revisado: 2026-11
```

**Pantalla, de arriba a abajo**

1. Ruta, título, subtítulo, «En corto».
2. **Orden de trabajo** (lista numerada, porque sí es una secuencia): Quitar soportes → Rebabas → Lijado → Masilla → Primer → Pintura → Barniz.
3. **Tabla «Herramientas»**: pinzas de punta, alicate de corte al ras, cúter o desbarbador, lijas (120 a 800 o más), primer en aerosol, pintura acrílica, pinceles o aerógrafo, pegamento instantáneo en gel, epóxico de dos componentes.
4. Lista de artículos del tema.
5. Dato curioso, Preguntas, Fuentes, Llamado.

> **Dato curioso.** El primer de relleno tapa las líneas de capa mejor que muchas manos de pintura. Dos manos con lijado entre ellas dejan una superficie casi lisa.

#### Preguntas

- **¿Qué pintura se usa para PLA?** Acrílica, sobre una capa de primer para plástico.
- **¿Se puede dejar la pieza lisa como inyectada?** Casi: lija, primer, lija fina, pintura y barniz. Toma tiempo y se cobra aparte.

---

```yaml
slug: acabado/quitar-soportes
tipo: articulo
tema: acabado
titulo: Quitar soportes
subtitulo: Herramientas y orden.
en_corto: Quita primero los soportes grandes con la mano o con pinzas, luego los pequeños con alicate de corte al ras, y las rebabas con desbarbador. El PVA se disuelve en agua tibia.
etiquetas: [quitar soportes, retirar soportes, rebabas, desbarbador, alicate]
relacionadas: [laminado/soportes, problemas/soportes-pegados]
fuentes: []
publico: todos
revisado: 2026-11
```

> **Cuidado.** Corta siempre hacia afuera de tu mano y usa lentes: los soportes de PLA salen disparados al romperse.

---

```yaml
slug: acabado/lijado
tipo: articulo
tema: acabado
titulo: Lijado
subtitulo: Granos y técnica por material.
en_corto: "Empieza con grano 120–150 y sube a 220, 400 y 800. Con PLA, lija con agua: en seco se calienta y se empasta."
etiquetas: [lijar, lija, grano, lijado al agua, alisar, quitar lineas]
relacionadas: [acabado/pintura, laminado/costura]
fuentes: []
publico: todos
revisado: 2026-11
```

| Grano | Para |
|---|---|
| 120–150 | Quitar marcas de soporte y la costura |
| 220 | Emparejar las líneas de capa |
| 400 | Antes del primer |
| 800 o más | Entre manos de pintura o para brillo |

---

```yaml
slug: acabado/pintura
tipo: articulo
tema: acabado
titulo: Pintura
subtitulo: Primer, pintura y barniz.
en_corto: Primer para plástico, pintura acrílica (pincel o aerógrafo) y barniz. Para exterior, pintura y barniz con protección UV.
etiquetas: [pintar, pintura, primer, imprimador, acrilica, aerografo, barniz, aerosol]
relacionadas: [acabado/lijado, filamentos/exterior]
fuentes: []
publico: todos
revisado: 2026-11
```

1. Lava la pieza con agua y jabón para quitar grasa.
2. Primer de relleno en aerosol, en capas delgadas.
3. Lija con grano 400.
4. Masilla en huecos, si los hay; lija otra vez.
5. Pintura acrílica en capas delgadas.
6. Barniz mate, satinado o brillante.

> **Cuidado.** Aerosoles al aire libre o con buena ventilación y cubrebocas para vapores orgánicos.

---

```yaml
slug: acabado/pegado
tipo: articulo
tema: acabado
titulo: Pegado
subtitulo: Qué pegamento usar.
en_corto: Pegamento instantáneo en gel para casi todo. Epóxico de dos componentes cuando la unión carga peso o hay huecos que rellenar.
etiquetas: [pegar, pegamento, kola loka, cianoacrilato, epoxico, unir, resistol, pegamento instantaneo]
relacionadas: [modelos/dividir-piezas, modelos/holguras]
fuentes: []
publico: todos
revisado: 2026-11
```

| Pegamento | Ventaja | Cuidado |
|---|---|---|
| Instantáneo en gel (cianoacrilato) | Rápido, no escurre | Frágil a golpes; deja manchas blancas |
| Epóxico de dos componentes | Muy fuerte, rellena huecos | Tarda en secar |
| Acetona (solo ABS y ASA) | Funde las dos caras | Solo para esos materiales |
| Pluma 3D con el mismo filamento | Une y rellena | Deja marca; hay que lijar |

> **Truco.** Lija un poco las caras antes de pegar. El pegamento agarra mejor en superficie áspera.

---

```yaml
slug: acabado/vapor-de-acetona
tipo: articulo
tema: acabado
titulo: Alisado con vapor de acetona
subtitulo: Solo para ABS y ASA.
en_corto: El vapor de acetona derrite la superficie del ABS y la deja brillante y lisa. No funciona con PLA ni PETG. La acetona es inflamable.
etiquetas: [acetona, vapor, alisar abs, brillo, smoothing]
relacionadas: [filamentos/abs, filamentos/asa, seguridad/incendio]
fuentes: []
publico: talleres
revisado: 2026-11
```

> **Cuidado.** La acetona es inflamable y sus vapores irritan. Nunca la calientes. Hazlo al aire libre o con buena ventilación, lejos de flamas, chispas y aparatos eléctricos, con guantes de nitrilo y lentes.

Efecto: se pierden detalles finos y bordes filosos. Haz una prueba antes.

---

```yaml
slug: acabado/brillo
tipo: articulo
tema: acabado
titulo: Acabado brillante
subtitulo: Barniz y recubrimiento de resina.
en_corto: Barniz brillante en aerosol para un brillo ligero. Para brillo de vidrio, recubrimiento de resina epóxica en capa delgada.
etiquetas: [brillo, brillante, resina epoxica, barniz brillante, laca]
relacionadas: [acabado/pintura, acabado/lijado]
fuentes: []
publico: todos
revisado: 2026-11
```

---

## 11. Seguridad

### 11.1 Pantalla del tema: Seguridad

```yaml
slug: seguridad
tipo: seccion
tema: seguridad
titulo: Seguridad
subtitulo: Emisiones, quemaduras, incendio y piezas para usos de riesgo.
en_corto: Imprime en un cuarto ventilado y no te quedes junto a la impresora. No toques la boquilla ni la cama calientes. Ten detector de humo. No uses piezas impresas donde una falla lastime a alguien.
filtros: [aire, calor, incendio, uso]
etiquetas: [seguridad, peligro, riesgo, toxico, quemadura, incendio, ventilacion]
relacionadas: [seguridad/emisiones, seguridad/incendio, seguridad/piezas-de-carga]
fuentes: [ul-top10]
publico: todos
revisado: 2026-11
```

**Pantalla, de arriba a abajo**

1. Ruta, título, subtítulo, «En corto».
2. **Lista corta de 10 puntos** (versión en español de la guía de UL Chemical Insights, ver Emisiones).
3. Lista de artículos del tema.
4. Preguntas, Fuentes.

En esta sección no hay datos curiosos ni Q-404 con chistes; los cuadros son de tipo «Cuidado».

#### Preguntas

- **¿Puedo tener la impresora en mi cuarto?** No se recomienda en el cuarto donde duermes. Mejor en un cuarto ventilado con la puerta cerrada.
- **¿Un cubrebocas sirve?** Los cubrebocas comunes no detienen vapores ni partículas ultrafinas. Lo que sirve es ventilación y distancia.

---

```yaml
slug: seguridad/emisiones
tipo: articulo
tema: seguridad
titulo: Emisiones
subtitulo: Partículas ultrafinas y vapores al imprimir.
en_corto: Las impresoras sueltan partículas ultrafinas y compuestos orgánicos volátiles. El PLA suelta menos que el nylon o el ABS. Ventila, no te quedes junto a la impresora y limpia con trapo húmedo.
etiquetas: [emisiones, toxico, vapores, particulas, olor, humo, ventilacion, salud, cancer, voc, ufp]
relacionadas: [filamentos/olor-y-humo, mantenimiento/filtro, maquinas/donde-ponerla]
fuentes: [ul-top10]
publico: todos
revisado: 2026-11
```

#### 10 puntos (UL Chemical Insights)

1. **Conoce el riesgo.** Las impresoras sueltan compuestos orgánicos volátiles y partículas ultrafinas que pueden irritar y llegar a los pulmones y a la sangre.
2. **Impresora de menos emisiones.** Prefiere modelos con certificación UL 2904 y filtros cuya eficacia esté verificada.
3. **Filamento de menos emisiones.** El PLA suelta menos que el nylon o el ABS. Usa el tipo y la marca que indica el fabricante.
4. **Ventila.** Cuarto con buena circulación o ventanas que abran; extractor local; lejos de las rejillas de retorno del aire.
5. **Aleja a las personas.** Lejos de zonas de paso; puerta cerrada mientras imprime.
6. **No te quedes encima.** Mira por la cámara o por la ventana de la impresora.
7. **Protégete.** Poco tiempo junto a la impresora encendida y lentes de seguridad. Los cubrebocas comunes no detienen vapores ni partículas ultrafinas.
8. **Temperaturas bajas.** Boquilla y cama a la temperatura más baja que funcione, dentro de lo que indica el fabricante.
9. **Limpia después de cada uso.** Con la impresora fría, quita restos de filamento de la boquilla y la cama.
10. **Limpieza a fondo.** Trapo húmedo desechable, aspiradora con filtro HEPA y lavado de manos con agua y jabón.

---

```yaml
slug: seguridad/quemaduras
tipo: articulo
tema: seguridad
titulo: Quemaduras
subtitulo: Boquilla y cama calientes.
en_corto: La boquilla pasa de 200 °C y la cama puede llegar a 120 °C. Espera a que bajen antes de tocar, y usa pinzas para quitar restos.
etiquetas: [quemadura, caliente, me queme, boquilla caliente, cama caliente]
relacionadas: [mantenimiento/boquilla]
fuentes: [bambu-tabla]
publico: todos
revisado: 2026-11
```

---

```yaml
slug: seguridad/incendio
tipo: articulo
tema: seguridad
titulo: Incendio
subtitulo: Cómo bajar el riesgo.
en_corto: Detector de humo en el cuarto, nada que se queme cerca, conexión directa sin extensiones baratas y firmware actualizado con protección térmica activa.
etiquetas: [incendio, fuego, se quema, humo, extintor, detector de humo, dejar imprimiendo de noche]
relacionadas: [maquinas/donde-ponerla, mantenimiento/firmware]
fuentes: []
publico: todos
revisado: 2026-11
```

- Detector de humo sobre la zona de impresoras.
- Extintor tipo ABC a la mano.
- Nada inflamable alrededor: cortinas, papel, solventes, acetona.
- Conexión a un contacto en buen estado; sin extensiones delgadas ni multicontactos sobrecargados.
- Firmware al día: la protección térmica apaga el calentador si un sensor falla.
- Cámara para revisar impresiones largas a distancia.

---

```yaml
slug: seguridad/ninos-y-mascotas
tipo: articulo
tema: seguridad
titulo: Niños y mascotas
subtitulo: En casa y en el taller.
en_corto: "Lejos del alcance: la boquilla quema y las piezas chicas se pueden tragar. Imprime en un cuarto donde no estén."
etiquetas: [ninos, mascotas, perro, gato, bebe, juguetes, piezas chicas]
relacionadas: [seguridad/emisiones, seguridad/quemaduras]
fuentes: [ul-top10]
publico: todos
revisado: 2026-11
```

> **Cuidado.** Juguetes impresos con piezas chicas no son para menores de 3 años: se pueden tragar.

---

```yaml
slug: seguridad/piezas-de-carga
tipo: articulo
tema: seguridad
titulo: Piezas para usos de riesgo
subtitulo: Cuándo no usar una pieza impresa.
en_corto: "No uses piezas impresas donde una falla pueda lastimar a alguien: frenos, cascos, sillas para niños, soportes de personas, piezas de gas o eléctricas de alto voltaje."
etiquetas: [carga, peso, seguro, aguanta, critico, riesgo, colgar, soporte de peso]
relacionadas: [laminado/resistencia, laminado/orientacion]
fuentes: [bambu-guia]
publico: todos
revisado: 2026-11
```

- Las capas son el punto débil y la pieza puede romperse sin aviso.
- Con peso constante, el plástico se va venciendo con los meses.
- El calor baja la resistencia (ver Resistencia al calor).

---
## 12. Si vas a encargar una pieza

Tema para clientes. Sin cifras de costo ni márgenes del taller. Cada página termina con «Cotizar por WhatsApp».

### 12.1 Pantalla del tema: Si vas a encargar una pieza

```yaml
slug: encargar
tipo: seccion
tema: encargar
titulo: Si vas a encargar una pieza
subtitulo: Qué mandar, cuánto tarda, qué material conviene y cómo se paga.
en_corto: Manda una foto o el archivo, las medidas, para qué es, cuántas necesitas y para cuándo. Te respondemos con material, precio y fecha antes de imprimir.
filtros: [cotizar, precio, tiempos, material, pago]
etiquetas: [encargar, pedido, cotizar, cotizacion, mandar a hacer, pieza a la medida, cuanto cuesta, precio, cliente]
relacionadas: [encargar/cotizar, encargar/por-que-cuesta, encargar/tiempos]
fuentes: []
publico: clientes
revisado: 2026-11
```

**Pantalla, de arriba a abajo**

1. Ruta, título, subtítulo, «En corto».
2. **Lista «Para cotizar»** (bloque fijo con casillas, se puede copiar a WhatsApp): Foto o archivo · Medidas · Uso · Cantidad · Color · Fecha.
3. Lista de artículos del tema.
4. Preguntas, Llamado.

#### Preguntas

- **¿Hacen piezas de una sola?** Sí. Desde una pieza.
- **¿Pueden copiar una pieza rota?** Sí, si se puede medir. Manda la pieza o fotos con una regla al lado.
- **¿Hacen el diseño?** Sí. Si no tienes archivo, lo hacemos a partir de fotos, medidas o un dibujo. El diseño se cotiza aparte.
- **¿Envían?** [Definir: zonas, paquetería y quién paga el envío.]

---

```yaml
slug: encargar/cotizar
tipo: articulo
tema: encargar
titulo: Datos para cotizar
subtitulo: Con estos datos se da precio y fecha sin más preguntas.
en_corto: Foto o archivo, medidas, para qué es, cuántas, color y para cuándo. Con eso se da precio y fecha sin ir y venir con preguntas.
etiquetas: [cotizar, cotizacion, que mando, informacion, datos, archivo, foto, medidas]
relacionadas: [laminado/archivos, encargar/material, encargar/tiempos]
fuentes: []
publico: clientes
revisado: 2026-11
```

| Dato | Ejemplo |
|---|---|
| Foto o archivo | STL, 3MF o STEP. Si es una foto, con una regla o una moneda al lado. |
| Medidas | 12 cm de alto, o «que entre en un tubo de 2.5 cm». |
| Uso | Decoración, dentro de un coche, al sol, para un engrane. |
| Cantidad | 1, 20, 500. |
| Color | Uno, varios, o pintada. |
| Fecha | Para cuándo la necesitas. |
| Acabado | Tal como sale, lijada, pintada. |

Texto para copiar:

```
Hola, quiero cotizar una pieza.
Foto/archivo: (adjunto)
Medidas:
Uso:
Cantidad:
Color:
Para cuándo:
```

---

```yaml
slug: encargar/por-que-cuesta
tipo: articulo
tema: encargar
titulo: ¿Por qué una pieza impresa cuesta más que su plástico?
subtitulo: Ejemplo con Q-404, el robot de Quick Robot.
en_corto: El plástico es la parte más barata. El precio incluye diseño, horas de máquina, pruebas, piezas que salen mal, armado y entrega.
etiquetas: [precio, caro, costo, por que cuesta, barato, cobran, vale]
relacionadas: [encargar/tiempos, negocio/costo, modelos/dividir-piezas]
fuentes: []
publico: clientes
revisado: 2026-11
```

Página ya diseñada (`aprende-pieza.html`). Contenido:

**Q-404 por dentro**

- 62 g de plástico.
- 23 piezas, para imprimir cada color por su lado.
- 4 placas: morado, verde, negro y blanco.
- Capas de 0.2 mm, sin soportes.
- Clavijas con 0.2 mm de holgura.
- 10 pasos de armado, con una gota de pegamento por clavija.
- Las que salen mal se imprimen otra vez.

**Pasos**

1. La idea: foto, medida o solo la idea. Material, precio y fecha antes de empezar.
2. El modelo: a tu medida, con tu nombre o tu logo.
3. La preparación: se acomoda en la cama y se separa por colores.
4. La impresión: capa por capa; de minutos a un día entero.
5. El armado: quitar soportes, lijar, pegar, pintar si lleva.
6. La entrega: revisada, empacada y avisada por WhatsApp.

**Tienda o taller**

| | Tienda | Taller |
|---|---|---|
| Cómo se hace | Un molde que saca miles iguales | Una impresora, una pieza a la vez |
| Medida | La del anaquel | La tuya |
| Cantidad | Por caja o por millar | Desde una |
| Precio incluye | El molde, repartido entre miles de piezas | Horas de máquina y de trabajo de tu pieza |

**Textos de la maqueta a corregir** (por la regla 1.2):

| En la maqueta | Cambiar a |
|---|---|
| «Lo que pagas es…» | «El precio incluye…» |
| «Lo que no se ve» | «Trabajo» |
| «El camino de tu pieza» | «Pasos» |
| «Qué pagas» (fila de la tabla) | «Precio incluye» |

---

```yaml
slug: encargar/tiempos
tipo: articulo
tema: encargar
titulo: Tiempos de entrega
subtitulo: De qué depende y cómo se calcula.
en_corto: Una pieza chica sale en minutos; una figura grande, en un día o más. La fecha de entrega suma impresión, armado, acabado y los trabajos que ya están en fila.
etiquetas: [tiempo, cuanto tarda, entrega, fecha, urgente, horas, dias]
relacionadas: [encargar/cotizar, laminado/altura-de-capa]
fuentes: []
publico: clientes
revisado: 2026-11
```

| Factor | Efecto |
|---|---|
| Tamaño | Doble de alto no es doble de tiempo: puede ser mucho más, porque crece en las tres medidas |
| Detalle (altura de capa) | Capas de 0.1 mm tardan casi el doble que las de 0.2 mm |
| Cantidad | Varias piezas en la misma placa ahorran tiempo |
| Colores | Más colores, más tiempo |
| Acabado | Lijar y pintar suma días por el secado |
| Fila de trabajos | Pedidos anteriores |

> **Dato curioso.** Una pieza al doble de tamaño tiene 8 veces más volumen: crece al doble en alto, en ancho y en fondo.

Urgentes: [Definir si se aceptan y con qué cargo.]

---

```yaml
slug: encargar/material
tipo: articulo
tema: encargar
titulo: ¿Qué material conviene para mi pieza?
subtitulo: Versión corta de la tabla de filamentos.
en_corto: Dentro de la casa, PLA o PETG. Golpes o algo de calor, PETG. Al sol, ASA. Flexible, TPU. Si no sabes, dinos para qué es y lo elegimos.
etiquetas: [que material, cual material, plastico, resistente, para que sirve]
relacionadas: [filamentos, filamentos/resistencia-al-calor, filamentos/exterior]
fuentes: [bambu-guia]
publico: clientes
revisado: 2026-11
```

| Uso | Material |
|---|---|
| Decoración, figuras, regalos | PLA o PETG |
| Uso diario, se puede golpear | PETG |
| Dentro de un coche | PETG o ABS |
| Al sol o a la intemperie | ASA |
| Flexible | TPU |
| Cerca de motores o calor fuerte | PC o nylon con fibra |

El PETG sirve para todo lo que sirve el PLA y aguanta más golpes y calor. Por eso en el taller imprimimos casi todo en PETG.

---

```yaml
slug: encargar/tamano
tipo: articulo
tema: encargar
titulo: Tamaño máximo
subtitulo: Qué tan grande puede ser una pieza.
en_corto: Hasta 25.6 cm por lado en una sola pieza. Si es más grande, se divide en partes y se une.
etiquetas: [tamano, grande, medida maxima, cabe, dimensiones]
relacionadas: [modelos/dividir-piezas, maquinas/volumen-de-impresion]
fuentes: []
publico: clientes
revisado: 2026-11
```

En Quick Robot se imprime en una Bambu Lab P1S: hasta **256 × 256 × 256 mm** (25.6 cm por lado) en una sola pieza.

| Pieza | Cómo sale |
|---|---|
| Hasta 25.6 cm por lado | En una sola pieza |
| Delgada y larga, hasta unos 35 cm | Acostada en diagonal, si la forma lo permite |
| Más grande | En partes que se unen con clavijas y pegamento |

Medidas de otras impresoras: Máquinas › Volumen de impresión.

---

```yaml
slug: encargar/precision
tipo: articulo
tema: encargar
titulo: Precisión
subtitulo: Qué tan exacta sale una pieza.
en_corto: Una impresora de filamento tiene una precisión de alrededor de 0.2 mm. Para piezas que deben encajar con otra, manda la otra pieza o sus medidas exactas.
etiquetas: [precision, exacta, medidas, tolerancia, encaja, ajuste]
relacionadas: [modelos/holguras, modelos/reglas-de-diseno]
fuentes: [prusa-diseno]
publico: clientes
revisado: 2026-11
```

---

```yaml
slug: encargar/colores
tipo: articulo
tema: encargar
titulo: Colores
subtitulo: Un color, varios colores o pintada.
en_corto: Un color sale directo del rollo. Varios colores se imprimen por partes o con cambio de rollo, y tardan más. Pintada a mano permite cualquier color y detalle.
etiquetas: [color, colores, multicolor, pintada, catalogo, que colores hay]
relacionadas: [maquinas/multicolor, acabado/pintura]
fuentes: []
publico: clientes
revisado: 2026-11
```

Catálogo de colores: [ligar al inventario de filamento de Quick Cerebro, para que se actualice solo.]

---

```yaml
slug: encargar/personajes
tipo: articulo
tema: encargar
titulo: Personajes y logotipos
subtitulo: Figuras de películas, videojuegos, equipos y marcas.
en_corto: Los personajes y logotipos tienen dueño. Para tu propia marca o logotipo no hay problema.
etiquetas: [personajes, logotipo, marca, figura, anime, superheroes, equipo de futbol]
relacionadas: [modelos/personajes-y-marcas, modelos/licencias]
fuentes: [all3dp-legal]
publico: clientes
revisado: 2026-11
```

[Decidir la política de Quick Robot para personajes con licencia y escribirla aquí.]

---

```yaml
slug: encargar/pago
tipo: articulo
tema: encargar
titulo: Pago
subtitulo: Anticipo, saldo y formas de pago.
en_corto: Se paga un anticipo para empezar y el saldo al entregar. Recibes nota con el detalle del pedido.
etiquetas: [pago, anticipo, saldo, transferencia, tarjeta, efectivo, factura]
relacionadas: [encargar/cotizar]
fuentes: []
publico: clientes
revisado: 2026-11
```

[Definir: porcentaje de anticipo, formas de pago, si se factura.]

---

## 13. Negocio

Tema para talleres. Cada página termina con el llamado a Quick Cerebro.

### 13.1 Pantalla del tema: Negocio

```yaml
slug: negocio
tipo: seccion
tema: negocio
titulo: Negocio
subtitulo: Costo, precio, fallas e inventario para talleres de impresión 3D.
en_corto: El costo de una pieza es material, electricidad, desgaste de la impresora, mantenimiento, extras y una reserva para las que salen mal. El precio se pone por lo que vale para el cliente, con el costo como piso.
filtros: [costo, precio, inventario, licencias]
etiquetas: [negocio, taller, vender, cobrar, ganancia, emprender, granja]
relacionadas: [negocio/costo, negocio/precio, negocio/fallos]
fuentes: [quick-cerebro-formula]
publico: talleres
revisado: 2026-11
```

**Pantalla, de arriba a abajo**

1. Ruta, título, subtítulo, «En corto».
2. **Calculadora simple** (la gratuita de la página pública): gramos, horas, material. Botón «Abrir la calculadora completa» → Quick Cerebro (14 días gratis).
3. Lista de artículos del tema.
4. Dato curioso, Preguntas, Llamado.

> **Dato curioso.** Si 1 de cada 20 piezas sale mal, el costo real de cada pieza buena sube 5.3 %, no 5 %: se divide entre 0.95.

#### Preguntas

- **¿Cobro por gramo?** El gramo sirve para saber el costo, no el precio. Dos piezas del mismo peso pueden valer muy distinto.
- **¿Cuánto le gano a una pieza?** Precio menos costo. Para saberlo pieza por pieza, Quick Cerebro guarda el costo de cada venta.

---

```yaml
slug: negocio/costo
tipo: articulo
tema: negocio
titulo: Costo de una pieza
subtitulo: Fórmula completa, con ejemplo.
en_corto: Material (con purga) + electricidad + desgaste de la impresora + mantenimiento + extras, y todo eso dividido entre la proporción de piezas que salen bien.
etiquetas: [costo, calcular costo, cuanto me cuesta, formula, calculadora, costo por pieza, costo real]
relacionadas: [negocio/precio, negocio/fallos, maquinas/consumo-electrico, filamentos/rendimiento-del-rollo]
fuentes: [quick-cerebro-formula]
publico: talleres
revisado: 2026-11
```

#### Fórmula

| Parte | Cálculo |
|---|---|
| Material (M) | gramos × costo por gramo × (1 + % de purga) |
| Electricidad (L) | horas × kW de la impresora × precio del kWh |
| Máquina (Q) | horas × (costo de la impresora ÷ horas de vida + mantenimiento por hora) |
| Extras (E) | imanes, tornillos, insertos, pintura, empaque |
| Subtotal | M + L + Q + E |
| Costo | Subtotal ÷ (1 − % de fallos ÷ 100) |

#### Ejemplo (valores de muestra)

| Dato | Valor |
|---|---|
| PETG | 25 g a $0.45 por gramo, 5 % de purga |
| Tiempo | 1.5 h |
| Consumo | 0.15 kW, $3.00 por kWh |
| Impresora | $20,000, 5,000 h de vida |
| Mantenimiento | $1.00 por hora |
| Fallos | 5 % |

| Parte | Cálculo | Resultado |
|---|---|---|
| Material | 25 × 0.45 × 1.05 | $11.81 |
| Electricidad | 1.5 × 0.15 × 3.00 | $0.68 |
| Máquina | 1.5 × (20,000 ÷ 5,000 + 1.00) | $7.50 |
| Extras | | $0.00 |
| Subtotal | | $19.99 |
| Costo | 19.99 ÷ 0.95 | $21.04 |

> **Dato curioso.** En el ejemplo, la máquina pesa casi tanto como el plástico. En piezas grandes y lentas, las horas de máquina suelen pesar más que el material.

Llamado: «Quick Cerebro lee el archivo del laminador (gramos, horas, colores) y hace este cálculo solo, con tus precios.»

---

```yaml
slug: negocio/precio
tipo: articulo
tema: negocio
titulo: Precio
subtitulo: Del costo al precio de venta.
en_corto: "El costo es el piso. El precio depende del valor para el cliente: diseño, personalización, urgencia, cantidad y acabado. Revisa también lo que cobran otros talleres por algo parecido."
etiquetas: [precio, cobrar, cuanto cobrar, ganancia, margen, utilidad, poner precio]
relacionadas: [negocio/costo, encargar/por-que-cuesta]
fuentes: []
publico: talleres
revisado: 2026-11
```

| Factor | Sube el precio | Baja el precio |
|---|---|---|
| Diseño | Hecho a la medida | Modelo ya existente |
| Personalización | Nombre, logo, colores | Pieza de catálogo |
| Urgencia | Entrega en horas | Entrega con calma |
| Cantidad | Una pieza | Lote grande |
| Acabado | Lijada y pintada | Tal como sale |
| Riesgo | Pieza difícil, con muchas pruebas | Pieza conocida |

> **Truco.** Ten un precio mínimo por pedido. Una pieza de 5 g también ocupa tiempo de atención, preparación y entrega.

---

```yaml
slug: negocio/fallos
tipo: articulo
tema: negocio
titulo: Reserva por fallos
subtitulo: Cuánto apartar por las piezas que salen mal.
en_corto: Anota cuántas piezas salen mal por material y por impresora. Con ese porcentaje, el costo de cada pieza buena ya incluye las malas.
etiquetas: [fallos, piezas malas, desperdicio, merma, reserva, porcentaje de falla]
relacionadas: [negocio/costo, problemas]
fuentes: [quick-cerebro-formula]
publico: talleres
revisado: 2026-11
```

| Fallos | Divide entre | Sube el costo |
|---|---|---|
| 2 % | 0.98 | 2.0 % |
| 5 % | 0.95 | 5.3 % |
| 10 % | 0.90 | 11.1 % |
| 20 % | 0.80 | 25.0 % |

---

```yaml
slug: negocio/electricidad
tipo: articulo
tema: negocio
titulo: Precio de la electricidad
subtitulo: Cómo sacar el precio real del kWh de tu recibo.
en_corto: Divide el total del recibo entre los kWh consumidos del periodo. Ese es tu precio real por kWh, con cargos e impuestos incluidos.
etiquetas: [luz, electricidad, recibo, cfe, kwh, tarifa, dac, pdbt, precio del kwh]
relacionadas: [maquinas/consumo-electrico, negocio/costo]
fuentes: []
publico: talleres
revisado: 2026-11
```

- Recibo doméstico: el precio por kWh sube por escalones según el consumo. Si un hogar pasa el límite de su zona, cambia a tarifa DAC (doméstica de alto consumo), mucho más cara.
- Local comercial: tarifa para negocios (por ejemplo, PDBT), con otro precio por kWh.
- Varias impresoras en casa pueden subir la tarifa de todo el recibo.

---

```yaml
slug: negocio/inventario
tipo: articulo
tema: negocio
titulo: Inventario de filamento
subtitulo: Gramos, rollos abiertos y mínimos.
en_corto: Lleva el filamento en gramos, no en rollos. Anota cuándo se abrió cada rollo y pon un mínimo por color para comprar antes de que falte.
etiquetas: [inventario, existencias, stock, filamento, rollos, compras, minimo]
relacionadas: [filamentos/guardado, filamentos/rendimiento-del-rollo]
fuentes: []
publico: talleres
revisado: 2026-11
```

- Entra el rollo: peso neto del filamento.
- Sale filamento: gramos de cada impresión (incluida la purga).
- Primero se usa el rollo más viejo.
- Un mínimo por color y material avisa cuándo comprar.

Llamado: «Quick Cerebro descuenta los gramos de cada impresión del rollo que usaste.»

---

```yaml
slug: negocio/modelos-con-licencia
tipo: articulo
tema: negocio
titulo: Vender piezas de modelos ajenos
subtitulo: Licencias que permiten vender.
en_corto: Solo con licencia que permita uso comercial (CC BY, CC BY-SA, CC BY-ND, CC0) o con licencia comercial comprada al autor. NC no permite vender.
etiquetas: [vender modelos, licencia comercial, uso comercial, creative commons, nc]
relacionadas: [modelos/licencias, modelos/personajes-y-marcas]
fuentes: [cc-licencias, all3dp-legal]
publico: talleres
revisado: 2026-11
```

Ver la tabla completa en Modelos y diseño › Licencias.

---

## 14. Glosario

```yaml
slug: glosario
tipo: glosario
tema: glosario
titulo: Glosario
subtitulo: Palabras de impresión 3D, en español y en inglés.
en_corto: Cada término con su nombre en inglés, porque así aparece en las impresoras y los programas.
etiquetas: [glosario, diccionario, que significa, terminos, palabras]
publico: todos
revisado: 2026-11
```

Cada término es una entrada del buscador. Formato: **Término** (inglés): definición. → liga.

- **ABS**: plástico resistente al calor y a golpes; pide impresora cerrada. → filamentos/abs
- **Altura de capa** (layer height): grosor de cada capa. → laminado/altura-de-capa
- **AMS** (Automatic Material System): cambiador de rollos de Bambu Lab. → maquinas/multicolor
- **ASA**: plástico para exterior, resistente a los rayos UV. → filamentos/asa
- **Balsa** (raft): base completa debajo de la pieza. → laminado/borde
- **Bandas** (belts): correas dentadas que mueven el cabezal o la cama. → mantenimiento/bandas
- **Boquilla** (nozzle): punta por donde sale el plástico. → maquinas/boquillas
- **Boquilla endurecida** (hardened nozzle): boquilla de acero para filamentos con fibra. → filamentos/boquilla-endurecida
- **Borde** (brim): falda de una capa alrededor de la pieza para que pegue más. → laminado/borde
- **Cama** (heatbed): superficie caliente donde se imprime. → maquinas/placas
- **CF / GF**: con fibra de carbono / con fibra de vidrio. → filamentos/boquilla-endurecida
- **CoreXY**: impresora donde el cabezal se mueve en X y Y y la cama baja. → maquinas/cinematica
- **Costura** (seam): línea donde empieza cada capa. → laminado/costura
- **Desecante** (desiccant): sobres que absorben humedad. → filamentos/guardado
- **Espagueti** (spaghetti): maraña de plástico cuando la pieza se despega. → problemas/espagueti
- **Extrusor** (extruder): engranes que empujan el filamento. → maquinas/partes
- **FDM / FFF**: impresión por filamento fundido. → maquinas/tipos
- **Firmware**: programa interno de la impresora. → mantenimiento/firmware
- **G-code**: instrucciones laminadas para una impresora. → laminado/archivos
- **HDT** (heat deflection temperature): temperatura a la que el material se deforma con carga. → filamentos/resistencia-al-calor
- **Holgura** (clearance): espacio entre piezas que encajan. → modelos/holguras
- **Hotend**: parte que calienta y derrite el filamento. → maquinas/partes
- **Husillo** (lead screw): tornillo largo que sube y baja un eje. → mantenimiento/lubricacion
- **Inserto roscado** (heat-set insert): rosca de metal que se mete con calor. → modelos/insertos
- **Interfaz de soporte** (support interface): capa del soporte que toca la pieza. → laminado/soportes
- **Laminador** (slicer): programa que convierte el modelo en capas. → laminado
- **Limpieza en frío** (cold pull): método para sacar suciedad de la boquilla. → mantenimiento/limpieza-en-frio
- **Nylon / PA**: plástico técnico resistente al roce y al calor; absorbe humedad. → filamentos/nylon
- **Orejas** (brim ears): discos en las esquinas para que no se levanten. → laminado/borde
- **Paredes** (walls, perimeters): líneas del contorno de cada capa. → laminado/paredes
- **PC**: policarbonato; resistente a calor y golpes. → filamentos/pc
- **PEI**: superficie de placa donde pegan bien la mayoría de los filamentos. → maquinas/placas
- **PETG**: plástico que sirve para lo mismo que el PLA y aguanta más golpes y calor. → filamentos/petg
- **Pie de elefante** (elephant foot): base más ancha que el resto de la pieza. → problemas/pie-de-elefante
- **Placa** (build plate): lámina removible encima de la cama. → maquinas/placas
- **Planchado** (ironing): pasada extra para alisar la tapa. → laminado/planchado
- **PLA**: el filamento más usado; fácil y rígido; aguanta poco calor. → filamentos/pla
- **Purga** (purge): filamento que se tira al cambiar de color. → maquinas/multicolor
- **PVA**: soporte que se disuelve en agua. → filamentos/soportes
- **Recocido** (annealing): calentar la pieza para que aguante más calor. → filamentos/recocido
- **Relleno** (infill): estructura interior de la pieza. → laminado/relleno
- **Retracción** (retraction): jalar el filamento hacia atrás para que no gotee. → laminado/retraccion
- **Shore A**: escala de dureza de materiales blandos (TPU 95A). → filamentos/tpu
- **Soportes** (supports): estructuras que sostienen partes en el aire. → laminado/soportes
- **STL / 3MF / STEP**: formatos de archivo 3D. → laminado/archivos
- **Subextrusión** (under-extrusion): sale menos plástico del necesario. → problemas/falta-material
- **TPU**: filamento flexible. → filamentos/tpu
- **Torre de purga** (prime tower): torre donde se limpia la boquilla al cambiar de color. → maquinas/multicolor
- **Volumen de impresión** (build volume): medida máxima de pieza que cabe en una impresora. → maquinas/volumen-de-impresion
- **Voladizo** (overhang): parte de la pieza que sale hacia afuera sin nada abajo. → modelos/reglas-de-diseno
- **Warping**: esquinas que se levantan. → problemas/esquinas-levantadas

---
## 15. Sinónimos del buscador

Para la configuración de sinónimos de Meilisearch (`synonyms`). Cada renglón: lo que la gente escribe → lo que debe encontrar. Incluye palabras en inglés y escritas sin acento o con errores comunes.

```yaml
sinonimos:
  # Problemas
  se despega: [adhesion, primera capa, no pega]
  no pega: [adhesion, primera capa]
  se levanta: [warping, esquinas levantadas]
  se curva: [warping, esquinas levantadas]
  warping: [esquinas levantadas]
  hilos: [stringing, telarana]
  telarana: [hilos, stringing]
  pelos: [hilos, stringing]
  stringing: [hilos]
  tapada: [atasco, boquilla tapada]
  tapo: [atasco, boquilla tapada]
  atorada: [atasco, boquilla tapada]
  clog: [atasco, boquilla tapada]
  no sale: [atasco, falta material]
  se recorre: [capas desplazadas]
  layer shift: [capas desplazadas]
  chueca: [capas desplazadas]
  huecos: [falta material, subextrusion]
  under extrusion: [falta material]
  truena: [filamento humedo, secado]
  burbujas: [filamento humedo, secado]
  nido: [espagueti]
  spaghetti: [espagueti]
  se rompe: [resistencia, capas separadas, filamento roto]
  grietas: [capas separadas]
  # Materiales
  petj: [petg]
  pet-g: [petg]
  nailon: [nylon]
  pa: [nylon]
  policarbonato: [pc]
  flexible: [tpu]
  hule: [tpu]
  goma: [tpu]
  carbono: [cf, fibra de carbono]
  fibra de vidrio: [gf]
  soluble: [pva, bvoh]
  brilla en la oscuridad: [glow, pla con efectos]
  fosforescente: [glow, pla con efectos]
  madera: [pla con efectos]
  # Máquinas y laminado
  nozzle: [boquilla]
  punta: [boquilla]
  bed: [cama, placa]
  base: [cama, placa]
  plate: [placa]
  slicer: [laminador]
  rebanador: [laminador]
  infill: [relleno]
  walls: [paredes]
  perimetros: [paredes]
  brim: [borde]
  raft: [balsa]
  supports: [soportes]
  overhang: [voladizo]
  seam: [costura]
  ironing: [planchado]
  build volume: [volumen de impresion]
  tamano maximo: [volumen de impresion]
  medidas: [volumen de impresion]
  cabe: [volumen de impresion]
  area de impresion: [volumen de impresion]
  que tan grande: [volumen de impresion]
  gabinete: [impresora cerrada]
  enclosure: [impresora cerrada]
  # Negocio y clientes
  luz: [electricidad, consumo electrico]
  recibo: [electricidad]
  caro: [precio, costo, por que cuesta]
  cuanto cuesta: [precio, cotizar]
  cobrar: [precio]
  cotizar: [cotizacion, encargar]
  stock: [inventario]
  existencias: [inventario]
```

Palabras que no deben buscar nada (`stopWords`): de, la, el, los, las, un, una, y, o, en, para, por, con, mi, que, como, se.

Búsquedas sin resultado: se guardan en una tabla (`aprende_busquedas_vacias`: texto, fecha, cuántas veces) para escribir esas respuestas después.

---

## 16. Banco de datos curiosos

Lista completa para rotar en la portada y para usar en cada tema. Todos tienen fuente.

| # | Dato | Tema | Fuente |
|---|---|---|---|
| 1 | En un coche estacionado al sol, el tablero llegó a 69 °C en una hora. El PLA empieza a deformarse a 57 °C. | filamentos | vanos-2018, bambu-guia |
| 2 | Un rollo de 1 kg de PLA de 1.75 mm mide unos 335 metros. | filamentos | calculo-propio |
| 3 | El ABS rinde unos 400 m por kilo porque es más ligero que el PLA. | filamentos | calculo-propio |
| 4 | El PLA se hace con almidón de plantas como el maíz o la caña de azúcar. | filamentos | (conocimiento general) |
| 5 | Los bloques de LEGO son de ABS. | filamentos | (conocimiento general) |
| 6 | La «G» de PETG es de glicol. | filamentos | (conocimiento general) |
| 7 | El ASA aguanta 100 °C y el ABS 87 °C, aunque se imprimen casi igual. | filamentos | bambu-guia |
| 8 | El TPU aguanta casi 5 veces más impacto que el PLA (125.2 contra 26.6 kJ/m²). | filamentos | bambu-guia |
| 9 | El PA6-CF puede absorber hasta 2.35 % de su peso en agua: más de 20 g en un rollo de 1 kg. | filamentos | bambu-guia |
| 10 | El PLA que brilla en la oscuridad lleva aluminato de estroncio, que desgasta la boquilla de latón. | filamentos | microcenter-glow, bambu-tabla |
| 11 | El PET-CF aguanta 205 °C, el más alto de la tabla de Bambu Lab. | filamentos | bambu-guia |
| 12 | Una pieza aguanta casi la mitad de impacto entre capas que a lo largo de ellas (PLA: 13.8 contra 26.6 kJ/m²). | laminado | bambu-guia |
| 13 | Con boquilla de 0.6 mm, una pieza aguantó 25.6 % más impacto que con 0.4 mm. | maquinas | prusa-boquillas |
| 14 | La patente de la impresión por filamento fundido venció en 2009; desde entonces aparecieron las impresoras caseras. | maquinas | wikipedia-fff |
| 15 | El nombre FDM es marca registrada; por eso el proyecto RepRap usó FFF. | maquinas | wikipedia-fff |
| 16 | En SLS la pieza no necesita soportes: el polvo sin fundir la sostiene. | maquinas | formlabs-tipos |
| 17 | Bambu Studio y OrcaSlicer vienen de PrusaSlicer, que viene de Slic3r. | laminado | (conocimiento general) |
| 18 | El cortador de filamento de las Bambu Lab hace entre 5,000 y 7,000 cortes antes de perder el filo. | mantenimiento | bambu-mantenimiento |
| 19 | Las varillas de fibra de carbono no llevan grasa. | mantenimiento | bambu-mantenimiento |
| 20 | Los pañuelos con crema o suavizante hacen que la pieza no pegue a la cama. | problemas | prusa-primera-capa |
| 21 | «Gratis para descargar» no quiere decir «libre para vender». | modelos | cc-licencias |
| 22 | Si 1 de cada 20 piezas sale mal, el costo de cada pieza buena sube 5.3 %, no 5 %. | negocio | quick-cerebro-formula |
| 23 | Una pieza al doble de tamaño tiene 8 veces más volumen. | encargar | (cálculo) |
| 24 | Q-404 tiene 23 piezas, se imprime en 4 placas y pesa unos 62 g. | encargar | kit de Q-404 |
| 25 | En una cama de 256 × 256 mm, una pieza delgada en diagonal puede medir casi 36 cm. | maquinas | (cálculo) |
| 26 | La Elegoo Neptune 4 Max tiene unos 85 litros de volumen de impresión; una A1 mini, 5.8 litros. | maquinas | elegoo-n4max, bambu-lineup |

---

## 17. Fuentes

Para el bloque «Fuentes» de cada página. Revisadas en noviembre de 2026.

| id | Nombre en pantalla | Liga |
|---|---|---|
| bambu-tabla | Bambu Lab · Tabla de materiales | https://wiki.bambulab.com/en/general/filament-guide-material-table |
| bambu-guia | Bambu Lab · Guía de filamentos (PDF) | https://cdn1.bambulab.com/filament/a5e185aed14e6/filament-guide-en-4.pdf |
| bambu-secado | Bambu Lab · Secado de filamento | https://wiki.bambulab.com/en/filament-acc/filament/dry-filament |
| bambu-mantenimiento | Bambu Lab · Mantenimiento básico (serie X1) | https://wiki.bambulab.com/en/x1/maintenance/basic-maintenance |
| bambu-pei | Bambu Lab · Limpieza de placas PEI | https://wiki.bambulab.com/en/filament-acc/acc/pei-plate-clean-guide |
| bambu-warping | Bambu Lab · Esquinas levantadas y piezas que se caen | https://wiki.bambulab.com/en/filament-acc/filament/print-quality/warping-falling-off-collapsing |
| bambu-orejas | Bambu Lab · Orejas de borde | https://wiki.bambulab.com/en/software/bambu-studio/brim-ears |
| bambu-x1-compat | Bambu Lab · Compatibilidad de filamentos (X1) | https://wiki.bambulab.com/en/x1/manual/compatibility-and-parameter-settings-of-filaments |
| bambu-pa-cf | Bambu Lab · Consejos para PA-CF | https://wiki.bambulab.com/knowledge-sharing/pa-cf-printing-tips |
| prusa-materiales | Prusa · Guía de materiales | https://help.prusa3d.com/filament-material-guide |
| prusa-primera-capa | Prusa · Problemas de primera capa | https://help.prusa3d.com/article/first-layer-issues_1804 |
| prusa-hilos | Prusa · Hilos y goteo | https://help.prusa3d.com/article/stringing-and-oozing-issues_1805 |
| prusa-capas | Prusa · Capas separadas y grietas | https://help.prusa3d.com/article/warping_1806 |
| prusa-boquillas | Prusa · Boquillas de distintos diámetros | https://blog.prusa3d.com/everything-about-nozzles-with-a-different-diameter_8344/ |
| prusa-diseno | Prusa · Modelar pensando en la impresión 3D | https://help.prusa3d.com/article/modeling-with-3d-printing-in-mind_164135 |
| formlabs-tipos | Formlabs · FDM, SLA y SLS | https://formlabs.com/blog/fdm-vs-sla-vs-sls-how-to-choose-the-right-3d-printing-technology/ |
| all3dp-corexy | All3DP · CoreXY y cartesiana | https://all3dp.com/2/corexy-vs-cartesian-3d-printer-differences/ |
| all3dp-legal | All3DP · Vender piezas impresas: guía legal | https://all3dp.com/1/things-to-3d-print-and-sell-a-legal-guide/ |
| cc-licencias | Creative Commons · Licencias | https://creativecommons.org/share-your-work/cclicenses/ |
| ul-top10 | UL Chemical Insights · 10 puntos de seguridad en impresión 3D (PDF) | https://chemicalinsights.ul.org/wp-content/uploads/2026/04/3DP_Handout_Top_10_082724.pdf |
| vanos-2018 | UC San Diego · Temperatura en coches estacionados al sol (2018) | https://scripps.ucsd.edu/news/research-highlight-hot-cars-can-hit-life-threatening-levels-approximately-one-hour |
| cnc-kitchen | CNC Kitchen · Consejos para insertos roscados | https://www.cnckitchen.com/blog/tipps-amp-tricks-fr-gewindeeinstze-im-3d-druck-3awey |
| bcn3d-desplazamiento | BCN3D · Capas desplazadas | https://support.bcn3d.com/knowledge/layer-shifting |
| microcenter-glow | Micro Center · Imprimir con PLA que brilla en la oscuridad | https://www.microcenter.com/site/mc-news/article/how-to-print-with-glow-pla.aspx |
| wikipedia-fff | Wikipedia · Fused filament fabrication | https://en.wikipedia.org/wiki/Fused_filament_fabrication |
| bambu-lineup | Innoaddi · Línea de impresoras Bambu Lab 2026 (A1 mini, P1S, X1 Carbon) | https://www.innoaddi.com/blogs/news/the-full-bambu-lab-printer-lineup-in-2026-every-model-side-by-side |
| bambu-a1 | Bambu Lab · A1 | https://eu.store.bambulab.com/products/a1 |
| bambu-a2l | Bambu Lab · A2L (lanzamiento) | https://blog.bambulab.com/bambu-lab-a2l-creative-playground-extra-large |
| bambu-p2s | Bambu Lab · P2S | https://eu.store.bambulab.com/products/p2s |
| bambu-x2d | Bambu Lab · X2D (comunicado) | https://en.prnasia.com/releases/global/xcellence-made-simple-bambu-lab-launches-x2d-next-gen-flagship-3d-printer-featuring-dual-extrusion-system-529576.shtml |
| bambu-h2s | Bambu Lab · H2S | https://us.store.bambulab.com/products/h2s |
| bambu-h2d | 3D Printing Industry · Ficha de la H2D | https://3dprintingindustry.com/news/bambu-labs-new-h2d-3d-printer-technical-specifications-and-pricing-237763/ |
| bambu-h2c | Bambu Lab · H2C (lanzamiento) | https://blog.bambulab.com/bambu-lab-h2c-where-multi-material-vortek-system-meets-engineering-precision |
| prusa-mk4s | Prusa · MK4S | https://www.prusa3d.com/product/original-prusa-mk4s-3d-printer-5/ |
| prusa-core-one-l | Prusa · CORE One L | https://www.prusa3d.com/p/core-one-l/ |
| eolas-prusa | Eolas Prints · Guía de impresoras Prusa | https://eolasprints.com/en-us/blogs/advanced-3d-printing/prusa-printer-buyers-guide |
| polymaker-creality | Polymaker Wiki · Impresoras Creality | https://wiki.polymaker.com/the-basics/3d-printers/popular-printers/creality |
| toms-k1c | Tom's Hardware · K1C y Ender-3 V3 | https://www.tomshardware.com/3d-printing/creality-unveils-new-flagship-k1c-3d-printer-and-latest-ender-3-v3-model |
| creality-k2 | Creality · Serie K2 | https://www.creality.com/blog/which-to-buy-k2-series-3d-printers |
| elegoo-n4pro | Elegoo · Neptune 4 Pro | https://www.elegoo.com/en-ca/products/elegoo-neptune-4-pro-fdm-3d-printer |
| elegoo-n4max | Elegoo · Neptune 4 Max | https://www.elegoo.com/collections/fdm-printers/products/neptune-4-max-fdm-3d-printer |
| elegoo-cc | Elegoo · Centauri Carbon | https://www.elegoo.com/products/centauri-carbon |
| anycubic-s1 | VoxelMatters · Reseña de la Kobra S1 | https://www.voxelmatters.com/anycubic-kobra-s1-review-no-fuss-corexy-for-speed-and-reliability/ |
| qidi-comparativa | Qidi · Comparativa de impresoras 2026 | https://kr.qidi3d.com/blogs/news/qidi-3d-printer-comparison |
| flashforge-ad5x | Printer Hub · Flashforge AD5X | https://printer-hub.com/printers/flashforge-ad5x |
| sovol-sv08 | Sovol · SV08 | https://sovol3d.com/products/sovol-sv08-3d-printer |
| calculo-propio | Quick Robot · Cálculo con densidades típicas | (sin liga) |
| quick-cerebro-formula | Quick Cerebro · Fórmula de costo | (sin liga; docs/04 §2 del sistema) |

---

## 18. Pendientes para Bruno

Datos que solo el taller puede dar. Mientras no estén, la página muestra el texto entre corchetes oculto (no se publica).

| Página | Falta |
|---|---|
| encargar/pago | Porcentaje de anticipo, formas de pago, si se factura |
| encargar/personajes | Política para personajes y marcas con licencia |
| encargar/tiempos | Si se aceptan urgentes y con qué cargo |
| encargar (portada) | Envíos: zonas, paquetería, quién paga |
| encargar/colores | Ligar el catálogo al inventario de Quick Cerebro |
| problemas/* | Fotos reales de cada falla (del taller) |
| maquinas/partes | Ilustración numerada de una impresora |
| Todas | Revisar los datos de Bambu Lab cada 6 meses (cambian las fórmulas) |
| maquinas/volumen-de-impresion | Agregar los modelos nuevos que salgan (cada 6 meses) |

---

Fin del archivo.
