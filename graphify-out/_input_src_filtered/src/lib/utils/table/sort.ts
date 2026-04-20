import { EMPTY_DISPLAY_VALUE } from '@/lib/utils/get-value-by-path'
import type { DataColumnConfig } from '@/types/components/table/column.types'
import type { SortDirection } from '@/types/components/table/generic-table.types'
import { parseDateValue } from '@/utils/formatters/date-utils'

import { getDataColumnDisplayString, getDataColumnRawValue } from './cell-display'
import { evaluateOperation } from './operation'
import { getRowValue } from './row-access'

type SortPrimitive =
  | { kind: 'null' }
  | { kind: 'number'; n: number }
  | { kind: 'string'; s: string }
  | { kind: 'boolean'; b: boolean }

/**
 * toNumber.
 * @param raw - Parameter for toNumber.
 * @returns Result from toNumber.
 */
function toNumber(raw: unknown): number | undefined {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return raw
  }

  if (typeof raw === 'string' && raw.trim() !== '') {
    const n = Number(raw)

    if (Number.isFinite(n)) {
      return n
    }
  }

  return undefined
}

/**
 * getProgressRatio.
 * @param row - Parameter for getProgressRatio.
 * @param column - Parameter for getProgressRatio.
 * @returns Result from getProgressRatio.
 */
function getProgressRatio(row: unknown, column: DataColumnConfig & { type: 'progress' }): SortPrimitive {
  const tv = column.typeValues

  if (!tv) {
    return { kind: 'null' }
  }

  const current = toNumber(getRowValue(row, tv.current))
  const max = toNumber(getRowValue(row, tv.max))

  if (current === undefined || max === undefined || current < 0 || max < 0) {
    return { kind: 'null' }
  }

  if (max === 0) {
    return { kind: 'number', n: 0 }
  }

  return { kind: 'number', n: current / max }
}

/**
 * getSortPrimitive.
 * @param row - Parameter for getSortPrimitive.
 * @param column - Parameter for getSortPrimitive.
 * @returns Result from getSortPrimitive.
 */
function getSortPrimitive(row: unknown, column: DataColumnConfig): SortPrimitive {
  switch (column.type) {
  case 'date': {
    const raw = getDataColumnRawValue(row, column)

    if (raw === null || raw === undefined || raw === '') {
      return { kind: 'null' }
    }

    const d = parseDateValue(raw as Parameters<typeof parseDateValue>[0])

    if (!d) {
      return { kind: 'null' }
    }

    return { kind: 'number', n: d.getTime() }
  }

  case 'number': {
    const n = toNumber(getDataColumnRawValue(row, column))

    if (n === undefined) {
      return { kind: 'null' }
    }

    return { kind: 'number', n }
  }

  case 'boolean': {
    const raw = getDataColumnRawValue(row, column)

    if (typeof raw !== 'boolean') {
      return { kind: 'null' }
    }

    return { kind: 'boolean', b: raw }
  }

  case 'progress':
    return getProgressRatio(row, column)

  case 'operation': {
    const tv = column.typeValues

    if (!tv) {
      return { kind: 'null' }
    }

    const n = evaluateOperation(row, tv)

    if (n === undefined) {
      return { kind: 'null' }
    }

    return { kind: 'number', n }
  }

  case 'joinValues': {
    const s = getDataColumnDisplayString(row, column)

    if (s === EMPTY_DISPLAY_VALUE) {
      return { kind: 'null' }
    }

    return { kind: 'string', s }
  }

  case 'indicator': {
    const raw = getDataColumnRawValue(row, column)

    if (raw === null || raw === undefined) {
      return { kind: 'null' }
    }

    return { kind: 'string', s: String(raw) }
  }

  case 'text':
  case undefined: {
    const raw = getDataColumnRawValue(row, column)

    if (raw === null || raw === undefined) {
      return { kind: 'null' }
    }

    return { kind: 'string', s: String(raw) }
  }

  default:
    return { kind: 'null' }
  }
}

/**
 * comparePrimitives.
 * @param a - Parameter for comparePrimitives.
 * @param b - Parameter for comparePrimitives.
 * @param direction - Parameter for comparePrimitives.
 * @returns Result from comparePrimitives.
 */
function comparePrimitives(a: SortPrimitive, b: SortPrimitive, direction: SortDirection): number {
  const dir = direction === 'desc' ? -1 : 1

  if (a.kind === 'null' && b.kind === 'null') {
    return 0
  }

  if (a.kind === 'null') {
    return 1
  }

  if (b.kind === 'null') {
    return -1
  }

  if (a.kind === 'number' && b.kind === 'number') {
    if (a.n === b.n) {
      return 0
    }

    return a.n < b.n ? -dir : dir
  }

  if (a.kind === 'string' && b.kind === 'string') {
    const c = a.s.localeCompare(b.s, undefined, { sensitivity: 'base' })

    if (c === 0) {
      return 0
    }

    return c * dir
  }

  if (a.kind === 'boolean' && b.kind === 'boolean') {
    const va = a.b ? 1 : 0
    const vb = b.b ? 1 : 0

    if (va === vb) {
      return 0
    }

    return va < vb ? -dir : dir
  }

  return 0
}

/**
 * compareIds.
 * @param a - Parameter for compareIds.
 * @param b - Parameter for compareIds.
 * @returns Result from compareIds.
 */
function compareIds<T extends { id: string }>(a: T, b: T): number {
  return a.id.localeCompare(b.id)
}

/**
 * Comparator for two rows by a single data column. **Nulls last** for both asc and desc.
 */
export function compareRowsByDataColumn<T extends { id: string }>(
  a: T,
  b: T,
  column: DataColumnConfig,
  direction: SortDirection
): number {
  const pa = getSortPrimitive(a, column)
  const pb = getSortPrimitive(b, column)
  const c = comparePrimitives(pa, pb, direction)

  if (c !== 0) {
    return c
  }

  return compareIds(a, b)
}

export function sortRowsByDataColumn<T extends { id: string }>(
  records: T[],
  column: DataColumnConfig,
  direction: SortDirection
): T[] {
  return [...records].sort((x, y) => compareRowsByDataColumn(x, y, column, direction))
}
