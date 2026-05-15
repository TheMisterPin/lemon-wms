import { describe, expect, it } from 'vitest'

import { WarehouseHomePageView } from '@/components/warehouse/orders/warehouse-home-page-view'
import { WarehouseBinDetailsPageView } from '@/components/warehouse/items/warehouse-bin-details-page-view'

describe('warehouse page component organization', () => {
  it('exports all warehouse page containers', () => {
    expect(WarehouseHomePageView).toBeTypeOf('function')
    expect(WarehouseBinDetailsPageView).toBeTypeOf('function')
  })
})
