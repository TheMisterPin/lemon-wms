'use client'
import type { ReactNode } from 'react'

import { AppErrorDialog } from '@/components/shared/AppErrorDialog'
import PageWrapper from '@/components/shared/PageWrapper'
import DashboardFooter from './dashboard-footer'
import DashboardHeader from './dashboard-header'
import DashboardSidebar from './stock/dashboard-sidebar'

export default function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <>
      <PageWrapper
        header={<DashboardHeader />}
        sidebar={<DashboardSidebar />}
        sidebarOpen
        footer={<DashboardFooter />}
      >
        {children}
      </PageWrapper>
      <AppErrorDialog />
    </>
  )
}
