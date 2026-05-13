'use client'
/* eslint-disable react-hooks/set-state-in-effect -- draft fields sync from GET after load */

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ShelvingUnit } from 'lucide-react'

import { zoneTypeOptions } from '@/components/configs/entities/zone/config'
import { ManageLocationsZoneEditorSkeleton } from '@/components/features/locations/shared/components/manage-locations-modal-skeletons'
import { ConfirmModal } from '@/components/primitives/modals/confirm-modal'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useDashboardZoneDetail } from '@/hooks/dashboard/locations/use-dashboard-location-entity'
import { zoneFormSchema, type ZoneFormValues } from '@/lib/locations'
import type { SelectLocationModalBinDto } from '@/types/dto/locations/select-location-modal.types'

export type ZoneDefaultBinRole = 'RECEIVING' | 'QUARANTINE' | 'OUTGOING'

type EditZoneFormProps = {
  zoneId: string
  enabled: boolean
  zoneBins: SelectLocationModalBinDto[]
  onUpdated: () => void
  onRequestAddBin?: () => void
  onCreateBinAndSetZoneDefault: (args: {
    name: string
    role: ZoneDefaultBinRole
  }) => Promise<{ success: boolean; error?: string }>
}

function defaultBinDisplayValue(
  binId: string | null,
  zoneBins: SelectLocationModalBinDto[]
): string {
  if (!binId) {
    return 'No bin assigned'
  }

  const found = zoneBins.find((b) => b.id === binId)

  return found?.name ?? binId
}

function roleRowLabel(role: ZoneDefaultBinRole): string {
  if (role === 'RECEIVING') {
    return 'Receiving default'
  }

  if (role === 'QUARANTINE') {
    return 'Quarantine default'
  }

  return 'Outgoing default'
}

function roleDialogWord(role: ZoneDefaultBinRole): string {
  if (role === 'RECEIVING') {
    return 'receiving'
  }

  if (role === 'QUARANTINE') {
    return 'quarantine'
  }

  return 'outgoing'
}

const DEFAULT_ROLES: ZoneDefaultBinRole[] = ['RECEIVING', 'QUARANTINE', 'OUTGOING']

