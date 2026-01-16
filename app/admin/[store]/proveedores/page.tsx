import { Metadata } from 'next'
import ProveedoresList from './proveedores-list'

export const metadata: Metadata = {
  title: 'Admin Proveedores',
}

export default async function AdminProveedors(props: {
  params: Promise<{ store: string }>
}) {
  const params = await props.params
  return <ProveedoresList store={params.store} />
}