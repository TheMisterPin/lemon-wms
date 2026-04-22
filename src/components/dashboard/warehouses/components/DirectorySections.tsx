import { MapPin, Warehouse } from 'lucide-react'

import { COLORS } from './dashboard-theme'
import type { DashboardWarehouseDisplayRecord, DashboardZoneDisplayRecord } from './dashboard-types'

type SectionBlockProps = {
  title: string
  action?: string
  children: React.ReactNode
}

function SectionBlock({ title, action, children }: SectionBlockProps) {
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
          <div
            className="text-[11px] xl:text-xs"
            style={{ color: COLORS.textMuted }}
          >
            {action}
          </div>
        ) : null}
      </div>

      <div className="space-y-3 p-4 xl:p-5">{children}</div>
    </section>
  )
}

type ListCardProps = {
  icon: React.ElementType
  title: string
  subtitle: string
  accent: string
  metric: string
}

function ListCard({ icon: Icon, title, subtitle, accent, metric }: ListCardProps) {
  return (
    <div
      className="group rounded-2xl transition-transform duration-200 hover:-translate-y-0.5"
      style={{
        background: COLORS.cardBg,
        boxShadow: '0 8px 22px rgba(0,0,0,0.24)',
        border: `1px solid ${COLORS.border}`
      }}
    >
      <div className="flex items-center justify-between gap-4 p-4 xl:p-[18px]">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="rounded-2xl p-3"
            style={{ background: COLORS.cardBgSoft, color: accent }}
          >
            <Icon size={18} />
          </div>
          <div className="min-w-0">
            <div
              className="truncate text-[15px] font-semibold xl:text-base"
              style={{ color: COLORS.textPrimary }}
            >
              {title}
            </div>
            <div
              className="truncate text-[11px] xl:text-xs"
              style={{ color: COLORS.textSecondary }}
            >
              {subtitle}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <div
            className="rounded-full px-3 py-1 text-[11px] xl:text-xs"
            style={{ background: COLORS.cardBgSoft, color: COLORS.textSecondary }}
          >
            {metric}
          </div>

          <button
            className="rounded-xl px-3 py-2 text-[11px] transition-all duration-300 opacity-100 md:translate-x-1 md:opacity-0 md:group-hover:translate-x-0 md:group-hover:opacity-100 xl:text-xs"
            style={{
              background: COLORS.actionBg,
              border: `1px solid ${COLORS.actionBorder}`,
              color: COLORS.actionText
            }}
          >
            See details
          </button>
        </div>
      </div>
    </div>
  )
}

export function DirectorySections({
  warehouses,
  zones
}: {
  warehouses: DashboardWarehouseDisplayRecord[]
  zones: DashboardZoneDisplayRecord[]
}) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-5">
      <SectionBlock title="Warehouses" action={`${warehouses.length} active shown`}>
        {warehouses.map((warehouse) => (
          <ListCard
            key={warehouse.id}
            icon={Warehouse}
            title={warehouse.name}
            subtitle={warehouse.subtitle}
            metric={warehouse.metric}
            accent={COLORS.warehouseAccent}
          />
        ))}
      </SectionBlock>

      <SectionBlock title="Zones" action={`${zones.length} active shown`}>
        {zones.map((zone) => (
          <ListCard
            key={zone.id}
            icon={MapPin}
            title={zone.name}
            subtitle={zone.subtitle}
            metric={zone.metric}
            accent={COLORS.zoneAccent}
          />
        ))}
      </SectionBlock>
    </div>
  )
}
