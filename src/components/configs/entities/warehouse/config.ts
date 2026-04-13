import { Warehouse, WarehouseFormValues } from '@/lib/schemas/warehouse'
import { FactboxSectionConfig } from '@/types/components/factbox/generic-factbox.types'
import { GenericFormConfig, SelectOption } from '@/types/components/form/generic-form.types'
import type { ColumnConfig } from '@/types/components/table/column.types'

export const warehouseStatusOptions: SelectOption[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'ARCHIVED', label: 'Archived' }
]

export const warehouseFormConfig: GenericFormConfig<WarehouseFormValues> = {
  columns: 2,
  submitLabel: 'Save warehouse',
  defaultValues: {
    name: '',
    address: '',
    timezone: '',
    currency: 'USD',
    status: 'ACTIVE'
  },
  fields: [
    {
      name: 'name',
      label: 'Warehouse name',
      type: 'text',
      placeholder: 'Main distribution center',
      required: true
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: warehouseStatusOptions,
      required: true
    },
    {
      name: 'timezone',
      label: 'Timezone',
      type: 'text',
      placeholder: 'Europe/London',
      description: 'Use a valid IANA timezone identifier.',
      required: true
    },
    {
      name: 'currency',
      label: 'Currency',
      type: 'text',
      placeholder: 'USD',
      description: 'Three-letter ISO 4217 currency code.',
      required: true
    },
    {
      name: 'address',
      label: 'Address',
      type: 'text',
      placeholder: '12 Orchard Lane, London',
      required: true,
      colSpan: 2
    }
  ]
}

export const warehouseTableColumns: ColumnConfig<Warehouse>[] = [
  {
    label: 'Name',
    accessor: 'name'
  },
  {
    label: 'Timezone',
    accessor: 'timezone'
  },
  {
    label: 'Currency',
    accessor: 'currency'
  },
  {
    label: 'Status',
    accessor: 'status'
  },
  {
    label: 'Created',
    accessor: 'createdAt',
    type: 'date'
  }
]

export const warehouseFactboxSections: FactboxSectionConfig<Warehouse>[] = [
  {
    title: 'Overview',
    fields: [
      {
        label: 'Name',
        accessor: 'name'
      },
      {
        label: 'Status',
        accessor: 'status'
      },
      {
        label: 'Created',
        accessor: 'createdAt'
      }
    ]
  },
  {
    title: 'Operations',
    fields: [
      {
        label: 'Timezone',
        accessor: 'timezone'
      },
      {
        label: 'Currency',
        accessor: 'currency'
      },
      {
        label: 'Address',
        accessor: 'address'
      },
      {
        label: 'Deleted at',
        accessor: 'deletedAt'
      },
      {
        label: 'Created by',
        accessor: 'createdById'
      }
    ]
  }
]

export const warehouseCrudConfig = {
  form: warehouseFormConfig,
  table: warehouseTableColumns,
  factbox: warehouseFactboxSections
} as const
