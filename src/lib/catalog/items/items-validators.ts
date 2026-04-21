import type { PrismaClient } from '@/generated/prisma'
import type { ItemFormValues } from '@/lib/catalog/items/items-schemas'

type ItemInput = Pick<ItemFormValues, 'uom' | 'categoryId' | 'supplierId'>

/**
 * Validates the relations of an item.
 * @param prisma - The prisma client.
 * @param data - The data for the item.
 * @returns The validated item.
 */
export async function validateItemRelations(prisma: PrismaClient, data: Partial<ItemInput>) {
  if (data.uom) {
    const uom = await prisma.unitOfMeasure.findUnique({ where: { id: data.uom } })

    if (!uom) {
      throw new Error(`Unit of measure '${data.uom}' does not exist.`)
    }
  }

  if (data.categoryId) {
    const category = await prisma.itemCategory.findUnique({ where: { id: data.categoryId } })

    if (!category) {
      throw new Error(`Category '${data.categoryId}' does not exist.`)
    }
  }

  if (data.supplierId) {
    const supplier = await prisma.businessParty.findFirst({
      where: {
        id: data.supplierId,
        type: 'SUPPLIER'
      }
    })

    if (!supplier) {
      throw new Error(`Supplier '${data.supplierId}' does not exist.`)
    }
  }
}
