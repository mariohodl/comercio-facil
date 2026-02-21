'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { usePOSStore, FRACTIONAL_UNITS } from '@/hooks/use-pos-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/utils'
import { Minus, Plus, Trash2, ShoppingBag, ShoppingCart, Printer, ScanLine, Check, ChevronsUpDown, Search, CopyPlus } from 'lucide-react'
import { Switch } from "@/components/ui/switch"
import { toast } from 'sonner'
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
import { getAllProductsForAdmin } from '@/lib/actions/product.actions'
import { IProduct } from '@/lib/db/models/product.model'

interface POSCartProps {
    storeId: string
}

function DecimalQuantityInput({ value, onChange, unit, max, onStockExceeded }: { value: number, onChange: (val: number) => void, unit: string, max: number, onStockExceeded?: () => void }) {
    const [localValue, setLocalValue] = useState(value.toString())

    useEffect(() => {
        const parsedLocal = parseFloat(localValue)
        if (parsedLocal !== value) {
            setLocalValue(value.toString())
        }
    }, [value, localValue])

    const handleBlur = () => {
        let parsed = parseFloat(localValue)
        if (isNaN(parsed) || parsed < 0.1) {
            parsed = 0.1
        }

        parsed = Math.floor(parsed * 1000) / 1000

        if (parsed > max) {
            parsed = max
            onStockExceeded?.()
        }

        onChange(parsed)
        setLocalValue(parsed.toString())
    }

    return (
        <div className="flex items-center gap-1.5">
            <Input
                type="text"
                inputMode="decimal"
                value={localValue}
                onChange={(e) => {
                    const val = e.target.value.replace(/,/g, '.').replace(/^0+(?=\d)/, '')
                    if (val === '' || val === '.' || /^\d*\.?\d*$/.test(val)) {
                        setLocalValue(val)
                        let parsed = parseFloat(val)
                        if (!isNaN(parsed)) {
                            parsed = Math.floor(parsed * 1000) / 1000
                            if (parsed > max) {
                                setLocalValue(max.toString())
                                onChange(max)
                                onStockExceeded?.()
                            } else {
                                onChange(parsed)
                            }
                        }
                    }
                }}
                onBlur={handleBlur}
                className="w-20 h-7 text-center text-xs font-bold bg-white border-blue-100 focus-visible:ring-1 focus-visible:ring-blue-400 p-0 shadow-inner"
            />
            <span className="text-[10px] font-bold text-blue-700 uppercase">{unit}</span>
        </div>
    )
}

