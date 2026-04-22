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

export  function DashboardStockPageView() {
  return (
    <div className="p-6 space-y-10 bg-slate-950 min-h-screen text-white">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Category Stock Overview</h1>
          <p className="text-sm text-slate-400">Real-time summary of inventory stock across all categories</p>
        </div>
      </div>

      {/* SECTION 1 */}
      <div className="grid grid-cols-4 gap-6">
        {data.map((d) => {
          const Icon = d.icon

          return (
            <Card
              key={d.parent}
              className="border-none"
              style={{ background: `linear-gradient(135deg, ${d.color}22, ${d.color}aa)` }}
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm opacity-90">
                  <Icon size={18} /> {d.parent}
                </div>
                <div>
                  <div className="text-xs text-slate-300">Total On Hand</div>
                  <div className="text-3xl font-bold">{d.totalOnHand.toLocaleString()}</div>
                </div>
                <div className="flex justify-between text-xs mt-2">
                  <span className="text-green-400">● {d.available}</span>
                  <span className="text-yellow-400">● {d.reserved}</span>
                  <span className="text-red-400">● {d.blocked}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* SECTION 2 */}
      <div className="grid grid-cols-2 gap-6">
        {/* Donut + legend left */}
        <Card className="bg-slate-900 border-none">
          <CardContent className="p-4 h-[320px] flex">
            {/* Legend */}
            <div className="w-1/3 pr-4 flex flex-col justify-center space-y-3">
              {data.map((d) => {
                const pct = ((d.totalOnHand / totalOnHandAll) * 100).toFixed(1)

                return (
                  <div key={d.parent} className="text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                      <span>{d.parent}</span>
                    </div>
                    <div className="text-slate-400 text-xs ml-5">
                      {pct}% · {d.totalOnHand.toLocaleString()}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Donut */}
            <div className="w-2/3 relative">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={data} dataKey="totalOnHand" innerRadius={70} outerRadius={110}>
                    {data.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-xs text-slate-400">TOTAL ON HAND</div>
                <div className="text-2xl font-bold">{totalOnHandAll.toLocaleString()}</div>
                <div className="text-xs text-slate-500">100%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bars */}
        <Card className="bg-slate-900 border-none">
          <CardContent className="p-4 h-[320px]">
            <h2 className="text-sm mb-2 text-slate-400">Stock Breakdown</h2>
            <ResponsiveContainer>
              <BarChart data={data} layout="vertical">
                <XAxis type="number" stroke="#64748b" />
                <YAxis dataKey="parent" type="category" stroke="#64748b" />
                <Tooltip />
                <Legend />
                <Bar dataKey="available" stackId="a" fill="#22c55e" />
                <Bar dataKey="reserved" stackId="a" fill="#eab308" />
                <Bar dataKey="blocked" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 3 */}
      <div className="grid grid-cols-2 gap-6">
        {Object.entries(details).map(([parent, cats]) => (
          <Card key={parent} className="bg-slate-900 border-none">
            <CardContent className="p-4">
              <div className="font-semibold mb-3">{parent}</div>
              <div className="text-xs text-slate-400 grid grid-cols-5 mb-2">
                <span>Sub Category</span>
                <span>On Hand</span>
                <span>Available</span>
                <span>Reserved</span>
                <span>Blocked</span>
              </div>
              <div className="space-y-1 text-sm">
                {cats.map((c) => (
                  <div key={c.name} className="grid grid-cols-5">
                    <span>{c.name}</span>
                    <span>{c.onHand}</span>
                    <span className="text-green-400">{c.available}</span>
                    <span className="text-yellow-400">{c.reserved}</span>
                    <span className="text-red-400">{c.blocked}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
