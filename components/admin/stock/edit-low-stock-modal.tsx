'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { IProduct } from '@/lib/db/models/product.model'
import { updateProduct } from '@/lib/actions/product.actions'
import { toast } from 'sonner'

interface EditLowStockModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    product: IProduct | null
    warehouses: any[]
    stores: any[]
    onSuccess: () => void
}

export default function EditLowStockModal({
    open,
    onOpenChange,
    product,
    warehouses,
    stores,
    onSuccess,
}: EditLowStockModalProps) {
    const t = useTranslations('stock')
    const tCommon = useTranslations('common')
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        warehouse: product?.warehouse || '',
        store: product?.store || '',
        name: product?.name || '',
        countInStock: product?.countInStock || 0,
        quantityAlert: product?.quantityAlert || 0,
    })

    // Update form data when product changes
    useEffect(() => {
        if (product) {
            console.log('Product warehouse:', product.warehouse)
            console.log('Available warehouses:', warehouses.map(w => w.name))

            // Robust pre-filling:
            // 1. Try to use product.warehouse
            // 2. If missing or not in list, use first warehouse available
            const warehouseExists = warehouses.some(w => w.name === product.warehouse)
            const warehouseValue = (product.warehouse && warehouseExists)
                ? product.warehouse
                : (warehouses.length > 0 ? warehouses[0].name : '')

            // Same for store (using slug)
            const storeExists = stores.some(s => s.slug === product.store)
            const storeValue = (product.store && storeExists)
                ? product.store
                : (stores.length > 0 ? stores[0].slug : '')

            setFormData({
                warehouse: warehouseValue,
                store: storeValue,
                name: product.name || '',
                countInStock: product.countInStock || 0,
                quantityAlert: product.quantityAlert || 0,
            })
        }
    }, [product, warehouses, stores])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!product) return

        setLoading(true)
        try {
            const result = await updateProduct({
                ...product,
                warehouse: formData.warehouse,
                store: formData.store,
                name: formData.name,
                countInStock: formData.countInStock,
                quantityAlert: formData.quantityAlert,
            })

            if (result.success) {
                toast.success(tCommon('success'), {
                    description: 'Product updated successfully'
                })
                onSuccess()
                onOpenChange(false)
            } else {
                toast.error(tCommon('error'), {
                    description: result.message
                })
            }
        } catch (error) {
            toast.error(tCommon('error'), {
                description: 'Failed to update product'
            })
        } finally {
            setLoading(false)
        }
    }

    if (!product) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        {t('editLowStocks')}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Warehouse */}
                        <div className="space-y-2">
                            <Label htmlFor="warehouse">
                                {t('warehouse')} <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                key={`warehouse-${product?._id}`}
                                value={formData.warehouse}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, warehouse: value })
                                }
                                disabled
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('selectWarehouse')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {warehouses.map((w) => (
                                        <SelectItem key={w._id} value={w.name}>
                                            {w.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Store */}
                        <div className="space-y-2">
                            <Label htmlFor="store">
                                {t('store')} <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                key={`store-${product?._id}`}
                                value={formData.store}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, store: value })
                                }
                                disabled
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('selectStore')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {stores.map((s) => (
                                        <SelectItem key={s._id} value={s.slug}>
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* SKU - Read Only */}
                        <div className="space-y-2">
                            <Label htmlFor="sku">
                                SKU <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="sku"
                                value={product.sku}
                                disabled
                                className="bg-gray-50"
                            />
                        </div>

                        {/* Category - Read Only */}
                        <div className="space-y-2">
                            <Label htmlFor="category">
                                {t('category')} <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="category"
                                value={product.category}
                                disabled
                                className="bg-gray-50"
                            />
                        </div>
                    </div>

                    {/* Product Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            {t('productName')} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            required
                            disabled
                            className="bg-gray-50"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Qty */}
                        <div className="space-y-2">
                            <Label htmlFor="qty">
                                {t('qty')} <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="qty"
                                type="number"
                                value={formData.countInStock}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        countInStock: parseInt(e.target.value) || 0,
                                    })
                                }
                                required
                                min="0"
                            />
                        </div>

                        {/* Qty Alert */}
                        <div className="space-y-2">
                            <Label htmlFor="qtyAlert">
                                {t('qtyAlert')} <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="qtyAlert"
                                type="number"
                                value={formData.quantityAlert}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        quantityAlert: parseInt(e.target.value) || 0,
                                    })
                                }
                                required
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            {tCommon('cancel')}
                        </Button>
                        <Button
                            type="submit"
                            className="bg-orange hover:bg-orange-dark text-white"
                            disabled={loading}
                        >
                            {loading ? t('saving') : t('saveChanges')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
