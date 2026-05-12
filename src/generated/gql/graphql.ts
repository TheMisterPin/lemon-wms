/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Maybe<T> = T | null | undefined;
export type InputMaybe<T> = T | null | undefined;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type CategoryHealthRow = {
  __typename?: 'CategoryHealthRow';
  blocked: Maybe<Scalars['Int']['output']>;
  categoryId: Maybe<Scalars['String']['output']>;
  categoryName: Maybe<Scalars['String']['output']>;
  expiring: Maybe<Scalars['Int']['output']>;
  href: Maybe<Scalars['String']['output']>;
  lowStock: Maybe<Scalars['Int']['output']>;
  quarantine: Maybe<Scalars['Int']['output']>;
};

export type DashboardHeader = {
  __typename?: 'DashboardHeader';
  subtitle: Maybe<Scalars['String']['output']>;
  title: Maybe<Scalars['String']['output']>;
};

export type DashboardKpi = {
  __typename?: 'DashboardKpi';
  helper: Maybe<Scalars['String']['output']>;
  label: Maybe<Scalars['String']['output']>;
  tone: Maybe<Scalars['String']['output']>;
  value: Maybe<Scalars['String']['output']>;
};

export type DeviceRow = {
  __typename?: 'DeviceRow';
  authorizationStatus: Maybe<Scalars['String']['output']>;
  code: Maybe<Scalars['String']['output']>;
  currentOrderLabel: Maybe<Scalars['String']['output']>;
  deviceId: Maybe<Scalars['String']['output']>;
  href: Maybe<Scalars['String']['output']>;
  label: Maybe<Scalars['String']['output']>;
  lastSeenAt: Maybe<Scalars['String']['output']>;
  onlineStatus: Maybe<Scalars['String']['output']>;
  userId: Maybe<Scalars['String']['output']>;
  userName: Maybe<Scalars['String']['output']>;
  warehouseId: Maybe<Scalars['String']['output']>;
  warehouseName: Maybe<Scalars['String']['output']>;
};

export type DeviceStatusTab = {
  __typename?: 'DeviceStatusTab';
  count: Maybe<Scalars['Int']['output']>;
  key: Maybe<Scalars['String']['output']>;
  label: Maybe<Scalars['String']['output']>;
};

export type DevicesDashboard = {
  __typename?: 'DevicesDashboard';
  devices: Maybe<Array<DeviceRow>>;
  header: Maybe<DashboardHeader>;
  kpis: Maybe<Array<DashboardKpi>>;
  tabs: Maybe<Array<DeviceStatusTab>>;
  trolleys: Maybe<Array<TrolleySummaryRow>>;
};

export type InventoryHealthAlert = {
  __typename?: 'InventoryHealthAlert';
  entityLabel: Maybe<Scalars['String']['output']>;
  href: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['String']['output']>;
  reason: Maybe<Scalars['String']['output']>;
  severity: Maybe<Scalars['String']['output']>;
  title: Maybe<Scalars['String']['output']>;
};

export type InventoryHealthDashboard = {
  __typename?: 'InventoryHealthDashboard';
  alerts: Maybe<Array<InventoryHealthAlert>>;
  categoryHealth: Maybe<Array<CategoryHealthRow>>;
  header: Maybe<DashboardHeader>;
  issueDistribution: Maybe<Array<InventoryHealthIssueSlice>>;
  issues: Maybe<Array<InventoryHealthIssueRow>>;
  kpis: Maybe<Array<DashboardKpi>>;
  warehouseHealth: Maybe<Array<WarehouseHealthRow>>;
};

export type InventoryHealthIssueRow = {
  __typename?: 'InventoryHealthIssueRow';
  detectedAt: Maybe<Scalars['String']['output']>;
  entityLabel: Maybe<Scalars['String']['output']>;
  href: Maybe<Scalars['String']['output']>;
  issueId: Maybe<Scalars['String']['output']>;
  quantity: Maybe<Scalars['Float']['output']>;
  severity: Maybe<Scalars['String']['output']>;
  type: Maybe<Scalars['String']['output']>;
  warehouseName: Maybe<Scalars['String']['output']>;
};

export type InventoryHealthIssueSlice = {
  __typename?: 'InventoryHealthIssueSlice';
  count: Maybe<Scalars['Int']['output']>;
  type: Maybe<Scalars['String']['output']>;
};

export type OrderAttentionCard = {
  __typename?: 'OrderAttentionCard';
  href: Maybe<Scalars['String']['output']>;
  orderId: Maybe<Scalars['String']['output']>;
  orderLabel: Maybe<Scalars['String']['output']>;
  reason: Maybe<Scalars['String']['output']>;
  tone: Maybe<Scalars['String']['output']>;
  type: Maybe<Scalars['String']['output']>;
};

