'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/stock/category-stock-dashboard.md
 */

import Link from 'next/link'

import { WarehouseOverviewShellSection } from '@/components/primitives/warehouse-overview-primitives'
import type { CategoryStockDashboardDTO } from '@/types/category-stock-dashboard.types'

export function CategoryStockDashboard({ data }: { data: CategoryStockDashboardDTO }) {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 xl:p-6">
      <div
        className="rounded-2xl border p-5 xl:p-6"
        style={{
          background: 'var(--wh-card-bg-soft)',
          borderColor: 'var(--wh-border)'
        }}
      >
        <h1 className="text-xl font-bold xl:text-2xl" style={{ color: 'var(--wh-text-primary)' }}>
          {data.header.title}
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--wh-text-muted)' }}>
          {data.header.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {data.categoryCards.map((card) => (
          <Link
            key={card.categoryId}
            href={card.href}
            className="block rounded-xl border p-4 transition-opacity hover:opacity-90"
            style={{
              background: 'var(--wh-card-bg-soft)',
              borderColor: 'var(--wh-border)'
            }}
          >
            <p className="text-sm font-semibold" style={{ color: 'var(--wh-text-primary)' }}>
              {card.name}
            </p>
            <p className="mt-1 text-xl font-bold" style={{ color: 'var(--wh-text-primary)' }}>
              {card.totalOnHand}
            </p>
            <p className="mt-1 text-xs" style={{ color: 'var(--wh-text-muted)' }}>
              Avail {card.available} · Res {card.reserved} · Blocked {card.blocked}
            </p>
          </Link>
        ))}
      </div>

      <WarehouseOverviewShellSection title="Summary Charts">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-xl border p-4" style={{ borderColor: 'var(--wh-border)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--wh-text-primary)' }}>
              On-hand by Category
            </p>
            <div className="mt-3 space-y-2">
              {data.categoryDistribution.map((slice) => {
                const total = data.categoryDistribution.reduce((sum, row) => sum + row.totalOnHand, 0)
                const width = total > 0 ? (slice.totalOnHand / total) * 100 : 0

                return (
                  <div key={slice.categoryId}>
                    <div className="mb-1 flex items-center justify-between text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
                      <span>{slice.categoryName}</span>
                      <span>{slice.totalOnHand}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full" style={{ background: 'var(--wh-border)' }}>
                      <div className="h-full rounded-full" style={{ width: `${width}%`, background: 'var(--wh-status-available)' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-xl border p-4" style={{ borderColor: 'var(--wh-border)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--wh-text-primary)' }}>
              Stock Breakdown
            </p>
            <div className="mt-3 space-y-3">
              {data.statusBreakdown.map((row) => {
                const total = row.available + row.reserved + row.blocked
                const availableWidth = total > 0 ? (row.available / total) * 100 : 0
                const reservedWidth = total > 0 ? (row.reserved / total) * 100 : 0
                const blockedWidth = total > 0 ? (row.blocked / total) * 100 : 0

                return (
                  <div key={row.label}>
                    <div className="mb-1 flex items-center justify-between text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
                      <span>{row.label}</span>
                      <span>{total}</span>
                    </div>
                    <div className="flex h-2 overflow-hidden rounded-full" style={{ background: 'var(--wh-border)' }}>
                      <div style={{ width: `${availableWidth}%`, background: '#22c55e' }} />
                      <div style={{ width: `${reservedWidth}%`, background: '#eab308' }} />
                      <div style={{ width: `${blockedWidth}%`, background: '#ef4444' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </WarehouseOverviewShellSection>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <WarehouseOverviewShellSection title={`Subcategories (${data.subcategoryGroups.length})`}>
          <div className="space-y-4">
            {data.subcategoryGroups.map((group) => (
              <div key={group.parentCategoryId}>
                <p className="text-sm font-semibold" style={{ color: 'var(--wh-text-primary)' }}>
                  {group.parentCategoryName}
                </p>
                <div className="mt-2 space-y-2">
                  {group.rows.map((row) => (
                    <Link
                      key={row.categoryId}
                      href={row.href}
                      className="flex items-center justify-between rounded-lg border px-3 py-2 text-xs"
                      style={{
                        borderColor: 'var(--wh-border)',
                        color: 'var(--wh-text-secondary)'
                      }}
                    >
                      <span>{row.name}</span>
                      <span>{row.onHand}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </WarehouseOverviewShellSection>

        <WarehouseOverviewShellSection title={`Low Stock Items (${data.lowStockItems.length})`}>
          <div className="space-y-2">
            {data.lowStockItems.map((row) => (
              <Link
                key={row.itemId}
                href={row.href}
                className="flex items-center justify-between rounded-lg border px-3 py-2 text-xs"
                style={{
                  borderColor: 'var(--wh-border)',
                  color: 'var(--wh-text-secondary)'
                }}
              >
                <span>{row.sku}</span>
                <span>Short {row.shortage}</span>
              </Link>
            ))}
          </div>
        </WarehouseOverviewShellSection>
      </div>

      <WarehouseOverviewShellSection title={`Items (${data.items.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: 'var(--wh-text-secondary)' }}>
                <th className="pb-2 text-left font-medium">SKU</th>
                <th className="pb-2 text-left font-medium">Name</th>
                <th className="pb-2 text-left font-medium">Category</th>
                <th className="pb-2 text-left font-medium">Quantity</th>
                <th className="pb-2 text-left font-medium">Available</th>
                <th className="pb-2 text-left font-medium">Reserved</th>
                <th className="pb-2 text-left font-medium">Blocked</th>
                <th className="pb-2 text-left font-medium" />
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={item.itemId} className="border-t" style={{ borderColor: 'var(--wh-border)' }}>
                  <td className="py-2 pr-4" style={{ color: 'var(--wh-text-primary)' }}>{item.sku}</td>
                  <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{item.name}</td>
                  <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{item.categoryName}</td>
                  <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{item.quantity}</td>
                  <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{item.available}</td>
                  <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{item.reserved}</td>
                  <td className="py-2 pr-4" style={{ color: 'var(--wh-text-secondary)' }}>{item.blocked}</td>
                  <td className="py-2">
                    <Link href={item.href} className="text-xs hover:underline" style={{ color: 'var(--wh-text-secondary)' }}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </WarehouseOverviewShellSection>
    </div>
  )
}
