import { auth } from '@/auth'
import { Metadata } from 'next'
import PurchaseList from './purchase-list'

export const metadata: Metadata = {
    title: 'Purchases - Admin',
}

export default async function AdminPurchases(props: {
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

    return (
        <div className="animate-in fade-in duration-500">
            <PurchaseList store={params.store} />
        </div>
    )
}
