'use client'

import {
  TableBody,
  TableCell,
  TableRow
} from '@/components/ui/table'
import type { ColumnConfig } from '@/types/components/table/column.types'
import type { RowAction, RowStyleIfConfig } from '@/types/components/table/generic-table.types'

import { TableDataRow } from './table-row'

export function TableBodyRows<T extends { id: string }>({
  visibleColumns,
  displayRecords,
  emptyMessage,
  actions,
  onRowClick,
  selectedId,
  rowStyleIf
}: {
  visibleColumns: ColumnConfig<T>[]
  displayRecords: T[]
  emptyMessage?: string
  actions?: RowAction<T>[]
  onRowClick?: (row: T) => void
  selectedId?: string
  rowStyleIf?: RowStyleIfConfig
}) {
  const totalColumns = Math.max(1, visibleColumns.length + (actions?.length ? 1 : 0))

  return (
    <TableBody>
      {displayRecords.length === 0 ? (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={totalColumns} className="text-center text-dash-muted py-12">
            {emptyMessage ?? 'No records found.'}
          </TableCell>
        </TableRow>
      ) : (
        displayRecords.map(row => (
          <TableDataRow
            key={row.id}
            row={row}
            visibleColumns={visibleColumns}
            actions={actions}
            onRowClick={onRowClick}
            selectedId={selectedId}
            rowStyleIf={rowStyleIf}
          />
        ))
      )}
    </TableBody>
  )
}
