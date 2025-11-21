'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { usePOSStore } from '@/hooks/use-pos-store'
import { getAllProductsForAdmin } from '@/lib/actions/product.actions'
import { IProduct } from '@/lib/db/models/product.model'
import { Loader2, Search, ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'

export default function ProductSearch() {
    const [query, setQuery] = useState('')
    const [products, setProducts] = useState<IProduct[]>([])
    const [loading, setLoading] = useState(false)
    const { addToCart } = usePOSStore()
    const debouncedQuery = useDebounce(query, 500)

    const fetchProducts = useCallback(async (searchQuery: string) => {
        setLoading(true)
        try {
            const res = await getAllProductsForAdmin({
                query: searchQuery,
                page: 1,
                limit: 20,
            })
            setProducts(res.products)
        } catch (error) {
            console.error('Failed to fetch products', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchProducts(debouncedQuery)
    }, [debouncedQuery, fetchProducts])

    return (
        <div className="flex h-full flex-col space-y-4">
            <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search products..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-8"
                />
            </div>

            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex h-full items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : products.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        No products found
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {products.map((product) => (
                            <Card
                                key={product._id}
                                className="cursor-pointer transition-shadow hover:shadow-md"
                                onClick={() => addToCart(product)}
                            >
                                <CardHeader className="p-0">
                                    <div className="relative aspect-square w-full overflow-hidden rounded-t-lg bg-muted">
                                        <Image
                                            src={product.images[0]?.imgUrl || '/placeholder.png'}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent className="p-3">
                                    <h3 className="line-clamp-2 text-sm font-medium">{product.name}</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Stock: {product.countInStock}
                                    </p>
                                </CardContent>
                                <CardFooter className="flex items-center justify-between p-3 pt-0">
                                    <span className="font-bold">{formatCurrency(product.price)}</span>
                                    <Button size="icon" variant="secondary" className="h-8 w-8">
                                        <ShoppingCart className="h-4 w-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
