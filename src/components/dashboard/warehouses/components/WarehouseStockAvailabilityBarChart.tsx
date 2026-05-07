'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/warehouses/components/warehouse-stock-availability-bar-chart.md
 */


import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import {
  WarehouseOverviewChartPanel,
  WarehouseOverviewShellSection,
  warehouseOverviewRechartsTooltipProps
} from './warehouse-overview-primitives'
import type { WarehouseStockCategoryRow } from './warehouse-overview-types'

type WarehouseStockAvailabilityBarChartProps = {
  rows: WarehouseStockCategoryRow[]
}

/** Stacked horizontal availability by category (same rows as the stock donut). */
export function WarehouseStockAvailabilityBarChart({ rows }: WarehouseStockAvailabilityBarChartProps) {
  const chartData = rows.map((r) => ({
    label: r.label,
    available: r.available,
    reserved: r.reserved,
    blocked: r.blocked
  }))

  return (
    <WarehouseOverviewShellSection title="Available / Reserved / Blocked">
      <WarehouseOverviewChartPanel>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 8, right: 16, bottom: 8, left: 120 }}
            >
              <XAxis
                type="number"
                tick={{ fill: 'var(--wh-text-muted)', fontSize: 11 }}
                axisLine={{ stroke: 'var(--wh-border)' }}
                tickLine={false}
              />
              <YAxis
                dataKey="label"
                type="category"
                width={110}
                tick={{ fill: 'var(--wh-text-primary)', fontSize: 11 }}
                axisLine={{ stroke: 'var(--wh-border)' }}
                tickLine={false}
              />
              <Tooltip {...warehouseOverviewRechartsTooltipProps} />
              <Bar
                dataKey="available"
                name="Available"
                stackId="stock"
                fill="var(--wh-status-available, #22c55e)"
              />
              <Bar
                dataKey="reserved"
                name="Reserved"
                stackId="stock"
                fill="var(--wh-status-full, #eab308)"
              />
              <Bar
                dataKey="blocked"
                name="Blocked"
                stackId="stock"
                fill="var(--wh-status-blocked, #ef4444)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </WarehouseOverviewChartPanel>
    </WarehouseOverviewShellSection>
  )
}
