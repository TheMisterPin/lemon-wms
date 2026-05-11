'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/tables/cells/progress-cell.md
 */

import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { EMPTY_DISPLAY_VALUE } from '@/lib/utils/get-value-by-path'
import {
  getDataColumnRawValue,
  getProgressBarModel,
  resolveColumnStyleClassNames
} from '@/lib/utils/table'
import type { DataColumnConfig } from '@/types/components/table/column.types'

export function ProgressCell({ row, column }: { row: unknown, column: DataColumnConfig }) {
  if (column.type !== 'progress') {
    return (
      <span className="text-brand-muted">{EMPTY_DISPLAY_VALUE}</span>
    )
  }

  const model = getProgressBarModel(row, column)
  const raw = getDataColumnRawValue(row, column)
  const resolvedStyles = resolveColumnStyleClassNames(column.styles, raw)
  const styleClass = cn(
    'mx-auto flex w-full max-w-36 items-center gap-2',
    resolvedStyles
  )

  if (!model) {
    return <span className="text-brand-muted">{EMPTY_DISPLAY_VALUE}</span>
  }

  const roundedPercentage = Math.round(model.percentage)

  return (
    <div className={styleClass}>
      <Progress
        value={model.percentage}
        className="flex-1"
        aria-label={`${column.label}: ${model.current} of ${model.max} (${roundedPercentage}%)`}
      />
      <span className="min-w-10 text-right text-xs text-brand-muted tabular-nums">
        {roundedPercentage}%
      </span>
    </div>
  )
}
