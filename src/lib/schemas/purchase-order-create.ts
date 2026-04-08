import { z } from 'zod'

const positiveFinite = z.number().finite().positive('Quantity must be a positive number.')

export const purchaseOrderLineInputSchema = z.object({
  itemId: z.string().trim().min(1, 'Item id is required.'),
  baseQuantity: positiveFinite,
  itemName: z.string().trim().min(1, 'Item name is required.')
})

export const purchaseOrderCreateSchema = z.object({
  orderNo: z.string().trim().min(1, 'Order reference is required.'),
  businessPartyId: z.string().trim().min(1, 'Supplier is required.'),
  warehouseId: z.string().trim().min(1, 'Warehouse is required.'),
  lines: z.array(purchaseOrderLineInputSchema).min(1, 'At least one line is required.'),
  notes: z.string().trim().optional(),
  expectedDate: z.preprocess(
    (value) => {
      if (value === undefined || value === null || value === '') {
        return undefined
      }

      return value
    },
    z.coerce.date().optional()
  )
})

export type PurchaseOrderCreateInput = z.infer<typeof purchaseOrderCreateSchema>
export type PurchaseOrderLineInput = z.infer<typeof purchaseOrderLineInputSchema>
