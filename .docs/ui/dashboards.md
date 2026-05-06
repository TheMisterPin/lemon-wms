
# 1.  Devices Dashboard

## Route

```txt
/dashboard/auth/devices
```

## Purpose

Device health and authorization control.

## Total Sections

```txt
5 sections
```

## Section 1 — Header

Title and filters:

- warehouse
    
- authorization status
    
- online status
    
- assigned user
    

## Section 2 — Badge/KPI Row

- Active devices
    
- Authorized devices
    
- Pending authorization
    
- Offline devices
    
- Devices with active orders
    
- Devices linked to trolleys
    

## Section 3 — Status Tabs

Tabs:

- Active
    
- Authorized
    
- Pending Authorization
    
- Offline
    

## Section 4 — Device Table

```txt
Device | Warehouse | User | Status | Authorization | Last seen | Current order | View
```

## Section 5 — Trolley Table

```txt
Trolley | Device | User | Warehouse | Items | Orders linked | View
```

## Data Shape

```ts
type DevicesDashboardDTO = {
  header: DashboardHeader
  kpis: DashboardKpi[]
  tabs: DeviceStatusTab[]
  devices: DeviceRow[]
  trolleys: TrolleySummaryRow[]
}

type DeviceStatusTab = {
  key: 'ACTIVE' | 'AUTHORIZED' | 'PENDING' | 'OFFLINE'
  label: string
  count: number
}

type DeviceRow = {
  deviceId: string
  code: string
  label: string
  warehouseId?: string
  warehouseName?: string
  userId?: string
  userName?: string
  onlineStatus: 'ACTIVE' | 'OFFLINE' | 'IDLE'
  authorizationStatus: 'AUTHORIZED' | 'PENDING' | 'REJECTED'
  lastSeenAt?: string
  currentOrderLabel?: string
  href: string
}

type TrolleySummaryRow = {
  trolleyId: string
  code: string
  deviceCode?: string
  userName?: string
  warehouseName: string
  itemCount: number
  linkedOrdersCount: number
  href: string
}
```

---

# 2. Device Detail Dashboard

## Route

```txt
/dashboard/auth/devices/:deviceId
```

## Purpose

Debug one physical/logical device.

## Total Sections

```txt
4 sections
```

## Section 1 — Header

```txt
Device code
Device label
Authorization status
Online status
Warehouse
Current user
```

## Section 2 — KPI Grid

- Current assignment
    
- Orders handled today
    
- Last active
    
- Current trolley
    
- Error count
    
- Pending sync events
    

## Section 3 — Current Work

```txt
Order | Type | Progress | User | Started at | View
```

## Section 4 — Device Activity

```txt
Time | User | Action | Warehouse | Entity | Details
```

## Data Shape

```ts
type DeviceDetailDashboardDTO = {
  header: DashboardHeader & {
    deviceId: string
    deviceCode: string
    authorizationStatus: string
    onlineStatus: string
  }
  kpis: DashboardKpi[]
  currentWork: DeviceCurrentWorkRow[]
  activity: ActivityTimelineRow[]
}

type DeviceCurrentWorkRow = {
  orderId: string
  orderLabel: string
  orderType: 'SALES' | 'PURCHASE' | 'TRANSFER' | 'ADJUSTMENT'
  progressPercent: number
  userId: string
  userName: string
  startedAt: string
  href: string
}
```



---

# 3. Global Orders Dashboard

## Route

```txt
/dashboard/orders
```

## Purpose

Cross-warehouse order visibility.

## Total Sections

```txt
5 sections
```

## Section 1 — Header

Filters:

- warehouse
    
- order type
    
- status
    
- assigned user
    
- date range
    

## Section 2 — KPI Grid

- Released
    
- Unassigned
    
- Assigned
    
- Active
    
- Paused
    
- Completed
    
- Exceptions
    
- Average completion time
    

## Section 3 — Summary Charts

- Order type donut
    
- Status stacked bar
    
- Warehouse workload bar
    
- Aging bucket chart
    

## Section 4 — Attention Cards

Small cards for:

- oldest released orders
    
- blocked orders
    
- paused too long
    
- unassigned high-priority orders
    

## Section 5 — Orders Table

```txt
Order | Type | Warehouse | Status | Progress | Assigned user | Started at | Last activity | View
```

## Data Shape

