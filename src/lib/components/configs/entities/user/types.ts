import { z } from 'zod'

import { loginTypeSchema, roleSchema, userFormSchema, userSchema } from './schema'

export type User = z.infer<typeof userSchema>
export type UserFormValues = z.infer<typeof userFormSchema>
export type RoleValue = z.infer<typeof roleSchema>
export type LoginTypeValue = z.infer<typeof loginTypeSchema>
