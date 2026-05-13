'use client'

import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Ban, Box, MapPin, Warehouse } from 'lucide-react'

import { Input } from '@/components/ui/input'
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
  SelectLocationModalVariant,
  SelectLocationModalWarehouseDto,
  SelectLocationModalZoneDto
} from '@/types/dto/locations/select-location-modal.types'

export type LocationHierarchySelectValue = {
  warehouseId: string
  zoneId: string
  binId: string
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

function matchesToken(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase())
}

function filterWarehousesForSearch(
  warehouses: SelectLocationModalWarehouseDto[],
  query: string
): SelectLocationModalWarehouseDto[] {
  const q = query.trim()
  if (!q) {
    return warehouses
  }

  return warehouses
    .map((w) => {
      const wMatch = matchesToken(w.name, q) || matchesToken(w.id, q)
      if (wMatch) {
        return w
      }

      const zones = w.zones
        .map((z) => {
          const zMatch =
            matchesToken(z.name, q)
            || matchesToken(z.id, q)
            || matchesToken(z.type, q)

          const bins = z.bins.filter(
            (b) =>
              matchesToken(b.name, q)
              || matchesToken(b.code, q)
              || matchesToken(b.id, q)
            || matchesToken(b.type, q)
          )

          if (zMatch) {
            return z
          }

          if (bins.length > 0) {
            return { ...z, bins }
          }

          return null
        })
        .filter((z): z is SelectLocationModalZoneDto => z !== null)

      if (zones.length === 0) {
        return null
      }

      return { ...w, zones }
    })
    .filter((w): w is SelectLocationModalWarehouseDto => w !== null)
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

type LocationHierarchySelectProps = {
  variant: SelectLocationModalVariant
  warehouses: SelectLocationModalWarehouseDto[]
  warehouseId: string
  zoneId: string
  binId: string
  onWarehouseChange: (id: string) => void
  onZoneChange: (id: string) => void
  onBinChange: (id: string) => void
  disabled?: boolean
  showSearch?: boolean
}

export function LocationHierarchySelect({
  variant,
  warehouses,
  warehouseId,
  zoneId,
  binId,
  onWarehouseChange,
  onZoneChange,
  onBinChange,
  disabled = false,
  showSearch = true
}: LocationHierarchySelectProps) {
  const [search, setSearch] = useState('')

  const displayWarehouses = useMemo(
    () => filterWarehousesForSearch(warehouses, search),
    [warehouses, search]
  )

  const selectedWarehouse = useMemo(
    () => findWarehouse(displayWarehouses, warehouseId),
    [displayWarehouses, warehouseId]
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

  const warehouseList =
    selectedWarehouse && !displayWarehouses.some((w) => w.id === warehouseId)
      ? [...displayWarehouses, selectedWarehouse]
      : displayWarehouses

  const zoneList =
    selectedZone && selectedWarehouse
    && !(selectedWarehouse.zones.some((z) => z.id === zoneId))
      ? [...(selectedWarehouse?.zones ?? []), selectedZone]
      : selectedWarehouse?.zones ?? []

  const binList =
    selectedBin && selectedZone
    && !(selectedZone.bins.some((b) => b.id === binId))
      ? [...selectedZone.bins, selectedBin]
      : selectedZone?.bins ?? []

  return (
    <div className="space-y-4">
      {showSearch ? (
        <div className="space-y-2">
          <Label htmlFor="location-hierarchy-search" className="text-xs">
            Search
          </Label>
          <Input
            id="location-hierarchy-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by name, code, or id…"
            disabled={disabled}
            className="h-9"
          />
        </div>
      ) : null}

      <FieldShell
        icon={Warehouse}
        label="Warehouse"
        description="Which warehouse are you working with?"
      >
        <div className="space-y-2">
          <Label htmlFor="hierarchy-warehouse" className="sr-only">
            Warehouse
          </Label>
          <Select
            value={warehouseId || undefined}
            onValueChange={(value) => {
              onWarehouseChange(value)
            }}
            disabled={disabled}
          >
            <SelectTrigger
              id="hierarchy-warehouse"
              className="h-10 w-full border-input bg-background"
              size="default"
            >
              <SelectValue placeholder="Select warehouse">
                {selectedWarehouse ? selectedWarehouse.name : null}
              </SelectValue>
            </SelectTrigger>
            <SelectContent position="popper" className="w-(--radix-select-trigger-width)">
              {warehouseList.map((w) => (
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
            <Label htmlFor="hierarchy-zone" className="sr-only">
              Zone
            </Label>
            <Select
              value={zoneId || undefined}
              onValueChange={(value) => {
                onZoneChange(value)
              }}
              disabled={disabled || !selectedWarehouse}
            >
              <SelectTrigger
                id="hierarchy-zone"
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
                {zoneList.map((z) => (
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
            selectedZone ? `Bins in ${selectedZone.name}` : 'Select a zone first.'
          }
        >
          <div className="space-y-2">
            <Label htmlFor="hierarchy-bin" className="sr-only">
              Bin
            </Label>
            <Select
              value={binId || undefined}
              onValueChange={onBinChange}
              disabled={disabled || !selectedZone}
            >
              <SelectTrigger
                id="hierarchy-bin"
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
                {binList.map((b) => (
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
    </div>
  )
}