```ts
type OrdersDashboardDTO = {
  header: DashboardHeader
  kpis: DashboardKpi[]
  orderTypeDistribution: OrderTypeSlice[]
  statusBreakdown: OrderStatusBreakdown[]
  warehouseWorkload: WarehouseWorkloadRow[]
  attention: OrderAttentionCard[]
  orders: OrderSummaryRow[]
}

type OrderTypeSlice = {
  type: 'SALES' | 'PURCHASE' | 'TRANSFER' | 'ADJUSTMENT'
  count: number
  href: string
}

type OrderStatusBreakdown = {
  label: string
  released: number
  assigned: number
  active: number
  paused: number
  completed: number
  exception: number
}

type WarehouseWorkloadRow = {
  warehouseId: string
  warehouseName: string
  active: number
  released: number
  completedToday: number
  exceptions: number
  href: string
}

type OrderAttentionCard = {
  orderId: string
  orderLabel: string
  type: string
  reason: string
  tone: 'warning' | 'danger' | 'neutral'
  href: string
}

type OrderSummaryRow = {
  orderId: string
  orderLabel: string
  type: 'SALES' | 'PURCHASE' | 'TRANSFER' | 'ADJUSTMENT'
  warehouseId: string
  warehouseName: string
  status: 'DRAFT' | 'RELEASED' | 'ASSIGNED' | 'EXECUTING' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
  progressPercent: number
  assignedUserName?: string
  startedAt?: string
  lastActivityAt?: string
  href: string
}
```


---

# 4. Order Detail / Execution Dashboard

## Route

```txt
/dashboard/orders/:type/:orderId
```

## Purpose

Explain one order: status, lines, assignments, activity, and movements.

## Total Sections

```txt
6 sections
```

## Section 1 — Header

```txt
Order number
Order type
Warehouse
Status
Progress
Assigned user/device
```

## Section 2 — KPI Grid

- Total lines
    
- Completed lines
    
- Remaining lines
    
- Expected quantity
    
- Processed quantity
    
- Rejected/quarantined quantity
    
- Exceptions
    
- Duration
    

## Section 3 — Line Table

```txt
SKU | Name | Expected | Processed | Remaining | Status | Outcome | View
```

## Section 4 — Assignment Table

```txt
User | Status | Started | Paused | Completed | Duration
```

## Section 5 — Activity Timeline

```txt
Time | User | Action | Line | Quantity | Outcome | Details
```

## Section 6 — Movement Table

```txt
Time | SKU | From | To | Quantity | BOE | User
```

## Data Shape

```ts
type OrderDetailDashboardDTO = {
  header: DashboardHeader & {
    orderId: string
    orderLabel: string
    orderType: string
    warehouseName: string
    progressPercent: number
  }
  kpis: DashboardKpi[]
  lines: OrderExecutionLineRow[]
  assignments: OrderAssignmentRow[]
  activity: OrderActivityRow[]
  movements: OrderMovementRow[]
}

type OrderExecutionLineRow = {
  lineId: string
  itemId: string
  sku: string
  name: string
  expectedQty: number
  processedQty: number
  remainingQty: number
  uom: string
  status: 'OPEN' | 'PARTIAL' | 'COMPLETED' | 'EXCEPTION'
  outcome?: 'ACCEPTED' | 'DAMAGED' | 'EXPIRED' | 'REJECTED' | 'QUARANTINED' | 'QUALITY_ISSUE'
  href: string
}

type OrderAssignmentRow = {
  assignmentId: string
  userId: string
  userName: string
  status: 'ASSIGNED' | 'STARTED' | 'PAUSED' | 'RESUMED' | 'COMPLETED' | 'CANCELLED'
  startedAt?: string
  pausedAt?: string
  completedAt?: string
  durationLabel?: string
}

type OrderActivityRow = {
  activityId: string
  occurredAt: string
  userName: string
  action: string
  lineLabel?: string
  quantity?: number
  outcome?: string
  details: string
}

type OrderMovementRow = {
  movementId: string
  occurredAt: string
  sku: string
  fromBinCode?: string
  toBinCode?: string
  quantity: number
  boeId: string
  userName: string
}
```


---

# 5. Category Stock Dashboard

## Route

```txt
/dashboard/stock/categories
/dashboard/stock/categories/:categoryId
```

## Purpose

Analyze stock by category and subcategory.

## Total Sections

```txt
5 sections
```

## Section 1 — Header

```txt
Category Stock Overview
Optional selected category
Filters: warehouse, zone, stock status
```

## Section 2 — Category KPI Cards

One card per parent category:

```txt
Category name
Total on hand
Available
Reserved
Blocked
```

This matches your current stock page pattern: category cards, total on hand, and status numbers.

## Section 3 — Summary Charts

- On-hand by category donut
    
- Stock breakdown horizontal stacked bar
    

## Section 4 — Subcategory Panels

Each parent category has a panel:

