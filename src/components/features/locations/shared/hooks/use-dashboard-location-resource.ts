'use client'

import { useCallback, useEffect, useState } from 'react'

import { dashboardApiClient } from '@/lib/axios'
import type { ApiResponse } from '@/types/responses/basic-response'

type UseDashboardLocationResourceParams = {
  endpoint: string
  fallbackError: string
}

export function useDashboardLocationResource<TData>({
  endpoint,
  fallbackError
}: UseDashboardLocationResourceParams) {
  const [data, setData] = useState<TData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await dashboardApiClient.get<ApiResponse<TData>>(endpoint)

      if (response.success && response.data) {
        setData(response.data)
      } else {
        setError(response.message)
        setData(null)
      }
    } catch {
      setError(fallbackError)
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [endpoint, fallbackError])

  useEffect(() => {
    void load()
  }, [load])

  return {
    data,
    isLoading,
    error,
    reload: load
  }
}
