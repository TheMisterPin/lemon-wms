'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { SimulationConfig } from './simulation-modal'
import type { ApiResponse } from '@/types/responses/basic-response'

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
    if (!order) return

    setLoadingBins(true)
    setSelectedBinId('')
    axios
      .get<ApiResponse<EmptyBin[]>>(`/api/simulation/empty-bins?warehouseId=${order.warehouseId}`)
      .then((res) => setBins(res.data.data ?? []))
      .catch(() => setBins([]))
      .finally(() => setLoadingBins(false))
  }, [selectedOrderId, orders])

  function handleRun() {
    if (!selectedUserId || !selectedOrderId || !selectedBinId) return
    const order = orders.find((o) => o.id === selectedOrderId)
    onRun({
      userId: selectedUserId,
      orderId: selectedOrderId,
      toBinId: selectedBinId,
      orderReference: order?.reference ?? selectedOrderId
    })
  }

  if (loading) {
    return <div className="py-6 text-center text-sm text-dash-muted">Loading simulation data…</div>
  }

  if (error) {
    return <div className="py-6 text-center text-sm text-red-500">{error}</div>
  }

  const canRun = !!selectedUserId && !!selectedOrderId && !!selectedBinId

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
