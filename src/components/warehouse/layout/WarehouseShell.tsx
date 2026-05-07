'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/warehouse/layout/warehouse-shell.md
 */


import { useState } from 'react'
import type { ReactNode } from 'react'

import { AppErrorDialog } from '@/components/shared/AppErrorDialog'
import PageWrapper from '@/components/shared/PageWrapper'
import { MoveItemsProvider } from '@/components/warehouse/layout/use-move-items'
import { WarehouseFooter } from './WarehouseFooter'
import { WarehouseHeader } from './WarehouseHeader'
import { WarehouseSidebar } from './WarehouseSidebar'

type WarehouseShellProps = { children: ReactNode }

export function WarehouseShell({ children }: WarehouseShellProps) {
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
