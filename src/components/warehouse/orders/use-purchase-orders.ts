'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/hook/warehouse/orders/use-purchase-orders.md
 */

import { useCallback, useMemo, useRef, useState } from 'react'
import axios from 'axios'

import { useErrorDialog } from '@/components/shared/use-error-dialog'
import { OrderStatus } from '@/generated/prisma'
import { warehouseApiClient } from '@/lib/axios'
import type { ApiResponse } from '@/types/responses/basic-response'

const ACTIVE_ORDER_CONFLICT_CODE = 'ACTIVE_ORDER_CONFLICT'

export const WAREHOUSE_ORDERS_PAGE_SIZE = 4

export type WarehouseOrdersSortBaseline = 'status' | 'newest' | 'last-active'

const STATUS_TAB_ORDER: OrderStatus[] = [
  OrderStatus.RELEASED,
  OrderStatus.EXECUTING,
  OrderStatus.PAUSED
]

export type WarehouseOperationalOrderRow = {
  id: string
  reference: string
  status: OrderStatus
  supplier: string
  warehouseId: string
  createdAt: string
  businessPartyId: string | null
  assignedUserId: string | null
  activeOrderAssignmentId: string | null
  lastActiveAt: string | null
  pausedAt: string | null
}

type OperationalOrdersPathSegment = 'purchase' | 'sales' | 'transfer'

export type OrdersLoadOutcome = 'idle' | 'ok' | 'failed'

function parseOperationalOrdersPathSegment(raw: string): OperationalOrdersPathSegment | null {
  const s = raw.trim().toLowerCase()

  if (s === 'purchase' || s === 'sales' || s === 'transfer') {
    return s
  }

  return null
}

function getApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiResponse<unknown> | undefined
    if (data?.message && typeof data.message === 'string' && data.message.trim()) {
      return data.message
    }
  }

  return fallback
}

function parseFailedApiEnvelope(err: unknown): { message: string; code?: string } | null {
  if (!axios.isAxiosError(err)) {
    return null
  }

  const data = err.response?.data as ApiResponse<unknown> | undefined
  if (!data || typeof data !== 'object' || data.success !== false) {
    return null
  }

  return {
    message: typeof data.message === 'string' ? data.message : 'Request failed',
    code: data.error?.code
  }
}

function statusRank(status: OrderStatus): number {
  const idx = STATUS_TAB_ORDER.indexOf(status)

  return idx === -1 ? STATUS_TAB_ORDER.length : idx
}

function lastActivityMillis(row: WarehouseOperationalOrderRow): number {
  const raw = row.lastActiveAt ?? row.pausedAt ?? row.createdAt
  const t = new Date(raw).getTime()

  return Number.isNaN(t) ? 0 : t
}

