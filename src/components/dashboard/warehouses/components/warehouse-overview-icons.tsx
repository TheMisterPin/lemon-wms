'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/warehouses/components/warehouse-overview-icons.md
 */


import type { ComponentProps, ComponentType } from 'react'

export type WarehouseOverviewIconProps = ComponentProps<'span'>

export function WarehouseOverviewIconGlyph({
  children,
  className = '',
  ...rest
}: WarehouseOverviewIconProps) {
  return (
    <span
      className={`inline-flex h-8 w-8 items-center justify-center text-lg font-bold ${className}`}
      {...rest}
    >
      {children}
    </span>
  )
}

/** Glyph icons for warehouse dashboard overview KPIs and order workload. */
export const warehouseOverviewIcons: Record<string, ComponentType<WarehouseOverviewIconProps>> = {
  devices: (props) => <WarehouseOverviewIconGlyph {...props}>▤</WarehouseOverviewIconGlyph>,
  users: (props) => <WarehouseOverviewIconGlyph {...props}>♟</WarehouseOverviewIconGlyph>,
  orders: (props) => <WarehouseOverviewIconGlyph {...props}>☷</WarehouseOverviewIconGlyph>,
  stock: (props) => <WarehouseOverviewIconGlyph {...props}>▦</WarehouseOverviewIconGlyph>,
  exceptions: (props) => <WarehouseOverviewIconGlyph {...props}>!</WarehouseOverviewIconGlyph>,
  warehouse: (props) => <WarehouseOverviewIconGlyph {...props}>⌂</WarehouseOverviewIconGlyph>,
  active: (props) => <WarehouseOverviewIconGlyph {...props}>↯</WarehouseOverviewIconGlyph>,
  clock: (props) => <WarehouseOverviewIconGlyph {...props}>◷</WarehouseOverviewIconGlyph>,
  check: (props) => <WarehouseOverviewIconGlyph {...props}>✓</WarehouseOverviewIconGlyph>,
  search: (props) => <WarehouseOverviewIconGlyph {...props}>⌕</WarehouseOverviewIconGlyph>,
  assigned: (props) => <WarehouseOverviewIconGlyph {...props}>●</WarehouseOverviewIconGlyph>
}
