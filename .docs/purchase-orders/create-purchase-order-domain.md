# Domain Module: Create Purchase Order

## General overview

This domain module creates purchase orders safely and consistently.  
It ensures business rules are checked before data is written.

## Main function

- `createPurchaseOrder()`
  - performs all creation work inside one database transaction
  - returns a compact summary that UI can use immediately

## Process flow

- step 1: validates warehouse is active and available
- step 2: validates supplier is active and valid
- step 3: checks each requested line item belongs to that supplier
- step 4: builds normalized line data (including uom and sequence)
- step 5: creates purchase order and lines together
- step 6: returns id, reference, status, and line summary

## Why transaction is important

- if any validation fails, no partial order data is saved
- this avoids broken orders with missing lines

## Typical failure reasons

- warehouse not found or inactive
- supplier not found or inactive
- item does not belong to chosen supplier
- invalid quantity data from request layer
