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

const createWarehouseFormConfig = {
  columns: 1 as const,
  submitLabel: 'Create warehouse',
  defaultValues: {
    name: warehouseFormConfig.defaultValues.name
  },
  fields: [createWarehouseNameField]
} satisfies GenericFormConfig<CreateWarehouseFormValues>

const createWarehouseFormSchema = warehouseFormSchema.pick({
  name: true
}) satisfies z.ZodType<CreateWarehouseFormValues>

type CreateWarehouseFormProps = {
  onCreateWarehouse: (values: CreateWarehouseFormValues) => Promise<void>
}

export default function CreateWarehouseForm({ onCreateWarehouse }: CreateWarehouseFormProps) {
  return (
    <CreateLocationFormDialog<CreateWarehouseFormValues>
      triggerLabel="Add warehouse"
      title="Create Warehouse"
      description="Add a warehouse with its initial name. You can complete the remaining details later."
      formConfig={createWarehouseFormConfig}
      schema={createWarehouseFormSchema}
      fallbackError="Unable to create warehouse."
      onSubmit={onCreateWarehouse}
    />
  )
}
