import { z } from 'zod'

import type { DeviceType } from '@/types/models/enums'
import { authorizeDeviceSchema } from './schema'

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

export type AuthorizeDeviceFormValues = z.infer<typeof authorizeDeviceSchema>
