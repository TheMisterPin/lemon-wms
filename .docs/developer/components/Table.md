# Table components (`src/components/tables`)

Client-side table UI for dashboard-style lists: declarative columns, typed cells, optional search/sort/pagination, row actions.

## Entry points

| Export | Use when |
|--------|----------|
| `GenericTable` | Default: full feature set (search, sort, pagination, shell chrome). |
| `TableShell` | Custom data pipeline but same chrome as `GenericTable` (you own filter/sort/page state). |
| `CheckBoxTable` | Simple key/label columns + row selection (`Set<string>` ids). No typed cells. |
| Lower-level | `TableHeaderRow`, `TableBodyRows`, `TableDataRow`, `CellRenderer`, individual `*Cell` — only if composing outside `GenericTable`. |

Barrel: `@/components/tables` (see `index.ts`).

## Requirements

- Row type **`T extends { id: string }`** — stable `id` for keys and selection.
- Column configs use **`ColumnConfig<T>`** from `@/types/components/table/column.types`.
- Table props / shared types: `@/types/components/table/generic-table.types`.

## `GenericTable`

```tsx
import { GenericTable } from '@/components/tables/generic-table'
import type { ColumnConfig } from '@/types/components/table/column.types'

const columns: ColumnConfig<MyRow>[] = [
  { label: 'Name', accessor: 'name' },
  { label: 'Active', accessor: 'isActive', type: 'boolean' }
]

<GenericTable
  columns={columns}
  records={rows}
  title="Items"
  entityTone="item"
  emptyMessage="Nothing here."
/>
```

### Props (high level)

- **`columns`** / **`records`** — required.
- **`title`**, **`titleIcon`**, **`entityTone`** — optional header styling (`entityTone`: `warehouse` \| `zone` \| `bin` \| `item` \| `order`).
- **`headerButtons`** — `ReactNode` next to search (e.g. primary actions).
- **`onRowClick`**, **`selectedId`** — row highlight + click handler (whole row clickable; action buttons stop propagation).
- **`actions`** — `RowAction<T>[]`: per-row icon buttons with tooltip + `onClick(row)`.
- **`emptyMessage`** — empty state copy.
- **`search`** — omitted → search **on** (default placeholder). `false` → off. Object: `placeholder`, optional `fields` (accessor names to include in filter text; default uses all data columns).
- **`pagination`** — controlled: `{ page, totalPages, onPrev, onNext, position?: 'header' | 'footer' }`. If omitted, you can use built-in paging via **`pageSize`** (positive number slices sorted rows client-side; mutually exclusive with `pagination`).
- **`rowStyleIf`** — conditional row classes from accessors (see types: `RowStyleIfConfig`).

Behavior is implemented in `generic-table.tsx`: column visibility when all values empty (`shouldHideColumnWhenAllCellsEmpty`), search (`filterRowsBySearch` from `@/lib/utils/table`), sort on **data** columns only (`sortRowsByDataColumn`), then optional slice for `pageSize`.

## Column definitions

Two shapes:

1. **Data column** — `label`, `accessor` (string path on row), optional `type` / `typeValues`, `styles` (`className`, `styleIf`), `hideIfNulls`, `ifNull`, `sortable` (default sortable for data columns; set `sortable: false` to disable).
2. **Custom column** — `label`, `cell: (row) => ReactNode`, `sortable: false` implied for sorting UI (custom columns are not sortable via header).

Default **`type`** is `'text'`. Other types dispatch in `cells/cell-renderer.tsx`:

| `type` | Role |
|--------|------|
| `text` | Formatting, clip, capitalization (`TextTypeValues`). |
| `date` | `daydate` / `datetime` / `time`. |
| `number` | Decimal/int, optional positive/negative classes. |
| `boolean` | Icons/styles for true/false. |
| `progress` | `current` / `max` accessor keys in `typeValues`. |
| `indicator` | Color/icon from value → condition map. |
| `joinValues` | Concatenate multiple accessors. |
| `operation` | Arithmetic on numeric fields (`+`, `-`, etc.). |

Column/cell styling helpers: `resolveColumnStyleClassNames`, `evaluateStyleCondition` in `@/lib/utils/table`.

## `TableShell`

Same visual shell as `GenericTable` (title band, search row, shadcn `Table`, header/footer pagination) but **no** internal sort/search/page state. Pass:

- `visibleColumns`, `displayRecords`, `searchText`, `onSearchTextChange`
- `sortColumnIndex`, `sortDirection`, `onSortColumnClick`
- `pagination`, `showHeaderPagination`, `showFooterPagination`

Use when data is pre-filtered server-side or you need a different state model.

## `CheckBoxTable`

Lightweight: `columns: { key: keyof T; label: string }[]`, `records`, optional controlled `selectedIds` or `defaultSelectedIds`, `onSelectionChange`. Renders raw `String(row[key])` — not for rich formatting.

## Utilities (`@/lib/utils/table`)

Used by `GenericTable` / cells; reuse when building custom shells:

- **Row access:** `getRowValue`, `isDataColumn`, `applyIfNull`
- **Display:** `getDataColumnRawValue`, `getDataColumnDisplayString`, `getProgressBarModel`
- **Visibility:** `shouldHideColumnWhenAllCellsEmpty`, `shouldHideDataColumnForDataset`
- **Sort:** `sortRowsByDataColumn`, `compareRowsByDataColumn`
- **Search:** `buildRowSearchText`, `rowMatchesSearch`, `filterRowsBySearch`
- **Style:** `evaluateStyleCondition`, `resolveColumnStyleClassNames`, `resolveRowStyleClassNames`
- **Operations:** `evaluateOperation` (for operation cells)

## Examples in repo

- `dashboard-items-page.tsx` — `GenericTable` with `progress`, `boolean`, external `pagination`, `search.fields`.
- `dashboard-home-page.tsx`, `dashboard-orders-page.tsx`, `warehouse-home-page.tsx`, `warehouse-bin-details-page.tsx` — more `GenericTable` usage patterns.

## Tests

Add or extend tests next to features that change table behavior; there is no single table integration test file referenced from this folder — see `src/__tests__` for API/hook coverage.
