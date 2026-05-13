# Purchase Order Execution — End-to-End Walkthrough

This document traces what happens in the system — across the database, API layer, and audit trail — when a floor worker receives a purchase order. It is written for developers who need to understand, extend, or debug the PO execution flow.

---

## Overview

A purchase order moves through five statuses:

```
DRAFT → RELEASED → EXECUTING → EXECUTED
                             └→ EXECUTED_WITH_PROBLEMS
```

The office side manages DRAFT and RELEASED. The floor side owns everything from EXECUTING onward. This document covers the floor side.

The receipt document mirrors the PO's lifecycle:

```
OPEN → IN_PROGRESS → COMPLETED
                   └→ COMPLETED_WITH_PROBLEMS
```

Every status transition produces at least one immutable audit record. No status can be rolled back — mistakes are corrected with compensating entries.

---

## Prerequisites

Before the floor API can be called, the database must have:

- A `PurchaseOrder` in status `RELEASED` with at least one `PurchaseOrderLine`.
- A `PurchaseOrderReceipt` already created for the order (created when the PO was released).
- `PurchaseOrderReceiptLine` rows, one per PO line, with `orderedQuantity` set.
- An authorized `Device` with both `warehouseId` and `zoneId` assigned, in the same warehouse as the PO.
- A `User` with `loginType` of `BADGE_PIN` or `BOTH` and a hashed PIN in the database.

Running `pnpm seed:all` satisfies all of these.

---

## Step 1 — Floor Login

**Endpoint:** `POST /api/auth/floor/login`

**Body:**
```json
{ "deviceCode": "DEV-WH-0001-01", "badgeNumber": "USR-0000", "pin": "1234" }
```

**What happens:**
1. The device is looked up by `code`. Its `warehouseId` and `zoneId` are read.
2. The user is found by `badgeNumber` and the hashed PIN is verified with bcrypt.
3. A short-lived `accessToken` is signed with `signAccessToken` from `src/lib/auth/jwt.ts`. The payload carries `{ userId, role, warehouseId, zoneId, deviceId }`.
4. A `UserActivityEntry` is written with `actionType = LOGIN`.
5. The token is returned to the client.

**Key point:** `warehouseId` and `zoneId` come from the device, not from user input. A floor worker never chooses their location — the physical device determines it.

**Relevant files:**
- `src/app/api/auth/floor/login/route.ts`
- `src/lib/auth/jwt.ts` — `signAccessToken`

---

## Step 2 — List Available Orders

**Endpoint:** `GET /api/warehouse/orders/purchase`

**Auth:** Bearer token from Step 1. The middleware reads `warehouseId` from the token payload.

**What happens:**
1. The route reads `payload.warehouseId` from the verified JWT.
2. It queries `PurchaseOrder` where `{ warehouseId, status: RELEASED, deletedAt: null }`.
3. Returns the list to the client.

No audit record is written — reads are not logged.

**Relevant files:**
- `src/app/api/warehouse/orders/[orderType]/route.ts`

---

## Step 3 — Start the Order

**Endpoint:** `POST /api/warehouse/orders/purchase/{id}/start`

**What happens:**
1. The PO is loaded. Its status must be `RELEASED` and its `warehouseId` must match the token.
2. Inside a single Prisma transaction:
   - The PO status is updated to `EXECUTING` via `updateMany` (optimistic lock pattern — only updates if status is still RELEASED).
   - An `OrderAssignment` is upserted: if one already exists for `(orderType=PURCHASE, orderId, userId)`, it is updated to `status=STARTED`; otherwise a new row is created. The assignment receives the `zoneId` from the token — this is required later for execution activity creation.
   - A `UserActivityEntry` is written with `actionType = ORDER_STARTED`.
3. The response includes `{ id, status, orderAssignmentId }`. The `orderAssignmentId` is required for all subsequent steps.

**Why the OrderAssignment matters:** Every `OrderExecutionActivity` row requires an `orderAssignmentId`. The assignment is the link between a specific user session and all the work they perform on an order. It is also how the system knows which zone the work happened in.

**Relevant files:**
- `src/app/api/warehouse/orders/[orderType]/[id]/start/route.ts`
- `src/lib/orders/purchase/transition-purchase-order.ts` — `startPurchaseOrder`

---

## Step 4 — Fetch the Receipt

**Endpoint:** `GET /api/warehouse/orders/purchase/{id}/receipt`

**What happens:**
1. The route queries the first non-deleted `PurchaseOrderReceipt` for the PO.
2. It validates that `receipt.warehouseId` matches the token's `warehouseId`.
3. It returns the receipt with its primary lines (`correctionOfLineId IS NULL`):

