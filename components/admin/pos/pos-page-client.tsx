'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import ProductSearch from '@/components/admin/pos/product-search'
import POSCart from '@/components/admin/pos/pos-cart'
import CategorySidebar from '@/components/admin/pos/category-sidebar'
import CalculatorModal from '@/components/admin/pos/calculator-modal'
import OrdersModal from '@/components/admin/pos/orders-modal'
import { Clock, LayoutDashboard, ShoppingCart, Calculator, Store, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { usePOSStore } from '@/hooks/use-pos-store'

export default function POSPageClient({
    storeId,
    userButton
}: {
    storeId: string
    userButton: React.ReactNode
}) {
    const { data: session } = useSession()
    const { setCart, setCustomerId, userId, setUserId, clearCart } = usePOSStore()
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [calculatorOpen, setCalculatorOpen] = useState(false)
    const [ordersOpen, setOrdersOpen] = useState(false)
    const t = useTranslations('pos')

    useEffect(() => {
        if (session?.user?.id) {
            if (userId && userId !== session.user.id) {
                clearCart()
            }
            setUserId(session.user.id)
        }
    }, [session?.user?.id, userId, setUserId, clearCart])

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

    return (
        <div className='h-screen max-h-screen overflow-hidden bg-[#f8fafc]'>
            {/* Header */}
            <div className='bg-white border-b border-gray-200/80 shadow-sm sticky top-0 z-30'>
                <div className='px-8 py-2'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-5'>
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-navy to-slate-800 text-white shadow-lg shadow-navy/10 group">
                                <Store className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="flex flex-col">
                                <h1 className='text-xl font-black text-[#0f172a] tracking-tight leading-tight mb-1'>
                                    {session?.user?.storeName || t('title')}
                                </h1>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1.5 bg-orange/10 border border-orange/20 px-2 py-0 rounded-full">
                                        <Zap className="w-2.5 h-2.5 text-orange fill-orange" />
                                        <span className="text-[9px] uppercase font-black text-orange tracking-widest leading-none">
                                            {t('title')}
                                        </span>
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-400 border-l border-slate-200 pl-2">
                                        Terminal #01
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className='flex items-center gap-5'>
                            <div className="hidden lg:flex items-center gap-4 border-r border-slate-100 pr-5">
                                <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/60 px-3 py-1 rounded-xl shadow-inner-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Sistema Online" />
                                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                                    </div>
                                    <span className="font-mono text-xs font-black text-slate-700 tabular-nums">
                                        {new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                    </span>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-orange hover:border-orange/30 hover:bg-orange/5 transition-all active:scale-95 shadow-sm"
                                    onClick={() => setCalculatorOpen(true)}
                                    title={t('calculator')}
                                >
                                    <Calculator className="h-4.5 w-4.5" />
                                </Button>
                            </div>

                            <div className='flex items-center gap-2'>
                                <Link href={`/admin/${storeId}/overview`}>
                                    <Button variant="ghost" size="sm" className="gap-2 h-9 text-slate-600 hover:text-navy hover:bg-slate-100 font-bold px-3.5 rounded-lg transition-all">
                                        <LayoutDashboard className="h-4 w-4" />
                                        <span className="hidden xl:inline text-[10px] uppercase tracking-wide">{t('dashboard')}</span>
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setOrdersOpen(true)}
                                    className="gap-2 h-9 text-slate-600 hover:text-navy hover:bg-slate-100 font-bold px-3.5 rounded-lg transition-all"
                                >
                                    <ShoppingCart className="h-4 w-4" />
                                    <span className="hidden xl:inline text-[10px] uppercase tracking-wide">{t('orders')}</span>
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
            <div className='p-6 h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] overflow-hidden'>
                <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 h-full'>
                    {/* Category Sidebar */}
                    <div className='lg:col-span-1 overflow-hidden'>
                        <CategorySidebar
                            storeId={storeId}
                            selectedCategory={selectedCategory}
                            onCategoryChange={setSelectedCategory}
                        />
                    </div>

                    {/* Products */}
                    <div className='lg:col-span-8 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/80 p-5 overflow-hidden flex flex-col'>
                        <ProductSearch
                            storeId={storeId}
                            selectedCategory={selectedCategory}
                            onCategoryChange={setSelectedCategory}
                        />
                    </div>

                    {/* Cart */}
                    <div className='lg:col-span-3 overflow-hidden'>
                        <POSCart storeId={storeId} />
                    </div>
                </div>
            </div>
        </div>
    )
}
