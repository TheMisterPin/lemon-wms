'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/hook/warehouse/orders/use-purchase-orders.md
 */

import { useCallback, useMemo, useState } from 'react'
import axios from 'axios'

import { OrderStatus } from '@/generated/prisma'
import { warehouseApiClient } from '@/lib/axios'
import type { ApiResponse } from '@/types/responses/basic-response'

export type WarehousePurchaseOrderRow = {
  id: string
  reference: string
  status: OrderStatus
  supplier: string
  warehouseId: string
  createdAt: string
  businessPartyId: string | null
}

type StatusFilter = 'RELEASED' | 'EXECUTING' | 'PAUSED' | null

function getApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiResponse<unknown> | undefined
    if (data?.message && typeof data.message === 'string' && data.message.trim()) {
      return data.message
    }
  }

  return fallback
}

export function usePurchaseOrders(orderType: string) {
  const isPurchase = orderType === 'purchase'
  const [rows, setRows] = useState<WarehousePurchaseOrderRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [listError, setListError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(null)
  const [actingId, setActingId] = useState<string | null>(null)

  const loadOrders = useCallback(async (opts?: { silent?: boolean }) => {
    if (!isPurchase) {
      return
    }

    const silent = opts?.silent === true
    if (!silent) {
      setIsLoading(true)
    }
    setListError(null)

    try {
      const res = await warehouseApiClient.get<ApiResponse<WarehousePurchaseOrderRow[]>>(
        '/warehouse/orders/purchase'
      )
      if (res.success && res.data) {
        setRows(
          res.data.map(row => ({
            ...row,
            createdAt:
              typeof row.createdAt === 'string'
                ? row.createdAt
                : new Date(row.createdAt as unknown as Date).toISOString()
          }))
        )
      } else {
        setListError(res.message || 'Unable to load purchase orders.')
      }
    } catch (error) {
      setListError(getApiErrorMessage(error, 'Unable to load purchase orders.'))
    } finally {
      if (!silent) {
        setIsLoading(false)
      }
    }
  }, [isPurchase])

  const filteredRows = useMemo(
    () => (statusFilter ? rows.filter(row => row.status === statusFilter) : rows),
    [rows, statusFilter]
  )

  const cards = useMemo(
    () => [
      {
        status: OrderStatus.RELEASED,
        label: 'RELEASED',
        count: rows.filter(row => row.status === OrderStatus.RELEASED).length
      },
      {
        status: OrderStatus.EXECUTING,
        label: 'EXECUTING',
        count: rows.filter(row => row.status === OrderStatus.EXECUTING).length
      },
      {
        status: OrderStatus.PAUSED,
        label: 'PAUSED',
        count: rows.filter(row => row.status === OrderStatus.PAUSED).length
      }
    ],
    [rows]
  )

  const toggleStatusFilter = useCallback((next: Exclude<StatusFilter, null>) => {
    setStatusFilter(prev => (prev === next ? null : next))
  }, [])

  const runAction = useCallback(
    async (row: WarehousePurchaseOrderRow) => {
      if (!isPurchase || actingId !== null) {
        return
      }

      let action: 'start' | 'pause' | 'resume' | null = null
      if (row.status === OrderStatus.RELEASED) {
        action = 'start'
      } else if (row.status === OrderStatus.EXECUTING) {
        action = 'pause'
      } else if (row.status === OrderStatus.PAUSED) {
        action = 'resume'
      }

      if (!action) {
        return
      }

      setActionError(null)
      setActingId(row.id)
      try {
        const res = await warehouseApiClient.post<ApiResponse<unknown>>(
          `/warehouse/orders/purchase/${encodeURIComponent(row.id)}/${action}`,
          {}
        )
        if (!res.success) {
          setActionError(res.message || 'Order action failed.')

          return
        }
        await loadOrders({ silent: true })
      } catch (error) {
        setActionError(getApiErrorMessage(error, 'Order action failed.'))
      } finally {
        setActingId(null)
      }
    },
    [actingId, isPurchase, loadOrders]
  )

  return {
    isPurchase,
    rows,
    filteredRows,
    cards,
    isLoading,
    listError,
    actionError,
    statusFilter,
    actingId,
    loadOrders,
    toggleStatusFilter,
    runAction
  }
}
