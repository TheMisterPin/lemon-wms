'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/zones/components/zone-fill-distribution-bar-chart.md
 */

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import {
  WarehouseOverviewChartPanel,
  WarehouseOverviewShellSection,
  warehouseOverviewRechartsTooltipProps
} from '@/components/primitives/warehouse-overview-primitives'
import type { ZoneOverviewFillBucketRow } from '@/types/zone-overview-dashboard.types'

const FILL_BUCKET_COLORS = ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444']

type ZoneFillDistributionBarChartProps = {
  rows: ZoneOverviewFillBucketRow[]
}

export function ZoneFillDistributionBarChart({ rows }: ZoneFillDistributionBarChartProps) {
  return (
    <WarehouseOverviewShellSection title="Bin fill distribution">
      <WarehouseOverviewChartPanel>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--wh-border)" />
              <XAxis
                dataKey="label"
                tick={{ fill: 'var(--wh-text-muted)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'var(--wh-text-muted)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip {...warehouseOverviewRechartsTooltipProps} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {rows.map((_, index) => (
                  <Cell key={`fill-bucket-${index}`} fill={FILL_BUCKET_COLORS[index % FILL_BUCKET_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </WarehouseOverviewChartPanel>
    </WarehouseOverviewShellSection>
  )
}
