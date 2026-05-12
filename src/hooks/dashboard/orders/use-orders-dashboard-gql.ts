'use client'

import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import type { GetOrdersDashboardQuery } from '@/generated/gql/graphql'

export const GET_ORDERS_DASHBOARD = gql`
  query GetOrdersDashboard {
    ordersDashboard {
      header {
        title
        subtitle
      }
      kpis {
        label
        value
        helper
        tone
      }
      orderTypeDistribution {
        type
        count
        href
      }
      warehouseWorkload {
        warehouseId
        warehouseName
        active
        released
        completedToday
        exceptions
        href
      }
      attention {
        orderId
        orderLabel
        type
        reason
        tone
        href
      }
      orders {
        orderId
        orderLabel
        type
        warehouseId
        warehouseName
        status
        progressPercent
        assignedUserName
        startedAt
        lastActivityAt
        href
      }
    }
  }
`

export type OrdersDashboardGqlData = NonNullable<GetOrdersDashboardQuery['ordersDashboard']>

type UseOrdersDashboardGqlReturn = {
  data: OrdersDashboardGqlData | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useOrdersDashboardGql(): UseOrdersDashboardGqlReturn {
  const { data, loading, error, refetch } = useQuery<GetOrdersDashboardQuery>(
    GET_ORDERS_DASHBOARD
  )

  return {
    data: data?.ordersDashboard ?? null,
    isLoading: loading,
    error: error?.message ?? null,
    refetch,
  }
}
