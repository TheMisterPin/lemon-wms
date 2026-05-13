'use client'

import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import {
  DashboardChartPanel
} from '@/components/primitives/dashboard/dashboard-section'
import { warehouseOverviewRechartsTooltipProps } from '@/components/primitives/warehouse-overview-primitives'
import { DashboardDonutBreakdownRow, DashboardStatusBreakdownRow } from './types'

type DashboardDonutBreakdownProps = {
  rows: DashboardDonutBreakdownRow[]
  total: number
  totalLabel?: string
  valueLabel?: string
}

export function DashboardDonutBreakdown({
  rows,
  total,
  totalLabel = 'Total on hand',
  valueLabel = 'units'
}: DashboardDonutBreakdownProps) {
  return (
    <DashboardChartPanel>
      <div className="flex min-h-[300px] w-full min-w-0 flex-col gap-4 md:flex-row">
        <div className="flex flex-col justify-center gap-3 md:w-1/3 md:pr-3">
          {rows.map((row, rowIndex) => {
            const pct = total > 0 ? ((row.value / total) * 100).toFixed(1) : '0'

            return (
              <div
                key={`${row.id}-${rowIndex}`}
                className="text-sm"
                style={{ color: 'var(--wh-text-primary)' }}
              >
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: row.color }} />
                  <span className="min-w-0 truncate">{row.label}</span>
                </div>
                <div className="ml-5 text-xs" style={{ color: 'var(--wh-text-muted)' }}>
                  {pct}% · {row.value.toLocaleString()} {valueLabel}
                </div>
              </div>
            )
          })}
        </div>

        <div className="relative h-[260px] w-full min-w-0 md:w-2/3">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                id="dashboard-donut-breakdown-pie"
                data={rows}
                dataKey="value"
                nameKey="label"
                innerRadius={64}
                outerRadius={100}
              >
                {rows.map((entry, entryIndex) => (
                  <Cell key={`${entry.id}-${entryIndex}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip {...warehouseOverviewRechartsTooltipProps} />
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <div
              className="text-[10px] font-medium uppercase tracking-wide"
              style={{ color: 'var(--wh-text-muted)' }}
            >
              {totalLabel}
            </div>
            <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--wh-text-primary)' }}>
              {total.toLocaleString()}
            </div>
            <div className="text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
              100%
            </div>
          </div>
        </div>
      </div>
    </DashboardChartPanel>
  )
}

type DashboardStatusBreakdownProps = {
  rows: DashboardStatusBreakdownRow[]
}

export function DashboardStatusBreakdown({ rows }: DashboardStatusBreakdownProps) {
  return (
    <DashboardChartPanel>
      <div className="h-[300px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            layout="vertical"
            margin={{ top: 4, right: 8, left: 8, bottom: 4 }}
          >
            <XAxis
              type="number"
              stroke="var(--wh-text-muted)"
              tick={{ fill: 'var(--wh-text-muted)', fontSize: 11 }}
              axisLine={{ stroke: 'var(--wh-border)' }}
            />
            <YAxis
              dataKey="label"
              type="category"
              width={120}
              stroke="var(--wh-text-muted)"
              tick={{ fill: 'var(--wh-text-primary)', fontSize: 11 }}
              axisLine={{ stroke: 'var(--wh-border)' }}
            />
            <Tooltip {...warehouseOverviewRechartsTooltipProps} />
            <Legend wrapperStyle={{ color: 'var(--wh-text-secondary)', fontSize: 12, paddingTop: 8 }} />
            <Bar dataKey="available" name="Available" stackId="a" fill="var(--wh-status-available)" />
            <Bar dataKey="reserved" name="Reserved" stackId="a" fill="var(--wh-status-full)" />
            <Bar dataKey="blocked" name="Blocked" stackId="a" fill="var(--wh-status-blocked)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardChartPanel>
  )
}
