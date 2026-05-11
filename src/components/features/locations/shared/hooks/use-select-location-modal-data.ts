'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { dashboardApiClient } from '@/lib/axios'
import {
  buildSelectLocationModalTree,
  type SelectLocationModalTreeSource
} from '@/lib/transformers/locations/build-select-location-modal-tree'
import type { SelectLocationModalWarehouseDto } from '@/types/dto/locations/select-location-modal.types'
import type { ApiResponse } from '@/types/responses/basic-response'

type HomePayload = SelectLocationModalTreeSource

export type UseSelectLocationModalDataResult = {
  tree: SelectLocationModalWarehouseDto[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Loads `/dashboard/home` and exposes data shaped for {@link buildSelectLocationModalTree}.
 * When `enabled` is false, no network request runs (sidebar uses this off the locations area).
 */
export function useSelectLocationModalData(enabled: boolean): UseSelectLocationModalDataResult {
  const [raw, setRaw] = useState<HomePayload | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!enabled) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await dashboardApiClient.get<ApiResponse<HomePayload>>('/dashboard/home')

      if (response.success && response.data) {
        setRaw(response.data)
      } else {
        setError(response.message ?? 'Unable to load locations.')
        setRaw(null)
      }
    } catch {
      setError('Unable to load locations.')
      setRaw(null)
    } finally {
      setIsLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) {
      setRaw(null)
      setError(null)
      setIsLoading(false)

      return
    }

    void load()
  }, [enabled, load])

  const tree = useMemo(() => (raw ? buildSelectLocationModalTree(raw) : []), [raw])

  return {
    tree,
    isLoading,
    error,
    refetch: load
  }
}
