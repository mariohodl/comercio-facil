'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { usePOSStore } from '@/hooks/use-pos-store'
import { getAllProductsForAdmin } from '@/lib/actions/product.actions'
import { IProduct } from '@/lib/db/models/product.model'
import { Loader2, Search, Package } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import ProductCard from './product-card'

interface ProductSearchProps {
    storeId: string
    selectedCategory: string
    onCategoryChange: (category: string) => void
}

export default function ProductSearch({ storeId, selectedCategory, onCategoryChange: _onCategoryChange }: ProductSearchProps) {
    const [query, setQuery] = useState('')
    const [products, setProducts] = useState<IProduct[]>([])
    const [loading, setLoading] = useState(false)
    const { cart } = usePOSStore()
    const debouncedQuery = useDebounce(query, 500)
    const t = useTranslations('pos')

    const fetchProducts = useCallback(async (searchQuery: string, category: string = 'all') => {
        setLoading(true)
        try {
            const res = await getAllProductsForAdmin({
                query: searchQuery,
                page: 1,
                limit: 50,
                store: storeId,
                category: category !== 'all' ? category : undefined,
            })
            setProducts(res.products)
        } catch (error) {
            console.error('Failed to fetch products', error)
        } finally {
            setLoading(false)
        }
    }, [storeId])

    useEffect(() => {
        fetchProducts(debouncedQuery, selectedCategory)
    }, [debouncedQuery, selectedCategory, fetchProducts])



    const filteredProducts = products

    // Get current date
    const currentDate = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    })

    return (
        <div className="flex flex-1 h-full flex-col space-y-3">
            {/* Welcome Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="hidden sm:block">
                    <h2 className="text-lg font-bold text-gray-900 leading-tight">
                        {t('welcome')}, User
                    </h2>
                    <p className="text-[10px] text-gray-500">{currentDate}</p>
                </div>

                <div className="relative w-full sm:w-2/3">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        autoFocus
                        placeholder={t('searchPlaceholder')}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-9 h-10 lg:h-9 bg-white border-gray-200 rounded-lg shadow-sm text-sm"
                    />
                </div>
            </div>

            {/* Search */}
            <div className="space-y-2">
                {/* <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        autoFocus
                        placeholder={t('searchPlaceholder')}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-9 h-9 bg-white border-gray-200 rounded-lg shadow-sm text-sm"
                    />
                </div> */}

                {/* Results Count */}
                <div className="flex items-center justify-between text-xs text-gray-600">
                    {cart.length > 0 && (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5">
                            {cart.length} {t('itemsInCart')}
                        </Badge>
                    )}
                    <span>{filteredProducts.length} {t('productsFound')}</span>
                </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
                {loading ? (
                    <div className="flex h-full items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                        <Package className="h-16 w-16 mb-4 text-gray-300" />
                        <p className="text-gray-500 font-medium">{t('noProductsFound')}</p>
                        <p className="text-sm text-gray-400 mt-1">{t('tryAdjusting')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 pb-40 lg:pb-4">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
