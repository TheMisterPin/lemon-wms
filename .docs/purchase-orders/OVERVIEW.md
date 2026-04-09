# Purchase Orders Documentation Overview

## What this part of the system introduced

This purchase-orders slice introduced a complete office-to-warehouse workflow:

- office users can create supplier purchase orders
- office users can release draft orders to operations
- warehouse users can view operational orders by status
- warehouse users can start, pause, and resume execution

The same order record is shared across dashboard and floor views, so both sides see one source of truth.

## End-to-end flow (plain English)

1. Office opens the purchase orders page.
2. Office clicks **New purchase order**.
3. System asks for supplier, warehouse, and reference.
4. System loads supplier items.
5. Office selects items and quantities.
6. System validates and creates the order in one transaction.
7. Order starts in **DRAFT**.
8. Office clicks release.
9. Order becomes **RELEASED** and appears in floor operations list.
10. Warehouse operator clicks start -> order becomes **EXECUTING**.
11. Warehouse operator can pause -> **PAUSED**, then resume -> **EXECUTING**.

## Main files and responsibilities

- `create-purchase-order.ts`: creates order + lines safely in one transaction
- `transition-purchase-order.ts`: controls legal status changes and warehouse authorization
- `dashboard-orders-page.tsx`: office list page and release action
- `create-purchase-order-modal.tsx`: office create flow in 2 steps
- `use-purchase-orders.ts`: warehouse data/action orchestration hook
- `warehouse-orders-page.tsx`: warehouse status cards, filtering, and action UI

## What changed recently

- stronger hardening around move-operation typing used by related warehouse paths
- added regression tests around warehouse order hook behavior
- build/type issues in adjacent operational code were corrected so release pipelines are stable

## Possible bottlenecks and risk points

- supplier catalog load can delay modal step progression if API/database is slow
- high order volume can slow list rendering/filtering when many rows are returned
- repeated action clicks can trigger user confusion; UI protects with busy state, but network latency still affects perceived speed
- strict transition rules are intentional; users may report "cannot start/pause/resume" when status is not in a legal state
- cross-team dependency: office release timing directly affects warehouse visibility

## Operational troubleshooting hints

- if orders do not appear on floor, check if office actually released them
- if create fails, verify supplier and item relationships are valid
- if start/pause/resume fails, verify current status and warehouse ownership
- if lists look stale, refresh list endpoint first before deeper debugging
