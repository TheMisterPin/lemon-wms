import type { AuthorizeDeviceFormValues } from '@/lib/iam/devices/devices-schemas'
import type { GenericFormConfig, SelectOption } from '@/types/components/form/generic-form.types'
import type { ColumnConfig } from '@/types/components/table/column.types'

export type DeviceTableRow = {
  id: string
  name: string
  code: string
  warehouseId: string | null
  warehouseName: string
  zoneId: string | null
  zoneName: string
  authorized: boolean
  isActive: boolean
  type: string
  registeredAt: string
}

export const deviceTableColumns: ColumnConfig<DeviceTableRow>[] = [
  { label: 'Name', accessor: 'name' },
  { label: 'Code', accessor: 'code' },
  { label: 'Warehouse', accessor: 'warehouseName' },
  { label: 'Zone', accessor: 'zoneName' },
  { label: 'Type', accessor: 'type' },
  {
    label: 'Authorized',
    cell: (row) =>
      row.authorized ? (
        <span className="inline-flex items-center rounded-full bg-emerald-900/30 px-2 py-0.5 text-xs font-medium text-emerald-400">
          Authorized
        </span>
      ) : (
        <span className="inline-flex items-center rounded-full bg-amber-900/30 px-2 py-0.5 text-xs font-medium text-amber-400">
          Pending
        </span>
      )
  },
  {
    label: 'Active',
    cell: (row) =>
      row.isActive ? (
        <span className="inline-flex items-center rounded-full bg-blue-900/30 px-2 py-0.5 text-xs font-medium text-blue-400">
          Active
        </span>
      ) : (
        <span className="inline-flex items-center rounded-full bg-zinc-800/50 px-2 py-0.5 text-xs font-medium text-zinc-400">
          Inactive
        </span>
      )
  }
]

export function createAuthorizeDeviceFormConfig(
  warehouseOptions: SelectOption[],
  zoneOptions: SelectOption[]
): GenericFormConfig<AuthorizeDeviceFormValues> {
  return {
    columns: 1,
    submitLabel: 'Authorize device',
    defaultValues: {
      warehouseId: '',
      zoneId: ''
    },
    fields: [
      {
        name: 'warehouseId',
        label: 'Warehouse',
        type: 'select',
        options: warehouseOptions,
        placeholder: 'Select a warehouse',
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
