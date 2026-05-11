'use client'

import { useCallback, useEffect, useState } from 'react'

import { dashboardApiClient } from '@/lib/axios'
import type { ApiResponse } from '@/types/responses/basic-response'
import type { StockCategoryTreeDTO } from '@/types/stock-category-tree.types'

type UseStockCategoryTreeResult = {
  tree: StockCategoryTreeDTO | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/** Loads `/api/dashboard/stock/category-tree` for stock sidebar pickers. */
export function useStockCategoryTree(enabled: boolean): UseStockCategoryTreeResult {
  const [tree, setTree] = useState<StockCategoryTreeDTO | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!enabled) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await dashboardApiClient.get<ApiResponse<StockCategoryTreeDTO>>(
        '/dashboard/stock/category-tree'
      )

      if (response.success && response.data) {
        setTree(response.data)
      } else {
        setError(response.message ?? 'Unable to load categories.')
        setTree(null)
      }
    } catch {
      setError('Unable to load categories.')
      setTree(null)
    } finally {
      setIsLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) {
      setTree(null)
      setError(null)
      setIsLoading(false)

      return
    }

    void load()
  }, [enabled, load])

  return {
    tree,
    isLoading,
    error,
    refetch: load
  }
}
