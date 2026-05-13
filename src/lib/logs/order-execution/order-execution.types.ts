import { AssignmentLifecycle, ExecutionActivity, type OrderExecutionLineDocument, OrderType } from '@/generated/prisma'

/** Row shape for lists, filters, and monitoring views (denormalized names for display). */
export type OrderAssignmentListItemDTO = {
  id: string
  orderId: string
  orderType: OrderType
  status: AssignmentLifecycle
  warehouseId: string
  warehouseName?: string
  userId: string
  userFullName?: string
  assignedAt: Date
  startedAt: Date | null
  pausedAt: Date | null
  releasedAt: Date | null
  completedAt: Date | null
  cancelledAt: Date | null
  timedOutAt: Date | null
  isActive: boolean
  notes: string | null
}

/** Full assignment with nested warehouse and user for detail screens. */
export type OrderAssignmentDetailDTO = {
  id: string
  orderId: string
  orderType: OrderType
  status: AssignmentLifecycle
  warehouse: {
    id: string
    name: string
  }
  user: {
    id: string
    fullName: string
    badgeNumber: string
  }
  assignedAt: Date
  startedAt: Date | null
  pausedAt: Date | null
  releasedAt: Date | null
  completedAt: Date | null
  cancelledAt: Date | null
  timedOutAt: Date | null
  isActive: boolean
  notes: string | null
  zoneId: string | null
}

/** Aggregated workload snapshot for capacity / supervisor dashboards (optional fields filled by callers). */
export type UserAssignmentWorkloadDTO = {
  userId: string
  userFullName: string
  activeAssignments: number
  pausedAssignments: number
  completedAssignmentsToday?: number
}

/** Distinct users tied to an order via any assignment row (latest assignment metadata per user). */
export type AssignedUserOnOrderDTO = {
  userId: string
  userFullName: string
  badgeNumber: string
  latestAssignmentId: string
  latestAssignedAt: Date
  latestStatus: AssignmentLifecycle
}

/**
 * Orders that currently have more than one **active** assignment row.
 * Normally each `(orderType, orderId)` should have at most one active session per user;
 * multiple concurrent actives on the same order can indicate a workflow or data issue.
 */
export type DuplicateActiveOrderAssignmentClusterDTO = {
  orderType: OrderType
  orderId: string
  activeAssignmentCount: number
  assignments: OrderAssignmentListItemDTO[]
}
export type OrderExecutionActivityListItemDTO = {
  id: string
  orderAssignmentId: string
  orderId: string
  orderType: OrderType
  orderLineRefId: string | null
  executionLineDocument: OrderExecutionLineDocument | null
  executionLineId: string | null
  warehouseId: string
  zoneId: string
  warehouseName?: string
  userId: string
  userFullName?: string
  activityType: ExecutionActivity
  notes: string | null
  createdAt: Date
}

export type OrderExecutionActivityDetailDTO = {
  id: string
  orderAssignmentId: string
  orderId: string
  orderType: OrderType
  orderLineRefId: string | null
  executionLineDocument: OrderExecutionLineDocument | null
  executionLineId: string | null
  zoneId: string
  activityType: ExecutionActivity
  notes: string | null
  createdAt: Date
  user: {
    id: string
    fullName: string
    badgeNumber: string
  }
  warehouse: {
    id: string
    name: string
  }
}

export type LatestOrderExecutionActivityDTO = {
  id: string
  orderAssignmentId: string
  activityType: ExecutionActivity
  createdAt: Date
  userId: string
  userFullName?: string
  notes: string | null
  executionLineDocument: OrderExecutionLineDocument | null
  executionLineId: string | null
}
export type OrderAssignmentExecutionTimelineDTO = {
  assignment: OrderAssignmentDetailDTO
  activities: OrderExecutionActivityListItemDTO[]
}

export type OrderExecutionTimelineGroupDTO = {
  assignmentId: string
  userId: string
  userFullName: string
  status: AssignmentLifecycle
  assignedAt: Date
  startedAt: Date | null
  completedAt: Date | null
  activities: OrderExecutionActivityListItemDTO[]
}

export type OrderExecutionTimelineDTO = {
  orderId: string
  orderType: OrderType
  assignments: OrderExecutionTimelineGroupDTO[]
}

/** All activities on an order in a single chronological stream (oldest first). */
export type OrderExecutionFlatTimelineDTO = {
  orderId: string
  orderType: OrderType
  activities: OrderExecutionActivityListItemDTO[]
}

