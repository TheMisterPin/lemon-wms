'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/tables/table-row.md
 */

import { CellRenderer } from '@/components/primitives/tables/cells/cell-renderer'
import { Button } from '@/components/ui/button'
import {
  TableCell,
  TableRow
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { getStableColumnConfigKey, resolveRowStyleClassNames } from '@/lib/utils/table'
import type { ColumnConfig } from '@/types/components/table/column.types'
import type { RowAction, RowStyleIfConfig } from '@/types/components/table/generic-table.types'

export function TableDataRow<T extends { id: string }>({
  row,
  visibleColumns,
  actions,
  onRowClick,
  selectedId,
  rowStyleIf
}: {
  row: T
  visibleColumns: ColumnConfig<T>[]
  actions?: RowAction<T>[]
  onRowClick?: (row: T) => void
  selectedId?: string
  rowStyleIf?: RowStyleIfConfig
}) {
  const rowRuleClass = rowStyleIf
    ? resolveRowStyleClassNames(row, rowStyleIf.rules, rowStyleIf.defaultClassName)
    : ''

  return (
    <TableRow
      className={[
        'border-b border-dash-border transition-colors duration-200',
        onRowClick ? 'cursor-pointer hover:bg-dash-card2' : 'hover:bg-dash-card2/50',
        selectedId === row.id ? 'bg-dash-card2' : '',
        rowRuleClass
      ].filter(Boolean).join(' ')}
      onClick={() => onRowClick?.(row)}
      data-state={selectedId === row.id ? 'selected' : undefined}
    >
      {visibleColumns.map((column, index) => (
        <TableCell
          key={getStableColumnConfigKey(column, index)}
          className="text-center text-dash-text/90 text-sm select-none"
        >
          <CellRenderer row={row} column={column} />
        </TableCell>
      ))}
      {actions?.length ? (
        <TableCell className="text-center">
          <div className="flex items-center justify-center gap-1">
            {actions.map((action, index) => {
              const icon =
                typeof action.icon === 'function' ? action.icon(row) : action.icon
              const tooltip =
                typeof action.tooltip === 'function'
                  ? action.tooltip(row)
                  : action.tooltip
              const actionClass =
                action.className === undefined
                  ? ''
                  : typeof action.className === 'function'
                    ? action.className(row)
                    : action.className

              return (
                <Tooltip key={`${row.id}-${index}`}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={[
                        'size-8 rounded-md text-dash-muted hover:text-dash-text hover:bg-dash-card2 transition-colors duration-200',
                        actionClass
                      ].filter(Boolean).join(' ')}
                      onClick={(e) => {
                        e.stopPropagation()
                        action.onClick(row)
                      }}
                    >
                      {icon}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {tooltip}
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        </TableCell>
      ) : null}
    </TableRow>
  )
}
