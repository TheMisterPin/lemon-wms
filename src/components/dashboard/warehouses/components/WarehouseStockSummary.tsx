'use client'

import { useMemo } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import {
  WarehouseOverviewChartPanel,
  WarehouseOverviewShellSection,
  warehouseOverviewRechartsTooltipProps
} from './warehouse-overview-primitives'
import type { WarehouseStockCategoryRow } from './warehouse-overview-types'

type WarehouseStockAvailBarProps = {
  available: number
  reserved: number
  blocked: number
}

function WarehouseStockAvailBar({ available, reserved, blocked }: WarehouseStockAvailBarProps) {
  const total = available + reserved + blocked || 1

  return (
    <div className="flex h-2 overflow-hidden rounded-full" style={{ background: 'var(--wh-card-bg-soft, #171c24)' }}>
      <div style={{ width: `${(available / total) * 100}%`, background: 'var(--wh-status-available, #22c55e)' }} />
      <div style={{ width: `${(reserved / total) * 100}%`, background: 'var(--wh-status-full, #eab308)' }} />
      <div style={{ width: `${(blocked / total) * 100}%`, background: 'var(--wh-status-blocked, #ef4444)' }} />
    </div>
  )
}

type WarehouseStockSummaryProps = {
  categories: WarehouseStockCategoryRow[]
}

/** Donut breakdown of on-hand units by category, with legend availability bars. */
export function WarehouseStockSummary({ categories }: WarehouseStockSummaryProps) {
  const totalStock = useMemo(
    () => categories.reduce((acc, item) => acc + item.totalOnHand, 0),
    [categories]
  )

  const headerSuffix = `${totalStock.toLocaleString()} units total`

  return (
    <WarehouseOverviewShellSection
      title="Stock summary"
      action={
        <span className="text-xs" style={{ color: 'var(--wh-text-muted)' }}>
          {headerSuffix}
        </span>
      }
    >
      <WarehouseOverviewChartPanel>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[0.9fr_1.1fr]">
          <div className="relative h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="totalOnHand"
                  innerRadius={58}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {categories.map((entry) => (
                    <Cell key={entry.label} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...warehouseOverviewRechartsTooltipProps} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <div
                className="text-[10px] uppercase tracking-[0.2em]"
                style={{ color: 'var(--wh-text-muted)' }}
              >
                On hand
              </div>
              <div className="text-2xl font-bold tabular-nums">{totalStock.toLocaleString()}</div>
              <div className="text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
                100%
              </div>
            </div>
          </div>

          <div className="space-y-3 self-center">
            {categories.map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                    <span className="truncate font-medium">{item.label}</span>
                  </div>
                  <span className="tabular-nums" style={{ color: 'var(--wh-text-secondary)' }}>
                    {item.totalOnHand.toLocaleString()}
                  </span>
                </div>
                <WarehouseStockAvailBar
                  available={item.available}
                  reserved={item.reserved}
                  blocked={item.blocked}
                />
              </div>
            ))}
          </div>
        </div>
      </WarehouseOverviewChartPanel>
    </WarehouseOverviewShellSection>
  )
}
