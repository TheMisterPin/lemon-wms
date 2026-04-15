import { EMPTY_DISPLAY_VALUE, formatDisplayValue } from '@/lib/utils/get-value-by-path'
import type { DataColumnConfig } from '@/types/components/table/column.types'
import { formatDateValue } from '@/utils/formatters/date-utils'

import { evaluateOperation } from './operation'
import { applyIfNull, getRowValue } from './row-access'

/**
 * Checks if a value is null, undefined, or an empty string.
 *
 * @param {unknown} value - The value to check.
 * @returns {boolean} True if the value is null, undefined, or an empty string; otherwise, false.
 */
function isNullOrEmptyTextValue(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true
  }

  if (typeof value === 'string') {
    return value.trim() === ''
  }

  return false
}

/**
 * Checks if a value is empty, considering numeric zero values and empty strings.
 *
 * @param {unknown} value - The value to check.
 * @returns {boolean} True if the value is null, undefined, an empty string, or zero; otherwise, false.
 */
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

/**
 * Converts a raw number or string to a formatted display string.
 *
 * @param {unknown} raw - The raw value to format.
 * @param {'decimal' | 'int'} mode - The formatting mode ('decimal' or 'int').
 * @param {number} [decimalRound=2] - The number of decimal places for rounding (default is 2).
 * @returns {string} The formatted display string.
 */
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

/**
 * Applies a specified text format to a given string.
 *
 * @param {string} text - The text to format.
 * @param {string} [format] - The format type ('uppercase', 'lowercase', 'capitalize', 'titlecase').
 * @returns {string} The formatted text.
 */
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

/**
 * Retrieves the raw value of a data column from a row.
 *
 * @param {unknown} row - The row containing the data.
 * @param {DataColumnConfig} column - The configuration for the data column.
 * @returns {unknown} The raw value of the specified column in the row.
 */
export function getDataColumnRawValue(row: unknown, column: DataColumnConfig): unknown {
  return getRowValue(row, column.accessor)
}

/**
 * Retrieves the formatted display string of a data column from a row based on its configuration.
 *
 * @param {unknown} row - The row containing the data.
 * @param {DataColumnConfig} column - The configuration for the data column.
 * @returns {string} The formatted display string of the specified column in the row.
 */
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

/**
 * Retrieves the progress bar model for a 'progress' type data column.
 *
 * @param {unknown} row - The row containing the data.
 * @param {DataColumnConfig & { type: 'progress' }} column - The configuration for the 'progress' data column.
 * @returns {{ current: number, max: number, percentage: number } | undefined} An object representing the progress bar model or undefined if invalid.
 */
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
