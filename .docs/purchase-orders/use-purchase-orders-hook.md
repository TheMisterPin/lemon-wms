# Hook: usePurchaseOrders

## General overview

This hook is the operational brain for the warehouse orders page.  
It centralizes data loading, filtering, and state transitions so the page component stays simple.

## What it returns

- the loaded order rows
- rows filtered by selected status
- status card counters
- loading and error states
- action-in-progress state
- helper methods for load, filter toggle, and row action

## Important methods in plain English

- `loadOrders()`
  - fetches warehouse purchase orders and updates table state
- `toggleStatusFilter()`
  - sets or clears selected status card filter
- `runAction()`
  - chooses start/pause/resume based on current row status and calls matching endpoint
- `getApiErrorMessage()`
  - converts technical request failures into operator-friendly messages

## Multi-step row action flow

- step 1: inspect current row status
- step 2: map to endpoint action (start, pause, resume)
- step 3: call endpoint and wait for success
- step 4: silently refresh list to show latest state

## Why this matters

- avoids duplicating logic in UI components
- guarantees consistent transition behavior in one place
- makes testing and future updates easier
