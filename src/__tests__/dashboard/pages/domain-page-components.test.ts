import { describe, expect, it } from 'vitest'

import { DashboardBinsPageView } from '@/components/dashboard/bins/DashboardBinsPageView'
import { DashboardDevicesPageView } from '@/components/dashboard/devices/DashboardDevicesPageView'
import { DashboardHomePageView } from '@/components/dashboard/home/DashboardHomePageView'
import { DashboardItemsPageView } from '@/components/dashboard/items/DashboardItemsPageView'
import { DashboardUsersPageView } from '@/components/dashboard/users/DashboardUsersPageView'
import { DashboardWarehousesPageView } from '@/components/dashboard/warehouses/DashboardWarehousesPageView'
import { DashboardZonesPageView } from '@/components/dashboard/zones/DashboardZonesPageView'

describe('dashboard page component organization', () => {
  it('exports all dashboard page containers', () => {
    expect(DashboardHomePageView).toBeTypeOf('function')
    expect(DashboardWarehousesPageView).toBeTypeOf('function')
    expect(DashboardBinsPageView).toBeTypeOf('function')
    expect(DashboardZonesPageView).toBeTypeOf('function')
    expect(DashboardDevicesPageView).toBeTypeOf('function')
    expect(DashboardItemsPageView).toBeTypeOf('function')
    expect(DashboardUsersPageView).toBeTypeOf('function')
  })
})
