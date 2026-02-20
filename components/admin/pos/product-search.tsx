'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { usePOSStore } from '@/hooks/use-pos-store'
import { getAllProductsForAdmin } from '@/lib/actions/product.actions'
import { IProduct } from '@/lib/db/models/product.model'
import { useSession } from 'next-auth/react'
import {
    Loader2,
    Search,
    Package,
    ScanBarcode,
    ShoppingBag,
    X,
    LayoutGrid,
    ChevronDown,
    ChevronUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/hooks/use-debounce'
import ProductCard from './product-card'

interface ProductSearchProps {
    storeId: string
    selectedCategory: string
    onCategoryChange: (category: string) => void
    showCategories?: boolean
    onToggleCategories?: () => void
    query: string
    onQueryChange: (query: string) => void
    onAddToCart?: () => void
}

export default function ProductSearch({
    storeId,
    selectedCategory,
    onCategoryChange: _onCategoryChange,
    showCategories,
    onToggleCategories,
    query,
    onQueryChange,
    onAddToCart
}: ProductSearchProps) {
    const { data: session } = useSession()
    const locale = useLocale()
    const [products, setProducts] = useState<IProduct[]>([])
    const [loading, setLoading] = useState(false)
    const [mounted, setMounted] = useState(false)
    const { cart } = usePOSStore()

    useEffect(() => {
        setMounted(true)
    }, [])
    const debouncedQuery = useDebounce(query, 500)
    const t = useTranslations('pos')
    const tCommon = useTranslations('common')

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



    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                e.preventDefault()
                const searchInput = document.getElementById('product-search-input')
                searchInput?.focus()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    const filteredProducts = products

    // Get current date
    const currentDate = new Date().toLocaleDateString(locale, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    })

    return (
        <div className="flex flex-1 h-full flex-col space-y-4">
            {/* Header & Search Section */}
            <div className="flex flex-col space-y-3">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Welcome Text & Category Toggle */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="min-w-max">
                            <h2 className="text-lg font-bold tracking-tight text-gray-900">
                                {t('welcome')}, {mounted ? (session?.user?.name?.split(' ')[0] || 'Vendedor') : '...'}
                            </h2>
                            <p className="text-xs text-gray-500 capitalize">{mounted ? currentDate : '...'}</p>
                        </div>

                        {/* Category Toggle for Mobile */}
                        <div className="lg:hidden">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onToggleCategories}
                                className={`h-9 px-3 border-gray-200 font-bold transition-all rounded-xl gap-2 shadow-sm ${showCategories
                                    ? 'bg-orange-50/50 border-orange-200 text-orange-600 hover:bg-orange-100/50 hover:border-orange-300'
                                    : 'bg-white text-gray-600 hover:text-orange hover:border-orange/30 hover:bg-orange/5'
                                    }`}
                            >
                                <LayoutGrid className={`h-4 w-4 ${showCategories ? 'text-orange-500' : 'text-gray-400'}`} />
                                <span className="text-xs">{t('categories')}</span>
                                {showCategories ? <ChevronUp className="h-3 w-3 opacity-50" /> : <ChevronDown className="h-3 w-3 opacity-50" />}
                            </Button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="flex-1 w-full lg:max-w-xl relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-300">
                            <Search className="h-4 w-4" />
                        </div>

                        <Input
                            id="product-search-input"
                            autoFocus
                            data-testid="pos-product-search"
                            placeholder={t('searchPlaceholder')}
                            value={query}
                            onChange={(e) => onQueryChange(e.target.value)}
                            className="pl-10 pr-24 h-10 bg-white border-gray-200 rounded-lg shadow-sm text-sm placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-orange-500/20 focus-visible:border-orange-500 transition-all duration-300 hover:border-gray-300"
                        />

                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                            {query && (
                                <button
                                    onClick={() => onQueryChange('')}
                                    className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                                    aria-label="Clear search"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-gray-200 ml-1">
                                <div className="flex flex-col items-center justify-center p-1 bg-gray-50 rounded border border-gray-100" title={t('scanProduct')}>
                                    <ScanBarcode className="h-3.5 w-3.5 text-gray-500" />
                                </div>
                                <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border border-gray-200 bg-gray-50 px-1.5 font-mono text-[10px] font-medium text-gray-500 shadow-sm">
                                    <span className="text-[10px]">/</span>
                                </kbd>
                            </div>
                        </div>
                    </div>

                    {/* Cart Badge */}
                    {cart.length > 0 && (
                        <div className="hidden lg:block">
                            <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200 px-3 py-1.5 flex items-center gap-2 transition-colors whitespace-nowrap">
                                <ShoppingBag className="h-4 w-4" />
                                <span className="font-medium">{cart.length} {t('itemsInCart')}</span>
                            </Badge>
                        </div>
                    )}
                </div>

                {/* Mobile Cart Badge & Results Count */}
                <div className="flex items-center justify-between px-1">
                    <p className="text-xs font-medium text-gray-500">
                        {loading ? (
                            <span className="flex items-center gap-1 animate-pulse">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                {tCommon('loading')}
                            </span>
                        ) : (
                            <span>{products.length} {t('productsFound')}</span>
                        )}
                    </p>

                    {cart.length > 0 && (
                        <div className="lg:hidden">
                            <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200 px-3 py-1 flex items-center gap-2 transition-colors">
                                <ShoppingBag className="h-3.5 w-3.5" />
                                <span className="font-medium text-xs">{cart.length} {t('itemsInCart')}</span>
                            </Badge>
                        </div>
                    )}
                </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
                {loading ? (
                    <div className="flex h-full items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : products.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                        <Package className="h-16 w-16 mb-4 text-gray-300" />
                        <p className="text-gray-500 font-medium">{t('noProductsFound')}</p>
                        <p className="text-sm text-gray-400 mt-1">{t('tryAdjusting')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 pb-40 lg:pb-4">
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} onAdd={onAddToCart} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
