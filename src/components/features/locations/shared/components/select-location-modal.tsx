'use client'

import { useMemo, useState } from 'react'

import { LocationHierarchySelect } from '@/components/features/locations/shared/components/location-hierarchy-select'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import type {
  SelectLocationModalConfirmPayload,
  SelectLocationModalVariant,
  SelectLocationModalWarehouseDto
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
) {
  return warehouse?.zones.find((z) => z.id === zoneId)
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
              className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
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
            <LocationHierarchySelect
              variant={variant}
              warehouses={warehouses}
              warehouseId={warehouseId}
              zoneId={zoneId}
              binId={binId}
              onWarehouseChange={(id) => {
                setWarehouseId(id)
                setZoneId('')
                setBinId('')
              }}
              onZoneChange={(id) => {
                setZoneId(id)
                setBinId('')
              }}
              onBinChange={setBinId}
            />
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
