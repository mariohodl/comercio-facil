import { notFound } from 'next/navigation'

import { getProductById } from '@/lib/actions/product.actions'
import Link from 'next/link'
import ProductForm from '../product-form'
import { Metadata } from 'next'
import { getActiveCategories } from '@/lib/actions/category.actions'
import { getActiveBrands } from '@/lib/actions/brand.actions'
import { getActiveUnits } from '@/lib/actions/unit.actions'
import { getAttributesByStore } from '@/lib/actions/attribute.actions'
import { getUserStores } from '@/lib/actions/store.actions'
import { getUserWarehouses } from '@/lib/actions/warehouse.actions'
import { getCompanyIndustry } from '@/lib/actions/catalog.actions'

export const metadata: Metadata = {
  title: 'Edit Product',
}

type UpdateProductProps = {
  params: Promise<{
    id: string
    store: string
  }>
}

const UpdateProduct = async (props: UpdateProductProps) => {
  const params = await props.params

  const { id, store } = params

  const product = await getProductById(id)
  if (!product) notFound()

  const categories = await getActiveCategories()
  const brands = await getActiveBrands()
  const units = await getActiveUnits()
  const attributes = await getAttributesByStore(store)
  const stores = await getUserStores()
  const warehouses = await getUserWarehouses()
  const industry = await getCompanyIndustry()

  return (
    <main className='max-w-7xl mx-auto'>
      <div className='my-8'>
        <ProductForm
          type='Update'
          product={product}
          productId={product._id}
          categories={categories}
          brands={brands}
          units={units}
          attributes={attributes}
          storeId={store}
          stores={stores}
          warehouses={warehouses}
          industry={industry}
        />
      </div>
    </main>
  )
}

export default UpdateProduct