import { Metadata } from 'next'
import LowStockList from './low-stock-list'

export const metadata: Metadata = {
    title: 'Low Stocks',
}

export default async function LowStocksPage(props: {
    params: Promise<{ store: string }>
}) {
    const params = await props.params
    return <LowStockList store={params.store} />
}
