'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { getAllProductsForAdmin } from '@/lib/actions/product.actions'
import Image from 'next/image'

interface CategorySidebarProps {
    storeId: string
    selectedCategory: string
    onCategoryChange: (category: string) => void
}

export default function CategorySidebar({ storeId, selectedCategory, onCategoryChange }: CategorySidebarProps) {
    const [categories, setCategories] = useState<{ name: string; icon: string }[]>([])
    const t = useTranslations('pos')

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                let productsToExtract: any[] = [];
                if (navigator.onLine) {
                    const res = await getAllProductsForAdmin({
                        query: '',
                        page: 1,
                        limit: 100,
                        store: storeId,
                    })
                    productsToExtract = res.products;
                } else {
                    const { get } = await import('idb-keyval');
                    productsToExtract = await get(`offline_catalog_${storeId}`) || [];
                }

                // Extract unique categories, handling nested objects if any
                const uniqueCategories = Array.from(new Set(productsToExtract.map((p) => {
                    if (typeof p.category === 'object' && p.category) {
                        return (p.category as any)._id || 'general';
                    }
                    return p.category;
                }).filter(Boolean)))

                // Map categories to objects with icons
                const categoryData = uniqueCategories.map(cat => ({
                    name: cat,
                    icon: getCategoryIcon(cat)
                }))

                setCategories(categoryData)
            } catch (error) {
                console.error('Failed to fetch categories', error)
            }
        }

        fetchCategories()
    }, [storeId])

    const getCategoryIcon = (category: string): string => {
        // Map category names to emoji icons
        const iconMap: { [key: string]: string } = {
            'Electronics': '📱',
            'Headset': '🎧',
            'Shoes': '👟',
            'Mobiles': '📱',
            'Watches': '⌚',
            'Laptops': '💻',
            'Appliance': '🏠',
            'Clothing': '👕',
            'Books': '📚',
            'Sports': '⚽',
            'Toys': '🧸',
            'Food': '🍔',
            'Beauty': '💄',
            'Furniture': '🛋️',
        }
        return iconMap[category] || '📦'
    }

    return (
        <div className="h-full flex flex-col bg-white lg:rounded-xl shadow-sm border-b lg:border border-gray-200">
            <div className="p-3 border-b border-gray-200 hidden lg:block">
                <h2 className="text-sm font-bold text-gray-900">{t('categories')}</h2>
            </div>
            <ScrollArea className="flex-1 w-full h-auto lg:h-0 [&>[data-radix-scroll-area-viewport]]:no-scrollbar">
                <div className="flex lg:flex-col p-2 lg:p-3 pr-2 lg:pr-3 gap-3 lg:gap-2.5 overflow-x-auto lg:overflow-x-visible">
                    {/* All Category */}
                    <Card
                        className={`group flex-shrink-0 min-w-[72px] lg:w-full h-[84px] lg:h-[90px] cursor-pointer transition-all duration-300 border shadow-sm hover:shadow-md ${selectedCategory === 'all'
                            ? 'bg-gradient-to-br from-orange-400 to-orange-500 border-orange-500 shadow-orange-200 ring-2 ring-orange-200 ring-offset-2'
                            : 'bg-white border-gray-100 hover:border-orange-200 hover:bg-orange-50/30'
                            }`}
                        onClick={() => onCategoryChange('all')}
                    >
                        <div className="h-full p-2 flex flex-col items-center justify-center gap-1">
                            <span className="text-2xl lg:text-3xl filter drop-shadow-sm transition-transform duration-300 group-hover:scale-110">📦</span>
                            <span className={`text-[10px] lg:text-xs font-bold text-center leading-tight break-words w-full ${selectedCategory === 'all' ? 'text-white' : 'text-gray-600'
                                }`}>
                                {t('all')}
                            </span>
                        </div>
                    </Card>

                    {/* Category Cards */}
                    {categories.map((category) => (
                        <Card
                            key={category.name}
                            className={`group flex-shrink-0 min-w-[72px] lg:w-full h-[84px] lg:h-[90px] cursor-pointer transition-all duration-300 border shadow-sm hover:shadow-md ${selectedCategory === category.name
                                ? 'bg-gradient-to-br from-orange-400 to-orange-500 border-orange-500 shadow-orange-200 ring-2 ring-orange-200 ring-offset-2'
                                : 'bg-white border-gray-100 hover:border-orange-200 hover:bg-orange-50/30'
                                }`}
                            onClick={() => onCategoryChange(category.name)}
                        >
                            <div className="h-full p-2 flex flex-col items-center justify-center gap-1">
                                <span className="text-2xl lg:text-3xl filter drop-shadow-sm transition-transform duration-300 group-hover:scale-110">{category.icon}</span>
                                <span className={`text-[10px] lg:text-xs font-bold text-center leading-tight break-words w-full ${selectedCategory === category.name ? 'text-white' : 'text-gray-600'
                                    }`}>
                                    {category.name}
                                </span>
                            </div>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}
