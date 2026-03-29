import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-full overflow-hidden bg-[#080e1f]">
      {children}
    </div>
  )
}
