import { type PrismaClient } from '@/generated/prisma'

import { seedBins } from './bins'
import { seedBusinessParties } from './business-parties'
import { seedCategories } from './item-categories'
import { seedItems } from './items'
import { seedPurchaseOrders } from './purchase-orders'
import { seedBinStockItems } from './seed-bin-stock-items'
import { seedDemoDevice } from './seed-devices'
import { seedUnitsOfMeasure } from './unit-of-measures'
import { seedUsers } from './users'
import { seedWarehouses } from './warehouses'
import { seedZones } from './zones'

/**
 * seedDB.
 * @param prisma - Parameter for seedDB.
 * @returns Result from seedDB.
 */
export async function seedDB(prisma: PrismaClient) {
  console.warn('Clearing existing data...\n')

  await prisma.userActivityEntry.deleteMany()
  console.warn('Cleared activities.')
  await prisma.purchaseOrderLine.deleteMany()
  console.warn('Cleared purchase order lines.')
  await prisma.salesOrderLine.deleteMany()
  console.warn('Cleared sales order lines.')
  await prisma.salesOrder.deleteMany()
  console.warn('Cleared sales orders.')
  await prisma.adjustmentOrderLine.deleteMany()
  console.warn('Cleared adjustment order lines.')
  await prisma.adjustmentOrder.deleteMany()
  console.warn('Cleared adjustment orders.')
  await prisma.binOperationEntry.deleteMany()
  console.warn('Cleared bin operation entries.')
  await prisma.transferOrderLine.deleteMany()
  console.warn('Cleared transfer order lines.')
  await prisma.transferOrder.deleteMany()
  console.warn('Cleared transfer orders.')
  await prisma.returnOrderLine.deleteMany()
  console.warn('Cleared return order lines.')
  await prisma.returnOrder.deleteMany()
  console.warn('Cleared return orders.')
  await prisma.itemLedgerEntry.deleteMany()
  console.warn('Cleared item ledger entries.')
  await prisma.alertRule.deleteMany()
  console.warn('Cleared alert rules.')
  await prisma.notification.deleteMany()
  console.warn('Cleared notifications.')
  await prisma.error.deleteMany()
  console.warn('Cleared errors.')
  await prisma.refreshToken.deleteMany()
  console.warn('Cleared refresh tokens.')
  await prisma.device.deleteMany()
  console.warn('Cleared devices.')
  await prisma.purchaseOrder.deleteMany()
  console.warn('Cleared purchase orders.')
  await prisma.binStockItem.deleteMany()
  console.warn('Cleared stock items.')
  await prisma.bin.deleteMany()
  console.warn('Cleared bins.')
  await prisma.zone.deleteMany()
  console.warn('Cleared zones.')
  await prisma.item.deleteMany()
  console.warn('Cleared items.')
  await prisma.unitOfMeasure.deleteMany()
  console.warn('Cleared units of measure.')
  await prisma.itemCategory.deleteMany()
  console.warn('Cleared item categories.')
  await prisma.address.deleteMany()
  console.warn('Cleared addresses.')
  await prisma.contactPerson.deleteMany()
  console.warn('Cleared contacts.')
  await prisma.businessParty.deleteMany()
  console.warn('Cleared business parties.')
  await prisma.user.deleteMany()
  console.warn('Cleared users.')
  await prisma.warehouse.deleteMany()
  console.warn('Cleared warehouses.\n')
  console.warn('Existing data cleared.\n')
  console.warn('Seeding new data...\n')

  console.warn('Seeding units of measure...')
  const unitsOfMeasure = await seedUnitsOfMeasure(prisma)
  console.warn(`Seeded ${unitsOfMeasure.count} units of measure.\n`)

  console.warn('Seeding warehouses...')
  const warehouses = await seedWarehouses(prisma)
  console.warn(`Seeded ${warehouses.count} warehouses.\n`)

  console.warn('Seeding zones...')
  const zones = await seedZones(prisma)
  console.warn(`Seeded ${zones.count} zones.\n`)

  console.warn('Seeding bins...')
  const bins = await seedBins(prisma)
  console.warn(`Seeded ${bins.count} bins.\n`)

  console.warn('Seeding users...')
  const users = await seedUsers(prisma)
  console.warn(`Seeded ${users.count} users.\n`)

  console.warn('Seeding demo device...')
  await seedDemoDevice(prisma)
  console.warn('Seeded demo device.\n')

  console.warn('Seeding suppliers and customers...')
  const businessParties = await seedBusinessParties(prisma)
  console.warn(`Seeded ${businessParties.partiesCount} business parties (${businessParties.suppliersCount} suppliers, ${businessParties.customersCount} customers).\n`)

  console.warn('Seeding item categories...')
  const itemCategories = await seedCategories(prisma)
  console.warn(`Seeded ${itemCategories.parentCount} parent categories and ${itemCategories.childCount} child categories.\n`)

  console.warn('Seeding items...')
  const seededItems = await seedItems(prisma)
  console.warn(`Seeded ${seededItems.itemsCount} items.\n`)

  console.warn('Seeding bin stock items...')
  const binStockItems = await seedBinStockItems(prisma)
  console.warn(`Seeded ${binStockItems.count} bin stock items.\n`)

  console.warn('Seeding purchase orders...')
  const purchaseOrders = await seedPurchaseOrders(prisma)
  console.warn(`Seeded ${purchaseOrders.count} purchase orders.\n`)

  return {
    unitsOfMeasureSeeded: unitsOfMeasure.count,
    warehousesSeeded: warehouses.count,
    zonesSeeded: zones.count,
    binsSeeded: bins.count,
    binStockItemsSeeded: binStockItems.count,
    purchaseOrdersSeeded: purchaseOrders.count,
    usersSeeded: users.count,
    businessPartiesSeeded: businessParties.partiesCount,
    itemCategoriesSeeded: itemCategories.parentCount + itemCategories.childCount,
    itemsSeeded: seededItems.itemsCount
  }
}
