import type { Role } from '@/generated/prisma'

import { RbacPermission, ROLE_PERMISSIONS } from './roles-schemas'

function can(role: Role, permission: RbacPermission): boolean {
  if (role === 'OWNER') {
    return true
  }

  return ROLE_PERMISSIONS[role].has(permission)
}

function canMessageByRole(sender: Role, recipient: Role): boolean {
  if (sender === 'OWNER') {
    return true
  }

  if (sender === 'OFFICE_MANAGER') {
    return (
      recipient === 'OFFICE_MANAGER' ||
      recipient === 'WAREHOUSE_MANAGER' ||
      recipient === 'OFFICE_WORKER'
    )
  }

  if (sender === 'OFFICE_WORKER') {
    return recipient === 'OFFICE_MANAGER'
  }

  if (sender === 'WAREHOUSE_MANAGER') {
    return (
      recipient === 'WAREHOUSE_MANAGER' ||
      recipient === 'WAREHOUSE_WORKER' ||
      recipient === 'OFFICE_MANAGER'
    )
  }

  if (sender === 'WAREHOUSE_WORKER') {
    return recipient === 'WAREHOUSE_WORKER' || recipient === 'WAREHOUSE_MANAGER'
  }

  return false
}

function canOfficeManagerAssignRole(targetRole: Role): boolean {
  return targetRole !== 'OWNER' && targetRole !== 'WAREHOUSE_MANAGER'
}

function canAssignRole(actor: Role, targetRole: Role): boolean {
  if (actor === 'OWNER') {
    return true
  }

  if (actor === 'OFFICE_MANAGER') {
    return canOfficeManagerAssignRole(targetRole)
  }

  return false
}

export { can, canMessageByRole, canOfficeManagerAssignRole, canAssignRole }
