import type { ReactNode } from 'react'
import { Shirt, Utensils, Pill, Armchair } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend
} from 'recharts'
import { Card, CardContent } from '@/components/ui/card'

const rechartsTooltip = {
  contentStyle: {
    background: 'var(--wh-card-bg)',
    border: '1px solid var(--wh-border)',
    borderRadius: '8px',
    color: 'var(--wh-text-primary)',
    fontSize: 12
  } as const,
  labelStyle: { color: 'var(--wh-text-secondary)' } as const,
  itemStyle: { color: 'var(--wh-text-primary)' } as const
}

function StockSection({
  title,
  action,
  headerRight,
  children
}: {
  title: string
  action?: string
  headerRight?: ReactNode
  children: ReactNode
}) {
  return (
    <section
      className="rounded-2xl"
      style={{
        background: 'var(--wh-card-bg-soft)',
        border: '1px solid var(--wh-border)'
      }}
    >
      <div
        className="flex items-center justify-between gap-2 border-b px-4 py-3 xl:px-5"
        style={{ borderColor: 'var(--wh-border)' }}
      >
        <div
          className="min-w-0 text-sm font-semibold xl:text-base"
          style={{ color: 'var(--wh-text-primary)' }}
        >
          {title}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {action ? (
            <div className="text-[11px] xl:text-xs" style={{ color: 'var(--wh-text-muted)' }}>
              {action}
            </div>
          ) : null}
          {headerRight}
        </div>
      </div>

      <div className="p-4 xl:p-5">{children}</div>
    </section>
  )
}

function StockChartPanel({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded-2xl p-3 xl:p-4"
      style={{
        background: 'var(--wh-card-bg)',
        boxShadow: '0 8px 22px rgba(0,0,0,0.24)',
        border: '1px solid var(--wh-border)'
      }}
    >
      {children}
    </div>
  )
}

const data = [
  { parent: 'Apparel', totalOnHand: 5128, available: 2625, reserved: 882, blocked: 1621, color: '#3b82f6', icon: Shirt },
  { parent: 'Food & Beverage', totalOnHand: 6368, available: 3590, reserved: 842, blocked: 1936, color: '#22c55e', icon: Utensils },
  { parent: 'Pharmaceuticals', totalOnHand: 6921, available: 3494, reserved: 1572, blocked: 1855, color: '#a855f7', icon: Pill },
  { parent: 'Furniture', totalOnHand: 7428, available: 3991, reserved: 1084, blocked: 2353, color: '#f97316', icon: Armchair }
]

const details = {
  Apparel: [
    { name: 'Trousers', onHand: 1244, available: 612, reserved: 162, blocked: 470 },
    { name: 'Footwear', onHand: 1550, available: 887, reserved: 161, blocked: 502 },
    { name: 'Outerwear', onHand: 1102, available: 514, reserved: 277, blocked: 311 },
    { name: 'Accessories', onHand: 1232, available: 612, reserved: 282, blocked: 338 }
  ],
  'Food & Beverage': [
    { name: 'Dry Goods', onHand: 1190, available: 685, reserved: 220, blocked: 285 },
    { name: 'Canned Goods', onHand: 1081, available: 718, reserved: 173, blocked: 190 },
    { name: 'Beverages', onHand: 1333, available: 728, reserved: 142, blocked: 463 },
    { name: 'Snacks', onHand: 1379, available: 741, reserved: 223, blocked: 415 },
    { name: 'Condiments', onHand: 1385, available: 718, reserved: 84, blocked: 583 }
  ],
  Pharmaceuticals: [
    { name: 'Vitamins', onHand: 1380, available: 914, reserved: 274, blocked: 192 },
    { name: 'Antibiotics', onHand: 1573, available: 799, reserved: 300, blocked: 474 },
    { name: 'Analgesics', onHand: 1295, available: 517, reserved: 349, blocked: 429 },
    { name: 'Topicals', onHand: 1375, available: 547, reserved: 391, blocked: 437 },
    { name: 'Supplements', onHand: 1298, available: 717, reserved: 258, blocked: 323 }
  ],
  Furniture: [
    { name: 'Chairs', onHand: 1361, available: 656, reserved: 192, blocked: 513 },
    { name: 'Desks', onHand: 1876, available: 876, reserved: 313, blocked: 687 },
    { name: 'Shelving', onHand: 1569, available: 936, reserved: 168, blocked: 465 },
    { name: 'Cabinets', onHand: 1281, available: 706, reserved: 214, blocked: 361 },
    { name: 'Tables', onHand: 1341, available: 817, reserved: 197, blocked: 327 }
  ]
}

const totalOnHandAll = data.reduce((acc, d) => acc + d.totalOnHand, 0)

