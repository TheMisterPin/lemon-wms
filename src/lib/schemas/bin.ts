import { z } from 'zod'

export const binTypeValues = [
  'GENERAL',
  'RECEIVING',
  'OUTGOING',
  'QUARANTINE',
  'STAGING'
] as const

export const binTypeSchema = z.enum(binTypeValues)

export const binFormSchema = z.object({
  zoneId: z.string(),
  name: z.string().trim().min(1, 'Name is required.').max(120, 'Name must be at most 120 characters.'),
  type: binTypeSchema
})

export const binSchema = z.object({
  id: z.string().uuid(),
  zoneId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  name: z.string(),
  code: z.string(),
  type: binTypeSchema,
  isBlocked: z.boolean(),
  blockReason: z.string().nullable().optional(),
  maxWeightKg: z.number().nullable().optional(),
  maxVolumeM3: z.number().nullable().optional(),
  deletedAt: z.date().nullable(),
  createdAt: z.date()
})

export type Bin = z.infer<typeof binSchema>
export type BinFormValues = z.infer<typeof binFormSchema>
export type BinTypeValue = z.infer<typeof binTypeSchema>
