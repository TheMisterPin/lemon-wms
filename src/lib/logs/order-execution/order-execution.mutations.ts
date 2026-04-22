import type { Prisma, PrismaClient } from '@/generated/prisma'
import { AssignmentLifecycle, ExecutionActivity, type OrderType } from '@/generated/prisma'

import { DomainError } from '@/lib/errors'

import {
  mapOrderAssignmentToDetailDTO,
  mapOrderExecutionActivityToListItemDTO,
  orderAssignmentDetailSelect,
  orderExecutionActivityListSelect,
  type OrderAssignmentDetailRow,
  type OrderExecutionActivityListRow
} from './order-execution.helpers'
import {
  assertExecutionActivityAllowedForAssignmentStatus,
  assertOrderAssignmentExists,
  assertOrderAssignmentBelongsToUser,
  assertOrderAssignmentMatchesOrderContext,
  assertOrderAssignmentMatchesWarehouse,
  assertValidAssignmentTransition
} from './order-execution.mutation-helpers'
import type { OrderAssignmentMutationResultDTO, OrderExecutionActivityMutationResultDTO } from './order-execution.types'

const DUPLICATE_ACTIVE_SESSION = 'An active order assignment already exists for this user, order, and order type.'

type Tx = Prisma.TransactionClient

export type OrderAssignmentCommandBase = {
  orderAssignmentId: string
  userId: string
  warehouseId: string
}

function toAssignmentResult(row: OrderAssignmentDetailRow): OrderAssignmentMutationResultDTO {
  return { assignment: mapOrderAssignmentToDetailDTO(row) }
}

function toActivityResult(
  assignmentRow: OrderAssignmentDetailRow,
  activityRow: OrderExecutionActivityListRow
): OrderExecutionActivityMutationResultDTO {
  return {
    assignment: mapOrderAssignmentToDetailDTO(assignmentRow),
    activity: mapOrderExecutionActivityToListItemDTO(activityRow)
  }
}

async function loadOrderAssignmentInTx(tx: Tx, id: string): Promise<OrderAssignmentDetailRow> {
  const row = await tx.orderAssignment.findUnique({
    where: { id },
    select: orderAssignmentDetailSelect
  })
  assertOrderAssignmentExists(row)

  return row
}

/**
 * `OrderAssignment` is unique on (orderType, orderId, userId): only one record per user per order.
 * New work after an inactive session is expressed by updating that row in place (cannot insert again).
 */
async function assertLifecycleCommand(
  tx: Tx,
  input: OrderAssignmentCommandBase
): Promise<OrderAssignmentDetailRow> {
  const a = await loadOrderAssignmentInTx(tx, input.orderAssignmentId)
  assertOrderAssignmentBelongsToUser(a, input.userId)
  assertOrderAssignmentMatchesWarehouse(a, input.warehouseId)

  return a
}

type OrderAssignmentActivityInput = OrderAssignmentCommandBase & {
  orderId: string
  orderType: OrderType
  orderLineRefId: string | null
  notes?: string | null
}

async function loadAssignmentForActivity(
  tx: Tx,
  input: OrderAssignmentActivityInput
): Promise<OrderAssignmentDetailRow> {
  const a = await loadOrderAssignmentInTx(tx, input.orderAssignmentId)
  assertOrderAssignmentBelongsToUser(a, input.userId)
  assertOrderAssignmentMatchesWarehouse(a, input.warehouseId)
  assertOrderAssignmentMatchesOrderContext(a, input.orderId, input.orderType)
  assertExecutionActivityAllowedForAssignmentStatus(a)

  return a
}

async function createExecutionActivityInTx(
  tx: Tx,
  a: OrderAssignmentDetailRow,
  input: OrderAssignmentActivityInput,
  activityType: ExecutionActivity
): Promise<OrderExecutionActivityListRow> {
  return tx.orderExecutionActivity.create({
    data: {
      orderAssignmentId: a.id,
      userId: input.userId,
      warehouseId: a.warehouseId,
      orderId: a.orderId,
      orderType: a.orderType,
      orderLineRefId: input.orderLineRefId,
      activityType,
      notes: input.notes ?? null
    },
    select: orderExecutionActivityListSelect
  })
}

// =============================================================================
// Section 1 — Assignment lifecycle
// =============================================================================

export type AssignOrderToUserInput = {
  orderId: string
  orderType: OrderType
  warehouseId: string
  userId: string
  notes?: string | null
}

