import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

interface TopSellingProductsProps {
    data: {
        label: string
        value: number
        image: string
        id: string
    }[]
}

export default function TopSellingProducts({ data }: TopSellingProductsProps) {
    return (
        <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
                <CardTitle className='text-base'>Top Selling Products</CardTitle>
                <div className='text-sm text-muted-foreground'>Today</div>
            </CardHeader>
            <CardContent>
                <div className='space-y-6'>
                    {data.map((product, index) => (
                        <div key={index} className='flex items-center justify-between'>
                            <div className='flex items-center gap-4'>
                                <div className='relative h-12 w-12 overflow-hidden rounded-lg border'>
                                    <Image
                                        src={product.image}
                                        alt={product.label}
                                        fill
                                        className='object-cover'
                                    />
                                </div>
                                <div>
                                    <p className='font-medium line-clamp-1'>{product.label}</p>
                                    <p className='text-sm text-muted-foreground'>
                                        {formatCurrency(product.value)} • Sales
                                    </p>
                                </div>
                            </div>
                            <div className='flex items-center'>
                                <span className='inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20'>
                                    +25%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
