import { WarehouseStatus, Prisma } from '@/generated/prisma'

export const warehouses: Prisma.WarehouseCreateManyInput[] = [
  { id: 'WH-0001', name: 'Newark Fulfillment Center', address: '445 Port Newark Blvd, Newark, NJ, USA', timezone: 'America/New_York', currency: 'USD', status: WarehouseStatus.ACTIVE },
  { id: 'WH-0002', name: 'Chicago Regional DC', address: '2800 Logistics Pkwy, Joliet, IL, USA', timezone: 'America/Chicago', currency: 'USD', status: WarehouseStatus.ACTIVE },
  { id: 'WH-0003', name: 'Dallas Crossdock Hub', address: '901 Commerce Dr, Dallas, TX, USA', timezone: 'America/Chicago', currency: 'USD', status: WarehouseStatus.ACTIVE },
  { id: 'WH-0004', name: 'Los Angeles Import Hub', address: '1201 Harbor St, Carson, CA, USA', timezone: 'America/Los_Angeles', currency: 'USD', status: WarehouseStatus.ACTIVE },
  { id: 'WH-0005', name: 'Seattle North Distribution', address: '7750 Aurora Ave N, Seattle, WA, USA', timezone: 'America/Los_Angeles', currency: 'USD', status: WarehouseStatus.ACTIVE },
  { id: 'WH-0006', name: 'Atlanta Southeast DC', address: '2200 Peachtree Industrial Blvd, Atlanta, GA, USA', timezone: 'America/New_York', currency: 'USD', status: WarehouseStatus.ACTIVE },
  { id: 'WH-0007', name: 'Denver Mountain Storage', address: '6400 Gateway Rd, Aurora, CO, USA', timezone: 'America/Denver', currency: 'USD', status: WarehouseStatus.ACTIVE },
  { id: 'WH-0008', name: 'Phoenix E-Commerce Node', address: '3900 Desert Sky Way, Phoenix, AZ, USA', timezone: 'America/Phoenix', currency: 'USD', status: WarehouseStatus.ACTIVE },
  { id: 'WH-0009', name: 'Miami Export Facility', address: '3100 Doral Logistics Ln, Miami, FL, USA', timezone: 'America/New_York', currency: 'USD', status: WarehouseStatus.ACTIVE },
  { id: 'WH-0010', name: 'Boston Metro Warehouse', address: '98 Industrial Park Rd, Braintree, MA, USA', timezone: 'America/New_York', currency: 'USD', status: WarehouseStatus.ACTIVE }
]
