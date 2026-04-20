import { Suspense, type ReactNode } from 'react'

import { WarehouseShell } from '@/components/warehouse/layout/WarehouseShell'

export default function WarehouseLayout({ children }: { children: ReactNode }) {
  return (
    <WarehouseShell>
      <Suspense>
        {children}
      </Suspense>
    </WarehouseShell>
  )
}
