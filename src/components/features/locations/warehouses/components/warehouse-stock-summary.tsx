'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/warehouses/components/warehouse-stock-summary.md
 */

import { useMemo } from 'react'

import {
  DashboardDonutBreakdown
} from '@/components/primitives/dashboard'
import {
  WarehouseOverviewShellSection
} from '@/components/primitives/warehouse-overview-primitives'
import type { WarehouseStockCategoryRow } from './warehouse-overview-types'

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
  const parentCategoryRows = useMemo(
    () => categories.map((category) => ({
      id: category.label,
      label: category.label,
      value: category.totalOnHand,
      color: category.color
    })),
    [categories]
  )

  return (
    <WarehouseOverviewShellSection
      title="Stock summary"
      action={
        <span className="text-xs" style={{ color: 'var(--wh-text-muted)' }}>
          {headerSuffix}
        </span>
      }
    >
      <DashboardDonutBreakdown rows={parentCategoryRows} total={totalStock} totalLabel="On hand" />
    </WarehouseOverviewShellSection>
  )
}
