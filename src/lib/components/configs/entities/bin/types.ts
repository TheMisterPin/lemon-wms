import { z } from 'zod'

import { binFormSchema, binSchema, binTypeSchema } from './schema'

export type Bin = z.infer<typeof binSchema>
export type BinFormValues = z.infer<typeof binFormSchema>
export type BinTypeValue = z.infer<typeof binTypeSchema>
