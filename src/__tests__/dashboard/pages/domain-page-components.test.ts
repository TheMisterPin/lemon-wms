import { describe, expect, it } from 'vitest'

import { DashboardBinsPageView } from '@/components/dashboard/pages/bins/dashboard-bins-page'
import { DashboardDevicesPageView } from '@/components/dashboard/pages/devices/dashboard-devices-page'
import { DashboardHomePageView } from '@/components/dashboard/pages/home/dashboard-home-page'
import { DashboardItemsPageView } from '@/components/dashboard/pages/items/dashboard-items-page'
import { DashboardUsersPageView } from '@/components/dashboard/pages/users/dashboard-users-page'
import { DashboardWarehousesPageView } from '@/components/dashboard/pages/warehouses/dashboard-warehouses-page'
import { DashboardZonesPageView } from '@/components/dashboard/pages/zones/dashboard-zones-page'

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