export function EditZoneForm({
  zoneId,
  enabled,
  zoneBins,
  onUpdated,
  onRequestAddBin,
  onCreateBinAndSetZoneDefault
}: EditZoneFormProps) {
  const { data, isLoading, error, refetch, update } = useDashboardZoneDetail(
    zoneId,
    enabled && Boolean(zoneId)
  )

  const [name, setName] = useState('')
  const [type, setType] = useState<ZoneFormValues['type']>('GENERAL')
  const [isActive, setIsActive] = useState(true)
  const initialActiveRef = useRef(true)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [deactivateOpen, setDeactivateOpen] = useState(false)
  const [pickerRole, setPickerRole] = useState<ZoneDefaultBinRole | null>(null)
  const [quickCreateName, setQuickCreateName] = useState('')
  const [quickCreateBusy, setQuickCreateBusy] = useState(false)
  const [quickCreateError, setQuickCreateError] = useState<string | null>(null)

  useEffect(() => {
    if (!data) {
      return
    }

    setName(data.name)
    setType(data.type as ZoneFormValues['type'])
    setIsActive(data.isActive)
    initialActiveRef.current = data.isActive
    setSaveError(null)
  }, [data])

  useEffect(() => {
    setQuickCreateName('')
    setQuickCreateError(null)
  }, [pickerRole])

  async function savePatch(patch: Partial<ZoneFormValues>) {
    setSaveError(null)
    const parsed = zoneFormSchema.partial().safeParse(patch)

    if (!parsed.success) {
      setSaveError(parsed.error.issues[0]?.message ?? 'Validation failed.')

      return
    }

    const result = await update(parsed.data)
    if (!result.success) {
      setSaveError(result.error ?? 'Update failed.')

      return
    }

    onUpdated()
  }

  async function handleSaveBasics() {
    await savePatch({ name, type })
  }

  function onActiveToggle(checked: boolean) {
    const wasActive = initialActiveRef.current

    if (!checked && wasActive) {
      setDeactivateOpen(true)

      return
    }

    if (checked && !wasActive) {
      void savePatch({ isActive: true })
      initialActiveRef.current = true
      setIsActive(true)

      return
    }

    setIsActive(checked)
  }

  function defaultIdForRole(role: ZoneDefaultBinRole): string | null {
    if (!data) {
      return null
    }

    if (role === 'RECEIVING') {
      return data.defaultReceivingBinId
    }

    if (role === 'QUARANTINE') {
      return data.defaultQuarantineBinId
    }

    return data.defaultOutgoingBinId
  }

  function applyDefaultBin(binId: string, role: ZoneDefaultBinRole) {
    if (role === 'RECEIVING') {
      void savePatch({ defaultReceivingBinId: binId })
    } else if (role === 'QUARANTINE') {
      void savePatch({ defaultQuarantineBinId: binId })
    } else {
      void savePatch({ defaultOutgoingBinId: binId })
    }

    setPickerRole(null)
  }

  async function handleQuickCreateDefault() {
    if (!pickerRole || !quickCreateName.trim()) {
      setQuickCreateError('Enter a bin name.')

      return
    }

    setQuickCreateBusy(true)
    setQuickCreateError(null)

    const result = await onCreateBinAndSetZoneDefault({
      name: quickCreateName.trim(),
      role: pickerRole
    })

    setQuickCreateBusy(false)

    if (!result.success) {
      setQuickCreateError(result.error ?? 'Could not create bin.')

      return
    }

    setPickerRole(null)
    setQuickCreateName('')
  }

  if (isLoading) {
    return <ManageLocationsZoneEditorSkeleton />
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
      <div className="space-y-2">
        <Label htmlFor="ez-name">Zone name</Label>
        <Input id="ez-name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Zone type</Label>
        <Select
          value={type}
          onValueChange={(value) => setType(value as ZoneFormValues['type'])}
        >
          <SelectTrigger className="w-full max-w-md">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {zoneTypeOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3 rounded-lg border border-border bg-card/30 p-4">
        <div className="space-y-1">
          <Label htmlFor="ez-active" className="text-sm font-medium">
            Zone status
          </Label>
          <p className="text-xs text-muted-foreground">
            Inactive zones cannot receive new bins.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="ez-active"
            checked={isActive}
            onCheckedChange={(v) => onActiveToggle(v === true)}
          />
          <Label htmlFor="ez-active" className="cursor-pointer text-sm font-normal">
            Active
          </Label>
        </div>
      </div>

      {saveError ? <p className="text-sm text-destructive">{saveError}</p> : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Button type="button" variant="secondary" onClick={() => void handleSaveBasics()}>
          Save name and type
        </Button>
        {onRequestAddBin ? (
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => onRequestAddBin()}
          >
            <ShelvingUnit className="size-4 shrink-0" aria-hidden />
            Add bin to this zone
          </Button>
        ) : null}
      </div>

      <details className="group/defbins rounded-lg border border-border">
        <summary
          className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden"
        >
          <span>Default bins by role</span>
          <ChevronDown className="size-4 shrink-0 opacity-70 transition-transform group-open/defbins:rotate-180" />
        </summary>
        <div className="space-y-4 border-t border-border px-4 py-4">
          <p className="text-xs text-muted-foreground">
            Each default must be a bin in this zone with the matching bin type (receiving, quarantine, or outgoing).
          </p>
          <div className="space-y-4">
            {DEFAULT_ROLES.map((role) => {
              const assignedId = defaultIdForRole(role)
              const hasAssignment = Boolean(assignedId)

              return (
                <div
                  key={role}
                  className="grid gap-3 border-b border-border/80 pb-4 last:border-b-0 last:pb-0 sm:grid-cols-2 sm:items-center"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      {roleRowLabel(role)}
                    </p>
                    <p className="text-sm font-medium leading-snug">
                      {defaultBinDisplayValue(assignedId, zoneBins)}
                    </p>
                  </div>
                  <div className="flex sm:justify-end">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() => setPickerRole(role)}
                    >
                      {hasAssignment ? 'Change default bin' : 'Set default bin'}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </details>

      <Dialog
        open={pickerRole !== null}
        onOpenChange={(o) => {
          if (!o) {
            setPickerRole(null)
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {pickerRole
                ? `${roleDialogWord(pickerRole).replace(/^\w/, (c) => c.toUpperCase())} default bin`
                : 'Default bin'}
            </DialogTitle>
            <DialogDescription>
              Choose an existing bin or create one with the correct type for this zone.
            </DialogDescription>
          </DialogHeader>

          {pickerRole ? (
            <div className="space-y-4">
              {zoneBins.filter((b) => b.type === pickerRole).length > 0 ? (
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {zoneBins
                    .filter((b) => b.type === pickerRole)
                    .map((b) => (
                      <Button
                        key={b.id}
                        type="button"
                        variant="ghost"
                        className="h-auto w-full justify-start py-2"
                        onClick={() => applyDefaultBin(b.id, pickerRole)}
                      >
                        <span className="flex flex-col items-start text-left">
                          <span className="font-medium">{b.name}</span>
                          <span className="font-mono text-xs text-muted-foreground">{b.code}</span>
                        </span>
                      </Button>
                    ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    No
                    {' '}
                    {roleDialogWord(pickerRole)}
                    {' '}
                    bins exist in this zone yet. Add a name to create one and set it as the default.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="quick-bin-name">Bin name</Label>
                    <Input
                      id="quick-bin-name"
                      value={quickCreateName}
                      onChange={(e) => setQuickCreateName(e.target.value)}
                      placeholder={`e.g. ${roleDialogWord(pickerRole)}-01`}
                    />
                  </div>
                  {quickCreateError ? (
                    <p className="text-sm text-destructive">{quickCreateError}</p>
                  ) : null}
                  <Button
                    type="button"
                    className="w-full"
                    disabled={quickCreateBusy}
                    onClick={() => void handleQuickCreateDefault()}
                  >
                    {quickCreateBusy
                      ? 'Creating…'
                      : `Add ${roleDialogWord(pickerRole)} bin and set as default`}
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
        variant="danger"
        title="Deactivate this zone?"
        description="Deactivating a zone prevents new bins from being created in it and may affect warehouse operations."
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
