'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/hook/dashboard/orders/use-order-detail-dashboard.md
 */

import { useCallback, useEffect, useState } from 'react'

import { dashboardApiClient } from '@/lib/axios'
import type { OrderDetailDashboardDTO } from '@/types/order-detail-dashboard.types'
import type { ApiResponse } from '@/types/responses/basic-response'

type UseOrderDetailDashboardReturn = {
  data: OrderDetailDashboardDTO | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useOrderDetailDashboard(
  orderType: string,
  orderId: string
): UseOrderDetailDashboardReturn {
  const [data, setData] = useState<OrderDetailDashboardDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await dashboardApiClient.get<ApiResponse<OrderDetailDashboardDTO>>(
        `/dashboard/orders/${encodeURIComponent(orderType)}/${encodeURIComponent(orderId)}/detail`
      )

      if (response.success && response.data) {
        setData(response.data)
      } else {
        setError(response.message || 'Could not load order detail dashboard.')
        setData(null)
      }
    } catch {
      setError('Could not load order detail dashboard. Please try again.')
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [orderId, orderType])

  useEffect(() => {
    void load()
  }, [load])

  return {
    data,
    isLoading,
    error,
    refetch: load
  }
}
