'use client'

import { Loader2 } from 'lucide-react'

import { WarehouseOverviewShellSection } from '@/components/primitives/warehouse-overview-primitives'
import type { WarehousePurchaseOrderReceiptLineApi } from '@/types/api/warehouse-purchase-order-receipt'

import type { ReceiptLineProgress } from '@/components/warehouse/orders/warehouse-purchase-order-details-derive'

type WarehousePurchaseOrderReceiptLinesTableProps = {
  lines: WarehousePurchaseOrderReceiptLineApi[]
  lineProgressById: Map<string, ReceiptLineProgress>
  receiptLoading: boolean
  canDeclare: boolean
  isBusy: boolean
  actingLineId: string | null
  onDeclare: (lineId: string) => void
}

function LineStatusPill({ value }: { value: ReceiptLineProgress['lineUiStatus'] }) {
  const palette: Record<
  ReceiptLineProgress['lineUiStatus'],
  { fg: string; bg: string }
  > = {
    OPEN: { fg: 'var(--wh-text-muted)', bg: 'var(--wh-card-bg)' },
    PARTIAL: { fg: 'var(--wh-status-full)', bg: 'var(--wh-card-bg-soft)' },
    RECEIVED: { fg: 'var(--wh-status-available)', bg: 'var(--wh-card-bg-soft)' },
    EXCEPTION: { fg: 'var(--wh-status-blocked)', bg: 'var(--wh-card-bg-soft)' }
  }

  const tone = palette[value]

  return (
    <span
      className="inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold uppercase"
      style={{ borderColor: 'var(--wh-border)', color: tone.fg, background: tone.bg }}
    >
      {value}
    </span>
  )
}

export function WarehousePurchaseOrderReceiptLinesTable({
  lines,
  lineProgressById,
  receiptLoading,
  canDeclare,
  isBusy,
  actingLineId,
  onDeclare
}: WarehousePurchaseOrderReceiptLinesTableProps) {
  return (
    <WarehouseOverviewShellSection
      title={
        receiptLoading ? (
          <span className="inline-flex items-center gap-2">
            Expected lines <Loader2 className="size-4 animate-spin" aria-hidden />
          </span>
        ) : (
          'Expected lines'
        )
      }
    >
      <p className="mb-4 text-xs sm:text-sm" style={{ color: 'var(--wh-text-muted)' }}>
        Each POST handle overwrites quantity and disposition for that receipt line (no multi-row ledger on MVP).
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--wh-border)', color: 'var(--wh-text-muted)' }}>
              <th className="py-2 pr-4 font-medium">Actions</th>
              <th className="py-2 pr-4 font-medium">Item</th>
              <th className="py-2 pr-4 text-right font-medium">Ordered</th>
              <th className="py-2 pr-4 text-right font-medium">Declared</th>
              <th className="py-2 pr-4 font-medium">Disposition</th>
              <th className="py-2 pr-4 text-right font-medium">Pending</th>
              <th className="py-2 font-medium">State</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => {
              const prog = lineProgressById.get(line.id)
              const isActingHere = actingLineId === line.id

              return (
                <tr
                  key={line.id}
                  style={{
                    borderBottom: '1px solid color-mix(in srgb, var(--wh-border) 45%, transparent)',
                    color: 'var(--wh-text-primary)'
                  }}
                >
                  <td className="py-3 pr-4 align-middle">
                    <button
                      type="button"
                      className="inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                      style={{
                        borderColor: 'color-mix(in srgb, var(--wh-status-available) 55%, transparent)',
                        color: 'var(--wh-status-available)',
                        background: 'transparent'
                      }}
                      disabled={!canDeclare || isBusy || isActingHere}
                      onClick={() => onDeclare(line.id)}
                    >
                      {isActingHere ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                      Declare
                    </button>
                  </td>
                  <td className="py-3 pr-4 align-top">
                    <div className="font-medium">{line.itemNameSnapshot}</div>
                    <div className="mt-1 text-xs font-mono" style={{ color: 'var(--wh-text-muted)' }}>
                      {line.uom} · line {line.id.slice(0, 8)}…
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums align-middle">{line.orderedQuantity}</td>
                  <td className="py-3 pr-4 text-right tabular-nums align-middle">{line.quantity}</td>
                  <td className="py-3 pr-4 align-middle text-xs">{line.disposition}</td>
                  <td className="py-3 pr-4 text-right font-semibold tabular-nums align-middle">
                    {prog?.pendingQty ?? '—'}
                  </td>
                  <td className="py-3 align-middle">
                    {prog ? <LineStatusPill value={prog.lineUiStatus} /> : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {!receiptLoading && lines.length === 0 ? (
        <p className="py-8 text-center text-sm" style={{ color: 'var(--wh-text-muted)' }}>
          No receipt lines returned.
        </p>
      ) : null}
    </WarehouseOverviewShellSection>
  )
}
