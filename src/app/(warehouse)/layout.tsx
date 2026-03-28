import type { ReactNode } from 'react'

export default function WarehouseLayout({ children }: { children: ReactNode }) {
  return (
    <div className="terminal-scanline min-h-screen min-w-[375px] p-4 font-[family-name:var(--font-terminal)] text-terminal-text">
      <header className="mb-6 border border-terminal-border bg-terminal-surface p-4">
        <div className="flex items-baseline gap-3">
          <span className="font-[family-name:var(--font-terminal-label)] text-[0.6rem] uppercase tracking-[0.2em] text-terminal-text-dim">
            LEMON WMS
          </span>
          <span className="font-[family-name:var(--font-terminal-label)] text-[0.55rem] uppercase tracking-[0.15em] text-terminal-text-dim">
            //
          </span>
          <span className="text-sm font-bold uppercase tracking-[0.05em] text-terminal-accent">
            WAREHOUSE FLOOR
          </span>
        </div>
      </header>
      {children}
    </div>
  )
}
