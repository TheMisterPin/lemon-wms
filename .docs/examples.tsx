// import { ReactNode } from "react";

// // Hook
// type ApiPayload<T> = { success: boolean; data: T }

// type ZoneApiRecord = {
//   id: string
//   warehouseId: string
//   name: string
//   type: string
//   isActive: boolean
//   createdAt: string
//   deletedAt: string | null
// }

// type BinApiRecord = {
//   id: string
//   zoneId: string
//   warehouseId: string
//   name: string
//   code: string
//   type: string
//   isBlocked: boolean
//   createdAt: string
//   deletedAt: string | null
//   maxCapacity: number | null
//   currentCapacity: number | null
//   filledPercentage: number | null
//   itemsInBin: number
// }

// type DashboardHomePayload = {
//   warehouses: {
//     id: string
//     name: string
//   }[]
//   zones: {
//     id: string
//     warehouseId: string
//     name: string
//     type: string
//     isActive: boolean
//   }[]
//   bins: {
//     id: string
//     warehouseId: string
//     zoneId: string
//     name: string
//     code: string
//     type: string
//     isBlocked: boolean
//     blockReason: string | null
//     active: boolean
//     maxCapacity: number | null
//     currentCapacity: number | null
//     filledPercentage: number | null
//     itemsInBin: number
//     createdAt: string
//   }[]
// }

// interface DashboardWarehouseContextValue {
//   warehouses: Warehouse[]
//   zones: ZoneTableRow[]
//   bins: BinTableRow[]
//   warehouseOptions: SelectOption[]
//   zoneOptions: SelectOption[]
//   warehouseIdFilter: string | null
//   isLoading: boolean
//   error: string | null
//   createWarehouse: (values: Pick<WarehouseFormValues, 'name'>) => Promise<void>
//   createZone: (values: ZoneFormValues) => Promise<void>
//   createBin: (values: BinFormValues) => Promise<void>
//   refresh: () => void
// }

// const DashboardWarehouseContext = createContext<DashboardWarehouseContextValue | null>(null)

// function extractMutationError(err: unknown): MutationError {
//   if (err instanceof AxiosError && err.response?.data) {
//     const body = err.response.data as ApiResponse<null>

//     return {
//       message: body.message ?? 'An unexpected error occurred.',
//       code: body.error?.code,
//       details: body.error?.details
//     }
//   }

//   if (err instanceof Error) {
//     return { message: err.message }
//   }

//   return { message: 'An unexpected error occurred.' }
// }

// export function DashboardWarehouseProvider({ children }: { children: ReactNode }) {
//   const searchParams = useSearchParams()
//   const warehouseIdFilter = searchParams.get('warehouseId')

//   const [rawWarehouses, setRawWarehouses] = useState<Warehouse[]>([])
//   const [rawZones, setRawZones] = useState<ZoneApiRecord[]>([])
//   const [rawBins, setRawBins] = useState<BinApiRecord[]>([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [refreshKey, setRefreshKey] = useState(0)
//   const { reportError } = useErrorDialog()

//   const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

//   useEffect(() => {
//     let isMounted = true

//     async function loadData() {
//       setIsLoading(true)
//       setError(null)

//       try {
//         const homePayload = await dashboardApiClient.get<ApiPayload<DashboardHomePayload>>('/dashboard/home')

//         if (!isMounted) {
//           return
//         }

//         const payload = homePayload.data
//         const warehouses = Array.isArray(payload.warehouses)
//           ? payload.warehouses
//           : []
//         const zones = Array.isArray(payload.zones)
//           ? payload.zones
//           : []
//         const bins = Array.isArray(payload.bins)
//           ? payload.bins
//           : []

//         setRawZones(
//           warehouseIdFilter
//             ? zones.filter((zone) => zone.warehouseId === warehouseIdFilter)
//             : zones
//         )

//         setRawBins(
//           warehouseIdFilter
//             ? bins.filter((bin) => bin.warehouseId === warehouseIdFilter)
//             : bins
//         )
//         setRawWarehouses(
//           warehouses.map((w) => ({
//             ...w,
//             status: 'ACTIVE',
//             timezone: 'UTC',
//             currency: 'USD',
//             address: '',
//             createdById: null,
//             createdAt: new Date(),
//             deletedAt: null
//           }))
//         )
//       } catch {
//         if (!isMounted) {
//           return
//         }

//         setError('Unable to load warehouse data.')
//       } finally {
//         if (isMounted) {
//           setIsLoading(false)
//         }
//       }
//     }

//     void loadData()

//     return () => {
//       isMounted = false
//     }
//   }, [warehouseIdFilter, refreshKey])

//   const createWarehouse = useCallback(async (values) => {
//     try {
//       await dashboardApiClient.post('/dashboard/warehouses', values)
//       refresh()
//     } catch (err) {
//       const parsed = extractMutationError(err)
//       reportError(parsed.message, {
//         title: 'Failed to create warehouse',
//         source: 'dashboard/warehouses/create',
//         code: parsed.code,
//         details: parsed.details
//       })
//       throw new Error(parsed.message)
//     }
//   }

//   const value = useMemo<DashboardWarehouseContextValue>(
//     () => ({
//       warehouses: rawWarehouses,
//       zones,
//       bins,
//       warehouseIdFilter,
//       isLoading,
//       error,
//       createWarehouse,
//       refresh
//     }),
//     [
//       rawWarehouses,
//       zones,
//       bins,
//       warehouseIdFilter,
//       isLoading,
//       error,
//       createWarehouse,
//       refresh
//     ]
//   )

//   return (
//     <DashboardWarehouseContext.Provider value={value}>
//       {children}
//     </DashboardWarehouseContext.Provider>
//   )
// }

// export function useDashboardWarehouse() {
//   const context = useContext(DashboardWarehouseContext)

//   if (!context) {
//     throw new Error(
//       'useDashboardWarehouse must be used within DashboardWarehouseProvider'
//     )
//   }

//   return context
// }

// // layout
// export function DashboardWarehouseLayout({ children }: { children: ReactNode }) {
//     return (
//         <DashboardWarehouseProvider>
//             {children}
//         </DashboardWarehouseProvider>
//     )
// }
// // pages
// export function DashboardWarehouseOverview(){
// const {warehouses, zones, bins, isLoading, error} = useDashboardWarehouse()

// if (isLoading) {
//     return <DashboardWarehouseOverviewSkeleton />
// }

// if (error) {
//     return <ErrorMessage message={error} />
// }

// return (
// <DashboardWarehouseOverviewComponent>
//     <DashboardHeader title="Dashboard Warehouse Overview" subtitle="Overview of all warehouses" />
//     <DashboardBody>
//     <DashboardSection layout="single">
// <DashboardWarehouseKPIs kpis={kpis} />
//     </DashboardSection>
//     <DashboardSection layout="sigle">
//         <DashboardSectionHeader title="Warehouses" description="List of all warehouses" />
//         <DashboardTable table={warehouses} />
//     </DashboardSection>
//     <DashboardSection layout="double">
// <DashboardWarehouseOrderWorkload orderTypes={orderTypes} />
// <DashboardWarehouseActivitySummary categories={stockCategories} />
//     </DashboardSection>
//     <DashboardSection title="Zones" layout="double">
// <DashboardStockSummary categories={stockCategories} />
//     </DashboardSection>
//     </DashboardBody>
// </DashboardWarehouseOverviewComponent>
