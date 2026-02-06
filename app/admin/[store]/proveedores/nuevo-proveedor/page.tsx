import { Metadata } from 'next'
// import Link from 'next/link'
import { auth } from '@/auth'
import CreateProveedor from './CreateProveedor'


export const metadata: Metadata = {
    title: 'Recepción de compra',
}
export default async function RecepcionCompraPage() {

    const session = await auth()
    if (session?.user.role !== 'Admin')
        throw new Error('Admin permission required')

    return (
        <main className='max-w-6xl mx-auto p-4'>
            <div className='my-8'>
                <CreateProveedor />
            </div>
        </main>
    )
}