export async function assignOrderToUser(
  prisma: PrismaClient,
  input: AssignOrderToUserInput
): Promise<OrderAssignmentMutationResultDTO> {
  const { orderId, orderType, warehouseId, userId, notes } = input

  return prisma.$transaction(async (tx) => {
    const activeDupe = await tx.orderAssignment.findFirst({
      where: { orderId, orderType, userId, isActive: true }
    })
    if (activeDupe) {
      throw new DomainError(DUPLICATE_ACTIVE_SESSION, 'CONFLICT', 409)
    }

    const existing = await tx.orderAssignment.findFirst({
      where: { orderId, orderType, userId }
    })

    if (!existing) {
      const created = await tx.orderAssignment.create({
        data: {
          orderId,
          orderType,
          warehouseId,
          userId,
          status: AssignmentLifecycle.ASSIGNED,
          isActive: true,
          notes: notes ?? null
        },
        select: orderAssignmentDetailSelect
      })

      return toAssignmentResult(created)
    }

    const now = new Date()
    const updated = await tx.orderAssignment.update({
      where: { id: existing.id },
      data: {
        status: AssignmentLifecycle.ASSIGNED,
        warehouseId,
        isActive: true,
        assignedAt: now,
        startedAt: null,
        pausedAt: null,
        releasedAt: null,
        completedAt: null,
        cancelledAt: null,
        timedOutAt: null,
        notes: notes === undefined ? existing.notes : notes
      },
      select: orderAssignmentDetailSelect
    })

    return toAssignmentResult(updated)
  })
}

export async function startOrderAssignment(
  prisma: PrismaClient,
  input: OrderAssignmentCommandBase
): Promise<OrderAssignmentMutationResultDTO> {
  return prisma.$transaction(async (tx) => {
    const a = await assertLifecycleCommand(tx, input)
    assertValidAssignmentTransition(a.status, AssignmentLifecycle.STARTED)

    const now = new Date()
    const updated = await tx.orderAssignment.update({
      where: { id: a.id },
      data: {
        status: AssignmentLifecycle.STARTED,
        ...(a.startedAt === null ? { startedAt: now } : {})
      },
      select: orderAssignmentDetailSelect
    })

    return toAssignmentResult(updated)
  })
}

export async function pauseOrderAssignment(
  prisma: PrismaClient,
  input: OrderAssignmentCommandBase
): Promise<OrderAssignmentMutationResultDTO> {
  return prisma.$transaction(async (tx) => {
    const a = await assertLifecycleCommand(tx, input)
    assertValidAssignmentTransition(a.status, AssignmentLifecycle.PAUSED)

    const now = new Date()
    const updated = await tx.orderAssignment.update({
      where: { id: a.id },
      data: {
        status: AssignmentLifecycle.PAUSED,
        pausedAt: now
      },
      select: orderAssignmentDetailSelect
    })

    return toAssignmentResult(updated)
  })
}

export async function resumeOrderAssignment(
  prisma: PrismaClient,
  input: OrderAssignmentCommandBase
): Promise<OrderAssignmentMutationResultDTO> {
  return prisma.$transaction(async (tx) => {
    const a = await assertLifecycleCommand(tx, input)
    assertValidAssignmentTransition(a.status, AssignmentLifecycle.RESUMED)

    const updated = await tx.orderAssignment.update({
      where: { id: a.id },
      data: {
        status: AssignmentLifecycle.RESUMED
      },
      select: orderAssignmentDetailSelect
    })

    return toAssignmentResult(updated)
  })
}

export async function completeOrderAssignment(
  prisma: PrismaClient,
  input: OrderAssignmentCommandBase
): Promise<OrderAssignmentMutationResultDTO> {
  return prisma.$transaction(async (tx) => {
    const a = await assertLifecycleCommand(tx, input)
    assertValidAssignmentTransition(a.status, AssignmentLifecycle.COMPLETED)

    const now = new Date()
    const updated = await tx.orderAssignment.update({
      where: { id: a.id },
      data: {
        status: AssignmentLifecycle.COMPLETED,
        completedAt: now,
        isActive: false
      },
      select: orderAssignmentDetailSelect
    })

    return toAssignmentResult(updated)
  })
}

export async function releaseOrderAssignment(
  prisma: PrismaClient,
  input: OrderAssignmentCommandBase
): Promise<OrderAssignmentMutationResultDTO> {
  return prisma.$transaction(async (tx) => {
    const a = await assertLifecycleCommand(tx, input)
    assertValidAssignmentTransition(a.status, AssignmentLifecycle.RELEASED)

    const now = new Date()
    const updated = await tx.orderAssignment.update({
      where: { id: a.id },
      data: {
        status: AssignmentLifecycle.RELEASED,
        releasedAt: now,
        isActive: false
      },
      select: orderAssignmentDetailSelect
    })

    return toAssignmentResult(updated)
  })
}

export async function cancelOrderAssignment(
  prisma: PrismaClient,
  input: OrderAssignmentCommandBase
): Promise<OrderAssignmentMutationResultDTO> {
  return prisma.$transaction(async (tx) => {
    const a = await assertLifecycleCommand(tx, input)
    assertValidAssignmentTransition(a.status, AssignmentLifecycle.CANCELLED)

    const now = new Date()
    const updated = await tx.orderAssignment.update({
      where: { id: a.id },
      data: {
        status: AssignmentLifecycle.CANCELLED,
        cancelledAt: now,
        isActive: false
      },
      select: orderAssignmentDetailSelect
    })

    return toAssignmentResult(updated)
  })
}

