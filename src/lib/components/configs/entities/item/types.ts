import { z } from 'zod'

import { itemFormSchema, itemSchema, trackingModeSchema } from './schema'

export type WARItem = z.infer<typeof itemSchema>
export type ItemFormValues = z.infer<typeof itemFormSchema>
export type TrackingModeValue = z.infer<typeof trackingModeSchema>
