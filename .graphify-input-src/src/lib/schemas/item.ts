import { z } from 'zod'

export const trackingModeValues = ['NONE', 'LOT', 'SERIAL', 'FIFO'] as const
export const trackingModeSchema = z.enum(trackingModeValues)

export const uomValues = ['PZ', 'MT', 'KGS'] as const
export const uomSchema = z.enum(uomValues)

export const itemFormSchema = z.object({
  sku: z.string().trim().min(1, 'SKU is required.').max(100, 'SKU must be at most 100 characters.'),
  name: z.string().trim().min(1, 'Name is required.').max(255, 'Name must be at most 255 characters.'),
  description: z.string().trim().max(1000).nullable().optional(),
  barcode: z.string().trim().max(100).nullable().optional(),
  categoryId: z.string().trim().min(1, 'Category ID is required.').max(40),
  trackingMode: trackingModeSchema,
  uom: uomSchema,
  weightKg: z.number().positive().nullable().optional(),
  dimensions: z.record(z.string(), z.unknown()).nullable().optional(),
  minQuantity: z.number().min(0).default(0),
  isActive: z.boolean().default(true),
  supplierId: z.string().trim().regex(/^SUP-\d{4}$/, 'Supplier ID must follow SUP-0001 pattern.').nullable().optional()
})

export const itemSchema = itemFormSchema.extend({
  id: z.string(),
  deletedAt: z.date().nullable(),
  createdAt: z.date()
})

export type WARItem = z.infer<typeof itemSchema>
export type ItemFormValues = z.infer<typeof itemFormSchema>
export type TrackingModeValue = z.infer<typeof trackingModeSchema>
