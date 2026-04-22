import { PackageOpen } from 'lucide-react'

import { COLORS } from './dashboard-theme'
import type { BinRecord } from './dashboard-types'

function getBinStatus(bin: BinRecord) {
  if (!bin.active) {
    return { label: 'Inactive', dot: COLORS.textMuted, text: COLORS.textSecondary }
  }

  if (bin.isBlocked) {
    return { label: 'Blocked', dot: COLORS.statusBlocked, text: COLORS.statusBlocked }
  }

  if (bin.filledPercentage >= 90) {
    return { label: 'Full', dot: COLORS.statusFull, text: COLORS.statusFull }
  }

  return { label: 'Available', dot: COLORS.statusAvailable, text: COLORS.statusAvailable }
}

function getFillBarStyle(bin: BinRecord) {
  if (bin.isBlocked) return { background: COLORS.statusBlocked }
  if (bin.filledPercentage >= 90) return { background: COLORS.fillHigh }
  if (bin.filledPercentage >= 60) return { background: COLORS.fillMid }
  if (bin.filledPercentage > 0) return { background: COLORS.fillLow }
  return { background: COLORS.textMuted }
}

function BinCard({ bin }: { bin: BinRecord }) {
  const status = getBinStatus(bin)

  return (
    <div
      className="group rounded-2xl transition-transform duration-200 hover:-translate-y-0.5"
      style={{
        background: COLORS.cardBg,
        boxShadow: '0 8px 22px rgba(0,0,0,0.24)',
        border: `1px solid ${COLORS.border}`
      }}
    >
      <div className="p-4 xl:p-[18px]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div
              className="text-[17px] font-semibold xl:text-lg"
              style={{ color: COLORS.textPrimary }}
            >
              {bin.name}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center gap-2 text-xs xl:text-sm"
              style={{ color: status.text }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: status.dot }} />
              <span>{status.label}</span>
            </div>

            <div
              className="rounded-full px-2.5 py-1 text-[11px] xl:text-xs"
              style={{ background: COLORS.cardBgSoft, color: COLORS.textSecondary }}
            >
              {bin.type}
            </div>
          </div>
        </div>

        <div className="mb-3">
          <div
            className="mb-1.5 flex justify-between text-[11px] xl:text-xs"
            style={{ color: COLORS.textSecondary }}
          >
            <span>Fill</span>
            <span>{bin.filledPercentage}% · {bin.itemsInBin}</span>
          </div>
          <div className="h-2 rounded-full" style={{ background: COLORS.fillTrack }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${bin.filledPercentage}%`, ...getFillBarStyle(bin) }}
            />
          </div>
        </div>

        <div className="flex justify-center pt-1">
          <button
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs transition-all duration-300 opacity-100 md:translate-y-1 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
            style={{
              background: COLORS.actionBg,
              border: `1px solid ${COLORS.actionBorder}`,
              color: COLORS.actionText
            }}
          >
            <PackageOpen size={14} />
            View contents
          </button>
        </div>
      </div>
    </div>
  )
}

function SectionBlock({
  title,
  children,
  action
}: {
  title: string
  children: React.ReactNode
  action?: string
}) {
  return (
    <section
      className="rounded-2xl"
      style={{
        background: COLORS.cardBgSoft,
        border: `1px solid ${COLORS.border}`
      }}
    >
      <div
        className="flex items-center justify-between border-b px-4 py-3 xl:px-5"
        style={{ borderColor: COLORS.border }}
      >
        <div
          className="text-sm font-semibold xl:text-base"
          style={{ color: COLORS.textPrimary }}
        >
          {title}
        </div>
        {action ? (
          <div className="text-[11px] xl:text-xs" style={{ color: COLORS.textMuted }}>
            {action}
          </div>
        ) : null}
      </div>

      <div className="p-4 xl:p-5">{children}</div>
    </section>
  )
}

export function BinGrid({ bins }: { bins: BinRecord[] }) {
  return (
    <SectionBlock title="Bins" action="Storage grid preview">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 xl:gap-4">
        {bins.map((bin) => (
          <BinCard key={bin.id} bin={bin} />
        ))}
      </div>
    </SectionBlock>
  )
}
