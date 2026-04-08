'use client'

import { useState } from 'react'

import { CirclePlus } from 'lucide-react'
import { z } from 'zod'
import { warehouseFormConfig } from '@/components/configs/entities/warehouse/config'
import DynamicForm from '@/components/dynamic-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { useDashboardWarehouse } from '@/hooks/dashboard/use-dashboard-warehouse'
import { warehouseFormSchema } from '@/lib/schemas/warehouse'
import type { WarehouseFormValues } from '@/lib/schemas/warehouse'
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

export default function CreateWarehouseForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const { createWarehouse } = useDashboardWarehouse()

  async function handleCreateWarehouse(values: CreateWarehouseFormValues) {
    setCreateError(null)

    try {
      await createWarehouse(values)
      setIsOpen(false)
    } catch (submissionError) {
      setCreateError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Unable to create warehouse.'
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="bg-dash-card">
          <CirclePlus data-icon="inline-start" />

          Add warehouse
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-dash-card2">
        <DialogHeader>
          <DialogTitle className=" text-center bg-linear-to-r from-brand-accent via-brand-accent-mid to-brand-accent-end bg-clip-text text-2xl font-black tracking-tight text-transparent">
            Create Warehouse
          </DialogTitle>
          <DialogDescription>
            Add a warehouse with its initial name. You can complete the remaining details later.
          </DialogDescription>
        </DialogHeader>
        <DynamicForm<CreateWarehouseFormValues>
          fields={createWarehouseFormConfig.fields}
          defaultValues={createWarehouseFormConfig.defaultValues}
          submitLabel={createWarehouseFormConfig.submitLabel}
          columns={createWarehouseFormConfig.columns}
          schema={createWarehouseFormSchema}
          onSubmit={handleCreateWarehouse}
        />
        {createError ? (
          <p className="text-sm text-red-400">{createError}</p>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
