import type { PrismaClient } from '@/generated/prisma'

import type { DashboardKpi } from '@/types/bin-detail-dashboard.types'
import type {
  CategoryHealthRow,
  InventoryHealthAlert,
  InventoryHealthDashboardDTO,
  InventoryHealthIssueRow,
  WarehouseHealthRow
} from '@/types/inventory-health-dashboard.types'

type IssueType = 'LOW_STOCK' | 'OVERSTOCK' | 'BLOCKED' | 'QUARANTINE' | 'EXPIRING' | 'INVALID_STATE'
type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

type HealthIssueInternal = {
  issueId: string
  type: IssueType
  entityLabel: string
  warehouseId: string
  warehouseName: string
  severity: Severity
  quantity?: number
  detectedAt: string
  href: string
  categoryId?: string
  categoryName?: string
}

function rankSeverity(severity: Severity): number {
  if (severity === 'CRITICAL') {
    return 4
  }
  if (severity === 'HIGH') {
    return 3
  }
  if (severity === 'MEDIUM') {
    return 2
  }

  return 1
}

export async function getInventoryHealthDashboardData(
  prisma: PrismaClient
): Promise<InventoryHealthDashboardDTO> {
  const [stockRows, warehouses, lots, now] = await Promise.all([
    prisma.binStockItem.findMany({
      select: {
        id: true,
        itemId: true,
        quantityAvailable: true,
        quantityReserved: true,
        quantityBlocked: true,
        lotId: true,
        updatedAt: true,
        item: {
          select: {
            sku: true,
            name: true,
            minQuantity: true,
            category: { select: { code: true, name: true } }
          }
        },
        bin: {
          select: {
            id: true,
            warehouseId: true,
            warehouse: { select: { name: true } }
          }
        }
      }
    }),
    prisma.warehouse.findMany({ where: { deletedAt: null }, select: { id: true, name: true } }),
    prisma.lot.findMany({
      where: {
        OR: [
          { status: 'QUARANTINE' },
          { expiryDate: { not: null } }
        ]
      },
      select: {
        id: true,
        lotNumber: true,
        status: true,
        expiryDate: true,
        itemId: true,
        item: { select: { sku: true, name: true } }
      }
    }),
    Promise.resolve(new Date())
  ])

  const issues: HealthIssueInternal[] = []
  const availableByItemWarehouse = new Map<string, { available: number; min: number; itemName: string; sku: string; categoryId?: string; categoryName?: string; warehouseId: string; warehouseName: string }>()

  for (const row of stockRows) {
    const available = row.quantityAvailable.toNumber()
    const reserved = row.quantityReserved.toNumber()
    const blocked = row.quantityBlocked.toNumber()

    const key = `${row.itemId}:${row.bin.warehouseId}`
    const aggregate = availableByItemWarehouse.get(key) ?? {
      available: 0,
      min: row.item.minQuantity.toNumber(),
      itemName: row.item.name,
      sku: row.item.sku,
      categoryId: row.item.category?.code,
      categoryName: row.item.category?.name,
      warehouseId: row.bin.warehouseId,
      warehouseName: row.bin.warehouse.name
    }
    aggregate.available += available
    availableByItemWarehouse.set(key, aggregate)

    if (blocked > 0) {
      issues.push({
        issueId: `blocked:${row.id}`,
        type: 'BLOCKED',
        entityLabel: `${row.item.sku} · ${row.item.name}`,
        warehouseId: row.bin.warehouseId,
        warehouseName: row.bin.warehouse.name,
        severity: blocked >= 50 ? 'HIGH' : 'MEDIUM',
        quantity: Math.round(blocked),
        detectedAt: row.updatedAt.toISOString(),
        href: `/dashboard/stock/items/${row.itemId}`,
        categoryId: row.item.category?.code,
        categoryName: row.item.category?.name
      })
    }

    if (reserved > available && available > 0) {
      issues.push({
        issueId: `invalid:${row.id}`,
        type: 'INVALID_STATE',
        entityLabel: `${row.item.sku} · ${row.item.name}`,
        warehouseId: row.bin.warehouseId,
        warehouseName: row.bin.warehouse.name,
        severity: 'HIGH',
        quantity: Math.round(reserved - available),
        detectedAt: row.updatedAt.toISOString(),
        href: `/dashboard/locations/bins/${row.bin.id}`,
        categoryId: row.item.category?.code,
        categoryName: row.item.category?.name
      })
    }
  }

  for (const aggregate of availableByItemWarehouse.values()) {
    if (aggregate.available < aggregate.min) {
      const shortage = aggregate.min - aggregate.available
      issues.push({
        issueId: `low:${aggregate.warehouseId}:${aggregate.sku}`,
        type: 'LOW_STOCK',
        entityLabel: `${aggregate.sku} · ${aggregate.itemName}`,
        warehouseId: aggregate.warehouseId,
        warehouseName: aggregate.warehouseName,
        severity: shortage >= aggregate.min * 0.5 ? 'CRITICAL' : 'HIGH',
        quantity: Math.round(shortage),
        detectedAt: now.toISOString(),
        href: `/dashboard/stock/items/${stockRows.find((row) => row.item.sku === aggregate.sku)?.itemId ?? ''}`,
        categoryId: aggregate.categoryId,
        categoryName: aggregate.categoryName
      })
    }

    if (aggregate.available > aggregate.min * 5 && aggregate.min > 0) {
      issues.push({
        issueId: `over:${aggregate.warehouseId}:${aggregate.sku}`,
        type: 'OVERSTOCK',
        entityLabel: `${aggregate.sku} · ${aggregate.itemName}`,
        warehouseId: aggregate.warehouseId,
        warehouseName: aggregate.warehouseName,
        severity: 'MEDIUM',
        quantity: Math.round(aggregate.available - aggregate.min),
        detectedAt: now.toISOString(),
        href: `/dashboard/stock/items/${stockRows.find((row) => row.item.sku === aggregate.sku)?.itemId ?? ''}`,
        categoryId: aggregate.categoryId,
        categoryName: aggregate.categoryName
      })
    }
  }

  for (const lot of lots) {
    const hasStock = stockRows.some((row) => row.lotId === lot.id)
    if (!hasStock) {
      continue
    }

    const warehouseName = stockRows.find((row) => row.lotId === lot.id)?.bin.warehouse.name ?? 'Unknown'
    const warehouseId = stockRows.find((row) => row.lotId === lot.id)?.bin.warehouseId ?? ''

    if (lot.status === 'QUARANTINE') {
      issues.push({
        issueId: `quarantine:${lot.id}`,
        type: 'QUARANTINE',
        entityLabel: `${lot.item?.sku ?? ''} · Lot ${lot.lotNumber}`,
        warehouseId,
        warehouseName,
        severity: 'HIGH',
        detectedAt: now.toISOString(),
        href: `/dashboard/stock/items/${lot.itemId ?? ''}`
      })
    }

    if (lot.expiryDate) {
      const delta = lot.expiryDate.getTime() - now.getTime()
      if (delta >= 0 && delta <= 1000 * 60 * 60 * 24 * 30) {
        issues.push({
          issueId: `expiring:${lot.id}`,
          type: 'EXPIRING',
          entityLabel: `${lot.item?.sku ?? ''} · Lot ${lot.lotNumber}`,
          warehouseId,
          warehouseName,
          severity: delta <= 1000 * 60 * 60 * 24 * 7 ? 'CRITICAL' : 'MEDIUM',
          detectedAt: now.toISOString(),
          href: `/dashboard/stock/items/${lot.itemId ?? ''}`
        })
      }
    }
  }

  const issueDistribution = [
    'LOW_STOCK',
    'OVERSTOCK',
    'BLOCKED',
    'QUARANTINE',
    'EXPIRING',
    'INVALID_STATE'
  ].map((type) => ({
    type: type as IssueType,
    count: issues.filter((issue) => issue.type === type).length
  }))

  const categoryMap = new Map<string, CategoryHealthRow>()
  for (const issue of issues) {
    if (!issue.categoryId) {
      continue
    }

    const row = categoryMap.get(issue.categoryId) ?? {
      categoryId: issue.categoryId,
      categoryName: issue.categoryName ?? issue.categoryId,
      lowStock: 0,
      blocked: 0,
      expiring: 0,
      quarantine: 0,
      href: `/dashboard/stock/categories/${issue.categoryId}`
    }

    if (issue.type === 'LOW_STOCK') {
      row.lowStock++
    }
    if (issue.type === 'BLOCKED') {
      row.blocked++
    }
    if (issue.type === 'EXPIRING') {
      row.expiring++
    }
    if (issue.type === 'QUARANTINE') {
      row.quarantine++
    }

    categoryMap.set(issue.categoryId, row)
  }

  const warehouseHealth: WarehouseHealthRow[] = warehouses.map((warehouse) => {
    const warehouseIssues = issues.filter((issue) => issue.warehouseId === warehouse.id)

    return {
      warehouseId: warehouse.id,
      warehouseName: warehouse.name,
      issueCount: warehouseIssues.length,
      criticalCount: warehouseIssues.filter((issue) => issue.severity === 'CRITICAL' || issue.severity === 'HIGH').length,
      warningCount: warehouseIssues.filter((issue) => issue.severity === 'MEDIUM' || issue.severity === 'LOW').length,
      href: `/dashboard/locations/warehouses/${warehouse.id}/stock`
    }
  })

  const sortedIssues = [...issues].sort((a, b) => {
    const severityRankDiff = rankSeverity(b.severity) - rankSeverity(a.severity)
    if (severityRankDiff !== 0) {
      return severityRankDiff
    }

    return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
  })

  const alerts: InventoryHealthAlert[] = sortedIssues.slice(0, 6).map((issue) => ({
    id: issue.issueId,
    title: issue.type.replace(/_/g, ' '),
    entityLabel: issue.entityLabel,
    severity: issue.severity,
    reason: `${issue.type.replace(/_/g, ' ')} detected in ${issue.warehouseName}`,
    href: issue.href
  }))

  const issueRows: InventoryHealthIssueRow[] = sortedIssues.slice(0, 200).map((issue) => ({
    issueId: issue.issueId,
    type: issue.type,
    entityLabel: issue.entityLabel,
    warehouseName: issue.warehouseName,
    severity: issue.severity,
    quantity: issue.quantity,
    detectedAt: issue.detectedAt,
    href: issue.href
  }))

  const kpis: DashboardKpi[] = [
    { label: 'Low stock SKUs', value: String(issueDistribution.find((slice) => slice.type === 'LOW_STOCK')?.count ?? 0), tone: 'yellow' },
    { label: 'Overstock SKUs', value: String(issueDistribution.find((slice) => slice.type === 'OVERSTOCK')?.count ?? 0), tone: 'neutral' },
    { label: 'Blocked stock', value: String(issueDistribution.find((slice) => slice.type === 'BLOCKED')?.count ?? 0), tone: 'red' },
    { label: 'Quarantine stock', value: String(issueDistribution.find((slice) => slice.type === 'QUARANTINE')?.count ?? 0), tone: 'red' },
    { label: 'Expiring soon', value: String(issueDistribution.find((slice) => slice.type === 'EXPIRING')?.count ?? 0), tone: 'yellow' },
    { label: 'Invalid states', value: String(issueDistribution.find((slice) => slice.type === 'INVALID_STATE')?.count ?? 0), tone: 'red' },
    { label: 'Orphaned records', value: '0', tone: 'neutral' }
  ]

  return {
    header: {
      title: 'Inventory Health',
      subtitle: 'Issue-focused quality and risk dashboard'
    },
    kpis,
    issueDistribution,
    categoryHealth: [...categoryMap.values()],
    warehouseHealth,
    alerts,
    issues: issueRows
  }
}
