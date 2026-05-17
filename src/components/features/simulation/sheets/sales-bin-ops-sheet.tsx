'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { format } from 'date-fns'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { ApiResponse } from '@/types/responses/basic-response'

type BinOp = {
  id: string
  type: string
  warItemId: string
  quantity: string
  uom: string
  fromBinId: string | null
  toBinId: string | null
  affectsFiscalStock: boolean
  createdAt: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string
}

export function SalesBinOpsSheet({ open, onOpenChange, orderId }: Props) {
  const [entries, setEntries] = useState<BinOp[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    axios
      .get<ApiResponse<BinOp[]>>(`/api/simulation/orders/sales/${orderId}/bin-operations`)
      .then((r) => setEntries(r.data.data ?? []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false))
  }, [open, orderId])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Bin Operations</SheetTitle>
        </SheetHeader>

        {loading && <p className="mt-4 text-sm text-dash-muted">Loading…</p>}

        {!loading && (
          <div className="mt-4">
            <div className="divide-y divide-dash-border rounded-md border border-dash-border">
              {entries.length === 0 ? (
                <p className="px-3 py-3 text-sm text-dash-muted">No bin operations recorded.</p>
              ) : (
                entries.map((e) => (
                  <div key={e.id} className="space-y-0.5 px-3 py-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-dash-text">{e.type}</span>
                      <span className="text-xs text-dash-muted">
                        {format(new Date(e.createdAt), 'HH:mm:ss')}
                      </span>
                    </div>
                    <div className="text-xs text-dash-muted">
                      Qty: {e.quantity} {e.uom}
                      {e.toBinId && ` → bin ${e.toBinId.slice(0, 8)}…`}
                      {e.affectsFiscalStock && (
                        <span className="ml-2 rounded bg-blue-100 px-1 py-0.5 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          fiscal
                        </span>
                      )}
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
