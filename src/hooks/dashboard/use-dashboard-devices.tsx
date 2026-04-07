'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import type { ReactNode } from 'react'
import { AxiosError } from 'axios'

import { apiClient } from '@/lib/axios'
import type { DeviceTableRow } from '@/components/configs/entities/device/config'
import type { SelectOption } from '@/types/components/form/generic-form.types'
import type { ApiResponse } from '@/types/responses/basic-response'

// ── API response shapes ──────────────────────────────────────────────

type ApiPayload<T> = { success: boolean; data: T }

type DeviceApiRecord = {
  id: string
  name: string
  code: string
  warehouseId: string | null
  zoneId: string | null
  authorized: boolean
  isActive: boolean
  type: string
  registeredAt: string
}

type WarehouseApiRecord = {
  id: string
  name: string
}

type ZoneApiRecord = {
  id: string
  warehouseId: string
  name: string
}

// ── Mutation error ───────────────────────────────────────────────────

 interface MutationError {
  message: string
  code?: string
  details?: unknown
}

// ── Context value ────────────────────────────────────────────────────

interface DashboardDevicesContextValue {
  devices: DeviceTableRow[]
  warehouseOptions: SelectOption[]
  zoneOptions: SelectOption[]
  isLoading: boolean
  error: string | null
  mutationError: MutationError | null
  clearMutationError: () => void
  authorizeDevice: (code: string, warehouseId: string, zoneId: string) => Promise<void>
  deauthorizeDevice: (code: string) => Promise<void>
  refresh: () => void
}

const DashboardDevicesContext = createContext<DashboardDevicesContextValue | null>(null)

// ── Helpers ──────────────────────────────────────────────────────────

function extractMutationError(err: unknown): MutationError {
  if (err instanceof AxiosError && err.response?.data) {
    const body = err.response.data as ApiResponse<null>

    return {
      message: body.message ?? 'An unexpected error occurred.',
      code: body.error?.code,
      details: body.error?.details
    }
  }

  if (err instanceof Error) {
    return { message: err.message }
  }

  return { message: 'An unexpected error occurred.' }
}

// ── Provider ─────────────────────────────────────────────────────────

export function DashboardDevicesProvider({ children }: { children: ReactNode }) {
  const [rawDevices, setRawDevices] = useState<DeviceApiRecord[]>([])
  const [rawWarehouses, setRawWarehouses] = useState<WarehouseApiRecord[]>([])
  const [rawZones, setRawZones] = useState<ZoneApiRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [mutationError, setMutationError] = useState<MutationError | null>(null)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
  const clearMutationError = useCallback(() => setMutationError(null), [])

  // ── Fetch all data ───────────────────────────────────────────────

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      setIsLoading(true)
      setError(null)

      try {
        const [devicesPayload, warehousesPayload, zonesPayload] = await Promise.all([
          apiClient.get<ApiPayload<DeviceApiRecord[]>>('/devices'),
          apiClient.get<ApiPayload<WarehouseApiRecord[]>>('/warehouses'),
          apiClient.get<ApiPayload<ZoneApiRecord[]>>('/zones')
        ])

        if (!isMounted) {
          return
        }

        setRawDevices(Array.isArray(devicesPayload.data) ? devicesPayload.data : [])
        setRawWarehouses(Array.isArray(warehousesPayload.data) ? warehousesPayload.data : [])
        setRawZones(Array.isArray(zonesPayload.data) ? zonesPayload.data : [])
      } catch {
        if (!isMounted) {
          return
        }
        setError('Unable to load device data.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadData()

    return () => {
      isMounted = false
    }
  }, [refreshKey])

  // ── Derived values ───────────────────────────────────────────────

  const warehouseOptions = useMemo<SelectOption[]>(
    () => rawWarehouses.map((w) => ({ label: w.name, value: w.id })),
    [rawWarehouses]
  )

  const zoneOptions = useMemo<SelectOption[]>(
    () => rawZones.map((z) => ({ label: z.name, value: z.id })),
    [rawZones]
  )

  const warehouseNameMap = useMemo(
    () => new Map(rawWarehouses.map((w) => [w.id, w.name])),
    [rawWarehouses]
  )

  const zoneNameMap = useMemo(
    () => new Map(rawZones.map((z) => [z.id, z.name])),
    [rawZones]
  )

  const devices = useMemo<DeviceTableRow[]>(
    () => rawDevices.map((d) => ({
      ...d,
      warehouseName: d.warehouseId ? (warehouseNameMap.get(d.warehouseId) ?? d.warehouseId) : '—',
      zoneName: d.zoneId ? (zoneNameMap.get(d.zoneId) ?? d.zoneId) : '—'
    })),
    [rawDevices, warehouseNameMap, zoneNameMap]
  )

  // ── Mutations ────────────────────────────────────────────────────

  const authorizeDevice = useCallback(
    async (code: string, warehouseId: string, zoneId: string) => {
      try {
        await apiClient.post('/devices/authorize', { code, warehouseId, zoneId })
        refresh()
      } catch (err) {
        const parsed = extractMutationError(err)
        setMutationError(parsed)
        throw new Error(parsed.message)
      }
    },
    [refresh]
  )

  const deauthorizeDevice = useCallback(
    async (code: string) => {
      try {
        await apiClient.post('/devices/deauthorize', { code })
        refresh()
      } catch (err) {
        const parsed = extractMutationError(err)
        setMutationError(parsed)
        throw new Error(parsed.message)
      }
    },
    [refresh]
  )

  // ── Context value ────────────────────────────────────────────────

  const value = useMemo<DashboardDevicesContextValue>(
    () => ({
      devices,
      warehouseOptions,
      zoneOptions,
      isLoading,
      error,
      mutationError,
      clearMutationError,
      authorizeDevice,
      deauthorizeDevice,
      refresh
    }),
    [
      devices,
      warehouseOptions,
      zoneOptions,
      isLoading,
      error,
      mutationError,
      clearMutationError,
      authorizeDevice,
      deauthorizeDevice,
      refresh
    ]
  )

  return (
    <DashboardDevicesContext.Provider value={value}>
      {children}
    </DashboardDevicesContext.Provider>
  )
}

// ── Hook ─────────────────────────────────────────────────────────────

export function useDashboardDevices() {
  const context = useContext(DashboardDevicesContext)

  if (!context) {
    throw new Error('useDashboardDevices must be used within a DashboardDevicesProvider')
  }

  return context
}
