'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { usePOSStore } from '@/hooks/use-pos-store'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { Loader2, Plus, Trash2, CreditCard, Banknote } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const PaymentSchema = z.object({
    paymentMethod: z.enum(['Cash', 'Card', 'Split']),
    receivedAmount: z.coerce.number().optional(),
})

type PaymentSplit = {
    method: 'Cash' | 'Card'
    amount: number
}

export default function PaymentModal() {
    const [open, setOpen] = useState(false)
    const { cart, totalPrice, clearCart } = usePOSStore()
    const total = totalPrice()

    const [splits, setSplits] = useState<PaymentSplit[]>([])
    const [remaining, setRemaining] = useState(total)

    const form = useForm<z.infer<typeof PaymentSchema>>({
        resolver: zodResolver(PaymentSchema),
        defaultValues: {
            paymentMethod: 'Cash',
            receivedAmount: 0,
        },
    })

    const paymentMethod = form.watch('paymentMethod')
    const receivedAmount = form.watch('receivedAmount') || 0
    const change = paymentMethod === 'Cash' ? receivedAmount - total : 0

    // Reset state when modal opens/closes or total changes
    useEffect(() => {
        if (open) {
            setRemaining(total)
            setSplits([])
            form.reset({
                paymentMethod: 'Cash',
                receivedAmount: 0,
            })
        }
    }, [open, total, form])

    const addSplit = (method: 'Cash' | 'Card', amount: number) => {
        if (amount <= 0) return
        const newSplits = [...splits, { method, amount }]
        setSplits(newSplits)

        const newTotalPaid = newSplits.reduce((acc, curr) => acc + curr.amount, 0)
        setRemaining(Math.max(0, total - newTotalPaid))
    }

    const removeSplit = (index: number) => {
        const newSplits = splits.filter((_, i) => i !== index)
        setSplits(newSplits)

        const newTotalPaid = newSplits.reduce((acc, curr) => acc + curr.amount, 0)
        setRemaining(Math.max(0, total - newTotalPaid))
    }

    const handleQuickCash = (amount: number) => {
        form.setValue('receivedAmount', amount)
    }

    const onSubmit = async (data: z.infer<typeof PaymentSchema>) => {
        let finalSplits: PaymentSplit[] = []
        let finalPaymentMethod = data.paymentMethod

        if (data.paymentMethod === 'Split') {
            if (remaining > 0.01) { // Tolerance for float errors
                toast.error(`Remaining amount ${formatCurrency(remaining)} must be paid`)
                return
            }
            finalSplits = splits
        } else if (data.paymentMethod === 'Cash') {
            if (receivedAmount < total) {
                form.setError('receivedAmount', {
                    message: 'Amount must be greater than or equal to total',
                })
                return
            }
            finalSplits = [{ method: 'Cash', amount: total }]
        } else {
            finalSplits = [{ method: 'Card', amount: total }]
        }

        try {
            const res = await fetch('/api/admin/pos/transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart,
                    paymentMethod: finalPaymentMethod,
                    paymentSplits: finalSplits,
                    totalPrice: total,
                    receivedAmount: data.paymentMethod === 'Cash' ? receivedAmount : undefined,
                    change: data.paymentMethod === 'Cash' ? change : undefined,
                }),
            })

            const result = await res.json()

            if (!res.ok) {
                toast.error(result.message)
                return
            }

            toast.success('Transaction completed successfully')
            clearCart()
            setOpen(false)
        } catch (error) {
            console.error(error)
            toast.error('Something went wrong')
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="lg" className="w-full text-lg" disabled={cart.length === 0}>
                    Pay {formatCurrency(total)}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Complete Payment</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Payment Method</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={(val) => {
                                                field.onChange(val)
                                                if (val === 'Split') {
                                                    setRemaining(total)
                                                    setSplits([])
                                                }
                                            }}
                                            defaultValue={field.value}
                                            className="grid grid-cols-3 gap-4"
                                        >
                                            <FormItem>
                                                <FormControl>
                                                    <RadioGroupItem value="Cash" className="peer sr-only" />
                                                </FormControl>
                                                <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                                    <Banknote className="mb-3 h-6 w-6" />
                                                    Cash
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem>
                                                <FormControl>
                                                    <RadioGroupItem value="Card" className="peer sr-only" />
                                                </FormControl>
                                                <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                                    <CreditCard className="mb-3 h-6 w-6" />
                                                    Card
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem>
                                                <FormControl>
                                                    <RadioGroupItem value="Split" className="peer sr-only" />
                                                </FormControl>
                                                <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                                    <div className="mb-3 flex">
                                                        <Banknote className="mr-1 h-6 w-6" />
                                                        <CreditCard className="h-6 w-6" />
                                                    </div>
                                                    Split
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {paymentMethod === 'Cash' && (
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="receivedAmount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Amount Received</FormLabel>
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
                                        Exact ({formatCurrency(total)})
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleQuickCash(Math.ceil(total))}
                                        className="col-span-2"
                                    >
                                        Round Up ({formatCurrency(Math.ceil(total))})
                                    </Button>
                                </div>
                                <div className="rounded-lg bg-muted p-4 text-center">
                                    <p className="text-sm text-muted-foreground">Change</p>
                                    <p className={`text-2xl font-bold ${change < 0 ? 'text-destructive' : 'text-green-600'}`}>
                                        {formatCurrency(change)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {paymentMethod === 'Split' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Remaining</p>
                                        <p className="text-2xl font-bold">{formatCurrency(remaining)}</p>
                                    </div>
                                    <div className="space-x-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => addSplit('Cash', remaining)}
                                            disabled={remaining <= 0}
                                        >
                                            <Banknote className="mr-2 h-4 w-4" />
                                            Cash
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => addSplit('Card', remaining)}
                                            disabled={remaining <= 0}
                                        >
                                            <CreditCard className="mr-2 h-4 w-4" />
                                            Card
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {splits.map((split, index) => (
                                        <div key={index} className="flex items-center justify-between rounded-md border p-3">
                                            <div className="flex items-center">
                                                {split.method === 'Cash' ? (
                                                    <Banknote className="mr-2 h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                                                )}
                                                <span className="font-medium">{split.method}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-mono">{formatCurrency(split.amount)}</span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-destructive"
                                                    onClick={() => removeSplit(index)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button variant="outline" onClick={() => setOpen(false)} type="button">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting || (paymentMethod === 'Split' && remaining > 0.01)}>
                                {form.formState.isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Complete Payment
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
