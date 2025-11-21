'use client'

import { usePOSStore } from '@/hooks/use-pos-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils'
import { Minus, Plus, Trash2 } from 'lucide-react'
import PaymentModal from './payment-modal'

export default function POSCart() {
    const { cart, updateQuantity, removeFromCart, totalPrice, clearCart } = usePOSStore()
    const total = totalPrice()

    return (
        <Card className="flex h-full flex-col">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Current Order</CardTitle>
                    <Button variant="ghost" size="sm" onClick={clearCart} disabled={cart.length === 0}>
                        Clear
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full px-6">
                    {cart.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                            <p>Cart is empty</p>
                        </div>
                    ) : (
                        <div className="space-y-4 py-4">
                            {cart.map((item) => (
                                <div key={item.product} className="flex items-center justify-between space-x-4">
                                    <div className="flex-1 space-y-1">
                                        <p className="font-medium leading-none">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatCurrency(item.price)}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => {
                                                if (item.quantity > 1) {
                                                    updateQuantity(item.product, item.quantity - 1)
                                                } else {
                                                    removeFromCart(item.product)
                                                }
                                            }}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <span className="w-8 text-center">{item.quantity}</span>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => {
                                                if (item.quantity < item.countInStock) {
                                                    updateQuantity(item.product, item.quantity + 1)
                                                }
                                            }}
                                            disabled={item.quantity >= item.countInStock}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive"
                                            onClick={() => removeFromCart(item.product)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
            <Separator />
            <CardFooter className="flex flex-col space-y-4 pt-6">
                <div className="flex w-full justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                </div>
                <PaymentModal />
            </CardFooter>
        </Card>
    )
}
