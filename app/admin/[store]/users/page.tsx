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

  // Basic admin or higher check
  if (!session?.user) throw new Error('Unauthorized')

  const page = Number(searchParams.page) || 1
  const query = searchParams.query || ''
  const storeId = params.store

  const users = await getUsersByStore({
    storeId,
    page,
    query
  })

  return (
    <div className='p-6 space-y-6'>
      <div className="flex flex-col gap-1">
        <h1 className='text-2xl font-bold text-gray-900'>Users</h1>
        <p className="text-gray-500">Manage your users</p>
      </div>

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