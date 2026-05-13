'use client'

import {
  useCallback,
  useMemo
} from 'react'

import { useErrorDialog } from '@/components/shared/use-error-dialog'
import { extractMutationError } from '@/lib/api/extract-mutation-error'
import { dashboardApiClient } from '@/lib/axios'
import type { BinFormValues, WarehouseFormValues, ZoneFormValues } from '@/lib/locations'
import type { BinType } from '@/types/models/enums'
import type { ApiResponse } from '@/types/responses/basic-response'

export type UseManageLocationsCreatesResult = {
  createWarehouse: (
    values: WarehouseFormValues | Pick<WarehouseFormValues, 'name'>
  ) => Promise<{ success: boolean; error?: string }>
  createZone: (values: ZoneFormValues) => Promise<{ success: boolean; error?: string }>
  createBin: (values: BinFormValues) => Promise<{ success: boolean; error?: string }>
  createBinAndSetZoneDefault: (args: {
    zoneId: string
    name: string
    binType: 'RECEIVING' | 'QUARANTINE' | 'OUTGOING'
  }) => Promise<{ success: boolean; error?: string }>
  setZoneDefaultForBinType: (args: {
    zoneId: string
    binId: string
    binType: BinType
  }) => Promise<{ success: boolean; error?: string }>
}

export function useManageLocationsCreates(
  onAfterMutation: () => void
): UseManageLocationsCreatesResult {
  const { reportError } = useErrorDialog()

  const createWarehouse = useCallback(
    async (values: WarehouseFormValues | Pick<WarehouseFormValues, 'name'>) => {
      try {
        await dashboardApiClient.post('/dashboard/warehouses', values)
        onAfterMutation()

        return { success: true }
      } catch (err) {
        const parsed = extractMutationError(err)
        reportError(parsed.message, {
          title: 'Failed to create warehouse',
          source: 'manage-locations/create-warehouse',
          code: parsed.code,
          details: parsed.details
        })

        return { success: false, error: parsed.message }
      }
    },
    [onAfterMutation, reportError]
  )

  const createZone = useCallback(
    async (values: ZoneFormValues) => {
      try {
        await dashboardApiClient.post('/dashboard/zones', values)
        onAfterMutation()

        return { success: true }
      } catch (err) {
        const parsed = extractMutationError(err)
        reportError(parsed.message, {
          title: 'Failed to create zone',
          source: 'manage-locations/create-zone',
          code: parsed.code,
          details: parsed.details
        })

        return { success: false, error: parsed.message }
      }
    },
    [onAfterMutation, reportError]
  )

  const createBin = useCallback(
    async (values: BinFormValues) => {
      try {
        await dashboardApiClient.post('/dashboard/bins', values)
        onAfterMutation()

        return { success: true }
      } catch (err) {
        const parsed = extractMutationError(err)
        reportError(parsed.message, {
          title: 'Failed to create bin',
          source: 'manage-locations/create-bin',
          code: parsed.code,
          details: parsed.details
        })

        return { success: false, error: parsed.message }
      }
    },
    [onAfterMutation, reportError]
  )

  const createBinAndSetZoneDefault = useCallback(
    async (args: {
      zoneId: string
      name: string
      binType: 'RECEIVING' | 'QUARANTINE' | 'OUTGOING'
    }) => {
      try {
        const createRes = await dashboardApiClient.post<ApiResponse<{ id: string }>>(
          '/dashboard/bins',
          {
            zoneId: args.zoneId,
            name: args.name.trim(),
            type: args.binType
          }
        )

        if (!createRes.success || createRes.data === null) {
          return { success: false, error: createRes.message ?? 'Could not create bin.' }
        }

        const binId = createRes.data.id

        const patch: Partial<ZoneFormValues> =
          args.binType === 'RECEIVING'
            ? { defaultReceivingBinId: binId }
            : args.binType === 'QUARANTINE'
              ? { defaultQuarantineBinId: binId }
              : { defaultOutgoingBinId: binId }

        const putRes = await dashboardApiClient.put<ApiResponse<unknown>>(
          `/dashboard/zones/${args.zoneId}`,
          patch
        )

        if (!putRes.success) {
          return { success: false, error: putRes.message ?? 'Bin created but default was not set.' }
        }

        onAfterMutation()

        return { success: true }
      } catch (err) {
        const parsed = extractMutationError(err)
        reportError(parsed.message, {
          title: 'Failed to create default bin',
          source: 'manage-locations/create-bin-and-default',
          code: parsed.code,
          details: parsed.details
        })

        return { success: false, error: parsed.message }
      }
    },
    [onAfterMutation, reportError]
  )

  const setZoneDefaultForBinType = useCallback(
    async (args: { zoneId: string; binId: string; binType: BinType }) => {
      const patch: Partial<ZoneFormValues> =
        args.binType === 'RECEIVING'
          ? { defaultReceivingBinId: args.binId }
          : args.binType === 'QUARANTINE'
            ? { defaultQuarantineBinId: args.binId }
            : args.binType === 'OUTGOING'
              ? { defaultOutgoingBinId: args.binId }
              : {}

      if (Object.keys(patch).length === 0) {
        return { success: false, error: 'This bin type cannot be mapped to a zone default.' }
      }

      try {
        await dashboardApiClient.put(`/dashboard/zones/${args.zoneId}`, patch)
        onAfterMutation()

        return { success: true }
      } catch (err) {
        const parsed = extractMutationError(err)
        reportError(parsed.message, {
          title: 'Failed to update zone default',
          source: 'manage-locations/zone-default',
          code: parsed.code,
          details: parsed.details
        })

        return { success: false, error: parsed.message }
      }
    },
    [onAfterMutation, reportError]
  )

  return useMemo(
    () => ({
      createWarehouse,
      createZone,
      createBin,
      createBinAndSetZoneDefault,
      setZoneDefaultForBinType
    }),
    [createWarehouse, createZone, createBin, createBinAndSetZoneDefault, setZoneDefaultForBinType]
  )
}
