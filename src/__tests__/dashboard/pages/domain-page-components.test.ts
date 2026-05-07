import { describe, expect, it } from 'vitest'

import { DashboardBinsPageView } from '@/components/dashboard/bins/DashboardBinsPageView'
import { DashboardDevicesPageView } from '@/components/dashboard/devices/DashboardDevicesPageView'
import { DashboardItemsPageView } from '@/components/dashboard/items/DashboardItemsPageView'
import { DashboardUsersPageView } from '@/components/dashboard/users/DashboardUsersPageView'
import { DashboardLocationsPageView } from '@/components/dashboard/warehouses/dashboard-location-page'
import { DashboardWarehouseHomePageView } from '@/components/dashboard/warehouses/dashboard-warehouse-home-page'
import { DashboardZonesPageView } from '@/components/dashboard/zones/DashboardZonesPageView'

describe('dashboard page component organization', () => {
  it('exports all dashboard page containers', () => {
    expect(DashboardLocationsPageView).toBeTypeOf('function')
    expect(DashboardWarehouseHomePageView).toBeTypeOf('function')
    expect(DashboardBinsPageView).toBeTypeOf('function')
    expect(DashboardZonesPageView).toBeTypeOf('function')
    expect(DashboardDevicesPageView).toBeTypeOf('function')
    expect(DashboardItemsPageView).toBeTypeOf('function')
    expect(DashboardUsersPageView).toBeTypeOf('function')
  })
})
