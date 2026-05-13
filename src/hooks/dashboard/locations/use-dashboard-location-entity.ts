'use client'

import { useCallback, useEffect, useState } from 'react'

import { dashboardApiClient } from '@/lib/axios'
import type { BinUpdateValues } from '@/lib/locations'
import type { IBin } from '@/types/models/bin'
import type { ApiResponse } from '@/types/responses/basic-response'

export type WarehouseDetail = {
  id: string
  name: string
  address: string
  timezone: string
  currency: string
  status: string
  createdById: string | null
  createdAt: string
  deletedAt: string | null
}

export type ZoneDetail = {
  id: string
  warehouseId: string
  name: string
  type: string
  isActive: boolean
  customPermissions: unknown
  defaultReceivingBinId: string | null
  defaultQuarantineBinId: string | null
  defaultOutgoingBinId: string | null
  createdAt: string
  deletedAt: string | null
}

type UseAsyncEntityResult<T> = {
  data: T | null
  isLoading: boolean
  error: string | null
  refetch: () => void
  update: (body: unknown) => Promise<{ success: boolean; error?: string }>
}

function parseWarehouse(payload: unknown): WarehouseDetail | null {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  const row = payload as Record<string, unknown>

  if (
    typeof row.id !== 'string'
    || typeof row.name !== 'string'
    || typeof row.address !== 'string'
  ) {
    return null
  }

  return {
    id: row.id,
    name: row.name,
    address: row.address,
    timezone: typeof row.timezone === 'string' ? row.timezone : '',
    currency: typeof row.currency === 'string' ? row.currency : '',
    status: typeof row.status === 'string' ? row.status : '',
    createdById: typeof row.createdById === 'string' ? row.createdById : null,
    createdAt: typeof row.createdAt === 'string' ? row.createdAt : String(row.createdAt ?? ''),
    deletedAt: row.deletedAt === null || typeof row.deletedAt === 'string' ? row.deletedAt as string | null : null
  }
}

function parseZone(payload: unknown): ZoneDetail | null {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  const row = payload as Record<string, unknown>

  if (typeof row.id !== 'string' || typeof row.name !== 'string') {
    return null
  }

  return {
    id: row.id,
    warehouseId: typeof row.warehouseId === 'string' ? row.warehouseId : '',
    name: row.name,
    type: typeof row.type === 'string' ? row.type : '',
    isActive: typeof row.isActive === 'boolean' ? row.isActive : false,
    customPermissions: row.customPermissions ?? null,
    defaultReceivingBinId:
      typeof row.defaultReceivingBinId === 'string'
        ? row.defaultReceivingBinId
        : row.defaultReceivingBinId === null
          ? null
          : null,
    defaultQuarantineBinId:
      typeof row.defaultQuarantineBinId === 'string'
        ? row.defaultQuarantineBinId
        : row.defaultQuarantineBinId === null
          ? null
          : null,
    defaultOutgoingBinId:
      typeof row.defaultOutgoingBinId === 'string'
        ? row.defaultOutgoingBinId
        : row.defaultOutgoingBinId === null
          ? null
          : null,
    createdAt: typeof row.createdAt === 'string' ? row.createdAt : String(row.createdAt ?? ''),
    deletedAt: row.deletedAt === null || typeof row.deletedAt === 'string' ? row.deletedAt as string | null : null
  }
}

