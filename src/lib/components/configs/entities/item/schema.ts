import { z } from 'zod'

export const trackingModeValues = ['NONE', 'LOT', 'SERIAL', 'FIFO'] as const
export const trackingModeSchema = z.enum(trackingModeValues)

export const itemFormSchema = z.object({
  sku: z.string().trim().min(1, 'SKU is required.').max(100, 'SKU must be at most 100 characters.'),
  name: z.string().trim().min(1, 'Name is required.').max(255, 'Name must be at most 255 characters.'),
  description: z.string().trim().max(1000).nullable().optional(),
  barcode: z.string().trim().max(100).nullable().optional(),
  categoryId: z.string().uuid('Category ID must be a valid UUID.'),
  trackingMode: trackingModeSchema,
  uom: z.string().trim().min(1, 'Unit of measure is required.').max(20),
  weightKg: z.number().positive().nullable().optional(),
  dimensions: z.record(z.string(), z.unknown()).nullable().optional(),
  minQuantity: z.number().min(0).default(0),
  isActive: z.boolean().default(true),
  supplierId: z.string().uuid().nullable().optional()
})

export const itemSchema = itemFormSchema.extend({
  id: z.string().uuid(),
  deletedAt: z.date().nullable(),
  createdAt: z.date()
})
