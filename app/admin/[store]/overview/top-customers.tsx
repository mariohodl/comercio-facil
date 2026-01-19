import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface TopCustomersProps {
    data: {
        _id: string
        name: string
        email: string
        image?: string
        totalSpent: number
        orderCount: number
    }[]
}

export default function TopCustomers({ data }: TopCustomersProps) {
    const t = useTranslations('admin.dashboard')
    return (
        <Card className="border-none shadow-sm h-full">
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
                <CardTitle className='text-sm font-bold text-navy uppercase tracking-wider'>{t('topCustomers')}</CardTitle>
                <Link href='/admin/users' className='text-[10px] uppercase font-semibold text-slate-400 hover:text-orange transition-colors tracking-widest bg-slate-50 px-2 py-1 rounded-md'>
                    {t('viewAll')}
                </Link>
            </CardHeader>
            <CardContent>
                <div className='flex flex-col gap-4'>
                    {data.map((customer) => (
                        <div key={customer._id} className='group flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors duration-200'>
                            <div className='flex items-center gap-3'>
                                <div className='h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden group-hover:from-orange/5 group-hover:to-orange/10 transition-colors'>
                                    {customer.image ? (
                                        <img src={customer.image} alt={customer.name} className='h-full w-full object-cover group-hover:scale-110 transition-transform duration-500' />
                                    ) : (
                                        <span className='text-sm font-bold text-slate-400 group-hover:text-orange transition-colors'>{customer.name.charAt(0)}</span>
                                    )}
                                </div>
                                <div>
                                    <p className='text-sm font-semibold text-slate-800 line-clamp-1 group-hover:text-orange transition-colors'>{customer.name}</p>
                                    <p className='text-[10px] font-semibold text-slate-400 uppercase tracking-wider'>
                                        {t('ordersCount', { count: customer.orderCount })}
                                    </p>
                                </div>
                            </div>
                            <div className='text-right'>
                                <p className='text-sm font-bold text-slate-900'>
                                    {formatCurrency(customer.totalSpent)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
