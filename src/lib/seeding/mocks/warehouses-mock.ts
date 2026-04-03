import { WarehouseStatus } from '@/generated/prisma'

export const warehouses = [
  { id: 'W01', name: 'Metropolitan Distribution Hub',    address: '100 Logistics Ave, New York, NY 10001, USA',          timezone: 'America/New_York',    currency: 'USD', status: WarehouseStatus.ACTIVE },
  { id: 'W02', name: 'Pacific Coast Fulfillment Center', address: '2500 Harbor Blvd, Los Angeles, CA 90001, USA',         timezone: 'America/Los_Angeles', currency: 'USD', status: WarehouseStatus.ACTIVE },
  { id: 'W03', name: 'Great Lakes Logistics Depot',      address: '3800 Industrial Pkwy, Chicago, IL 60601, USA',         timezone: 'America/Chicago',     currency: 'USD', status: WarehouseStatus.ACTIVE },
  { id: 'W04', name: 'Southern Regional Warehouse',      address: '720 Peachtree Rd NE, Atlanta, GA 30301, USA',          timezone: 'America/New_York',    currency: 'USD', status: WarehouseStatus.ACTIVE },
  { id: 'W05', name: 'Mountain States Storage Center',   address: '4400 Colorado Blvd, Denver, CO 80201, USA',            timezone: 'America/Denver',      currency: 'USD', status: WarehouseStatus.ACTIVE },
  { id: 'W06', name: 'Northeast Cold Storage Facility',  address: '88 Seaport Blvd, Boston, MA 02101, USA',               timezone: 'America/New_York',    currency: 'USD', status: WarehouseStatus.ACTIVE },
  { id: 'W07', name: 'Gulf Coast Distribution Center',   address: '9900 Beltway 8 S, Houston, TX 77001, USA',             timezone: 'America/Chicago',     currency: 'USD', status: WarehouseStatus.ACTIVE },
  { id: 'W08', name: 'Pacific Northwest Regional Hub',   address: '1200 Airport Way S, Seattle, WA 98108, USA',           timezone: 'America/Los_Angeles', currency: 'USD', status: WarehouseStatus.ACTIVE },
  { id: 'W09', name: 'Mid-Atlantic Fulfillment Center',  address: '3600 Market St, Philadelphia, PA 19104, USA',          timezone: 'America/New_York',    currency: 'USD', status: WarehouseStatus.ACTIVE },
  { id: 'W10', name: 'Sunbelt Regional Depot',           address: '2200 S 75th Ave, Phoenix, AZ 85043, USA',              timezone: 'America/Phoenix',     currency: 'USD', status: WarehouseStatus.ACTIVE },
]
