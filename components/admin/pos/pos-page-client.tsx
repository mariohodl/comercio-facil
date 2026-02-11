'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import ProductSearch from '@/components/admin/pos/product-search'
import POSCart from '@/components/admin/pos/pos-cart'
import CategorySidebar from '@/components/admin/pos/category-sidebar'
import CalculatorModal from '@/components/admin/pos/calculator-modal'
import OrdersModal from '@/components/admin/pos/orders-modal'
import { Clock, ShoppingCart, Calculator, Store, Zap, ShoppingBag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { usePOSStore } from '@/hooks/use-pos-store'
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"
import { formatCurrency } from '@/lib/utils'
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner'
import { getAllProductsForAdmin } from '@/lib/actions/product.actions'
import { toast } from 'sonner'

export default function POSPageClient({
    storeId,
    userButton
}: {
    storeId: string
    userButton: React.ReactNode
}) {
    const { data: session } = useSession()
    const { setCart, setCustomerId, userId, setUserId, clearCart, cart, totalPrice } = usePOSStore()
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [query, setQuery] = useState('')
    const [calculatorOpen, setCalculatorOpen] = useState(false)
    const [ordersOpen, setOrdersOpen] = useState(false)
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [showCategories, setShowCategories] = useState(false)
    const [mounted, setMounted] = useState(false)
    const t = useTranslations('pos')

    useEffect(() => {
        setMounted(true)
        if (window.innerWidth < 1024) {
            setIsCartOpen(true)
        }
    }, [])

    useEffect(() => {
        if (session?.user?.id) {
            if (userId && userId !== session.user.id) {
                clearCart()
            }
            setUserId(session.user.id)
        }
    }, [session?.user?.id, userId, setUserId, clearCart])

    const { addToCart } = usePOSStore()

    const handleBarcodeScan = useCallback(async (barcode: string) => {
        if (!barcode.trim()) return

        try {
            // 1. Search for products matching the barcode/sku via API
            const result = await getAllProductsForAdmin({
                query: barcode,
                page: 1,
                limit: 100, // Search more products to ensure we find the match
                store: storeId,
            })

            let foundProduct: any = null
            let foundVariant: any = undefined

            // 2. Look for an EXACT match in the results (Case Insensitive)
            const searchCode = barcode.toLowerCase()

            for (const product of result.products) {
                // Check main product matches
                if (
                    product.itemBarcode === barcode ||
                    product.sku === barcode ||
                    (product.itemBarcode?.toLowerCase() === searchCode) ||
                    (product.sku?.toLowerCase() === searchCode)
                ) {
                    foundProduct = product
                    break
                }

                // Check variant matches
                if (product.variants && product.variants.length > 0) {
                    const variant = product.variants.find((v: any) =>
                        v.barcode === barcode ||
                        v.sku === barcode ||
                        v.barcode?.toLowerCase() === searchCode ||
                        v.sku?.toLowerCase() === searchCode
                    )

                    if (variant) {
                        foundProduct = product
                        foundVariant = variant
                        break
                    }
                }
            }

            if (foundProduct) {
                // Check stock before adding
                const stock = foundVariant ? foundVariant.countInStock : foundProduct.countInStock
                if (stock <= 0) {
                    toast.error(t('outOfStock', { product: foundProduct.name }))
                    return
                }

                addToCart(foundProduct, foundVariant)
                toast.success(t('addedToCart', { product: foundProduct.name }))

                // Clear search and open cart on mobile
                setQuery('')
                if (window.innerWidth < 1024) {
                    setIsCartOpen(true)
                }
            } else {
                toast.error(t('productNotFound', { sku: barcode }))
            }
        } catch (error) {
            console.error('Error searching product by barcode:', error)
            toast.error(t('errorSearching'))
        }
    }, [storeId, addToCart, t, setIsCartOpen, setQuery])

    // Listen for scanner everywhere on the POS page
    // Use a relaxed latency of 100ms for POS to support a wider range of scanners
    useBarcodeScanner(handleBarcodeScan, true, 100)

    const handleOpenOrder = (order: any) => {
        const cartItems = order.items.map((item: any) => ({
            product: item.product,
            name: item.name,
            slug: item.slug,
            image: item.image,
            category: item.category,
            price: item.price,
            countInStock: item.countInStock || 100,
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
            setCustomerId(typeof order.customer === 'string' ? order.customer : order.customer._id)
        } else {
            setCustomerId('walk-in')
        }
    }

    const cartTotalCount = cart.reduce((acc, item) => acc + item.quantity, 0)

    return (
        <div className='h-screen max-h-screen overflow-hidden bg-[#f8fafc] flex flex-col'>
            {/* Header */}
            <div className='bg-white border-b border-gray-200/80 shadow-sm sticky top-0 z-30 shrink-0'>
                <div className='px-4 lg:px-8 py-2'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3 lg:gap-5'>
                            <div className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-navy to-slate-800 text-white shadow-lg shadow-navy/10 group">
                                <Store className="w-4 h-4 lg:w-5 lg:h-5 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="flex flex-col">
                                <h1 className='text-sm lg:text-xl font-black text-[#0f172a] tracking-tight leading-tight'>
                                    {mounted ? (session?.user?.storeName || t('title')) : t('title')}
                                </h1>
                                <div className="hidden sm:flex items-center gap-2 mt-0.5">
                                    <div className="flex items-center gap-1.5 bg-orange/10 border border-orange/20 px-2 py-0 rounded-full">
                                        <Zap className="w-2.5 h-2.5 text-orange fill-orange" />
                                        <span className="text-[8px] lg:text-[9px] uppercase font-black text-orange tracking-widest leading-none">
                                            {t('title')}
                                        </span>
                                    </div>
                                    <span className="text-[8px] lg:text-[9px] font-bold text-slate-400 border-l border-slate-200 pl-2">
                                        Terminal #01
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className='flex items-center gap-2 lg:gap-5'>
                            <div className="hidden lg:flex items-center gap-4 border-r border-slate-100 pr-5">
                                <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/60 px-3 py-1 rounded-xl shadow-inner-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Sistema Online" />
                                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                                    </div>
                                    <span className="font-mono text-xs font-black text-slate-700 tabular-nums">
                                        {mounted ? new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--'}
                                    </span>
                                </div>

                            </div>

                            <div className='flex items-center gap-1 lg:gap-2 border-l border-slate-100 pl-1 lg:pl-3'>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 lg:h-9 text-slate-600 hover:text-orange hover:bg-orange/5 font-bold px-2 lg:px-3.5 rounded-lg border border-transparent hover:border-orange/20 transition-all"
                                    onClick={() => setCalculatorOpen(true)}
                                    title={t('calculator')}
                                >
                                    <Calculator className="h-4 w-4 lg:h-4.5 lg:w-4.5" />
                                    <span className="hidden xl:inline text-[10px] uppercase tracking-wide ml-2">{t('calculator')}</span>
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setOrdersOpen(true)}
                                    className="h-8 lg:h-9 text-slate-600 hover:text-navy hover:bg-slate-100 font-bold px-2 lg:px-3.5 rounded-lg transition-all"
                                >
                                    <ShoppingCart className="h-4 w-4" />
                                    <span className="hidden xl:inline text-[10px] uppercase tracking-wide ml-2">{t('orders')}</span>
                                </Button>
                            </div>

                            <div className="h-8 w-[1px] bg-slate-100 hidden sm:block" />

                            <div className="pl-1">
                                {userButton}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calculator Modal */}
            <CalculatorModal open={calculatorOpen} onOpenChange={setCalculatorOpen} />

            {/* Orders Modal */}
            <OrdersModal open={ordersOpen} onOpenChange={setOrdersOpen} storeId={storeId} onOpenOrder={handleOpenOrder} />

            {/* Main Content */}
            <div className='flex-1 overflow-hidden relative'>
                <div className='grid grid-cols-1 lg:grid-cols-12 h-full gap-0 lg:gap-6 lg:p-6'>
                    {/* Category Sidebar - Hidden on mobile in the grid, but potentially included inside ProductSearch or as a top bar */}
                    <div className='hidden lg:block lg:col-span-1 overflow-hidden h-full'>
                        <CategorySidebar
                            storeId={storeId}
                            selectedCategory={selectedCategory}
                            onCategoryChange={setSelectedCategory}
                        />
                    </div>

                    {/* Main Products Area */}
                    <div className='lg:col-span-8 bg-white lg:rounded-3xl lg:shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:border lg:border-slate-200/80 p-3 lg:p-5 overflow-hidden flex flex-col h-full'>
                        {showCategories && (
                            <div className="block lg:hidden mb-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <CategorySidebar
                                    storeId={storeId}
                                    selectedCategory={selectedCategory}
                                    onCategoryChange={setSelectedCategory}
                                />
                            </div>
                        )}
                        <ProductSearch
                            storeId={storeId}
                            selectedCategory={selectedCategory}
                            onCategoryChange={setSelectedCategory}
                            showCategories={showCategories}
                            onToggleCategories={() => setShowCategories(!showCategories)}
                            query={query}
                            onQueryChange={setQuery}
                            onAddToCart={() => {
                                setQuery('')
                                if (window.innerWidth < 1024) {
                                    setIsCartOpen(true)
                                }
                            }}
                        />
                    </div>

                    {/* Cart - Sidebar on desktop, Drawer on mobile */}
                    <div className='hidden lg:block lg:col-span-3 overflow-hidden h-full'>
                        {mounted && <POSCart storeId={storeId} />}
                    </div>
                </div>

                {/* Mobile Cart Floating Action / Bottom Bar */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
                    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                        <SheetTrigger asChild>
                            <Button
                                className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-2xl shadow-blue-500/30 flex items-center justify-between px-6 pointer-events-auto animate-in slide-in-from-bottom-4 duration-300"
                                disabled={!mounted || cartTotalCount === 0}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <ShoppingBag className="w-6 h-6" />
                                        {mounted && cartTotalCount > 0 && (
                                            <Badge className="absolute -top-2 -right-2 bg-orange text-white border-2 border-blue-600 h-5 min-w-5 flex items-center justify-center p-0 text-[10px] font-bold">
                                                {cartTotalCount}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="text-[10px] uppercase font-black tracking-widest leading-none opacity-70">{t('viewCart')}</span>
                                        <span className="text-sm font-bold">{mounted ? cartTotalCount : 0} {t('itemsInCart')}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] uppercase font-black tracking-widest leading-none opacity-70">{t('total')}</span>
                                    <span className="text-lg font-black tracking-tight">{mounted ? formatCurrency(totalPrice()) : formatCurrency(0)}</span>
                                </div>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-[90vh] p-0 rounded-t-[2.5rem] border-none">
                            <div className="h-full overflow-hidden">
                                {mounted && <POSCart storeId={storeId} />}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </div>
    )
}
