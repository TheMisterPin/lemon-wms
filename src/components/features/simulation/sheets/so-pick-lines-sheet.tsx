'use client'

/* eslint-disable react-hooks/set-state-in-effect -- fetch-on-open sheet pattern */

import { useEffect, useState } from 'react'
import axios from 'axios'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { ApiResponse } from '@/types/responses/basic-response'

type SalesLineRow = {
  salesOrderLineId: string
  itemNameSnapshot: string
  orderedQuantity: string
  uom: string
}

type PickLineRow = {
  salesOrderLineId: string
  itemNameSnapshot: string
  orderedQuantity: string
  quantity: string
  disposition: string
  uom: string
}

type LinesPayload = {
  pickId: string | null
  pickReference: string | null
  pickStatus: string | null
  salesLines: SalesLineRow[]
  pickLines: PickLineRow[]
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string
}

export function SoPickLinesSheet({ open, onOpenChange, orderId }: Props) {
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
      .get<ApiResponse<LinesPayload>>(`/api/simulation/orders/sales/${orderId}/so-pick-lines`)
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
          <SheetTitle>Sales order vs pick lines</SheetTitle>
          {data?.pickReference && (
            <p className="text-left text-xs font-normal text-dash-muted">
              Pick {data.pickReference}
              {data.pickStatus ? ` · ${data.pickStatus.replace(/_/g, ' ')}` : ''}
            </p>
          )}
        </SheetHeader>

        {loading && <p className="mt-4 text-sm text-dash-muted">Loading…</p>}
        {error && !loading && <p className="mt-4 text-sm text-red-500">{error}</p>}

        {!loading && !error && data && (
          <div className="mt-4 grid flex-1 grid-cols-2 gap-4">
            <section className="min-w-0">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-dash-muted">
                Sales order ({data.salesLines.length})
              </h3>
              <div className="divide-y divide-dash-border rounded-md border border-dash-border">
                {data.salesLines.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-dash-muted">No lines</p>
                ) : (
                  data.salesLines.map((l) => (
                    <div key={`so-${l.salesOrderLineId}`} className="space-y-0.5 px-3 py-2 text-sm">
                      <div className="font-medium text-dash-text">{l.itemNameSnapshot}</div>
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
                Pick ({data.pickLines.length})
              </h3>
              <div className="divide-y divide-dash-border rounded-md border border-dash-border">
                {data.pickLines.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-dash-muted">No pick lines</p>
                ) : (
                  data.pickLines.map((l) => (
                    <div key={`pl-${l.salesOrderLineId}`} className="space-y-0.5 px-3 py-2 text-sm">
                      <div className="font-medium text-dash-text">{l.itemNameSnapshot}</div>
                      <div className="text-xs text-dash-muted">
                        Ordered {l.orderedQuantity} {l.uom}
                      </div>
                      <div className="text-xs text-dash-muted">
                        Picked {l.quantity} {l.uom} · {l.disposition.replace(/_/g, ' ')}
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
