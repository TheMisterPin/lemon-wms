'use client'

import { useCallback, useEffect, useState } from 'react'

import { warehouseApiClient } from '@/lib/axios'
import type { ApiResponse } from '@/types/responses/basic-response'

export type WarehouseZoneOption = {
  id: string
  name: string
}

export type UseWarehouseZonesReturn = {
  zones: WarehouseZoneOption[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useWarehouseZones(): UseWarehouseZonesReturn {
  const [zones, setZones] = useState<WarehouseZoneOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchZones = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await warehouseApiClient.get<
        ApiResponse<{ zones: WarehouseZoneOption[] }>
      >('/warehouse/zones')

      if (response.success && response.data) {
        setZones(response.data.zones)
      } else {
        setZones([])
        setError(response.message ?? 'Could not load zones.')
      }
    } catch {
      setZones([])
      setError('Could not load zones.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchZones()
  }, [fetchZones])

  return {
    zones,
    isLoading,
    error,
    refetch: fetchZones
  }
}
