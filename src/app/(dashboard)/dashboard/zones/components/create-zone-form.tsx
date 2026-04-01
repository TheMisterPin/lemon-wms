'use client'

import { useState } from 'react'

import { CirclePlus } from 'lucide-react'

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
import { createZoneFormConfig } from '@/lib/components/configs/entities/zone/config'
import { zoneFormSchema } from '@/lib/components/configs/entities/zone/schema'
import type { ZoneFormValues } from '@/lib/components/configs/entities/zone/types'
import type { SelectOption } from '@/types/components/form/generic-form.types'

type CreateZoneFormProps = {
  warehouseList: SelectOption[]
}

export default function CreateZoneForm({ warehouseList }: CreateZoneFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const formConfig = createZoneFormConfig(warehouseList)

  async function handleCreateZone(values: ZoneFormValues) {
    setCreateError(null)

    try {
      const response = await fetch('/api/zones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      })

      const payload = await response.json() as { error?: string }

      if (!response.ok) {
        throw new Error(payload.error ?? 'Failed to create zone.')
      }

      setIsOpen(false)
      window.location.reload()
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
