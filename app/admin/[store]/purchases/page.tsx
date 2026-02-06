import { Metadata } from 'next'
import PurchaseList from './purchase-list'

export const metadata: Metadata = {
    title: 'Purchases - Admin',
}

export default async function AdminPurchases(props: {
    params: Promise<{ store: string }>
}) {
    const params = await props.params
    return (
        <div className="animate-in fade-in duration-500">
            <PurchaseList store={params.store} />
        </div>
    )
}
