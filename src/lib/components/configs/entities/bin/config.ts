import type { FactboxSectionConfig } from '@/types/components/factbox/generic-factbox.types'
import type { GenericFormConfig, SelectOption } from '@/types/components/form/generic-form.types'
import type { TableColumnConfig } from '@/types/components/table/generic-table.types'

import type { Bin, BinFormValues } from './types'

export const binTypeOptions: SelectOption[] = [
  { value: 'RECEIVING', label: 'Receiving' },
  { value: 'STORAGE', label: 'Storage' },
  { value: 'PICK_FACE', label: 'Pick Face' },
  { value: 'PACKING', label: 'Packing' },
  { value: 'SHIPPING', label: 'Shipping' },
  { value: 'QUARANTINE', label: 'Quarantine' },
  { value: 'STAGING', label: 'Staging' },
  { value: 'CUSTOM', label: 'Custom' }
]

export const binFormConfig: GenericFormConfig<BinFormValues> = {
  columns: 2,
  submitLabel: 'Save bin',
  defaultValues: {
    zoneId: '',
    warehouseId: '',
    name: '',
    code: '',
    type: 'STORAGE',
    isBlocked: false,
    blockReason: null,
    maxWeightKg: null,
    maxVolumeM3: null
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
      name: 'code',
      label: 'Bin code',
      type: 'text',
      placeholder: 'WH1-A-01-01',
      description: 'Unique identifier scanned on the floor.',
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
      name: 'isBlocked',
      label: 'Blocked',
      type: 'checkbox'
    },
    {
      name: 'zoneId',
      label: 'Zone',
      type: 'text',
      placeholder: 'Zone ID',
      required: true
    },
    {
      name: 'warehouseId',
      label: 'Warehouse',
      type: 'text',
      placeholder: 'Warehouse ID',
      required: true
    },
    {
      name: 'maxWeightKg',
      label: 'Max weight (kg)',
      type: 'number',
      placeholder: '500'
    },
    {
      name: 'maxVolumeM3',
      label: 'Max volume (m³)',
      type: 'number',
      placeholder: '2.5'
    },
    {
      name: 'blockReason',
      label: 'Block reason',
      type: 'text',
      placeholder: 'Reason for blocking',
      colSpan: 2
    }
  ]
}

export const binTableColumns: TableColumnConfig<Bin>[] = [
  { label: 'Code', accessor: 'code' },
  { label: 'Name', accessor: 'name' },
  { label: 'Type', accessor: 'type' },
  { label: 'Blocked', accessor: 'isBlocked' },
  { label: 'Zone', accessor: 'zoneId' },
  { label: 'Created', accessor: 'createdAt' }
]

export const binFactboxSections: FactboxSectionConfig<Bin>[] = [
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
      { label: 'Zone', accessor: 'zoneId' },
      { label: 'Warehouse', accessor: 'warehouseId' },
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
