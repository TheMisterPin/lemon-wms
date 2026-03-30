import type { ReactNode } from 'react'

import PageWrapper from '@/components/shared/PageWrapper'
import LemonHeader from '@/components/typography/lemon-header'

function WarehouseTopBar() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-brand-border bg-brand-surface px-4">
      <LemonHeader />
      <span className="text-sm font-medium text-brand-subtle">Warehouse Floor</span>
    </header>
  )
}

export default function WarehouseShell({ children }: { children: ReactNode }) {
  return (
    <PageWrapper header={<WarehouseTopBar />}>
      {children}
    </PageWrapper>
  )
}
