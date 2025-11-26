import { Metadata } from 'next'
import UnitList from './unit-list'

export const metadata: Metadata = {
    title: 'Units',
}

export default function UnitsPage() {
    return <UnitList />
}
