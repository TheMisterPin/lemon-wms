import { describe, expect, it } from 'vitest'

import { DashboardBinsPageView } from '@/components/dashboard/bins/dashboard-bins-page-view'
import { DashboardDevicesPageView } from '@/components/dashboard/devices/dashboard-devices-page-view'
import { DashboardItemsPageView } from '@/components/dashboard/items/dashboard-items-page-view'
import { DashboardUsersPageView } from '@/components/dashboard/users/dashboard-users-page-view'
import { DashboardLocationsPageView } from '@/components/dashboard/warehouses/dashboard-location-page'
import { DashboardWarehouseHomePageView } from '@/components/dashboard/warehouses/dashboard-warehouse-home-page'
import { DashboardZonesPageView } from '@/components/dashboard/zones/dashboard-zones-page-view'

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
