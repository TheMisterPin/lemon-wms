'use client'

import { useCallback, useEffect, useState } from 'react'

import { dashboardApiClient } from '@/lib/axios'
import type { ApiResponse } from '@/types/responses/basic-response'
import type { SubcategoryStockDashboardDTO } from '@/types/subcategory-stock-dashboard.types'

type UseSubcategoryStockDashboardReturn = {
  data: SubcategoryStockDashboardDTO | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useSubcategoryStockDashboard(
  subcategoryCode: string
): UseSubcategoryStockDashboardReturn {
  const [data, setData] = useState<SubcategoryStockDashboardDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const encoded = encodeURIComponent(subcategoryCode.trim())
      const response = await dashboardApiClient.get<ApiResponse<SubcategoryStockDashboardDTO>>(
        `/dashboard/stock/subcategory/${encoded}`
      )

      if (response.success && response.data) {
        setData(response.data)
      } else {
        setError(response.message || 'Could not load subcategory stock dashboard.')
        setData(null)
      }
    } catch {
      setError('Could not load subcategory stock dashboard. Please try again.')
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [subcategoryCode])

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
