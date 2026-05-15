'use client'

import { useMemo, useState } from 'react'

import { ChevronDown, MapPin } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { useSwitchFloorZone } from '@/hooks/warehouse/use-switch-floor-zone'
import { useWarehouseZones } from '@/hooks/warehouse/use-warehouse-zones'
import { useAuthStore } from '@/lib/auth/store'
import { cn } from '@/lib/utils'

export function WarehouseZonePicker() {
  const zoneId = useAuthStore((s) => s.location?.zoneId)
  const { zones, isLoading, error } = useWarehouseZones()
  const { switchZone, isSwitching } = useSwitchFloorZone()
  const [isOpen, setIsOpen] = useState(false)

  const currentName = useMemo(() => {
    if (!zoneId) {
      return 'Zone'
    }

    return zones.find((z) => z.id === zoneId)?.name ?? 'Zone'
  }, [zoneId, zones])

  const handleSelect = async (id: string) => {
    if (id === zoneId || isSwitching) {
      return
    }

    const result = await switchZone(id)

    if (result.success) {
      setIsOpen(false)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          disabled={isLoading || Boolean(error)}
          className="h-9 gap-1.5 px-2 text-dash-muted hover:bg-dash-border hover:text-dash-text"
        >
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="max-w-[10rem] truncate text-sm">{currentName}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-70" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-56 border-dash-border bg-dash-shell p-1"
      >
        {error ? (
          <p className="px-2 py-2 text-xs text-dash-red-text">{error}</p>
        ) : null}
        {!error && isLoading ? (
          <p className="px-2 py-2 text-xs text-dash-muted">Loading zones…</p>
        ) : null}
        {!error && !isLoading && zones.length === 0 ? (
          <p className="px-2 py-2 text-xs text-dash-muted">No zones.</p>
        ) : null}
        <ul className="max-h-64 overflow-y-auto">
          {zones.map((z) => {
            const active = z.id === zoneId

            return (
              <li key={z.id}>
                <button
                  type="button"
                  disabled={isSwitching}
                  onClick={() => void handleSelect(z.id)}
                  className={cn(
                    'flex w-full rounded-sm px-3 py-2 text-left text-sm transition-colors',
                    active
                      ? 'bg-dash-border font-medium text-dash-text'
                      : 'text-dash-muted hover:bg-dash-border hover:text-dash-text'
                  )}
                >
                  {z.name}
                </button>
              </li>
            )
          })}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