```txt
Subcategory | On hand | Available | Reserved | Blocked
```

## Section 5 — Items Table

```txt
SKU | Name | Category | Quantity | Available | Reserved | Blocked | View
```

## Data Shape

```ts
type CategoryStockDashboardDTO = {
  header: DashboardHeader
  categoryCards: CategoryStockCard[]
  categoryDistribution: StockCategorySlice[]
  statusBreakdown: StockBreakdownBar[]
  subcategoryGroups: SubcategoryStockGroup[]
  lowStockItems: LowStockItemRow[]
  items: StockItemSummaryRow[]
}

type CategoryStockCard = {
  categoryId: string
  name: string
  iconName?: string
  totalOnHand: number
  available: number
  reserved: number
  blocked: number
  href: string
}

type SubcategoryStockGroup = {
  parentCategoryId: string
  parentCategoryName: string
  rows: {
    categoryId: string
    name: string
    onHand: number
    available: number
    reserved: number
    blocked: number
    href: string
  }[]
}

type LowStockItemRow = {
  itemId: string
  sku: string
  name: string
  available: number
  minimumExpected: number
  shortage: number
  warehouseName?: string
  href: string
}
```

---

# 6. Item Detail Dashboard

## Route

```txt
/dashboard/stock/items/:itemId
```

## Purpose

Explain one SKU across all warehouses, bins, orders, and movements.

## Total Sections

```txt
6 sections
```

## Section 1 — Header

```txt
SKU
Item name
Category
UOM
Handling flags
```

## Section 2 — KPI Grid

- Total on hand
    
- Available
    
- Reserved
    
- Blocked
    
- Warehouses carrying item
    
- Bin count
    
- Open orders
    
- Expiring lots
    

## Section 3 — Stock by Warehouse

```txt
Warehouse | On hand | Available | Reserved | Blocked | Bins | View
```

## Section 4 — Stock by Bin

```txt
Warehouse | Zone | Bin | Lot | Serial | Available | Reserved | Blocked | Status
```

## Section 5 — Orders Using Item

```txt
Order | Type | Warehouse | Required | Processed | Status | View
```

## Section 6 — Movement Timeline

```txt
Time | Action | Warehouse | From | To | Quantity | User | BOE
```

## Data Shape

```ts
type ItemDetailDashboardDTO = {
  header: DashboardHeader & {
    itemId: string
    sku: string
    categoryName: string
    uom: string
    handlingFlags: string[]
  }
  kpis: DashboardKpi[]
  stockByWarehouse: ItemWarehouseStockRow[]
  stockByBin: ItemBinStockRow[]
  orders: ItemOrderRow[]
  movements: OrderMovementRow[]
}

type ItemWarehouseStockRow = {
  warehouseId: string
  warehouseName: string
  totalOnHand: number
  available: number
  reserved: number
  blocked: number
  binsCount: number
  href: string
}

type ItemBinStockRow = {
  binStockItemId: string
  warehouseName: string
  zoneName: string
  binCode: string
  lotCode?: string
  serialNumber?: string
  available: number
  reserved: number
  blocked: number
  status: string
  href: string
}

type ItemOrderRow = {
  orderId: string
  orderLabel: string
  type: string
  warehouseName: string
  requiredQty: number
  processedQty: number
  status: string
  href: string
}
```


# 7. Users Dashboard

## Route

```txt
/dashboard/auth/users
/dashboard/warehouses/:warehouseId/users
```

## Purpose

Operator status and workload.

## Total Sections

```txt
4 sections
```

## Section 1 — Header

Filters:

- warehouse
    
- role
    
- status
    
- active order
    

## Section 2 — Status Badges

- Active
    
- Idle
    
- Logged out
    
- Assigned
    
- In exception flow
    

## Section 3 — Warehouse User KPI Table

```txt
Warehouse | Active users | Idle users | Total users | Active orders | Avg orders/user
```

## Section 4 — Users Table

```txt
User | Role | Warehouse | Status | Active order | Device | Last activity | View
```

## Data Shape

```ts
type UsersDashboardDTO = {
  header: DashboardHeader
  kpis: DashboardKpi[]
  warehouseSummaries: WarehouseUserSummaryRow[]
  users: UserSummaryRow[]
}

type WarehouseUserSummaryRow = {
  warehouseId: string
  warehouseName: string
  activeUsers: number
  idleUsers: number
  totalUsers: number
  activeOrders: number
  averageOrdersPerUser: number
  href: string
}

type UserSummaryRow = {
  userId: string
  name: string
  role: string
  warehouseId?: string
  warehouseName?: string
  status: 'ACTIVE' | 'IDLE' | 'LOGGED_OUT' | 'IN_EXCEPTION'
  activeOrderLabel?: string
  deviceCode?: string
  lastActivityAt?: string
  href: string
}
```


