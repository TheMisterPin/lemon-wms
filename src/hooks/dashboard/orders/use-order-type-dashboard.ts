'use client'

import { useCallback, useEffect, useState } from 'react'

import { dashboardApiClient } from '@/lib/axios'
import type { OrderTypeDashboardPayload } from '@/lib/pages/dashboard/get-order-type-dashboard-data'
import type { ApiResponse } from '@/types/responses/basic-response'

type UseOrderTypeDashboardResult = {
  data: OrderTypeDashboardPayload | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useOrderTypeDashboard(orderTypeRouteKey: string, enabled: boolean): UseOrderTypeDashboardResult {
  const [data, setData] = useState<OrderTypeDashboardPayload | null>(null)
  const [isLoading, setIsLoading] = useState(() => enabled)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!enabled) {
      return
    }

    const key = orderTypeRouteKey.trim().toLowerCase()
    if (key === '') {
      setIsLoading(false)
      setError('Missing order type.')
      setData(null)

      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const encoded = encodeURIComponent(key)
      const response = await dashboardApiClient.get<ApiResponse<OrderTypeDashboardPayload>>(
        `/dashboard/orders/${encoded}`
      )

      if (response.success && response.data) {
        setData(response.data)
      } else {
        setError(response.message)
        setData(null)
      }
    } catch {
      setError('Could not load order dashboard. Please try again.')
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [enabled, orderTypeRouteKey])

  useEffect(() => {
    if (!enabled) {
      setData(null)
      setError(null)
      setIsLoading(false)

      return
    }

    void load()
  }, [enabled, load])

  return {
    data,
    isLoading,
    error,
    refetch: load
  }
}
