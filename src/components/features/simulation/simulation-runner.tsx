'use client'

import { useEffect, useRef, useState } from 'react'
import axios, { type AxiosInstance } from 'axios'

import type { SimulationConfig, SimulationResult, SimulationStep } from './simulation-modal'
import type { ApiResponse } from '@/types/responses/basic-response'

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
  if (id === 'token') return 'Get floor token'
  if (id === 'list') return 'List purchase orders'
  if (id === 'start') return 'Start purchase order'
  if (id === 'receipt') return 'Fetch receipt'
  if (id === 'complete') return 'Complete receipt'
  if (id === 'logout') return 'Logout'
  if (id.startsWith('line-')) return `Handle line ${id.split('-')[1]}`
  return id
}

export function SimulationRunner({ config, onComplete, onError }: Props) {
  const [steps, setSteps] = useState<SimulationStep[]>(buildInitialSteps)
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    let current: SimulationStep[] = buildInitialSteps()

    function patch(id: string, updates: Partial<SimulationStep>) {
      current = current.map((s) => (s.id === id ? { ...s, ...updates } : s))
      setSteps([...current])
    }

    function addLineSteps(lineCount: number) {
      const lineSteps: SimulationStep[] = Array.from({ length: lineCount }, (_, i) => ({
        id: `line-${i + 1}`,
        label: `Handle line ${i + 1}/${lineCount}`,
        status: 'pending' as const
      }))
      const tail: SimulationStep[] = [
        { id: 'complete', label: 'Complete receipt', status: 'pending' },
        { id: 'logout', label: 'Logout', status: 'pending' }
      ]
      current = [...current, ...lineSteps, ...tail]
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
                if (!r.data.success) throw new Error(r.data.message)
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
        if (!targetOrder) throw new Error('No RELEASED order available in this warehouse.')

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

        addLineSteps(receipt.lines.length)

        for (let i = 0; i < receipt.lines.length; i++) {
          const line = receipt.lines[i]
          const stepId = `line-${i + 1}`
          patch(stepId, { status: 'running' })
          const t0 = Date.now()
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
          patch(stepId, { status: 'done', durationMs: Date.now() - t0 })
        }

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
  }, [])

  return (
    <div className="space-y-2 py-2">
      {steps.map((step) => (
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

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={`w-4 shrink-0 text-center font-mono ${iconColor}`}>{icon}</span>
      <span className={step.status === 'pending' ? 'flex-1 text-dash-muted' : 'flex-1 text-dash-text'}>
        {step.label}
      </span>
      {step.detail && <span className="text-xs text-dash-muted">{step.detail}</span>}
      {step.durationMs !== undefined && (
        <span className="text-xs text-dash-muted">{step.durationMs}ms</span>
      )}
    </div>
  )
}
