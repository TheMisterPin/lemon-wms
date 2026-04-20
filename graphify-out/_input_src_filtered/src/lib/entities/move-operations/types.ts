import type { Item, OrderType, PrismaClient } from '@/generated/prisma'

export type ItemRef = Pick<Item, 'id' | 'uom' | 'name' | 'sku'>

export type BaseOperationArgs = {
  prisma: PrismaClient
  item: ItemRef
  userId: string
  warehouseId: string
  quantity: number
  lotId?: string
  serialNumberId?: string
  orderId?: string
  orderType?: OrderType
  reasonCode?: string
  notes?: string
}

export type AdjustmentOperationArgs = BaseOperationArgs & {
  operation: 'adjustment'
  binId: string
}

export type MovementOperationArgs = BaseOperationArgs & {
  operation: 'movement'
  fromBinId: string
  toBinId: string
}

export type CreateBinOperationsFromItemArgs = AdjustmentOperationArgs | MovementOperationArgs

export type AddItemsToBinArgs = Omit<AdjustmentOperationArgs, 'operation'>

export type RemoveItemsFromBinArgs = BaseOperationArgs & {
  binStockItemId: string
}

export type LoadItemsToTrolleyArgs = {
  prisma: PrismaClient
  userId: string
  warehouseId: string
  deviceId: string
  sourceBinStockItemId: string
  quantity: number
}

export type UnloadTrolleySelection = {
  transitBinStockItemId: string
  quantity?: number
}

export type UnloadItemsFromTrolleyArgs = {
  prisma: PrismaClient
  userId: string
  warehouseId: string
  toBinId: string
  selections: UnloadTrolleySelection[]
}

export type TrolleyItemRecord = {
  id: string
  sourceBinId: string
  sourceBinName: string
  sourceBinCode: string
  itemId: string
  description: string
  lotId: string | null
  serialNumberId: string | null
  uom: string
  quantityAvailable: number
}
