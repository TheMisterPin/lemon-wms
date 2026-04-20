import { z } from 'zod'

export const zoneTypeValues = [
  'GENERAL',
  'COLD',
  'HAZMAT',
  'QUARANTINE',
  'STAGING',
  'RETURNS'
] as const

export const zoneTypeSchema = z.enum(zoneTypeValues)

export const zoneFormSchema = z.object({
  warehouseId: z.string().uuid('Warehouse ID must be a valid UUID.'),
  name: z.string().trim().min(1, 'Name is required.').max(120, 'Name must be at most 120 characters.'),
  type: zoneTypeSchema,
  isActive: z.boolean().default(true),
  customPermissions: z.record(z.string(), z.unknown()).nullable().optional(),
  defaultReceivingBinId: z.string().uuid().nullable().optional(),
  defaultQuarantineBinId: z.string().uuid().nullable().optional(),
  defaultOutgoingBinId: z.string().uuid().nullable().optional()
})

export const zoneSchema = zoneFormSchema.extend({
  id: z.string().uuid(),
  deletedAt: z.date().nullable(),
  createdAt: z.date()
})

export type Zone = z.infer<typeof zoneSchema>
export type ZoneFormValues = z.infer<typeof zoneFormSchema>
export type ZoneTypeValue = z.infer<typeof zoneTypeSchema>
