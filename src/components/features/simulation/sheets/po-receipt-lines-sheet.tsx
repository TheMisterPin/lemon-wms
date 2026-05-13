'use client'

/* eslint-disable react-hooks/set-state-in-effect -- fetch-on-open sheet pattern */

import { useEffect, useState } from 'react'
import axios from 'axios'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { ApiResponse } from '@/types/responses/basic-response'

type PurchaseLineRow = {
  lineSequence: number
  itemNameSnapshot: string
  orderedQuantity: string
  uom: string
}

type ReceiptLineRow = {
  purchaseOrderLineId: string
  itemNameSnapshot: string
  orderedQuantity: string
  quantity: string
  disposition: string
  uom: string
}

type LinesPayload = {
  receiptId: string | null
  receiptReference: string | null
  receiptStatus: string | null
  purchaseLines: PurchaseLineRow[]
  receiptLines: ReceiptLineRow[]
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string
}

export function PoReceiptLinesSheet({ open, onOpenChange, orderId }: Props) {
  const [data, setData] = useState<LinesPayload | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }
    setLoading(true)
    setError(null)
    axios
      .get<ApiResponse<LinesPayload>>(`/api/simulation/orders/purchase/${orderId}/po-receipt-lines`)
      .then((r) => {
        if (!r.data.success) {
          setError(r.data.message ?? 'Failed to load lines.')
          setData(null)

          return
        }
        setData(r.data.data ?? null)
      })
      .catch(() => {
        setError('Failed to load lines.')
        setData(null)
      })
      .finally(() => setLoading(false))
  }, [open, orderId])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full max-w-3xl flex-col overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Purchase order vs receipt lines</SheetTitle>
          {data?.receiptReference && (
            <p className="text-left text-xs font-normal text-dash-muted">
              Receipt {data.receiptReference}
              {data.receiptStatus ? ` · ${data.receiptStatus.replace(/_/g, ' ')}` : ''}
            </p>
          )}
        </SheetHeader>

        {loading && <p className="mt-4 text-sm text-dash-muted">Loading…</p>}
        {error && !loading && <p className="mt-4 text-sm text-red-500">{error}</p>}

        {!loading && !error && data && (
          <div className="mt-4 grid flex-1 grid-cols-2 gap-4">
            <section className="min-w-0">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-dash-muted">
                Purchase order ({data.purchaseLines.length})
              </h3>
              <div className="divide-y divide-dash-border rounded-md border border-dash-border">
                {data.purchaseLines.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-dash-muted">No lines</p>
                ) : (
                  data.purchaseLines.map((l) => (
                    <div key={`po-${l.lineSequence}`} className="space-y-0.5 px-3 py-2 text-sm">
                      <div className="font-medium text-dash-text">
                        #{l.lineSequence} · {l.itemNameSnapshot}
                      </div>
                      <div className="text-xs text-dash-muted">
                        {l.orderedQuantity} {l.uom}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="min-w-0">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-dash-muted">
                Receipt ({data.receiptLines.length})
              </h3>
              <div className="divide-y divide-dash-border rounded-md border border-dash-border">
                {data.receiptLines.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-dash-muted">No receipt lines</p>
                ) : (
                  data.receiptLines.map((l) => (
                    <div key={`rl-${l.purchaseOrderLineId}`} className="space-y-0.5 px-3 py-2 text-sm">
                      <div className="font-medium text-dash-text">{l.itemNameSnapshot}</div>
                      <div className="text-xs text-dash-muted">
                        Ordered {l.orderedQuantity} {l.uom}
                      </div>
                      <div className="text-xs text-dash-muted">
                        Processed {l.quantity} {l.uom} · {l.disposition.replace(/_/g, ' ')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
