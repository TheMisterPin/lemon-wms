'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import PageWrapper from '@/components/shared/PageWrapper'
import DashboardFooter from './DashboardFooter'
import DashboardHeader from './DashboardHeader'
import DashboardSidebar from './DashboardSidebar'

export default function DashboardShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <PageWrapper
      header={
        <DashboardHeader
          sidebarOpen={sidebarOpen}
          onMenuToggle={() => setSidebarOpen((v) => !v)}
        />
      }
      sidebar={<DashboardSidebar onClose={() => setSidebarOpen(false)} />}
      sidebarOpen={sidebarOpen}
      footer={<DashboardFooter />}
    >
      {children}
    </PageWrapper>
  )
}
