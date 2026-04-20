'use client'

import { useState } from 'react'

import { CirclePlus } from 'lucide-react'

import { createZoneFormConfig } from '@/components/configs/entities/zone/config'
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
import { useDashboardWarehouse } from '@/components/dashboard/warehouses/use-dashboard-warehouse'
import { zoneFormSchema } from '@/lib/schemas/zone'
import type { ZoneFormValues } from '@/lib/schemas/zone'
import type { SelectOption } from '@/types/components/form/generic-form.types'

type CreateZoneFormProps = {
  warehouseList: SelectOption[]
}

export default function CreateZoneForm({ warehouseList }: CreateZoneFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const { createZone } = useDashboardWarehouse()

  const formConfig = createZoneFormConfig(warehouseList)

  async function handleCreateZone(values: ZoneFormValues) {
    setCreateError(null)

    try {
      await createZone(values)
      setIsOpen(false)
    } catch (submissionError) {
      setCreateError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Unable to create zone.'
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="bg-dash-card">
          <CirclePlus data-icon="inline-start" />
          Add zone
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-dash-card2">
        <DialogHeader>
          <DialogTitle className="text-center bg-linear-to-r from-brand-accent via-brand-accent-mid to-brand-accent-end bg-clip-text text-2xl font-black tracking-tight text-transparent">
            Create Zone
          </DialogTitle>
          <DialogDescription>
            Add a zone and assign it to a warehouse.
          </DialogDescription>
        </DialogHeader>
        <DynamicForm<ZoneFormValues>
          fields={formConfig.fields}
          defaultValues={formConfig.defaultValues}
          submitLabel={formConfig.submitLabel}
          columns={formConfig.columns}
          schema={zoneFormSchema}
          onSubmit={handleCreateZone}
        />
        {createError ? (
          <p className="text-sm text-red-400">{createError}</p>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
