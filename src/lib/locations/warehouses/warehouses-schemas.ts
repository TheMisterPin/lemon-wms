import { z } from 'zod'

export const warehouseStatusValues = ['ACTIVE', 'INACTIVE', 'ARCHIVED'] as const

export const warehouseStatusSchema = z.enum(warehouseStatusValues)

/** POST body: name required; other fields get server defaults when omitted. */
export const createWarehouseBodySchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required.').max(120, 'Name must be at most 120 characters.'),
    address: z.string().trim().max(255, 'Address must be at most 255 characters.').optional(),
    timezone: z.string().trim().max(100, 'Timezone must be at most 100 characters.').optional(),
    currency: z
      .string()
      .trim()
      .length(3, 'Currency must be a 3-letter ISO code.')
      .transform((value) => value.toUpperCase())
      .optional(),
    status: warehouseStatusSchema.optional()
  })
  .transform((body) => ({
    name: body.name,
    address: body.address ?? '—',
    timezone: body.timezone ?? 'UTC',
    currency: body.currency ?? 'USD',
    status: body.status ?? ('ACTIVE' as const)
  }))

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

export type Warehouse = z.infer<typeof warehouseSchema>
export type WarehouseFormValues = z.infer<typeof warehouseFormSchema>
export type WarehouseStatusValue = z.infer<typeof warehouseStatusSchema>
export type CreateWarehouseBodyInput = z.input<typeof createWarehouseBodySchema>
