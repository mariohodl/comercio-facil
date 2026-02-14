import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, cn } from '@/lib/utils'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
// Link removed

interface TopSellingProductsProps {
    data: {
        label: string
        value: number
        image: string
        id: string
    }[]
}

export default function TopSellingProducts({ data }: TopSellingProductsProps) {
    const t = useTranslations('admin.dashboard')
    return (
        <Card className="border-none shadow-sm h-full">
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
                <CardTitle className='text-sm font-bold text-navy uppercase tracking-wider'>{t('topSellingProducts')}</CardTitle>
                <div className='text-[10px] uppercase font-semibold text-slate-400 tracking-widest bg-slate-50 px-2 py-1 rounded-md'>{t('today')}</div>
            </CardHeader>
            <CardContent>
                <div className='flex flex-col gap-4'>
                    {data.map((product, index) => (
                        <div key={index} className='group flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors duration-200'>
                            <div className='flex items-center gap-3'>
                                <div className="relative">
                                    <div className='relative h-12 w-12 overflow-hidden rounded-xl border border-slate-100 shadow-sm bg-slate-50 flex items-center justify-center shrink-0'>
                                        {product.image ? (
                                            <Image
                                                src={product.image}
                                                alt={product.label}
                                                fill
                                                className='object-cover group-hover:scale-110 transition-transform duration-500'
                                            />
                                        ) : (
                                            <span className='text-[8px] text-slate-400 font-bold uppercase tracking-tighter'>No Img</span>
                                        )}
                                    </div>
                                    <div className={cn(
                                        "absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg border-2 border-white",
                                        index === 0 ? "bg-orange text-white" :
                                            index === 1 ? "bg-slate-400 text-white" :
                                                index === 2 ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-500"
                                    )}>
                                        {index + 1}
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <p className='font-semibold text-slate-800 text-sm line-clamp-1 group-hover:text-orange transition-colors'>{product.label}</p>
                                    <div className="flex items-center gap-2">
                                        <span className='text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded'>
                                            {formatCurrency(product.value)}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-tighter">
                                            {t('sales')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className='flex items-center'>
                                <span className='text-[10px] font-bold text-emerald-500'>
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
