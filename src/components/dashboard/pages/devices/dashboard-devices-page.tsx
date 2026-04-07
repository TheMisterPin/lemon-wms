'use client'

import { useState } from 'react'
import { ShieldCheck, ShieldOff } from 'lucide-react'

import { deviceTableColumns, type DeviceTableRow } from '@/components/configs/entities/device/config'
import AuthorizeDeviceForm from '@/components/dashboard/features/devices/authorize-device-form'
import PageWithGrid from '@/components/pages/page-with-grid'
import { ErrorModal } from '@/components/shared/ErrorModal'
import { DashboardDevicesProvider, useDashboardDevices } from '@/hooks/dashboard/use-dashboard-devices'
import type { RowAction } from '@/types/components/table/generic-table.types'

function DevicesContent() {
  const { devices, isLoading, error, mutationError, clearMutationError, deauthorizeDevice } =
    useDashboardDevices()

  const [authorizeTarget, setAuthorizeTarget] = useState<DeviceTableRow | null>(null)

  const actions: RowAction<DeviceTableRow>[] = [
    {
      icon: <ShieldCheck className="size-4" />,
      tooltip: 'Authorize device',
      className: 'text-emerald-500 hover:text-emerald-400 hover:bg-emerald-950/40',
      onClick: (row) => {
        if (!row.authorized) {
          setAuthorizeTarget(row)
        }
      }
    },
    {
      icon: <ShieldOff className="size-4" />,
      tooltip: 'Deauthorize device',
      className: 'text-amber-500 hover:text-amber-400 hover:bg-amber-950/40',
      onClick: (row) => {
        if (row.authorized) {
          void deauthorizeDevice(row.code)
        }
      }
    }
  ]

  return (
    <>
      <PageWithGrid
        title="Devices"
        isLoading={isLoading}
        error={error}
        tableData={{ columns: deviceTableColumns, records: devices }}
        tableActions={actions}
      />

      {authorizeTarget ? (
        <AuthorizeDeviceForm
          deviceCode={authorizeTarget.code}
          open={authorizeTarget !== null}
          onClose={() => setAuthorizeTarget(null)}
        />
      ) : null}

      <ErrorModal
        open={mutationError !== null}
        message={mutationError?.message ?? ''}
        code={mutationError?.code}
        details={mutationError?.details}
        onClose={clearMutationError}
      />
    </>
  )
}

export function DashboardDevicesPageView() {
  return (
    <DashboardDevicesProvider>
      <DevicesContent />
    </DashboardDevicesProvider>
  )
}
