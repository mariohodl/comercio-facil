'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { usePOSStore } from '@/hooks/use-pos-store'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { Loader2, ShoppingBag, Truck, Clock } from 'lucide-react'

const PaymentSchema = z.object({
    paymentMethod: z.enum(['Cash', 'Card', 'Split', 'Unpaid']),
    receivedAmount: z.coerce.number().optional(),
    fulfillmentType: z.enum(['IN_STORE', 'PICKUP_LATER', 'DELIVERY']).default('IN_STORE'),
})

// ... types

interface PaymentModalProps {
    totalAmount?: number
    groupRounding?: {
        isRounded: boolean
        amountRounded: number
    }
    onSuccess?: (details: any) => void // Callback for success
    storeId: string
    customerId: string
}

export default function PaymentModal({ totalAmount, groupRounding, onSuccess, storeId, customerId }: PaymentModalProps) {
    const tPOS = useTranslations('pos')
    const [open, setOpen] = useState(false)
    const { cart, totalPrice, clearCart } = usePOSStore()
    const storeTotal = totalPrice()
    const total = totalAmount !== undefined ? totalAmount : storeTotal

    const form = useForm<z.infer<typeof PaymentSchema>>({
        resolver: zodResolver(PaymentSchema),
        defaultValues: {
            paymentMethod: 'Cash',
            receivedAmount: 0,
            fulfillmentType: 'IN_STORE',
        },
    })

    const paymentMethod = form.watch('paymentMethod')
    const receivedAmount = form.watch('receivedAmount') || 0
    const change = paymentMethod === 'Cash' ? receivedAmount - total : 0

    useEffect(() => {
        if (open) {
            form.reset({
                paymentMethod: 'Cash',
                receivedAmount: 0,
                fulfillmentType: 'IN_STORE',
            })
        }
    }, [open, total, form])

    const handleQuickCash = (amount: number) => {
        form.setValue('receivedAmount', amount)
    }

    const onSubmit = async (data: z.infer<typeof PaymentSchema>) => {
        const isUnpaid = data.paymentMethod === 'Unpaid'

        if (data.paymentMethod === 'Cash') {
            if (receivedAmount < total) {
                form.setError('receivedAmount', {
                    message: 'Amount must be greater than or equal to total',
                })
                return
            }
        }

        try {
            const res = await fetch('/api/admin/pos/transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart,
                    paymentMethod: isUnpaid ? 'Cash' : data.paymentMethod,
                    paymentSplits: isUnpaid ? [] : [{ method: data.paymentMethod === 'Split' ? 'Cash' : data.paymentMethod, amount: total }],
                    totalPrice: total,
                    receivedAmount: isUnpaid ? 0 : (data.receivedAmount || 0),
                    change: isUnpaid ? 0 : ((data.receivedAmount || 0) - total),
                    isRounded: groupRounding?.isRounded,
                    amountRounded: groupRounding?.amountRounded,
                    isPaid: !isUnpaid,
                    storeId,
                    customerId,
                    fulfillmentType: data.fulfillmentType
                }),
            })

            const result = await res.json()

            if (!res.ok) {
                toast.error(result.message)
                return
            }

            toast.success('Transaction completed successfully')
            setOpen(false)

            // Trigger parent success handler instead of clearing directly
            if (onSuccess) {
                onSuccess({
                    orderId: result.order._id, // Assuming API returns order object
                    totalAmount: total,
                    changeGiven: isUnpaid ? 0 : change,
                    isPaid: !isUnpaid
                })
            } else {
                clearCart() // Fallback
            }

        } catch (error) {
            console.error(error)
            toast.error('Something went wrong')
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="lg" className="w-full text-lg" disabled={cart.length === 0}>
                    {tPOS('add')} {formatCurrency(total)}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{tPOS('paymentModal.title')}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="paymentMethod"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{tPOS('paymentModal.paymentMethod') || 'Payment Method'}</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select method" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Cash">{tPOS('ordersModal.paymentMethods.cash')}</SelectItem>
                                                <SelectItem value="Card">{tPOS('ordersModal.paymentMethods.card')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="fulfillmentType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{tPOS('paymentModal.fulfillmentType')}</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder={tPOS('paymentModal.selectFulfillmentPlaceholder')} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="IN_STORE">
                                                    <div className="flex items-center gap-2">
                                                        <ShoppingBag className="h-4 w-4" />
                                                        <span>{tPOS('paymentModal.inStore') || 'In Store'}</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="PICKUP_LATER">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4" />
                                                        <span>{tPOS('paymentModal.pickupLater') || 'Pickup Later'}</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="DELIVERY">
                                                    <div className="flex items-center gap-2">
                                                        <Truck className="h-4 w-4" />
                                                        <span>{tPOS('paymentModal.delivery') || 'Delivery'}</span>
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {paymentMethod === 'Cash' && (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="receivedAmount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{tPOS('paymentModal.amountReceived')}</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.01" {...field} className="text-lg font-bold" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-4 gap-2">
                                        {[10, 20, 50, 100].map((amount) => (
                                            <Button
                                                key={amount}
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleQuickCash(amount)}
                                            >
                                                ${amount}
                                            </Button>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleQuickCash(total)}
                                            className="col-span-2"
                                        >
                                            {tPOS('paymentModal.exact')} ({formatCurrency(total)})
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleQuickCash(Math.ceil(total))}
                                            className="col-span-2"
                                        >
                                            {tPOS('paymentModal.roundUp')} ({formatCurrency(Math.ceil(total))})
                                        </Button>
                                    </div>
                                    <div className="rounded-lg bg-muted p-4 text-center">
                                        <p className="text-sm text-muted-foreground">{tPOS('paymentModal.change')}</p>
                                        <p className={`text-2xl font-bold ${change < 0 ? 'text-destructive' : 'text-green-600'}`}>
                                            {formatCurrency(change)}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex flex-col gap-3 pt-4">
                            <Button type="submit" size="lg" className="w-full text-lg" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {tPOS('paymentModal.completePayment')}
                            </Button>

                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-gray-300"></div>
                                <span className="flex-shrink mx-4 text-gray-400 text-sm">{tPOS('paymentModal.or')}</span>
                                <div className="flex-grow border-t border-gray-300"></div>
                            </div>

                            <Button
                                type="button"
                                variant="destructive"
                                className="w-full"
                                disabled={form.formState.isSubmitting}
                                onClick={() => {
                                    form.setValue('paymentMethod', 'Unpaid')
                                    form.handleSubmit(onSubmit)()
                                }}
                            >
                                {tPOS('paymentModal.placeUnpaidOrder')}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
