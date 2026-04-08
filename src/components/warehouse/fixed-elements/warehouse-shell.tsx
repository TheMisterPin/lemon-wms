'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { AppErrorDialog } from '@/components/shared/AppErrorDialog'
import PageWrapper from '@/components/shared/PageWrapper'
import { MoveItemsProvider } from '@/hooks/warehouse/use-move-items'
import WarehouseFooter from './warehouse-footer'
import WarehouseHeader from './warehouse-header'
import WarehouseSidebar from './warehouse-sidebar'

export default function WarehouseShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <MoveItemsProvider>
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
      <AppErrorDialog />
    </MoveItemsProvider>
  )
}
