'use client'

import { useEffect, useRef, useState } from 'react'
import axios, { type AxiosInstance } from 'axios'

import { Progress } from '@/components/ui/progress'

import type { ApiResponse } from '@/types/responses/basic-response'
import type { SimulationConfig, SimulationResult, SimulationStep } from './simulation-modal'

type Props = {
  config: SimulationConfig
  onComplete: (result: SimulationResult, steps: SimulationStep[]) => void
  onError: (steps: SimulationStep[]) => void
}

type FloorTokenResult = { accessToken: string; warehouseId: string }
type PurchaseOrder = { id: string; reference: string; status: string }
type StartedOrder = { id: string; status: string; orderAssignmentId: string }
type ReceiptLine = { id: string; orderedQuantity: string; uom: string; itemNameSnapshot: string }
type ReceiptData = { id: string; lines: ReceiptLine[] }
type CompleteReceiptResult = { orderId: string; orderStatus: string }
type PauseOrderResult = { id: string; status: string }

function makeFloorClient(token: string): AxiosInstance {
  return axios.create({ headers: { Authorization: `Bearer ${token}` } })
}

async function apiCall<T>(
  client: AxiosInstance,
  method: 'GET' | 'POST',
  path: string,
  body?: unknown
): Promise<T> {
  const res = await client.request<ApiResponse<T>>({ method, url: path, data: body })
  if (!res.data.success) {
    throw new Error(res.data.message ?? 'API error')
  }

  return res.data.data as T
}

const BASE_STEP_IDS = ['token', 'list', 'start', 'receipt']

function buildInitialSteps(): SimulationStep[] {
  return BASE_STEP_IDS.map((id) => ({ id, label: labelFor(id), status: 'pending' as const }))
}

function labelFor(id: string): string {
  if (id === 'token') {
    return 'Get floor token'
  }
  if (id === 'list') {
    return 'List purchase orders'
  }
  if (id === 'start') {
    return 'Start purchase order'
  }
  if (id === 'receipt') {
    return 'Fetch receipt'
  }
  if (id === 'complete') {
    return 'Complete receipt'
  }
  if (id === 'logout') {
    return 'Logout'
  }
  if (id === 'pause') {
    return 'Pause purchase order'
  }

  return id
}

type LineHandlingState = {
  active: boolean
  total: number
  completed: number
  currentItemLabel: string | null
}