export function useDashboardWarehouseDetail(
  warehouseId: string | null,
  enabled: boolean
): UseAsyncEntityResult<WarehouseDetail> {
  const [data, setData] = useState<WarehouseDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const refetch = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    if (!enabled || !warehouseId) {
      setData(null)
      setError(null)
      setIsLoading(false)

      return
    }

    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)

      try {
        const res = await dashboardApiClient.get<ApiResponse<unknown>>(
          `/dashboard/warehouses/${warehouseId}`
        )

        if (cancelled) {
          return
        }

        if (!res.success || res.data === null) {
          setError(res.message ?? 'Unable to load warehouse.')
          setData(null)

          return
        }

        const parsed = parseWarehouse(res.data)
        if (!parsed) {
          setError('Invalid warehouse response.')
          setData(null)

          return
        }

        setData(parsed)
      } catch {
        if (!cancelled) {
          setError('Unable to load warehouse.')
          setData(null)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [warehouseId, enabled, tick])

  const update = useCallback(
    async (body: unknown) => {
      if (!warehouseId) {
        return { success: false, error: 'No warehouse selected.' }
      }

      try {
        const res = await dashboardApiClient.put<ApiResponse<unknown>>(
          `/dashboard/warehouses/${warehouseId}`,
          body
        )

        if (!res.success || res.data === null) {
          return { success: false, error: res.message ?? 'Update failed.' }
        }

        const parsed = parseWarehouse(res.data)
        if (parsed) {
          setData(parsed)
        }

        return { success: true }
      } catch {
        return { success: false, error: 'Update failed.' }
      }
    },
    [warehouseId]
  )

  return { data, isLoading, error, refetch, update }
}

export function useDashboardZoneDetail(
  zoneId: string | null,
  enabled: boolean
): UseAsyncEntityResult<ZoneDetail> {
  const [data, setData] = useState<ZoneDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const refetch = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    if (!enabled || !zoneId) {
      setData(null)
      setError(null)
      setIsLoading(false)

      return
    }

    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)

      try {
        const res = await dashboardApiClient.get<ApiResponse<unknown>>(
          `/dashboard/zones/${zoneId}`
        )

        if (cancelled) {
          return
        }

        if (!res.success || res.data === null) {
          setError(res.message ?? 'Unable to load zone.')
          setData(null)

          return
        }

        const parsed = parseZone(res.data)
        if (!parsed) {
          setError('Invalid zone response.')
          setData(null)

          return
        }

        setData(parsed)
      } catch {
        if (!cancelled) {
          setError('Unable to load zone.')
          setData(null)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [zoneId, enabled, tick])

  const update = useCallback(
    async (body: unknown) => {
      if (!zoneId) {
        return { success: false, error: 'No zone selected.' }
      }

      try {
        const res = await dashboardApiClient.put<ApiResponse<unknown>>(
          `/dashboard/zones/${zoneId}`,
          body
        )

        if (!res.success || res.data === null) {
          return { success: false, error: res.message ?? 'Update failed.' }
        }

        const parsed = parseZone(res.data)
        if (parsed) {
          setData(parsed)
        }

        return { success: true }
      } catch {
        return { success: false, error: 'Update failed.' }
      }
    },
    [zoneId]
  )

  return { data, isLoading, error, refetch, update }
}

export function useDashboardBinDetail(
  binId: string | null,
  enabled: boolean
): Omit<UseAsyncEntityResult<IBin>, 'update'> & {
  update: (body: BinUpdateValues) => Promise<{ success: boolean; error?: string }>
} {
  const [data, setData] = useState<IBin | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const refetch = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    if (!enabled || !binId) {
      setData(null)
      setError(null)
      setIsLoading(false)

      return
    }

    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)

      try {
        const res = await dashboardApiClient.get<ApiResponse<IBin>>(
          `/dashboard/bins/${binId}`
        )

        if (cancelled) {
          return
        }

        if (!res.success || res.data === null) {
          setError(res.message ?? 'Unable to load bin.')
          setData(null)

          return
        }

        setData(res.data)
      } catch {
        if (!cancelled) {
          setError('Unable to load bin.')
          setData(null)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [binId, enabled, tick])

  const update = useCallback(
    async (body: BinUpdateValues) => {
      if (!binId) {
        return { success: false, error: 'No bin selected.' }
      }

      try {
        const res = await dashboardApiClient.put<ApiResponse<IBin>>(
          `/dashboard/bins/${binId}`,
          body
        )

        if (!res.success || res.data === null) {
          return { success: false, error: res.message ?? 'Update failed.' }
        }

        setData(res.data)

        return { success: true }
      } catch {
        return { success: false, error: 'Update failed.' }
      }
    },
    [binId]
  )

  return { data, isLoading, error, refetch, update }
}
