'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ProductSearch from '@/components/admin/pos/product-search'
import POSCart from '@/components/admin/pos/pos-cart'
import CategorySidebar from '@/components/admin/pos/category-sidebar'
import CalculatorModal from '@/components/admin/pos/calculator-modal'
import { Clock, LayoutDashboard, ShoppingCart, Calculator } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function POSPageClient({ storeId }: { storeId: string }) {
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [calculatorOpen, setCalculatorOpen] = useState(false)
    const t = useTranslations('pos')

    return (
        <div className='h-screen max-h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100'>
            {/* Header */}
            <div className='bg-white border-b border-gray-200 shadow-sm'>
                <div className='px-6 py-3'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <h1 className='text-xl font-bold text-gray-900'>{t('title')}</h1>
                        </div>
                        <div className='flex items-center gap-3'>
                            <Link href={`/admin/${storeId}/overview`}>
                                <Button variant="outline" size="sm" className="gap-2 h-8">
                                    <LayoutDashboard className="h-3.5 w-3.5" />
                                    <span className="text-xs">{t('dashboard')}</span>
                                </Button>
                            </Link>
                            <Link href={`/admin/${storeId}/orders`}>
                                <Button variant="outline" size="sm" className="gap-2 h-8">
                                    <ShoppingCart className="h-3.5 w-3.5" />
                                    <span className="text-xs">{t('orders')}</span>
                                </Button>
                            </Link>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-xl bg-orange-500 hover:bg-orange-600 text-white"
                                onClick={() => setCalculatorOpen(true)}
                            >
                                <Calculator className="h-5 w-5" />
                            </Button>
                            <Badge variant="outline" className="px-2 py-1 text-xs font-medium">
                                <Clock className="h-3.5 w-3.5 mr-1.5" />
                                <span className="font-mono">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calculator Modal */}
            <CalculatorModal open={calculatorOpen} onOpenChange={setCalculatorOpen} />

            {/* Main Content */}
            <div className='p-4 h-[calc(100vh-65px)] max-h-[calc(100vh-65px)] overflow-hidden'>
                <div className='grid grid-cols-1 lg:grid-cols-12 gap-4 h-full'>
                    {/* Category Sidebar */}
                    <div className='lg:col-span-1 overflow-hidden'>
                        <CategorySidebar
                            storeId={storeId}
                            selectedCategory={selectedCategory}
                            onCategoryChange={setSelectedCategory}
                        />
                    </div>

                    {/* Products */}
                    <div className='lg:col-span-8 bg-white rounded-xl shadow-sm border border-gray-200 p-4 overflow-hidden flex flex-col'>
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
