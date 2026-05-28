'use client'

import { useMemo, useState } from 'react'

import { ChevronDown, MapPin } from 'lucide-react'

import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { useSwitchFloorZone } from '@/hooks/warehouse/use-switch-floor-zone'
import { useWarehouseZones } from '@/hooks/warehouse/use-warehouse-zones'
import { useAuthStore } from '@/lib/auth/store'
import { cn } from '@/lib/utils'

export function WarehouseHomeZoneSwitch() {
  const zoneId = useAuthStore((s) => s.location?.zoneId)
  const { zones, isLoading, error } = useWarehouseZones()
  const { switchZone, isSwitching } = useSwitchFloorZone()
  const [isOpen, setIsOpen] = useState(false)

  const currentName = useMemo(() => {
    if (!zoneId) {
      return 'Select zone'
    }

    return zones.find((z) => z.id === zoneId)?.name ?? 'Current zone'
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
        <button
          type="button"
          disabled={isLoading || Boolean(error) || isSwitching}
          className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-xl border px-4 text-sm font-medium transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            background: 'var(--wh-card-bg)',
            borderColor: 'var(--wh-border)',
            color: 'var(--wh-text-primary)'
          }}
        >
          <MapPin className="size-4 shrink-0" style={{ color: 'var(--wh-status-available)' }} />
          <span>Change zone / warehouse</span>
          <ChevronDown className="size-4 shrink-0 opacity-70" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        className="w-64 border p-1"
        style={{
          background: 'var(--wh-card-bg-soft)',
          borderColor: 'var(--wh-border)',
          color: 'var(--wh-text-primary)'
        }}
      >
        <p className="px-3 py-2 text-xs" style={{ color: 'var(--wh-text-muted)' }}>
          Current: {currentName}
        </p>
        {error ? (
          <p className="px-3 py-2 text-xs" style={{ color: 'var(--wh-status-blocked)' }}>{error}</p>
        ) : null}
        {!error && isLoading ? (
          <p className="px-3 py-2 text-xs" style={{ color: 'var(--wh-text-muted)' }}>Loading zones…</p>
        ) : null}
        {!error && !isLoading && zones.length === 0 ? (
          <p className="px-3 py-2 text-xs" style={{ color: 'var(--wh-text-muted)' }}>No zones in this warehouse.</p>
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
                    'flex w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                    active
                      ? 'font-medium'
                      : 'hover:opacity-90'
                  )}
                  style={
                    active
                      ? {
                        background: 'var(--wh-card-bg)',
                        color: 'var(--wh-text-primary)'
                      }
                      : { color: 'var(--wh-text-muted)' }
                  }
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
