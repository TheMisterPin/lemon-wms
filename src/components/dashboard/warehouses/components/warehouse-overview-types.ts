export type WarehouseStockCategoryRow = {
  label: string
  totalOnHand: number
  available: number
  reserved: number
  blocked: number
  color: string
}

export type WarehouseOrderTypeRow = {
  type: string
  released: number
  assigned: number
  active: number
  paused: number
  completed: number
  exceptions: number
}

export type WarehouseZoneSummaryRow = {
  id: string
  name: string
  type: string
  onHand: number
  available: number
  reserved: number
  blocked: number
  fill: number
}

export type WarehouseActivityRow = {
  id: string
  time: string
  user: string
  action: string
  entity: string
  status: 'SUCCESS' | 'WARNING' | 'FAILED'
}
