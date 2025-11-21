import { auth } from '@/auth'
import POSCart from '@/components/admin/pos/pos-cart'
import ProductSearch from '@/components/admin/pos/product-search'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
    title: 'Point of Sale',
}

export default async function POSPage() {
    const session = await auth()
    if (session?.user.role !== 'Admin') {
        redirect('/')
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] gap-4 p-4">
            <div className="flex-1 overflow-hidden rounded-lg border bg-background p-4 shadow-sm">
                <ProductSearch />
            </div>
            <div className="w-[400px] flex-shrink-0">
                <POSCart />
            </div>
        </div>
    )
}
