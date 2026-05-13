'use client'

/* eslint-disable react-hooks/set-state-in-effect -- fetch-on-mount and bins reload when PO changes */

import { useEffect, useState } from 'react'
import axios from 'axios'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ApiResponse } from '@/types/responses/basic-response'
import type { SimulationConfig } from './simulation-modal'

type SimUser = { id: string; fullName: string; badgeNumber: string; role: string }
type ReleasedOrder = { id: string; reference: string; warehouseId: string; supplierNameSnapshot: string; totalLines: number }
type EmptyBin = { id: string; name: string; code: string; zoneId: string; type: string; zone: { name: string } }

type Props = {
  onRun: (config: SimulationConfig) => void
}

export function SimulationSetupForm({ onRun }: Props) {
  const [users, setUsers] = useState<SimUser[]>([])
  const [orders, setOrders] = useState<ReleasedOrder[]>([])
  const [bins, setBins] = useState<EmptyBin[]>([])

  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [selectedBinId, setSelectedBinId] = useState('')
  const [partialExecute, setPartialExecute] = useState(false)

  const [loading, setLoading] = useState(true)
  const [loadingBins, setLoadingBins] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      axios.get<ApiResponse<SimUser[]>>('/api/simulation/users'),
      axios.get<ApiResponse<ReleasedOrder[]>>('/api/simulation/released-orders')
    ])
      .then(([usersRes, ordersRes]) => {
        setUsers(usersRes.data.data ?? [])
        setOrders(ordersRes.data.data ?? [])
      })
      .catch(() => setError('Failed to load simulation data.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedOrderId) {
      setBins([])
      setSelectedBinId('')

      return
    }
    const order = orders.find((o) => o.id === selectedOrderId)
    if (!order) {
      return
    }

    setLoadingBins(true)
    setSelectedBinId('')
    axios
      .get<ApiResponse<EmptyBin[]>>(`/api/simulation/empty-bins?warehouseId=${order.warehouseId}`)
      .then((res) => setBins(res.data.data ?? []))
      .catch(() => setBins([]))
      .finally(() => setLoadingBins(false))
  }, [selectedOrderId, orders])

  function handleRun() {
    if (!selectedUserId || !selectedOrderId || !selectedBinId) {
      return
    }
    const order = orders.find((o) => o.id === selectedOrderId)
    const totalLines = order?.totalLines ?? 0
    const partialOk = partialExecute && totalLines >= 2
    let linesToCompleteBeforePause: number | undefined
    if (partialOk) {
      linesToCompleteBeforePause = 1 + Math.floor(Math.random() * (totalLines - 1))
    }

    onRun({
      userId: selectedUserId,
      orderId: selectedOrderId,
      toBinId: selectedBinId,
      orderReference: order?.reference ?? selectedOrderId,
      partialExecute: partialOk,
      linesToCompleteBeforePause
    })
  }

  if (loading) {
    return <div className="py-6 text-center text-sm text-dash-muted">Loading simulation data…</div>
  }

  if (error) {
    return <div className="py-6 text-center text-sm text-red-500">{error}</div>
  }

  const selectedOrder = orders.find((o) => o.id === selectedOrderId)
  const partialNeedsMoreLines =
    partialExecute && selectedOrder !== undefined && selectedOrder.totalLines < 2

  const canRun =
    !!selectedUserId &&
    !!selectedOrderId &&
    !!selectedBinId &&
    !partialNeedsMoreLines

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-dash-text">Floor Worker</label>
        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a worker…" />
          </SelectTrigger>
          <SelectContent>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.fullName} — {u.badgeNumber}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-dash-text">Purchase Order</label>
        <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a RELEASED order…" />
          </SelectTrigger>
          <SelectContent>
            {orders.length === 0 ? (
              <div className="px-3 py-2 text-sm text-dash-muted">No RELEASED orders found</div>
            ) : (
              orders.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.reference} — {o.supplierNameSnapshot} ({o.totalLines} lines)
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-start gap-3 rounded-md border border-dash-border px-3 py-3">
        <Checkbox
          id="sim-partial"
          checked={partialExecute}
          onCheckedChange={(v) => setPartialExecute(v === true)}
          disabled={!selectedOrderId || (selectedOrder !== undefined && selectedOrder.totalLines < 2)}
        />
        <div className="space-y-1">
          <label htmlFor="sim-partial" className="cursor-pointer text-sm font-medium leading-none text-dash-text">
            Partial execution
          </label>
          <p className="text-xs text-dash-muted">
            Start the order, declare receipt lines, then pause before every line is completed. How many lines finish first is chosen at random when you run (needs at least two PO lines).
          </p>
          {partialNeedsMoreLines && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              This order has fewer than two lines — choose another order or turn off partial execution.
            </p>
          )}
        </div>
      </div>

      {selectedOrderId && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-dash-text">Destination Bin</label>
          <Select
            value={selectedBinId}
            onValueChange={setSelectedBinId}
            disabled={loadingBins}
          >
            <SelectTrigger>
              <SelectValue placeholder={loadingBins ? 'Loading bins…' : 'Select an empty bin…'} />
            </SelectTrigger>
            <SelectContent>
              {bins.length === 0 && !loadingBins ? (
                <div className="px-3 py-2 text-sm text-dash-muted">No empty bins available</div>
              ) : (
                bins.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.code} — {b.name} ({b.zone.name})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      <Button className="w-full" onClick={handleRun} disabled={!canRun}>
        Run Simulation
      </Button>
    </div>
  )
}
