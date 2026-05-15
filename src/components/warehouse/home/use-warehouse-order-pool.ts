'use client'

import { useCallback, useMemo, useState } from 'react'
import axios from 'axios'

import { useErrorDialog } from '@/components/shared/use-error-dialog'
import type { WarehouseOrderRecord } from '@/components/warehouse/orders/types'
import { warehouseApiClient } from '@/lib/axios'
import type { ApiResponse } from '@/types/responses/basic-response'

const ACTIVE_ORDER_CONFLICT_CODE = 'ACTIVE_ORDER_CONFLICT'

export const ORDER_POOL_PAGE_SIZE = 4
export const ORDER_POOL_TYPES: WarehouseOrderRecord['type'][] = ['PURCHASE', 'SALES', 'TRANSFER']
export const ORDER_POOL_STATUSES: WarehouseOrderRecord['status'][] = ['EXECUTING', 'PAUSED', 'RELEASED']

export type OrderPoolSortMode = 'progress-desc' | 'progress-asc' | 'status' | 'newest' | 'last-active'
export type OrderPoolCompletionSort = 'none' | 'asc' | 'desc'
export type OrderPoolSortBaseline = 'status' | 'newest' | 'last-active'

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

function sortOrders(a: WarehouseOrderRecord, b: WarehouseOrderRecord, sortMode: OrderPoolSortMode): number {
  if (sortMode === 'progress-asc') {
    return a.progress - b.progress
  }
  if (sortMode === 'progress-desc') {
    return b.progress - a.progress
  }
  if (sortMode === 'status') {
    return ORDER_POOL_STATUSES.indexOf(a.status) - ORDER_POOL_STATUSES.indexOf(b.status)
  }
  if (sortMode === 'last-active') {
    const ta = new Date(a.lastActiveAt ?? a.pausedAt ?? a.createdAt).getTime()
    const tb = new Date(b.lastActiveAt ?? b.pausedAt ?? b.createdAt).getTime()

    return tb - ta
  }

  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
}

function warehouseOrderTransitionSegment(orderType: WarehouseOrderRecord['type']): 'purchase' | 'sales' | 'transfer' {
  if (orderType === 'PURCHASE') {
    return 'purchase'
  }
  if (orderType === 'SALES') {
    return 'sales'
  }

  return 'transfer'
}

function actionForOrder(order: WarehouseOrderRecord, currentUserId: string | null) {
  if (order.status === 'RELEASED') {
    return 'start'
  }
  if (order.status === 'PAUSED') {
    return 'resume'
  }
  if (order.assignedUserId !== currentUserId) {
    return null
  }
  if (order.status === 'EXECUTING') {
    return 'pause'
  }

  return null
}

function effectiveSortMode(
  completionSort: OrderPoolCompletionSort,
  sortBaseline: OrderPoolSortBaseline
): OrderPoolSortMode {
  if (completionSort === 'asc') {
    return 'progress-asc'
  }
  if (completionSort === 'desc') {
    return 'progress-desc'
  }

  if (sortBaseline === 'newest') {
    return 'newest'
  }

  if (sortBaseline === 'last-active') {
    return 'last-active'
  }

  return 'status'
}

