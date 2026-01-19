import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { IOrderList } from '@/types'
import { useTranslations } from 'next-intl'
// Image removed

interface RecentSalesListProps {
    data: IOrderList[]
}

export default function RecentSalesList({ data }: RecentSalesListProps) {
    const t = useTranslations('admin.dashboard')
    return (
        <Card className="border-none shadow-sm h-full">
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
                <CardTitle className='text-sm font-bold text-navy uppercase tracking-wider'>{t('recentSales')}</CardTitle>
                <div className='text-[10px] uppercase font-semibold text-slate-400 tracking-widest bg-slate-50 px-2 py-1 rounded-md'>{t('weekly')}</div>
            </CardHeader>
            <CardContent>
                <div className='flex flex-col gap-4'>
                    {data.slice(0, 5).map((order) => (
                        <div key={order._id} className='group flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors duration-200'>
                            <div className='flex items-center gap-3'>
                                <div className='relative h-12 w-12 overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-100 flex items-center justify-center group-hover:from-orange/5 group-hover:to-orange/10 transition-colors'>
                                    <span className='text-lg font-bold text-slate-400 group-hover:text-orange transition-colors'>
                                        {(order.customer as any)?.name?.charAt(0) ||
                                            order.shippingAddress?.fullName?.charAt(0) ||
                                            order.user?.name?.charAt(0) || 'U'}
                                    </span>
                                </div>
                                <div className="min-w-0">
                                    <p className='font-semibold text-slate-800 text-sm line-clamp-1 group-hover:text-orange transition-colors'>
                                        {(order.customer as any)?.name ||
                                            order.shippingAddress?.fullName ||
                                            order.user?.name || t('deletedUser')}
                                    </p>
                                    <p className='text-[10px] text-slate-400 font-semibold uppercase tracking-wider'>
                                        {formatDateTime(order.createdAt).dateOnly}
                                    </p>
                                </div>
                            </div>
                            <div className='text-right'>
                                <p className='font-bold text-slate-900 text-sm mb-1'>{formatCurrency(order.totalPrice)}</p>
                                <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter ${order.isDelivered
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : order.isPaid
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'bg-amber-50 text-amber-600'
                                    }`}>
                                    {order.isDelivered ? t('completed') : order.isPaid ? t('processing') : t('pending')}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