export function DashboardStockPage() {
  return (
    <div
      className="min-h-screen space-y-10 p-6"
      style={{ background: 'var(--wh-page-bg)', color: 'var(--wh-text-primary)' }}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Category Stock Overview</h1>
          <p className="text-sm" style={{ color: 'var(--wh-text-muted)' }}>
            Real-time summary of inventory stock across all categories
          </p>
        </div>
      </div>

      {/* SECTION 1 */}
      <div className="grid grid-cols-4 gap-6">
        {data.map((d) => {
          const Icon = d.icon

          return (
            <Card
              key={d.parent}
              className="border"
              style={{
                background: `linear-gradient(135deg, ${d.color}22, ${d.color}aa)`,
                borderColor: 'var(--wh-border)'
              }}
            >
              <CardContent className="space-y-3 p-5">
                <div
                  className="flex items-center gap-2 text-sm opacity-90"
                  style={{ color: 'var(--wh-text-primary)' }}
                >
                  <Icon size={18} /> {d.parent}
                </div>
                <div>
                  <div className="text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
                    Total On Hand
                  </div>
                  <div className="text-3xl font-bold">{d.totalOnHand.toLocaleString()}</div>
                </div>
                <div className="mt-2 flex justify-between text-xs">
                  <span style={{ color: 'var(--wh-status-available)' }}>● {d.available}</span>
                  <span style={{ color: 'var(--wh-status-full)' }}>● {d.reserved}</span>
                  <span style={{ color: 'var(--wh-status-blocked)' }}>● {d.blocked}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* SECTION 2 */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-5">
        <StockSection
          title="On-hand by category"
          action={`${totalOnHandAll.toLocaleString()} units total`}
        >
          <StockChartPanel>
            <div className="flex h-[300px]">
              <div className="flex w-1/3 flex-col justify-center space-y-3 pr-3">
                {data.map((d) => {
                  const pct = ((d.totalOnHand / totalOnHandAll) * 100).toFixed(1)

                  return (
                    <div key={d.parent} className="text-sm" style={{ color: 'var(--wh-text-primary)' }}>
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: d.color }} />
                        <span>{d.parent}</span>
                      </div>
                      <div className="ml-5 text-xs" style={{ color: 'var(--wh-text-muted)' }}>
                        {pct}% · {d.totalOnHand.toLocaleString()}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="relative w-2/3">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data} dataKey="totalOnHand" innerRadius={64} outerRadius={100}>
                      {data.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip {...rechartsTooltip} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-[10px] font-medium uppercase tracking-wide" style={{ color: 'var(--wh-text-muted)' }}>
                    Total on hand
                  </div>
                  <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--wh-text-primary)' }}>
                    {totalOnHandAll.toLocaleString()}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
                    100%
                  </div>
                </div>
              </div>
            </div>
          </StockChartPanel>
        </StockSection>

        <StockSection title="Stock breakdown" action="By status">
          <StockChartPanel>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
                  <XAxis
                    type="number"
                    stroke="var(--wh-text-muted)"
                    tick={{ fill: 'var(--wh-text-muted)', fontSize: 11 }}
                    axisLine={{ stroke: 'var(--wh-border)' }}
                  />
                  <YAxis
                    dataKey="parent"
                    type="category"
                    width={100}
                    stroke="var(--wh-text-muted)"
                    tick={{ fill: 'var(--wh-text-primary)', fontSize: 11 }}
                    axisLine={{ stroke: 'var(--wh-border)' }}
                  />
                  <Tooltip {...rechartsTooltip} />
                  <Legend
                    wrapperStyle={{ color: 'var(--wh-text-secondary)', fontSize: 12, paddingTop: 8 }}
                  />
                  <Bar dataKey="available" name="Available" stackId="a" fill="var(--wh-status-available)" />
                  <Bar dataKey="reserved" name="Reserved" stackId="a" fill="var(--wh-status-full)" />
                  <Bar dataKey="blocked" name="Blocked" stackId="a" fill="var(--wh-status-blocked)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </StockChartPanel>
        </StockSection>
      </div>

      {/* SECTION 3 */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-5">
        {Object.entries(details).map(([parent, cats]) => (
          <StockSection
            key={parent}
            title={parent}
            action={`${cats.length} subcategories`}
          >
            <StockChartPanel>
              <div
                className="mb-2 grid grid-cols-5 gap-1 text-[11px] font-medium"
                style={{ color: 'var(--wh-text-muted)' }}
              >
                <span>Sub category</span>
                <span>On hand</span>
                <span>Available</span>
                <span>Reserved</span>
                <span>Blocked</span>
              </div>
              <div className="space-y-1.5 text-sm" style={{ color: 'var(--wh-text-primary)' }}>
                {cats.map((c) => (
                  <div key={c.name} className="grid grid-cols-5 gap-1">
                    <span className="min-w-0 truncate">{c.name}</span>
                    <span className="tabular-nums">{c.onHand}</span>
                    <span className="tabular-nums" style={{ color: 'var(--wh-status-available)' }}>{c.available}</span>
                    <span className="tabular-nums" style={{ color: 'var(--wh-status-full)' }}>{c.reserved}</span>
                    <span className="tabular-nums" style={{ color: 'var(--wh-status-blocked)' }}>{c.blocked}</span>
                  </div>
                ))}
              </div>
            </StockChartPanel>
          </StockSection>
        ))}
      </div>
    </div>
  )
}
