'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { usePOSStore } from '@/hooks/use-pos-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency } from '@/lib/utils'
import { Minus, Plus, Trash2, ShoppingBag, ShoppingCart, User, Percent, FileText, Printer, ScanLine, Check, ChevronsUpDown, Search } from 'lucide-react'
import { Switch } from "@/components/ui/switch"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import PaymentModal from './payment-modal'
import OrderSuccessModal from './order-success-modal'
import POSBarcodeScanner from './pos-barcode-scanner'
import CreateCustomerModal from './create-customer-modal'
import OrdersModal from './orders-modal'

import { getCustomersByStore } from '@/lib/actions/customer.actions'
import { ICustomer } from '@/lib/db/models/customer.model'

interface POSCartProps {
    storeId: string
}

export default function POSCart({ storeId }: POSCartProps) {
    const { cart, orderNumber, updateQuantity, removeFromCart, totalPrice, clearCart } = usePOSStore()
    const [selectedCustomer, setSelectedCustomer] = useState<string>('walk-in')
    const [customers, setCustomers] = useState<ICustomer[]>([])
    const [discountPercent, setDiscountPercent] = useState<number>(0)
    const [notes, setNotes] = useState<string>('')
    const [scannerOpen, setScannerOpen] = useState(false)
    const [openCombobox, setOpenCombobox] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [roundOff, setRoundOff] = useState(false)
    const [successModalOpen, setSuccessModalOpen] = useState(false)
    const [ordersModalOpen, setOrdersModalOpen] = useState(false)
    const [lastOrderDetails, setLastOrderDetails] = useState<{
        orderId: string
        totalAmount: number
        changeGiven: number
        isPaid: boolean
    } | null>(null)
    const t = useTranslations('pos')

    const total = totalPrice()
    const subtotal = total
    const discount = (subtotal * discountPercent) / 100
    const finalTotal = subtotal - discount

    // Rounding logic - always round up to next integer
    const roundedTotal = roundOff ? Math.ceil(finalTotal) : finalTotal
    const roundingDifference = roundOff ? roundedTotal - finalTotal : 0

    const fetchCustomers = async () => {
        const result = await getCustomersByStore(storeId)
        if (result.success && result.data) {
            setCustomers(result.data)
        }
    }

    useEffect(() => {
        fetchCustomers()
    }, [storeId])

    const handleCustomerCreated = (newCustomer: ICustomer) => {
        setCustomers((prev) => [...prev, newCustomer].sort((a, b) => a.name.localeCompare(b.name)))
        setSelectedCustomer(newCustomer._id)
    }

    return (
        <Card className="flex h-full flex-col shadow-lg border-gray-100 p-0 gap-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg p-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4" />
                        <CardTitle className="text-base">{t('orderList')}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            className="bg-white/20 hover:bg-white/30 text-white border-0 h-7 text-xs"
                            onClick={() => setOrdersModalOpen(true)}
                        >
                            <ShoppingCart className="h-3 w-3 mr-1.5" />
                            Pedidos
                        </Button>
                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 text-xs px-2 py-0.5">
                            #{orderNumber}
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden p-0">
                {/* Customer Selection */}
                <div className="p-2 bg-white border-b">
                    <div className="flex items-center gap-1.5">
                        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openCombobox}
                                    className="flex-1 justify-between h-9 text-sm font-normal bg-white border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                                >
                                    {selectedCustomer === 'walk-in'
                                        ? t('walkInCustomer')
                                        : customers.find((customer) => customer._id === selectedCustomer)?.name || t('walkInCustomer')}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0" align="start">
                                <div className="flex flex-col">
                                    <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
                                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                        <Input
                                            placeholder={t('searchPlaceholder')}
                                            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0 focus-visible:ring-0 px-0"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="max-h-[200px] overflow-y-auto overflow-x-hidden p-1">
                                        {/* Walk-in Customer Option */}
                                        <div
                                            className={cn(
                                                "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                                                selectedCustomer === 'walk-in' && "bg-accent text-accent-foreground"
                                            )}
                                            onClick={() => {
                                                setSelectedCustomer('walk-in')
                                                setOpenCombobox(false)
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selectedCustomer === 'walk-in' ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {t('walkInCustomer')}
                                        </div>

                                        {/* Filtered Customers */}
                                        {customers.filter(c =>
                                            c.name.toLowerCase().includes(searchTerm.toLowerCase())
                                        ).map((customer) => (
                                            <div
                                                key={customer._id}
                                                className={cn(
                                                    "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                                                    selectedCustomer === customer._id && "bg-accent text-accent-foreground"
                                                )}
                                                onClick={() => {
                                                    setSelectedCustomer(customer._id)
                                                    setOpenCombobox(false)
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedCustomer === customer._id ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {customer.name}
                                            </div>
                                        ))}

                                        {/* No Results Message */}
                                        {customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                                            <div className="py-6 text-center text-sm text-muted-foreground">
                                                {t('noProductsFound')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>

                        <CreateCustomerModal onSuccess={handleCustomerCreated} storeId={storeId} />
                        <Button
                            size="icon"
                            className="h-9 w-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shrink-0"
                            onClick={() => setScannerOpen(true)}
                        >
                            <ScanLine className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Barcode Scanner Modal */}
                <POSBarcodeScanner
                    open={scannerOpen}
                    onOpenChange={setScannerOpen}
                    storeId={storeId}
                />

                {/* Cart Items */}
                <ScrollArea className="h-full pb-24">
                    {cart.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-muted-foreground p-8">
                            <ShoppingBag className="h-12 w-12 mb-3 text-gray-300" />
                            <p className="text-gray-500 text-sm">{t('cartEmpty')}</p>
                            <p className="text-xs text-gray-400 mt-1">{t('addProductsToStart')}</p>
                        </div>
                    ) : (
                        <div className="p-3 space-y-2">

                            {cart.map((item, index) => (
                                <div
                                    key={`${item.product}-${item.variantSku || 'base'}`}
                                    className="flex items-start gap-2 p-2 bg-white rounded-lg border border-gray-100 hover:border-blue-200 transition-colors"
                                >
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-semibold text-xs text-gray-900 leading-tight">
                                                    {item.name}
                                                </p>
                                                {item.variantDetails && (
                                                    <p className="text-[10px] text-gray-500 mt-0.5">
                                                        {item.variantDetails}
                                                    </p>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-5 w-5 text-gray-400 hover:text-red-600 -mt-0.5"
                                                onClick={() => removeFromCart(item.product, item.variantSku)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <div className="flex items-center border border-gray-200 rounded">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 rounded-r-none hover:bg-gray-100"
                                                        onClick={() => {
                                                            if (item.quantity > 1) {
                                                                updateQuantity(item.product, item.quantity - 1, item.variantSku)
                                                            } else {
                                                                removeFromCart(item.product, item.variantSku)
                                                            }
                                                        }}
                                                    >
                                                        <Minus className="h-2.5 w-2.5" />
                                                    </Button>
                                                    <span className="w-8 text-center text-xs font-medium border-x border-gray-200">
                                                        {item.quantity}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 rounded-l-none hover:bg-gray-100"
                                                        onClick={() => {
                                                            if (item.quantity < item.countInStock) {
                                                                updateQuantity(item.product, item.quantity + 1, item.variantSku)
                                                            }
                                                        }}
                                                        disabled={item.quantity >= item.countInStock}
                                                    >
                                                        <Plus className="h-2.5 w-2.5" />
                                                    </Button>
                                                </div>

                                                <span className="text-[10px] text-gray-500">
                                                    × {formatCurrency(item.price)}
                                                </span>
                                            </div>
                                            <span className="font-bold text-xs text-gray-900">
                                                {formatCurrency(item.price * item.quantity)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>

            <Separator />

            <CardFooter className="flex flex-col space-y-3 p-3 bg-gray-50">
                {/* Discount Input - Commented for space optimization */}
                {/* {cart.length > 0 && (
                    <div className="w-full space-y-2">
                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Percent className="h-4 w-4" />
                            Discount
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                value={discountPercent}
                                onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                                className="flex-1"
                                placeholder="0"
                            />
                            <span className="flex items-center text-sm text-gray-600">%</span>
                        </div>
                    </div>
                )} */}

                {/* Notes - Commented for space optimization */}
                {/* {cart.length > 0 && (
                    <div className="w-full space-y-2">
                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Notes
                        </Label>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add order notes..."
                            className="resize-none h-16"
                        />
                    </div>
                )} */}

                {/* Payment Summary */}
                <div className="w-full space-y-1.5">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{t('subtotal')}</span>
                        <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">{t('discount')} ({discountPercent}%)</span>
                            <span className="font-medium text-green-600">-{formatCurrency(discount)}</span>
                        </div>
                    )}
                    {/* Tax removed as per requirement */}

                    <div className="flex items-center justify-between py-1">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="round-mode"
                                checked={roundOff}
                                onCheckedChange={setRoundOff}
                            />
                            <Label htmlFor="round-mode" className="text-sm font-normal text-gray-600 cursor-pointer">Roundoff</Label>
                        </div>
                        {roundOff && (
                            <span className="font-medium text-gray-900">
                                {roundingDifference > 0 ? '+' : ''}{formatCurrency(roundingDifference)}
                            </span>
                        )}
                    </div>

                    <Separator />
                    <div className="flex justify-between text-base font-bold pt-1">
                        <span className="text-gray-900">{t('total')}</span>
                        <span className="text-blue-600">{formatCurrency(roundedTotal)}</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="w-full flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-gray-300 hover:bg-gray-100 h-8"
                        onClick={clearCart}
                        disabled={cart.length === 0}
                    >
                        {t('clear')}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 hover:bg-gray-100 h-8"
                        disabled={cart.length === 0}
                    >
                        <Printer className="h-3.5 w-3.5" />
                    </Button>
                </div>
                <PaymentModal
                    totalAmount={roundedTotal}
                    groupRounding={{ isRounded: roundOff, amountRounded: roundingDifference }}
                    onSuccess={(details) => {
                        setLastOrderDetails(details)
                        setSuccessModalOpen(true)
                        clearCart()
                    }}
                    storeId={storeId}
                />
            </CardFooter>

            <OrderSuccessModal
                open={successModalOpen}
                onOpenChange={setSuccessModalOpen}
                orderDetails={lastOrderDetails}
                onNewOrder={() => {
                    setSuccessModalOpen(false)
                    setLastOrderDetails(null)
                }}
            />

            <OrdersModal
                open={ordersModalOpen}
                onOpenChange={setOrdersModalOpen}
                storeId={storeId}
            />
        </Card >
    )
}
