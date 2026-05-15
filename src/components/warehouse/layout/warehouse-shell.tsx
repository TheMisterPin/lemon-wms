'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/warehouse/layout/warehouse-shell.md
 */

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

import { AppErrorDialog } from '@/components/shared/app-error-dialog'
import PageWrapper from '@/components/shared/page-wrapper'
import { MoveItemsProvider } from '@/components/warehouse/layout/use-move-items'
import { useResponsiveSidebarOpen } from '@/hooks/use-responsive-sidebar-open'
import { WarehouseFooter } from './warehouse-footer'
import { WarehouseHeader } from './warehouse-header'
import { WarehouseSidebar } from './warehouse-sidebar'

type WarehouseShellProps = { children: ReactNode; isDemoEnabled?: boolean }

export function WarehouseShell({ children, isDemoEnabled }: WarehouseShellProps) {
  const [sidebarOpen, setSidebarOpen] = useResponsiveSidebarOpen()
  const pathname = usePathname()
  const isBinDetailRoute = /^\/warehouse\/bins\/[^/]+$/.test(pathname)
  const isFixedHeightRoute =
    pathname === '/warehouse'
    || /^\/warehouse\/orders(\/.*)?$/.test(pathname)
    || isBinDetailRoute

  return (
    <MoveItemsProvider>
      <PageWrapper
        header={
          <WarehouseHeader
            sidebarOpen={sidebarOpen}
            onMenuToggle={() => setSidebarOpen((v) => !v)}
          />
        }
        sidebar={
          <WarehouseSidebar
            isExpanded={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onToggleCollapse={() => setSidebarOpen((v) => !v)}
          />
        }
        sidebarOpen={sidebarOpen}
        footer={<WarehouseFooter isDemoEnabled={isDemoEnabled} />}
        contentClassName={isFixedHeightRoute ? 'md:overflow-hidden' : undefined}
      >
        {children}
      </PageWrapper>
      <AppErrorDialog />
    </MoveItemsProvider>
  )
}
