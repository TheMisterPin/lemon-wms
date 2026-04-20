import { EMPTY_DISPLAY_VALUE, getValueByPath } from '@/lib/utils/get-value-by-path'
import type { ColumnConfig, DataColumnConfig } from '@/types/components/table/column.types'
import type { FieldPath, FieldValues } from 'react-hook-form'

/**
 * getRowValue.
 * @param row - Parameter for getRowValue.
 * @param accessor - Parameter for getRowValue.
 * @returns Result from getRowValue.
 */
export function getRowValue(row: unknown, accessor: string): unknown {
  return getValueByPath(row as FieldValues, accessor as FieldPath<FieldValues>)
}

/**
 * applyIfNull.
 * @param raw - Parameter for applyIfNull.
 * @param ifNull? - Parameter for applyIfNull.
 * @returns Result from applyIfNull.
 */
export function applyIfNull(raw: unknown, ifNull?: string): string {
  if (raw === null || raw === undefined || raw === '') {
    return ifNull ?? EMPTY_DISPLAY_VALUE
  }

  return String(raw)
}

export function isDataColumn<T extends { id: string }>(
  col: ColumnConfig<T>
): col is DataColumnConfig {
  return 'accessor' in col && !('cell' in col)
}
