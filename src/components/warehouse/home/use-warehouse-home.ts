'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { MapPin, Warehouse } from 'lucide-react'

import type {
  DashboardInfoCardItem,
  DashboardRecordListItem,
  WarehouseHomeData
} from '@/components/warehouse/home/types'
import { warehouseApiClient } from '@/lib/axios'
import type { ApiResponse } from '@/types/responses/basic-response'

const POLL_INTERVAL_MS = 30_000
const PAGE_SIZE = 3

function toOrderRecords(orders: WarehouseHomeData['orders']): DashboardRecordListItem[] {
  return orders.map((o) => ({
    id: o.id,
    title: `Order ${o.id}`,
    subtitle: `${o.type} - ${o.status}`,
    details: `Assigned to: ${o.assignedTo}`,
    status: o.status as DashboardRecordListItem['status'],
    progress: o.progress
  }))
}

function toInfoCards(info: WarehouseHomeData['warehouseInfo']): DashboardInfoCardItem[] {
  return [
    { label: 'Warehouse', value: info.warehouseName, icon: Warehouse },
    { label: 'Zone', value: info.zoneName, icon: MapPin }
  ]
}

function paginate<T>(items: T[], page: number, size: number): T[] {
  return items.slice(page * size, (page + 1) * size)
}

function getResponseError(response: ApiResponse<WarehouseHomeData>): string {
  if (response.success) {
    return ''
  }

  return response.message || 'Unable to load warehouse home data.'
}

export type UseWarehouseHomeReturn = {
  isLoading: boolean
  error: string | null
  refetch: () => void
  infoCards: DashboardInfoCardItem[]
  orders: {
    records: DashboardRecordListItem[]
    page: number
    totalPages: number
    onPrev: () => void
    onNext: () => void
  }
  bins: {
    records: WarehouseHomeData['bins']
    pageSize: number
  }
}

export function useWarehouseHome(): UseWarehouseHomeReturn {
  const [data, setData] = useState<WarehouseHomeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orderPage, setOrderPage] = useState(0)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await warehouseApiClient.get<ApiResponse<WarehouseHomeData>>('/warehouse/home')

      if (response.success && response.data) {
        setData(response.data)

        return
      }

      setError(getResponseError(response))
    } catch {
      setError('Could not reach the server. Check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchData()
    const interval = setInterval(() => void fetchData(), POLL_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [fetchData])

  const totalPages = data ? Math.max(1, Math.ceil(data.orders.length / PAGE_SIZE)) : 1

  useEffect(() => {
    setOrderPage((previousPage) => Math.min(previousPage, totalPages - 1))
  }, [totalPages])

  const infoCards = useMemo(() => (data ? toInfoCards(data.warehouseInfo) : []), [data])

  const pagedOrders = useMemo(
    () => toOrderRecords(paginate(data?.orders ?? [], orderPage, PAGE_SIZE)),
    [data, orderPage]
  )

  return {
    isLoading,
    error,
    refetch: fetchData,
    infoCards,
    orders: {
      records: pagedOrders,
      page: orderPage,
      totalPages,
      onPrev: () => setOrderPage((p) => Math.max(0, p - 1)),
      onNext: () => setOrderPage((p) => Math.min(totalPages - 1, p + 1))
    },
    bins: {
      records: data?.bins ?? [],
      pageSize: PAGE_SIZE
    }
  }
}
