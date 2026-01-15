'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { updateOrderFulfillmentStatus } from '@/lib/actions/order.actions'
import { Loader2, ShoppingBag, Truck, Clock, CheckCircle2 } from 'lucide-react'

interface FulfillmentStatusModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    orderId: string
    currentStatus: string
    onSuccess?: () => void
}

export default function FulfillmentStatusModal({
    open,
    onOpenChange,
    orderId,
    currentStatus,
    onSuccess,
}: FulfillmentStatusModalProps) {
    const t = useTranslations('sales.fulfillment')
    const tCommon = useTranslations('common')
    const { showSuccess, showError } = useToast()
    const [status, setStatus] = useState(currentStatus)
    const [isPending, setIsPending] = useState(false)

    // Sync status when currentStatus changes
    useEffect(() => {
        setStatus(currentStatus)
    }, [currentStatus, open])

    const handleUpdate = async () => {
        setIsPending(true)
        try {
            const res = await updateOrderFulfillmentStatus(orderId, status)
            if (res.success) {
                showSuccess(res.message)
                onSuccess?.()
                onOpenChange(false)
            } else {
                showError(res.message)
            }
        } catch (error) {
            showError('Something went wrong')
        } finally {
            setIsPending(false)
        }
    }

    return (
        <Dialog key={orderId} open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('title')}</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Select the new fulfillment status for this order.
                    </p>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="PENDING">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-gray-500" />
                                    <span>{t('statusPending')}</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="READY">
                                <div className="flex items-center gap-2">
                                    <ShoppingBag className="h-4 w-4 text-orange-500" />
                                    <span>{t('statusReady')}</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="OUT_FOR_DELIVERY">
                                <div className="flex items-center gap-2">
                                    <Truck className="h-4 w-4 text-blue-500" />
                                    <span>{t('statusOutForDelivery')}</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="DELIVERED">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span>{t('statusDelivered')}</span>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {tCommon('cancel')}
                    </Button>
                    <Button onClick={handleUpdate} disabled={isPending || !orderId}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {tCommon('update')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
