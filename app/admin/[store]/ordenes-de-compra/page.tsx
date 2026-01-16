import { Metadata } from 'next'
import OrdersRecievedList from './order-received-list'

export const metadata: Metadata = {
  title: 'Admin Ordenes de compra',
}

export default async function AdminOrderReceived(props: {
  params: Promise<{ store: string }>
}) {
  const params = await props.params
  return <OrdersRecievedList store={params.store} />
}