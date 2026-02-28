import { Metadata } from 'next'
import LowStockList from './low-stock-list'
import { auth } from '@/auth'

export const metadata: Metadata = {
    title: 'Low Stocks',
}

export default async function LowStocksPage(props: {
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

    return <LowStockList store={params.store} />
}
