import { z } from 'zod'

export const binTypeValues = [
  'RECEIVING',
  'STORAGE',
  'PICK_FACE',
  'PACKING',
  'SHIPPING',
  'QUARANTINE',
  'STAGING',
  'CUSTOM'
] as const

export const binTypeSchema = z.enum(binTypeValues)

export const binFormSchema = z.object({
  zoneId: z.string().uuid('Zone ID must be a valid UUID.'),
  warehouseId: z.string().uuid('Warehouse ID must be a valid UUID.'),
  name: z.string().trim().min(1, 'Name is required.').max(120, 'Name must be at most 120 characters.'),
  code: z.string().trim().min(1, 'Code is required.').max(50, 'Code must be at most 50 characters.'),
  type: binTypeSchema,
  isBlocked: z.boolean().default(false),
  blockReason: z.string().trim().max(255).nullable().optional(),
  maxWeightKg: z.number().positive().nullable().optional(),
  maxVolumeM3: z.number().positive().nullable().optional()
})

export const binSchema = binFormSchema.extend({
  id: z.string().uuid(),
  deletedAt: z.date().nullable(),
  createdAt: z.date()
})
