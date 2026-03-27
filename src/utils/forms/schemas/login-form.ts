
import * as z from 'zod'

export const loginFormSchema = z.object({
  email: z
    .string()
    .nonempty('Email is required.'),
  password: z
    .string()
    .nonempty('Password is required.'),
})
