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
        <div className='space-y-6'>
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2 md:px-0'>
                <div>
                    <h1 className='font-bold text-2xl text-navy'>{t('title')}</h1>
                    <p className='text-muted-foreground text-sm'>{t('manageSales')}</p>
                </div>
                <div className='flex flex-wrap items-center gap-2 w-full sm:w-auto'>
                    <div className='flex items-center gap-2 mr-auto sm:mr-0'>
                        <Button variant='outline' size='icon' className="h-9 w-9">
                            <FileText className='w-4 h-4 text-red-500' />
                        </Button>
                        <Button variant='outline' size='icon' className="h-9 w-9">
                            <FileSpreadsheet className='w-4 h-4 text-green-500' />
                        </Button>
                        <Button variant='outline' size='icon' onClick={() => fetchData(page)} className="h-9 w-9">
                            <RefreshCw className='w-4 h-4' />
                        </Button>
                        <Button variant='outline' size='icon' className="h-9 w-9">
                            <ChevronLeft className='w-4 h-4 rotate-90' />
                        </Button>
                    </div>
                    <Button asChild className='bg-orange hover:bg-orange-dark text-white h-9 px-4 flex-1 sm:flex-none'>
                        <Link href={`/admin/${store}/pos`}>
                            <Plus className='w-4 h-4 mr-2' />
                            <span className="hidden sm:inline">{t('addSale')}</span>
                            <span className="sm:hidden">{tCommon('add')}</span>
                        </Link>
                    </Button>
                </div>
            </div>

            <div className='bg-white p-4 md:p-6 rounded-xl border border-neutral-warm shadow-sm space-y-6 font-sans mx-2 md:mx-0'>
                <div className='flex flex-col xl:flex-row justify-between gap-4'>
                    <div className='relative w-full xl:w-80'>
                        <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                        <Input
                            placeholder={tCommon('search')}
                            value={inputValue}
                            onChange={handleInputChange}
                            className='pl-10 bg-gray-50/50 h-11 w-full border-gray-200 focus:bg-white transition-all'
                        />
                    </div>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className='w-full h-11 bg-gray-50/50 border-gray-200'>
                                <SelectValue placeholder={t('customer')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='all'>{t('customer')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className='w-full h-11 bg-gray-50/50 border-gray-200'>
                                <SelectValue placeholder={t('status')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='all'>{t('allStatus')}</SelectItem>
                                <SelectItem value='completed'>{t('completed')}</SelectItem>
                                <SelectItem value='pending'>{t('pending')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                            <SelectTrigger className='w-full h-11 bg-gray-50/50 border-gray-200'>
                                <SelectValue placeholder={t('paymentStatus')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='all'>{t('paymentStatus')}</SelectItem>
                                <SelectItem value='paid'>{t('paid')}</SelectItem>
                                <SelectItem value='unpaid'>{t('unpaid')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select defaultValue='7'>
                            <SelectTrigger className='w-full h-11 bg-gray-50/50 border-gray-200'>
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

                <div className='rounded-lg border overflow-hidden'>
                    <div className='overflow-x-auto'>
                        <Table>
                            <TableHeader className='bg-gray-50/50'>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className='w-12'>
                                        <Checkbox />
                                    </TableHead>
                                    <TableHead className='text-[#4B5563] font-bold min-w-[200px]'>{t('customer')}</TableHead>
                                    <TableHead className='text-[#4B5563] font-bold min-w-[120px]'>{t('date')}</TableHead>
                                    <TableHead className='text-[#4B5563] font-bold min-w-[100px]'>{t('status')}</TableHead>
                                    <TableHead className='text-[#4B5563] font-bold min-w-[150px]'>{t('fulfillment.title')}</TableHead>
                                    <TableHead className='text-[#4B5563] font-bold min-w-[120px]'>{t('grandTotal')}</TableHead>
                                    <TableHead className='text-[#4B5563] font-bold min-w-[100px]'>{t('paid')}</TableHead>
                                    <TableHead className='text-[#4B5563] font-bold min-w-[100px]'>{t('due')}</TableHead>
                                    <TableHead className='text-[#4B5563] font-bold min-w-[130px]'>{t('paymentStatus')}</TableHead>
                                    <TableHead className='text-[#4B5563] font-bold min-w-[120px]'>{t('biller')}</TableHead>
                                    <TableHead className='text-right w-[80px]'>{tCommon('actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isPending ? (
                                    <TableRow>
                                        <TableCell colSpan={11} className='text-center h-32'>
                                            <div className="flex flex-col items-center gap-2">
                                                <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                                                <span className="text-sm text-gray-500">{tCommon('loading')}</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : data?.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={11} className='text-center h-32 text-gray-500'>
                                            {tCommon('noResults')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data?.data.map((order) => {
                                        const paidAmount = order.isPaid ? order.totalPrice : 0
                                        const dueAmount = order.totalPrice - paidAmount

                                        return (
                                            <TableRow key={order._id} className="hover:bg-gray-50/50 transition-colors">
                                                <TableCell>
                                                    <Checkbox />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative w-9 h-9 rounded-full overflow-hidden bg-gray-100 border flex-shrink-0">
                                                            <Image
                                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${(order as any).customer?.name || 'walk-in'}`}
                                                                alt={(order as any).customer?.name || 'Customer'}
                                                                fill
                                                                className='object-cover'
                                                            />
                                                        </div>
                                                        <div className="flex flex-col overflow-hidden">
                                                            <span className='font-semibold text-navy truncate max-w-[150px]'>
                                                                {(order as any).customer?.name || t('walkInCustomer')}
                                                            </span>
                                                            {(order as any).customer?.email && (
                                                                <span className='text-[10px] text-gray-400 truncate max-w-[150px]'>
                                                                    {(order as any).customer?.email}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="text-gray-600 font-medium">
                                                    {formatDateTime(order.createdAt).dateOnly}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(order)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1.5">
                                                        {getFulfillmentBadge(order)}
                                                        {getFulfillmentStatusBadge(order)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-bold text-navy">
                                                    {formatCurrency(order.totalPrice)}
                                                </TableCell>
                                                <TableCell className="text-green-600 font-medium">
                                                    {formatCurrency(paidAmount)}
                                                </TableCell>
                                                <TableCell className="text-red-500 font-medium">
                                                    {formatCurrency(dueAmount)}
                                                </TableCell>
                                                <TableCell>
                                                    {getPaymentStatusBadge(order)}
                                                </TableCell>
                                                <TableCell className="text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium bg-gray-50 px-2 py-0.5 rounded border border-gray-100 text-xs">
                                                            {(order.user as any)?.name || 'Admin'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className='text-right'>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 transition-colors">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48 shadow-lg border-gray-100">
                                                            <DropdownMenuItem onSelect={() => {
                                                                setSelectedOrder(order)
                                                                setTimeout(() => setShowDetails(true), 0)
                                                            }} className="cursor-pointer">
                                                                <Eye className="mr-2 h-4 w-4 text-blue-500" /> {tCommon('view')}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onSelect={() => {
                                                                setSelectedOrder(order)
                                                                setTimeout(() => setShowFulfillment(true), 0)
                                                            }} className="cursor-pointer">
                                                                <Settings className="mr-2 h-4 w-4 text-gray-500" /> {t('fulfillment.title')}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
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
                </div>

                <div className='flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-gray-100'>
                    <div className='text-sm font-medium text-gray-500 order-2 sm:order-1 flex items-center gap-3'>
                        <span className="whitespace-nowrap">{tCommon('rowsPerPage')}</span>
                        <Select defaultValue='10'>
                            <SelectTrigger className='w-[80px] h-10 bg-gray-50/50 border-gray-200'>
                                <SelectValue placeholder='10' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='10'>10</SelectItem>
                                <SelectItem value='20'>20</SelectItem>
                                <SelectItem value='50'>50</SelectItem>
                            </SelectContent>
                        </Select>
                        <span className='whitespace-nowrap'>{tCommon('entries')}</span>
                    </div>

                    {(data?.totalPages ?? 0) > 1 && (
                        <div className='flex items-center gap-2 order-1 sm:order-2'>
                            <Button
                                variant='outline'
                                size='icon'
                                onClick={() => handlePageChange('prev')}
                                disabled={Number(page) <= 1}
                                className='h-10 w-10 border-gray-200 hover:bg-gray-50'
                            >
                                <ChevronLeft className='h-4 w-4 text-gray-600' />
                            </Button>
                            <div className='flex gap-1.5 overflow-x-auto max-w-[150px] sm:max-w-none no-scrollbar py-1'>
                                {Array.from({ length: Math.min(data?.totalPages || 0, 5) }).map((_, i) => (
                                    <Button
                                        key={i}
                                        variant={page === i + 1 ? 'default' : 'outline'}
                                        size='icon'
                                        className={`h-10 w-10 flex-shrink-0 transition-all font-bold ${page === i + 1
                                            ? 'bg-orange hover:bg-orange-dark text-white border-none shadow-md shadow-orange/20'
                                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
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
                                className='h-10 w-10 border-gray-200 hover:bg-gray-50'
                            >
                                <ChevronRight className='h-4 w-4 text-gray-600' />
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
