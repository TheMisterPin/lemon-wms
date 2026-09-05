'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/hook/warehouse/orders/use-warehouse-purchase-order-details.md
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { OrderStatus, ReceiptOutcome, ReceiptStatus } from '@/generated/prisma'

import { useErrorDialog } from '@/components/shared/use-error-dialog'
import type { WarehouseOperationalOrderRow } from '@/components/warehouse/orders/use-purchase-orders'
import {
  deriveReceiptLineProgress,
  receiptLinesFullyDeclared,
  PURCHASE_RECEIPT_DECLARE_OUTCOMES,
  type ReceiptLineProgress
} from '@/components/warehouse/orders/warehouse-purchase-order-details-derive'
import { idempotencyKeyHeader, warehouseApiClient } from '@/lib/axios'
import type { WarehousePurchaseOrderReceiptApi } from '@/types/api/warehouse-purchase-order-receipt'
import type { ApiResponse } from '@/types/responses/basic-response'

const ACTIVE_ORDER_CONFLICT_CODE = 'ACTIVE_ORDER_CONFLICT'

export type DetailsLoadOutcome = 'idle' | 'ok' | 'failed'

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

function readOrderAssignmentId(data: unknown): string | null {
  if (!data || typeof data !== 'object') {
    return null
  }

  /* Narrowing typed JSON from ApiResponse envelope — envelope checked by caller success flag. */
  const rec = data as Record<string, unknown>
  const id = rec.orderAssignmentId

  return typeof id === 'string' && id.length > 0 ? id : null
}

function mapListRow(raw: WarehouseOperationalOrderRow): WarehouseOperationalOrderRow {
  return {
    ...raw,
    createdAt:
      typeof raw.createdAt === 'string'
        ? raw.createdAt
        : new Date(raw.createdAt as unknown as Date).toISOString(),
    assignedUserId:
      typeof raw.assignedUserId === 'string' || raw.assignedUserId === null ? raw.assignedUserId : null,
    activeOrderAssignmentId:
      typeof raw.activeOrderAssignmentId === 'string' || raw.activeOrderAssignmentId === null
        ? raw.activeOrderAssignmentId
        : null,
    lastActiveAt:
      typeof raw.lastActiveAt === 'string' || raw.lastActiveAt === null ? raw.lastActiveAt : null,
    pausedAt: typeof raw.pausedAt === 'string' || raw.pausedAt === null ? raw.pausedAt : null
  }
}

