import { auth } from '@/auth'
import { Metadata } from 'next'
import ProveedoresList from './proveedores-list'

export const metadata: Metadata = {
  title: 'Admin Proveedores',
}

export default async function AdminProveedors(props: {
  params: Promise<{ store: string }>
}) {
  const params = await props.params
  const session = await auth()

  if (session?.user.role === 'Seller') {
    const { redirect } = await import('next/navigation')
    redirect(`/admin/pos/${session.user.storeId}`)
  }

  if (session?.user.role !== 'Admin' && session?.user.role !== 'SuperAdmin') {
    throw new Error('Admin permission required')
  }

  return <ProveedoresList store={params.store} />
}