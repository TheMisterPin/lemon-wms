'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/warehouses/components/warehouse-order-workload.md
 */


import { useMemo, useState } from 'react'
import type { ComponentType } from 'react'

import { warehouseOverviewIcons } from './warehouse-overview-icons'
import {
  WarehouseOverviewChartPanel,
  WarehouseOverviewShellSection,
  WarehouseOverviewStatusPill,
  warehouseOverviewToneStyles
} from '@/components/primitives/warehouse-overview-primitives'
import type { WarehouseOverviewIconProps } from './warehouse-overview-icons'
import type { WarehouseOverviewTone } from '@/components/primitives/warehouse-overview-primitives'
import type { WarehouseOrderTypeRow } from './warehouse-overview-types'

const orderTabMap = {
  'Sales Orders': 'Sales',
  'Purchase Orders': 'Purchase',
  'Transfer Orders': 'Transfer',
  'Adjustment Orders': 'Adjustment'
} as const

type OrderTabType = keyof typeof orderTabMap

type OrderWorkloadStatRow = {
  label: string
  value: number
  Icon: ComponentType<WarehouseOverviewIconProps>
  tone: WarehouseOverviewTone
}

type WarehouseOrderWorkloadProps = {
  orderTypes: WarehouseOrderTypeRow[]
  defaultSelectedType?: OrderTabType
}

/** Tabbed order buckets plus per-stage counts for the selected order family. */
export function WarehouseOrderWorkload({
  orderTypes,
  defaultSelectedType = 'Purchase Orders'
}: WarehouseOrderWorkloadProps) {
  const [selectedOrderType, setSelectedOrderType] = useState<string>(defaultSelectedType)

  const selectedOrder =
    orderTypes.find((item) => item.type === selectedOrderType) ?? orderTypes[0]

  const statRows = useMemo((): OrderWorkloadStatRow[] => {
    if (!selectedOrder) {
      return []
    }

    return [
      { label: 'Released', value: selectedOrder.released, Icon: warehouseOverviewIcons.search, tone: 'neutral' },
      { label: 'Assigned', value: selectedOrder.assigned, Icon: warehouseOverviewIcons.assigned, tone: 'neutral' },
      { label: 'Active', value: selectedOrder.active, Icon: warehouseOverviewIcons.active, tone: 'success' },
      { label: 'Paused', value: selectedOrder.paused, Icon: warehouseOverviewIcons.clock, tone: 'warning' },
      { label: 'Completed', value: selectedOrder.completed, Icon: warehouseOverviewIcons.check, tone: 'success' },
      { label: 'Exceptions', value: selectedOrder.exceptions, Icon: warehouseOverviewIcons.exceptions, tone: 'danger' }
    ]
  }, [selectedOrder])

  const headerPillTone: WarehouseOverviewTone =
    selectedOrder && selectedOrder.exceptions > 0 ? 'warning' : 'success'

  return (
    <WarehouseOverviewShellSection
      title="Order workload"
      action={
        selectedOrder ? (
          <WarehouseOverviewStatusPill tone={headerPillTone}>
            {selectedOrder.exceptions} exceptions
          </WarehouseOverviewStatusPill>
        ) : null
      }
    >
      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        {orderTypes.map((item) => (
          <button
            key={item.type}
            type="button"
            onClick={() => setSelectedOrderType(item.type)}
            className="rounded-xl border px-3 py-2 text-left text-sm transition hover:opacity-90"
            style={{
              background:
                selectedOrderType === item.type ? 'var(--wh-card-bg)' : 'var(--wh-card-bg-soft)',
              borderColor:
                selectedOrderType === item.type
                  ? 'var(--wh-text-muted, #94a3b8)'
                  : 'var(--wh-border, rgba(148,163,184,0.16))',
              color: 'var(--wh-text-primary, #f8fafc)'
            }}
          >
            <div className="font-semibold">{orderTabMap[item.type as OrderTabType]}</div>
            <div className="mt-1 text-xs" style={{ color: 'var(--wh-text-muted, #94a3b8)' }}>
              {item.active} active · {item.completed} done
            </div>
          </button>
        ))}
      </div>

      <WarehouseOverviewChartPanel>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {statRows.map(({ label, value, Icon, tone }) => (
            <div
              key={label}
              className="rounded-lg border p-4 transition hover:border-opacity-100"
              style={{
                borderColor: 'var(--wh-border)',
                background: 'var(--wh-card-bg)'
              }}
            >
              <div className="flex items-center gap-3">
                <div style={{ color: warehouseOverviewToneStyles[tone].icon }}>
                  <Icon />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium" style={{ color: 'var(--wh-text-muted, #94a3b8)' }}>
                    {label}
                  </div>
                  <div
                    className="text-xl font-bold tabular-nums"
                    style={{ color: 'var(--wh-text-primary, #f8fafc)' }}
                  >
                    {value}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </WarehouseOverviewChartPanel>
    </WarehouseOverviewShellSection>
  )
}