export type OrderStatusBreakdown = {
  __typename?: 'OrderStatusBreakdown';
  active: Maybe<Scalars['Int']['output']>;
  assigned: Maybe<Scalars['Int']['output']>;
  completed: Maybe<Scalars['Int']['output']>;
  exception: Maybe<Scalars['Int']['output']>;
  label: Maybe<Scalars['String']['output']>;
  paused: Maybe<Scalars['Int']['output']>;
  released: Maybe<Scalars['Int']['output']>;
};

export type OrderSummaryRow = {
  __typename?: 'OrderSummaryRow';
  assignedUserName: Maybe<Scalars['String']['output']>;
  href: Maybe<Scalars['String']['output']>;
  lastActivityAt: Maybe<Scalars['String']['output']>;
  orderId: Maybe<Scalars['String']['output']>;
  orderLabel: Maybe<Scalars['String']['output']>;
  progressPercent: Maybe<Scalars['Float']['output']>;
  startedAt: Maybe<Scalars['String']['output']>;
  status: Maybe<Scalars['String']['output']>;
  type: Maybe<Scalars['String']['output']>;
  warehouseId: Maybe<Scalars['String']['output']>;
  warehouseName: Maybe<Scalars['String']['output']>;
};

export type OrderTypeSlice = {
  __typename?: 'OrderTypeSlice';
  count: Maybe<Scalars['Int']['output']>;
  href: Maybe<Scalars['String']['output']>;
  type: Maybe<Scalars['String']['output']>;
};

export type OrdersDashboard = {
  __typename?: 'OrdersDashboard';
  attention: Maybe<Array<OrderAttentionCard>>;
  header: Maybe<DashboardHeader>;
  kpis: Maybe<Array<DashboardKpi>>;
  orderTypeDistribution: Maybe<Array<OrderTypeSlice>>;
  orders: Maybe<Array<OrderSummaryRow>>;
  statusBreakdown: Maybe<Array<OrderStatusBreakdown>>;
  warehouseWorkload: Maybe<Array<WarehouseWorkloadRow>>;
};

export type Query = {
  __typename?: 'Query';
  devicesDashboard: Maybe<DevicesDashboard>;
  inventoryHealthDashboard: Maybe<InventoryHealthDashboard>;
  ordersDashboard: Maybe<OrdersDashboard>;
  stockDashboard: Maybe<StockDashboard>;
  usersDashboard: Maybe<UsersDashboard>;
  warehouseOverviewDashboard: Maybe<WarehouseOverviewDashboard>;
};


export type QueryStockDashboardArgs = {
  warehouseId: InputMaybe<Scalars['String']['input']>;
};


export type QueryUsersDashboardArgs = {
  warehouseId: InputMaybe<Scalars['String']['input']>;
};


export type QueryWarehouseOverviewDashboardArgs = {
  id: Scalars['String']['input'];
};

export type StockDashboard = {
  __typename?: 'StockDashboard';
  categories: Maybe<Array<StockDashboardCategoryRow>>;
  distinctSkus: Maybe<Scalars['Int']['output']>;
  items: Maybe<Array<StockDashboardItemRow>>;
  occupiedBins: Maybe<Scalars['Int']['output']>;
  subcategoryGroups: Maybe<Array<StockDashboardSubcategoryGroup>>;
  totalAvailable: Maybe<Scalars['Float']['output']>;
  totalBlocked: Maybe<Scalars['Float']['output']>;
  totalOnHand: Maybe<Scalars['Float']['output']>;
  totalReserved: Maybe<Scalars['Float']['output']>;
  warehouseId: Maybe<Scalars['String']['output']>;
};

export type StockDashboardCategoryRow = {
  __typename?: 'StockDashboardCategoryRow';
  iconUrl: Maybe<Scalars['String']['output']>;
  key: Maybe<Scalars['String']['output']>;
  label: Maybe<Scalars['String']['output']>;
  totalAvailable: Maybe<Scalars['Float']['output']>;
  totalBlocked: Maybe<Scalars['Float']['output']>;
  totalOnHand: Maybe<Scalars['Float']['output']>;
  totalReserved: Maybe<Scalars['Float']['output']>;
};

export type StockDashboardItemRow = {
  __typename?: 'StockDashboardItemRow';
  binsCount: Maybe<Scalars['Int']['output']>;
  itemId: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  sku: Maybe<Scalars['String']['output']>;
  totalAvailable: Maybe<Scalars['Float']['output']>;
  totalBlocked: Maybe<Scalars['Float']['output']>;
  totalOnHand: Maybe<Scalars['Float']['output']>;
  totalReserved: Maybe<Scalars['Float']['output']>;
  uom: Maybe<Scalars['String']['output']>;
};

