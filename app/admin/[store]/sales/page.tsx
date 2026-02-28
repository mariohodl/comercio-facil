import React from 'react'
import SalesList from './sales-list'
import { Metadata } from 'next'
import { auth } from '@/auth'

export const metadata: Metadata = {
    title: 'Admin Sales',
}


export default async function SalesPage(props: {
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
        <div className='md:p-6'>
            <SalesList store={params.store} />
        </div>
    )
}
