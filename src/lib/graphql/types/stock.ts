import type {
  StockDashboardCategoryRow,
  StockDashboardData,
  StockDashboardItemRow,
  StockDashboardSubcategoryGroup,
  StockDashboardSubcategoryRow,
} from '@/types/stock-dashboard.types'
import { getStockDashboard } from '@/lib/entities/stock/get-stock-dashboard'

import { builder } from '../schema'

const StockDashboardItemRowType = builder
  .objectRef<StockDashboardItemRow>('StockDashboardItemRow')
  .implement({
    fields: (t) => ({
      itemId: t.exposeString('itemId'),
      sku: t.exposeString('sku'),
      name: t.exposeString('name'),
      uom: t.exposeString('uom'),
      binsCount: t.exposeInt('binsCount'),
      totalAvailable: t.exposeFloat('totalAvailable'),
      totalReserved: t.exposeFloat('totalReserved'),
      totalBlocked: t.exposeFloat('totalBlocked'),
      totalOnHand: t.exposeFloat('totalOnHand'),
    }),
  })

const StockDashboardCategoryRowType = builder
  .objectRef<StockDashboardCategoryRow>('StockDashboardCategoryRow')
  .implement({
    fields: (t) => ({
      key: t.exposeString('key'),
      label: t.exposeString('label'),
      iconUrl: t.exposeString('iconUrl', { nullable: true }),
      totalAvailable: t.exposeFloat('totalAvailable'),
      totalReserved: t.exposeFloat('totalReserved'),
      totalBlocked: t.exposeFloat('totalBlocked'),
      totalOnHand: t.exposeFloat('totalOnHand'),
    }),
  })

const StockDashboardSubcategoryRowType = builder
  .objectRef<StockDashboardSubcategoryRow>('StockDashboardSubcategoryRow')
  .implement({
    fields: (t) => ({
      name: t.exposeString('name'),
      iconUrl: t.exposeString('iconUrl', { nullable: true }),
      onHand: t.exposeFloat('onHand'),
      available: t.exposeFloat('available'),
      reserved: t.exposeFloat('reserved'),
      blocked: t.exposeFloat('blocked'),
    }),
  })

const StockDashboardSubcategoryGroupType = builder
  .objectRef<StockDashboardSubcategoryGroup>('StockDashboardSubcategoryGroup')
  .implement({
    fields: (t) => ({
      parentKey: t.exposeString('parentKey'),
      parentLabel: t.exposeString('parentLabel'),
      parentIconUrl: t.exposeString('parentIconUrl', { nullable: true }),
      rows: t.field({
        type: [StockDashboardSubcategoryRowType],
        resolve: (g) => g.rows,
      }),
    }),
  })

const StockDashboardType = builder.objectRef<StockDashboardData>('StockDashboard').implement({
  fields: (t) => ({
    warehouseId: t.exposeString('warehouseId', { nullable: true }),
    distinctSkus: t.exposeInt('distinctSkus'),
    occupiedBins: t.exposeInt('occupiedBins'),
    totalOnHand: t.exposeFloat('totalOnHand'),
    totalAvailable: t.exposeFloat('totalAvailable'),
    totalReserved: t.exposeFloat('totalReserved'),
    totalBlocked: t.exposeFloat('totalBlocked'),
    categories: t.field({ type: [StockDashboardCategoryRowType], resolve: (d) => d.categories }),
    subcategoryGroups: t.field({
      type: [StockDashboardSubcategoryGroupType],
      resolve: (d) => d.subcategoryGroups,
    }),
    items: t.field({ type: [StockDashboardItemRowType], resolve: (d) => d.items }),
  }),
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _unused = [StockDashboardItemRowType, StockDashboardCategoryRowType, StockDashboardSubcategoryRowType, StockDashboardSubcategoryGroupType]

builder.queryField('stockDashboard', (t) =>
  t.field({
    type: StockDashboardType,
    args: {
      warehouseId: t.arg.string({ required: false }),
    },
    resolve: (_root, args, ctx) => getStockDashboard(ctx.prisma, args.warehouseId ?? null),
  })
)
