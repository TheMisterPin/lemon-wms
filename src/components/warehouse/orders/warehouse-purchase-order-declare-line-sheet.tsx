'use client'

import { useEffect, useState } from 'react'

import type { ReceiptOutcome } from '@/generated/prisma'

import {
  PURCHASE_RECEIPT_DECLARE_OUTCOMES,
  type ReceiptLineProgress
} from '@/components/warehouse/orders/warehouse-purchase-order-details-derive'
import type { WarehousePurchaseOrderReceiptLineApi } from '@/types/api/warehouse-purchase-order-receipt'

type WarehousePurchaseOrderDeclareLineSheetProps = {
  open: boolean
  line: WarehousePurchaseOrderReceiptLineApi | null
  lineProgress: ReceiptLineProgress | null
  dispositionOptions?: ReceiptOutcome[]
  submitting: boolean
  onClose: () => void
  onSubmit: (input: {
    quantity: number
    disposition: ReceiptOutcome
    notes: string | null
  }) => Promise<boolean>
}

export function WarehousePurchaseOrderDeclareLineSheet({
  open,
  line,
  lineProgress,
  dispositionOptions = PURCHASE_RECEIPT_DECLARE_OUTCOMES,
  submitting,
  onClose,
  onSubmit
}: WarehousePurchaseOrderDeclareLineSheetProps) {
  const [quantity, setQuantity] = useState('1')
  const [disposition, setDisposition] = useState<ReceiptOutcome>(dispositionOptions[0])
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!open || !line) {
      return
    }

    setQuantity('1')
    setDisposition(dispositionOptions[0])
    setNotes('')
  }, [dispositionOptions, line, open])

  if (!open || !line) {
    return null
  }

  const parsedQty = Number(quantity)
  const qtyValid = Number.isFinite(parsedQty) && parsedQty > 0

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/55 p-4" role="dialog" aria-modal>
      <div
        className="flex max-h-[95vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border shadow-2xl"
        style={{
          background: 'var(--wh-card-bg)',
          borderColor: 'var(--wh-border)'
        }}
      >
        <div className="border-b px-5 py-4" style={{
          borderColor: 'var(--wh-border)'
        }}
        >
          <h2 className="text-lg font-semibold" style={{ color: 'var(--wh-text-primary)' }}>Declare receive</h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--wh-text-muted)' }}>
            Adjust quantity and disposition, then submit. Saves overwrite the receipt line declaration.
          </p>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <div className="grid gap-3 rounded-xl border p-4 text-sm" style={{
            borderColor: 'var(--wh-border)',
            background: 'var(--wh-card-bg-soft)'
          }}
          >
            <div>
              <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--wh-text-muted)' }}>Item</div>
              <div className="mt-1 font-medium" style={{ color: 'var(--wh-text-primary)' }}>{line.itemNameSnapshot}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--wh-text-muted)' }}>Ordered qty</div>
                <div className="mt-1 font-mono">{line.orderedQuantity}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--wh-text-muted)' }}>Declared qty</div>
                <div className="mt-1 font-mono">{line.quantity}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--wh-text-muted)' }}>Pending qty</div>
                <div className="mt-1 font-mono">{lineProgress?.pendingQty ?? '—'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--wh-text-muted)' }}>UoM</div>
                <div className="mt-1 font-mono">{line.uom}</div>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--wh-text-secondary)' }} htmlFor="po-declare-qty">
              Quantity
            </label>
            <input
              id="po-declare-qty"
              className="w-full rounded-xl border px-3 py-3 text-base outline-none ring-0"
              style={{
                borderColor: 'var(--wh-border)',
                background: 'var(--wh-page-bg)',
                color: 'var(--wh-text-primary)'
              }}
              value={quantity}
              inputMode="decimal"
              onChange={(event) => setQuantity(event.target.value)}
            />
          </div>

          <div>
            <div className="mb-2 text-sm font-medium" style={{ color: 'var(--wh-text-secondary)' }}>Disposition</div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {dispositionOptions.map((opt) => {
                const active = disposition === opt

                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={submitting}
                    onClick={() => setDisposition(opt)}
                    className="rounded-xl border px-3 py-2 text-left text-xs font-semibold transition hover:opacity-90 disabled:opacity-40"
                    style={
                      active
                        ? {
                          borderColor: 'var(--wh-status-available)',
                          background:
                            'color-mix(in srgb, var(--wh-status-available) 18%, var(--wh-card-bg))',
                          color: 'var(--wh-text-primary)'
                        }
                        : {
                          borderColor: 'var(--wh-border)',
                          background: 'var(--wh-card-bg-soft)',
                          color: 'var(--wh-text-muted)'
                        }
                    }
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--wh-text-secondary)' }} htmlFor="po-declare-notes">
              Notes (optional)
            </label>
            <textarea
              id="po-declare-notes"
              className="min-h-[112px] w-full rounded-xl border px-3 py-3 text-sm outline-none ring-0"
              style={{
                borderColor: 'var(--wh-border)',
                background: 'var(--wh-page-bg)',
                color: 'var(--wh-text-primary)'
              }}
              value={notes}
              placeholder="Damaged carton, QA hold, discrepancy…"
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>
        </div>

        <div
          className="flex shrink-0 items-center justify-end gap-3 border-t px-5 py-4"
          style={{ borderColor: 'var(--wh-border)' }}
        >
          <button
            type="button"
            className="rounded-xl border px-4 py-2 text-sm font-medium transition hover:opacity-90 disabled:opacity-40"
            style={{
              borderColor: 'var(--wh-border)',
              color: 'var(--wh-text-muted)',
              background: 'transparent'
            }}
            disabled={submitting}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-xl border px-4 py-2 text-sm font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              borderColor: 'var(--wh-status-available)',
              background: 'var(--wh-status-available)',
              color: 'var(--wh-page-bg)'
            }}
            disabled={submitting || !qtyValid}
            onClick={async () => {
              const ok = await onSubmit({
                quantity: parsedQty,
                disposition,
                notes: notes.trim() ? notes.trim() : null
              })
              if (ok) {
                onClose()
              }
            }}
          >
            {submitting ? 'Saving…' : 'Save declaration'}
          </button>
        </div>
      </div>
    </div>
  )
}
