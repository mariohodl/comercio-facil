import { Metadata } from 'next'
import { auth } from '@/auth'
import { getUsersByStore } from '@/lib/actions/user.actions'
import UserList from './user-list'

export const metadata: Metadata = {
  title: 'Admin User Management',
}

export default async function AdminUserPage(props: {
  params: Promise<{ store: string }>
  searchParams: Promise<{ page: string; query: string }>
}) {
  const params = await props.params
  const searchParams = await props.searchParams
  const session = await auth()

  // Role verification
  if (!session?.user) throw new Error('Unauthorized')

  if (session.user.role === 'Seller') {
    const { redirect } = await import('next/navigation')
    redirect(`/admin/pos/${session.user.storeId}`)
  }

  if (session.user.role !== 'Admin' && session.user.role !== 'SuperAdmin') {
    throw new Error('Admin permission required')
  }
  const page = Number(searchParams.page) || 1
  const query = searchParams.query || ''
  const storeId = params.store

  const users = await getUsersByStore({
    storeId,
    page,
    query
  })

  return (
    <div className='space-y-6 md:p-4'>
      <UserList
        users={users.data}
        storeId={storeId}
        page={page}
        totalPages={users.totalPages}
        searchTerm={query}
      />
    </div>
  )
}