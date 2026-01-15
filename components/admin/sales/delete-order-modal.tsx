'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { deleteOrder } from '@/lib/actions/order.actions'
import { Loader2 } from 'lucide-react'

interface DeleteOrderModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    orderId: string
    onSuccess?: () => void
}

export default function DeleteOrderModal({
    open,
    onOpenChange,
    orderId,
    onSuccess,
}: DeleteOrderModalProps) {
    const tCommon = useTranslations('common')
    const { showSuccess, showError } = useToast()
    const [isPending, setIsPending] = useState(false)

    const handleDelete = async () => {
        setIsPending(true)
        try {
            const res = await deleteOrder(orderId)
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
        <AlertDialog key={orderId} open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{tCommon('confirmDeleteTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {tCommon('confirmDeleteDescription')}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>{tCommon('cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            handleDelete()
                        }}
                        disabled={isPending}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {tCommon('delete')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
