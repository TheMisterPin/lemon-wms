/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useErrorModal } from '@/hooks'
import { apiClient } from '@/lib/axios'

import { createLocationformSchema } from '../../utils/components/forms/schemas/create-location-form'

interface CreateLocationFormProps {
  onSuccess?: () => void;
}

export function CreateLocationForm({ onSuccess }: CreateLocationFormProps) {
  const [serverSuccess, setServerSuccess] = useState<string | null>(null)
  const { openModal } = useErrorModal()

  const form = useForm<z.infer<typeof createLocationformSchema>>({
    resolver: zodResolver(createLocationformSchema as any),
    defaultValues: {
      name: ''
    },
    mode: 'onSubmit'
  })

  async function onSubmit(values: z.infer<typeof createLocationformSchema>) {
    setServerSuccess(null)

    try {
      await apiClient.post('/location', values)
      setServerSuccess('Location created.')
      form.reset()
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      openModal(error?.response?.data?.error ?? 'Failed to create location')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
Location Name
              </FormLabel>
              <FormControl>
                <Input placeholder="Living Room" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {serverSuccess && (
          <p className="text-sm" role="status">
            {serverSuccess}
          </p>
        )}

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Creating...' : 'Create Location'}
        </Button>
      </form>
    </Form>
  )
}
