'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/dashboard-shell.md
 */

import type { ReactNode } from 'react'

import { AppErrorDialog } from '@/components/shared/app-error-dialog'
import PageWrapper from '@/components/shared/page-wrapper'
import { useResponsiveSidebarOpen } from '@/hooks/use-responsive-sidebar-open'
import DashboardFooter from './dashboard-footer'
import DashboardHeader from './dashboard-header'
import DashboardSidebar from './dashboard-sidebar'

export default function DashboardShell({ children, isDemoEnabled }: { children: ReactNode; isDemoEnabled?: boolean }) {
  const [sidebarOpen, setSidebarOpen] = useResponsiveSidebarOpen()

  return (
    <>
      <PageWrapper
        header={
          <DashboardHeader
            sidebarOpen={sidebarOpen}
            onMenuToggle={() => setSidebarOpen((v) => !v)}
          />
        }
        sidebar={
          <DashboardSidebar
            isDemoEnabled={isDemoEnabled}
            isExpanded={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onToggleCollapse={() => setSidebarOpen((v) => !v)}
          />
        }
        sidebarOpen={sidebarOpen}
        footer={<DashboardFooter isDemoEnabled={isDemoEnabled} />}
      >
        {children}
      </PageWrapper>
      <AppErrorDialog />
    </>
  )
}
