import type { AlertRuleType, Role } from './enums'

export interface IAlertRule {
  id: string
  type: AlertRuleType
  warehouseId: string
  warItemId: string | null
  threshold: number
  recipientRole: Role
  createdAt: Date
}
