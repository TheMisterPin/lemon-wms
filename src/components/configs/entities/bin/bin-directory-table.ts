/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/misc/configs/entities/bin/bin-directory-table.md
 */

import type { ColumnConfig } from '@/types/components/table/column.types'

/** Shared shape for bin directory tables (office + floor home, dashboard bins grid). */
export type BinDirectoryRow = {
  id: string
  code: string
  name: string
  type: string
  itemsInBin: number
  maxCapacity: number | null
  currentCapacity: number | null
  filledPercentage: number | null
}

export const binDirectoryTableColumns: ColumnConfig<BinDirectoryRow>[] = [
  { label: 'Code', accessor: 'code' },
  { label: 'Name', accessor: 'name' },
  { label: 'Type', accessor: 'type' },
  { label: 'Items in bin', accessor: 'itemsInBin', type: 'number', typeValues: { mode: 'int' } },
  {
    label: 'Filled %',
    type: 'progress',
    accessor: 'filledPercentage',
    typeValues: {
      current: 'currentCapacity',
      max: 'maxCapacity',
      showPercentage: true
    }
  }
]
