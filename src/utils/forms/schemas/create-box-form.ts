
import * as z from 'zod'

export const createBoxFormSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters.')
    .max(32, 'Name must be at most 32 characters.'),
  description: z
    .string()
    .max(200, 'Description must be at most 200 characters.')
    .optional(),
  closedImage: z.string().optional(),
  contentsImage: z.string().optional(),
})
