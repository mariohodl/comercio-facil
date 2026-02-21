'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
    ChevronLeft,
    ChevronRight,
    Edit,
    Eye,
    FileSpreadsheet,
    FileText,
    Plus,
    RefreshCw,
    Search,
    Copy,
    Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { usePurchaseFormStore } from '@/hooks/use-purchase-form-store'
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
import { useState, useEffect, useTransition, useCallback } from 'react'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { getAllPurchases } from '@/lib/actions/purchase.actions'
import GuidedHighlighter from '@/components/shared/guided-highlighter'

type PurchaseListDataProps = {
    purchases: any[]
    totalPages: number
    totalPurchases: number
}

const PurchaseList = ({ store }: { store: string }) => {
    const t = useTranslations('purchases')
    const tCommon = useTranslations('common')
    const tOnboarding = useTranslations('admin.onboarding')
    const [page, setPage] = useState<number>(1)
    const [inputValue, setInputValue] = useState<string>('')
    const [status, setStatus] = useState<string>('all')
    const [paymentStatus, setPaymentStatus] = useState<string>('all')
    const [type, setType] = useState<string>('all')
    const [dateRange, setDateRange] = useState<string>('this_month')
    const [data, setData] = useState<PurchaseListDataProps>()
    const [isPending, startTransition] = useTransition()

    const fetchData = useCallback((pageToFetch: number) => {
        startTransition(() => {
            getAllPurchases({
                query: inputValue,
                page: pageToFetch,
                storeId: store,
                status,
                paymentStatus,
                type,
                dateRange,
            }).then((result) => {
                setData(result)
            })
        })
    }, [inputValue, status, paymentStatus, type, dateRange, store])

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
        setInputValue(e.target.value)
    }



    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Received':
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">{t('statuses.received')}</Badge>
            case 'Pending':
                return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200">{t('statuses.pending')}</Badge>
            case 'Ordered':
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">{t('statuses.ordered')}</Badge>
            case 'Cancelled':
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">{t('statuses.cancelled')}</Badge>
            case 'Completed':
                return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200">{t('statuses.completed')}</Badge>
            case 'WithExchanges':
                return <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-indigo-200">{t('statuses.withExchanges')}</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const getPaymentStatusBadge = (status: string) => {
        switch (status) {
            case 'Paid':
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">{t('paymentStatuses.paid')}</Badge>
            case 'Unpaid':
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">{t('paymentStatuses.unpaid')}</Badge>
            case 'Partial':
                return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200">{t('paymentStatuses.partial')}</Badge>
            case 'Overdue':
                return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200">{t('paymentStatuses.overdue')}</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className='space-y-4'>
            <div className='flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4'>
                <div>
                    <h1 className='font-bold text-2xl'>{t('title')}</h1>
                    <p className='text-muted-foreground text-sm'>{t('managePurchases')}</p>
                </div>
                <div className='flex flex-wrap gap-2 w-full xl:w-auto'>
                    <div className='flex gap-2 w-full sm:w-auto'>
                        <Button variant='outline' size='icon' className="shrink-0">
                            <FileText className='w-4 h-4 text-red-500' />
                        </Button>
                        <Button variant='outline' size='icon' className="shrink-0">
                            <FileSpreadsheet className='w-4 h-4 text-green-500' />
                        </Button>
                        <Button variant='outline' size='icon' onClick={() => fetchData(page)} className="shrink-0">
                            <RefreshCw className='w-4 h-4' />
                        </Button>
                    </div>
                    <GuidedHighlighter
                        show={data?.totalPurchases === 0}
                        message={tOnboarding('highlights.addPurchase')}
                        position="bottom"
                    >
                        <Button asChild className='bg-orange hover:bg-orange-dark text-white flex-1 sm:flex-none shadow-md transition-all active:scale-95'>
                            <Link
                                href={`/admin/${store}/purchases/create`}
                                onClick={() => usePurchaseFormStore.getState().clearAll()}
                            >
                                <Plus className='w-4 h-4 mr-2' /> {t('addPurchase')}
                            </Link>
                        </Button>
                    </GuidedHighlighter>
                </div>
            </div>

            <div className='bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4'>
                <div className='flex flex-col lg:flex-row justify-between gap-4'>
                    <div className='relative w-full lg:w-72'>
                        <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-gray-400' />
                        <Input
                            placeholder={t('searchPlaceholder')}
                            value={inputValue}
                            onChange={handleInputChange}
                            className='pl-9 w-full bg-gray-50 border-gray-200 focus:bg-white transition-all'
                        />
                    </div>
                    <div className='flex flex-wrap sm:flex-nowrap gap-2 w-full lg:w-auto'>
                        <Select value={dateRange} onValueChange={setDateRange}>
                            <SelectTrigger className='w-full sm:w-[150px] bg-gray-50 border-gray-200'>
                                <SelectValue placeholder={t('date')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='all'>{tCommon('all')}</SelectItem>
                                <SelectItem value='today'>{tCommon('dateRanges.today')}</SelectItem>
                                <SelectItem value='yesterday'>{tCommon('dateRanges.yesterday')}</SelectItem>
                                <SelectItem value='this_week'>{tCommon('dateRanges.thisWeek')}</SelectItem>
                                <SelectItem value='this_month'>{tCommon('dateRanges.thisMonth')}</SelectItem>
                            </SelectContent>
                        </Select>



                        <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                            <SelectTrigger className='w-full sm:w-[150px] bg-gray-50 border-gray-200'>
                                <SelectValue placeholder={t('paymentStatus')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='all'>{tCommon('all')}</SelectItem>
                                <SelectItem value='Paid'>{t('paymentStatuses.paid')}</SelectItem>
                                <SelectItem value='Unpaid'>{t('paymentStatuses.unpaid')}</SelectItem>
                                <SelectItem value='Partial'>{t('paymentStatuses.partial')}</SelectItem>
                                <SelectItem value='Overdue'>{t('paymentStatuses.overdue')}</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger className='w-full sm:w-[150px] bg-gray-50 border-gray-200'>
                                <SelectValue placeholder={t('type')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='all'>{tCommon('all')}</SelectItem>
                                <SelectItem value='Normal'>{t('purchaseType.normal')}</SelectItem>
                                <SelectItem value='WithExchanges'>{t('purchaseType.withExchanges')}</SelectItem>
                                <SelectItem value='OnlyReplacement'>{t('purchaseType.onlyReplacement')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className='rounded-xl border border-gray-100 overflow-hidden'>
                    <Table>
                        <TableHeader className='bg-gray-50'>
                            <TableRow>
                                <TableHead className='font-bold text-navy'>{t('supplierName')}</TableHead>
                                <TableHead className='font-bold text-navy'>{t('reference')}</TableHead>
                                <TableHead className='font-bold text-navy'>{t('date')}</TableHead>

                                <TableHead className='font-bold text-navy'>{t('total')}</TableHead>
                                <TableHead className='font-bold text-navy'>{t('paid')}</TableHead>
                                <TableHead className='font-bold text-navy'>{t('due')}</TableHead>
                                <TableHead className='font-bold text-navy'>{t('paymentStatus')}</TableHead>
                                <TableHead className='text-right font-bold text-navy'>{tCommon('actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isPending ? (
                                <TableRow>
                                    <TableCell colSpan={9} className='text-center h-24 text-muted-foreground'>
                                        {tCommon('loading')}
                                    </TableCell>
                                </TableRow>
                            ) : data?.purchases.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className='text-center h-24 text-muted-foreground'>
                                        {tCommon('noResults')}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data?.purchases.map((purchase) => {
                                    const due = purchase.totalAmount - purchase.paidAmount;
                                    return (
                                        <TableRow key={purchase._id} className="hover:bg-gray-50/50 transition-colors">
                                            <TableCell className="font-medium">
                                                {purchase.supplierId?.nameProvider || t('internalSupplier')}
                                            </TableCell>
                                            <TableCell className='text-gray-600 font-mono text-xs'>
                                                {purchase.reference}
                                            </TableCell>
                                            <TableCell className='text-gray-600'>
                                                {new Date(purchase.purchaseDate).toLocaleDateString()}
                                            </TableCell>

                                            <TableCell className='font-bold text-navy'>
                                                {formatCurrency(purchase.totalAmount)}
                                            </TableCell>
                                            <TableCell className='text-green-600 font-medium'>
                                                {formatCurrency(purchase.paidAmount)}
                                            </TableCell>
                                            <TableCell className={due > 0 ? 'text-red-500 font-medium' : 'text-gray-400'}>
                                                {formatCurrency(due)}
                                            </TableCell>
                                            <TableCell>
                                                {getPaymentStatusBadge(purchase.paymentStatus)}
                                            </TableCell>
                                            <TableCell className='text-right'>
                                                <div className='flex justify-end gap-2'>
                                                    <Button
                                                        asChild
                                                        variant='ghost'
                                                        size='icon'
                                                        className='h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50'
                                                        title={t('itemActions.view')}
                                                    >
                                                        <Link href={`/admin/${store}/purchases/${purchase._id}/view`}>
                                                            <Eye className='w-4 h-4' />
                                                        </Link>
                                                    </Button>


                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination (Simplified for now) */}
                <div className='flex items-center justify-between'>
                    <div className='text-sm text-gray-500'>
                        {tCommon('rowsPerPage')}
                        <Select defaultValue='10'>
                            <SelectTrigger className='w-[70px] inline-flex ml-2 h-8 bg-gray-50'>
                                <SelectValue placeholder='10' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='10'>10</SelectItem>
                                <SelectItem value='20'>20</SelectItem>
                                <SelectItem value='50'>50</SelectItem>
                            </SelectContent>
                        </Select>
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
                                        className={`h-8 w-8 ${page === i + 1 ? 'bg-orange hover:bg-orange-dark text-white' : ''}`}
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
        </div >
    )
}

export default PurchaseList
