import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'

interface LowStockProductsProps {
    data: {
        _id: string
        name: string
        countInStock: number
        images: { imgUrl: string }[]
    }[]
}

export default function LowStockProducts({ data }: LowStockProductsProps) {
    return (
        <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
                <CardTitle className='text-base'>Low Stock Products</CardTitle>
                <Link href='/admin/products' className='text-sm text-blue-600 hover:underline'>
                    View All
                </Link>
            </CardHeader>
            <CardContent>
                <div className='space-y-6'>
                    {data.map((product) => (
                        <div key={product._id} className='flex items-center justify-between'>
                            <div className='flex items-center gap-4'>
                                <div className='relative h-12 w-12 overflow-hidden rounded-lg border'>
                                    <Image
                                        src={product.images[0]?.imgUrl || '/placeholder.png'}
                                        alt={product.name}
                                        fill
                                        className='object-cover'
                                    />
                                </div>
                                <div>
                                    <p className='font-medium line-clamp-1'>{product.name}</p>
                                    <p className='text-sm text-muted-foreground'>ID: #{product._id.slice(-6)}</p>
                                </div>
                            </div>
                            <div className='text-right'>
                                <p className='text-sm text-muted-foreground'>Instock</p>
                                <p className='font-bold text-red-500'>{product.countInStock}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
