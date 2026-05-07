'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/hook/dashboard/stock/use-inventory-health-dashboard.md
 */


import { useCallback, useEffect, useState } from 'react'

import { dashboardApiClient } from '@/lib/axios'
import type { InventoryHealthDashboardDTO } from '@/types/inventory-health-dashboard.types'
import type { ApiResponse } from '@/types/responses/basic-response'

type UseInventoryHealthDashboardReturn = {
  data: InventoryHealthDashboardDTO | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useInventoryHealthDashboard(): UseInventoryHealthDashboardReturn {
  const [data, setData] = useState<InventoryHealthDashboardDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await dashboardApiClient.get<ApiResponse<InventoryHealthDashboardDTO>>(
        '/dashboard/stock/health/overview'
      )

      if (response.success && response.data) {
        setData(response.data)
      } else {
        setError(response.message || 'Could not load inventory health dashboard.')
        setData(null)
      }
    } catch {
      setError('Could not load inventory health dashboard. Please try again.')
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
