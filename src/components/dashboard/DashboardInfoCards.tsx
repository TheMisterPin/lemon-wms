import type { LucideIcon } from 'lucide-react'

export interface DashboardInfoCardItem {
  label: string
  value: number | string
  icon: LucideIcon
}

interface DashboardInfoCardsProps {
  cards: DashboardInfoCardItem[]
}

export function DashboardInfoCards({ cards }: DashboardInfoCardsProps) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon

        return (
          <div
            key={card.label}
            className="flex justify-between gap-4 rounded-lg border border-slate-500 bg-brand-glass/75 px-12 py-4"
          >
            <div>
              <p className="text-sm text-brand-muted">Total {card.label}</p>
              <p className="text-xl font-semibold">{card.value}</p>
            </div>
            <Icon size={48} className="text-slate-500/25" />
          </div>
        )
      })}
    </div>
  )
}
