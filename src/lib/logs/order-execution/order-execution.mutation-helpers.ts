import { AssignmentLifecycle, type OrderType } from '@/generated/prisma'

import { DomainError } from '@/lib/errors'

const ASSIGNMENT_NOT_FOUND = 'Order assignment not found.'
const INVALID_TRANSITION = 'Order assignment cannot move to the requested state from its current status.'
const ACTIVITY_NOT_ALLOWED =
  'Execution activity is only allowed when the assignment is active and the status is STARTED or RESUMED.'
const ASSIGNMENT_NOT_ACTIVE = 'The order assignment is not active or is already in a terminal state.'

const USER_NOT_ASSIGNMENT = 'The signed-in user does not match this assignment.'
const WAREHOUSE_NOT_ASSIGNMENT = 'The warehouse does not match this assignment.'
const ORDER_CONTEXT_NOT_ASSIGNMENT = 'The order context does not match this assignment.'

export const ASSIGNMENT_TERMINAL_STATUSES: readonly AssignmentLifecycle[] = [
  AssignmentLifecycle.COMPLETED,
  AssignmentLifecycle.RELEASED,
  AssignmentLifecycle.CANCELLED,
  AssignmentLifecycle.TIMED_OUT
] as const

export function isAssignmentTerminalStatus(status: AssignmentLifecycle): boolean {
  return (ASSIGNMENT_TERMINAL_STATUSES as readonly AssignmentLifecycle[]).includes(status)
}

/** True for in-progress (non-terminal) session statuses. */
export function isAssignmentActiveStatus(status: AssignmentLifecycle): boolean {
  return !isAssignmentTerminalStatus(status)
}

const VALID_NEXT_STATUS_BY_LIFECYCLE: Partial<Record<AssignmentLifecycle, readonly AssignmentLifecycle[]>> = {
  [AssignmentLifecycle.ASSIGNED]: [AssignmentLifecycle.STARTED, AssignmentLifecycle.CANCELLED],
  [AssignmentLifecycle.STARTED]: [
    AssignmentLifecycle.PAUSED,
    AssignmentLifecycle.COMPLETED,
    AssignmentLifecycle.RELEASED,
    AssignmentLifecycle.TIMED_OUT
  ],
  [AssignmentLifecycle.PAUSED]: [
    AssignmentLifecycle.RESUMED,
    AssignmentLifecycle.RELEASED,
    AssignmentLifecycle.CANCELLED
  ],
  [AssignmentLifecycle.RESUMED]: [
    AssignmentLifecycle.PAUSED,
    AssignmentLifecycle.COMPLETED,
    AssignmentLifecycle.RELEASED,
    AssignmentLifecycle.TIMED_OUT
  ]
} as const

export function assertOrderAssignmentExists<T extends { id: string }>(row: T | null | undefined): asserts row is T {
  if (!row) {
    throw new DomainError(ASSIGNMENT_NOT_FOUND, 'NOT_FOUND', 404)
  }
}

export function assertValidAssignmentTransition(from: AssignmentLifecycle, to: AssignmentLifecycle): void {
  if (isAssignmentTerminalStatus(from)) {
    throw new DomainError(INVALID_TRANSITION, 'INVALID_TRANSITION', 409)
  }

  const allowed = VALID_NEXT_STATUS_BY_LIFECYCLE[from]
  if (!allowed || !allowed.includes(to)) {
    throw new DomainError(INVALID_TRANSITION, 'INVALID_TRANSITION', 409)
  }
}

export function assertExecutionActivityAllowedForAssignmentStatus(assignment: {
  isActive: boolean
  status: AssignmentLifecycle
}): void {
  if (!assignment.isActive) {
    throw new DomainError(ACTIVITY_NOT_ALLOWED, 'INVALID_ASSIGNMENT_STATUS', 409)
  }

  if (assignment.status !== AssignmentLifecycle.STARTED && assignment.status !== AssignmentLifecycle.RESUMED) {
    throw new DomainError(ACTIVITY_NOT_ALLOWED, 'INVALID_ASSIGNMENT_STATUS', 409)
  }
}

export function assertOrderAssignmentIsActive(assignment: { isActive: boolean; status: AssignmentLifecycle }): void {
  if (!assignment.isActive || isAssignmentTerminalStatus(assignment.status)) {
    throw new DomainError(ASSIGNMENT_NOT_ACTIVE, 'ASSIGNMENT_NOT_ACTIVE', 409)
  }
}

export function assertOrderAssignmentMatchesOrderContext(
  assignment: { orderId: string; orderType: OrderType },
  orderId: string,
  orderType: OrderType
): void {
  if (assignment.orderId !== orderId || assignment.orderType !== orderType) {
    throw new DomainError(ORDER_CONTEXT_NOT_ASSIGNMENT, 'INVALID_CONTEXT', 400)
  }
}

export function assertOrderAssignmentMatchesWarehouse(
  assignment: { warehouseId: string },
  warehouseId: string
): void {
  if (assignment.warehouseId !== warehouseId) {
    throw new DomainError(WAREHOUSE_NOT_ASSIGNMENT, 'ASSIGNMENT_WAREHOUSE_FORBIDDEN', 403)
  }
}

export function assertOrderAssignmentBelongsToUser(assignment: { userId: string }, userId: string): void {
  if (assignment.userId !== userId) {
    throw new DomainError(USER_NOT_ASSIGNMENT, 'ASSIGNMENT_USER_FORBIDDEN', 403)
  }
}
