import React from 'react'

import POSPageClient from '@/components/admin/pos/pos-page-client'

export default async function POSPage({ params }: { params: Promise<{ storeId: string }> }) {
    // Await params for Next.js 15 compatibility
    const { storeId } = await params

    return <POSPageClient storeId={storeId} />
}
