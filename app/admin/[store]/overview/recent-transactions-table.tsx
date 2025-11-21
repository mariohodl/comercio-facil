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
    return (
        <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
                <CardTitle className='text-base'>Recent Transactions</CardTitle>
                <Link href='/admin/orders' className='text-sm text-muted-foreground hover:underline'>
                    View All
                </Link>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Customer/Supplier</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className='text-right'>Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((transaction) => (
                            <TableRow key={transaction.id}>
                                <TableCell className='text-muted-foreground'>
                                    {formatDateTime(new Date(transaction.date)).dateOnly}
                                </TableCell>
                                <TableCell>
                                    <div className='flex items-center gap-3'>
                                        {/* Avatar placeholder could go here */}
                                        <div>
                                            <p className='font-medium'>{transaction.name}</p>
                                            <p className='text-xs text-muted-foreground'>#{transaction.id.slice(-6)}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${transaction.status === 'Completed'
                                        ? 'bg-green-100 text-green-700'
                                        : transaction.status === 'Processing'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {transaction.status}
                                    </span>
                                </TableCell>
                                <TableCell className='text-right font-medium'>
                                    {formatCurrency(transaction.total)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
