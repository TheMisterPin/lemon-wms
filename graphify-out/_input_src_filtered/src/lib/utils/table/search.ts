import type { ColumnConfig } from '@/types/components/table/column.types'
import type { GenericTableSearchConfig } from '@/types/components/table/generic-table.types'

import { getDataColumnDisplayString } from './cell-display'
import { isDataColumn } from './row-access'

const SEARCH_JOIN_CHAR = '\u0001'

/**
 * Concatenated searchable text for a row (data columns only). Uses {@link SEARCH_JOIN_CHAR}
 * between column display strings so substring search does not cross column boundaries falsely.
 */
export function buildRowSearchText<T extends { id: string }>(
  row: T,
  columns: ColumnConfig<T>[],
  search?: false | GenericTableSearchConfig
): string {
  const fieldFilter = typeof search === 'object' && search.fields?.length
    ? new Set(search.fields)
    : null

  const parts: string[] = []

  for (const col of columns) {
    if (!isDataColumn(col)) {
      continue
    }

    if (fieldFilter && !fieldFilter.has(col.accessor)) {
      continue
    }

    parts.push(getDataColumnDisplayString(row, col))
  }

  return parts.join(SEARCH_JOIN_CHAR)
}

export function rowMatchesSearch(
  searchText: string,
  query: string
): boolean {
  const q = query.trim().toLowerCase()

  if (!q) {
    return true
  }

  return searchText.toLowerCase().includes(q)
}

export function filterRowsBySearch<T extends { id: string }>(
  records: T[],
  columns: ColumnConfig<T>[],
  query: string,
  search?: false | GenericTableSearchConfig
): T[] {
  const q = query.trim()

  if (!q) {
    return records
  }

  return records.filter(row => {
    const blob = buildRowSearchText(row, columns, search)

    return rowMatchesSearch(blob, q)
  })
}
