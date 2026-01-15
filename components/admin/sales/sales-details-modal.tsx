'use client'

import { useTranslations } from 'next-intl'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { IOrder } from '@/lib/db/models/order.model'
import Image from 'next/image'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

interface SalesDetailsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    order: IOrder | null
}

export default function SalesDetailsModal({ open, onOpenChange, order }: SalesDetailsModalProps) {
    const t = useTranslations('sales')
    const tCommon = useTranslations('common')
    const tPOS = useTranslations('pos.ordersModal')

    if (!order) return null

    return (
        <Dialog key={order?._id} open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col p-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="flex items-center justify-between">
                        <span>{t('title')} #{order._id.substring(order._id.length - 6)}</span>
                        <Badge variant={order.isPaid ? 'default' : 'destructive'} className={order.isPaid ? 'bg-green-100 text-green-700 hover:bg-green-100 border-none' : ''}>
                            {order.isPaid ? t('paid') : t('unpaid')}
                        </Badge>
                    </DialogTitle>
                    <div className="text-sm text-muted-foreground">
                        {formatDateTime(order.createdAt).dateTime}
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 px-6">
                    <div className="py-4 space-y-6">
                        <section>
                            <h4 className="text-sm font-semibold mb-3">{t('customer')}</h4>
                            <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3">
                                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 border">
                                    <Image
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${(order as any).customer?.name || 'walk-in'}`}
                                        alt={(order as any).customer?.name || 'Customer'}
                                        fill
                                    />
                                </div>
                                <div>
                                    <p className="font-medium">{(order as any).customer?.name || t('walkInCustomer')}</p>
                                    <p className="text-sm text-muted-foreground">{(order as any).customer?.email || 'No email'}</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h4 className="text-sm font-semibold mb-3">{tPOS('orderProducts')}</h4>
                            <div className="space-y-3">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-gray-50">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {item.quantity} x {formatCurrency(item.price)}
                                            </p>
                                        </div>
                                        <div className="text-sm font-semibold">
                                            {formatCurrency(item.price * item.quantity)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <Separator />

                        <section className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{tCommon('subtotal')}</span>
                                <span>{formatCurrency(order.itemsPrice)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{tCommon('tax')}</span>
                                <span>{formatCurrency(order.taxPrice)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold">
                                <span>{t('grandTotal')}</span>
                                <span>{formatCurrency(order.totalPrice)}</span>
                            </div>
                        </section>

                        <section className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                                <p className="text-[10px] uppercase font-bold text-blue-600 mb-1">{t('fulfillment.title')}</p>
                                <p className="text-sm font-medium">
                                    {order.fulfillmentType === 'IN_STORE' ? t('fulfillment.inStore') :
                                        order.fulfillmentType === 'PICKUP_LATER' ? t('fulfillment.pickupLater') :
                                            order.fulfillmentType === 'DELIVERY' ? t('fulfillment.delivery') :
                                                order.fulfillmentType}
                                </p>
                            </div>
                            <div className="bg-orange-50/50 p-3 rounded-lg border border-orange-100">
                                <p className="text-[10px] uppercase font-bold text-orange-600 mb-1">{t('status')}</p>
                                <p className="text-sm font-medium">
                                    {order.fulfillmentStatus === 'PENDING' ? t('fulfillment.statusPending') :
                                        order.fulfillmentStatus === 'READY' ? t('fulfillment.statusReady') :
                                            order.fulfillmentStatus === 'OUT_FOR_DELIVERY' ? t('fulfillment.statusOutForDelivery') :
                                                order.fulfillmentStatus === 'DELIVERED' ? t('fulfillment.statusDelivered') :
                                                    order.fulfillmentStatus}
                                </p>
                            </div>
                        </section>
                    </div>
                </ScrollArea>

                <div className="p-6 bg-gray-50/50 border-t flex justify-end gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {tCommon('close')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
