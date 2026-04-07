'use client'

import { useEffect, useMemo, useState } from 'react'

import { warehouseApiClient } from '@/lib/axios'
import type { ApiResponse } from '@/types/responses/basic-response'

export type BinStockRecord = {
  id: string
  description: string
  itemId: string
  lotId: string | null
  serialNumberId: string | null
  boxId: string | null
  uom: string
  quantityAvailable: number | string
  quantityReserved: number | string
  quantityBlocked: number | string
}

export type BinDetails = {
  id: string
  code: string
  name: string
  type: string
  zoneId: string
  warehouseId: string
  currentCapacity: number | string
  maxCapacity: number | string
  isBlocked: boolean
  blockReason: string | null
}

type BinDetailsResponse = {
  bin: BinDetails
  items: BinStockRecord[]
}

export function useBinDetails(binId: string) {
  const [data, setData] = useState<BinDetailsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!binId) return

    let cancelled = false

    async function fetchBinDetails() {
      try {
        setIsLoading(true)
        const response = await warehouseApiClient.get<ApiResponse<BinDetailsResponse>>(`/warehouse/bins/${binId}`)
        if (!cancelled && response.success && response.data) {
          setData(response.data)
        }
      } catch (error) {
        console.error('[useBinDetails] Failed to fetch:', error)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void fetchBinDetails()
    return () => { cancelled = true }
  }, [binId, refreshKey])

  const occupancy = useMemo(() => {
    if (!data?.bin) return '0%'
    const current = Number(data.bin.currentCapacity) || 0
    const max = Number(data.bin.maxCapacity) || 0
    if (max <= 0) return '0%'
    return `${Math.round((current / max) * 100)}%`
  }, [data])

  return {
    bin: data?.bin ?? null,
    items: data?.items ?? [],
    isLoading,
    occupancy,
    refresh: () => setRefreshKey((k) => k + 1)
  }
}
