'use client'

import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Ban, Box, MapPin, Warehouse } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type {
  SelectLocationModalConfirmPayload,
  SelectLocationModalVariant,
  SelectLocationModalWarehouseDto,
  SelectLocationModalZoneDto
} from '@/types/dto/locations/select-location-modal.types'

type SelectLocationModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  variant: SelectLocationModalVariant
  warehouses: SelectLocationModalWarehouseDto[]
  isLoading: boolean
  error: string | null
  onRefetch: () => void
  onConfirm: (payload: SelectLocationModalConfirmPayload) => void
}

function findWarehouse(
  list: SelectLocationModalWarehouseDto[],
  id: string
): SelectLocationModalWarehouseDto | undefined {
  return list.find((w) => w.id === id)
}

function findZone(
  warehouse: SelectLocationModalWarehouseDto | undefined,
  zoneId: string
): SelectLocationModalZoneDto | undefined {
  return warehouse?.zones.find((z) => z.id === zoneId)
}

type FieldShellProps = {
  label: string
  description: string
  icon: typeof Warehouse
  children: ReactNode
}

function FieldShell({ label, description, icon: Icon, children }: FieldShellProps) {
  return (
    <div
      className={cn(
        'space-y-3 rounded-lg border border-border bg-card/50 p-4 shadow-sm'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/80 text-muted-foreground'
          )}
        >
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm font-medium leading-none">{label}</p>
          <p className="text-xs text-muted-foreground leading-snug">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

export function SelectLocationModal({
  open,
  onOpenChange,
  variant,
  warehouses,
  isLoading,
  error,
  onRefetch,
  onConfirm
}: SelectLocationModalProps) {
  const [warehouseId, setWarehouseId] = useState<string>('')
  const [zoneId, setZoneId] = useState<string>('')
  const [binId, setBinId] = useState<string>('')

  const selectedWarehouse = useMemo(
    () => findWarehouse(warehouses, warehouseId),
    [warehouses, warehouseId]
  )
  const selectedZone = useMemo(
    () => findZone(selectedWarehouse, zoneId),
    [selectedWarehouse, zoneId]
  )
  const selectedBin = useMemo(
    () => selectedZone?.bins.find((b) => b.id === binId),
    [selectedZone, binId]
  )

  const showZoneField = variant === 'zone' || variant === 'bin'
  const showBinField = variant === 'bin'

  const canConfirm =
    Boolean(selectedWarehouse)
    && (variant === 'warehouse' || Boolean(selectedZone))
    && (variant !== 'bin' || Boolean(selectedBin))

  const title =
    variant === 'warehouse'
      ? 'Go to warehouse'
      : variant === 'zone'
        ? 'Go to zone'
        : 'Go to bin'

  const description =
    variant === 'warehouse'
      ? 'Choose a warehouse to open its overview.'
      : variant === 'zone'
        ? 'Pick the warehouse, then the zone to open.'
        : 'Pick the warehouse, zone, and bin to open.'

  const handleConfirm = () => {
    if (!selectedWarehouse || !canConfirm) {
      return
    }

    if (variant === 'warehouse') {
      onConfirm({ variant: 'warehouse', warehouseId: selectedWarehouse.id })
    } else if (variant === 'zone' && selectedZone) {
      onConfirm({
        variant: 'zone',
        warehouseId: selectedWarehouse.id,
        zoneId: selectedZone.id
      })
    } else if (variant === 'bin' && selectedZone && selectedBin) {
      onConfirm({
        variant: 'bin',
        warehouseId: selectedWarehouse.id,
        zoneId: selectedZone.id,
        binId: selectedBin.id
      })
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[min(90vh,640px)] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
        showCloseButton
      >
        <DialogHeader className="space-y-1 border-b border-border px-6 py-4 text-left">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading locations…</p>
          ) : null}

          {!isLoading && error ? (
            <div
              className={cn(
                'rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive'
              )}
            >
              <p>{error}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => onRefetch()}
              >
                Try again
              </Button>
            </div>
          ) : null}

          {!isLoading && !error ? (
            <>
              <FieldShell
                icon={Warehouse}
                label="Warehouse"
                description="Which warehouse should we open?"
              >
                <div className="space-y-2">
                  <Label htmlFor="select-loc-warehouse" className="sr-only">
                    Warehouse
                  </Label>
                  <Select
                    value={warehouseId || undefined}
                    onValueChange={(value) => {
                      setWarehouseId(value)
                      setZoneId('')
                      setBinId('')
                    }}
                  >
                    <SelectTrigger
                      id="select-loc-warehouse"
                      className="h-10 w-full border-input bg-background"
                      size="default"
                    >
                      <SelectValue placeholder="Select warehouse">
                        {selectedWarehouse ? selectedWarehouse.name : null}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent position="popper" className="w-(--radix-select-trigger-width)">
                      {warehouses.map((w) => (
                        <SelectItem key={w.id} value={w.id} textValue={w.name}>
                          <span className="flex flex-col gap-0.5">
                            <span className="font-medium leading-tight">{w.name}</span>
                            <span className="font-mono text-xs text-muted-foreground">{w.id}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </FieldShell>

              {showZoneField ? (
                <FieldShell
                  icon={MapPin}
                  label="Zone"
                  description={
                    selectedWarehouse
                      ? `Zones in ${selectedWarehouse.name}`
                      : 'Select a warehouse first.'
                  }
                >
                  <div className="space-y-2">
                    <Label htmlFor="select-loc-zone" className="sr-only">
                      Zone
                    </Label>
                    <Select
                      value={zoneId || undefined}
                      onValueChange={(value) => {
                        setZoneId(value)
                        setBinId('')
                      }}
                      disabled={!selectedWarehouse}
                    >
                      <SelectTrigger
                        id="select-loc-zone"
                        className="h-10 w-full border-input bg-background"
                        size="default"
                      >
                        <SelectValue
                          placeholder={
                            selectedWarehouse ? 'Select zone' : 'Select warehouse first'
                          }
                        >
                          {selectedZone ? selectedZone.name : null}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent position="popper" className="w-(--radix-select-trigger-width)">
                        {(selectedWarehouse?.zones ?? []).map((z) => (
                          <SelectItem key={z.id} value={z.id} textValue={z.name}>
                            <span className="flex flex-col gap-0.5">
                              <span className="font-medium leading-tight">{z.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {z.type}
                                <span className="mt-0.5 block font-mono text-[11px]">{z.id}</span>
                              </span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </FieldShell>
              ) : null}

              {showBinField ? (
                <FieldShell
                  icon={Box}
                  label="Bin"
                  description={
                    selectedZone
                      ? `Bins in ${selectedZone.name}`
                      : 'Select a zone first.'
                  }
                >
                  <div className="space-y-2">
                    <Label htmlFor="select-loc-bin" className="sr-only">
                      Bin
                    </Label>
                    <Select
                      value={binId || undefined}
                      onValueChange={setBinId}
                      disabled={!selectedZone}
                    >
                      <SelectTrigger
                        id="select-loc-bin"
                        className="h-10 w-full border-input bg-background"
                        size="default"
                      >
                        <SelectValue
                          placeholder={selectedZone ? 'Select bin' : 'Select zone first'}
                        >
                          {selectedBin ? selectedBin.name : null}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent position="popper" className="w-(--radix-select-trigger-width)">
                        {(selectedZone?.bins ?? []).map((b) => (
                          <SelectItem key={b.id} value={b.id} textValue={b.name}>
                            <span className="flex items-center gap-2">
                              {b.isBlocked ? (
                                <Ban
                                  className="size-4 shrink-0 text-destructive"
                                  aria-label="Blocked"
                                />
                              ) : null}
                              <span className="flex min-w-0 flex-col gap-0.5">
                                <span className="truncate font-medium leading-tight">{b.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {b.type}
                                  <span className="mt-0.5 block font-mono text-[11px]">{b.id}</span>
                                </span>
                              </span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </FieldShell>
              ) : null}
            </>
          ) : null}
        </div>

        <DialogFooter className="border-t border-border px-6 py-4 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setWarehouseId('')
              setZoneId('')
              setBinId('')
            }}
            disabled={isLoading || Boolean(error)}
          >
            Reset
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={!canConfirm || isLoading || Boolean(error)}
            >
              Open
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
