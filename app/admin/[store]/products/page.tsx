import { Metadata } from 'next'
import ProductList from './product-list'

export const metadata: Metadata = {
  title: 'Admin Products',
}

export default async function AdminProduct(props: {
  params: Promise<{ store: string }>
}) {
  const params = await props.params
  return <ProductList store={params.store} />
}