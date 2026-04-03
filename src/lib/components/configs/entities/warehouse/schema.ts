import { z } from 'zod'

export const warehouseStatusValues = ['ACTIVE', 'INACTIVE', 'ARCHIVED'] as const

export const warehouseStatusSchema = z.enum(warehouseStatusValues)

export const warehouseFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(120, 'Name must be at most 120 characters.'),
  address: z.string().trim().min(1, 'Address is required.').max(255, 'Address must be at most 255 characters.'),
  timezone: z.string().trim().min(1, 'Timezone is required.').max(100, 'Timezone must be at most 100 characters.'),
  currency: z
    .string()
    .trim()
    .length(3, 'Currency must be a 3-letter ISO code.')
    .transform((value) => value.toUpperCase()),
  status: warehouseStatusSchema.default('ACTIVE')
})

export const warehouseSchema = warehouseFormSchema.extend({
  id: z.string().uuid(),
  createdById: z.string().uuid().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date()
})
