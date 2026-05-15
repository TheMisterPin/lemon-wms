export type WarehouseOperationalOrderKind = 'purchase' | 'sales' | 'transfer'

export function parseWarehouseOperationalOrderKind(segment: string): WarehouseOperationalOrderKind | null {
  const s = segment?.trim().toLowerCase()

  if (s === 'purchase' || s === 'sales' || s === 'transfer') {
    return s
  }

  return null
}
