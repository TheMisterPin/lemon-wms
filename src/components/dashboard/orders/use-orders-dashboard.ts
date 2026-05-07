'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/hook/dashboard/orders/use-orders-dashboard.md
 */


import { useCallback, useEffect, useState } from 'react'

import { dashboardApiClient } from '@/lib/axios'
import type { OrdersDashboardDTO } from '@/types/orders-dashboard.types'
import type { ApiResponse } from '@/types/responses/basic-response'

type UseOrdersDashboardReturn = {
  data: OrdersDashboardDTO | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useOrdersDashboard(): UseOrdersDashboardReturn {
  const [data, setData] = useState<OrdersDashboardDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await dashboardApiClient.get<ApiResponse<OrdersDashboardDTO>>(
        '/dashboard/orders/overview'
      )

      if (response.success && response.data) {
        setData(response.data)
      } else {
        setError(response.message)
        setData(null)
      }
    } catch {
      setError('Could not load orders dashboard. Please try again.')
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

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
