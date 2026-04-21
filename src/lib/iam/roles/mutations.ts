import type { Role } from '@/generated/prisma'
import { DomainError } from '@/lib/errors'

import { can, canAssignRole } from './queries'
import { RbacPermission } from './schemas'

function assertCan(role: Role, permission: RbacPermission): void {
  if (!can(role, permission)) {
    throw new DomainError('Forbidden', 'FORBIDDEN', 403)
  }
}

function assertCanAssignRole(actor: Role, targetRole: Role): void {
  if (!can(actor, RbacPermission.USER_CHANGE_ROLE)) {
    throw new DomainError('Forbidden', 'FORBIDDEN', 403)
  }
  if (!canAssignRole(actor, targetRole)) {
    throw new DomainError('Forbidden', 'FORBIDDEN', 403)
  }
}

export { assertCan, assertCanAssignRole }
