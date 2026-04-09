# Domain Module: Purchase Order Transitions

## General overview

This module controls legal order status changes.  
It prevents invalid transitions and enforces warehouse ownership rules for floor actions.

## Main functions

- `releasePurchaseOrder()`
  - allows draft order to become released
- `startPurchaseOrder()`
  - allows released order to become executing
- `pausePurchaseOrder()`
  - allows executing order to become paused
- `resumePurchaseOrder()`
  - allows paused order to become executing again

## Shared support functions

- `loadActivePurchaseOrder()`
  - retrieves an order and rejects missing/soft-deleted records
- `assertWarehouseMatch()`
  - verifies warehouse user is acting on their own warehouse order

## Transition process pattern

For each transition function:

- step 1: load active order
- step 2: validate warehouse ownership when required
- step 3: validate current status is allowed
- step 4: update using guarded condition (compare-and-set style)
- step 5: return minimal success payload

## Why guarded updates are used

- helps avoid race-condition overwrites
- if another process already changed status, update count is zero and function returns a clear transition error

## Common failure outcomes

- order not found
- order belongs to different warehouse
- attempted transition from invalid current status
