'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

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
import type { GenericFormConfig } from '@/types/components/form/generic-form.types'
import type { FieldValues } from 'react-hook-form'
import type { z } from 'zod'

type CreateLocationFormDialogProps<TValues extends FieldValues> = {
  triggerLabel: string
  title: string
  description: ReactNode
  formConfig: GenericFormConfig<TValues>
  schema: z.ZodType<TValues>
  fallbackError: string
  onSubmit: (values: TValues) => Promise<void>
}

export function CreateLocationFormDialog<TValues extends FieldValues>({
  triggerLabel,
  title,
  description,
  formConfig,
  schema,
  fallbackError,
  onSubmit
}: CreateLocationFormDialogProps<TValues>) {
  const [isOpen, setIsOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  async function handleCreate(values: TValues) {
    setCreateError(null)

    try {
      await onSubmit(values)
      setIsOpen(false)
    } catch (submissionError) {
      setCreateError(
        submissionError instanceof Error
          ? submissionError.message
          : fallbackError
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="bg-dash-card">
          <CirclePlus data-icon="inline-start" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-dash-card2">
        <DialogHeader>
          <DialogTitle className="text-center bg-linear-to-r from-brand-accent via-brand-accent-mid to-brand-accent-end bg-clip-text text-2xl font-black tracking-tight text-transparent">
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DynamicForm<TValues>
          fields={formConfig.fields}
          defaultValues={formConfig.defaultValues}
          submitLabel={formConfig.submitLabel}
          columns={formConfig.columns}
          schema={schema}
          onSubmit={handleCreate}
        />
        {createError ? (
          <p className="text-sm text-red-400">{createError}</p>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
