'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/hook/dashboard/bins/use-dashboard-bin-overview.md
 */

import { useCallback, useEffect, useState } from 'react'

import { dashboardApiClient } from '@/lib/axios'
import type { BinDetailDashboardDTO } from '@/types/bin-detail-dashboard.types'
import type { ApiResponse } from '@/types/responses/basic-response'

export function useDashboardBinOverview(binId: string): {
  data: BinDetailDashboardDTO | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
} {
  const [data, setData] = useState<BinDetailDashboardDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await dashboardApiClient.get<ApiResponse<BinDetailDashboardDTO>>(
        `/dashboard/bins/${binId}/overview`
      )

      if (response.success && response.data) {
        setData(response.data)
      } else {
        setError(response.message)
        setData(null)
      }
    } catch {
      setError('Could not load bin overview. Please try again.')
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [binId])

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
