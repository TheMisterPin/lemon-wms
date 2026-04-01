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

function optionalPositiveNumber(label: string) {
  return z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) {
        return null
      }

      if (typeof value === 'number') {
        return value
      }

      if (typeof value === 'string') {
        const parsed = Number(value)

        return Number.isNaN(parsed) ? value : parsed
      }

      return value
    },
    z.number().positive(`${label} must be greater than zero.`).nullable().optional()
  )
}

function optionalTrimmedString(maxLength: number) {
  return z.preprocess(
    (value) => {
      if (value === '' || value === undefined) {
        return null
      }

      return value
    },
    z.string().trim().max(maxLength).nullable().optional()
  )
}

export const binFormSchema = z.object({
  zoneId: z.string().uuid('Zone ID must be a valid UUID.'),
  warehouseId: z.string().uuid('Warehouse ID must be a valid UUID.'),
  name: z.string().trim().min(1, 'Name is required.').max(120, 'Name must be at most 120 characters.'),
  code: z.string().trim().min(1, 'Code is required.').max(50, 'Code must be at most 50 characters.'),
  type: binTypeSchema,
  isBlocked: z.boolean().default(false),
  blockReason: optionalTrimmedString(255),
  maxWeightKg: optionalPositiveNumber('Max weight'),
  maxVolumeM3: optionalPositiveNumber('Max volume')
})

export const binSchema = binFormSchema.extend({
  id: z.string().uuid(),
  deletedAt: z.date().nullable(),
  createdAt: z.date()
})
