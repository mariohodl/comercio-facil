'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Minus, AlertCircle, ShoppingCart, Layers } from 'lucide-react'
import { IProduct } from '@/lib/db/models/product.model'
import { usePOSStore } from '@/hooks/use-pos-store'
import { formatCurrency } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import VariantSelectorDialog from './variant-selector-dialog'

interface ProductCardProps {
    product: IProduct
}

export default function ProductCard({ product }: ProductCardProps) {
    const t = useTranslations('pos')
    const { addToCart, cart, updateQuantity, removeFromCart } = usePOSStore()
    const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false)

    const hasVariants = product.variants && product.variants.length > 0
    const isOutOfStock = product.countInStock <= 0
    const isLowStock = product.countInStock <= 5 && !isOutOfStock

    // Calculate total quantity of this product in cart (summing all variants)
    const cartItems = cart.filter(item => item.product === product._id)
    const totalCartQty = cartItems.reduce((acc, item) => acc + item.quantity, 0)

    // Price to display
    const displayPrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.listPrice
    const originalPrice = product.listPrice

    const handleCardClick = () => {
        if (hasVariants) {
            setIsVariantDialogOpen(true)
        } else {
            if (!isOutOfStock) {
                addToCart(product)
            }
        }
    }

    const handleIncrement = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (hasVariants) {
            setIsVariantDialogOpen(true)
        } else {
            if (totalCartQty < product.countInStock) {
                // For simple products, we can assume just one item type in cart
                // But safer to find the exact item if it exists
                const item = cartItems[0]
                if (item) {
                    updateQuantity(product._id, item.quantity + 1)
                } else {
                    addToCart(product)
                }
            }
        }
    }

    const handleDecrement = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (hasVariants) {
            setIsVariantDialogOpen(true)
        } else {
            const item = cartItems[0]
            if (item) {
                if (item.quantity > 1) {
                    updateQuantity(product._id, item.quantity - 1)
                } else {
                    removeFromCart(product._id)
                }
            }
        }
    }

    return (
        <>
            <Card
                className={`group relative overflow-hidden border-gray-100 bg-white shadow-sm hover:shadow-lg transition-all duration-300 ${isOutOfStock ? 'opacity-75' : 'cursor-pointer hover:border-gray-300'}`}
                onClick={handleCardClick}
            >
                <CardContent className="p-0">
                    {/* Image Section */}
                    <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
                        <Image
                            src={product.images[0]?.imgUrl || '/placeholder.png'}
                            alt={product.name}
                            fill
                            className={`object-cover transition-transform duration-500 ${!isOutOfStock && 'group-hover:scale-105'}`}
                        />

                        {/* Overlays */}
                        {isOutOfStock && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                                <Badge variant="destructive" className="font-semibold px-3 py-1 shadow-sm">
                                    {t('outOfStock')}
                                </Badge>
                            </div>
                        )}

                        {isLowStock && (
                            <div className="absolute top-2 left-2 z-10">
                                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 shadow-sm">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    {t('lowStock')}
                                </Badge>
                            </div>
                        )}

                        {hasVariants && (
                            <div className="absolute top-2 left-2 z-10">
                                <Badge variant="secondary" className="bg-white/90 text-gray-700 shadow-sm backdrop-blur-sm">
                                    <Layers className="h-3 w-3 mr-1" />
                                    {t('variants', { count: product.variants?.length || 0 })}
                                </Badge>
                            </div>
                        )}

                        {totalCartQty > 0 && (
                            <div className="absolute top-2 right-2 z-10 animate-in zoom-in duration-200">
                                <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-6 min-w-6 flex items-center justify-center px-1.5 shadow-md">
                                    {totalCartQty}
                                </Badge>
                            </div>
                        )}

                        {/* Hover Overlay Action */}
                        {!isOutOfStock && (
                            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center items-end pb-4">
                                <span className="text-white font-medium text-sm flex items-center gap-1">
                                    {hasVariants ? t('selectOptions') : t('quickAdd')}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="p-3">
                        {/* Category & SKU */}
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span className="uppercase tracking-wider font-medium truncate max-w-[60%]">
                                {product.category}
                            </span>
                            <span className="font-mono opacity-80 truncate max-w-[35%]">
                                {product.sku}
                            </span>
                        </div>

                        {/* Name */}
                        <h3 className="font-semibold text-gray-900 leading-tight line-clamp-2 h-10 mb-2 group-hover:text-blue-600 transition-colors">
                            {product.name}
                        </h3>

                        {/* Price & Actions Row */}
                        <div className="flex items-end justify-between mt-2">
                            <div className="flex flex-col">
                                <span className="text-lg font-bold text-gray-900 leading-none">
                                    {hasVariants ? (
                                        <span className="text-sm font-normal text-gray-500 mr-1">{t('from')}</span>
                                    ) : null}
                                    {formatCurrency(displayPrice)}
                                </span>
                                {product.discountPrice && product.discountPrice > 0 && (
                                    <span className="text-xs text-gray-400 line-through mt-0.5">
                                        {formatCurrency(originalPrice)}
                                    </span>
                                )}
                            </div>

                            {/* Cart Controls for Simple Products */}
                            {!hasVariants && !isOutOfStock && totalCartQty > 0 ? (
                                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5" onClick={(e) => e.stopPropagation()}>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 rounded-md hover:bg-white text-gray-600"
                                        onClick={handleDecrement}
                                    >
                                        <Minus className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 rounded-md hover:bg-white text-gray-600"
                                        onClick={handleIncrement}
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            ) : (
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${!isOutOfStock ? 'bg-gray-100 text-gray-600 group-hover:bg-blue-600 group-hover:text-white' : 'bg-gray-50 text-gray-300'}`}>
                                    {hasVariants ? <Layers className="w-4 h-4" /> : <Plus className="w-5 h-5" />}
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <VariantSelectorDialog
                open={isVariantDialogOpen}
                onOpenChange={setIsVariantDialogOpen}
                product={product}
            />
        </>
    )
}
