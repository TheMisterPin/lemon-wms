'use client'

import { useState } from 'react'

import { createAuthorizeDeviceFormConfig } from '@/components/configs/entities/device/config'
import DynamicForm from '@/components/dynamic-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useDashboardDevices } from '@/components/dashboard/devices/use-dashboard-devices'
import { authorizeDeviceSchema } from '@/lib/schemas/device'
import type { AuthorizeDeviceFormValues } from '@/lib/schemas/device'

type AuthorizeDeviceFormProps = {
  deviceCode: string
  open: boolean
  onClose: () => void
}

export default function AuthorizeDeviceForm({ deviceCode, open, onClose }: AuthorizeDeviceFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { authorizeDevice, warehouseOptions, zoneOptions } = useDashboardDevices()

  const formConfig = createAuthorizeDeviceFormConfig(warehouseOptions, zoneOptions)

  async function handleAuthorize(values: AuthorizeDeviceFormValues) {
    setSubmitError(null)

    try {
      await authorizeDevice(deviceCode, values.warehouseId, values.zoneId)
      onClose()
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Unable to authorize device.'
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        onClose()
      }
    }}>
      <DialogContent className="bg-dash-card2">
        <DialogHeader>
          <DialogTitle className="text-center bg-linear-to-r from-brand-accent via-brand-accent-mid to-brand-accent-end bg-clip-text text-2xl font-black tracking-tight text-transparent">
            Authorize Device
          </DialogTitle>
          <DialogDescription>
            Assign <span className="font-mono text-brand-text">{deviceCode}</span> to a warehouse and zone.
          </DialogDescription>
        </DialogHeader>
        <DynamicForm<AuthorizeDeviceFormValues>
          fields={formConfig.fields}
          defaultValues={formConfig.defaultValues}
          submitLabel={formConfig.submitLabel}
          columns={formConfig.columns}
          schema={authorizeDeviceSchema}
          onSubmit={handleAuthorize}
        />
        {submitError ? (
          <p className="text-sm text-red-400">{submitError}</p>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
