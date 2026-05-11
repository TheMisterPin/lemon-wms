'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/tables/cells/boolean-cell.md
 */

import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { EMPTY_DISPLAY_VALUE } from '@/lib/utils/get-value-by-path'
import { getDataColumnRawValue, resolveColumnStyleClassNames } from '@/lib/utils/table'
import type { DataColumnConfig } from '@/types/components/table/column.types'

export function BooleanCell({ row, column }: { row: unknown, column: DataColumnConfig }) {
  const value = getDataColumnRawValue(row, column)
  const styleClass = resolveColumnStyleClassNames(column.styles, value)
  const tv = column.type === 'boolean' ? column.typeValues : undefined

  if (typeof value !== 'boolean') {
    return (
      <span className={cn('text-brand-muted', styleClass)}>
        {EMPTY_DISPLAY_VALUE}
      </span>
    )
  }

  if (tv?.trueIcon !== undefined || tv?.falseIcon !== undefined) {
    const node = value ? tv.trueIcon : tv.falseIcon

    return (
      <div className={cn('flex justify-center', styleClass)}>
        {node ?? (
          <span className="text-brand-muted">{EMPTY_DISPLAY_VALUE}</span>
        )}
      </div>
    )
  }

  return (
    <div className={cn('flex justify-center', styleClass)}>
      <Checkbox
        checked={value}
        disabled
        aria-label={`${column.label}: ${value ? 'checked' : 'unchecked'}`}
        className="pointer-events-none"
      />
    </div>
  )
}
