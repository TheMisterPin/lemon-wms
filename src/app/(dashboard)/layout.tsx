import type { ReactNode } from 'react'
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen min-w-[768px] bg-slate-50 p-4">
      <header className="mb-6 rounded border bg-white p-4 text-xl font-semibold">
Lemon WMS Dashboard
      </header>
      {children}
    </div>
  )
}
