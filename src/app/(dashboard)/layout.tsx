import { Suspense } from 'react'
import type { ReactNode } from 'react'

import DashboardShell from '@/components/dashboard/primitives/dashboard-shell'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell>
      <Suspense>
        {children}
      </Suspense>
    </DashboardShell>
  )
}
