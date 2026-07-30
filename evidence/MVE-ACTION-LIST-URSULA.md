# MVE — Lista de Acción Prioritaria / Priority Action List
### Para / For: Ursula Banda · Renato Zapata & Company
<!-- owner=P1-W1-02 skill=mve-compliance status=DATOS-DEMO date=2026-07-19 -->

> **DATOS DEMO** — el marco y la lista son reales; los conteos por cliente se llenan con datos
> vivos de Supabase al cerrar [WO-01]. *Framework and checklist are real; per-client counts fill from
> live Supabase once [WO-01] lands.*

## ⚠️ Contexto crítico / Critical context
El formato **E2 electrónico vía VUCEM** es obligatorio desde el **1 de abril de 2026** (fecha límite
31-mar-2026, ya pasada). Toda operación con valor > **$300 USD**, entre partes relacionadas, o bajo
IMMEX **requiere MVE**. Omisión → **multa $4,790–$7,190 MXN por operación** (Art. 178-III Ley Aduanera;
Regla 1.1.5 RGCE) + riesgo de embargo precautorio (Art. 151 LA).

## Acción por cliente / Action per client

| Cliente | Estado E2 | Operaciones a revisar | Acción | Prioridad |
|---|---|---|---|---|
| **EVCO Plastics de México** | ⬜ verificar en VUCEM | `<n>` (DATOS DEMO) | confirmar E2 en toda op. IMMEX; partes relacionadas → estudio de precios de transferencia | 🔴 alta |
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