export async function timeoutOrderAssignment(
  prisma: PrismaClient,
  input: OrderAssignmentCommandBase
): Promise<OrderAssignmentMutationResultDTO> {
  return prisma.$transaction(async (tx) => {
    const a = await assertLifecycleCommand(tx, input)
    assertValidAssignmentTransition(a.status, AssignmentLifecycle.TIMED_OUT)

    const now = new Date()
    const updated = await tx.orderAssignment.update({
      where: { id: a.id },
      data: {
        status: AssignmentLifecycle.TIMED_OUT,
        timedOutAt: now,
        isActive: false
      },
      select: orderAssignmentDetailSelect
    })

    return toAssignmentResult(updated)
  })
}

// =============================================================================
// Section 2 — Execution activity
// =============================================================================

type LineActivityInput = OrderAssignmentCommandBase & {
  orderId: string
  orderType: OrderType
  orderLineRefId: string
  notes?: string | null
}

type ExceptionActivityInput = OrderAssignmentCommandBase & {
  orderId: string
  orderType: OrderType
  orderLineRefId: string | null
  notes?: string | null
}

function recordOrderExecutionActivity(
  prisma: PrismaClient,
  input: OrderAssignmentActivityInput,
  activityType: ExecutionActivity
): Promise<OrderExecutionActivityMutationResultDTO> {
  return prisma.$transaction(async (tx) => {
    const a = await loadAssignmentForActivity(tx, input)
    const row = await createExecutionActivityInTx(tx, a, input, activityType)

    return toActivityResult(a, row)
  })
}

export function recordLinePicked(
  prisma: PrismaClient,
  input: LineActivityInput
): Promise<OrderExecutionActivityMutationResultDTO> {
  return recordOrderExecutionActivity(
    prisma,
    { ...input, orderLineRefId: input.orderLineRefId, notes: input.notes },
    ExecutionActivity.LINE_PICKED
  )
}

export function recordLinePartiallyPicked(
  prisma: PrismaClient,
  input: LineActivityInput
): Promise<OrderExecutionActivityMutationResultDTO> {
  return recordOrderExecutionActivity(
    prisma,
    { ...input, orderLineRefId: input.orderLineRefId, notes: input.notes },
    ExecutionActivity.LINE_PARTIALLY_PICKED
  )
}

export function recordLineReceived(
  prisma: PrismaClient,
  input: LineActivityInput
): Promise<OrderExecutionActivityMutationResultDTO> {
  return recordOrderExecutionActivity(
    prisma,
    { ...input, orderLineRefId: input.orderLineRefId, notes: input.notes },
    ExecutionActivity.LINE_RECEIVED
  )
}

export function recordLineChecked(
  prisma: PrismaClient,
  input: LineActivityInput
): Promise<OrderExecutionActivityMutationResultDTO> {
  return recordOrderExecutionActivity(
    prisma,
    { ...input, orderLineRefId: input.orderLineRefId, notes: input.notes },
    ExecutionActivity.LINE_CHECKED
  )
}

export function recordLinePacked(
  prisma: PrismaClient,
  input: LineActivityInput
): Promise<OrderExecutionActivityMutationResultDTO> {
  return recordOrderExecutionActivity(
    prisma,
    { ...input, orderLineRefId: input.orderLineRefId, notes: input.notes },
    ExecutionActivity.LINE_PACKED
  )
}

export function recordLineBoxed(
  prisma: PrismaClient,
  input: LineActivityInput
): Promise<OrderExecutionActivityMutationResultDTO> {
  return recordOrderExecutionActivity(
    prisma,
    { ...input, orderLineRefId: input.orderLineRefId, notes: input.notes },
    ExecutionActivity.LINE_BOXED
  )
}

export function recordLineSkipped(
  prisma: PrismaClient,
  input: LineActivityInput
): Promise<OrderExecutionActivityMutationResultDTO> {
  return recordOrderExecutionActivity(
    prisma,
    { ...input, orderLineRefId: input.orderLineRefId, notes: input.notes },
    ExecutionActivity.LINE_SKIPPED
  )
}

export function recordExceptionRaised(
  prisma: PrismaClient,
  input: ExceptionActivityInput
): Promise<OrderExecutionActivityMutationResultDTO> {
  return recordOrderExecutionActivity(
    prisma,
    { ...input, orderLineRefId: input.orderLineRefId, notes: input.notes },
    ExecutionActivity.EXCEPTION_RAISED
  )
}

export function recordExceptionResolved(
  prisma: PrismaClient,
  input: ExceptionActivityInput
): Promise<OrderExecutionActivityMutationResultDTO> {
  return recordOrderExecutionActivity(
    prisma,
    { ...input, orderLineRefId: input.orderLineRefId, notes: input.notes },
    ExecutionActivity.EXCEPTION_RESOLVED
  )
}

export function recordLineReversed(
  prisma: PrismaClient,
  input: LineActivityInput
): Promise<OrderExecutionActivityMutationResultDTO> {
  return recordOrderExecutionActivity(
    prisma,
    { ...input, orderLineRefId: input.orderLineRefId, notes: input.notes },
    ExecutionActivity.LINE_REVERSED
  )
}
