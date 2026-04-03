import { z } from 'zod'

import { zoneFormSchema, zoneSchema, zoneTypeSchema } from './schema'

export type Zone = z.infer<typeof zoneSchema>
export type ZoneFormValues = z.infer<typeof zoneFormSchema>
export type ZoneTypeValue = z.infer<typeof zoneTypeSchema>
