
import * as z from 'zod'

export const createLocationformSchema = z.object({
  name: z
    .string()
    .min(5, 'Name must be at least 5 characters.')
    .max(32, 'Name must be at most 32 characters.'),

})
