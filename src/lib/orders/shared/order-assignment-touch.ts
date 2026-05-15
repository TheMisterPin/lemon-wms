import type { OrderType, PrismaClient } from '@/generated/prisma'

type AssignmentTouchRow = {
  assignedAt: Date
  startedAt: Date | null
  pausedAt: Date | null
  releasedAt: Date | null
  completedAt: Date | null
  cancelledAt: Date | null
  timedOutAt: Date | null
}

export function latestOrderAssignmentTouch(row: AssignmentTouchRow): Date {
  let latestMs = row.assignedAt.getTime()
  const dates = [
    row.startedAt,
    row.pausedAt,
    row.releasedAt,
    row.completedAt,
    row.cancelledAt,
    row.timedOutAt
  ]

  for (const date of dates) {
    if (date && date.getTime() > latestMs) {
      latestMs = date.getTime()
    }
  }

  return new Date(latestMs)
}

export type ActiveOrderAssignmentTouch = {
  assignedUserId: string
  /** Active assignment row id (for POST handle / receipt complete). */
  orderAssignmentId: string
  lastActiveAt: string
  pausedAt: string | null
}

export async function loadActiveOrderAssignmentIndex(
  prisma: PrismaClient,
  warehouseId: string,
  orderTypes: OrderType[]
): Promise<Map<string, ActiveOrderAssignmentTouch>> {
  const assignments = await prisma.orderAssignment.findMany({
    where: {
      warehouseId,
      orderType: { in: orderTypes },
      isActive: true
    },
    select: {
      id: true,
      orderId: true,
      orderType: true,
      userId: true,
      assignedAt: true,
      startedAt: true,
      pausedAt: true,
      releasedAt: true,
      completedAt: true,
      cancelledAt: true,
      timedOutAt: true
    },
    orderBy: { assignedAt: 'desc' }
  })

  const map = new Map<string, ActiveOrderAssignmentTouch>()

  for (const assignment of assignments) {
    const key = `${assignment.orderType}:${assignment.orderId}`

    if (!map.has(key)) {
      map.set(key, {
        assignedUserId: assignment.userId,
        orderAssignmentId: assignment.id,
        lastActiveAt: latestOrderAssignmentTouch(assignment).toISOString(),
        pausedAt: assignment.pausedAt?.toISOString() ?? null
      })
    }
  }

  return map
}