export function useWarehousePurchaseOrderDetails(orderId: string) {
  const { reportError, reportNotice, requestConfirm } = useErrorDialog()
  const [orderRow, setOrderRow] = useState<WarehouseOperationalOrderRow | null>(null)
  const [receipt, setReceipt] = useState<WarehousePurchaseOrderReceiptApi | null>(null)
  const [orderLoadOutcome, setOrderLoadOutcome] = useState<DetailsLoadOutcome>('idle')
  const [receiptLoadOutcome, setReceiptLoadOutcome] = useState<DetailsLoadOutcome>('idle')
  const [receiptErrorMessage, setReceiptErrorMessage] = useState<string | null>(null)
  const [isOrderLoading, setIsOrderLoading] = useState(false)
  const [isReceiptLoading, setIsReceiptLoading] = useState(false)
  const [actingSlice, setActingSlice] = useState<
    null | 'start' | 'pause' | 'resume' | 'handle' | 'complete'
  >(null)
  const [assignmentOverride, setAssignmentOverride] = useState<string | null>(null)

  useEffect(() => {
    setOrderRow(null)
    setReceipt(null)
    setReceiptErrorMessage(null)
    setReceiptLoadOutcome('idle')
    setOrderLoadOutcome('idle')
    setAssignmentOverride(null)
    setActingSlice(null)
  }, [orderId])

  const loadOrderLatestRef = useRef<(opts?: { silent?: boolean }) => Promise<void>>(async () => {})
  const loadReceiptLatestRef = useRef<(opts?: { silent?: boolean }) => Promise<void>>(async () => {})

  useEffect(() => {
    if (orderRow?.activeOrderAssignmentId) {
      setAssignmentOverride(null)
    }
  }, [orderRow?.activeOrderAssignmentId])

  const resolvedAssignmentId = assignmentOverride ?? orderRow?.activeOrderAssignmentId ?? null

  const loadOrder = useCallback(
    async (opts?: { silent?: boolean }) => {
      const silent = opts?.silent === true
      if (!orderId.trim()) {
        setOrderLoadOutcome('failed')

        return
      }

      if (!silent) {
        setIsOrderLoading(true)
      }

      try {
        const res = await warehouseApiClient.get<ApiResponse<WarehouseOperationalOrderRow[]>>(
          '/warehouse/orders/purchase'
        )
        if (!res.success || !res.data) {
          setOrderLoadOutcome('failed')
          reportNotice({
            title: 'Unable to load purchase order',
            message: res.message || 'Unable to load purchase orders.',
            onRetry: () => void loadOrderLatestRef.current()
          })

          return
        }

        const row = res.data.map(mapListRow).find((r) => r.id === orderId.trim()) ?? null
        setOrderRow(row)
        setOrderLoadOutcome(row ? 'ok' : 'failed')
        if (!row) {
          reportNotice({
            title: 'Order not found',
            message: 'This purchase order is not in the warehouse list or cannot be accessed.',
            onRetry: () => void loadOrderLatestRef.current()
          })
        }
      } catch (error) {
        setOrderLoadOutcome('failed')
        reportNotice({
          title: 'Unable to load purchase order',
          message: getApiErrorMessage(error, 'Unable to load purchase orders.'),
          onRetry: () => void loadOrderLatestRef.current()
        })
      } finally {
        if (!silent) {
          setIsOrderLoading(false)
        }
      }
    },
    [orderId, reportNotice]
  )

  loadOrderLatestRef.current = loadOrder

  const loadReceipt = useCallback(
    async (opts?: { silent?: boolean }) => {
      const silent = opts?.silent === true
      if (!orderId.trim()) {
        return
      }

      if (!silent) {
        setIsReceiptLoading(true)
      }

      try {
        const res = await warehouseApiClient.get<ApiResponse<WarehousePurchaseOrderReceiptApi>>(
          `/warehouse/orders/purchase/${encodeURIComponent(orderId.trim())}/receipt`
        )
        if (!res.success || !res.data) {
          setReceiptLoadOutcome('failed')
          setReceiptErrorMessage(res.message ?? 'Receipt not available.')
          setReceipt(null)

          return
        }

        setReceipt(res.data)
        setReceiptLoadOutcome('ok')
        setReceiptErrorMessage(null)
      } catch (error) {
        const msg = getApiErrorMessage(error, 'Unable to load receipt.')
        const status = axios.isAxiosError(error) ? error.response?.status : undefined
        setReceipt(null)
        if (status === 404) {
          setReceiptLoadOutcome('idle')
          setReceiptErrorMessage('Receipt will be available once the order is started.')
        } else {
          setReceiptLoadOutcome('failed')
          setReceiptErrorMessage(msg)
          if (!silent) {
            reportNotice({
              title: 'Receipt unavailable',
              message: msg,
              onRetry: () => void loadReceiptLatestRef.current()
            })
          }
        }
      } finally {
        if (!silent) {
          setIsReceiptLoading(false)
        }
      }
    },
    [orderId, reportNotice]
  )

  loadReceiptLatestRef.current = loadReceipt

  useEffect(() => {
    void loadOrder()
  }, [loadOrder])

  useEffect(() => {
    if (!orderRow) {
      return
    }
    void loadReceipt({ silent: false })
  }, [orderRow?.id, orderRow?.status, loadReceipt])

  useEffect(() => {
    const shouldPoll =
      orderRow?.status === OrderStatus.EXECUTING
      && !!receipt
      && (receipt.status === ReceiptStatus.OPEN || receipt.status === ReceiptStatus.IN_PROGRESS)

    if (!shouldPoll) {
      return undefined
    }

    const t = setInterval(() => {
      void loadReceiptLatestRef.current({ silent: true })
      void loadOrderLatestRef.current({ silent: true })
    }, 12000)

    return () => clearInterval(t)
  }, [orderId, orderRow?.status, receipt?.id, receipt?.status])

  const reload = useCallback(async () => {
    await loadOrder({ silent: true })
    await loadReceipt({ silent: true })
  }, [loadOrder, loadReceipt])

  const postTransition = useCallback(
    async (
      action: 'start' | 'pause' | 'resume',
      body?: Record<string, unknown>
    ): Promise<ApiResponse<unknown>> => {
      return warehouseApiClient.post<ApiResponse<unknown>>(
        `/warehouse/orders/purchase/${encodeURIComponent(orderId.trim())}/${action}`,
        body ?? {},
        { headers: idempotencyKeyHeader() }
      )
    },
    [orderId]
  )

  const handleActiveOrderConflict = useCallback(
    (message: string) => {
      requestConfirm({
        title: 'Switch active order?',
        message,
        code: ACTIVE_ORDER_CONFLICT_CODE,
        confirmLabel: 'Switch and start',
        cancelLabel: 'Cancel',
        onConfirm: async () => {
          setActingSlice('start')
          try {
            const res = await postTransition('start', { forcePauseOthers: true })
            if (!res.success) {
              reportError(null, {
                title: 'Order action failed',
                messageOverride: res.message || 'Order action failed.'
              })

              return
            }
            const aid = readOrderAssignmentId(res.data)
            if (aid) {
              setAssignmentOverride(aid)
            }
            await loadOrder({ silent: true })
            await loadReceipt({ silent: true })
          } catch (error) {
            reportError(error, { title: 'Order action failed' })
          } finally {
            setActingSlice(null)
          }
        }
      })
    },
    [loadOrder, loadReceipt, postTransition, reportError, requestConfirm]
  )

  const startOrder = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!orderRow || actingSlice !== null) {
      return { success: false, error: 'Busy' }
    }

    if (orderRow.status !== OrderStatus.RELEASED) {
      return { success: false, error: 'Order is not in a startable state.' }
    }

    setActingSlice('start')
    try {
      const res = await postTransition('start')
      if (!res.success) {
        const failureBody = typeof res.message === 'string' ? res.message : 'Failed to start.'
        if (res.error?.code === ACTIVE_ORDER_CONFLICT_CODE) {
          handleActiveOrderConflict(failureBody)

          return { success: false, error: failureBody }
        }

        reportError(null, {
          title: 'Order action failed',
          messageOverride: failureBody
        })

        return { success: false, error: failureBody }
      }

      const aid = readOrderAssignmentId(res.data)
      if (aid) {
        setAssignmentOverride(aid)
      }

      await loadOrder({ silent: true })
      await loadReceipt({ silent: true })

      return { success: true }
    } catch (error) {
      const failure = parseFailedApiEnvelope(error)
      if (failure?.code === ACTIVE_ORDER_CONFLICT_CODE) {
        handleActiveOrderConflict(failure.message)

        return { success: false, error: failure.message }
      }
      reportError(error, { title: 'Order action failed' })

      return {
        success: false,
        error: getApiErrorMessage(error, 'Failed to start order.')
      }
    } finally {
      setActingSlice(null)
    }
  }, [
    actingSlice,
    handleActiveOrderConflict,
    loadOrder,
    loadReceipt,
    orderRow,
    postTransition,
    reportError
  ])

  const pauseOrder = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!orderRow || actingSlice !== null) {
      return { success: false, error: 'Busy' }
    }

    if (orderRow.status !== OrderStatus.EXECUTING) {
      return { success: false, error: 'Only executing orders can be paused.' }
    }

    setActingSlice('pause')
    try {
      const res = await postTransition('pause')
      if (!res.success) {
        const msg = res.message || 'Failed to pause.'

        reportError(null, { title: 'Order action failed', messageOverride: msg })

        return { success: false, error: msg }
      }

      await loadOrder({ silent: true })

      return { success: true }
    } catch (error) {
      reportError(error, { title: 'Order action failed' })

      return {
        success: false,
        error: getApiErrorMessage(error, 'Failed to pause order.')
      }
    } finally {
      setActingSlice(null)
    }
  }, [actingSlice, loadOrder, orderRow, postTransition, reportError])

  const resumeOrder = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!orderRow || actingSlice !== null) {
      return { success: false, error: 'Busy' }
    }

    if (orderRow.status !== OrderStatus.PAUSED) {
      return { success: false, error: 'Only paused orders can be resumed.' }
    }

    setActingSlice('resume')
    try {
      const res = await postTransition('resume')
      if (!res.success) {
        const msg = res.message || 'Failed to resume.'

        reportError(null, { title: 'Order action failed', messageOverride: msg })

        return { success: false, error: msg }
      }

      const aid = readOrderAssignmentId(res.data)
      if (aid) {
        setAssignmentOverride(aid)
      }

      await loadOrder({ silent: true })
      await loadReceipt({ silent: true })

      return { success: true }
    } catch (error) {
      reportError(error, { title: 'Order action failed' })

      return {
        success: false,
        error: getApiErrorMessage(error, 'Failed to resume order.')
      }
    } finally {
      setActingSlice(null)
    }
  }, [actingSlice, loadOrder, loadReceipt, orderRow, postTransition, reportError])

  const declareLineHandled = useCallback(
    async (
      receiptLineId: string,
      input: {
        quantity: number
        disposition: ReceiptOutcome
        notes: string | null
      }
    ): Promise<{ success: boolean; error?: string }> => {
      if (
        actingSlice !== null
        || !receipt
        || !resolvedAssignmentId
        || orderRow?.status !== OrderStatus.EXECUTING
      ) {
        return { success: false, error: 'Cannot declare receipt line right now.' }
      }

      if (Number.isFinite(input.quantity) === false || input.quantity <= 0) {
        return { success: false, error: 'Quantity must be a positive number.' }
      }

      setActingSlice('handle')
      try {
        const res = await warehouseApiClient.post<ApiResponse<unknown>>(
          `/warehouse/orders/purchase/${encodeURIComponent(orderId.trim())}/receipt/${encodeURIComponent(
            receipt.id
          )}/lines/${encodeURIComponent(receiptLineId)}/handle`,
          {
            quantity: input.quantity,
            disposition: input.disposition,
            orderAssignmentId: resolvedAssignmentId,
            notes: input.notes
          },
          { headers: idempotencyKeyHeader() }
        )

        if (!res.success) {
          const msg = res.message || 'Failed to save declaration.'

          reportError(null, { title: 'Declaration failed', messageOverride: msg })

          return { success: false, error: msg }
        }

        await loadReceipt({ silent: true })

        return { success: true }
      } catch (error) {
        reportError(error, { title: 'Declaration failed' })

        return {
          success: false,
          error: getApiErrorMessage(error, 'Failed to save declaration.')
        }
      } finally {
        setActingSlice(null)
      }
    },
    [
      actingSlice,
      loadReceipt,
      orderId,
      orderRow?.status,
      receipt,
      reportError,
      resolvedAssignmentId
    ]
  )

  const finalizeReceipt = useCallback(
    async (notes?: string): Promise<{ success: boolean; error?: string }> => {
      if (
        actingSlice !== null
        || !receipt
        || !resolvedAssignmentId
        || orderRow?.status !== OrderStatus.EXECUTING
      ) {
        return { success: false, error: 'Receipt cannot be completed right now.' }
      }

      if (!receiptLinesFullyDeclared(receipt.lines)) {
        return { success: false, error: 'Declare quantities for every line before finalizing.' }
      }

      if (receipt.status !== ReceiptStatus.OPEN && receipt.status !== ReceiptStatus.IN_PROGRESS) {
        return { success: false, error: 'Receipt is not open for completion.' }
      }

      setActingSlice('complete')
      try {
        const res = await warehouseApiClient.post<ApiResponse<unknown>>(
          `/warehouse/orders/purchase/${encodeURIComponent(orderId.trim())}/receipt/${encodeURIComponent(
            receipt.id
          )}/complete`,
          {
            orderAssignmentId: resolvedAssignmentId,
            notes: notes ?? null
          },
          { headers: idempotencyKeyHeader() }
        )

        if (!res.success) {
          const msg = res.message || 'Failed to finalize receipt.'

          reportError(null, { title: 'Finalize failed', messageOverride: msg })

          return { success: false, error: msg }
        }

        await loadOrder({ silent: true })
        await loadReceipt({ silent: true })

        return { success: true }
      } catch (error) {
        reportError(error, { title: 'Finalize failed' })

        return {
          success: false,
          error: getApiErrorMessage(error, 'Failed to finalize receipt.')
        }
      } finally {
        setActingSlice(null)
      }
    },
    [
      actingSlice,
      loadOrder,
      loadReceipt,
      orderId,
      orderRow?.status,
      receipt,
      reportError,
      resolvedAssignmentId
    ]
  )

  const lineProgressById = useMemo(() => {
    const map = new Map<string, ReceiptLineProgress>()
    if (!receipt?.lines.length) {
      return map
    }

    for (const line of receipt.lines) {
      map.set(line.id, deriveReceiptLineProgress(line))
    }

    return map
  }, [receipt])

  const canFinalizeReceipt =
    !!receipt
    && !!resolvedAssignmentId
    && orderRow?.status === OrderStatus.EXECUTING
    && (receipt.status === ReceiptStatus.OPEN || receipt.status === ReceiptStatus.IN_PROGRESS)
    && receiptLinesFullyDeclared(receipt.lines)

  const totals = useMemo(() => {
    if (!receipt) {
      return {
        acceptedQty: 0,
        quarantinedQty: 0,
        issueQty: 0,
        pendingQtySum: 0
      }
    }

    let acceptedQty = 0
    let quarantinedQty = 0
    let issueQty = 0
    let pendingQtySum = 0

    for (const line of receipt.lines) {
      const prog = deriveReceiptLineProgress(line)
      pendingQtySum += prog.pendingQty

      if (line.disposition === ReceiptOutcome.ACCEPTED) {
        acceptedQty += prog.declaredQty
      } else if (line.disposition === ReceiptOutcome.QUARANTINED) {
        quarantinedQty += prog.declaredQty
      } else {
        issueQty += prog.issueQty
      }
    }

    return {
      acceptedQty,
      quarantinedQty,
      issueQty,
      pendingQtySum
    }
  }, [receipt])

  return {
    orderId: orderId.trim(),
    orderRow,
    receipt,
    orderLoadOutcome,
    receiptLoadOutcome,
    receiptErrorMessage,
    isOrderLoading,
    isReceiptLoading,
    isBusy: actingSlice !== null,
    actingSlice,
    resolvedAssignmentId,
    lineProgressById,
    totals,
    canFinalizeReceipt,
    declareOutcomeOptions: PURCHASE_RECEIPT_DECLARE_OUTCOMES,
    reload,
    loadOrder,
    loadReceipt,
    startOrder,
    pauseOrder,
    resumeOrder,
    declareLineHandled,
    finalizeReceipt
  }
}

export type WarehousePurchaseOrderDetailsViewModel = ReturnType<
  typeof useWarehousePurchaseOrderDetails
>