export function SimulationRunner({ config, onComplete, onError }: Props) {
  const [steps, setSteps] = useState<SimulationStep[]>(buildInitialSteps)
  const [lineHandling, setLineHandling] = useState<LineHandlingState>({
    active: false,
    total: 0,
    completed: 0,
    currentItemLabel: null
  })
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) {
      return
    }
    ran.current = true

    let current: SimulationStep[] = buildInitialSteps()

    function patch(id: string, updates: Partial<SimulationStep>) {
      current = current.map((s) => (s.id === id ? { ...s, ...updates } : s))
      setSteps([...current])
    }

    function appendClosingSteps(kind: 'full' | 'partial') {
      const tail: SimulationStep[] =
        kind === 'full'
          ? [
            { id: 'complete', label: 'Complete receipt', status: 'pending' },
            { id: 'logout', label: 'Logout', status: 'pending' }
          ]
          : [
            { id: 'pause', label: 'Pause purchase order', status: 'pending' },
            { id: 'logout', label: 'Logout', status: 'pending' }
          ]
      current = [...current, ...tail]
      setSteps([...current])
    }

    async function timed<T>(id: string, fn: () => Promise<T>, detail?: (r: T) => string): Promise<T> {
      patch(id, { status: 'running' })
      const t0 = Date.now()
      const result = await fn()
      patch(id, { status: 'done', durationMs: Date.now() - t0, detail: detail?.(result) })

      return result
    }

    async function run() {
      try {
        const tokenData = await timed<FloorTokenResult>(
          'token',
          () =>
            axios
              .post<ApiResponse<FloorTokenResult>>('/api/simulation/floor-token', {
                userId: config.userId,
                orderId: config.orderId
              })
              .then((r) => {
                if (!r.data.success) {
                  throw new Error(r.data.message)
                }

                return r.data.data as FloorTokenResult
              }),
          (r) => `warehouse=${r.warehouseId}`
        )

        const client = makeFloorClient(tokenData.accessToken)

        const orders = await timed<PurchaseOrder[]>(
          'list',
          () => apiCall(client, 'GET', '/api/warehouse/orders/purchase'),
          (res) => `${res.filter((o) => o.status === 'RELEASED').length} RELEASED`
        )

        const targetOrder =
          orders.find((o) => o.id === config.orderId && o.status === 'RELEASED') ??
          orders.find((o) => o.status === 'RELEASED')
        if (!targetOrder) {
          throw new Error('No RELEASED order available in this warehouse.')
        }

        const startData = await timed<StartedOrder>(
          'start',
          () => apiCall(client, 'POST', `/api/warehouse/orders/purchase/${targetOrder.id}/start`),
          (r) => `status=${r.status}`
        )

        const receipt = await timed<ReceiptData>(
          'receipt',
          () => apiCall(client, 'GET', `/api/warehouse/orders/purchase/${targetOrder.id}/receipt`),
          (r) => `${r.lines.length} lines`
        )

        const lineTotal = receipt.lines.length
        const targetPauseLines = config.linesToCompleteBeforePause
        const partialRequested =
          config.partialExecute &&
          typeof targetPauseLines === 'number' &&
          targetPauseLines > 0

        const handleCap = partialRequested
          ? Math.min(targetPauseLines, lineTotal)
          : lineTotal

        setLineHandling({
          active: handleCap > 0,
          total: handleCap,
          completed: 0,
          currentItemLabel: null
        })

        for (let i = 0; i < handleCap; i++) {
          const line = receipt.lines[i]
          setLineHandling({
            active: true,
            total: handleCap,
            completed: i,
            currentItemLabel: line.itemNameSnapshot
          })
          await apiCall(
            client,
            'POST',
            `/api/warehouse/orders/purchase/${targetOrder.id}/receipt/${receipt.id}/lines/${line.id}/handle`,
            {
              quantity: Number(line.orderedQuantity),
              disposition: 'ACCEPTED',
              orderAssignmentId: startData.orderAssignmentId,
              toBinId: config.toBinId,
              notes: `Simulation: received ${line.orderedQuantity} ${line.uom} of ${line.itemNameSnapshot}`
            }
          )
          setLineHandling({
            active: true,
            total: handleCap,
            completed: i + 1,
            currentItemLabel: null
          })
        }

        setLineHandling({
          active: false,
          total: handleCap,
          completed: handleCap,
          currentItemLabel: null
        })

        const closingKind = partialRequested ? 'partial' : 'full'
        appendClosingSteps(closingKind)

        if (partialRequested) {
          const pauseData = await timed<PauseOrderResult>(
            'pause',
            () =>
              apiCall(client, 'POST', `/api/warehouse/orders/purchase/${targetOrder.id}/pause`),
            (r) => `status=${r.status}`
          )

          await timed('logout', () => apiCall(client, 'POST', '/api/auth/logout'))

          onComplete(
            {
              orderId: targetOrder.id,
              orderReference: targetOrder.reference,
              binId: config.toBinId,
              orderStatus: pauseData.status,
              partialStoppedAfterLines: handleCap
            },
            current
          )
        } else {
          const completeData = await timed<CompleteReceiptResult>(
            'complete',
            () =>
              apiCall(client, 'POST', `/api/warehouse/orders/purchase/${targetOrder.id}/receipt/${receipt.id}/complete`, {
                orderAssignmentId: startData.orderAssignmentId,
                notes: 'Simulation complete'
              }),
            (r) => `status=${r.orderStatus}`
          )

          await timed('logout', () => apiCall(client, 'POST', '/api/auth/logout'))

          onComplete(
            {
              orderId: targetOrder.id,
              orderReference: targetOrder.reference,
              binId: config.toBinId,
              orderStatus: completeData.orderStatus
            },
            current
          )
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Simulation failed'
        current = current.map((s) =>
          s.status === 'running' ? { ...s, status: 'error', detail: msg } : s
        )
        setSteps([...current])
        onError(current)
      }
    }

    void run()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per SimulationRunner mount
  }, [])

  const lineProgressPercent =
    lineHandling.total > 0
      ? Math.min(
        100,
        Math.round(
          ((lineHandling.completed + (lineHandling.currentItemLabel ? 0.5 : 0)) / lineHandling.total) * 100
        )
      )
      : 0

  const tailIds = new Set(['complete', 'logout', 'pause'])
  const stepsBeforeLines = steps.filter((s) => !tailIds.has(s.id))
  const stepsAfterLines = steps.filter((s) => tailIds.has(s.id))

  return (
    <div className="space-y-3 py-2">
      {config.partialExecute && typeof config.linesToCompleteBeforePause === 'number' && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
          Partial simulation: pauses after completing{' '}
          <span className="font-semibold tabular-nums">{config.linesToCompleteBeforePause}</span> randomly chosen receipt line(s).
        </p>
      )}
      {stepsBeforeLines.map((step) => (
        <StepRow key={step.id} step={step} />
      ))}

      {lineHandling.total > 0 && (
        <div className="space-y-2 rounded-md border border-dash-border bg-dash-card2 px-3 py-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-dash-text">Receiving lines</span>
            <span className="text-xs tabular-nums text-dash-muted">
              {lineHandling.completed}/{lineHandling.total}
            </span>
          </div>
          <Progress value={lineProgressPercent} className="h-2 bg-dash-border/60 [&>[data-slot=progress-indicator]]:bg-green-600 dark:[&>[data-slot=progress-indicator]]:bg-green-500" />
          <p className="min-h-[1.25rem] text-xs text-dash-muted">
            {lineHandling.currentItemLabel ? (
              <>
                <span className="font-medium text-dash-text">Processing: </span>
                {lineHandling.currentItemLabel}
              </>
            ) : lineHandling.active ? (
              'Preparing…'
            ) : config.partialExecute ? (
              'Lines for this run are handled.'
            ) : (
              'All lines handled.'
            )}
          </p>
        </div>
      )}

      {stepsAfterLines.map((step) => (
        <StepRow key={step.id} step={step} />
      ))}
    </div>
  )
}

