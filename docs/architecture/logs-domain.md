# Logs domain (UAE → BOE → ILE)

The logs domain is append-only system memory for Lemon WMS and is split into three layers:

- `UserActivityEntry` (UAE): who did what, and when.
- `BinOperationEntry` (BOE): what physically moved, from where, to where.
- `ItemLedgerEntry` (ILE): total warehouse stock deltas.

## Invariants

1. Write order is always `UAE -> BOE -> ILE`.
2. The full chain for one user action is written in a single transaction.
3. Log timestamps are DB-driven (`@default(now())`) and never set by app code.
4. Logs are append-only. No update/delete services are provided for log rows.
5. Corrections are compensating entries, not in-place edits.
6. `metadata` is structured JSON per action type; `notes` is free text.

## Action type registry

Canonical action-type constants are defined in:

- `src/lib/entities/logs/action-types.ts`

This keeps action names and auth metadata reasons/methods centralized for reuse across domain flows.

## Current usage

The auth flows now emit UAE entries through:

- `createUserActivityEntry(...)` in `src/lib/entities/logs/create-user-activity-entry.ts`

This helper enforces a single create-only write path for UAE from service code.
