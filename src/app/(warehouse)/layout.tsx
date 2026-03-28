import type { ReactNode } from 'react'
export default function WarehouseLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen min-w-[375px] bg-zinc-950 p-4 text-zinc-100">
      <header className="mb-6 rounded border border-zinc-800 bg-zinc-900 p-4 text-2xl font-bold">
Warehouse Floor
      </header>
      {children}
    </div>
  )
}
