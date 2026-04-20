import type { Role } from '@/generated/prisma'

/**
 * Role-pair messaging allowlist. Same-warehouse / "their OM" enforced in API/domain.
 */
export function canMessageByRole(sender: Role, recipient: Role): boolean {
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