export function usePurchaseOrders(orderType: string) {
  const { reportError, reportNotice, requestConfirm } = useErrorDialog()
  const segment = parseOperationalOrdersPathSegment(orderType)
  const [rows, setRows] = useState<WarehouseOperationalOrderRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadOutcome, setLoadOutcome] = useState<OrdersLoadOutcome>('idle')
  const [actingId, setActingId] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')
  const [sortBaseline, setSortBaseline] = useState<WarehouseOrdersSortBaseline>('last-active')
  const [selectedStatuses, setSelectedStatuses] = useState<OrderStatus[]>([...STATUS_TAB_ORDER])
  const [page, setPage] = useState(0)
  const loadOrdersLatestRef = useRef<(opts?: { silent?: boolean }) => Promise<void>>(
    async () => {}
  )

  const loadOrders = useCallback(async (opts?: { silent?: boolean }) => {
    if (!segment) {
      return
    }

    const silent = opts?.silent === true
    if (!silent) {
      setIsLoading(true)
    }

    try {
      const res = await warehouseApiClient.get<ApiResponse<WarehouseOperationalOrderRow[]>>(
        `/warehouse/orders/${segment}`
      )
      if (res.success && res.data) {
        setRows(
          res.data.map(row => ({
            ...row,
            createdAt:
              typeof row.createdAt === 'string'
                ? row.createdAt
                : new Date(row.createdAt as unknown as Date).toISOString(),
            assignedUserId:
              typeof row.assignedUserId === 'string' || row.assignedUserId === null
                ? row.assignedUserId
                : null,
            activeOrderAssignmentId:
              typeof row.activeOrderAssignmentId === 'string' || row.activeOrderAssignmentId === null
                ? row.activeOrderAssignmentId
                : null,
            lastActiveAt:
              typeof row.lastActiveAt === 'string' || row.lastActiveAt === null
                ? row.lastActiveAt
                : null,
            pausedAt:
              typeof row.pausedAt === 'string' || row.pausedAt === null ? row.pausedAt : null
          }))
        )
        setLoadOutcome('ok')
      } else {
        setLoadOutcome('failed')
        reportNotice({
          title: 'Unable to load orders',
          message: res.message || 'Unable to load orders.',
          onRetry: () => void loadOrdersLatestRef.current()
        })
      }
    } catch (error) {
      setLoadOutcome('failed')
      reportNotice({
        title: 'Unable to load orders',
        message: getApiErrorMessage(error, 'Unable to load orders.'),
        onRetry: () => void loadOrdersLatestRef.current()
      })
    } finally {
      if (!silent) {
        setIsLoading(false)
      }
    }
  }, [reportNotice, segment])

  loadOrdersLatestRef.current = loadOrders

  const cards = useMemo(
    () =>
      STATUS_TAB_ORDER.map((status) => ({
        status,
        label: status === OrderStatus.RELEASED ? 'Released' : status === OrderStatus.EXECUTING ? 'Executing' : 'Paused',
        count: rows.filter(row => row.status === status).length
      })),
    [rows]
  )

  const totalOperational = rows.length

  const filteredRows = useMemo(() => {
    const q = searchText.trim().toLowerCase()

    return rows.filter((row) => {
      if (!selectedStatuses.includes(row.status)) {
        return false
      }

      if (!q) {
        return true
      }

      return (
        row.reference.toLowerCase().includes(q)
        || row.supplier.toLowerCase().includes(q)
        || row.warehouseId.toLowerCase().includes(q)
      )
    })
  }, [rows, searchText, selectedStatuses])

  const sortedRows = useMemo(() => {
    const copy = [...filteredRows]

    copy.sort((a, b) => {
      if (sortBaseline === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }

      if (sortBaseline === 'last-active') {
        return lastActivityMillis(b) - lastActivityMillis(a)
      }

      const cmp = statusRank(a.status) - statusRank(b.status)

      if (cmp !== 0) {
        return cmp
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return copy
  }, [filteredRows, sortBaseline])

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / WAREHOUSE_ORDERS_PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const paginatedRows = sortedRows.slice(
    safePage * WAREHOUSE_ORDERS_PAGE_SIZE,
    (safePage + 1) * WAREHOUSE_ORDERS_PAGE_SIZE
  )

  const toggleStatusInFilter = useCallback((next: OrderStatus) => {
    setPage(0)
    setSelectedStatuses((prev) => {
      if (prev.includes(next)) {
        return prev.filter(s => s !== next)
      }

      const merged = new Set<OrderStatus>([...prev, next])

      return STATUS_TAB_ORDER.filter(s => merged.has(s))
    })
  }, [])

  const setSearchTextAndResetPage = useCallback((value: string) => {
    setPage(0)
    setSearchText(value)
  }, [])

  const setSortBaselineAndResetPage = useCallback((value: WarehouseOrdersSortBaseline) => {
    setPage(0)
    setSortBaseline(value)
  }, [])

  const postTransition = useCallback(
    async (
      row: WarehouseOperationalOrderRow,
      action: 'start' | 'pause' | 'resume',
      body?: Record<string, unknown>
    ): Promise<ApiResponse<unknown>> => {
      return warehouseApiClient.post<ApiResponse<unknown>>(
        `/warehouse/orders/${segment}/${encodeURIComponent(row.id)}/${action}`,
        body ?? {}
      )
    },
    [segment]
  )

  const handleActiveOrderConflict = useCallback(
    (row: WarehouseOperationalOrderRow, message: string) => {
      requestConfirm({
        title: 'Switch active order?',
        message,
        code: ACTIVE_ORDER_CONFLICT_CODE,
        confirmLabel: 'Switch and start',
        cancelLabel: 'Cancel',
        onConfirm: async () => {
          setActingId(row.id)
          try {
            const res = await postTransition(row, 'start', { forcePauseOthers: true })
            if (!res.success) {
              reportError(null, {
                title: 'Order action failed',
                messageOverride: res.message || 'Order action failed.'
              })

              return
            }
            await loadOrders({ silent: true })
          } catch (error) {
            reportError(error, { title: 'Order action failed' })
          } finally {
            setActingId(null)
          }
        }
      })
    },
    [loadOrders, postTransition, reportError, requestConfirm]
  )

  const runAction = useCallback(
    async (row: WarehouseOperationalOrderRow) => {
      if (!segment || actingId !== null) {
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

      setActingId(row.id)
      try {
        const res = await postTransition(row, action)
        if (!res.success) {
          if (action === 'start' && res.error?.code === ACTIVE_ORDER_CONFLICT_CODE) {
            handleActiveOrderConflict(row, res.message)

            return
          }
          reportError(null, {
            title: 'Order action failed',
            messageOverride: res.message || 'Order action failed.'
          })

          return
        }
        await loadOrders({ silent: true })
      } catch (error) {
        const failure = parseFailedApiEnvelope(error)
        if (action === 'start' && failure?.code === ACTIVE_ORDER_CONFLICT_CODE) {
          handleActiveOrderConflict(row, failure.message)

          return
        }
        reportError(error, { title: 'Order action failed' })
      } finally {
        setActingId(null)
      }
    },
    [actingId, handleActiveOrderConflict, loadOrders, postTransition, reportError, segment]
  )

  return {
    segment,
    rows,
    cards,
    totalOperational,
    isLoading,
    loadOutcome,
    actingId,
    loadOrders,
    runAction,
    searchText,
    setSearchText: setSearchTextAndResetPage,
    sortBaseline,
    setSortBaseline: setSortBaselineAndResetPage,
    selectedStatuses,
    toggleStatusInFilter,
    filteredCount: sortedRows.length,
    paginatedRows,
    ordersPage: safePage,
    ordersTotalPages: totalPages,
    ordersPrev: () => setPage((p) => Math.max(0, p - 1)),
    ordersNext: () => setPage((p) => Math.min(totalPages - 1, p + 1))
  }
}
