import { Metadata } from 'next'
import CreateUserForm from '../create-user-form'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Create User',
}

export default async function CreateUserPage(props: {
    params: Promise<{ store: string }>
}) {
    const params = await props.params
    const { store } = params

    return (
        <div className='p-6 max-w-4xl mx-auto space-y-6'>
            <div className='flex items-center gap-2 text-sm text-gray-500'>
                <Link href={`/admin/${store}/users`} className="hover:text-orange">Users</Link>
                <span>›</span>
                <span className="text-gray-900 font-medium">Create User</span>
            </div>

            <div className="flex flex-col gap-1">
                <h1 className='text-2xl font-bold text-gray-900'>Add New User</h1>
                <p className="text-gray-500">Create a new user belonging to this store</p>
            </div>

            <CreateUserForm storeId={store} />
        </div>
    )
}