```json
{
  "id": "...",
  "reference": "RCT-...",
  "status": "OPEN",
  "lines": [
    {
      "id": "...",
      "purchaseOrderLineId": "...",
      "itemId": "...",
      "itemNameSnapshot": "Widget A",
      "uom": "EA",
      "orderedQuantity": "100.0000",
      "quantity": "0.0000",
      "disposition": "ACCEPTED",
      "notes": null
    }
  ]
}
```

No audit record is written.

**Relevant files:**
- `src/app/api/warehouse/orders/[orderType]/[id]/receipt/route.ts`
- `src/lib/orders/purchase/receipt/receipt-order-queries.ts` — `getActiveReceiptForPurchaseOrder`

---

## Step 5 — Handle Each Receipt Line

**Endpoint:** `POST /api/warehouse/orders/purchase/{id}/receipt/{receiptId}/lines/{lineId}/handle`

**Body:**
```json
{
  "quantity": 100,
  "disposition": "ACCEPTED",
  "orderAssignmentId": "...",
  "toBinId": "...",
  "notes": "Received in good condition"
}
```

This step is called once per receipt line. It is the most complex step and writes the most records.

**What happens:**

**1. Receipt status transition (OPEN → IN_PROGRESS)**
If this is the first line being handled (`receipt.status === OPEN`), the receipt is transitioned to `IN_PROGRESS` via `updateMany`. The `startedById` and `startedAt` fields are set. This transition happens outside the main transaction so that subsequent parallel line handles don't conflict.

**2. Confirm line handled (via `confirmPurchaseReceiptLineHandled`)**
Inside a Prisma transaction:
- The `PurchaseOrderReceiptLine` is loaded and validated.
- The `OrderAssignment` is loaded via `loadAssignmentForActivity` — this validates that the assignment is STARTED or RESUMED and belongs to the right user and warehouse.
- If `toBinId` is provided, a stock move is built and `recordOrderStockActivityInTx` is called:
  - An `OrderExecutionActivity` row is written with `activityType = LINE_RECEIVED`.
  - A `BinOperationEntry` row is written with `type = RECEIVE`, linking to the OEA.
  - The OEA is then back-patched with the BOE ID (resolving the circular reference by pre-generating both UUIDs before the transaction).
- If `toBinId` is not provided, only the OEA is written (no BOE).
- The `PurchaseOrderReceiptLine` is updated: `quantity`, `disposition`, `notes`, and `orderExecutionActivityId` are set.
- Receipt rollups are recomputed (`recomputePurchaseOrderReceiptRollups`).

**3. Stock records (outside the main transaction, when toBinId is provided)**
After the main transaction commits, a second transaction:
- Upserts a `BinStockItem` for `(binId, itemId, uom)` — increments `quantityAvailable` if a row exists, creates one otherwise. Snapshots `name` and `sku` from the catalog item.
- Updates the bin's `currentCapacity` by the received quantity.
- Creates an `ItemLedgerEntry` with `eventType = RECEIPT` and a positive `quantityDelta`.

**The full record chain for one handled line with a destination bin:**

```
OrderExecutionActivity (LINE_RECEIVED)
  └── BinOperationEntry (RECEIVE, type=RECEIVE, affectsFiscalStock=true)
BinStockItem (upserted — quantity added to bin)
Bin.currentCapacity (incremented)
ItemLedgerEntry (RECEIPT, quantityDelta=+N)
```

**Relevant files:**
- `src/app/api/warehouse/orders/[orderType]/[id]/receipt/[receiptId]/lines/[lineId]/handle/route.ts`
- `src/lib/orders/purchase/receipt/receipt-order-mutations.ts` — `confirmPurchaseReceiptLineHandled`
- `src/lib/logs/order-execution/record-order-stock-activity.ts` — `recordOrderStockActivityInTx`
- `src/lib/stock/stock-mutations.ts` — `upsertAvailableStockItem`, `updateBinCapacityBy`

---

## Step 6 — Complete the Receipt

**Endpoint:** `POST /api/warehouse/orders/purchase/{id}/receipt/{receiptId}/complete`

**Body:**
```json
{ "orderAssignmentId": "...", "notes": "All items received" }
```

**What happens** (inside a single Prisma transaction):

1. The receipt is validated: status must be `OPEN` or `IN_PROGRESS`.
2. The PO is validated: status must be `EXECUTING`.
3. All primary receipt lines are inspected: if any have `disposition !== ACCEPTED`, the outcome is `WITH_PROBLEMS`.
4. Status updates:
   - `PurchaseOrderReceipt.status` → `COMPLETED` or `COMPLETED_WITH_PROBLEMS`
   - `PurchaseOrderReceipt.completedAt` and `completedById` are set.
   - `PurchaseOrder.status` → `EXECUTED` or `EXECUTED_WITH_PROBLEMS`
   - `PurchaseOrder.executionCompletedAt` is set.
   - `OrderAssignment.status` → `COMPLETED`, `completedAt` and `isActive=false` are set.
