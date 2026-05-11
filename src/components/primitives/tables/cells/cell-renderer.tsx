'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/tables/cells/cell-renderer.md
 */

import { isDataColumn, resolveColumnStyleClassNames } from '@/lib/utils/table'
import type { ColumnConfig } from '@/types/components/table/column.types'

import { BooleanCell } from './boolean-cell'
import { DateCell } from './date-cell'
import { IndicatorCell } from './indicator-cell'
import { JoinValuesCell } from './join-values-cell'
import { NumberCell } from './number-cell'
import { OperationCell } from './operation-cell'
import { ProgressCell } from './progress-cell'
import { TextCell } from './text-cell'

export function CellRenderer<T extends { id: string }>({
  row,
  column
}: {
  row: T
  column: ColumnConfig<T>
}) {
  if (!isDataColumn(column)) {
    const wrapperClass = resolveColumnStyleClassNames(column.styles, undefined)

    return (
      <div className={wrapperClass || undefined}>
        {column.cell(row)}
      </div>
    )
  }

  const colType = column.type ?? 'text'

  switch (colType) {
  case 'text':
    return <TextCell row={row} column={column} />
  case 'date':
    return <DateCell row={row} column={column} />
  case 'number':
    return <NumberCell row={row} column={column} />
  case 'boolean':
    return <BooleanCell row={row} column={column} />
  case 'progress':
    return <ProgressCell row={row} column={column} />
  case 'indicator':
    return <IndicatorCell row={row} column={column} />
  case 'joinValues':
    return <JoinValuesCell row={row} column={column} />
  case 'operation':
    return <OperationCell row={row} column={column} />
  default:
    return <TextCell row={row} column={column} />
  }
}
