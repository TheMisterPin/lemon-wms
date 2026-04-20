export interface INotification {
  id: string
  userId: string
  type: string
  title: string
  body: string
  entityType: string | null
  entityId: string | null
  isRead: boolean
  createdAt: Date
}
