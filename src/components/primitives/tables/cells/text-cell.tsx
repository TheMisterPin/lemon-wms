'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/tables/cells/text-cell.md
 */

import { cn } from '@/lib/utils'
import { EMPTY_DISPLAY_VALUE } from '@/lib/utils/get-value-by-path'
import {
  getDataColumnDisplayString,
  getDataColumnRawValue,
  resolveColumnStyleClassNames
} from '@/lib/utils/table'
import type { DataColumnConfig } from '@/types/components/table/column.types'

export function TextCell({ row, column }: { row: unknown, column: DataColumnConfig }) {
  let display = getDataColumnDisplayString(row, column)
  const clip = column.typeValues && 'clip' in column.typeValues ? column.typeValues.clip : undefined

  if (
    typeof clip === 'number'
    && clip > 0
    && display !== EMPTY_DISPLAY_VALUE
    && display.length > clip
  ) {
    display = `${display.slice(0, clip)}…`
  }

  const raw = getDataColumnRawValue(row, column)
  const styleClass = resolveColumnStyleClassNames(column.styles, raw)
  const isEmpty = display === EMPTY_DISPLAY_VALUE
  const userSelect =
    column.typeValues && 'userSelect' in column.typeValues && column.typeValues.userSelect === false
      ? 'select-none'
      : undefined

  return (
    <span
      className={cn(isEmpty && 'text-brand-muted', styleClass, userSelect)}
    >
      {display}
    </span>
  )
}
