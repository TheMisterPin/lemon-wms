# Component: Create Purchase Order Modal

## General overview

This component is the office-side order creation assistant.  
It guides the user through two simple steps so mistakes are reduced before submit.

## What it does

- opens from dashboard orders page
- generates a human-readable order reference
- loads suppliers and warehouses for selection
- validates required fields before moving forward
- loads supplier items
- lets user select items and enter quantities
- sends final payload to create endpoint
- refreshes parent list on success

## Important functions in plain English

- `buildOrderNo()`
  - creates the next order reference using order type + running count
- `getApiMessage()`
  - turns technical API errors into understandable user messages
- `loadSupplierItems()`
  - loads all selectable items for one supplier and resets stale selections
- `handleNextStep()`
  - validates step 1 fields and advances only when valid
- `handleCreate()`
  - validates selected lines, builds payload, sends create request, and triggers table refresh
- `resetModal()`
  - clears all temporary modal data and returns to initial state

## Multi-step process summary

- step 1: validates order reference, supplier, and warehouse
- step 2: loads supplier items and collects checked quantities
- step 3: validates final line payload
- step 4: creates order and closes modal on success

## Notes for non-technical readers

- this component does not create inventory movement
- it only creates the order record and line details
- warehouse execution starts later after release
