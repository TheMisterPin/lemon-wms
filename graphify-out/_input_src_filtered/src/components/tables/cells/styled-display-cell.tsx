'use client'

import { cn } from '@/lib/utils'
import { EMPTY_DISPLAY_VALUE } from '@/lib/utils/get-value-by-path'
import {
  getDataColumnDisplayString,
  getDataColumnRawValue,
  resolveColumnStyleClassNames
} from '@/lib/utils/table'
import type { DataColumnConfig } from '@/types/components/table/column.types'

export function StyledDisplayCell({
  row,
  column,
  extraClassName
}: {
  row: unknown
  column: DataColumnConfig
  extraClassName?: string
}) {
  const display = getDataColumnDisplayString(row, column)
  const raw = getDataColumnRawValue(row, column)
  const styleClass = resolveColumnStyleClassNames(column.styles, raw)
  const isEmpty = display === EMPTY_DISPLAY_VALUE

  return (
    <span
      className={cn(isEmpty && 'text-brand-muted', styleClass, extraClassName)}
    >
      {display}
    </span>
  )
}
