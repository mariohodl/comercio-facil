'use client'

import React, { useState, useEffect, useTransition, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
    ChevronLeft,
    ChevronRight,
    Eye,
    FileSpreadsheet,
    FileText,
    Plus,
    RefreshCw,
    Search,
    MoreVertical,
    ShoppingBag,
    Truck,
    Clock,
    Trash2,
    Settings,
} from 'lucide-react'
import SalesDetailsModal from '@/components/admin/sales/sales-details-modal'
import FulfillmentStatusModal from '@/components/admin/sales/fulfillment-status-modal'
import DeleteOrderModal from '@/components/admin/sales/delete-order-modal'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getPOSOrders } from '@/lib/actions/order.actions'
import { IOrder } from '@/lib/db/models/order.model'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import Image from 'next/image'

type SalesListDataProps = {
    data: IOrder[]
    totalPages: number
}

const SalesList = ({ store }: { store: string }) => {
    const t = useTranslations('sales')
    const tCommon = useTranslations('common')
    const [page, setPage] = useState<number>(1)
    const [inputValue, setInputValue] = useState<string>('')
    const [status, setStatus] = useState<string>('all')
    const [paymentStatus, setPaymentStatus] = useState<string>('all')
    const [data, setData] = useState<SalesListDataProps>()
    const [isPending, startTransition] = useTransition()

    // Modal states
    const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null)
    const [showDetails, setShowDetails] = useState(false)
    const [showFulfillment, setShowFulfillment] = useState(false)
    const [showDelete, setShowDelete] = useState(false)

    const fetchData = useCallback((pageToFetch: number) => {
        startTransition(() => {
            getPOSOrders({
                storeId: store,
                query: inputValue,
                page: pageToFetch,
                status: paymentStatus !== 'all' ? paymentStatus : 'all',
                limit: 10,
            }).then((result) => {
                setData(result)
            })
        })
    }, [store, inputValue, paymentStatus])

    useEffect(() => {
        fetchData(1)
        setPage(1)
    }, [fetchData])

    const handlePageChange = (changeType: 'next' | 'prev') => {
        const newPage = changeType === 'next' ? page + 1 : page - 1
        setPage(newPage)
        fetchData(newPage)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setInputValue(value)
    }

    const getStatusBadge = (order: IOrder) => {
        if (order.isDelivered) {
            return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">{t('completed')}</Badge>
        }
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">{t('pending')}</Badge>
    }

    const getFulfillmentBadge = (order: any) => {
        const type = order.fulfillmentType || 'IN_STORE'
        switch (type) {
            case 'IN_STORE':
                return (
                    <div className="flex items-center gap-1.5 text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full text-xs font-medium w-fit">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{t('fulfillment.inStore')}</span>
                    </div>
                )
            case 'PICKUP_LATER':
                return (
                    <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full text-xs font-medium w-fit">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{t('fulfillment.pickupLater')}</span>
                    </div>
                )
            case 'DELIVERY':
                return (
                    <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-xs font-medium w-fit">
                        <Truck className="w-3.5 h-3.5" />
                        <span>{t('fulfillment.delivery')}</span>
                    </div>
                )
            default:
                return null
        }
    }
    const getFulfillmentStatusBadge = (order: any) => {
        const status = order.fulfillmentStatus || 'PENDING'
        switch (status) {
            case 'PENDING':
                return <Badge variant="outline" className="text-[10px] py-0">{t('fulfillment.statusPending')}</Badge>
            case 'READY':
                return <Badge variant="outline" className="text-[10px] py-0 border-orange-200 text-orange-600">{t('fulfillment.statusReady')}</Badge>
            case 'OUT_FOR_DELIVERY':
                return <Badge variant="outline" className="text-[10px] py-0 border-blue-200 text-blue-600">{t('fulfillment.statusOutForDelivery')}</Badge>
            case 'DELIVERED':
                return <Badge variant="outline" className="text-[10px] py-0 border-green-200 text-green-600">{t('fulfillment.statusDelivered')}</Badge>
            default:
                return null
        }
    }

    const getPaymentStatusBadge = (order: IOrder) => {
        if (order.isPaid) {
            return <Badge className="bg-green-50 text-green-600 hover:bg-green-50 border-none flex items-center gap-1">• {t('paid')}</Badge>
        }
        // Simplified overdue logic
        const isOverdue = !order.isPaid && new Date(order.expectedDeliveryDate) < new Date()
        if (isOverdue) {
            return <Badge className="bg-red-50 text-red-600 hover:bg-red-50 border-none flex items-center gap-1">• {t('overdue')}</Badge>
        }
        return <Badge className="bg-orange-50 text-orange-600 hover:bg-orange-50 border-none flex items-center gap-1">• {t('unpaid')}</Badge>
    }

    return (
        <div className='space-y-4'>
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
                <div>
                    <h1 className='font-bold text-2xl'>{t('title')}</h1>
                    <p className='text-muted-foreground text-sm'>{t('manageSales')}</p>
                </div>
                <div className='flex flex-wrap gap-2'>
                    <Button variant='outline' size='icon'>
                        <FileText className='w-4 h-4 text-red-500' />
                    </Button>
                    <Button variant='outline' size='icon'>
                        <FileSpreadsheet className='w-4 h-4 text-green-500' />
                    </Button>
                    <Button variant='outline' size='icon' onClick={() => fetchData(page)}>
                        <RefreshCw className='w-4 h-4' />
                    </Button>
                    <Button variant='outline' size='icon'>
                        <ChevronLeft className='w-4 h-4 rotate-90' />
                    </Button>
                    <Button asChild className='bg-orange hover:bg-orange-dark text-white'>
                        <Link href={`/admin/${store}/pos`}>
                            <Plus className='w-4 h-4 mr-2' /> {t('addSale')}
                        </Link>
                    </Button>
                </div>
            </div>

            <div className='bg-white p-4 rounded-lg border border-neutral-warm shadow-sm space-y-4 font-sans'>
                <div className='flex flex-col md:flex-row justify-between gap-4'>
                    <div className='relative w-full md:w-72'>
                        <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                        <Input
                            placeholder={tCommon('search')}
                            value={inputValue}
                            onChange={handleInputChange}
                            className='pl-8 bg-gray-50/50'
                        />
                    </div>
                    <div className='flex gap-2'>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className='w-[130px] h-9'>
                                <SelectValue placeholder={t('customer')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='all'>{t('customer')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className='w-[130px] h-9'>
                                <SelectValue placeholder={t('status')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='all'>{t('allStatus')}</SelectItem>
                                <SelectItem value='completed'>{t('completed')}</SelectItem>
                                <SelectItem value='pending'>{t('pending')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                            <SelectTrigger className='w-[150px] h-9'>
                                <SelectValue placeholder={t('paymentStatus')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='all'>{t('paymentStatus')}</SelectItem>
                                <SelectItem value='paid'>{t('paid')}</SelectItem>
                                <SelectItem value='unpaid'>{t('unpaid')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select defaultValue='7'>
                            <SelectTrigger className='w-[160px] h-9'>
                                <SelectValue placeholder={tCommon('sortBy')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='7'>{t('last7Days')}</SelectItem>
                                <SelectItem value='30'>{t('last30Days')}</SelectItem>
                                <SelectItem value='all'>{t('allTime')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className='rounded-md border overflow-x-auto'>
                    <Table>
                        <TableHeader className='bg-[#F8F9FB]'>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className='w-12'>
                                    <Checkbox />
                                </TableHead>
                                <TableHead className='text-[#4B5563] font-semibold'>{t('customer')}</TableHead>
                                <TableHead className='text-[#4B5563] font-semibold'>{t('date')}</TableHead>
                                <TableHead className='text-[#4B5563] font-semibold'>{t('status')}</TableHead>
                                <TableHead className='text-[#4B5563] font-semibold'>{t('fulfillment.title')}</TableHead>
                                <TableHead className='text-[#4B5563] font-semibold'>{t('grandTotal')}</TableHead>
                                <TableHead className='text-[#4B5563] font-semibold'>{t('paid')}</TableHead>
                                <TableHead className='text-[#4B5563] font-semibold'>{t('due')}</TableHead>
                                <TableHead className='text-[#4B5563] font-semibold'>{t('paymentStatus')}</TableHead>
                                <TableHead className='text-[#4B5563] font-semibold'>{t('biller')}</TableHead>
                                <TableHead className='text-right'>{tCommon('actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isPending ? (
                                <TableRow>
                                    <TableCell colSpan={11} className='text-center h-24'>
                                        {tCommon('loading')}
                                    </TableCell>
                                </TableRow>
                            ) : data?.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={11} className='text-center h-24'>
                                        {tCommon('noResults')}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data?.data.map((order) => {
                                    const paidAmount = order.isPaid ? order.totalPrice : 0 // Simplified
                                    const dueAmount = order.totalPrice - paidAmount

                                    return (
                                        <TableRow key={order._id} className="hover:bg-gray-50/50">
                                            <TableCell>
                                                <Checkbox />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100 border flex-shrink-0">
                                                        <Image
                                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${(order as any).customer?.name || 'walk-in'}`}
                                                            alt={(order as any).customer?.name || 'Customer'}
                                                            fill
                                                            className='object-cover'
                                                        />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className='font-medium text-gray-700'>
                                                            {(order as any).customer?.name || t('walkInCustomer')}
                                                        </span>
                                                        {(order as any).customer?.email && (
                                                            <span className='text-[10px] text-gray-400'>
                                                                {(order as any).customer?.email}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell className="text-gray-600">
                                                {formatDateTime(order.createdAt).dateOnly}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(order)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    {getFulfillmentBadge(order)}
                                                    {getFulfillmentStatusBadge(order)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-semibold text-gray-900">
                                                {formatCurrency(order.totalPrice)}
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                {formatCurrency(paidAmount)}
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                {formatCurrency(dueAmount)}
                                            </TableCell>
                                            <TableCell>
                                                {getPaymentStatusBadge(order)}
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">
                                                        {(order.user as any)?.name || 'Admin'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className='text-right'>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem onSelect={() => {
                                                            setSelectedOrder(order)
                                                            setTimeout(() => setShowDetails(true), 0)
                                                        }}>
                                                            <Eye className="mr-2 h-4 w-4" /> {tCommon('view')}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={() => {
                                                            setSelectedOrder(order)
                                                            setTimeout(() => setShowFulfillment(true), 0)
                                                        }}>
                                                            <Settings className="mr-2 h-4 w-4" /> {t('fulfillment.title')}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                            onSelect={() => {
                                                                setSelectedOrder(order)
                                                                setTimeout(() => setShowDelete(true), 0)
                                                            }}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" /> {tCommon('delete')}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className='flex items-center justify-between pt-2'>
                    <div className='text-sm text-muted-foreground'>
                        {tCommon('rowsPerPage')}
                        <Select defaultValue='10'>
                            <SelectTrigger className='w-[70px] inline-flex ml-2 h-8'>
                                <SelectValue placeholder='10' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='10'>10</SelectItem>
                                <SelectItem value='20'>20</SelectItem>
                                <SelectItem value='50'>50</SelectItem>
                            </SelectContent>
                        </Select>
                        <span className='ml-2'>{tCommon('entries')}</span>
                    </div>

                    {(data?.totalPages ?? 0) > 1 && (
                        <div className='flex items-center gap-2'>
                            <Button
                                variant='outline'
                                size='icon'
                                onClick={() => handlePageChange('prev')}
                                disabled={Number(page) <= 1}
                                className='h-8 w-8'
                            >
                                <ChevronLeft className='h-4 w-4' />
                            </Button>
                            <div className='flex gap-1'>
                                {Array.from({ length: Math.min(data?.totalPages || 0, 5) }).map((_, i) => (
                                    <Button
                                        key={i}
                                        variant={page === i + 1 ? 'default' : 'outline'}
                                        size='icon'
                                        className={`h-8 w-8 ${page === i + 1 ? 'bg-orange hover:bg-orange-dark text-white border-orange' : ''}`}
                                        onClick={() => {
                                            setPage(i + 1)
                                            fetchData(i + 1)
                                        }}
                                    >
                                        {i + 1}
                                    </Button>
                                ))}
                            </div>
                            <Button
                                variant='outline'
                                size='icon'
                                onClick={() => handlePageChange('next')}
                                disabled={Number(page) >= (data?.totalPages ?? 0)}
                                className='h-8 w-8'
                            >
                                <ChevronRight className='h-4 w-4' />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <SalesDetailsModal
                open={showDetails}
                onOpenChange={(open) => {
                    setShowDetails(open)
                    if (!open) setSelectedOrder(null)
                }}
                order={selectedOrder}
            />

            <FulfillmentStatusModal
                open={showFulfillment}
                onOpenChange={(open) => {
                    setShowFulfillment(open)
                    if (!open) setSelectedOrder(null)
                }}
                orderId={selectedOrder?._id || ''}
                currentStatus={selectedOrder?.fulfillmentStatus || 'PENDING'}
                onSuccess={() => fetchData(page)}
            />

            <DeleteOrderModal
                open={showDelete}
                onOpenChange={(open) => {
                    setShowDelete(open)
                    if (!open) setSelectedOrder(null)
                }}
                orderId={selectedOrder?._id || ''}
                onSuccess={() => fetchData(page)}
            />
        </div>
    )
}

export default SalesList
