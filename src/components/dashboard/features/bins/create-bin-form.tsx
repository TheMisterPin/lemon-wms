'use client'

import { useState } from 'react'

import { CirclePlus } from 'lucide-react'

import { createBinFormConfig } from '@/components/configs/entities/bin/config'
import { useDashboardWarehouse } from '@/components/dashboard/warehouses/use-dashboard-warehouse'
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
import { binFormSchema } from '@/lib/locations'
import type { BinFormValues } from '@/lib/locations'
import type { SelectOption } from '@/types/components/form/generic-form.types'

type CreateBinFormProps = {
  zonesList: SelectOption[]
}

export default function CreateBinForm({ zonesList }: CreateBinFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const { createBin } = useDashboardWarehouse()

  const formConfig = createBinFormConfig(zonesList)

  async function handleCreateBin(values: BinFormValues) {
    setCreateError(null)

    try {
      await createBin(values)
      setIsOpen(false)
    } catch (submissionError) {
      setCreateError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Unable to create bin.'
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="bg-dash-card">
          <CirclePlus data-icon="inline-start" />
          Add bin
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-dash-card2">
        <DialogHeader>
          <DialogTitle className="text-center bg-linear-to-r from-brand-accent via-brand-accent-mid to-brand-accent-end bg-clip-text text-2xl font-black tracking-tight text-transparent">
            Create Bin
          </DialogTitle>
          <DialogDescription>
            Add a bin and assign it to a zone.
          </DialogDescription>
        </DialogHeader>
        <DynamicForm<BinFormValues>
          fields={formConfig.fields}
          defaultValues={formConfig.defaultValues}
          submitLabel={formConfig.submitLabel}
          columns={formConfig.columns}
          schema={binFormSchema}
          onSubmit={handleCreateBin}
        />
        {createError ? (
          <p className="text-sm text-red-400">{createError}</p>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
