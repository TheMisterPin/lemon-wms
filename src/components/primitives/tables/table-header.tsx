'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/tables/table-header.md
 */

import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

import {
  TableHead,
  TableRow
} from '@/components/ui/table'
import { getStableColumnConfigKey, isDataColumn } from '@/lib/utils/table'
import type { ColumnConfig } from '@/types/components/table/column.types'
import type { RowAction, SortDirection } from '@/types/components/table/generic-table.types'

export function isSortableColumn<T extends { id: string }>(column: ColumnConfig<T>): boolean {
  if (!isDataColumn(column)) {
    return false
  }

  return column.sortable !== false
}

function getSortIcon(sortColumnIndex: number | null, index: number, sortDirection: SortDirection) {
  if (sortColumnIndex !== index) {
    return <ArrowUpDown className="size-3.5 text-dash-muted opacity-50" />
  }

  if (sortDirection === 'asc') {
    return <ArrowUp className="size-3.5 text-brand-primary" />
  }

  return <ArrowDown className="size-3.5 text-brand-primary" />
}

export function TableHeaderRow<T extends { id: string }>({
  visibleColumns,
  sortColumnIndex,
  sortDirection,
  onSortColumnClick,
  actions
}: {
  visibleColumns: ColumnConfig<T>[]
  sortColumnIndex: number | null
  sortDirection: SortDirection
  onSortColumnClick: (visibleColumnIndex: number) => void
  actions?: RowAction<T>[]
}) {
  return (
    <TableRow className="border-b border-dash-border hover:bg-transparent">
      {visibleColumns.map((column, index) => {
        const sortable = isSortableColumn(column)
        const isActive = sortColumnIndex === index

        return (
          <TableHead
            key={getStableColumnConfigKey(column, index)}
            className={[
              'bg-dash-card2 text-dash-muted text-xs font-semibold uppercase tracking-wider text-center select-none transition-colors duration-200',
              sortable ? 'cursor-pointer hover:text-dash-text hover:bg-dash-bg' : '',
              isActive ? 'bg-dash-bg text-brand-primary' : ''
            ].filter(Boolean).join(' ')}
            onClick={sortable ? () => onSortColumnClick(index) : undefined}
          >
            <div className="flex items-center justify-center gap-1.5">
              {column.label}
              {sortable ? getSortIcon(sortColumnIndex, index, sortDirection) : null}
            </div>
          </TableHead>
        )
      })}
      {actions?.length ? (
        <TableHead className="bg-dash-card2 text-dash-muted text-xs font-semibold uppercase tracking-wider text-center select-none">
          Actions
        </TableHead>
      ) : null}
    </TableRow>
  )
}
