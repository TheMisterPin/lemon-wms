/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/dashboard-info-card.md
 */

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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 min-h-1/8 max-h-1/8">
      {cards.map((card, cardIndex) => {
        const Icon = card.icon
        const accent = accentClassesByLabel[card.label.toLowerCase()] ?? {
          color: 'var(--brand-primary)',
          soft: 'var(--dash-card2)'
        }

        return (
          <div
            key={`${card.label}:${cardIndex}`}
            className="relative overflow-hidden rounded-md bg-dash-card px-6 pb-5 pt-6 shadow-none"
          >
            <div
              className="absolute inset-x-0 top-0 h-0.5"
              style={{ backgroundColor: accent.color }}
              aria-hidden
            />
            <div className="relative z-10">
              <p className="text-sm text-dash-muted">Total {card.label}</p>
              <p className="text-4xl font-semibold tabular-nums tracking-tight" style={{ color: accent.color }}>
                {card.value}
              </p>
            </div>
            <Icon
              size={96}
              strokeWidth={1.25}
              className="pointer-events-none absolute -bottom-4 -right-3 opacity-[0.12]"
              style={{ color: accent.color }}
            />
          </div>
        )
      })}
    </div>
  )
}