export type StockDashboardSubcategoryGroup = {
  __typename?: 'StockDashboardSubcategoryGroup';
  parentIconUrl: Maybe<Scalars['String']['output']>;
  parentKey: Maybe<Scalars['String']['output']>;
  parentLabel: Maybe<Scalars['String']['output']>;
  rows: Maybe<Array<StockDashboardSubcategoryRow>>;
};

export type StockDashboardSubcategoryRow = {
  __typename?: 'StockDashboardSubcategoryRow';
  available: Maybe<Scalars['Float']['output']>;
  blocked: Maybe<Scalars['Float']['output']>;
  iconUrl: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  onHand: Maybe<Scalars['Float']['output']>;
  reserved: Maybe<Scalars['Float']['output']>;
};

export type TrolleySummaryRow = {
  __typename?: 'TrolleySummaryRow';
  code: Maybe<Scalars['String']['output']>;
  deviceCode: Maybe<Scalars['String']['output']>;
  href: Maybe<Scalars['String']['output']>;
  itemCount: Maybe<Scalars['Int']['output']>;
  linkedOrdersCount: Maybe<Scalars['Int']['output']>;
  trolleyId: Maybe<Scalars['String']['output']>;
  userName: Maybe<Scalars['String']['output']>;
  warehouseName: Maybe<Scalars['String']['output']>;
};

export type UserSummaryRow = {
  __typename?: 'UserSummaryRow';
  activeOrderLabel: Maybe<Scalars['String']['output']>;
  deviceCode: Maybe<Scalars['String']['output']>;
  href: Maybe<Scalars['String']['output']>;
  lastActivityAt: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  role: Maybe<Scalars['String']['output']>;
  status: Maybe<Scalars['String']['output']>;
  userId: Maybe<Scalars['String']['output']>;
  warehouseId: Maybe<Scalars['String']['output']>;
  warehouseName: Maybe<Scalars['String']['output']>;
};

export type UsersDashboard = {
  __typename?: 'UsersDashboard';
  header: Maybe<DashboardHeader>;
  kpis: Maybe<Array<DashboardKpi>>;
  users: Maybe<Array<UserSummaryRow>>;
  warehouseSummaries: Maybe<Array<WarehouseUserSummaryRow>>;
};

export type WarehouseActivityRow = {
  __typename?: 'WarehouseActivityRow';
  action: Maybe<Scalars['String']['output']>;
  entity: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['String']['output']>;
  status: Maybe<Scalars['String']['output']>;
  time: Maybe<Scalars['String']['output']>;
  user: Maybe<Scalars['String']['output']>;
};

export type WarehouseHealthRow = {
  __typename?: 'WarehouseHealthRow';
  criticalCount: Maybe<Scalars['Int']['output']>;
  href: Maybe<Scalars['String']['output']>;
  issueCount: Maybe<Scalars['Int']['output']>;
  warehouseId: Maybe<Scalars['String']['output']>;
  warehouseName: Maybe<Scalars['String']['output']>;
  warningCount: Maybe<Scalars['Int']['output']>;
};

export type WarehouseInfo = {
  __typename?: 'WarehouseInfo';
  code: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['String']['output']>;
  lastActivityRelative: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
};

export type WarehouseOrderTypeRow = {
  __typename?: 'WarehouseOrderTypeRow';
  active: Maybe<Scalars['Int']['output']>;
  assigned: Maybe<Scalars['Int']['output']>;
  completed: Maybe<Scalars['Int']['output']>;
  exceptions: Maybe<Scalars['Int']['output']>;
  paused: Maybe<Scalars['Int']['output']>;
  released: Maybe<Scalars['Int']['output']>;
  type: Maybe<Scalars['String']['output']>;
};

export type WarehouseOverviewDashboard = {
  __typename?: 'WarehouseOverviewDashboard';
  activity: Maybe<Array<WarehouseActivityRow>>;
  kpis: Maybe<Array<WarehouseOverviewKpi>>;
  orderTypes: Maybe<Array<WarehouseOrderTypeRow>>;
  stockCategories: Maybe<Array<WarehouseStockCategoryRow>>;
  warehouse: Maybe<WarehouseInfo>;
  zones: Maybe<Array<WarehouseZoneSummaryRow>>;
};

export type WarehouseOverviewKpi = {
  __typename?: 'WarehouseOverviewKpi';
  helper: Maybe<Scalars['String']['output']>;
  label: Maybe<Scalars['String']['output']>;
  tone: Maybe<Scalars['String']['output']>;
  value: Maybe<Scalars['String']['output']>;
};

export type WarehouseStockCategoryRow = {
  __typename?: 'WarehouseStockCategoryRow';
  available: Maybe<Scalars['Float']['output']>;
  blocked: Maybe<Scalars['Float']['output']>;
  color: Maybe<Scalars['String']['output']>;
  label: Maybe<Scalars['String']['output']>;
  reserved: Maybe<Scalars['Float']['output']>;
  totalOnHand: Maybe<Scalars['Float']['output']>;
};

