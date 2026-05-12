import { Suspense } from 'react'
import type { ReactNode } from 'react'

import DashboardApolloProvider from '@/components/dashboard/primitives/apollo-provider'
import DashboardShell from '@/components/dashboard/primitives/dashboard-shell'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardApolloProvider>
      <DashboardShell>
        <Suspense>
          {children}
        </Suspense>
      </DashboardShell>
    </DashboardApolloProvider>
  )
}
