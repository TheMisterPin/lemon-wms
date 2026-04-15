import { EMPTY_DISPLAY_VALUE } from '@/lib/utils/get-value-by-path'
import type { ColumnConfig, DataColumnConfig } from '@/types/components/table/column.types'

import {
  getDataColumnDisplayString,
  getDataColumnRawValue,
  getProgressBarModel
} from './cell-display'
import { getRowValue, isDataColumn } from './row-access'

/**
 * isNullOrEmptyTextValue.
 * @param value - Parameter for isNullOrEmptyTextValue.
 * @returns Result from isNullOrEmptyTextValue.
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
 * isJoinPrimaryEmptyForHide.
 * @param value - Parameter for isJoinPrimaryEmptyForHide.
 * @returns Result from isJoinPrimaryEmptyForHide.
 */
function isJoinPrimaryEmptyForHide(value: unknown): boolean {
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
 * When `hideIfNulls` is set, the column is omitted from the table if **every** row’s
 * display string for that column is empty (same as {@link EMPTY_DISPLAY_VALUE}).
 */
export function shouldHideDataColumnForDataset<T extends { id: string }>(
  column: DataColumnConfig,
  records: T[]
): boolean {
  if (!column.hideIfNulls) {
    return false
  }

  if (records.length === 0) {
    return false
  }

  return records.every(row => getDataColumnDisplayString(row, column) === EMPTY_DISPLAY_VALUE)
}

/**
 * Omits a data column when every row has no meaningful content (progress undefined,
 * join primary “empty”, or text/raw empty). Matches legacy GenericTable visibility.
 */
export function shouldHideColumnWhenAllCellsEmpty<T extends { id: string }>(
  column: ColumnConfig<T>,
  records: T[]
): boolean {
  if (!isDataColumn(column)) {
    return false
  }

  if (records.length === 0) {
    return false
  }

  if (column.type === 'progress') {
    return records.every(
      record => getProgressBarModel(record, column as DataColumnConfig & { type: 'progress' }) === undefined
    )
  }

  if (column.type === 'joinValues') {
    const paths = column.typeValues?.values

    if (!paths || paths.length === 0) {
      return false
    }

    const firstPath = paths[0]!

    return records.every(record =>
      isJoinPrimaryEmptyForHide(getRowValue(record, firstPath))
    )
  }

  return records.every(record =>
    isNullOrEmptyTextValue(getDataColumnRawValue(record, column))
  )
}
