---
source: src/hooks/dashboard/locations/use-bin-contents.ts
type: hook-responsibility
isCorrectCase: true
---

## Hook Responsibility

Current source: `src/hooks/dashboard/locations/use-bin-contents.ts`
Target hook file: `src/hooks/dashboard/locations/use-bin-contents.ts`
Used by:
- `src/components/features/locations/components/bin-contents-modal.tsx`
Owns fetching: yes - loads `GET /dashboard/bins/:id` through `dashboardApiClient`.
Owns mutations: no
Owns loading state: yes
Owns error state: yes
Owns DTO transformation: yes - maps bin content lines into table rows with `statusQuantity`.
Exposes actions: none

## Inputs

- `binId: string | null`
- `open: boolean`

## Returned DTO

- `bin`
- `error`
- `loading`
- `tableRows`
- `dialogTitle`
- `showSpinner`

## Actions

None. Loading is driven by `binId` and `open`.

## Dependencies

- `@/lib/axios`
- `@/lib/locations`
- `@/types/dto/locations/bin-contents`
- `@/types/responses/basic-response`

## Refactor Notes

Created during the locations first-slice cleanup so `BinContentsModal` no longer imports `dashboardApiClient` or owns request lifecycle state. The modal stays responsible for Dialog/TableShell rendering and local table interaction state.

## Refactor Status

Status: moved
Old path: inline logic in `src/components/dashboard/features/bins/bin-contents-modal.tsx`
New path: `src/hooks/dashboard/locations/use-bin-contents.ts`
Related files:
- `src/components/features/locations/components/bin-contents-modal.tsx`
- `src/types/dto/locations/bin-contents.ts`
Imports updated: yes
Typecheck status: `pnpm exec tsc --noEmit` passed; targeted ESLint passed; full `pnpm lint` still has unrelated pre-existing repo failures.
Notes: Hook keeps the existing user-facing loading and error messages.
