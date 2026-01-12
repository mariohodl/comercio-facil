'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { formatCurrency } from '@/lib/utils'
import { CheckCircle2, Printer, PlusCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface OrderSuccessModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    orderDetails: {
        orderId: string
        totalAmount: number
        changeGiven: number
        isPaid: boolean
    } | null
    onNewOrder: () => void
}

export default function OrderSuccessModal({ open, onOpenChange, orderDetails, onNewOrder }: OrderSuccessModalProps) {
    const t = useTranslations('pos.ordersModal')
    if (!orderDetails) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex flex-col items-center gap-2 mb-4">
                        <CheckCircle2 className="h-16 w-16 text-green-500" />
                        <DialogTitle className="text-2xl text-center">{t('orderPlacedSuccessfully')}</DialogTitle>
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="text-center space-y-2">
                        <p className="text-sm text-gray-500">{t('orderId')}</p>
                        <p className="font-mono font-medium">{orderDetails.orderId}</p>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">{t('totalAmount')}</span>
                            <span className="font-bold text-lg">{formatCurrency(orderDetails.totalAmount)}</span>
                        </div>

                        {orderDetails.isPaid && (
                            <div className="flex justify-between items-center text-green-600">
                                <span className="font-medium">{t('change')}</span>
                                <span className="font-bold text-xl">{formatCurrency(orderDetails.changeGiven)}</span>
                            </div>
                        )}

                        {!orderDetails.isPaid && (
                            <div className="flex justify-between items-center text-orange-600">
                                <span className="font-medium">{t('status')}</span>
                                <span className="font-bold">{t('unpaid')}</span>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-col gap-3">
                    <Button className="w-full text-lg h-12 gap-2" size="lg" onClick={onNewOrder}>
                        <PlusCircle className="h-5 w-5" />
                        {t('startNewOrder')}
                    </Button>
                    <div className="flex gap-3 w-full">
                        {/* Placeholder for Print Receipt functionality */}
                        <Button variant="outline" className="flex-1 gap-2" onClick={() => window.print()}>
                            <Printer className="h-4 w-4" />
                            {t('printReceipt')}
                        </Button>
                        <Button variant="ghost" className="flex-1" onClick={() => onOpenChange(false)}>
                            {t('close')}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
