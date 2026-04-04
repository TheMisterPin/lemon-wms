import type {
  BinOperationType,
  FiscalInventoryEventType,
  Item
} from '@/generated/prisma'

interface BinOperationBaseParams {
  warItemId: string
  uom: string
  lotId?: string
  serialNumberId?: string
}

interface MovementBinOperationParams extends BinOperationBaseParams {
  quantity: number
  fromBinId: string
  toBinId: string
}

interface AdjustmentBinOperationParams extends BinOperationBaseParams {
  quantity: number
  binId: string
}

function normalizeQuantity(quantity: number): number {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error('Quantity must be a positive number')
  }

  return Math.abs(quantity)
}

function getBinOperationBaseParams(
  item: Pick<Item, 'id' | 'uom'>,
  identifiers?: { lotId?: string; serialNumberId?: string }
): BinOperationBaseParams {
  return {
    warItemId: item.id,
    uom: item.uom,
    lotId: identifiers?.lotId,
    serialNumberId: identifiers?.serialNumberId
  }
}

function getMovementBinOperationParams(
  item: Pick<Item, 'id' | 'uom'>,
  args: {
    quantity: number
    fromBinId: string
    toBinId: string
    lotId?: string
    serialNumberId?: string
  }
): MovementBinOperationParams {
  if (!args.fromBinId || !args.toBinId) {
    throw new Error('Movement requires fromBinId and toBinId')
  }

  return {
    ...getBinOperationBaseParams(item, {
      lotId: args.lotId,
      serialNumberId: args.serialNumberId
    }),
    quantity: normalizeQuantity(args.quantity),
    fromBinId: args.fromBinId,
    toBinId: args.toBinId
  }
}

function getAdjustmentBinOperationParams(
  item: Pick<Item, 'id' | 'uom'>,
  args: {
    quantity: number
    binId: string
    lotId?: string
    serialNumberId?: string
  }
): AdjustmentBinOperationParams {
  if (!args.binId) {
    throw new Error('Adjustment requires binId')
  }

  return {
    ...getBinOperationBaseParams(item, {
      lotId: args.lotId,
      serialNumberId: args.serialNumberId
    }),
    quantity: normalizeQuantity(args.quantity),
    binId: args.binId
  }
}

function mapMovementLedgerEvent(sign: 'positive' | 'negative'): FiscalInventoryEventType {
  return sign === 'positive' ? 'TRANSFER_IN' : 'TRANSFER_OUT'
}

function mapAdjustmentLedgerEvent(sign: 'positive' | 'negative'): FiscalInventoryEventType {
  return sign === 'positive' ? 'ADJUSTMENT_IN' : 'ADJUSTMENT_OUT'
}

function resolveOperationType(kind: 'movement' | 'adjustment'): BinOperationType {
  return kind === 'movement' ? 'MOVE' : 'ADJUST'
}

export {
  getAdjustmentBinOperationParams,
  getBinOperationBaseParams,
  getMovementBinOperationParams,
  mapAdjustmentLedgerEvent,
  mapMovementLedgerEvent,
  normalizeQuantity,
  resolveOperationType
}

export type {
  AdjustmentBinOperationParams,
  BinOperationBaseParams,
  MovementBinOperationParams
}
