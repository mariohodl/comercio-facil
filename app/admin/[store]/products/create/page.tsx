import Link from 'next/link'
import ProductForm from '../product-form'
import { Metadata } from 'next'
import { getActiveCategories } from '@/lib/actions/category.actions'
import { getActiveBrands } from '@/lib/actions/brand.actions'
import { getActiveUnits } from '@/lib/actions/unit.actions'
import { getAttributesByStore } from '@/lib/actions/attribute.actions'

export const metadata: Metadata = {
  title: 'Create Product',
}

const CreateProductPage = async (props: {
  params: Promise<{ store: string }>
}) => {
  const params = await props.params
  const { store } = params
  const categories = await getActiveCategories()
  const brands = await getActiveBrands()
  const units = await getActiveUnits()
  const attributes = await getAttributesByStore(store)

  return (
    <main className='p-4'>
      <div className='flex mb-4'>
        <Link href={`/admin/${store}/products`}>Products</Link>
        <span className='mx-1'>›</span>
        <Link href={`/admin/${store}/products/create`}>Create</Link>
      </div>

      <div className='my-8'>
        <ProductForm type='Create' categories={categories} brands={brands} units={units} attributes={attributes} storeId={store} />
      </div>
    </main>
  )
}

export default CreateProductPage