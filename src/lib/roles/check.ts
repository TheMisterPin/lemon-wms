import type { Role } from '@/generated/prisma'
import { DomainError } from '@/lib/errors'

import { RbacPermission, ROLE_PERMISSIONS } from '@/lib/roles/permissions'

export function can(role: Role, permission: RbacPermission): boolean {
  if (role === 'OWNER') {
    return true
  }

  return ROLE_PERMISSIONS[role].has(permission)
}

export function assertCan(role: Role, permission: RbacPermission): void {
  if (!can(role, permission)) {
    throw new DomainError('Forbidden', 'FORBIDDEN', 403)
  }
}
