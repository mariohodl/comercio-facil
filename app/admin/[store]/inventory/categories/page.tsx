import { Metadata } from 'next'
import CategoriesPage from './categories-page'

export const metadata: Metadata = {
    title: 'Categories',
}

export default async function BrandsPage(props: {
    params: Promise<{ store: string }>
}) {
    const params = await props.params
    return <CategoriesPage params={params} />
}
