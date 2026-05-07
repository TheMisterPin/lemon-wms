import { Suspense } from 'react'
import type { ReactNode } from 'react'

import DashboardShell from '@/components/dashboard/dashboard-shell'
import { DashboardWarehouseProvider } from '@/hooks/dashboard/locations/use-dashboard-warehouse'

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