export type OrderLineExecutionTimelineDTO = {
  orderId: string
  orderType: OrderType
  orderLineRefId: string
  activities: OrderExecutionActivityListItemDTO[]
}

export type AssignmentLatestActivityDTO = {
  assignment: OrderAssignmentListItemDTO
  latestActivity: LatestOrderExecutionActivityDTO | null
}

export type OrderExecutionAnomalyDTO = {
  assignmentId?: string
  activityId?: string
  orderId: string
  orderType: OrderType
  issueType:
    | 'ACTIVE_ASSIGNMENT_WITH_NO_ACTIVITY'
    | 'ACTIVITY_AFTER_COMPLETION'
    | 'ACTIVITY_WHILE_PAUSED'
    | 'ORDER_MISMATCH'
    | 'WAREHOUSE_MISMATCH'
    | 'USER_MISMATCH'
  message: string
  detectedAt: Date
}

/** Assignment detail plus the newest execution event (same order/warehouse context expected). */
export type OrderAssignmentDetailWithLatestActivityDTO = {
  assignment: OrderAssignmentDetailDTO
  latestActivity: OrderExecutionActivityDetailDTO | null
}

/** Result of an assignment lifecycle command (no raw Prisma client objects). */
export type OrderAssignmentMutationResultDTO = {
  assignment: OrderAssignmentDetailDTO
}

/** Result of appending a single execution activity under a valid session. */
export type OrderExecutionActivityMutationResultDTO = {
  assignment: OrderAssignmentDetailDTO
  activity: OrderExecutionActivityListItemDTO
}

/** Rolled-up execution metrics for an order across assignments and activities. */
export type OrderExecutionSummaryDTO = {
  orderId: string
  orderType: OrderType
  assignmentCount: number
  activeAssignmentCount: number
  activityCount: number
  distinctActorCount: number
  firstActivityAt: Date | null
  lastActivityAt: Date | null
  exceptionRaisedCount: number
  exceptionResolvedCount: number
}

/** Distinct user who logged at least one execution activity on the order. */
export type UserWhoTouchedOrderDTO = {
  userId: string
  userFullName: string
  badgeNumber: string
  activityCount: number
  lastTouchedAt: Date
}

/** Distinct user who logged activity against a specific order line ref. */
export type UserWhoTouchedOrderLineDTO = {
  userId: string
  userFullName: string
  badgeNumber: string
  activityCount: number
  lastTouchedAt: Date
}

/** Newest activity per non-null line ref on an order (for pick-face / exception triage). */
export type OrderLineLatestActivitySnapshotDTO = {
  orderLineRefId: string
  activity: OrderExecutionActivityListItemDTO
}

/** Order where the last exception signal is still “raised” (no later resolution). */
export type OrderWithUnresolvedExceptionDTO = {
  orderId: string
  orderType: OrderType
  lastRaisedAt: Date
  lastResolvedAt: Date | null
}

/** Assignment whose chronologically last activity is `EXCEPTION_RAISED`. */
export type AssignmentLastActivityExceptionRaisedDTO = {
  assignment: OrderAssignmentListItemDTO
  latestActivity: OrderExecutionActivityListItemDTO
}

/** Activities logged after the assignment session was marked complete. */
export type AssignmentActivityAfterCompletionDTO = {
  assignment: OrderAssignmentListItemDTO
  activitiesAfterCompletion: OrderExecutionActivityListItemDTO[]
}

/**
 * Assignment currently `PAUSED` with at least one activity after `pausedAt`
 * (possible work logged while the session was paused).
 */
export type AssignmentActivityWhilePausedDTO = {
  assignment: OrderAssignmentListItemDTO
  activitiesAfterPause: OrderExecutionActivityListItemDTO[]
}

/** Activity row that does not match parent assignment order identity. */
export type ActivityOrderMismatchDTO = {
  activity: OrderExecutionActivityDetailDTO
  assignment: {
    id: string
    orderId: string
    orderType: OrderType
  }
}

/** Activity row that does not match parent assignment warehouse. */
export type ActivityWarehouseMismatchDTO = {
  activity: OrderExecutionActivityDetailDTO
  assignment: {
    id: string
    warehouseId: string
  }
}

/** Activity row where actor differs from assignee on the parent session. */
export type ActivityUserMismatchDTO = {
  activity: OrderExecutionActivityDetailDTO
  assignment: {
    id: string
    userId: string
  }
}
