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
            <div className='flex flex-between mb-4'>    
                <h3 className='text-2xl font-bold'>Nuevo proveedor</h3>

                <div>
                    <p>Fecha: <span className='bg-black p-2 text-white rounded-sm'>{new Date().toLocaleDateString()}</span></p>
                </div>
            </div>
            <div className='my-8'>
                <CreateProveedor />
            </div>
        </main>
    )
}
