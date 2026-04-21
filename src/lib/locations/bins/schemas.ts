import { z } from 'zod'

import type { IBinItem } from '@/types/models/bin-item'

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

const binItemStatusSchema = z.enum(['AVAILABLE', 'RESERVED', 'BLOCKED', 'IN_TRANSIT'])

export const binInfoItemSchema = z.object({
  binId: z.string(),
  quantities: z
    .array(
      z.object({
        available: z.number(),
        reserved: z.number(),
        blocked: z.number(),
        lotId: z.string().nullable(),
        serialNumberId: z.string().nullable()
      })
    )
    .nullable()
})

export const binItemSchema: z.ZodType<IBinItem> = z.lazy(() =>
  z.object({
    id: z.string().uuid(),
    binId: z.string().uuid(),
    itemId: z.string().uuid(),
    lotId: z.string().nullable(),
    serialNumberId: z.string().nullable(),
    quantityAvailable: z.number(),
    quantityReserved: z.number(),
    quantityBlocked: z.number(),
    quantity: z.number(),
    actualQuantity: z.number(),
    uom: z.string(),
    status: binItemStatusSchema,
    transitDeviceId: z.string().nullable(),
    expiryDate: z.coerce.date().nullable(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    boxId: z.string().nullable(),
    name: z.string(),
    sku: z.string(),
    code: z.string(),
    inOtherBin: z.array(binInfoItemSchema),
    reservedByOrderId: z.string().nullable(),
    reservedByOrderLineId: z.string().nullable(),
    factboxInfo: binItemSchema.nullable()
  })
)

const dateField = z.coerce.date()

export const binSchema = z.object({
  id: z.string().uuid(),
  zoneId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  name: z.string(),
  code: z.string(),
  type: binTypeSchema,
  maxCapacity: z.number().nullable(),
  currentCapacity: z.number().nullable(),
  filledPercentage: z.number().nullable(),
  isBlocked: z.boolean(),
  blockReason: z.string().nullable(),
  maxWeightKg: z.number().nullable(),
  maxVolumeM3: z.number().nullable(),
  deletedAt: dateField.nullable(),
  createdAt: dateField,
  updatedAt: dateField
})

export const binWithContentSchema = binSchema.extend({
  content: z.array(binItemSchema)
})

export type Bin = z.infer<typeof binSchema>
export type BinWithContent = z.infer<typeof binWithContentSchema>
export type BinItem = z.infer<typeof binItemSchema>
export type BinFormValues = z.infer<typeof binFormSchema>
export type BinTypeValue = z.infer<typeof binTypeSchema>