5. A `UserActivityEntry` is written with `actionType = ORDER_EXECUTED`.

The response includes the final statuses of all four entities.

**Relevant files:**
- `src/app/api/warehouse/orders/[orderType]/[id]/receipt/[receiptId]/complete/route.ts`
- `src/lib/orders/purchase/receipt/complete-purchase-order-receipt.ts` — `completePurchaseOrderReceipt`

---

## Step 7 — Logout

**Endpoint:** `POST /api/auth/logout`

Writes a `UserActivityEntry` with `actionType = LOGOUT` and clears the session.

---

## The Full Audit Trail

After a successful execution with N receipt lines, the database contains:

| Model | Count | Key fields |
|-------|-------|------------|
| `UserActivityEntry` | 3 | LOGIN, ORDER_STARTED, ORDER_EXECUTED (+ optional LOGOUT) |
| `OrderAssignment` | 1 | status=COMPLETED, completedAt set |
| `OrderExecutionActivity` | N | one per line, activityType=LINE_RECEIVED |
| `BinOperationEntry` | N | one per line (when toBinId provided), type=RECEIVE |
| `ItemLedgerEntry` | N | one per line (when toBinId provided), eventType=RECEIPT |
| `BinStockItem` | 1–N | one per unique (bin, item, uom) combination |

The `OrderAssignment` links all OEA rows to the user session. Each `OEA` links to its `BOE`, and each `BOE` links to its `ILE` via `boeId`. The chain from user action down to fiscal stock impact is fully traceable.

---

## Disposition Handling

When a worker handles a line, they declare a `ReceiptOutcome`:

| Disposition | Meaning | Effect on order status |
|-------------|---------|------------------------|
| `ACCEPTED` | Goods received in full | No flag |
| `REJECTED` | Goods refused / sent back | `EXECUTED_WITH_PROBLEMS` |
| `QUARANTINED` | Goods held pending inspection | `EXECUTED_WITH_PROBLEMS` |
| `DAMAGED` | Goods physically damaged | `EXECUTED_WITH_PROBLEMS` |
| `QUALITY_ISSUE` | Goods fail quality check | `EXECUTED_WITH_PROBLEMS` |
| `OTHER` | Catch-all non-acceptance | `EXECUTED_WITH_PROBLEMS` |

A single non-ACCEPTED line causes the entire PO to finish as `EXECUTED_WITH_PROBLEMS`. Both the PO status and receipt status reflect this.

---

## Correction Flow (line reversal)

If a worker incorrectly declared a line, it can be reversed without editing the original record. `reversePurchaseReceiptLine` creates a correction line (`correctionOfLineId` is set to the original line's ID) with a negative quantity and `disposition = CORRECTION`. The original line is never modified. Both entries remain in the database permanently.

Rollups (`recomputePurchaseOrderReceiptRollups`) account for correction lines by summing the net quantity across all lines sharing the same `purchaseOrderLineId`.

**Relevant files:**
- `src/lib/orders/purchase/receipt/receipt-order-mutations.ts` — `reversePurchaseReceiptLine`

---

## Running the Flow as a Developer

### Option A — CLI simulation script

The fastest way to run through the entire flow end-to-end:

```bash
# Terminal 1: seed and start the server
pnpm seed:all
pnpm dev

# Terminal 2: run the simulation
pnpm simulate
```

The script (`simulation/run-purchase-order.ts`) uses axios to call all 7 endpoints in sequence and then queries the database directly to print an audit trail summary. It uses the seeded owner credentials (`USR-0000` / `1234`).

### Option B — Dashboard simulation panel

With `IS_DEMO=true pnpm dev`, the dashboard sidebar shows a "Simulation" section. Clicking "Purchase Order" opens a modal where you select a floor worker, a RELEASED order, and an empty destination bin, then watch each step execute with live feedback. After completion, four sheet views display the full audit trail.

### Option C — Direct HTTP calls

All floor API endpoints accept `Authorization: Bearer <token>`. Get a token via `POST /api/auth/floor/login` and call the endpoints in the order described in this document.

---

## Key Invariants

- **The OrderAssignment's zoneId is required.** `createExecutionActivityInTx` throws if the assignment has no `zoneId`. Floor login always embeds `zoneId` from the device, and `startPurchaseOrder` stores it on the assignment.
- **`confirmPurchaseReceiptLineHandled` always runs in a transaction.** The OEA and BOE are written together or not at all.
- **BinStockItem and ItemLedgerEntry are written in a separate transaction.** This is an intentional design — the execution activity is committed first, then stock accounting follows. A failure in the stock transaction does not roll back the OEA/BOE.
- **Receipt lines with `correctionOfLineId` set are ignored** when determining PO completion outcome. Only primary lines count.
- **Decimal quantities are stored as `Prisma.Decimal`** throughout to avoid floating-point precision loss.
