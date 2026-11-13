---
slug: negocio/costo
kind: article
topic: negocio
title: Costo de una pieza
subtitle: Fórmula completa, con ejemplo.
summary: Material (con purga) + electricidad + desgaste de la impresora + mantenimiento + extras, y todo eso dividido entre la proporción de piezas que salen bien.
filters:
- costo
tags:
- costo
- calcular costo
- cuanto me cuesta
- formula
- calculadora
- costo por pieza
- costo real
related:
- negocio/precio
- negocio/fallos
- maquinas/consumo-electrico
- filamentos/rendimiento-del-rollo
sources:
- quick-cerebro-formula
audience: shops
published: true
order: 1
reviewed: 2026-11
cta: system
ctaText: Quick Cerebro lee el archivo del laminador (gramos, horas, colores) y hace este cálculo solo, con tus precios.
---

## Fórmula

| Parte | Cálculo |
|---|---|
| Material (M) | gramos × costo por gramo × (1 + % de purga) |
| Electricidad (L) | horas × kW de la impresora × precio del kWh |
| Máquina (Q) | horas × (costo de la impresora ÷ horas de vida + mantenimiento por hora) |
| Extras (E) | imanes, tornillos, insertos, pintura, empaque |
| Subtotal | M + L + Q + E |
| Costo | Subtotal ÷ (1 − % de fallos ÷ 100) |

[[calculadora-costo]]

## Ejemplo (valores de muestra)

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
