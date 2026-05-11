'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/dashboard-home-search-bar.md
 */

import { Search } from 'lucide-react'

import { Input } from '@/components/ui/input'

export type DashboardHomeSearchState = {
  text: string
  setText: (text: string) => void
}

type DashboardHomeSearchBarProps = {
  search: DashboardHomeSearchState
}

export function DashboardHomeSearchBar({ search }: DashboardHomeSearchBarProps) {
  return (
    <section
      className="rounded-md w-[90%] mx-auto p-3"
      aria-label="Search dashboard"
    >
      <div className="relative min-w-0">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dash-muted" />
        <Input
          value={search.text}
          onChange={(event) => search.setText(event.target.value)}
          placeholder="Search warehouses, zones, and bins…"
          className="h-10 pl-9"
          aria-label="Search warehouses, zones, and bins"
        />
      </div>
    </section>
  )
}