# 8. User Detail Dashboard

## Route

```txt
/dashboard/users/:userId
```

## Purpose

Explain one user’s work, sessions, orders, movements, and activity.

## Total Sections

```txt
6 sections + 1 modal
```

## Section 1 — Header

```txt
Name
Role
Status badge
Warehouse
Current device
Last seen
```

## Section 2 — KPI Grid

- Active orders
    
- Completed orders today
    
- Total completed
    
- Last device
    
- Current warehouse
    
- Exceptions handled
    
- Average completion time
    

## Section 3 — Current Work

```txt
Order | Type | Warehouse | Progress | Started at | View
```

## Section 4 — Activity Tabs

Tabs:

- Login/logout
    
- Orders
    
- Movements
    
- Devices
    
- Exceptions
    

Table:

```txt
Time | Type | Action | Warehouse | Entity | Details
```

## Section 5 — Orders Table

```txt
Order | Type | Status | Progress | Started | Completed | View
```

## Section 6 — Sessions Table

```txt
Login | Logout | Duration | Device | Warehouse
```

## Modal — User Activity Modal

```txt
Action
Timestamp
Warehouse
Order
Device
Metadata
Raw technical details
```

## Data Shape

```ts
type UserDetailDashboardDTO = {
  header: DashboardHeader & {
    userId: string
    name: string
    role: string
    currentWarehouseName?: string
    currentDeviceCode?: string
  }
  kpis: DashboardKpi[]
  currentWork: DeviceCurrentWorkRow[]
  activity: UserActivityRow[]
  orders: OrderSummaryRow[]
  sessions: UserSessionRow[]
}

type UserActivityRow = {
  activityId: string
  occurredAt: string
  type: 'LOGIN' | 'LOGOUT' | 'ORDER' | 'MOVEMENT' | 'DEVICE' | 'EXCEPTION'
  action: string
  warehouseName?: string
  entityLabel?: string
  details: string
  metadata?: Record<string, unknown>
}

type UserSessionRow = {
  sessionId: string
  loginAt: string
  logoutAt?: string
  durationLabel?: string
  deviceCode?: string
  warehouseName?: string
}
```



---

# 9. Inventory Health Dashboard

## Route

```txt
/dashboard/stock/health
```

## Purpose

Inventory quality dashboard. Not “how much stock exists,” but “what stock is a problem.”

## Total Sections

```txt
5 sections
```

## Section 1 — Header

Filters:

- warehouse
    
- category
    
- issue type
    
- severity
    

## Section 2 — KPI Grid

- Low stock SKUs
    
- Overstock SKUs
    
- Blocked stock
    
- Quarantine stock
    
- Expiring soon
    
- Invalid stock states
    
- Orphaned stock records
    

## Section 3 — Health Charts

- Issue type donut
    
- Category health bar
    
- Warehouse health comparison
    

## Section 4 — Alert Cards

Cards for the worst issues:

```txt
Issue title
Entity
Severity
Reason
Action
```

## Section 5 — Health Table

```txt
Issue | Type | SKU/Bin/Order | Warehouse | Severity | Quantity | Detected at | View
```

## Data Shape

```ts
type InventoryHealthDashboardDTO = {
  header: DashboardHeader
  kpis: DashboardKpi[]
  issueDistribution: InventoryHealthIssueSlice[]
  categoryHealth: CategoryHealthRow[]
  warehouseHealth: WarehouseHealthRow[]
  alerts: InventoryHealthAlert[]
  issues: InventoryHealthIssueRow[]
}

type InventoryHealthIssueSlice = {
  type: 'LOW_STOCK' | 'OVERSTOCK' | 'BLOCKED' | 'QUARANTINE' | 'EXPIRING' | 'INVALID_STATE'
  count: number
}

type CategoryHealthRow = {
  categoryId: string
  categoryName: string
  lowStock: number
  blocked: number
  expiring: number
  quarantine: number
  href: string
}

type WarehouseHealthRow = {
  warehouseId: string
  warehouseName: string
  issueCount: number
  criticalCount: number
  warningCount: number
  href: string
}

type InventoryHealthAlert = {
  id: string
  title: string
  entityLabel: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  reason: string
  href: string
}

type InventoryHealthIssueRow = {
  issueId: string
  type: string
  entityLabel: string
  warehouseName: string
  severity: string
  quantity?: number
  detectedAt: string
  href: string
}
```

---
