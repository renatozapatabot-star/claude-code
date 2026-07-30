# MVE — Lista de Acción Prioritaria / Priority Action List
### Para / For: Ursula Banda · Renato Zapata & Company
<!-- owner=P1-W1-02 skill=mve-compliance status=DATOS-DEMO date=2026-07-19 -->

> **DATOS DEMO** — el marco y la lista son reales; los conteos por cliente se llenan con datos
> vivos de Supabase al cerrar [WO-01]. *Framework and checklist are real; per-client counts fill from
> live Supabase once [WO-01] lands.*

## ⚠️ Contexto crítico / Critical context

> **⚠️ CITAS NO VERIFICADAS — leer antes de usar con un cliente real / UNVERIFIED CITATIONS — read
> before using with a real client (added v3.7 audit, 2026-07-30):** una ronda de deep-research
> (3 pasadas independientes) buscó verificar la fecha límite E2/MVE y las citas legales de abajo
> contra fuentes reales — y las 3 pasadas dieron fechas **distintas y contradictorias** (1-jun-2026,
> 31-jul-2026, 1-ago-2026) y números de artículo/regla distintos para la misma multa (Art. 178-III
> vs 184-A/185-VII vs 185-I; Regla 1.1.5 vs 1.5.1). Ninguna de las 3 se adoptó como corrección aquí
> porque ninguna se pudo confirmar de forma independiente contra una fuente primaria (DOF/sat.gob.mx)
> — adoptar cualquiera de las 3 sin verificar sería exactamente el tipo de dato fabricado que la ley
> de honestidad de este repo prohíbe. **No citar la fecha límite ni el artículo/regla de abajo a un
> cliente real sin verificar primero directamente contra sat.gob.mx, el DOF, o una base de datos
> legal de pago.** Lo que SÍ es estable entre las 3 pasadas: la obligación de MVE/E2 es real y
> vigente, y el umbral de "$300 USD" probablemente no es el umbral real vigente (ver más abajo) —
> ambos puntos merecen verificación antes del próximo uso de este documento con un cliente.
>
> *(EN summary: three independent research passes gave three different, contradictory dates and
> legal-article citations for the same deadline/fine. None was adopted as a correction because none
> could be independently confirmed against a primary source — picking one would itself have been
> fabrication. Do not cite the deadline or article/rule below to a real client without verifying
> directly against sat.gob.mx, the DOF, or a paid legal database first.)*

El formato **E2 electrónico vía VUCEM** es obligatorio desde el **1 de abril de 2026** (fecha límite
originalmente 31-mar-2026 — **ver aviso arriba: extendida al menos una vez según investigación no
verificada, fecha exacta a confirmar**). Toda operación con valor > **$300 USD** (umbral **a
verificar** — la investigación no verificada sugiere un umbral real de $1,000 USD con condiciones
adicionales, distinto del valor aquí), entre partes relacionadas, o bajo IMMEX **requiere MVE**.
Omisión → **multa $4,790–$7,190 MXN por operación** (cita legal **a verificar** — ver aviso arriba)
+ riesgo de embargo precautorio (Art. 151 LA).

## Acción por cliente / Action per client

| Cliente | Estado E2 | Operaciones a revisar | Acción | Prioridad |
|---|---|---|---|---|
| **EVCO Plastics de México** | ⬜ verificar en VUCEM | `<n>` (DATOS DEMO) | confirmar E2 en toda op. IMMEX; partes relacionadas → estudio de precios de transferencia | 🔴 alta |
| **MAFESA** (añadido v3.7 — tenant real, $5.86M+ verificado, faltaba en esta lista) | ⬜ verificar en VUCEM | `<n>` (DATOS DEMO) | mismo checklist §3 | 🔴 alta |
| **Duratech** | ⬜ verificar | `<n>` | mismo checklist §3 | 🟡 media |
| **Milacron** | ⬜ verificar | `<n>` | mismo checklist §3 | 🟡 media |
| **Foam Supplies** | ⬜ verificar | `<n>` | mismo checklist §3 | 🟡 media |

## Checklist E2 por operación (resumen) / Per-op E2 checklist
1. ¿Requiere MVE? (valor > $300 USD / partes relacionadas / IMMEX) →
2. ¿E2 presentado en VUCEM? →
3. ¿Datos E2 == pedimento? (RFC importador · No. pedimento · valor · método de valoración 1–6) →
4. ¿Docs adjuntos? (factura · packing list · transporte BL/AWB/Carta Porte · seguro si aplica) →
5. ✅ **COMPLETO** — o generar notificación (plantilla lista, skill `client-communication-writer`).

## Los 3 primeros pasos esta semana / First 3 steps this week
1. **Correr la consulta VUCEM** para EVCO: listar toda operación 2026 sin folio E2. *(Run the VUCEM
   query for EVCO: every 2026 op with no E2 folio.)*
2. **Cerrar [WO-01]** (acceso Supabase de solo-lectura) para que este reporte se llene solo cada semana
   vía la Rutina de cumplimiento ([P1-W2-01]).
3. **Partes relacionadas** — confirmar que EVCO tiene estudio de precios de transferencia aduanal
   vigente (obligatorio independientemente del valor).

---
*Generado por el skill `mve-compliance` bajo FREIGHT-OS-CANON §P1-W1-02. Nada se envía a un cliente sin
el GO del fundador (§0.4-8). / Nothing is sent to a client without founder GO.*
