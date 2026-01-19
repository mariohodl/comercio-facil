import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface RecentTransactionsTableProps {
    data: {
        id: string
        date: string
        name: string
        total: number
        status: string
        type: 'Sale' | 'Purchase'
    }[]
}

export default function RecentTransactionsTable({ data }: RecentTransactionsTableProps) {
    const t = useTranslations('admin.dashboard')
    return (
        <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className='flex flex-row items-center justify-between pb-2 bg-white'>
                <CardTitle className='text-sm font-bold text-navy uppercase tracking-wider'>{t('recentTransactions')}</CardTitle>
                <Link href='/admin/orders' className='text-[10px] uppercase font-semibold text-slate-400 hover:text-orange transition-colors tracking-widest bg-slate-50 px-2 py-1 rounded-md'>
                    {t('viewAll')}
                </Link>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto no-scrollbar">
                    <Table>
                        <TableHeader className='bg-slate-50/50'>
                            <TableRow className="border-none hover:bg-transparent">
                                <TableHead className="text-[10px] uppercase font-bold text-slate-400 tracking-widest py-3">{t('date')}</TableHead>
                                <TableHead className="text-[10px] uppercase font-bold text-slate-400 tracking-widest py-3">{t('customerSupplier')}</TableHead>
                                <TableHead className="text-[10px] uppercase font-bold text-slate-400 tracking-widest py-3">{t('status')}</TableHead>
                                <TableHead className='text-[10px] uppercase font-bold text-slate-400 tracking-widest text-right py-3'>{t('total')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((transaction) => (
                                <TableRow key={transaction.id} className="group transition-colors hover:bg-slate-50 border-slate-50">
                                    <TableCell className='text-[11px] font-semibold text-slate-500 whitespace-nowrap'>
                                        {formatDateTime(new Date(transaction.date)).dateOnly}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        <div className='flex items-center gap-3'>
                                            <div>
                                                <p className='text-sm font-semibold text-slate-900 group-hover:text-orange transition-colors'>{transaction.name}</p>
                                                <p className='text-[10px] font-bold text-slate-400 uppercase tracking-tighter'>#{transaction.id.slice(-6)}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter ${transaction.status === 'Completed'
                                            ? 'bg-emerald-50 text-emerald-600'
                                            : transaction.status === 'Processing'
                                                ? 'bg-blue-50 text-blue-600'
                                                : 'bg-amber-50 text-amber-600'
                                            }`}>
                                            {transaction.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className='text-right whitespace-nowrap'>
                                        <span className="text-sm font-bold text-slate-900">
                                            {formatCurrency(transaction.total)}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
