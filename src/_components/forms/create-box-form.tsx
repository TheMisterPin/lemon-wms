
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'

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
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useErrorModal } from '@/hooks'
import { apiClient } from '@/lib/axios'
import { Location } from '@/types'
import { uploadToImgbb } from '@/utils/media/upload-imgbb'

import { createBoxFormSchema } from '../../utils/forms/schemas/create-box-form'

interface CreateBoxFormProps {
  onSuccess?: () => void;
  locationId?: string;
  locations?: Location[];
}

export function CreateBoxForm({ onSuccess, locationId, locations }: CreateBoxFormProps) {
  const [serverSuccess, setServerSuccess] = useState<string | null>(null)
  const [selectedLocationId, setSelectedLocationId] = useState(locationId ?? '')
  const [uploadingClosed, setUploadingClosed] = useState(false)
  const [uploadingContents, setUploadingContents] = useState(false)
  const { openModal } = useErrorModal()

  const form = useForm<z.infer<typeof createBoxFormSchema>>({
    resolver: zodResolver(createBoxFormSchema as any),
    defaultValues: {
      name: '',
      description: '',
      closedImage: '',
      contentsImage: '',
    },
    mode: 'onSubmit',
  })

  useEffect(() => {
    if (locationId) {
      setSelectedLocationId(locationId)
      return
    }

    if (!selectedLocationId && locations?.length) {
      setSelectedLocationId(locations[0].id)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId, locations])

  async function onSubmit(values: z.infer<typeof createBoxFormSchema>) {
    setServerSuccess(null)

    const resolvedLocationId = locationId ?? selectedLocationId
    if (!resolvedLocationId) {
      openModal('Please select a location')
      return
    }

    try {
      await apiClient.post('/box', {
        ...values,
        locationId: resolvedLocationId,
      })
      setServerSuccess('Box created.')
      form.reset()
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      openModal(error?.response?.data?.error ?? 'Failed to create box')
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
              <FormLabel>Box Name</FormLabel>
              <FormControl>
                <Input placeholder="Kitchen Storage" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!locationId && (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl>
              <select
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                value={selectedLocationId}
                onChange={(event) => setSelectedLocationId(event.target.value)}
              >
                {locations?.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </FormControl>
          </FormItem>
        )}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Optional details" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="closedImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Closed Box Photo</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={async (event) => {
                    const file = event.target.files?.[0]
                    if (!file) {
                      field.onChange('')
                      return
                    }
                    try {
                      setUploadingClosed(true)
                      const url = await uploadToImgbb(file)
                      field.onChange(url)
                    } catch (error: any) {
                      openModal(error?.message ?? 'Failed to upload image')
                      field.onChange('')
                    } finally {
                      setUploadingClosed(false)
                    }
                  }}
                />
              </FormControl>
              {uploadingClosed && (
                <p className="text-sm text-muted-foreground">Uploading closed-box photo...</p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contentsImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contents Photo</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={async (event) => {
                    const file = event.target.files?.[0]
                    if (!file) {
                      field.onChange('')
                      return
                    }
                    try {
                      setUploadingContents(true)
                      const url = await uploadToImgbb(file)
                      field.onChange(url)
                    } catch (error: any) {
                      openModal(error?.message ?? 'Failed to upload image')
                      field.onChange('')
                    } finally {
                      setUploadingContents(false)
                    }
                  }}
                />
              </FormControl>
              {uploadingContents && (
                <p className="text-sm text-muted-foreground">Uploading contents photo...</p>
              )}
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
          {form.formState.isSubmitting ? 'Creating...' : 'Create Box'}
        </Button>
      </form>
    </Form>
  )
}
