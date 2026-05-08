'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/warehouses/components/warehouse-activity-summary.md
 */


import {
  WarehouseOverviewShellSection,
  WarehouseOverviewStatusPill
} from '@/components/primitives/warehouse-overview-primitives'
import type { WarehouseOverviewTone } from '@/components/primitives/warehouse-overview-primitives'
import type { WarehouseActivityRow } from './warehouse-overview-types'

function activityTone(status: WarehouseActivityRow['status']): WarehouseOverviewTone {
  if (status === 'SUCCESS') {
    return 'success'
  }
  if (status === 'WARNING') {
    return 'warning'
  }

  return 'danger'
}

type WarehouseActivitySummaryProps = {
  activity: WarehouseActivityRow[]
  /** Defaults to "Recent activity". */
  title?: string
}

/** Recent warehouse events with coarse status colouring. */
export function WarehouseActivitySummary({ activity, title = 'Recent activity' }: WarehouseActivitySummaryProps) {
  return (
    <WarehouseOverviewShellSection
      title={title}
      action={<WarehouseOverviewStatusPill>{activity.length} events</WarehouseOverviewStatusPill>}
    >
      <div className="space-y-3">
        {activity.map((item) => {
          const tone = activityTone(item.status)

          return (
            <div
              key={item.id}
              className="rounded-xl border p-3"
              style={{ background: 'var(--wh-card-bg)', borderColor: 'var(--wh-border)' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs" style={{ color: 'var(--wh-text-muted)' }}>
                    {item.time} · {item.user}
                  </div>
                  <div className="mt-1 text-sm font-medium">{item.action}</div>
                  <div className="mt-1 text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
                    {item.entity}
                  </div>
                </div>
                <WarehouseOverviewStatusPill tone={tone}>{item.status}</WarehouseOverviewStatusPill>
              </div>
            </div>
          )
        })}
      </div>
    </WarehouseOverviewShellSection>
  )
}
