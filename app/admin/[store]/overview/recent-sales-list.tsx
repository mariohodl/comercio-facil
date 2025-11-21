import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { IOrderList } from '@/types'
import Image from 'next/image'

interface RecentSalesListProps {
    data: IOrderList[]
}

export default function RecentSalesList({ data }: RecentSalesListProps) {
    return (
        <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
                <CardTitle className='text-base'>Recent Sales</CardTitle>
                <div className='text-sm text-muted-foreground'>Weekly</div>
            </CardHeader>
            <CardContent>
                <div className='space-y-6'>
                    {data.slice(0, 5).map((order) => (
                        <div key={order._id} className='flex items-center justify-between'>
                            <div className='flex items-center gap-4'>
                                <div className='relative h-12 w-12 overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center'>
                                    {/* Placeholder for product image or user avatar if no product image available easily */}
                                    <span className='text-lg font-bold text-gray-500'>{order.user?.name?.charAt(0) || 'U'}</span>
                                </div>
                                <div>
                                    <p className='font-medium line-clamp-1'>{order.user?.name || 'Deleted User'}</p>
                                    <p className='text-sm text-muted-foreground'>
                                        {formatDateTime(order.createdAt).dateOnly}
                                    </p>
                                </div>
                            </div>
                            <div className='text-right'>
                                <p className='font-medium'>{formatCurrency(order.totalPrice)}</p>
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${order.isDelivered
                                        ? 'bg-green-100 text-green-700'
                                        : order.isPaid
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {order.isDelivered ? 'Completed' : order.isPaid ? 'Processing' : 'Pending'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
