import { describe, expect, it } from 'vitest'

import { WarehouseHomePageView } from '@/components/warehouse/home/WarehouseHomePageView'
import { WarehouseBinDetailsPageView } from '@/components/warehouse/items/WarehouseBinDetailsPageView'

describe('warehouse page component organization', () => {
  it('exports all warehouse page containers', () => {
    expect(WarehouseHomePageView).toBeTypeOf('function')
    expect(WarehouseBinDetailsPageView).toBeTypeOf('function')
  })
})
