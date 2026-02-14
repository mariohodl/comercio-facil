'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Minus, AlertCircle, Layers, AlertTriangle, ScanBarcode, Package } from 'lucide-react'
import { IProduct } from '@/lib/db/models/product.model'
import { usePOSStore, FRACTIONAL_UNITS } from '@/hooks/use-pos-store'
import { formatCurrency } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import VariantSelectorDialog from './variant-selector-dialog'
import { toast } from 'sonner'

interface ProductCardProps {
    product: IProduct
    onAdd?: () => void
}

export default function ProductCard({ product, onAdd }: ProductCardProps) {
    const t = useTranslations('pos')
    const { addToCart, cart, updateQuantity, removeFromCart } = usePOSStore()
    const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false)

    const hasVariants = product.variants && product.variants.length > 0

    // Calculate aggregate stock if has variants, otherwise use product stock
    const effectiveStock = hasVariants
        ? product.variants!.reduce((acc, v) => acc + (v.countInStock || 0), 0)
        : product.countInStock

    const isOutOfStock = effectiveStock <= 0
    const isLowStock = effectiveStock <= (product.quantityAlert || 5) && !isOutOfStock
    const isCriticalStock = effectiveStock <= 3 && !isOutOfStock

    const unit = ((product as any).unitId?.abbreviation || product.unit || '').toLowerCase()
    const isFractional = FRACTIONAL_UNITS.includes(unit)

    // Calculate total quantity of this product in cart (summing all variants)
    const cartItems = cart.filter(item => item.product === product._id)
    const totalCartQty = Math.floor(cartItems.reduce((acc, item) => acc + item.quantity, 0) * 1000) / 1000

    // Price to display
    let displayPrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.listPrice
    let hasPriceRange = false

    if (hasVariants) {
        const variantPrices = product.variants!.map(v => v.discountPrice && v.discountPrice > 0 ? v.discountPrice : v.listPrice)
        const minPrice = Math.min(...variantPrices)
        const maxPrice = Math.max(...variantPrices)

        displayPrice = minPrice
        if (minPrice !== maxPrice) {
            hasPriceRange = true
        }
    }

    const originalPrice = product.listPrice

    // Get unit abbreviation if available, otherwise use full unit name
    const displayUnit = (product as any).unitId?.name || product.unit

    const handleCardClick = () => {
        if (isOutOfStock) {
            toast.error(t('outOfStock'), {
                description: `${product.name} ${t('outOfStock').toLowerCase()}`
            })
            return
        }

        if (hasVariants) {
            setIsVariantDialogOpen(true)
        } else {
            if (totalCartQty >= effectiveStock) {
                toast.error(t('insufficientStock'), {
                    description: `${t('onlyUnitsAvailable', { count: effectiveStock })} ${product.unit}`
                })
                return
            }
            addToCart(product)
            onAdd?.()
            if (isLowStock) {
                const remaining = effectiveStock - totalCartQty - 1
                toast.warning(t('stockWarning'), {
                    description: `${t('unitsRemaining', { count: remaining })} ${product.unit}`
                })
            }
        }
    }

    const handleIncrement = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (hasVariants) {
            setIsVariantDialogOpen(true)
        } else {
            if (totalCartQty >= effectiveStock) {
                toast.error(t('insufficientStock'), {
                    description: `${t('onlyUnitsAvailable', { count: effectiveStock })} ${product.unit}`
                })
                return
            }

            const item = cartItems[0]
            if (item) {
                updateQuantity(item.cartItemId, item.quantity + 1)
                onAdd?.()
            } else {
                addToCart(product)
                onAdd?.()
            }

            if (totalCartQty + 1 >= effectiveStock) {
                toast.warning(t('lastUnit'), {
                    description: `${t('allUnitsAdded')} (${effectiveStock} ${product.unit})`
                })
            } else if (isLowStock) {
                const remaining = effectiveStock - totalCartQty - 1
                toast.warning(t('stockWarning'), {
                    description: `${t('unitsRemaining', { count: remaining })} ${product.unit}`
                })
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
                    updateQuantity(item.cartItemId, item.quantity - 1)
                } else {
                    removeFromCart(item.cartItemId)
                }
            }
        }
    }

    return (
        <>
            <Card
                className={`group relative overflow-hidden border-gray-100 bg-white shadow-sm hover:shadow-lg transition-all duration-300 ${isOutOfStock ? 'opacity-75' : 'cursor-pointer hover:border-gray-300 p-0'}`}
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

                        {isLowStock && !hasVariants && (
                            <div className="absolute top-2 left-2 z-10">
                                <Badge
                                    className={`shadow-sm ${isCriticalStock ? 'bg-red-50 text-red-700 border-red-300 animate-pulse' : 'bg-orange-50 text-orange-700 border-orange-200'}`}
                                >
                                    {isCriticalStock ? <AlertTriangle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                                    {isCriticalStock ? `${effectiveStock} ${product.unit}` : t('lowStock')}
                                </Badge>
                            </div>
                        )}

                        {hasVariants && (
                            <div className="absolute top-2 left-2 z-10">
                                <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 flex items-center gap-1 shadow-sm backdrop-blur-sm">
                                    <Layers className="w-3 h-3" />
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
                    <div className="px-3 py-1">
                        {/* Brand & Category Row */}
                        <div className="flex items-center gap-1.5 mb-0.5 overflow-hidden whitespace-nowrap">
                            <span className="text-[9px] font-black text-blue-600/80 uppercase tracking-widest shrink-0">
                                {product.category}
                            </span>
                            {product.brand && (
                                <>
                                    <div className="w-0.5 h-0.5 rounded-full bg-slate-300 shrink-0" />
                                    <span className="text-[9px] font-bold text-slate-500 uppercase truncate">
                                        {product.brand}
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Name */}
                        <h3 className="font-semibold text-gray-900 leading-tight line-clamp-2 h-9 mb-1 group-hover:text-blue-600 transition-colors text-xs lg:text-sm">
                            {product.name}
                        </h3>

                        {/* Price & Actions Row */}
                        <div className="flex items-end justify-between mt-1">
                            <div className="flex flex-col">
                                <div className="flex items-baseline gap-1 flex-wrap">
                                    {hasPriceRange && <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Desde</span>}
                                    <span className="text-sm lg:text-base font-black text-slate-900 tracking-tight">
                                        {formatCurrency(displayPrice)}
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-400/70">
                                        {t('perUnit', { unit: displayUnit })}
                                    </span>
                                </div>

                                {originalPrice > displayPrice && !hasPriceRange && (
                                    <div className="flex items-center gap-1.5 -mt-0.5">
                                        <span className="text-[10px] text-slate-400 line-through decoration-slate-300 font-medium">
                                            {formatCurrency(originalPrice)}
                                        </span>
                                        <span className="text-[9px] bg-red-50 text-red-600 px-1 rounded-sm font-black uppercase">
                                            -{Math.round((1 - displayPrice / originalPrice) * 100)}%
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Cart Controls for Simple Products */}
                            {!hasVariants && !isOutOfStock && totalCartQty > 0 && !isFractional ? (
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

                        {/* Technical Info Row (SKU & Barcode) */}
                        <div className="mt-2 py-1 border-t border-gray-100 flex items-center justify-center gap-4 text-[9px] text-gray-400 font-mono">
                            <div className="flex items-center gap-1 shrink-0">
                                <Package className="w-3 h-3 opacity-60" />
                                <span className="truncate">{product.sku}</span>
                            </div>
                            {product.itemBarcode && (
                                <div className="flex items-center gap-1 shrink-0 border-l border-gray-100 pl-3">
                                    <ScanBarcode className="w-3 h-3 opacity-60" />
                                    <span className="truncate">{product.itemBarcode}</span>
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
