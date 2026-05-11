'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/hook/dashboard/stock/use-item-detail-dashboard.md
 */

import { useCallback, useEffect, useState } from 'react'

import { dashboardApiClient } from '@/lib/axios'
import type { ItemDetailDashboardDTO } from '@/types/item-detail-dashboard.types'
import type { ApiResponse } from '@/types/responses/basic-response'

type UseItemDetailDashboardReturn = {
  data: ItemDetailDashboardDTO | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useItemDetailDashboard(itemId: string): UseItemDetailDashboardReturn {
  const [data, setData] = useState<ItemDetailDashboardDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await dashboardApiClient.get<ApiResponse<ItemDetailDashboardDTO>>(
        `/dashboard/stock/items/${encodeURIComponent(itemId)}/overview`
      )

      if (response.success && response.data) {
        setData(response.data)
      } else {
        setError(response.message || 'Could not load item detail dashboard.')
        setData(null)
      }
    } catch {
      setError('Could not load item detail dashboard. Please try again.')
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [itemId])

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
