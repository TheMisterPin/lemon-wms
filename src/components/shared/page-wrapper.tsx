/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/shared/page-wrapper.md
 */

import type { ReactNode } from 'react'

interface PageWrapperProps {
  header?: ReactNode
  footer?: ReactNode
  sidebar?: ReactNode
  sidebarOpen?: boolean
  children: ReactNode
}

export default function PageWrapper({
  header,
  footer,
  sidebar,
  sidebarOpen = false,
  children
}: PageWrapperProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-dash-bg text-dash-text">
      {header && <div className="shrink-0">{header}</div>}

      <div className="flex flex-1 overflow-hidden">
        {sidebar && (
          <div
            className={`shrink-0 overflow-hidden transition-all duration-200 ease-in-out ${
              sidebarOpen ? 'w-64' : 'w-0'
            }`}
          >
            {sidebar}
          </div>
        )}

        <main className="min-w-0 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {footer && <div className="shrink-0">{footer}</div>}
    </div>
  )
}
