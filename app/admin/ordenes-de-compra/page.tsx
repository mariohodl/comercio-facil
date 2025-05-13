import { Metadata } from 'next'
import OrdersRecievedList from './order-received-list'

export const metadata: Metadata = {
  title: 'Admin Ordenes de compra',
}

export default async function AdminOrderReceived() {
  return <OrdersRecievedList />
}