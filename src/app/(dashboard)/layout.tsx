import { Suspense } from 'react'
import type { ReactNode } from 'react'

import DashboardShell from '@/components/dashboard/primitives/dashboard-shell'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const isDemoEnabled = process.env.IS_DEMO === 'true'
  return (
    <DashboardShell isDemoEnabled={isDemoEnabled}>
      <Suspense>
        {children}
      </Suspense>
    </DashboardShell>
  )
}
