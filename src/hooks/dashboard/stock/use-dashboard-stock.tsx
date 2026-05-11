'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/hook/dashboard/stock/use-dashboard-stock.md
 */

import { useCallback, useEffect, useState } from 'react'

import { dashboardApiClient } from '@/lib/axios'
import type { ApiResponse } from '@/types/responses/basic-response'
import type { StockDashboardData } from '@/types/stock-dashboard.types'

export type UseDashboardStockOptions = {
  /** Omit or `null` for all warehouses; pass a UUID to scope. */
  warehouseId?: string | null
  /** When false, no request is made (e.g. sidebar only loads when on stock routes). */
  enabled?: boolean
}

export type UseDashboardStockReturn = {
  isLoading: boolean
  error: string | null
  refetch: () => void
  data: StockDashboardData | null
}

type StockDashboardFetchResult =
  | { ok: true; data: StockDashboardData }
  | { ok: false; error: string }

async function fetchStockDashboardData(
  warehouseId: string | null
): Promise<StockDashboardFetchResult> {
  try {
    const qs =
      warehouseId === null || warehouseId.trim() === ''
        ? ''
        : `?warehouseId=${encodeURIComponent(warehouseId)}`

    const response = await dashboardApiClient.get<ApiResponse<StockDashboardData>>(`/dashboard/stock${qs}`)

    if (response.success && response.data) {
      return { ok: true, data: response.data }
    }

    const message =
      typeof response.message === 'string' && response.message.trim() !== ''
        ? response.message
        : 'Could not load stock dashboard.'

    return { ok: false, error: message }
  } catch {
    return { ok: false, error: 'Could not load stock dashboard. Please try again.' }
  }
}

export function useDashboardStock(options: UseDashboardStockOptions = {}): UseDashboardStockReturn {
  const warehouseId = options.warehouseId ?? null
  const enabled = options.enabled ?? true

  const [data, setData] = useState<StockDashboardData | null>(null)
  const [fetching, setFetching] = useState(Boolean(enabled))
  const [error, setError] = useState<string | null>(null)

  const isLoading = Boolean(enabled && fetching)
  const visibleData = enabled ? data : null
  const visibleError = enabled ? error : null

  const refetch = useCallback(() => {
    if (!enabled) {
      return
    }

    void (async () => {
      setFetching(true)
      setError(null)
      const result = await fetchStockDashboardData(warehouseId)
      if (result.ok) {
        setData(result.data)
      } else {
        setError(result.error)
        setData(null)
      }
      setFetching(false)
    })()
  }, [warehouseId, enabled])

  useEffect(() => {
    if (!enabled) {
      return
    }

    let cancelled = false

    async function run() {
      setFetching(true)
      setError(null)
      const result = await fetchStockDashboardData(warehouseId)
      if (cancelled) {
        return
      }
      if (result.ok) {
        setData(result.data)
      } else {
        setError(result.error)
        setData(null)
      }
      setFetching(false)
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [warehouseId, enabled])

  return {
    isLoading,
    error: visibleError,
    refetch,
    data: visibleData
  }
}
