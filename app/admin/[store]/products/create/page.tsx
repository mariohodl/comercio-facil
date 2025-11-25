import Link from 'next/link'
import ProductForm from '../product-form'
import { Metadata } from 'next'
import { getActiveCategories } from '@/lib/actions/category.actions'

export const metadata: Metadata = {
  title: 'Create Product',
}

const CreateProductPage = async () => {
  const categories = await getActiveCategories()

  return (
    <main className='max-w-6xl mx-auto p-4'>
      <div className='flex mb-4'>
        <Link href='/admin/products'>Products</Link>
        <span className='mx-1'>›</span>
        <Link href='/admin/products/create'>Create</Link>
      </div>

      <div className='my-8'>
        <ProductForm type='Create' categories={categories} />
      </div>
    </main>
  )
}

export default CreateProductPage