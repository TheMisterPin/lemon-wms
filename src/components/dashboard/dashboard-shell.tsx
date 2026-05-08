'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/dashboard-shell.md
 */

import type { ReactNode } from 'react'

import { AppErrorDialog } from '@/components/shared/app-error-dialog'
import PageWrapper from '@/components/shared/page-wrapper'
import DashboardFooter from './dashboard-footer'
import DashboardHeader from './dashboard-header'
import DashboardSidebar from './dashboard-sidebar'

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
