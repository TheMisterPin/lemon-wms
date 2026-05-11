'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/tables/cells/indicator-cell.md
 */

import { cn } from '@/lib/utils'
import {
  getDataColumnDisplayString,
  getDataColumnRawValue,
  resolveColumnStyleClassNames
} from '@/lib/utils/table'
import type { DataColumnConfig } from '@/types/components/table/column.types'

function resolveIndicatorColor(
  value: unknown,
  colorMap: Record<string, string>,
  fallbackColor = '#94a3b8'
): string {
  const indicatorKey = String(value ?? '').trim().toLowerCase()

  if (!indicatorKey) {
    return fallbackColor
  }

  const directMatch = colorMap[indicatorKey]

  if (directMatch) {
    return directMatch
  }

  const normalizedMatch = Object.entries(colorMap).find(
    ([key]) => key.trim().toLowerCase() === indicatorKey
  )

  return normalizedMatch?.[1] ?? fallbackColor
}

function indicatorAnimationClass(animation?: 'blink' | 'none' | 'spin'): string {
  if (animation === 'none') {
    return ''
  }

  if (animation === 'spin') {
    return 'animate-spin'
  }

  return 'animate-pulse'
}

export function IndicatorCell({ row, column }: { row: unknown, column: DataColumnConfig }) {
  const value = getDataColumnRawValue(row, column)
  const displayValue = getDataColumnDisplayString(row, column)
  const styleClass = resolveColumnStyleClassNames(column.styles, value)

  if (column.type !== 'indicator') {
    return <span className={cn('text-brand-muted', styleClass)}>{displayValue}</span>
  }

  const tv = column.typeValues
  const conditions = tv?.conditions ?? {}
  const fallback = tv?.defaultColor ?? '#94a3b8'
  const color = resolveIndicatorColor(value, conditions, fallback)
  const syncBlink = Boolean(tv?.syncBlink)
  const anim = syncBlink ? '' : indicatorAnimationClass(tv?.animation)

  return (
    <div className={cn('flex min-h-10 min-w-10 items-center justify-center px-1 py-2', styleClass)}>
      <span
        data-indicator-dot=""
        className={cn('size-3.5 shrink-0 rounded-full', anim)}
        style={{
          backgroundColor: color,
          boxShadow: `0 0 6px ${color}55, 0 0 10px ${color}28`
        }}
        aria-label={`${column.label}: ${displayValue}`}
      />
    </div>
  )
}
