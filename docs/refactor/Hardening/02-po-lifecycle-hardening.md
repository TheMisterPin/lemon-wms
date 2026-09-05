# Hardening: Purchase Order Lifecycle and Floor Execution

## Point from assessment
Purchase-order lifecycle and floor execution flow are modeled and implemented.

## Why this matters
The PO lifecycle is a business-critical path where correctness and consistency directly impact warehouse throughput.

## Hardening actions
- [Done] Add idempotency keys for start/pause/resume/complete transitions —
  also extended to release, receipt completion, and receipt/pick line
  handling, since those carry the same retry/double-tap risk. See
  `src/lib/api/idempotency.ts` (persistent `IdempotencyRecord` table,
  request-hash validation, stored responses) and its use in each of those 7
  routes.
- [Done] Add concurrency tests for race conditions across floor users. See
  `src/__tests__/lib/orders/purchase/transition-purchase-order-concurrency.test.ts`,
  `src/__tests__/lib/stock/stock-mutations-concurrency.test.ts`,
  `src/__tests__/app/api/warehouse/orders/receipt-line-handle-route-concurrency.test.ts`,
  and `src/__tests__/lib/api/idempotency.test.ts`.
- [Done] Close the read-then-write races the above tests target: PO
  transitions already used a compare-and-set `updateMany`; the same pattern
  was applied to `BinStockItem` quantity/capacity mutations in
  `src/lib/stock/stock-mutations.ts` and
  `src/lib/stock/bin-stock-items/bin-stock-items-mutations.ts` (atomic
  `upsert`/guarded `updateMany` instead of find-then-branch), and the
  receipt-line-handle route's two separate transactions (activity recording,
  then stock crediting) were merged into one.
- Introduce invariant checks for status transitions and assignment consistency — not covered by this pass.

## Deliverables
- Idempotent transition handlers. — Done.
- Transition stress-test suite. — Done (concurrency tests listed above).
- Lifecycle invariant checklist enforced in CI. — not covered by this pass.

## Explicitly out of scope
Queues and dead-letter handling were considered for the stock-mutation paths
above and excluded: there is no ERP export, webhook, or other genuinely
asynchronous integration boundary in this codebase today (bulk import/export
under `src/lib/import-export/` is synchronous request/response, and no queue
library is used anywhere in the project). Revisit if/when such a boundary is
introduced — ordinary synchronous stock mutations don't need one.
