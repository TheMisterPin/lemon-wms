import { FieldValues } from 'react-hook-form'

import {
  DisplayFieldConfig,
  DisplayFieldType,
  JoinValuesDisplayFieldConfig,
  ProgressDisplayFieldConfig
} from '@/types/components/shared/display-field.types'
import { formatDateValue, parseDateValue } from '@/utils/formatters/date-utils'

import {
  EMPTY_DISPLAY_VALUE,
  formatDisplayValue,
  getValueByPath
} from './get-value-by-path'

export function getDisplayFieldRawValue<T extends FieldValues>(row: T, field: DisplayFieldConfig<T>): unknown {
  if ('accessorPath' in field && field.accessorPath) {
    return getValueByPath(row, field.accessorPath)
  }

  if ('accessor' in field && field.accessor) {
    return row[field.accessor]
  }

  return undefined
}

export function isTemporalDisplayFieldType(
  fieldType: DisplayFieldType | undefined
): fieldType is 'date' | 'datetime' | 'time' {
  return fieldType === 'date' || fieldType === 'datetime' || fieldType === 'time'
}

export function isNullOrEmptyTextValue(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true
  }

  if (typeof value === 'string') {
    return value.trim() === ''
  }

  return false
}

export function isJoinPrimaryValueEmpty(value: unknown): boolean {
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

export function formatDisplayFieldValue<T extends FieldValues>(row: T, field: DisplayFieldConfig<T>): string {
  if ('render' in field && field.render) {
    return String(field.render(row))
  }

  if (field.type === 'joinValues') {
    const first = getValueByPath(row, field.joinValuesRef.first)
    const second = getValueByPath(row, field.joinValuesRef.second)

    if (isJoinPrimaryValueEmpty(first)) {
      return EMPTY_DISPLAY_VALUE
    }

    const separator = field.separator ?? ' '

    return `${formatDisplayValue(first)}${separator}${formatDisplayValue(second)}`
  }

  const rawValue = getDisplayFieldRawValue(row, field)

  if (isTemporalDisplayFieldType(field.type)) {
    if (!(rawValue instanceof Date) && typeof rawValue !== 'string' && typeof rawValue !== 'number') {
      return EMPTY_DISPLAY_VALUE
    }

    return formatDateValue(rawValue, field.type) || EMPTY_DISPLAY_VALUE
  }

  return formatDisplayValue(rawValue)
}

export function getProgressValues<T extends FieldValues>(
  row: T,
  field: ProgressDisplayFieldConfig<T>
): { current: number, max: number, percentage: number } | undefined {
  const current = getNumericValue(getValueByPath(row, field.progressBarRef.current))
  const max = getNumericValue(getValueByPath(row, field.progressBarRef.max))

  if (current === undefined || max === undefined || current < 0 || max < 0) {
    return undefined
  }

  if (max === 0) {
    if (current !== 0) {
      return undefined
    }

    return { current, max, percentage: 0 }
  }

  return { current, max, percentage: Math.min(Math.max((current / max) * 100, 0), 100) }
}

function getNumericValue(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const numericValue = Number(value)
    if (Number.isFinite(numericValue)) {
      return numericValue
    }
  }

  return undefined
}

export function getJoinValueComparable<T extends FieldValues>(row: T, field: JoinValuesDisplayFieldConfig<T>): string | undefined {
  const first = getValueByPath(row, field.joinValuesRef.first)
  if (isJoinPrimaryValueEmpty(first)) {
    return undefined
  }

  const second = getValueByPath(row, field.joinValuesRef.second)
  const separator = field.separator ?? ' '
  return `${formatDisplayValue(first)}${separator}${formatDisplayValue(second)}`
}

export function getComparableDisplayFieldValue<T extends FieldValues>(row: T, field: DisplayFieldConfig<T>): unknown {
  if (field.type === 'progress') {
    return getProgressValues(row, field)?.percentage
  }

  if (field.type === 'joinValues') {
    return getJoinValueComparable(row, field)
  }

  const value = getDisplayFieldRawValue(row, field)

  if (field.type === 'boolean') {
    return typeof value === 'boolean' ? value : undefined
  }

  if (isTemporalDisplayFieldType(field.type)) {
    if (!(value instanceof Date) && typeof value !== 'string' && typeof value !== 'number') {
      return undefined
    }

    return parseDateValue(value)?.getTime()
  }

  return value
}
