import { z } from 'zod'

import type { DeviceType } from '@/types/models/enums'

export const authorizeDeviceSchema = z.object({
  warehouseId: z.string().min(1, 'Warehouse is required'),
  zoneId: z.string().min(1, 'Zone is required')
})

export type AuthorizeDeviceFormValues = z.infer<typeof authorizeDeviceSchema>

export type Device = {
  id: string
  name: string
  code: string
  warehouseId: string | null
  zoneId: string | null
  authorized: boolean
  isActive: boolean
  type: DeviceType
  registeredAt: Date
  lastSeenAt: Date | null
}

export type DeviceFormValues = {
  name: string
  code: string
  warehouseId: string | null
  zoneId: string | null
  isActive: boolean
  type: DeviceType
}
