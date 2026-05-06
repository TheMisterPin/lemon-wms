'use client'

import type { WarehouseStockDashboardItemRow } from '@/types/warehouse-stock-dashboard.types'
import {
  WarehouseOverviewButton,
  WarehouseOverviewShellSection
} from './warehouse-overview-primitives'

type WarehouseStockItemsTableProps = {
  items: WarehouseStockDashboardItemRow[]
}

export function WarehouseStockItemsTable({ items }: WarehouseStockItemsTableProps) {
  return (
    <WarehouseOverviewShellSection
      title="Item stock summary"
      action={
        <WarehouseOverviewButton variant="ghost" size="sm">
          Export
        </WarehouseOverviewButton>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottomColor: 'var(--wh-border)' }} className="border-b">
              <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--wh-text-muted)' }}>
                SKU
              </th>
              <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--wh-text-muted)' }}>
                Name
              </th>
              <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--wh-text-muted)' }}>
                Category
              </th>
              <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--wh-text-muted)' }}>
                UoM
              </th>
              <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--wh-text-muted)' }}>
                On hand
              </th>
              <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--wh-text-muted)' }}>
                Available
              </th>
              <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--wh-text-muted)' }}>
                Reserved
              </th>
              <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--wh-text-muted)' }}>
                Blocked
              </th>
              <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--wh-text-muted)' }}>
                Bins
              </th>
              <th className="px-4 py-3 text-center font-medium" style={{ color: 'var(--wh-text-muted)' }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.itemId}
                style={{ borderBottomColor: 'var(--wh-border)' }}
                className="border-b hover:opacity-75"
              >
                <td className="px-4 py-3 font-mono text-xs font-medium">{item.sku}</td>
                <td className="px-4 py-3 font-medium">{item.name}</td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--wh-text-muted)' }}>
                  {item.categoryName}
                </td>
                <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--wh-text-muted)' }}>
                  {item.uom}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{item.totalOnHand.toLocaleString()}</td>
                <td
                  className="px-4 py-3 text-right tabular-nums"
                  style={{ color: 'var(--wh-status-available, #22c55e)' }}
                >
                  {item.available.toLocaleString()}
                </td>
                <td
                  className="px-4 py-3 text-right tabular-nums"
                  style={{ color: 'var(--wh-status-full, #eab308)' }}
                >
                  {item.reserved.toLocaleString()}
                </td>
                <td
                  className="px-4 py-3 text-right tabular-nums"
                  style={{ color: 'var(--wh-status-blocked, #ef4444)' }}
                >
                  {item.blocked.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{item.binsCount}</td>
                <td className="px-4 py-3 text-center">
                  <WarehouseOverviewButton variant="ghost" size="sm">
                    View
                  </WarehouseOverviewButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </WarehouseOverviewShellSection>
  )
}