export type WarehouseUserSummaryRow = {
  __typename?: 'WarehouseUserSummaryRow';
  activeOrders: Maybe<Scalars['Int']['output']>;
  activeUsers: Maybe<Scalars['Int']['output']>;
  averageOrdersPerUser: Maybe<Scalars['Float']['output']>;
  href: Maybe<Scalars['String']['output']>;
  idleUsers: Maybe<Scalars['Int']['output']>;
  totalUsers: Maybe<Scalars['Int']['output']>;
  warehouseId: Maybe<Scalars['String']['output']>;
  warehouseName: Maybe<Scalars['String']['output']>;
};

export type WarehouseWorkloadRow = {
  __typename?: 'WarehouseWorkloadRow';
  active: Maybe<Scalars['Int']['output']>;
  completedToday: Maybe<Scalars['Int']['output']>;
  exceptions: Maybe<Scalars['Int']['output']>;
  href: Maybe<Scalars['String']['output']>;
  released: Maybe<Scalars['Int']['output']>;
  warehouseId: Maybe<Scalars['String']['output']>;
  warehouseName: Maybe<Scalars['String']['output']>;
};

export type WarehouseZoneSummaryRow = {
  __typename?: 'WarehouseZoneSummaryRow';
  available: Maybe<Scalars['Float']['output']>;
  blocked: Maybe<Scalars['Float']['output']>;
  fill: Maybe<Scalars['Float']['output']>;
  id: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  onHand: Maybe<Scalars['Float']['output']>;
  reserved: Maybe<Scalars['Float']['output']>;
  type: Maybe<Scalars['String']['output']>;
};

export type OrdersDashboardHeaderFragment = { header: { title: string | null | undefined, subtitle: string | null | undefined } | null | undefined };

export type OrdersDashboardKpisFragment = { kpis: Array<{ label: string | null | undefined, value: string | null | undefined, helper: string | null | undefined, tone: string | null | undefined }> | null | undefined };

export type OrdersTypeDistributionFragment = { orderTypeDistribution: Array<{ type: string | null | undefined, count: number | null | undefined, href: string | null | undefined }> | null | undefined };

export type OrdersWarehouseWorkloadFragment = { warehouseWorkload: Array<{ warehouseId: string | null | undefined, warehouseName: string | null | undefined, active: number | null | undefined, released: number | null | undefined, completedToday: number | null | undefined, exceptions: number | null | undefined, href: string | null | undefined }> | null | undefined };

export type OrdersAttentionCardsFragment = { attention: Array<{ orderId: string | null | undefined, orderLabel: string | null | undefined, type: string | null | undefined, reason: string | null | undefined, tone: string | null | undefined, href: string | null | undefined }> | null | undefined };

export type OrdersSummaryRowsFragment = { orders: Array<{ orderId: string | null | undefined, orderLabel: string | null | undefined, type: string | null | undefined, warehouseId: string | null | undefined, warehouseName: string | null | undefined, status: string | null | undefined, progressPercent: number | null | undefined, assignedUserName: string | null | undefined, startedAt: string | null | undefined, lastActivityAt: string | null | undefined, href: string | null | undefined }> | null | undefined };

export type GetOrdersDashboardQueryVariables = Exact<{ [key: string]: never; }>;


export type GetOrdersDashboardQuery = { ordersDashboard: { header: { title: string | null | undefined, subtitle: string | null | undefined } | null | undefined, kpis: Array<{ label: string | null | undefined, value: string | null | undefined, helper: string | null | undefined, tone: string | null | undefined }> | null | undefined, orderTypeDistribution: Array<{ type: string | null | undefined, count: number | null | undefined, href: string | null | undefined }> | null | undefined, warehouseWorkload: Array<{ warehouseId: string | null | undefined, warehouseName: string | null | undefined, active: number | null | undefined, released: number | null | undefined, completedToday: number | null | undefined, exceptions: number | null | undefined, href: string | null | undefined }> | null | undefined, attention: Array<{ orderId: string | null | undefined, orderLabel: string | null | undefined, type: string | null | undefined, reason: string | null | undefined, tone: string | null | undefined, href: string | null | undefined }> | null | undefined, orders: Array<{ orderId: string | null | undefined, orderLabel: string | null | undefined, type: string | null | undefined, warehouseId: string | null | undefined, warehouseName: string | null | undefined, status: string | null | undefined, progressPercent: number | null | undefined, assignedUserName: string | null | undefined, startedAt: string | null | undefined, lastActivityAt: string | null | undefined, href: string | null | undefined }> | null | undefined } | null | undefined };
