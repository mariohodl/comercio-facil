import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/db'
import CashRegisterSession, { ICashRegisterSession, ICashRegisterMovement } from '@/lib/db/models/cash-register.model'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export default async function CashRegisterDetailsPage({ params }: { params: Promise<{ storeId: string, id: string }> }) {
    const { storeId, id } = await params
    const session = await auth()

    if (!session || !session.user) {
        return <div>Unauthorized</div>
    }

    await connectToDatabase()

    const register = await CashRegisterSession.findById(id).populate('userId', 'name email') as unknown as (ICashRegisterSession & { userId: { name: string, email: string } })

    if (!register) {
        return <div>Cash Register Session not found</div>
    }

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
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/admin/${storeId}/cash-register`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex items-center gap-2">
                    <h2 className="text-3xl font-bold tracking-tight">Session Details</h2>
                    <Badge variant={register.status === 'open' ? 'default' : 'secondary'}>
                        {register.status}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Opened By</span>
                            <span className="font-medium">{register.userId?.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Opened At</span>
                            <span className="font-medium">{formatDateTime(register.openedAt).dateTime}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Closed At</span>
                            <span className="font-medium">{register.closedAt ? formatDateTime(register.closedAt).dateTime : '-'}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Opening Amount</span>
                            <span className="font-medium">{formatCurrency(register.openingAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Sales</span>
                            <span className="font-medium text-blue-600">+{formatCurrency(salesTotal)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Deposits</span>
                            <span className="font-medium text-green-600">+{formatCurrency(deposits)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Withdrawals</span>
                            <span className="font-medium text-red-600">-{formatCurrency(withdrawals)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold">
                            <span>Expected Cash</span>
                            <span>{formatCurrency(expectedCash)}</span>
                        </div>
                        {register.status === 'closed' && (
                            <>
                                <div className="flex justify-between font-bold">
                                    <span>Actual Closing</span>
                                    <span>{formatCurrency(register.closingAmount || 0)}</span>
                                </div>
                                <div className={`flex justify-between font-bold ${diff < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                    <span>Difference</span>
                                    <span>{formatCurrency(diff)}</span>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Movements Log</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Notes</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {register.movements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((movement: any, index: number) => (
                                    <TableRow key={index}>
                                        <TableCell>{formatDateTime(movement.createdAt).timeOnly}</TableCell>
                                        <TableCell className="capitalize">{movement.type}</TableCell>
                                        <TableCell>
                                            {movement.notes}
                                            {movement.orderId && (
                                                <span className="ml-2 text-xs text-muted-foreground">(Order Ref)</span>
                                            )}
                                        </TableCell>
                                        <TableCell className={`text-right font-medium ${movement.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'}`}>
                                            {movement.type === 'withdrawal' ? '-' : '+'}{formatCurrency(movement.amount)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {register.movements.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">No movements recorded</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
