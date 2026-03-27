
import * as z from 'zod'

export const createUserformSchema = z.object({
  name: z
    .string()
    .min(5, 'Name must be at least 5 characters.')
    .max(32, 'Name must be at most 32 characters.'),
  email: z
    .string()
    .email('Please enter a valid email address.')
    .max(100, 'Email must be at most 100 characters.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(32, 'Password must be at most 32 characters.'),
})
