'use client'

/* eslint-disable react-hooks/set-state-in-effect -- fetch-on-mount pattern */

import { useEffect, useState } from 'react'
import axios from 'axios'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ApiResponse } from '@/types/responses/basic-response'

import type { SalesSimulationConfig } from './sales-simulation-modal'

type SimUser = { id: string; fullName: string; badgeNumber: string; role: string }
type ReleasedSalesOrder = {
  id: string
  reference: string
  warehouseId: string
  customerName: string
  hasPick: boolean
}

type Props = {
  onRun: (config: SalesSimulationConfig) => void
}

export function SalesSimulationSetupForm({ onRun }: Props) {
  const [users, setUsers] = useState<SimUser[]>([])
  const [orders, setOrders] = useState<ReleasedSalesOrder[]>([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      axios.get<ApiResponse<SimUser[]>>('/api/simulation/users'),
      axios.get<ApiResponse<ReleasedSalesOrder[]>>('/api/simulation/released-sales-orders')
    ])
      .then(([usersRes, ordersRes]) => {
        setUsers(usersRes.data.data ?? [])
        setOrders((ordersRes.data.data ?? []).filter((o) => o.hasPick))
      })
      .catch(() => setError('Failed to load simulation data.'))
      .finally(() => setLoading(false))
  }, [])

  function handleRun() {
    if (!selectedUserId || !selectedOrderId) {
      return
    }
    const order = orders.find((o) => o.id === selectedOrderId)

    onRun({
      userId: selectedUserId,
      orderId: selectedOrderId,
      orderReference: order?.reference ?? selectedOrderId,
      customerName: order?.customerName ?? ''
    })
  }

  if (loading) {
    return <div className="py-6 text-center text-sm text-dash-muted">Loading simulation data…</div>
  }

  if (error) {
    return <div className="py-6 text-center text-sm text-red-500">{error}</div>
  }

  const canRun = !!selectedUserId && !!selectedOrderId

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
        <label className="text-sm font-medium text-dash-text">Sales Order</label>
        <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a RELEASED order…" />
          </SelectTrigger>
          <SelectContent>
            {orders.length === 0 ? (
              <div className="px-3 py-2 text-sm text-dash-muted">No RELEASED orders with picks found</div>
            ) : (
              orders.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.reference} — {o.customerName}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        <p className="text-xs text-dash-muted">
          The simulation picks all reserved items, loads them to a trolley, then unloads to the warehouse staging bin.
        </p>
      </div>

      <Button className="w-full" onClick={handleRun} disabled={!canRun}>
        Run Simulation
      </Button>
    </div>
  )
}
