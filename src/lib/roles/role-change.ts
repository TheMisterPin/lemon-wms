import type { Role } from '@/generated/prisma'
import { DomainError } from '@/lib/errors'

import { can } from '@/lib/roles/check'
import { RbacPermission } from '@/lib/roles/permissions'

/**
 * OM cannot assign Owner or Warehouse Manager (per product rules).
 */
export function canOfficeManagerAssignRole(targetRole: Role): boolean {
  return targetRole !== 'OWNER' && targetRole !== 'WAREHOUSE_MANAGER'
}

/**
 * Whether `actor` may set a user's role to `targetRole`.
 * Caller still enforces org rules (e.g. single Owner) in domain layer.
 */
export function canAssignRole(actor: Role, targetRole: Role): boolean {
  if (actor === 'OWNER') {
    return true
  }

  if (actor === 'OFFICE_MANAGER') {
    return canOfficeManagerAssignRole(targetRole)
  }

  return false
}

export function assertCanAssignRole(actor: Role, targetRole: Role): void {
  if (!can(actor, RbacPermission.USER_CHANGE_ROLE)) {
    throw new DomainError('Forbidden', 'FORBIDDEN', 403)
  }
  if (!canAssignRole(actor, targetRole)) {
    throw new DomainError('Forbidden', 'FORBIDDEN', 403)
  }
}
