'use client'
/* eslint-disable react-hooks/set-state-in-effect -- draft fields sync from GET after load or tab switch */

import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'

import { warehouseStatusOptions } from '@/components/configs/entities/warehouse/config'
import { ManageLocationsWarehouseFormSkeleton } from '@/components/features/locations/shared/components/manage-locations-modal-skeletons'
import { ConfirmModal } from '@/components/primitives/modals/confirm-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  useDashboardWarehouseDetail,
  type WarehouseDetail
} from '@/hooks/dashboard/locations/use-dashboard-location-entity'
import { warehouseFormSchema, type WarehouseFormValues } from '@/lib/locations'

type EditWarehouseFormProps = {
  warehouseId: string
  enabled: boolean
  onUpdated: () => void
  onRequestAddZone?: () => void
}

function formFromDetail(d: WarehouseDetail): WarehouseFormValues {
  return {
    name: d.name,
    address: d.address,
    timezone: d.timezone,
    currency: d.currency,
    status: d.status as WarehouseFormValues['status']
  }
}

export function EditWarehouseForm({
  warehouseId,
  enabled,
  onUpdated,
  onRequestAddZone
}: EditWarehouseFormProps) {
  const { data, isLoading, error, refetch, update } = useDashboardWarehouseDetail(
    warehouseId,
    enabled && Boolean(warehouseId)
  )

  const [form, setForm] = useState<WarehouseFormValues | null>(null)
  const initialStatusRef = useRef<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [pendingBody, setPendingBody] = useState<Partial<WarehouseFormValues> | null>(null)
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false)

  useEffect(() => {
    if (!data) {
      setForm(null)
      initialStatusRef.current = null

      return
    }

    setForm(formFromDetail(data))
    initialStatusRef.current = data.status
    setSaveError(null)
  }, [data])

  async function submitUpdate(body: Partial<WarehouseFormValues>) {
    setSaveError(null)
    const parsed = warehouseFormSchema.partial().safeParse(body)

    if (!parsed.success) {
      setSaveError(parsed.error.issues[0]?.message ?? 'Validation failed.')

      return
    }

    const result = await update(parsed.data)

    if (!result.success) {
      setSaveError(result.error ?? 'Update failed.')

      return
    }

    if (parsed.data.status !== undefined && data) {
      initialStatusRef.current = parsed.data.status
    }

    onUpdated()
  }

  async function handleSave() {
    if (!form || !data) {
      return
    }

    const body: Partial<WarehouseFormValues> = {
      name: form.name,
      address: form.address,
      timezone: form.timezone,
      currency: form.currency,
      status: form.status
    }

    const statusChanged = form.status !== initialStatusRef.current

    if (statusChanged) {
      setPendingBody(body)
      setStatusConfirmOpen(true)

      return
    }

    await submitUpdate(body)
  }

  if (isLoading) {
    return <ManageLocationsWarehouseFormSkeleton />
  }

  if (error) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-destructive">{error}</p>
        <Button type="button" size="sm" variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  if (!form || !data) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="ew-name">Name</Label>
          <Input
            id="ew-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="ew-address">Address</Label>
          <Input
            id="ew-address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={form.status}
            onValueChange={(value) =>
              setForm({ ...form, status: value as WarehouseFormValues['status'] })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {warehouseStatusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ew-tz">Timezone</Label>
          <Input
            id="ew-tz"
            value={form.timezone}
            onChange={(e) => setForm({ ...form, timezone: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ew-currency">Currency</Label>
          <Input
            id="ew-currency"
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })}
            maxLength={3}
          />
        </div>
      </div>

      {saveError ? <p className="text-sm text-destructive">{saveError}</p> : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Button type="button" onClick={() => void handleSave()}>
          Save changes
        </Button>
        {onRequestAddZone ? (
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => onRequestAddZone()}
          >
            <MapPin className="size-4 shrink-0" aria-hidden />
            Add zone to this warehouse
          </Button>
        ) : null}
      </div>

      <ConfirmModal
        open={statusConfirmOpen}
        onOpenChange={setStatusConfirmOpen}
        variant="danger"
        title="Change warehouse status?"
        description="Changing status affects whether new zones and bins can be created and how warehouse operations run. Confirm to apply this change."
        onCancel={() => {
          setStatusConfirmOpen(false)
          setPendingBody(null)
          if (initialStatusRef.current && form) {
            setForm({ ...form, status: initialStatusRef.current as WarehouseFormValues['status'] })
          }
        }}
        onConfirm={() => {
          setStatusConfirmOpen(false)
          const body = pendingBody
          setPendingBody(null)
          if (body) {
            void submitUpdate(body)
          }
        }}
      />
    </div>
  )
}
