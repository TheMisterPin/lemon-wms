---
source: src/components/warehouse/orders/use-warehouse-purchase-order-details.ts
type: hook
isCorrectCase: true
---

## Hook responsibility

Owns purchase order floor details: list row fetch, receipt GET, start/pause/resume, line handle, receipt complete, assignment id resolution, light polling while receipt is open.

## Refactor status

Status: moved  
Related: `use-purchase-orders.ts`, `simulation/run-purchase-order.ts`
