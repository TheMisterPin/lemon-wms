'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { format } from 'date-fns'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { ApiResponse } from '@/types/responses/basic-response'

type LedgerEntry = {
  id: string
  eventType: string
  warItemId: string
  quantityDelta: string
  uom: string
  warehouseId: string
  zoneId: string
  createdAt: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string
}

export function LedgerSheet({ open, onOpenChange, orderId }: Props) {
  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    axios
      .get<ApiResponse<LedgerEntry[]>>(`/api/simulation/orders/purchase/${orderId}/ledger-entries`)
      .then((r) => setEntries(r.data.data ?? []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false))
  }, [open, orderId])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Item Ledger</SheetTitle>
        </SheetHeader>

        {loading && <p className="mt-4 text-sm text-dash-muted">Loading…</p>}

        {!loading && (
          <div className="mt-4">
            <div className="divide-y divide-dash-border rounded-md border border-dash-border">
              {entries.length === 0 ? (
                <p className="px-3 py-3 text-sm text-dash-muted">No ledger entries recorded.</p>
              ) : (
                entries.map((e) => (
                  <div key={e.id} className="space-y-0.5 px-3 py-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-dash-text">{e.eventType}</span>
                      <span className="text-xs text-dash-muted">
                        {format(new Date(e.createdAt), 'HH:mm:ss')}
                      </span>
                    </div>
                    <div className="text-xs text-dash-muted">
                      Δ {Number(e.quantityDelta) > 0 ? '+' : ''}{e.quantityDelta} {e.uom}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
