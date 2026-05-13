'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { format } from 'date-fns'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { ApiResponse } from '@/types/responses/basic-response'

type BinStockItem = {
  id: string
  itemId: string
  name: string
  sku: string
  uom: string
  quantityAvailable: string
  status: string
  createdAt: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  binId: string
}

export function BinStockSheet({ open, onOpenChange, binId }: Props) {
  const [items, setItems] = useState<BinStockItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    axios
      .get<ApiResponse<BinStockItem[]>>(`/api/simulation/bins/${binId}/stock`)
      .then((r) => setItems(r.data.data ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [open, binId])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Bin Contents</SheetTitle>
        </SheetHeader>

        {loading && <p className="mt-4 text-sm text-dash-muted">Loading…</p>}

        {!loading && (
          <div className="mt-4">
            <div className="divide-y divide-dash-border rounded-md border border-dash-border">
              {items.length === 0 ? (
                <p className="px-3 py-3 text-sm text-dash-muted">No stock items in this bin.</p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="space-y-0.5 px-3 py-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-dash-text">{item.name}</span>
                      <span className="text-xs text-dash-muted">{item.status}</span>
                    </div>
                    <div className="text-xs text-dash-muted">
                      {item.sku} · {item.quantityAvailable} {item.uom}
                    </div>
                    <div className="text-xs text-dash-muted">
                      Added {format(new Date(item.createdAt), 'HH:mm:ss')}
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