export default function POSCart({ storeId }: POSCartProps) {
    const t = useTranslations('pos')
    const {
        cart,
        orderNumber,
        updateQuantity,
        removeFromCart,
        totalPrice,
        clearCart,
        setCart,
        addToCart,
        duplicateItem,
        customerId: selectedCustomer,
        setCustomerId: setSelectedCustomer
    } = usePOSStore()

    const handleOpenOrder = (order: any) => {
        const cartItems = order.items.map((item: any) => ({
            product: item.product,
            name: item.name,
            slug: item.slug,
            image: item.image,
            category: item.category,
            price: item.price,
            countInStock: item.countInStock || 100, // Fallback if missing
            quantity: item.quantity,
            sku: item.sku || 'NO-SKU',
            unit: item.unit || 'unit',
            variantSku: item.sku,
            variantDetails: (item.color || item.size)
                ? `${item.color || ''} ${item.size || ''}`.trim()
                : undefined
        }))
        setCart(cartItems)
        if (order.customer) {
            setSelectedCustomer(typeof order.customer === 'string' ? order.customer : order.customer._id)
        } else {
            setSelectedCustomer('walk-in')
        }
    }
    const [customers, setCustomers] = useState<ICustomer[]>([])
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
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const total = totalPrice()
    const subtotal = total
    // Discount logic removed/unused
    const discount = 0
    const finalTotal = subtotal - discount

    // Rounding logic - always round up to next integer
    const roundedTotal = roundOff ? Math.ceil(finalTotal) : finalTotal
    const roundingDifference = roundOff ? roundedTotal - finalTotal : 0

    const fetchCustomers = useCallback(async () => {
        const result = await getCustomersByStore(storeId)
        if (result.success && result.data) {
            setCustomers(result.data)
        }
    }, [storeId])

    useEffect(() => {
        fetchCustomers()
    }, [fetchCustomers])

    const handleCustomerCreated = (newCustomer: ICustomer) => {
        setCustomers((prev) => [...prev, newCustomer].sort((a, b) => a.name.localeCompare(b.name)))
        setSelectedCustomer(newCustomer._id)
    }

    return (
        <Card className="flex h-full flex-col shadow-lg lg:border-gray-100 p-0 gap-0 border-none lg:border rounded-none lg:rounded-xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-none lg:rounded-t-lg p-3 pt-10 lg:pt-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4" />
                        <CardTitle className="text-base">{t('orderList')}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* <Button
                            variant="secondary"
                            size="sm"
                            className="bg-white/20 hover:bg-white/30 text-white border-0 h-7 text-xs"
                            onClick={() => setOrdersModalOpen(true)}
                        >
                            <ShoppingCart className="h-3 w-3 mr-1.5" />
                            {t('orders')}
                        </Button> */}
                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 text-xs px-2 py-0.5">
                            #{mounted ? orderNumber : '......'}
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
                <ScrollArea className="flex-1 pb-32">
                    {cart.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-muted-foreground p-8">
                            <ShoppingBag className="h-12 w-12 mb-3 text-gray-300" />
                            <p className="text-gray-500 text-sm">{t('cartEmpty')}</p>
                            <p className="text-xs text-gray-400 mt-1">{t('addProductsToStart')}</p>
                        </div>
                    ) : (
                        <div className="p-3 space-y-2">

                            {cart.map((item) => {
                                const isFractional = FRACTIONAL_UNITS.includes(item.unit?.toLowerCase())

                                return (
                                    <div
                                        key={item.cartItemId}
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
                                                <div className="flex items-center gap-1">
                                                    {isFractional && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-5 w-5 text-gray-400 hover:text-blue-600 -mt-0.5"
                                                            onClick={() => duplicateItem(item.cartItemId)}
                                                            title={t('duplicate')}
                                                        >
                                                            <CopyPlus className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-5 w-5 text-gray-400 hover:text-red-600 -mt-0.5"
                                                        onClick={() => removeFromCart(item.cartItemId)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    {(() => {
                                                        const totalOthers = cart
                                                            .filter((i) => i.cartItemId !== item.cartItemId && i.product === item.product && i.variantSku === (item.variantSku || undefined))
                                                            .reduce((sum, i) => sum + i.quantity, 0);
                                                        const maxForThisItem = Math.max(0, Math.floor((item.countInStock - totalOthers) * 1000) / 1000);

                                                        if (isFractional) {
                                                            return (
                                                                <div className="flex items-center gap-1.5 border border-blue-200 bg-blue-50/50 rounded-md px-2 py-1 shadow-sm">
                                                                    <DecimalQuantityInput
                                                                        value={item.quantity}
                                                                        onChange={(val) => updateQuantity(item.cartItemId, val)}
                                                                        unit={item.unit}
                                                                        max={maxForThisItem}
                                                                        onStockExceeded={() => {
                                                                            toast.error(t('insufficientStock'), {
                                                                                description: `${t('onlyUnitsAvailable', { count: item.countInStock })} ${item.unit}`
                                                                            })
                                                                        }}
                                                                    />
                                                                </div>
                                                            )
                                                        } else {
                                                            return (
                                                                <div className="flex items-center border border-gray-200 rounded">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-6 w-6 rounded-r-none hover:bg-gray-100"
                                                                        onClick={() => {
                                                                            if (item.quantity > 1) {
                                                                                updateQuantity(item.cartItemId, item.quantity - 1)
                                                                            } else {
                                                                                removeFromCart(item.cartItemId)
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
                                                                            if (item.quantity < maxForThisItem) {
                                                                                updateQuantity(item.cartItemId, item.quantity + 1)
                                                                            } else {
                                                                                toast.error(t('insufficientStock'), {
                                                                                    description: `${t('onlyUnitsAvailable', { count: item.countInStock })} ${item.unit}`
                                                                                })
                                                                            }
                                                                        }}
                                                                        disabled={item.quantity >= maxForThisItem}
                                                                    >
                                                                        <Plus className="h-2.5 w-2.5" />
                                                                    </Button>
                                                                </div>
                                                            )
                                                        }
                                                    })()}

                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[10px] text-gray-500">
                                                            × {formatCurrency(item.price)}<span className="text-gray-400">/{item.unit}</span>
                                                        </span>
                                                        {item.countInStock <= 5 && (
                                                            <span className="text-[9px] text-orange-600 font-medium">
                                                                {item.countInStock - item.quantity} {item.unit} {t('left')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="font-bold text-xs text-gray-900">
                                                    {formatCurrency(item.price * item.quantity)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>

            <Separator />

            <CardFooter className="flex flex-col space-y-3 p-3 bg-gray-50">
                <div className="w-full space-y-1.5">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{t('subtotal')}</span>
                        <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
                    </div>
                    {/* Tax removed as per requirement */}

                    <div className="flex items-center justify-between py-1">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="round-mode"
                                checked={roundOff}
                                onCheckedChange={setRoundOff}
                            />
                            <Label htmlFor="round-mode" className="text-sm font-normal text-gray-600 cursor-pointer">{t('roundoff')}</Label>
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
                    customerId={selectedCustomer}
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
                onOpenOrder={handleOpenOrder}
            />
        </Card >
    )
}
