'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { CheckCircle, Package, XCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'

import type { DemoAddProgressRow, DemoExecutingPurchaseOrder } from '@/lib/simulation/demo-add-progress'
import type { ApiResponse } from '@/types/responses/basic-response'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type UiPhase = 'idle' | 'loading' | 'running' | 'empty' | 'no-workers' | 'complete'

type UiRow = {
  orderId: string
  reference: string
  uiStatus: 'pending' | 'running' | 'done' | 'error'
  result?: DemoAddProgressRow
}

type PrefetchPayload = {
  orders: DemoExecutingPurchaseOrder[]
  workersAvailable: boolean
}

export function AddProgressModal({ open, onOpenChange }: Props) {
  const [phase, setPhase] = useState<UiPhase>('idle')
  const [rows, setRows] = useState<UiRow[]>([])
  const [summaryError, setSummaryError] = useState<string | null>(null)

  function resetState() {
    setPhase('idle')
    setRows([])
    setSummaryError(null)
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      resetState()
    }
    onOpenChange(next)
  }

  useEffect(() => {
    if (!open) {
      return
    }

    let cancelled = false

    async function run(): Promise<void> {
      setPhase('loading')
      setSummaryError(null)
      setRows([])

      try {
        const prefetch = await axios.get<ApiResponse<PrefetchPayload>>(
          '/api/simulation/executing-purchase-orders'
        )
        if (!prefetch.data.success) {
          if (!cancelled) {
            setSummaryError(prefetch.data.message ?? 'Failed to load executing orders.')
            setPhase('complete')
          }

          return
        }

        const data = prefetch.data.data
        const orders = data?.orders ?? []

        if (!data?.workersAvailable) {
          if (!cancelled) {
            setPhase('no-workers')
          }

          return
        }

        if (orders.length === 0) {
          if (!cancelled) {
            setPhase('empty')
          }

          return
        }

        const initialRows: UiRow[] = orders.map((o) => ({
          orderId: o.id,
          reference: o.reference,
          uiStatus: 'pending'
        }))

        if (!cancelled) {
          setRows(initialRows)
          setPhase('running')
        }

        for (const order of orders) {
          if (cancelled) {
            return
          }

          setRows((prev) =>
            prev.map((r) =>
              r.orderId === order.id ? { ...r, uiStatus: 'running' as const } : r
            )
          )

          try {
            const res = await axios.post<ApiResponse<DemoAddProgressRow>>(
              '/api/simulation/add-progress/order',
              { orderId: order.id }
            )

            if (!res.data.success || !res.data.data) {
              const fake: DemoAddProgressRow = {
                purchaseOrderId: order.id,
                reference: order.reference,
                ok: false,
                message: res.data.message ?? 'Request failed.'
              }
              setRows((prev) =>
                prev.map((r) =>
                  r.orderId === order.id
                    ? { ...r, uiStatus: 'error' as const, result: fake }
                    : r
                )
              )
            } else {
              const row = res.data.data
              setRows((prev) =>
                prev.map((r) =>
                  r.orderId === order.id
                    ? {
                      ...r,
                      uiStatus: row.ok ? ('done' as const) : ('error' as const),
                      result: row
                    }
                    : r
                )
              )
            }
          } catch {
            const fake: DemoAddProgressRow = {
              purchaseOrderId: order.id,
              reference: order.reference,
              ok: false,
              message: 'Network error.'
            }
            setRows((prev) =>
              prev.map((r) =>
                r.orderId === order.id
                  ? { ...r, uiStatus: 'error' as const, result: fake }
                  : r
              )
            )
          }
        }

        if (!cancelled) {
          setPhase('complete')
        }
      } catch {
        if (!cancelled) {
          setSummaryError('Failed to run add-progress.')
          setPhase('complete')
        }
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [open])

  const totalOrders = rows.length
  const finishedCount = rows.filter((r) => r.uiStatus === 'done' || r.uiStatus === 'error').length
  const okCount = rows.filter((r) => r.result?.ok).length
  const progressPercent =
    totalOrders > 0 ? Math.round((finishedCount / totalOrders) * 100) : 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add demo progress</DialogTitle>
        </DialogHeader>

        {phase === 'loading' && (
          <p className="py-6 text-center text-sm text-dash-muted">
            Loading EXECUTING purchase orders…
          </p>
        )}

        {phase === 'complete' && summaryError !== null && rows.length === 0 && (
          <div className="space-y-4 py-2">
            <p className="text-sm text-red-500">{summaryError}</p>
            <Button variant="outline" className="w-full" onClick={() => handleOpenChange(false)}>
              Close
            </Button>
          </div>
        )}

        {phase === 'no-workers' && (
          <div className="space-y-4 py-2">
            <p className="text-sm text-red-500">
              No eligible warehouse workers (badge/PIN floor users). Seed demo users first.
            </p>
            <Button variant="outline" className="w-full" onClick={() => handleOpenChange(false)}>
              Close
            </Button>
          </div>
        )}

        {phase === 'empty' && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2 rounded-md border border-dash-border bg-dash-card2 px-4 py-3">
              <Package size={18} className="shrink-0 text-dash-muted" />
              <p className="text-sm text-dash-muted">
                No purchase orders are currently in EXECUTING status.
              </p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => handleOpenChange(false)}>
              Close
            </Button>
          </div>
        )}

        {(phase === 'running' || phase === 'complete') && rows.length > 0 && (
          <div className="space-y-4 py-2">
            {phase === 'running' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-dash-muted">
                  <span>Overall progress</span>
                  <span className="tabular-nums">{finishedCount}/{totalOrders}</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            )}

            {phase === 'complete' && summaryError && (
              <p className="text-sm text-red-500">{summaryError}</p>
            )}

            {phase === 'complete' && !summaryError && (
              <div
                className={[
                  'flex items-center gap-2 rounded-md border px-4 py-3',
                  okCount === totalOrders
                    ? 'border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/30'
                    : 'border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/35'
                ].join(' ')}
              >
                {okCount === totalOrders ? (
                  <CheckCircle size={18} className="shrink-0 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle size={18} className="shrink-0 text-amber-600 dark:text-amber-400" />
                )}
                <div className="min-w-0 text-sm">
                  <p className="font-medium text-dash-text">Batch finished</p>
                  <p className="text-xs text-dash-muted">
                    {okCount} succeeded · {totalOrders - okCount} skipped or failed · {totalOrders}{' '}
                    orders
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-dash-muted">
                Orders
              </p>
              {rows.map((row) => (
                <OrderProgressRow key={row.orderId} row={row} />
              ))}
            </div>

            {phase === 'complete' && (
              <Button className="w-full" onClick={() => handleOpenChange(false)}>
                Done
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function OrderProgressRow({ row }: { row: UiRow }) {
  const icon =
    row.uiStatus === 'done' ? '✓' :
      row.uiStatus === 'error' ? '✗' :
        row.uiStatus === 'running' ? '…' : '○'

  const iconColor =
    row.uiStatus === 'done' ? 'text-green-600 dark:text-green-400' :
      row.uiStatus === 'error' ? 'text-red-500' :
        row.uiStatus === 'running' ? 'text-blue-500' :
          'text-dash-muted'

  const rowTint =
    row.uiStatus === 'done'
      ? 'rounded-md border border-green-200 bg-green-50 dark:border-green-900/60 dark:bg-green-950/35'
      : row.uiStatus === 'error'
        ? 'rounded-md border border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/35'
        : row.uiStatus === 'running'
          ? 'rounded-md border border-blue-200 bg-blue-50 dark:border-blue-900/60 dark:bg-blue-950/35'
          : ''

  const detail =
    row.result?.message ??
    (row.uiStatus === 'pending' ? 'Waiting…' :
      row.uiStatus === 'running' ? 'Applying partial receipt & pause…' : '')

  return (
    <div className={`flex flex-col gap-0.5 px-2 py-1.5 text-sm ${rowTint}`}>
      <div className="flex items-start gap-2">
        <span className={`mt-0.5 w-4 shrink-0 text-center font-mono ${iconColor}`}>{icon}</span>
        <div className="min-w-0 flex-1">
          <span className="font-medium text-dash-text">{row.reference}</span>
          {typeof row.result?.linesHandled === 'number' && row.result.ok ? (
            <span className="ml-2 text-xs tabular-nums text-dash-muted">
              {row.result.linesHandled} line(s)
            </span>
          ) : null}
          <p className="break-words text-xs text-dash-muted">{detail}</p>
        </div>
      </div>
    </div>
  )
}
