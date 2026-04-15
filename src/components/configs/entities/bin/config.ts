import {
  binDirectoryTableColumns,
  type BinDirectoryRow
} from '@/components/configs/entities/bin/bin-directory-table'
import type { Bin, BinFormValues } from '@/lib/schemas/bin'
import type { FactboxSectionConfig } from '@/types/components/factbox/generic-factbox.types'
import type { GenericFormConfig, SelectOption } from '@/types/components/form/generic-form.types'
import type { ColumnConfig } from '@/types/components/table/column.types'

export type BinTableRow = BinDirectoryRow & {
  zoneId: string
  zoneName: string
  warehouseId: string
  warehouseName: string
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

export const binTableColumns: ColumnConfig<BinTableRow>[] = binDirectoryTableColumns

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
      { label: 'Max capacity', accessor: 'maxCapacity' },
      { label: 'Current', accessor: 'currentCapacity' },
      { label: 'Filled %', accessor: 'filledPercentage' },
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
