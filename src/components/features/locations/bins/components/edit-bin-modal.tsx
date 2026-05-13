'use client'
/* eslint-disable react-hooks/set-state-in-effect -- draft fields sync from GET after load */

import { useEffect, useRef, useState } from 'react'

import { binTypeOptions } from '@/components/configs/entities/bin/config'
import { ManageLocationsBinEditorSkeleton } from '@/components/features/locations/shared/components/manage-locations-modal-skeletons'
import { ConfirmModal } from '@/components/primitives/modals/confirm-modal'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useDashboardBinDetail } from '@/hooks/dashboard/locations/use-dashboard-location-entity'
import type { BinFormValues, BinUpdateValues } from '@/lib/locations'
import type { BinType } from '@/types/models/enums'

type EditBinFormContentProps = {
  binId: string
  enabled: boolean
  onUpdated: () => void
  setZoneDefaultForBinType: (args: {
    zoneId: string
    binId: string
    binType: BinType
  }) => Promise<{ success: boolean; error?: string }>
}

export function EditBinFormContent({
  binId,
  enabled,
  onUpdated,
  setZoneDefaultForBinType
}: EditBinFormContentProps) {
  const { data, isLoading, error, refetch, update } = useDashboardBinDetail(
    binId,
    enabled && Boolean(binId)
  )

  const [name, setName] = useState('')
  const [type, setType] = useState<BinFormValues['type']>('GENERAL')
  const [isActive, setIsActive] = useState(true)
  const [maxCapacity, setMaxCapacity] = useState<string>('')
  const initialActiveRef = useRef(true)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [deactivateOpen, setDeactivateOpen] = useState(false)
  const [defaultMessage, setDefaultMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!data) {
      return
    }

    setName(data.name)
    setType(data.type)
    setIsActive(data.isActive)
    initialActiveRef.current = data.isActive
    setMaxCapacity(
      data.maxCapacity === null || data.maxCapacity === undefined ? '' : String(data.maxCapacity)
    )
    setSaveError(null)
  }, [data])

  async function savePatch(patch: BinUpdateValues) {
    setSaveError(null)

    try {
      const result = await update(patch)
      if (!result.success) {
        setSaveError(result.error ?? 'Update failed.')

        return
      }

      onUpdated()
    } catch {
      setSaveError('Update failed.')
    }
  }

  async function handleSaveFields() {
    const capRaw = maxCapacity.trim()
    const capacityValue =
      capRaw === '' ? null : Number.parseFloat(capRaw)

    if (capRaw !== '' && Number.isNaN(capacityValue as number)) {
      setSaveError('Max capacity must be a number.')

      return
    }

    await savePatch({
      name,
      type,
      maxCapacity: capacityValue
    })
  }

  function onActiveToggle(checked: boolean) {
    const wasActive = initialActiveRef.current

    if (!checked && wasActive) {
      setDeactivateOpen(true)

      return
    }

    if (checked && !wasActive) {
      void savePatch({ isActive: true }).then(() => {
        initialActiveRef.current = true
        setIsActive(true)
      })

      return
    }

    setIsActive(checked)
  }

  async function handleSetZoneDefault() {
    if (!data) {
      return
    }

    if (type !== 'RECEIVING' && type !== 'QUARANTINE' && type !== 'OUTGOING') {
      setDefaultMessage(
        'Only receiving, quarantine, and outgoing bin types can be used as tracked zone defaults.'
      )

      return
    }

    setDefaultMessage(null)
    const result = await setZoneDefaultForBinType({
      zoneId: data.zoneId,
      binId: data.id,
      binType: type
    })

    if (!result.success) {
      setDefaultMessage(result.error ?? 'Could not set default bin.')

      return
    }

    setDefaultMessage('Zone default updated.')
    onUpdated()
  }

  if (isLoading) {
    return <ManageLocationsBinEditorSkeleton />
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

  if (!data) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="eb-name">Bin name</Label>
          <Input id="eb-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as BinFormValues['type'])}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {binTypeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="eb-cap">Max capacity</Label>
          <Input
            id="eb-cap"
            inputMode="decimal"
            value={maxCapacity}
            onChange={(e) => setMaxCapacity(e.target.value)}
            placeholder="Optional"
          />
        </div>
        <div className="flex items-center gap-2 sm:col-span-2">
          <Checkbox
            id="eb-active"
            checked={isActive}
            onCheckedChange={(v) => onActiveToggle(v === true)}
          />
          <Label htmlFor="eb-active" className="cursor-pointer text-sm font-normal">
            Active
          </Label>
        </div>
      </div>

      {saveError ? <p className="text-sm text-destructive">{saveError}</p> : null}
      {defaultMessage ? <p className="text-sm text-muted-foreground">{defaultMessage}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => void handleSaveFields()}>
          Save changes
        </Button>
        <Button type="button" variant="outline" onClick={() => void handleSetZoneDefault()}>
          Set as zone default for this bin type
        </Button>
      </div>

      <ConfirmModal
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
        variant="danger"
        title="Deactivate this bin?"
        description="Deactivated bins may be excluded from putaway and picking. Confirm to proceed."
        onCancel={() => {
          setDeactivateOpen(false)
          setIsActive(true)
        }}
        onConfirm={() => {
          setDeactivateOpen(false)
          void savePatch({ isActive: false }).then(() => {
            initialActiveRef.current = false
            setIsActive(false)
          })
        }}
      />
    </div>
  )
}
