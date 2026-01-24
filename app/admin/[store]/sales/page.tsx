import React from 'react'
import SalesList from './sales-list'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Admin Sales',
}


export default async function SalesPage(props: {
    params: Promise<{ store: string }>
}) {
    const params = await props.params

    return (
        <div className='md:p-6'>
            <SalesList store={params.store} />
        </div>
    )
}
