import type { LucideIcon } from 'lucide-react'

export interface DashboardInfoCardItem {
  label: string
  value: number | string
  icon: LucideIcon
}

interface DashboardInfoCardsProps {
  cards: DashboardInfoCardItem[]
}

const accentClassesByLabel: Record<string, { color: string; soft: string }> = {
  warehouses: {
    color: 'var(--entity-warehouse)',
    soft: 'var(--entity-warehouse-soft)'
  },
  zones: {
    color: 'var(--entity-zone)',
    soft: 'var(--entity-zone-soft)'
  },
  bins: {
    color: 'var(--entity-bin)',
    soft: 'var(--entity-bin-soft)'
  }
}

export function DashboardInfoCards({ cards }: DashboardInfoCardsProps) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon
        const accent = accentClassesByLabel[card.label.toLowerCase()] ?? {
          color: 'var(--brand-primary)',
          soft: 'var(--brand-glass-hover)'
        }

        return (
          <div
            key={card.label}
            className={[
              'relative overflow-hidden rounded-lg border border-slate-500 bg-brand-glass/75 px-6 py-5',
              'border-r-3'
            ].join(' ')}
            style={{
              borderRightColor: accent.color,
              backgroundImage: `linear-gradient(to bottom right, ${accent.soft}, transparent)`
            }}
          >
            <div className="relative z-10">
              <p className="text-sm text-brand-muted">Total {card.label}</p>
              <p className="text-4xl leading-none font-bold" style={{ color: accent.color }}>{card.value}</p>
            </div>
            <Icon
              size={110}
              className="pointer-events-none absolute -bottom-6 -right-4"
              style={{ color: accent.soft }}
            />
          </div>
        )
      })}
    </div>
  )
}
