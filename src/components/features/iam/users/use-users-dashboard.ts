'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/hook/dashboard/users/use-users-dashboard.md
 */


import { useCallback, useEffect, useState } from 'react'

import { dashboardApiClient } from '@/lib/axios'
import type { ApiResponse } from '@/types/responses/basic-response'
import type { UsersDashboardDTO } from '@/types/users-dashboard.types'

type UseUsersDashboardReturn = {
  data: UsersDashboardDTO | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useUsersDashboard(warehouseId?: string): UseUsersDashboardReturn {
  const [data, setData] = useState<UsersDashboardDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const qs = warehouseId ? `?warehouseId=${encodeURIComponent(warehouseId)}` : ''
      const response = await dashboardApiClient.get<ApiResponse<UsersDashboardDTO>>(
        `/dashboard/users/overview${qs}`
      )

      if (response.success && response.data) {
        setData(response.data)
      } else {
        setError(response.message || 'Could not load users dashboard.')
        setData(null)
      }
    } catch {
      setError('Could not load users dashboard. Please try again.')
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [warehouseId])

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
