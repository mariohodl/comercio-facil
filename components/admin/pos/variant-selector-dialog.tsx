'use client'

// import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { IProduct } from '@/lib/db/models/product.model'
import { usePOSStore, IVariant } from '@/hooks/use-pos-store'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { ShoppingCart } from 'lucide-react'

interface VariantSelectorDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    product: IProduct
}

export default function VariantSelectorDialog({ open, onOpenChange, product }: VariantSelectorDialogProps) {
    const t = useTranslations('pos')
    const { addToCart, cart } = usePOSStore()

    const handleAddVariant = (variant: IVariant) => {
        addToCart(product, variant)
        onOpenChange(false)
    }

    if (!product.variants || product.variants.length === 0) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{product.name}</DialogTitle>
                    <DialogDescription>
                        {t('selectVariant')}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 gap-4 mt-4">
                    {product.variants.map((variant) => {
                        const price = variant.discountPrice && variant.discountPrice > 0 ? variant.discountPrice : variant.listPrice
                        const isDiscounted = variant.discountPrice && variant.discountPrice > 0

                        // Calculate how many of this variant are in cart
                        const cartItems = cart.filter(item => item.product === product._id && item.variantSku === variant.sku)
                        const cartQty = Math.floor(cartItems.reduce((acc, item) => acc + item.quantity, 0) * 1000) / 1000

                        const stockLimit = Math.floor(variant.countInStock * 1000) / 1000
                        const isOutOfStock = stockLimit <= 0
                        const isStockReached = cartQty >= stockLimit

                        const image = variant.images && variant.images[0] ? variant.images[0].imgUrl : (product.images[0]?.imgUrl || '/placeholder.png')

                        return (
                            <div
                                key={variant.sku}
                                className={`flex items-center gap-4 p-3 border rounded-xl hover:bg-slate-50 transition-all ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'bg-white shadow-sm'}`}
                            >
                                {/* Image */}
                                <div className="relative w-20 h-20 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                                    <Image
                                        src={image}
                                        alt={variant.sku}
                                        fill
                                        className="object-cover"
                                    />
                                    {cartQty > 0 && (
                                        <Badge className="absolute top-1 right-1 bg-blue-600 text-white border-white border-2">
                                            {cartQty}
                                        </Badge>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                                        {variant.attributes.map((attr: { name: string; value: string }, idx: number) => (
                                            <Badge key={idx} variant="secondary" className="text-[10px] uppercase tracking-wider font-bold bg-slate-100 text-slate-600 border-none px-2 py-0.5">
                                                {attr.name}: {attr.value}
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-mono text-[10px] text-slate-400 font-medium tracking-tight uppercase">{variant.sku}</span>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-bold ${isOutOfStock ? 'text-rose-500' : isStockReached ? 'text-amber-500' : 'text-emerald-600'}`}>
                                                {isOutOfStock ? t('outOfStock') : isStockReached ? t('allUnitsAdded') : `${t('stock')}: ${variant.countInStock}`}
                                            </span>
                                            {isStockReached && !isOutOfStock && (
                                                <Badge variant="outline" className="text-[9px] border-amber-200 text-amber-600 bg-amber-50 h-5 px-1.5">
                                                    MAX
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Price & Action */}
                                <div className="flex flex-col items-end gap-2 text-right">
                                    <div>
                                        <div className="font-black text-xl text-slate-900 tracking-tight">
                                            {formatCurrency(price)}
                                        </div>
                                        {isDiscounted && (
                                            <div className="text-[10px] font-bold text-slate-400 line-through">
                                                {formatCurrency(variant.listPrice)}
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        size="sm"
                                        disabled={isOutOfStock || isStockReached}
                                        onClick={() => handleAddVariant(variant)}
                                        className={`gap-2 h-9 rounded-lg font-bold px-4 ${isStockReached && !isOutOfStock ? 'bg-slate-100 text-slate-400 border-slate-200' : ''}`}
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                        {isStockReached ? t('added') : t('add')}
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </DialogContent>
        </Dialog>
    )
}
