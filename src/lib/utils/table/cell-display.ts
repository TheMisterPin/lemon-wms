import { EMPTY_DISPLAY_VALUE, formatDisplayValue } from '@/lib/utils/get-value-by-path'
import type { DataColumnConfig } from '@/types/components/table/column.types'
import { formatDateValue } from '@/utils/formatters/date-utils'

import { evaluateOperation } from './operation'
import { applyIfNull, getRowValue } from './row-access'

function isNullOrEmptyTextValue(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true
  }

  if (typeof value === 'string') {
    return value.trim() === ''
  }

  return false
}

function isJoinPrimaryEmpty(value: unknown): boolean {
  if (isNullOrEmptyTextValue(value)) {
    return true
  }

  if (typeof value === 'number') {
    return value === 0
  }

  if (typeof value === 'string') {
    const numericValue = Number(value)

    if (Number.isFinite(numericValue)) {
      return numericValue === 0
    }
  }

  return false
}

function toDisplayNumber(raw: unknown, mode: 'decimal' | 'int', decimalRound?: number): string {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    if (mode === 'int') {
      return String(Math.trunc(raw))
    }

    const d = decimalRound ?? 2

    return raw.toFixed(d)
  }

  if (typeof raw === 'string' && raw.trim() !== '') {
    const n = Number(raw)

    if (Number.isFinite(n)) {
      return toDisplayNumber(n, mode, decimalRound)
    }
  }

  return EMPTY_DISPLAY_VALUE
}

function applyTextFormat(text: string, format?: string): string {
  if (!format) {
    return text
  }

  if (format === 'uppercase') {
    return text.toUpperCase()
  }

  if (format === 'lowercase') {
    return text.toLowerCase()
  }

  if (format === 'capitalize') {
    return text ? text[0]!.toUpperCase() + text.slice(1).toLowerCase() : text
  }

  if (format === 'titlecase') {
    return text.replace(/\w\S*/g, w => w[0]!.toUpperCase() + w.slice(1).toLowerCase())
  }

  return text
}

export function getDataColumnRawValue(row: unknown, column: DataColumnConfig): unknown {
  return getRowValue(row, column.accessor)
}

export function getDataColumnDisplayString(row: unknown, column: DataColumnConfig): string {
  const ifNull = column.ifNull

  switch (column.type) {
  case 'date': {
    const dateType = column.typeValues?.dateType ?? 'daydate'
    const displayType = dateType === 'daydate' ? 'date' : dateType
    const raw = getRowValue(row, column.accessor)

    if (raw === null || raw === undefined || raw === '') {
      return ifNull ?? EMPTY_DISPLAY_VALUE
    }

    if (!(raw instanceof Date) && typeof raw !== 'string' && typeof raw !== 'number') {
      return ifNull ?? EMPTY_DISPLAY_VALUE
    }

    const formatted = formatDateValue(raw, displayType)

    return formatted || (ifNull ?? EMPTY_DISPLAY_VALUE)
  }

  case 'number': {
    const raw = getRowValue(row, column.accessor)
    const mode = column.typeValues?.mode ?? 'decimal'

    if (raw === null || raw === undefined || raw === '') {
      return ifNull ?? EMPTY_DISPLAY_VALUE
    }

    return toDisplayNumber(raw, mode, column.typeValues?.decimalRound)
  }

  case 'boolean': {
    const raw = getRowValue(row, column.accessor)

    if (typeof raw !== 'boolean') {
      return ifNull ?? EMPTY_DISPLAY_VALUE
    }

    return raw ? 'Yes' : 'No'
  }

  case 'progress': {
    const tv = column.typeValues

    if (!tv) {
      return ifNull ?? EMPTY_DISPLAY_VALUE
    }

    const currentRaw = getRowValue(row, tv.current)
    const maxRaw = getRowValue(row, tv.max)
    const current = typeof currentRaw === 'number' ? currentRaw : Number(currentRaw)
    const max = typeof maxRaw === 'number' ? maxRaw : Number(maxRaw)

    if (!Number.isFinite(current) || !Number.isFinite(max) || current < 0 || max < 0) {
      return ifNull ?? EMPTY_DISPLAY_VALUE
    }

    if (max === 0) {
      if (current !== 0) {
        return ifNull ?? EMPTY_DISPLAY_VALUE
      }

      return tv.showPercentage ? '0%' : '0/0'
    }

    const pct = Math.min(Math.max((current / max) * 100, 0), 100)

    if (tv.showPercentage) {
      return `${Math.round(pct)}%`
    }

    return `${current}/${max}`
  }

  case 'indicator': {
    const raw = getRowValue(row, column.accessor)

    return formatDisplayValue(raw === '' ? null : raw)
  }

  case 'joinValues': {
    const tv = column.typeValues

    if (!tv || !tv.values.length) {
      return ifNull ?? EMPTY_DISPLAY_VALUE
    }

    const first = getRowValue(row, tv.values[0]!)
    const nullCheck = tv.nullCheck ?? true

    if (nullCheck && isJoinPrimaryEmpty(first)) {
      return ifNull ?? EMPTY_DISPLAY_VALUE
    }

    const sep = tv.separator ?? ' '
    const parts = tv.values.map(path => formatDisplayValue(getRowValue(row, path)))

    return parts.join(sep)
  }

  case 'operation': {
    const tv = column.typeValues

    if (!tv) {
      return ifNull ?? EMPTY_DISPLAY_VALUE
    }

    const n = evaluateOperation(row, tv)

    if (n === undefined) {
      return ifNull ?? EMPTY_DISPLAY_VALUE
    }

    if (tv.decimalRound !== undefined) {
      return n.toFixed(tv.decimalRound)
    }

    return String(n)
  }

  case 'text':
  case undefined: {
    const raw = getRowValue(row, column.accessor)
    const base = applyIfNull(raw, ifNull)

    if (base === EMPTY_DISPLAY_VALUE) {
      return base
    }

    return applyTextFormat(base, column.typeValues?.format)
  }

  default:
    return EMPTY_DISPLAY_VALUE
  }
}

/** Progress bar model aligned with legacy `getProgressValues` / shadcn `Progress` `value` prop. */
export function getProgressBarModel(
  row: unknown,
  column: DataColumnConfig & { type: 'progress' }
): { current: number, max: number, percentage: number } | undefined {
  const tv = column.typeValues

  if (!tv) {
    return undefined
  }

  const currentRaw = getRowValue(row, tv.current)
  const maxRaw = getRowValue(row, tv.max)
  const current = typeof currentRaw === 'number' ? currentRaw : Number(currentRaw)
  const max = typeof maxRaw === 'number' ? maxRaw : Number(maxRaw)

  if (!Number.isFinite(current) || !Number.isFinite(max) || current < 0 || max < 0) {
    return undefined
  }

  if (max === 0) {
    if (current !== 0) {
      return undefined
    }

    return { current, max, percentage: 0 }
  }

  return {
    current,
    max,
    percentage: Math.min(Math.max((current / max) * 100, 0), 100)
  }
}
