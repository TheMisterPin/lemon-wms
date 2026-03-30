import type { ReactNode } from 'react'

import WarehouseShell from '@/components/warehouse/WarehouseShell'

export default function WarehouseLayout({ children }: { children: ReactNode }) {
  return <WarehouseShell>{children}</WarehouseShell>
}