export function useWarehouseOrderPool({
  activeExecutingOrder,
  currentUserId,
  orders,
  onActionComplete
}: {
  activeExecutingOrder: WarehouseOrderRecord | null
  currentUserId: string | null
  orders: WarehouseOrderRecord[]
  onActionComplete: () => Promise<void> | void
}) {
  const { reportError, requestConfirm } = useErrorDialog()
  const [selectedTypes, setSelectedTypes] = useState<WarehouseOrderRecord['type'][]>(ORDER_POOL_TYPES)
  const [selectedStatuses, setSelectedStatuses] = useState<WarehouseOrderRecord['status'][]>(ORDER_POOL_STATUSES)
  const [completionSort, setCompletionSort] = useState<OrderPoolCompletionSort>('none')
  const [sortBaseline, setSortBaseline] = useState<OrderPoolSortBaseline>('last-active')
  const [availablePoolOnly, setAvailablePoolOnly] = useState(true)
  const [page, setPage] = useState(0)
  const [actingId, setActingId] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')
  const [myOrdersOnly, setMyOrdersOnly] = useState(false)
  const [pendingReplaceStartOrder, setPendingReplaceStartOrder] = useState<WarehouseOrderRecord | null>(null)

  const sortMode = useMemo(
    () => effectiveSortMode(completionSort, sortBaseline),
    [completionSort, sortBaseline]
  )

  const visibleOrders = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase()

    return orders
      .filter((order) => {
        if (!normalizedSearch) {
          return true
        }

        return [
          order.reference,
          order.infoValue
        ].some((value) => value.toLowerCase().includes(normalizedSearch))
      })
      .filter((order) => selectedTypes.includes(order.type))
      .filter((order) => {
        if (!selectedStatuses.includes(order.status)) {
          return false
        }

        if (availablePoolOnly) {
          return order.status === 'RELEASED' || order.status === 'PAUSED'
        }

        return true
      })
      .filter((order) => {
        if (!myOrdersOnly || !currentUserId) {
          return true
        }

        if (order.status === 'EXECUTING') {
          return order.assignedUserId === currentUserId
        }

        if (order.status === 'PAUSED') {
          return order.assignedUserId === currentUserId
        }

        return false
      })
      .sort((a, b) => sortOrders(a, b, sortMode))
  }, [
    availablePoolOnly,
    currentUserId,
    myOrdersOnly,
    orders,
    searchText,
    selectedStatuses,
    selectedTypes,
    sortMode
  ])

  const totalPages = Math.max(1, Math.ceil(visibleOrders.length / ORDER_POOL_PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const pageOrders = visibleOrders.slice(safePage * ORDER_POOL_PAGE_SIZE, (safePage + 1) * ORDER_POOL_PAGE_SIZE)
  const userOrders = orders.filter((order) => order.assignedUserId === currentUserId)
  const lastUserOrder = [...userOrders].sort((a, b) => {
    const aTime = new Date(a.lastActiveAt ?? a.createdAt).getTime()
    const bTime = new Date(b.lastActiveAt ?? b.createdAt).getTime()

    return bTime - aTime
  })[0] ?? null
  const nextReadyOrder = orders.find((order) => order.status === 'RELEASED') ?? null

  const toggleType = (type: WarehouseOrderRecord['type']) => {
    setPage(0)
    setSelectedTypes((current) => current.includes(type)
      ? current.filter((value) => value !== type)
      : [...current, type])
  }

  const toggleStatus = (status: WarehouseOrderRecord['status']) => {
    setPage(0)
    setSelectedStatuses((current) => current.includes(status)
      ? current.filter((value) => value !== status)
      : [...current, status])
  }

  const filterBySingleStatus = (status: WarehouseOrderRecord['status']) => {
    setPage(0)
    setAvailablePoolOnly(false)
    setSelectedStatuses([status])
  }

  const cycleCompletionSort = () => {
    setPage(0)
    setCompletionSort((current) => {
      if (current === 'none') {
        return 'asc'
      }
      if (current === 'asc') {
        return 'desc'
      }

      return 'none'
    })
  }

  const resetCompletionSort = () => {
    setPage(0)
    setCompletionSort('none')
  }

  const toggleAvailablePool = () => {
    setPage(0)
    setAvailablePoolOnly((current) => !current)
  }

  const toggleMyOrdersOnly = () => {
    setPage(0)
    setMyOrdersOnly((current) => !current)
  }

  const enableAvailablePoolOnly = () => {
    setPage(0)
    setAvailablePoolOnly(true)
  }

  const handleActiveOrderConflict = useCallback(
    (order: WarehouseOrderRecord, message: string) => {
      requestConfirm({
        title: 'Switch active order?',
        message,
        code: ACTIVE_ORDER_CONFLICT_CODE,
        confirmLabel: 'Switch and start',
        cancelLabel: 'Cancel',
        onConfirm: async () => {
          const innerAction = actionForOrder(order, currentUserId)
          if (!innerAction || innerAction !== 'start') {
            return
          }

          setActingId(order.id)
          try {
            const segment = warehouseOrderTransitionSegment(order.type)

            const res = await warehouseApiClient.post<ApiResponse<unknown>>(
              `/warehouse/orders/${segment}/${encodeURIComponent(order.id)}/${innerAction}`,
              { forcePauseOthers: true }
            )

            if (!res.success) {
              reportError(null, {
                title: 'Order action failed',
                messageOverride: res.message || 'Order action failed.'
              })

              return
            }

            await onActionComplete()
          } catch (error) {
            reportError(error, { title: 'Order action failed' })
          } finally {
            setActingId(null)
          }
        }
      })
    },
    [currentUserId, onActionComplete, reportError, requestConfirm]
  )

  const clearFilters = () => {
    setPage(0)
    setSelectedTypes([...ORDER_POOL_TYPES])
    setSelectedStatuses([...ORDER_POOL_STATUSES])
    setCompletionSort('none')
    setSortBaseline('last-active')
    setAvailablePoolOnly(true)
    setSearchText('')
    setMyOrdersOnly(false)
  }

  const runAction = async (
    order: WarehouseOrderRecord,
    options?: { forcePauseOthers?: boolean }
  ) => {
    const action = actionForOrder(order, currentUserId)

    if (!action || actingId) {
      return
    }

    if (
      action === 'start'
      && !options?.forcePauseOthers
      && activeExecutingOrder
      && activeExecutingOrder.id !== order.id
    ) {
      setPendingReplaceStartOrder(order)

      return
    }

    setActingId(order.id)

    try {
      const segment = warehouseOrderTransitionSegment(order.type)

      const payload =
        action === 'start' && options?.forcePauseOthers === true
          ? { forcePauseOthers: true }
          : {}

      const res = await warehouseApiClient.post<ApiResponse<unknown>>(
        `/warehouse/orders/${segment}/${encodeURIComponent(order.id)}/${action}`,
        payload
      )

      if (!res.success) {
        if (action === 'start' && res.error?.code === ACTIVE_ORDER_CONFLICT_CODE) {
          handleActiveOrderConflict(order, res.message)

          return
        }
        reportError(null, {
          title: 'Order action failed',
          messageOverride: res.message || 'Order action failed.'
        })

        return
      }

      await onActionComplete()
    } catch (error) {
      const failure = parseFailedApiEnvelope(error)
      if (action === 'start' && failure?.code === ACTIVE_ORDER_CONFLICT_CODE) {
        handleActiveOrderConflict(order, failure.message)

        return
      }
      reportError(error, { title: 'Order action failed' })
    } finally {
      setActingId(null)
    }
  }

  const cancelReplaceStartOrder = () => {
    setPendingReplaceStartOrder(null)
  }

  const confirmReplaceStartOrder = async () => {
    if (!pendingReplaceStartOrder) {
      return
    }

    const target = pendingReplaceStartOrder

    setPendingReplaceStartOrder(null)
    await runAction(target, { forcePauseOthers: true })
  }

  return {
    actingId,
    availablePoolOnly,
    cancelReplaceStartOrder,
    clearFilters,
    completionSort,
    confirmReplaceStartOrder,
    cycleCompletionSort,
    enableAvailablePoolOnly,
    filterBySingleStatus,
    lastUserOrder,
    myOrdersOnly,
    nextReadyOrder,
    pageOrders,
    pendingReplaceStartOrder,
    safePage,
    selectedStatuses,
    selectedTypes,
    searchText,
    setSearchText: (value: string) => {
      setPage(0)
      setSearchText(value)
    },
    setSortBaseline: (value: OrderPoolSortBaseline) => {
      setPage(0)
      setSortBaseline(value)
    },
    sortBaseline,
    toggleAvailablePool,
    toggleMyOrdersOnly,
    toggleStatus,
    toggleType,
    totalPages,
    visibleOrders,
    onNext: () => setPage((current) => Math.min(totalPages - 1, current + 1)),
    onPrev: () => setPage((current) => Math.max(0, current - 1)),
    resetCompletionSort,
    runAction
  }
}
