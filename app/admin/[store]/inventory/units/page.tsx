import { Metadata } from 'next'
import UnitList from './unit-list'

export const metadata: Metadata = {
    title: 'Units',
}

export default async function UnitsPage(props: {
    params: Promise<{ store: string }>
}) {
    const params = await props.params
    return <UnitList store={params.store} />
}
