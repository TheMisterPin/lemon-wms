'use client'

import { useEffect, useRef, useState } from 'react'
import axios, { type AxiosInstance } from 'axios'

import { Progress } from '@/components/ui/progress'
import type { ApiResponse } from '@/types/responses/basic-response'

import type { SalesSimulationConfig, SalesSimulationResult } from './sales-simulation-modal'
import type { SimulationStep } from './simulation-modal'

type Props = {
  config: SalesSimulationConfig
  onComplete: (result: SalesSimulationResult, steps: SimulationStep[]) => void
  onError: (steps: SimulationStep[]) => void
}

type FloorTokenResult = { accessToken: string; warehouseId: string }
type SalesOrder = { id: string; reference: string; status: string }
type StartedOrder = { id: string; status: string; orderAssignmentId: string }
type PickLine = { id: string; itemNameSnapshot: string; uom: string; orderedQuantity: string }
type PickData = { id: string; lines: PickLine[] }
type PickTarget = {
  pickLineId: string
  itemId: string
  itemNameSnapshot: string
  uom: string
  orderedQuantity: string
  binStockItemId: string
  binId: string
}
type LoadResult = { boeId: string | null; transitBinStockItemId: string }
type HandleLineResult = { orderExecutionActivityId: string; pickLineId: string; pickStatus: string | null }
type TrolleyItem = { id: string; quantityAvailable: number; description: string }
type TrolleyData = { items: TrolleyItem[] }

function makeFloorClient(token: string): AxiosInstance {
  return axios.create({ headers: { Authorization: `Bearer ${token}` } })
}

async function apiCall<T>(
  client: AxiosInstance,
  method: 'GET' | 'POST',
  path: string,
  body?: unknown,
  headers?: Record<string, string>
): Promise<T> {
  const res = await client.request<ApiResponse<T>>({ method, url: path, data: body, headers })
  if (!res.data.success) {
    throw new Error(res.data.message ?? 'API error')
  }

  return res.data.data as T
}

/** Fresh Idempotency-Key for one mutating simulation step. */
function idempotencyHeader(): Record<string, string> {
  return { 'Idempotency-Key': crypto.randomUUID() }
}

const BASE_STEP_IDS = ['token', 'list', 'start', 'pick', 'targets']

function buildInitialSteps(): SimulationStep[] {
  return BASE_STEP_IDS.map((id) => ({ id, label: labelFor(id), status: 'pending' as const }))
}

function labelFor(id: string): string {
  const labels: Record<string, string> = {
    token: 'Get floor token',
    list: 'List sales orders',
    start: 'Start sales order',
    pick: 'Fetch pick document',
    targets: 'Resolve pick targets',
    trolley: 'Get trolley contents',
    unload: 'Unload to staging bin',
    logout: 'Logout'
  }

  return labels[id] ?? id
}

type LineHandlingState = {
  active: boolean
  total: number
  loaded: number
  currentItemLabel: string | null
}

