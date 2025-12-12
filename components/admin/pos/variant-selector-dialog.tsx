'use client'

import { useState } from 'react'
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
    const { addToCart } = usePOSStore()

    const handleAddVariant = (variant: any) => {
        // Cast to IVariant or any compatible type
        addToCart(product, variant as IVariant)
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
                        const isOutOfStock = variant.countInStock <= 0
                        const image = variant.images && variant.images[0] ? variant.images[0].imgUrl : (product.images[0]?.imgUrl || '/placeholder.png')

                        return (
                            <div
                                key={variant.sku}
                                className={`flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors ${isOutOfStock ? 'opacity-60' : ''}`}
                            >
                                {/* Image */}
                                <div className="relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden shrink-0">
                                    <Image
                                        src={image}
                                        alt={variant.sku}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap gap-2 mb-1">
                                        {variant.attributes.map((attr: any, idx: number) => (
                                            <Badge key={idx} variant="secondary" className="text-xs px-2 py-0">
                                                {attr.name}: {attr.value}
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                        <span className="font-mono text-xs">{variant.sku}</span>
                                        <span className={`${isOutOfStock ? 'text-red-500 font-medium' : 'text-green-600'}`}>
                                            {isOutOfStock ? t('outOfStock') : `${t('stock')}: ${variant.countInStock}`}
                                        </span>
                                    </div>
                                </div>

                                {/* Price & Action */}
                                <div className="flex flex-col items-end gap-2 text-right">
                                    <div>
                                        <div className="font-bold text-lg">
                                            {formatCurrency(price)}
                                        </div>
                                        {isDiscounted && (
                                            <div className="text-xs text-gray-400 line-through">
                                                {formatCurrency(variant.listPrice)}
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        size="sm"
                                        disabled={isOutOfStock}
                                        onClick={() => handleAddVariant(variant)}
                                        className="gap-2"
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                        {t('addToCart')}
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
