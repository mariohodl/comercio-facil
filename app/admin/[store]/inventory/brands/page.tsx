import { Metadata } from 'next'
import BrandList from './brand-list'

export const metadata: Metadata = {
    title: 'Brands',
}

export default async function BrandsPage(props: {
    params: Promise<{ store: string }>
}) {
    const params = await props.params
    return <BrandList store={params.store} />
}
