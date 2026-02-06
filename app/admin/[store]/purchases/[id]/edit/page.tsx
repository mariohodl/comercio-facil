import { Metadata } from 'next'
import PurchaseForm from '../../create/purchase-form'
import { getPurchaseById } from '@/lib/actions/purchase.actions'
import { getAllProveedoresForAdmin } from '@/lib/actions/proveedor.actions'
import { getAllExistingProducts } from '@/lib/actions/product.actions'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

export const metadata: Metadata = {
    title: 'Edit Purchase - Admin',
}

export default async function PurchaseEditPage(props: {
    params: Promise<{ store: string; id: string }>
}) {
    const params = await props.params
    const t = await getTranslations('purchases')
    const purchase = await getPurchaseById(params.id)
    const suppliersResult = await getAllProveedoresForAdmin({ query: '', limit: 100 })
    const productsResult = await getAllExistingProducts()

    if (!purchase) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-navy uppercase tracking-tight">{t('editPurchase')}</h1>
                <p className="text-gray-500 font-mono text-sm">Update purchase order {purchase.reference}</p>
            </div>
            <PurchaseForm
                storeId={params.store}
                suppliers={suppliersResult?.proveedores || []}
                products={productsResult?.products || []}
                initialData={purchase}
            />
        </div>
    )
}
