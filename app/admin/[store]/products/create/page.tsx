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
  title: 'Create Product',
}

const CreateProductPage = async (props: {
  params: Promise<{ store: string }>
}) => {
  const params = await props.params
  const { store } = params
  const categories = await getActiveCategories(store)
  const brands = await getActiveBrands(store)
  const units = await getActiveUnits(store)
  const attributes = await getAttributesByStore(store)
  const stores = await getUserStores()
  const warehouses = await getUserWarehouses()
  const industry = await getCompanyIndustry()

  return (
    <main className='py-4'>
      <ProductForm
        type='Create'
        categories={categories}
        brands={brands}
        units={units}
        attributes={attributes}
        storeId={store}
        stores={stores}
        warehouses={warehouses}
        industry={industry}
      />
    </main>
  )
}

export default CreateProductPage