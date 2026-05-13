import { randomUUID } from 'crypto'

import type { Prisma } from '@/generated/prisma'
import {
  type BinOperationType,
  type ExecutionActivity,
  type OrderExecutionLineDocument,
  type OrderType
} from '@/generated/prisma'

import { LOG_ACTION_TYPES } from '@/lib/logs/action-types'
import { createUserActivityEntry } from '@/lib/logs/create-user-activity-entry'

import {
  createExecutionActivityInTx,
  loadAssignmentForActivity,
  type OrderAssignmentActivityInput
} from './order-execution.mutations'

type Tx = Prisma.TransactionClient

export type OrderStockActivityBinOperationInput = {
  userId: string
  warehouseId: string
  zoneId: string
  deviceId?: string | null
  trolleyId?: string | null
  type: BinOperationType
  fromBinId?: string | null
  toBinId?: string | null
  warItemId: string
  quantity: Prisma.Decimal
  uom: string
  lotId?: string | null
  serialNumberId?: string | null
  orderId?: string | null
  orderType?: OrderType | null
  affectsFiscalStock?: boolean
  boxId?: string | null
  notes?: string | null
  reasonCode?: string | null
}

export type RecordOrderStockActivityUserActivityInput = {
  entityType: string
  entityId: string
  metadata?: Prisma.InputJsonValue
  notes?: string | null
}

export type RecordOrderStockActivityInTxParams = {
  assignmentActivityInput: OrderAssignmentActivityInput
  activityType: ExecutionActivity
  executionLineDocument: OrderExecutionLineDocument
  executionLineId: string
  notes?: string | null
  executionActivityId?: string
  userActivity?: RecordOrderStockActivityUserActivityInput
  binOperation: OrderStockActivityBinOperationInput
}

export type RecordOrderStockActivityInTxResult = {
  orderExecutionActivityId: string
  binOperationEntryId: string
  userActivityEntryId?: string
}

/**
 * Writes UAE (optional) → OEA → BOE → OEA.binOperationEntryId in one transaction.
 * Pre-generates UUIDs so OEA and BOE can reference each other without a DB FK cycle.
 */
export async function recordOrderStockActivityInTx(
  tx: Tx,
  params: RecordOrderStockActivityInTxParams
): Promise<RecordOrderStockActivityInTxResult> {
  const orderExecutionActivityId = params.executionActivityId ?? randomUUID()
  const binOperationEntryId = randomUUID()

  const assignmentRow = await loadAssignmentForActivity(tx, params.assignmentActivityInput)

  let userActivityEntryId: string | undefined
  if (params.userActivity) {
    const uae = await createUserActivityEntry({
      prisma: tx,
      userId: params.assignmentActivityInput.userId,
      actionType: LOG_ACTION_TYPES.LINE_HANDLED,
      entityType: params.userActivity.entityType,
      entityId: params.userActivity.entityId,
      warehouseId: params.assignmentActivityInput.warehouseId,
      zoneId: assignmentRow.zoneId ?? undefined,
      orderId: params.assignmentActivityInput.orderId,
      orderType: params.assignmentActivityInput.orderType,
      orderAssignmentId: params.assignmentActivityInput.orderAssignmentId,
      metadata: params.userActivity.metadata,
      notes: params.userActivity.notes ?? undefined
    })
    userActivityEntryId = uae.id
  }

  await createExecutionActivityInTx(
    tx,
    assignmentRow,
    {
      ...params.assignmentActivityInput,
      notes: params.notes ?? params.assignmentActivityInput.notes ?? null
    },
    params.activityType,
    {
      id: orderExecutionActivityId,
      executionLineDocument: params.executionLineDocument,
      executionLineId: params.executionLineId
    }
  )

  const boe = params.binOperation

  await tx.binOperationEntry.create({
    data: {
      id: binOperationEntryId,
      userId: boe.userId,
      warehouseId: boe.warehouseId,
      zoneId: boe.zoneId,
      deviceId: boe.deviceId ?? undefined,
      trolleyId: boe.trolleyId ?? undefined,
      type: boe.type,
      fromBinId: boe.fromBinId ?? undefined,
      toBinId: boe.toBinId ?? undefined,
      warItemId: boe.warItemId,
      quantity: boe.quantity,
      uom: boe.uom,
      lotId: boe.lotId ?? undefined,
      serialNumberId: boe.serialNumberId ?? undefined,
      orderId: boe.orderId ?? params.assignmentActivityInput.orderId,
      orderType: boe.orderType ?? params.assignmentActivityInput.orderType,
      affectsFiscalStock: boe.affectsFiscalStock ?? false,
      boxId: boe.boxId ?? undefined,
      notes: boe.notes ?? undefined,
      reasonCode: boe.reasonCode ?? undefined,
      userActivityEntryId,
      orderExecutionActivityId
    }
  })

  await tx.orderExecutionActivity.update({
    where: { id: orderExecutionActivityId },
    data: { binOperationEntryId }
  })

  return {
    orderExecutionActivityId,
    binOperationEntryId,
    userActivityEntryId
  }
}
