import { Suspense, type ReactNode } from 'react'

import { WarehouseShell } from '@/components/warehouse/layout/warehouse-shell'

export default function WarehouseLayout({ children }: { children: ReactNode }) {
  const isDemoEnabled = process.env.IS_DEMO === 'true'

  return (
    <WarehouseShell isDemoEnabled={isDemoEnabled}>
      <Suspense>
        {children}
      </Suspense>
    </WarehouseShell>
  )
}
