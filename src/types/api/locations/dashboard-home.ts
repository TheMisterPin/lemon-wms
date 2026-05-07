/**
 * Wire contracts for dashboard dashboard-home aggregates (`GET /dashboard/home`).
 * Payload envelope matches dashboard Axios client's `{ success, data }` body shape.
 */

export type ApiPayload<T> = { success: boolean; data: T }

/** Inner `data` field — warehouses/zones/bins lists from `/dashboard/home`. */
export type DashboardHomePayload = {
  warehouses: {
    id: string
    name: string
  }[]
  zones: {
    id: string
    warehouseId: string
    name: string
    type: string
    isActive: boolean
  }[]
  bins: {
    id: string
    warehouseId: string
    zoneId: string
    name: string
    code: string
    type: string
    isBlocked: boolean
    blockReason: string | null
    active: boolean
    maxCapacity: number | null
    currentCapacity: number | null
    filledPercentage: number | null
    itemsInBin: number
    createdAt: string
  }[]
}

/** Normalized zone row kept in dashboard warehouse hook state after mapping wire zones. */
export type ZoneApiRecord = {
  id: string
  warehouseId: string
  name: string
  type: string
  isActive: boolean
  createdAt: string
  deletedAt: string | null
}

/** Normalized bin row kept in dashboard warehouse hook state after mapping wire bins. */
export type BinApiRecord = {
  id: string
  zoneId: string
  warehouseId: string
  name: string
  code: string
  type: string
  isBlocked: boolean
  createdAt: string
  deletedAt: string | null
  maxCapacity: number | null
  currentCapacity: number | null
  filledPercentage: number | null
  itemsInBin: number
}
