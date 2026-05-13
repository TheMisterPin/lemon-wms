'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/features/warehouses/create-warehouse-form.md
 */

import { z } from 'zod'

import { warehouseFormConfig } from '@/components/configs/entities/warehouse/config'
import { CreateLocationFormDialog } from '@/components/features/locations/shared/components/create-location-form-dialog'
import { warehouseFormSchema } from '@/lib/locations'
import type { WarehouseFormValues } from '@/lib/locations'
import type { FormFieldConfig, GenericFormConfig } from '@/types/components/form/generic-form.types'

const warehouseFullCreateConfig = {
  ...warehouseFormConfig,
  submitLabel: 'Create warehouse'
} satisfies GenericFormConfig<WarehouseFormValues>

type CreateWarehouseFormValues = Pick<WarehouseFormValues, 'name'>

const warehouseNameField = warehouseFormConfig.fields.find((field) => field.name === 'name')

if (!warehouseNameField) {
  throw new Error('Warehouse name field is missing from the warehouse form config.')
}

const createWarehouseNameField: FormFieldConfig<CreateWarehouseFormValues> = {
  name: 'name',
  label: warehouseNameField.label,
  type: 'text',
  placeholder: warehouseNameField.placeholder,
  description: warehouseNameField.description,
  required: warehouseNameField.required,
  disabled: warehouseNameField.disabled,
  hidden: warehouseNameField.hidden,
  colSpan: warehouseNameField.colSpan
}

const createWarehouseNameOnlyConfig = {
  columns: 1 as const,
  submitLabel: 'Create warehouse',
  defaultValues: {
    name: warehouseFormConfig.defaultValues.name
  },
  fields: [createWarehouseNameField]
} satisfies GenericFormConfig<CreateWarehouseFormValues>

const createWarehouseNameOnlySchema = warehouseFormSchema.pick({
  name: true
}) satisfies z.ZodType<CreateWarehouseFormValues>

type CreateWarehouseFormNameOnlyProps = {
  mode?: 'nameOnly'
  inline?: boolean
  onCreateWarehouse: (values: CreateWarehouseFormValues) => Promise<void>
}

type CreateWarehouseFormFullProps = {
  mode: 'full'
  inline?: boolean
  onCreateWarehouse: (values: WarehouseFormValues) => Promise<void>
}

export type CreateWarehouseFormProps =
  | CreateWarehouseFormNameOnlyProps
  | CreateWarehouseFormFullProps

export default function CreateWarehouseForm(props: CreateWarehouseFormProps) {
  const { inline } = props

  if (props.mode === 'full') {
    return (
      <CreateLocationFormDialog<WarehouseFormValues>
        inline={inline}
        triggerLabel="Add warehouse"
        title="Create warehouse"
        description="Enter all required warehouse details. Fields match what you use when editing a warehouse."
        formConfig={warehouseFullCreateConfig}
        schema={warehouseFormSchema}
        fallbackError="Unable to create warehouse."
        onSubmit={props.onCreateWarehouse}
      />
    )
  }

  return (
    <CreateLocationFormDialog<CreateWarehouseFormValues>
      inline={inline}
      triggerLabel="Add warehouse"
      title="Create Warehouse"
      description="Add a warehouse with its initial name. You can complete the remaining details later."
      formConfig={createWarehouseNameOnlyConfig}
      schema={createWarehouseNameOnlySchema}
      fallbackError="Unable to create warehouse."
      onSubmit={props.onCreateWarehouse}
    />
  )
}
