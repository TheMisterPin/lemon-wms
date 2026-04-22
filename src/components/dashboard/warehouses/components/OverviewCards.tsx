import { Archive, Building2, Map } from 'lucide-react'

import { COLORS } from './dashboard-theme'
import type { DashboardOverviewCard } from './dashboard-types'

type StatCardProps = {
  title: string
  value: number
  icon: React.ElementType
  accent: string
}

function StatCard({ title, value, icon: Icon, accent }: StatCardProps) {
  return (
    <div
      className="rounded-2xl"
      style={{
        background: COLORS.cardBg,
        boxShadow: '0 8px 22px rgba(0,0,0,0.24)',
        border: `1px solid ${COLORS.border}`
      }}
    >
      <div className="flex items-center justify-between p-4 xl:p-[18px]">
        <div>
          <div
            className="mb-1 text-[11px] uppercase tracking-[0.16em]"
            style={{ color: COLORS.textMuted }}
          >
            {title}
          </div>
          <div
            className="text-3xl font-semibold xl:text-4xl"
            style={{ color: COLORS.textPrimary }}
          >
            {value.toLocaleString()}
          </div>
        </div>
        <div
          className="rounded-2xl p-3"
          style={{ background: COLORS.cardBgSoft, color: accent }}
        >
          <Icon size={22} />
        </div>
      </div>
    </div>
  )
}

export function OverviewCards({ overview }: { overview: DashboardOverviewCard[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:gap-4">
      <StatCard
        title="Warehouses"
        value={overview[0].value}
        icon={Building2}
        accent={COLORS.warehouseAccent}
      />
      <StatCard
        title="Zones"
        value={overview[1].value}
        icon={Map}
        accent={COLORS.zoneAccent}
      />
      <StatCard
        title="Bins"
        value={overview[2].value}
        icon={Archive}
        accent={COLORS.binAccent}
      />
    </div>
  )
}
