import { z } from 'zod'

import { warehouseFormSchema, warehouseSchema, warehouseStatusSchema } from './schema'

export type Warehouse = z.infer<typeof warehouseSchema>
export type WarehouseFormValues = z.infer<typeof warehouseFormSchema>
export type WarehouseStatusValue = z.infer<typeof warehouseStatusSchema>
