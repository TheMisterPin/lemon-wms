import type { OrderType, Prisma, PrismaClient } from '@/generated/prisma'

import type { LogActionType } from './action-types'

type CreateUserActivityEntryParams = {
  prisma: PrismaClient | Prisma.TransactionClient
  userId: string
  actionType: LogActionType
  entityType: string
  entityId: string
  warehouseId?: string
  zoneId?: string
  deviceId?: string
  trolleyId?: string
  orderId?: string
  orderType?: OrderType
  orderAssignmentId?: string
  metadata?: Prisma.InputJsonValue
  ipAddress?: string
  notes?: string
}

export async function createUserActivityEntry(params: CreateUserActivityEntryParams) {
  const {
    prisma,
    userId,
    actionType,
    entityType,
    entityId,
    warehouseId,
    zoneId,
    deviceId,
    trolleyId,
    orderId,
    orderType,
    orderAssignmentId,
    metadata,
    ipAddress,
    notes
  } = params

  return prisma.userActivityEntry.create({
    data: {
      userId,
      actionType,
      entityType,
      entityId,
      warehouseId,
      zoneId,
      deviceId,
      trolleyId,
      orderId,
      orderType,
      orderAssignmentId,
      metadata,
      ipAddress,
      notes
    }
  })
}
