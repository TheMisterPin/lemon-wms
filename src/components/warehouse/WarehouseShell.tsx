'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import PageWrapper from '@/components/shared/PageWrapper'
import WarehouseHeader from './WarehouseHeader'
import WarehouseFooter from './WarehouseFooter'
import WarehouseSidebar from './WarehouseSidebar'

export default function WarehouseShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <PageWrapper
      header={
        <WarehouseHeader
          sidebarOpen={sidebarOpen}
          onMenuToggle={() => setSidebarOpen((v) => !v)}
        />
      }
      sidebar={<WarehouseSidebar onClose={() => setSidebarOpen(false)} />}
      sidebarOpen={sidebarOpen}
      footer={<WarehouseFooter />}
    >
      {children}
    </PageWrapper>
  )
}
