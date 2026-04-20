import { Suspense } from 'react'
import type { ReactNode } from 'react'

import DashboardShell from '@/components/dashboard/dashboard-shell'
import { DashboardWarehouseProvider } from '@/components/dashboard/warehouses/use-dashboard-warehouse'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell>
      <Suspense>
        <DashboardWarehouseProvider>
          {children}
        </DashboardWarehouseProvider>
      </Suspense>
    </DashboardShell>
  )
}
