import { describe, expect, it } from 'vitest'

import { DashboardItemsPageView } from '@/components/features/catalog/pages/dashboard-items-page-view'
import { DashboardDevicesPageView } from '@/components/features/iam/devices/dashboard-devices-page-view'
import { DashboardUsersPageView } from '@/components/features/iam/users/dashboard-users-page-view'
import { DashboardBinsPageView } from '@/components/features/locations/bins/pages/dashboard-bins-page-view'
import { DashboardLocationsPageView } from '@/components/features/locations/warehouses/pages/dashboard-location-page'
import { DashboardWarehouseHomePageView } from '@/components/features/locations/warehouses/pages/dashboard-warehouse-home-page'
import { DashboardZonesPageView } from '@/components/features/locations/zones/pages/dashboard-zones-page-view'

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
