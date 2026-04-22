# Order Execution Mutations — Architecture

## Overview

This system handles how work is performed in a warehouse environment.

There are two separate responsibilities:

- Assignment lifecycle → who owns the work session
- Execution activity → what work was actually done

These are intentionally separated to avoid mixing:
- session ownership
- business execution
- stock movement

---

## Design Philosophy

This is not a CRUD system.

Mutations represent **real business actions**, not database operations.

Bad:
- updateAssignmentStatus(id, status)

Good:
- pauseOrderAssignment(...)
- recordLinePicked(...)

Each mutation should read like something a warehouse operator actually did.

---

## Assignment Lifecycle

An assignment represents a **work session**.

It answers:
- who is working on the order
- when they started
- when they paused
- when they finished

### Lifecycle States

- ASSIGNED
- STARTED
- PAUSED
- RESUMED
- COMPLETED
- RELEASED
- CANCELLED
- TIMED_OUT

### Important Rule

Only **one active assignment** is allowed for:
(orderType + orderId + userId)

However:
- historical assignments are preserved
- users can be reassigned later

---

## Execution Activity

Execution activity represents **actual work performed**.

Examples:
- picking items
- receiving goods
- packing
- handling exceptions

These are stored as **immutable events**.

### Key Rule

Activities are:
- append-only
- never updated
- never deleted

---

## Allowed Execution States

Activities can only be recorded when the assignment is:

- STARTED
- RESUMED

They are NOT allowed when:

- PAUSED
- COMPLETED
- RELEASED
- CANCELLED
- TIMED_OUT

---

## Mutation Structure

Every mutation follows the same pattern:

1. Load assignment
2. Validate state
3. Validate context (user, warehouse, order)
4. Apply change
5. Persist in a transaction
6. Return DTO

---

## Lifecycle Transitions

Assignments follow strict transitions.

Example:

- ASSIGNED → STARTED
- STARTED → PAUSED
- PAUSED → RESUMED
- RESUMED → COMPLETED

Invalid transitions must fail loudly.

---

## Why This Matters

Without strict transitions:
- sessions become inconsistent
- debugging becomes impossible
- audit trails lose meaning

This system ensures:
- traceability
- correctness
- debuggability

---

## Execution vs Movement

Execution activity does NOT track:
- bin movements
- stock deltas

Those belong to separate systems.

Execution answers:
> what step was performed

Movement answers:
> what physically changed

---

## Mutation Design Rules

### Good mutations

- startOrderAssignment
- pauseOrderAssignment
- recordLinePicked
- recordExceptionRaised

### Bad mutations

- updateAssignmentStatus
- createActivity
- generic update functions

---

## Transactions

All important operations must be atomic.

Examples:
- completing assignment after last action
- raising exception and pausing session

These must succeed or fail together.

---

## Error Handling

Failures must be explicit.

Examples:
- invalid transition
- assignment not found
- activity on paused session
- mismatched warehouse

Never silently ignore errors.

---

## Final Thought

This system is designed to reflect **real operational workflows**.

It should always be possible to answer:

- Who worked on this?
- What did they do?
- When did they do it?
- Why did something fail?

If those questions cannot be answered clearly, the design is wrong.