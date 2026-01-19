import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface LowStockProductsProps {
    storeId: string,
    data: {
        _id: string
        name: string
        countInStock: number
        images: { imgUrl: string }[]
    }[]
}

export default function LowStockProducts({ data, storeId }: LowStockProductsProps) {
    const t = useTranslations('admin.dashboard')
    return (
        <Card className="border-none shadow-sm h-full">
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
                <CardTitle className='text-sm font-bold text-navy uppercase tracking-wider'>{t('lowStockProducts')}</CardTitle>
                <Link href={`/admin/${storeId}/stock/low-stocks`} className='text-[10px] uppercase font-semibold text-blue-600 hover:text-blue-700 transition-colors tracking-widest bg-blue-50 px-2 py-1 rounded-md'>
                    {t('viewAll')}
                </Link>
            </CardHeader>
            <CardContent>
                <div className='flex flex-col gap-4'>
                    {data.map((product) => (
                        <div key={product._id} className='group flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors duration-200'>
                            <div className='flex items-center gap-3'>
                                <div className='relative h-12 w-12 overflow-hidden rounded-xl border border-slate-100 shadow-sm'>
                                    <Image
                                        src={product.images[0]?.imgUrl || '/placeholder.png'}
                                        alt={product.name}
                                        fill
                                        className='object-cover group-hover:scale-110 transition-transform duration-500'
                                    />
                                </div>
                                <div className="min-w-0">
                                    <p className='font-semibold text-slate-800 text-sm line-clamp-1 group-hover:text-orange transition-colors'>{product.name}</p>
                                    <p className='text-[10px] text-slate-400 font-semibold uppercase tracking-wider'>ID: #{product._id.slice(-6)}</p>
                                </div>
                            </div>
                            <div className='text-right'>
                                <p className='text-[10px] text-slate-400 font-semibold uppercase tracking-tighter leading-none mb-1'>{t('instock')}</p>
                                <span className={cn(
                                    "inline-flex items-center justify-center min-w-[32px] h-6 px-2 rounded-lg text-xs font-bold shadow-sm",
                                    product.countInStock === 0 ? "bg-rose-500 text-white" : "bg-orange text-white"
                                )}>
                                    {product.countInStock}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
