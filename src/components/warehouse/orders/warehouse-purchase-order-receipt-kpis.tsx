'use client'

type WarehousePurchaseOrderReceiptKpisProps = {
  receiptReference: string
  receiptStatus: string
  lineCount: number
  totals: {
    acceptedQty: number
    quarantinedQty: number
    issueQty: number
    pendingQtySum: number
  }
}

function MetricCard(props: {
  title: string
  value: string | number
  wide?: boolean
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${props.wide ? 'sm:col-span-2' : ''}`}
      style={{
        background: 'var(--wh-card-bg-soft)',
        borderColor: 'var(--wh-border)'
      }}
    >
      <div className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--wh-text-muted)' }}>
        {props.title}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums" style={{ color: 'var(--wh-text-primary)' }}>
        {props.value}
      </div>
    </div>
  )
}

export function WarehousePurchaseOrderReceiptKpis({
  receiptReference,
  receiptStatus,
  lineCount,
  totals
}: WarehousePurchaseOrderReceiptKpisProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
      <MetricCard wide title={`Receipt (${receiptReference})`} value={receiptStatus} />
      <MetricCard title="Lines" value={lineCount} />
      <MetricCard title="Accepted qty" value={totals.acceptedQty} />
      <MetricCard title="Quarantined qty" value={totals.quarantinedQty} />
      <MetricCard title="Issue qty" value={totals.issueQty} />
      <MetricCard title="Pending (receive) qty" value={totals.pendingQtySum} />
    </section>
  )
}
