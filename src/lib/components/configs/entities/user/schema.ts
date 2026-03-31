import { z } from 'zod'

export const roleValues = [
  'OWNER',
  'OFFICE_MANAGER',
  'OFFICE_WORKER',
  'WAREHOUSE_MANAGER',
  'WAREHOUSE_WORKER'
] as const

export const loginTypeValues = ['CREDENTIAL', 'BADGE_PIN', 'BOTH'] as const

export const roleSchema = z.enum(roleValues)
export const loginTypeSchema = z.enum(loginTypeValues)

export const userFormSchema = z.object({
  email: z.string().email('Must be a valid email.').nullable().optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .nullable()
    .optional(),
  pin: z
    .string()
    .length(4, 'PIN must be exactly 4 digits.')
    .regex(/^\d{4}$/, 'PIN must be 4 numeric digits.')
    .nullable()
    .optional(),
  role: roleSchema,
  loginType: loginTypeSchema,
  isActive: z.boolean().default(true)
})

export const userSchema = userFormSchema.extend({
  id: z.string().uuid(),
  badgeNumber: z.string(),
  deletedAt: z.date().nullable(),
  createdAt: z.date()
})
