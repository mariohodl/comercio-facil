import { Metadata } from 'next'
import BrandList from './brand-list'

export const metadata: Metadata = {
    title: 'Brands',
}

export default function BrandsPage() {
    return <BrandList />
}
