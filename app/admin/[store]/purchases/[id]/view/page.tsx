import { Metadata } from 'next'
import PurchaseDetails from './purchase-details'
import { getPurchaseById } from '@/lib/actions/purchase.actions'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
    title: 'Purchase Details - Admin',
}

export default async function PurchaseViewPage(props: {
    params: Promise<{ store: string; id: string }>
}) {
    const params = await props.params
    const purchase = await getPurchaseById(params.id)

    if (!purchase) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <PurchaseDetails purchase={purchase} storeId={params.store} />
        </div>
    )
}
