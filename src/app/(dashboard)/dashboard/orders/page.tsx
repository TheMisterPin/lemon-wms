import { redirect } from 'next/navigation'

export default function DashboardOrdersIndexPage() {
  redirect('/dashboard/orders/purchase')
}
