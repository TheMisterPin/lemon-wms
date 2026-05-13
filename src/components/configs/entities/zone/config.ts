/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/misc/configs/entities/zone/config.md
 */

import type { Zone, ZoneFormValues } from '@/lib/locations'
import type { FactboxSectionConfig } from '@/types/components/factbox/generic-factbox.types'
import type { GenericFormConfig, SelectOption } from '@/types/components/form/generic-form.types'
import type { ColumnConfig } from '@/types/components/table/column.types'

export type ZoneTableRow = {
  id: string
  warehouseId: string
  warehouseName: string
  name: string
  type: string
  isActive: boolean
  createdAt: string
  deletedAt: string | null
}

export type ZoneFactboxRecord = Zone & {
  warehouseName: string
}

export const zoneTypeOptions: SelectOption[] = [
  { value: 'GENERAL', label: 'General' },
  { value: 'COLD', label: 'Cold' },
  { value: 'HAZMAT', label: 'Hazmat' },
  { value: 'QUARANTINE', label: 'Quarantine' },
  { value: 'STAGING', label: 'Staging' },
  { value: 'RETURNS', label: 'Returns' }
]

export function createZoneFormConfig(
  warehouseOptions: SelectOption[],
  opts?: { lockedWarehouseId?: string }
): GenericFormConfig<ZoneFormValues> {
  const lockedWarehouseId = opts?.lockedWarehouseId

  const baseFields: GenericFormConfig<ZoneFormValues>['fields'] = [
    {
      name: 'name',
      label: 'Zone name',
      type: 'text',
      placeholder: 'Main storage zone',
      required: true
    },
    {
      name: 'type',
      label: 'Zone type',
      type: 'select',
      options: zoneTypeOptions,
      required: true
    },
    {
      name: 'warehouseId',
      label: 'Warehouse',
      type: 'select',
      options: warehouseOptions,
      placeholder: 'Select a warehouse',
      required: true
    },
    {
      name: 'isActive',
      label: 'Active',
      type: 'checkbox'
    }
  ]

  const fields =
    lockedWarehouseId !== undefined
      ? baseFields.filter((f) => f.name !== 'warehouseId')
      : baseFields

  return {
    columns: 2,
    submitLabel: 'Save zone',
    defaultValues: {
      warehouseId: lockedWarehouseId ?? '',
      name: '',
      type: 'GENERAL',
      isActive: true,
      customPermissions: null,
      defaultReceivingBinId: null,
      defaultQuarantineBinId: null,
      defaultOutgoingBinId: null
    },
    fields
  }
}

export const zoneFormConfig = createZoneFormConfig([])

export const zoneTableColumns: ColumnConfig<ZoneTableRow>[] = [
  { label: 'Name', accessor: 'name' },
  { label: 'Type', accessor: 'type' },
  { label: 'Active', accessor: 'isActive', type: 'boolean' },
  { label: 'Warehouse', accessor: 'warehouseName' },
  { label: 'Created', accessor: 'createdAt', type: 'date' }
]

export const zoneFactboxSections: FactboxSectionConfig<ZoneFactboxRecord>[] = [
  {
    title: 'Overview',
    fields: [
      { label: 'Name', accessor: 'name' },
      { label: 'Type', accessor: 'type' },
      { label: 'Active', accessor: 'isActive' },
      { label: 'Created', accessor: 'createdAt' }
    ]
  },
  {
    title: 'Defaults',
    fields: [
      { label: 'Receiving bin', accessor: 'defaultReceivingBinId' },
      { label: 'Quarantine bin', accessor: 'defaultQuarantineBinId' },
      { label: 'Outgoing bin', accessor: 'defaultOutgoingBinId' },
      { label: 'Deleted at', accessor: 'deletedAt' }
    ]
  }
]

export const zoneCrudConfig = {
  form: zoneFormConfig,
  table: zoneTableColumns,
  factbox: zoneFactboxSections
} as const
