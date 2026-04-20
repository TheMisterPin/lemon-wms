export interface IItemCategory {
  id: string
  name: string
  handlingFlags: Record<string, unknown> | null
  createdAt: Date
}
