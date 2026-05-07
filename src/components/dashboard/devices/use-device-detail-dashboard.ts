'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/hook/dashboard/devices/use-device-detail-dashboard.md
 */


import { useCallback, useEffect, useState } from 'react'

import { dashboardApiClient } from '@/lib/axios'
import type { DeviceDetailDashboardDTO } from '@/types/device-detail-dashboard.types'
import type { ApiResponse } from '@/types/responses/basic-response'

export function useDeviceDetailDashboard(deviceId: string): {
  data: DeviceDetailDashboardDTO | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
} {
  const [data, setData] = useState<DeviceDetailDashboardDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await dashboardApiClient.get<ApiResponse<DeviceDetailDashboardDTO>>(
        `/dashboard/devices/${deviceId}/overview`
      )

      if (response.success && response.data) {
        setData(response.data)
      } else {
        setError(response.message)
        setData(null)
      }
    } catch {
      setError('Could not load device overview. Please try again.')
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [deviceId])

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
