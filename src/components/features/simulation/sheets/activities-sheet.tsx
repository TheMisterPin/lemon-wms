'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { format } from 'date-fns'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { ApiResponse } from '@/types/responses/basic-response'

type UserActivity = {
  id: string
  actionType: string
  entityType: string | null
  createdAt: string
}

type ExecutionActivity = {
  id: string
  activityType: string
  orderType: string
  createdAt: string
}

type ActivitiesData = {
  userActivities: UserActivity[]
  executionActivities: ExecutionActivity[]
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string
}

export function ActivitiesSheet({ open, onOpenChange, orderId }: Props) {
  const [data, setData] = useState<ActivitiesData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    axios
      .get<ApiResponse<ActivitiesData>>(`/api/simulation/orders/purchase/${orderId}/activities`)
      .then((r) => setData(r.data.data ?? null))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [open, orderId])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Activities</SheetTitle>
        </SheetHeader>

        {loading && <p className="mt-4 text-sm text-dash-muted">Loading…</p>}

        {!loading && data && (
          <div className="mt-4 space-y-6">
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-dash-muted">
                User Activity ({data.userActivities.length})
              </h3>
              <div className="divide-y divide-dash-border rounded-md border border-dash-border">
                {data.userActivities.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-dash-muted">None</p>
                ) : (
                  data.userActivities.map((a) => (
                    <div key={a.id} className="flex items-center justify-between px-3 py-2 text-sm">
                      <span className="font-medium text-dash-text">{a.actionType}</span>
                      <span className="text-xs text-dash-muted">
                        {format(new Date(a.createdAt), 'HH:mm:ss')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-dash-muted">
                Execution Activity ({data.executionActivities.length})
              </h3>
              <div className="divide-y divide-dash-border rounded-md border border-dash-border">
                {data.executionActivities.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-dash-muted">None</p>
                ) : (
                  data.executionActivities.map((a) => (
                    <div key={a.id} className="flex items-center justify-between px-3 py-2 text-sm">
                      <span className="font-medium text-dash-text">{a.activityType}</span>
                      <span className="text-xs text-dash-muted">
                        {format(new Date(a.createdAt), 'HH:mm:ss')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
