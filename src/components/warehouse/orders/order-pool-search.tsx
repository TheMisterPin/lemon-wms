'use client'

import { WarehouseExpandableSearch } from '@/components/warehouse/primitives/warehouse-expandable-search'

type OrderPoolSearchProps = {
  value: string
  onChange: (value: string) => void
}

export function OrderPoolSearch({ value, onChange }: OrderPoolSearchProps) {
  return (
    <WarehouseExpandableSearch
      value={value}
      onChange={onChange}
      placeholder="Search orders"
      openButtonAriaLabel="Search orders"
      closeButtonAriaLabel="Close order search"
    />
  )
}
