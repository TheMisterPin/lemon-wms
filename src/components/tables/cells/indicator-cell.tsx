'use client'

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
  const anim = indicatorAnimationClass(tv?.animation)

  return (
    <div className={cn('flex justify-center', styleClass)}>
      <span
        className={cn('size-3.5 rounded-full', anim)}
        style={{
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}66, 0 0 14px ${color}33`
        }}
        aria-label={`${column.label}: ${displayValue}`}
      />
    </div>
  )
}
