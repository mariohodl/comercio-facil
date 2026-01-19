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
                const res = await getAllProductsForAdmin({
                    query: '',
                    page: 1,
                    limit: 100,
                    store: storeId,
                })

                // Extract unique categories
                const uniqueCategories = Array.from(new Set(res.products.map(p => p.category).filter(Boolean)))

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
            <ScrollArea className="flex-1 w-full h-auto lg:h-0">
                <div className="flex lg:flex-col p-2 lg:p-3 pr-8 lg:pr-3 gap-2 lg:gap-1 overflow-x-auto lg:overflow-x-visible">
                    {/* All Category */}
                    <Card
                        className={`flex-shrink-0 min-w-[70px] lg:w-full h-[80px] lg:h-[100px] cursor-pointer transition-all duration-200 border ${selectedCategory === 'all'
                            ? 'bg-gradient-to-br from-orange-400 to-orange-500 border-orange-500 shadow-md'
                            : 'bg-white border-gray-200 hover:border-orange-300'
                            }`}
                        onClick={() => onCategoryChange('all')}
                    >
                        <div className="h-full p-2 lg:p-3 flex flex-col items-center justify-center space-y-1">
                            <div className="text-2xl lg:text-3xl">📦</div>
                            <span className={`text-[10px] lg:text-xs font-semibold text-center leading-tight ${selectedCategory === 'all' ? 'text-white' : 'text-gray-900'
                                }`}>
                                {t('all')}
                            </span>
                        </div>
                    </Card>

                    {/* Category Cards */}
                    {categories.map((category) => (
                        <Card
                            key={category.name}
                            className={`flex-shrink-0 min-w-[70px] lg:w-full h-[80px] lg:h-[100px] cursor-pointer transition-all duration-200 border ${selectedCategory === category.name
                                ? 'bg-gradient-to-br from-orange-400 to-orange-500 border-orange-500 shadow-md'
                                : 'bg-white border-gray-200 hover:border-orange-300'
                                }`}
                            onClick={() => onCategoryChange(category.name)}
                        >
                            <div className="h-full p-2 lg:p-3 flex flex-col items-center justify-center space-y-1">
                                <div className="text-2xl lg:text-3xl">{category.icon}</div>
                                <span className={`text-[10px] lg:text-xs font-semibold text-center leading-tight ${selectedCategory === category.name ? 'text-white' : 'text-gray-900'
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
