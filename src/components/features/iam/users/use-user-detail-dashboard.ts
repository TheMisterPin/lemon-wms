'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/hook/dashboard/users/use-user-detail-dashboard.md
 */


import { useCallback, useEffect, useState } from 'react'

import { dashboardApiClient } from '@/lib/axios'
import type { ApiResponse } from '@/types/responses/basic-response'
import type { UserDetailDashboardDTO } from '@/types/user-detail-dashboard.types'

type UseUserDetailDashboardReturn = {
  data: UserDetailDashboardDTO | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useUserDetailDashboard(userId: string): UseUserDetailDashboardReturn {
  const [data, setData] = useState<UserDetailDashboardDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await dashboardApiClient.get<ApiResponse<UserDetailDashboardDTO>>(
        `/dashboard/users/${encodeURIComponent(userId)}/overview`
      )

      if (response.success && response.data) {
        setData(response.data)
      } else {
        setError(response.message || 'Could not load user detail dashboard.')
        setData(null)
      }
    } catch {
      setError('Could not load user detail dashboard. Please try again.')
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

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
