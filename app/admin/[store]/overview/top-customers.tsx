import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

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
    return (
        <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
                <CardTitle className='text-base'>Top Customers</CardTitle>
                <Link href='/admin/users' className='text-sm text-muted-foreground hover:underline'>
                    View All
                </Link>
            </CardHeader>
            <CardContent>
                <div className='space-y-6'>
                    {data.map((customer) => (
                        <div key={customer._id} className='flex items-center justify-between'>
                            <div className='flex items-center gap-4'>
                                <div className='h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden'>
                                    {customer.image ? (
                                        <img src={customer.image} alt={customer.name} className='h-full w-full object-cover' />
                                    ) : (
                                        <span className='text-sm font-bold text-gray-500'>{customer.name.charAt(0)}</span>
                                    )}
                                </div>
                                <div>
                                    <p className='font-medium line-clamp-1'>{customer.name}</p>
                                    <p className='text-xs text-muted-foreground'>
                                        {customer.orderCount} Orders
                                    </p>
                                </div>
                            </div>
                            <div className='text-right font-bold'>
                                {formatCurrency(customer.totalSpent)}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