export function SalesSimulationRunner({ config, onComplete, onError }: Props) {
  const [steps, setSteps] = useState<SimulationStep[]>(buildInitialSteps)
  const [lineHandling, setLineHandling] = useState<LineHandlingState>({
    active: false,
    total: 0,
    loaded: 0,
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

    function appendStep(id: string) {
      const step: SimulationStep = { id, label: labelFor(id), status: 'pending' }
      current = [...current, step]
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
                orderId: config.orderId,
                orderType: 'sales'
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

        const orders = await timed<SalesOrder[]>(
          'list',
          () => apiCall(client, 'GET', '/api/warehouse/orders/sales'),
          (res) => `${res.filter((o) => o.status === 'RELEASED').length} RELEASED`
        )

        const targetOrder =
          orders.find((o) => o.id === config.orderId && o.status === 'RELEASED') ??
          orders.find((o) => o.status === 'RELEASED')
        if (!targetOrder) {
          throw new Error('No RELEASED sales order available in this warehouse.')
        }

        const startData = await timed<StartedOrder>(
          'start',
          () => apiCall(client, 'POST', `/api/warehouse/orders/sales/${targetOrder.id}/start`, undefined, idempotencyHeader()),
          (r) => `status=${r.status}`
        )

        const pick = await timed<PickData>(
          'pick',
          () => apiCall(client, 'GET', `/api/warehouse/orders/sales/${targetOrder.id}/pick`),
          (r) => `${r.lines.length} lines`
        )

        const targets = await timed<PickTarget[]>(
          'targets',
          () =>
            axios
              .get<ApiResponse<PickTarget[]>>(`/api/simulation/orders/sales/${targetOrder.id}/pick-targets`)
              .then((r) => {
                if (!r.data.success) {
                  throw new Error(r.data.message)
                }

                return r.data.data as PickTarget[]
              }),
          (r) => `${r.length} targets`
        )

        if (targets.length === 0) {
          throw new Error('No pick targets found — no RESERVED stock for this order.')
        }

        setLineHandling({ active: true, total: targets.length, loaded: 0, currentItemLabel: null })

        const loadStepId = 'load-lines'
        appendStep(loadStepId)
        patch(loadStepId, { status: 'running', label: `Loading items (0/${targets.length})` })

        let lastPickStatus: string | null = null

        for (let i = 0; i < targets.length; i++) {
          const target = targets[i]
          setLineHandling({
            active: true,
            total: targets.length,
            loaded: i,
            currentItemLabel: target.itemNameSnapshot
          })

          await apiCall<LoadResult>(
            client,
            'POST',
            `/api/warehouse/stock/load/${target.binId}`,
            { sourceBinStockItemId: target.binStockItemId, quantity: Number(target.orderedQuantity) }
          )

          const handleResult = await apiCall<HandleLineResult>(
            client,
            'POST',
            `/api/warehouse/orders/sales/${targetOrder.id}/pick/${pick.id}/lines/${target.pickLineId}/handle`,
            {
              quantity: Number(target.orderedQuantity),
              disposition: 'ACCEPTED',
              orderAssignmentId: startData.orderAssignmentId,
              notes: `Simulation: picked ${target.orderedQuantity} ${target.uom} of ${target.itemNameSnapshot}`
            },
            idempotencyHeader()
          )

          lastPickStatus = handleResult.pickStatus
          patch(loadStepId, {
            status: 'running',
            label: `Loading items (${i + 1}/${targets.length})`
          })

          setLineHandling({
            active: true,
            total: targets.length,
            loaded: i + 1,
            currentItemLabel: null
          })
        }

        patch(loadStepId, {
          status: 'done',
          label: `Loaded items (${targets.length}/${targets.length})`,
          durationMs: 0
        })

        setLineHandling({ active: false, total: targets.length, loaded: targets.length, currentItemLabel: null })

        appendStep('trolley')
        const trolleyData = await timed<TrolleyData>(
          'trolley',
          () => apiCall(client, 'GET', '/api/warehouse/stock/trolley'),
          (r) => `${r.items.length} item(s) on trolley`
        )
        const trolleyItems = trolleyData.items

        if (trolleyItems.length === 0) {
          throw new Error('Trolley is empty — load step may have failed.')
        }

        const stagingBinId = await axios
          .get<ApiResponse<Array<{ id: string; type: string }>>>(
            `/api/simulation/empty-bins?warehouseId=${tokenData.warehouseId}`
          )
          .then((r) => {
            const staging = (r.data.data ?? []).find((b) => b.type === 'STAGING')

            return staging?.id ?? null
          })

        if (!stagingBinId) {
          throw new Error('No empty STAGING bin found in this warehouse.')
        }

        appendStep('unload')
        const selections = trolleyItems.map((item) => ({ transitBinStockItemId: item.id }))
        await timed(
          'unload',
          () =>
            apiCall(client, 'POST', `/api/warehouse/stock/unload/${stagingBinId}`, { selections }),
          () => `→ staging bin`
        )

        appendStep('logout')
        await timed('logout', () => apiCall(client, 'POST', '/api/auth/logout'))

        onComplete(
          {
            orderId: targetOrder.id,
            orderReference: targetOrder.reference,
            stagingBinId,
            pickStatus: lastPickStatus ?? 'IN_PROGRESS'
          },
          current
        )
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per mount
  }, [])

  const lineProgressPercent =
    lineHandling.total > 0
      ? Math.min(
        100,
        Math.round(
          ((lineHandling.loaded + (lineHandling.currentItemLabel ? 0.5 : 0)) / lineHandling.total) * 100
        )
      )
      : 0

  const tailIds = new Set(['load-lines', 'trolley', 'unload', 'logout'])
  const stepsBeforeLines = steps.filter((s) => !tailIds.has(s.id))
  const stepsAfterLines = steps.filter((s) => tailIds.has(s.id))

  return (
    <div className="space-y-3 py-2">
      {stepsBeforeLines.map((step) => (
        <StepRow key={step.id} step={step} />
      ))}

      {lineHandling.total > 0 && (
        <div className="space-y-2 rounded-md border border-dash-border bg-dash-card2 px-3 py-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-dash-text">Picking lines</span>
            <span className="text-xs tabular-nums text-dash-muted">
              {lineHandling.loaded}/{lineHandling.total}
            </span>
          </div>
          <Progress value={lineProgressPercent} className="h-2 bg-dash-border/60 [&>[data-slot=progress-indicator]]:bg-blue-600 dark:[&>[data-slot=progress-indicator]]:bg-blue-500" />
          <p className="min-h-[1.25rem] text-xs text-dash-muted">
            {lineHandling.currentItemLabel ? (
              <>
                <span className="font-medium text-dash-text">Loading: </span>
                {lineHandling.currentItemLabel}
              </>
            ) : lineHandling.active ? (
              'Preparing…'
            ) : (
              'All lines loaded to trolley.'
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
