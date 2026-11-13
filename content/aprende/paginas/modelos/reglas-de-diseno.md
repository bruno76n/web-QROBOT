---
slug: modelos/reglas-de-diseno
kind: article
topic: modelos
title: Reglas de diseño para imprimir
subtitle: Voladizos, puentes, paredes, agujeros y texto.
summary: Voladizos de hasta 45° sin soporte. Holgura de 0.3 mm entre piezas que encajan. Paredes en múltiplos del ancho de línea. Los agujeros salen un poco más chicos.
filters:
- disenar
tags:
- diseno
- reglas
- voladizo
- overhang
- puente
- bridge
- pared minima
- grosor
- agujeros
- tolerancia
- texto
- chaflan
related:
- modelos/holguras
- laminado/soportes
- laminado/orientacion
sources:
- prusa-diseno
audience: shops
published: true
order: 4
reviewed: 2026-11
cta: none
---

| Regla | Valor | Notas |
|---|---|---|
| Voladizo sin soporte | Hasta 45° desde la vertical | Algunos materiales aguantan hasta 60° |
| Puente sin soporte | Corto y recto | Mientras más largo, más se cuelga |
| Holgura entre piezas | 0.3 mm o más | [Ver Holguras](/aprende/modelos/holguras) |
| Precisión de una impresora de filamento | Alrededor de 0.2 mm | Más en piezas grandes |
| Grosor de pared | Múltiplo del ancho de línea (0.45 mm con boquilla de 0.4) | 0.9 mm = 2 líneas; 1.35 mm = 3 |
| Agujeros horizontales | Forma de gota o rombo arriba | Evita el soporte dentro |
| Agujeros | Salen más chicos | Diseña 0.1–0.2 mm más grandes o termina con broca |
| Base | Chaflán, no redondeo | El redondeo de abajo es un voladizo |
| Texto en relieve | Altura de letra de 5 mm o más con boquilla de 0.4 | Más chico se pierde |

> **Dato curioso.** Una pared de 1 mm con boquilla de 0.4 mm sale peor que una de 0.9 mm: el laminador no puede llenar el espacio que sobra con una línea completa.
