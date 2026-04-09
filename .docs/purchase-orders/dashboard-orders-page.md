# Component: Dashboard Orders Page

## General overview

This is the office-facing order list page.  
Its job is to show current purchase orders and allow release of draft orders to warehouse operations.

## What it does

- loads purchase orders for dashboard users
- normalizes date fields so the table can render correctly
- shows loading, error, and empty states
- exposes release action for draft-only rows
- refreshes list after successful release
- renders create modal entry point

## Important functions in plain English

- `getApiErrorMessage()`
  - reads useful API message text when available
- `normalizeRows()`
  - standardizes row dates before display
- `loadOrders()`
  - fetches orders from API and updates the table state
- `handleRelease()`
  - calls release endpoint for one order and reloads list

## Action behavior explained simply

- release button appears only for orders in draft
- once released, order moves to warehouse-operational statuses
- non-purchase order types currently show a clear placeholder message

## Typical user path

- step 1: open dashboard purchase orders
- step 2: review list
- step 3: create new order or release draft order
- step 4: table refreshes with latest status
