import type { ColumnConfig } from '@/types/components/table/column.types'
import type { BinContentTableRowDto } from '@/types/dto/locations/bin-contents'

/** Shared column config for bin contents tables (dashboard modal + floor bin page). */
export const BIN_CONTENT_TABLE_COLUMNS: ColumnConfig<BinContentTableRowDto>[] = [
  { label: 'SKU', accessor: 'sku' },
  { label: 'Name', accessor: 'name' },
  {
    label: 'Status',
    accessor: 'status',
    type: 'indicator',
    typeValues: {
      syncBlink: true,
      conditions: {
        available: '#16a34a',
        reserved: '#d97706',
        blocked: '#dc2626',
        in_transit: '#2563eb'
      },
      defaultColor: '#64748b'
    }
  },
  {
    label: 'Quantity',
    accessor: 'statusQuantity',
    type: 'joinValues',
    typeValues: { values: ['statusQuantity', 'uom'] }
  }
]
