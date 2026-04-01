import { z } from 'zod'

export const authorizeDeviceSchema = z.object({
  warehouseId: z.string().min(1, 'Warehouse is required'),
  zoneId: z.string().min(1, 'Zone is required')
})
