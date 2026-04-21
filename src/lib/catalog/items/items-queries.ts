import type { PrismaClient } from '@/generated/prisma'
import { InputJsonValue } from '@/generated/prisma/runtime/client'
import { ItemFormValues } from '@/lib/catalog/items/items-schemas'
import { validateItemRelations } from './items-validators'

/**
 * retrieves all items from the database.
 * @param prisma - The prisma client.
 * @returns The items.
 */
const getItems = async (prisma: PrismaClient) => {
  const items = await prisma.item.findMany()

  return items
}
/**
 * retrieves an item from the database by its id.
 * @param prisma - The prisma client.
 * @param id - The id of the item.
 * @returns The item.
 */
const getItem = async (prisma: PrismaClient, id: string) => {
  const item = await prisma.item.findUnique({ where: { id } })

  return item
}
/**
 * retrieves an item from the database by its sku.
 * @param prisma - The prisma client.
 * @param sku - The sku of the item.
 * @returns The item.
 */
const getItemBySku = async (prisma: PrismaClient, sku: string) => {
  const item = await prisma.item.findUnique({ where: { sku } })

  return item
}

/**
 * retrieves the basic information of an item from the database.
 * @param prisma - The prisma client.
 * @param id - The id of the item.
 * @returns The basic information of the item.
 */
const getBasicItemInfo = async (prisma: PrismaClient, id: string) => {
  const item = await prisma.item.findUnique({ where: { id }, select: { id: true, name: true, sku: true, barcode: true, uom: true } })

  return item
}

/**
 * Creates a new item in the database.
 * @param prisma - The prisma client.
 * @param data - The data for the item.
 * @returns The created item.
 */
async function createItem(prisma: PrismaClient, data: ItemFormValues) {
  const { dimensions, ...rest } = data

  await validateItemRelations(prisma, {
    uom: data.uom,
    categoryId: data.categoryId,
    supplierId: data.supplierId ?? undefined
  })

  return prisma.item.create({
    data: {
      ...rest,
      dimensions: dimensions !== null
        ? (dimensions as InputJsonValue)
        : undefined
    }
  })
}

/**
 * Updates an item in the database.
 * @param prisma - The prisma client.
 * @param id - The id of the item.
 * @param data - The data for the item.
 * @returns The updated item.
 */
async function updateItem(prisma: PrismaClient, id: string, data: ItemFormValues) {
  const { dimensions, ...rest } = data

  await validateItemRelations(prisma, {
    uom: data.uom,
    categoryId: data.categoryId,
    supplierId: data.supplierId ?? undefined
  })

  return prisma.item.update({
    where: { id },
    data: {
      ...rest,
      dimensions: dimensions !== null ? (dimensions as InputJsonValue) : undefined
    }
  })
}

/**
 * Deletes an item from the database.
 * @param prisma - The prisma client.
 * @param id - The id of the item.
 * @returns The deleted item.
 */
async function deleteItem(prisma: PrismaClient, id: string) {
  return prisma.item.delete({ where: { id } })
}
/**
 * Retrieves all items with optional filters.
 * @param prisma - The prisma client.
 * @param filters - The filters for the items.
 * @returns The items.
 */
const getItemsWithFilters = async (prisma: PrismaClient, filters: { categoryId?: string, isActive?: boolean }) => {
  const items = await prisma.item.findMany({
    where: {
      ...filters
    }
  })

  return items
}
export { createItem, deleteItem, getBasicItemInfo, getItem, getItemBySku, getItems, getItemsWithFilters, updateItem }
