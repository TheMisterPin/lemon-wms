import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-full overflow-hidden bg-brand-bg">
      {children}
    </div>
  )
}
