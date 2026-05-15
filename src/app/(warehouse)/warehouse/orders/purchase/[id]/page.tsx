'use client'

import { useParams } from 'next/navigation'

import { WarehousePurchaseOrderDetailsPageView } from '@/components/warehouse/orders/warehouse-purchase-order-details-page-view'
import { useWarehousePurchaseOrderDetails } from '@/components/warehouse/orders/use-warehouse-purchase-order-details'

export default function WarehousePurchaseOrderDetailsRoutePage() {
  const params = useParams()
  const id = typeof params?.id === 'string' ? params.id : ''

  const shell = useWarehousePurchaseOrderDetails(id)

  return <WarehousePurchaseOrderDetailsPageView {...shell} />
}
