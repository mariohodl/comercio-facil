'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { IOrder } from '@/lib/db/models/order.model'
import Image from 'next/image'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface OrderDetailsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    order: IOrder | null
}

export default function OrderDetailsModal({ open, onOpenChange, order }: OrderDetailsModalProps) {
    const t = useTranslations('pos.ordersModal')
    if (!order) return null

    const getFulfillmentName = (typeCode: string) => {
        switch (typeCode) {
            case 'IN_STORE': return t('inStore')
            case 'PICKUP_LATER': return t('pickupLater')
            case 'DELIVERY': return t('delivery')
            default: return typeCode
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-[#F8F9FA] p-0 gap-0 overflow-y-auto overflow-x-visible border-none shadow-2xl" closeClassName="top-0 -translate-y-1/2 -right-2 h-9 w-9 bg-white text-slate-900 shadow-xl border-none">
                <DialogHeader className="p-4 bg-white border-b sticky top-0 z-20 flex flex-row items-center justify-between">
                    <DialogTitle className="text-lg font-bold flex items-center gap-2">
                        {t('orderProducts')}
                        <Badge variant="outline" className="font-mono text-[10px] tracking-tighter bg-slate-50 text-slate-500 border-slate-200">
                            #{order._id.substring(order._id.length - 6)}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] p-4 bg-[#f8fafc]">
                    <div className="space-y-3">
                        {order.items.map((item, index) => (
                            <div key={index} className="flex gap-4 bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex flex-1 flex-col justify-between">
                                    <div className="flex justify-between gap-3">
                                        <span className="font-bold text-sm line-clamp-2 text-slate-900 leading-tight">
                                            {item.name}
                                        </span>
                                        <span className="font-black text-sm text-slate-900 shrink-0">
                                            {formatCurrency(item.price * item.quantity)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-end text-[11px] text-slate-500">
                                        <div className="flex gap-2">
                                            {item.color && <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{t('color')}: {item.color}</span>}
                                            {item.size && <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{t('size')}: {item.size}</span>}
                                        </div>
                                        <span className="bg-slate-900 text-white px-2 py-0.5 rounded-lg font-bold">
                                            {item.quantity} x {formatCurrency(item.price)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <div className="p-5 bg-white border-t mt-auto space-y-4 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
                    <div className="grid grid-cols-2 text-[13px] gap-y-2.5">
                        <div className="text-slate-500 font-medium flex items-center gap-2">{t('paymentMethod')}:</div>
                        <div className="text-right font-bold text-slate-900">{t(`paymentMethods.${order.paymentMethod.toLowerCase()}` as any)}</div>

                        <div className="text-slate-500 font-medium flex items-center gap-2">{t('fulfillmentType')}:</div>
                        <div className="text-right font-bold text-slate-900">
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-none font-bold uppercase text-[10px]">
                                {getFulfillmentName(order.fulfillmentType)}
                            </Badge>
                        </div>

                        <div className="text-slate-500 font-medium flex items-center gap-2">{t('paid')}:</div>
                        <div className="text-right font-medium">
                            <Badge variant={order.isPaid ? 'default' : 'destructive'} className={cn(
                                "text-[10px] py-0.5 px-2.5 font-black uppercase tracking-wider border-none shadow-sm",
                                order.isPaid ? "bg-emerald-500 bg-opacity-90" : "bg-rose-500 bg-opacity-90"
                            )}>
                                {order.isPaid ? t('paid') : t('unpaid')}
                            </Badge>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center group">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">{t('totalItems')}</span>
                            <span className="text-xl font-black text-slate-900 leading-none">
                                {order.items.reduce((acc, item) => acc + item.quantity, 0)}
                            </span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase font-black text-orange tracking-widest leading-none mb-1">{t('total')}</span>
                            <span className="text-2xl font-black text-slate-900 leading-none tracking-tight">
                                {formatCurrency(order.totalPrice)}
                            </span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
