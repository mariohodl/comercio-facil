import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/db'
import CashRegisterSession, { ICashRegisterSession } from '@/lib/db/models/cash-register.model'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge'
import { Eye } from 'lucide-react'

export default async function CashRegisterListPage({ params }: { params: Promise<{ storeId: string }> }) {
    const { storeId } = await params
    const session = await auth()

    if (!session || !session.user) {
        return <div>Unauthorized</div>
    }

    await connectToDatabase()

    const registers = await CashRegisterSession.find({ storeId })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 }) as unknown as (ICashRegisterSession & { userId: { name: string, email: string } })[]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Cash Registers</h2>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Opened At</TableHead>
                            <TableHead>Closed At</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead className="text-right">Opening</TableHead>
                            <TableHead className="text-right">Closing</TableHead>
                            <TableHead className="text-right">Difference</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {registers.map((register) => {
                            // Calculate expected total for diff
                            const salesTotal = register.movements
                                .filter(m => m.type === 'sale')
                                .reduce((acc, curr) => acc + curr.amount, 0)
                            const deposits = register.movements
                                .filter(m => m.type === 'deposit')
                                .reduce((acc, curr) => acc + curr.amount, 0)
                            const withdrawals = register.movements
                                .filter(m => m.type === 'withdrawal')
                                .reduce((acc, curr) => acc + curr.amount, 0)

                            const expectedCash = register.openingAmount + salesTotal + deposits - withdrawals
                            const diff = register.closingAmount ? register.closingAmount - expectedCash : 0

                            return (
                                <TableRow key={register._id as string}>
                                    <TableCell>
                                        <Badge variant={register.status === 'open' ? 'default' : 'secondary'}>
                                            {register.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{formatDateTime(register.openedAt).dateTime}</TableCell>
                                    <TableCell>{register.closedAt ? formatDateTime(register.closedAt).dateTime : '-'}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{register.userId?.name || 'Unknown'}</span>
                                            <span className="text-xs text-muted-foreground">{register.userId?.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">{formatCurrency(register.openingAmount)}</TableCell>
                                    <TableCell className="text-right">{register.closingAmount ? formatCurrency(register.closingAmount) : '-'}</TableCell>
                                    <TableCell className={`text-right font-medium ${diff < 0 ? 'text-red-500' : diff > 0 ? 'text-green-500' : ''}`}>
                                        {register.status === 'closed' ? formatCurrency(diff) : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/admin/${storeId}/cash-register/${register._id}`}>
                                            <Button variant="ghost" size="icon">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        {registers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                    No cash register sessions found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
