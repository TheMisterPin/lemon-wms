import type { FactboxSectionConfig } from '@/types/components/factbox/generic-factbox.types'
import type { GenericFormConfig, SelectOption } from '@/types/components/form/generic-form.types'
import type { TableColumnConfig } from '@/types/components/table/generic-table.types'

import type { Bin, BinFormValues } from '@/lib/schemas/bin'

export type BinTableRow = {
  id: string
  zoneId: string
  zoneName: string
  warehouseId: string
  warehouseName: string
  name: string
  code: string
  type: string
  isBlocked: boolean
  createdAt: string
  deletedAt: string | null
}

export type BinFactboxRecord = Bin & {
  zoneName: string
  warehouseName: string
}

export const binTypeOptions: SelectOption[] = [
  { value: 'GENERAL', label: 'General' },
  { value: 'RECEIVING', label: 'Receiving' },
  { value: 'OUTGOING', label: 'Outgoing' },
  { value: 'QUARANTINE', label: 'Quarantine' },
  { value: 'STAGING', label: 'Staging' }
]

export function createBinFormConfig(
  zoneOptions: SelectOption[]
): GenericFormConfig<BinFormValues> {
  return {
    columns: 2,
    submitLabel: 'Save bin',
    defaultValues: {
      zoneId: '',
      name: '',
      type: 'GENERAL'
    },
    fields: [
      {
        name: 'name',
        label: 'Bin name',
        type: 'text',
        placeholder: 'A-01-01',
        required: true
      },
      {
        name: 'type',
        label: 'Bin type',
        type: 'select',
        options: binTypeOptions,
        required: true
      },
      {
        name: 'zoneId',
        label: 'Zone',
        type: 'select',
        options: zoneOptions,
        placeholder: 'Select a zone',
        required: true
      }
    ]
  }
}

export const binFormConfig = createBinFormConfig([])

export const binTableColumns: TableColumnConfig<BinTableRow>[] = [
  { label: 'Code', accessor: 'code' },
  { label: 'Name', accessor: 'name' },
  { label: 'Type', accessor: 'type' },
  { label: 'Blocked', accessor: 'isBlocked', type: 'boolean' },
  { label: 'Zone', accessor: 'zoneName' },
  { label: 'Warehouse', accessor: 'warehouseName' },
  { label: 'Created', accessor: 'createdAt', type: 'date' }
]

export const binFactboxSections: FactboxSectionConfig<BinFactboxRecord>[] = [
  {
    title: 'Overview',
    fields: [
      { label: 'Name', accessor: 'name' },
      { label: 'Code', accessor: 'code' },
      { label: 'Type', accessor: 'type' },
      { label: 'Blocked', accessor: 'isBlocked' },
      { label: 'Block reason', accessor: 'blockReason' }
    ]
  },
  {
    title: 'Capacity',
    fields: [
      { label: 'Max weight (kg)', accessor: 'maxWeightKg' },
      { label: 'Max volume (m³)', accessor: 'maxVolumeM3' },
      { label: 'Zone', accessor: 'zoneName' },
      { label: 'Warehouse', accessor: 'warehouseName' },
      { label: 'Created', accessor: 'createdAt' },
      { label: 'Deleted at', accessor: 'deletedAt' }
    ]
  }
]

export const binCrudConfig = {
  form: binFormConfig,
  table: binTableColumns,
  factbox: binFactboxSections
} as const
