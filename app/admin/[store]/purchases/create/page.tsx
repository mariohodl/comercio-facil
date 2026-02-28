import { auth } from '@/auth'
import { Metadata } from 'next'
import PurchaseForm from './purchase-form'
import { getAllProveedoresForAdmin } from '@/lib/actions/proveedor.actions'
import { getAllExistingProducts } from '@/lib/actions/product.actions'
import { getTranslations } from 'next-intl/server'

export const metadata: Metadata = {
    title: 'Create Purchase - Admin',
}

export default async function CreatePurchasePage(props: {
    params: Promise<{ store: string }>
}) {
    const params = await props.params
    const t = await getTranslations('purchases')

    const session = await auth()

    if (session?.user.role === 'Seller') {
        const { redirect } = await import('next/navigation')
        redirect(`/admin/pos/${session.user.storeId}`)
    }

    if (session?.user.role !== 'Admin' && session?.user.role !== 'SuperAdmin') {
        throw new Error('Admin permission required')
    }

    // Fetch initial data gracefully inside for offline capability
    let suppliersResult = { proveedores: [] }
    let productsResult = { products: [] }

    try {
        suppliersResult = await getAllProveedoresForAdmin({ query: '', limit: 100 }) || { proveedores: [] }
        productsResult = await getAllExistingProducts() || { products: [] }
    } catch (e) {
        console.warn('Network issue fetching purchase init data, applying offline fallback.')
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-id-bold tracking-tight">{t('createPurchase')}</h1>
            </div>
            <PurchaseForm
                storeId={params.store}
                suppliers={suppliersResult?.proveedores || []}
                products={productsResult?.products || []}
            />
        </div>
    )
}
