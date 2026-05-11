'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/hook/dashboard/stock/use-category-stock-dashboard.md
 */

import { useCallback, useEffect, useState } from 'react'

import { dashboardApiClient } from '@/lib/axios'
import type { CategoryStockDashboardDTO } from '@/types/category-stock-dashboard.types'
import type { ApiResponse } from '@/types/responses/basic-response'

type UseCategoryStockDashboardReturn = {
  data: CategoryStockDashboardDTO | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useCategoryStockDashboard(categoryId?: string): UseCategoryStockDashboardReturn {
  const [data, setData] = useState<CategoryStockDashboardDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const qs = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : ''
      const response = await dashboardApiClient.get<ApiResponse<CategoryStockDashboardDTO>>(
        `/dashboard/stock/categories/overview${qs}`
      )

      if (response.success && response.data) {
        setData(response.data)
      } else {
        setError(response.message || 'Could not load category stock dashboard.')
        setData(null)
      }
    } catch {
      setError('Could not load category stock dashboard. Please try again.')
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [categoryId])

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
