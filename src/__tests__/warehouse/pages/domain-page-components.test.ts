import { describe, expect, it } from 'vitest'

import { WarehouseBinDetailsPageView } from '@/components/warehouse/pages/bins/warehouse-bin-details-page'
import { WarehouseHomePageView } from '@/components/warehouse/pages/home/warehouse-home-page'

describe('warehouse page component organization', () => {
  it('exports all warehouse page containers', () => {
    expect(WarehouseHomePageView).toBeTypeOf('function')
    expect(WarehouseBinDetailsPageView).toBeTypeOf('function')
  })
})
