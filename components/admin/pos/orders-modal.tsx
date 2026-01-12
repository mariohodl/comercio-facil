'use client'

import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Printer, FileText, Loader2, X } from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { getPOSOrders } from '@/lib/actions/order.actions'
import { IOrder } from '@/lib/db/models/order.model'
import { useInView } from 'react-intersection-observer'
import OrderDetailsModal from './order-details-modal'
import { useTranslations } from 'next-intl'

interface OrdersModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    storeId: string
}

export default function OrdersModal({ open, onOpenChange, storeId }: OrdersModalProps) {
    const t = useTranslations('pos.ordersModal')
    const tCommon = useTranslations('common')
    const [orders, setOrders] = useState<IOrder[]>([])
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<'all' | 'paid' | 'unpaid'>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    // Details modal state
    const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null)
    const [detailsOpen, setDetailsOpen] = useState(false)

    // Infinite scroll ref
    const { ref, inView } = useInView()

    const fetchOrders = async (reset = false) => {
        if (reset) {
            setOrders([])
            setPage(1)
        }

        setLoading(true)
        try {
            const currentPage = reset ? 1 : page
            const res = await getPOSOrders({
                storeId,
                page: currentPage,
                limit: 10,
                status,
                query: searchQuery
            })

            if (reset) {
                setOrders(res.data)
            } else {
                setOrders(prev => [...prev, ...res.data])
            }
            setTotalPages(res.totalPages)
        } catch (error) {
            console.error('Failed to fetch orders', error)
        } finally {
            setLoading(false)
        }
    }

    // Initial fetch and on filter/tab change
    useEffect(() => {
        if (open) {
            fetchOrders(true)
        }
    }, [open, status, searchQuery])

    // Load more when scrolling to bottom
    useEffect(() => {
        if (inView && !loading && page < totalPages) {
            setPage(prev => prev + 1)
        }
    }, [inView, loading, totalPages])

    // Fetch next page when page changes (but not on reset)
    useEffect(() => {
        if (page > 1) {
            fetchOrders(false)
        }
    }, [page])


    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col p-0 gap-0 bg-[#F8F9FA]">
                    {/* Header */}
                    <DialogHeader className="p-4 bg-white border-b">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-xl font-bold">{t('title')}</DialogTitle>
                            {/* Close button is built-in but we can customize if needed */}
                        </div>

                        <div className="flex items-center justify-between mt-4 gap-4">
                            <Tabs defaultValue="all" value={status} onValueChange={(v) => setStatus(v as any)} className="w-[400px]">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="all">{t('title')} (All)</TabsTrigger>
                                    <TabsTrigger value="unpaid">{t('unpaid')}</TabsTrigger>
                                    <TabsTrigger value="paid">{t('paid')}</TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder={t('searchPlaceholder')}
                                    className="pl-9 bg-white"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {loading && orders.length === 0 ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                {t('noOrdersFound')}
                            </div>
                        ) : (
                            orders.map((order) => (
                                <div key={order._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="default" className="bg-[#1f2937] hover:bg-[#1f2937]">
                                            {t('orderId')} : #{order._id.substring(order._id.length - 6)}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                                        <div className="text-gray-600">
                                            <span className="font-semibold text-gray-900">{t('cashier')} :</span> {(order.user as any)?.name || t('unknown')}
                                        </div>
                                        <div className="text-gray-600">
                                            <span className="font-semibold text-gray-900">{t('customer')} :</span> {order.shippingAddress?.fullName || 'Walk in Customer'}
                                        </div>
                                        <div className="text-gray-600">
                                            <span className="font-semibold text-gray-900">{t('total')} :</span> {formatCurrency(order.totalPrice)}
                                        </div>
                                        <div className="text-gray-600">
                                            <span className="font-semibold text-gray-900">{t('date')} :</span> {formatDateTime(order.createdAt).dateTime}
                                        </div>
                                    </div>

                                    {order.isPaid ? null : (
                                        <div className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded text-sm text-center">
                                            {t('customerNeedToPay')} {formatCurrency(order.totalPrice)}
                                        </div>
                                    )}

                                    <div className="flex gap-2 justify-end mt-2">
                                        {!order.isPaid && (
                                            <Button className="bg-[#D9520E] hover:bg-[#B7440B] text-white">
                                                {t('openOrder')}
                                            </Button>
                                        )}
                                        <Button
                                            variant="default"
                                            className="bg-[#00A991] hover:bg-[#008f7a] text-white"
                                            onClick={() => {
                                                setSelectedOrder(order)
                                                setDetailsOpen(true)
                                            }}
                                        >
                                            {t('viewProducts')}
                                        </Button>
                                        <Button variant="default" className="bg-[#3D44C2] hover:bg-[#3238a0] text-white">
                                            {t('print')}
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Infinite scroll loader */}
                        <div ref={ref} className="h-4 w-full flex justify-center">
                            {loading && orders.length > 0 && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <OrderDetailsModal
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                order={selectedOrder}
            />
        </>
    )
}