function StepRow({ step }: { step: SimulationStep }) {
  const icon =
    step.status === 'done' ? '✓' :
      step.status === 'error' ? '✗' :
        step.status === 'running' ? '…' : '○'

  const iconColor =
    step.status === 'done' ? 'text-green-600 dark:text-green-400' :
      step.status === 'error' ? 'text-red-500' :
        step.status === 'running' ? 'text-blue-500' :
          'text-dash-muted'

  const rowTint =
    step.status === 'done'
      ? 'rounded-md border border-green-200 bg-green-50 dark:border-green-900/60 dark:bg-green-950/35'
      : step.status === 'error'
        ? 'rounded-md border border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/35'
        : step.status === 'running'
          ? 'rounded-md border border-blue-200 bg-blue-50 dark:border-blue-900/60 dark:bg-blue-950/35'
          : ''

  return (
    <div className={`flex items-center gap-2 px-2 py-1.5 text-sm ${rowTint}`}>
      <span className={`w-4 shrink-0 text-center font-mono ${iconColor}`}>{icon}</span>
      <span className={`flex-1 ${step.status === 'pending' ? 'text-dash-muted' : step.status === 'done' ? 'font-medium text-green-900 dark:text-green-100' : 'text-dash-text'}`}>
        {step.label}
      </span>
      {step.detail && <span className="text-xs text-dash-muted">{step.detail}</span>}
      {step.durationMs !== undefined && (
        <span className="text-xs text-dash-muted">{step.durationMs}ms</span>
      )}
    </div>
  )
}
