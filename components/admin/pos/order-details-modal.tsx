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

interface OrderDetailsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    order: IOrder | null
}

export default function OrderDetailsModal({ open, onOpenChange, order }: OrderDetailsModalProps) {
    const t = useTranslations('pos.ordersModal')
    if (!order) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-[#F8F9FA] p-0 gap-0">
                <DialogHeader className="p-4 bg-white border-b sticky top-0 z-10">
                    <DialogTitle className="text-lg font-bold flex items-center gap-2">
                        {t('orderProducts')}
                        <Badge variant="outline" className="font-normal text-xs">
                            #{order._id.substring(order._id.length - 6)}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] p-4">
                    <div className="space-y-4">
                        {order.items.map((item, index) => (
                            <div key={index} className="flex gap-3 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-gray-100 bg-gray-50">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex flex-1 flex-col justify-between">
                                    <div className="flex justify-between gap-2">
                                        <span className="font-medium text-sm line-clamp-2 text-gray-900 leading-tight">
                                            {item.name}
                                        </span>
                                        <span className="font-semibold text-sm text-gray-900 shrink-0">
                                            {formatCurrency(item.price * item.quantity)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-end text-xs text-gray-500">
                                        <span>
                                            {item.color && <span className="mr-2">{t('color')}: {item.color}</span>}
                                            {item.size && <span>{t('size')}: {item.size}</span>}
                                        </span>
                                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-medium">
                                            {item.quantity} x {formatCurrency(item.price)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <div className="p-4 bg-white border-t mt-auto">
                    <div className="flex justify-between items-center font-bold text-gray-900 text-base">
                        <span>{t('totalItems')}: {order.items.reduce((acc, item) => acc + item.quantity, 0)}</span>
                        <span>{t('total')}: {formatCurrency(order.totalPrice)}</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
