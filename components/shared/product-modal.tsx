'use client'

import { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import ProductForm from '@/app/admin/[store]/products/product-form'
import { getActiveCategories } from '@/lib/actions/category.actions'
import { getActiveBrands } from '@/lib/actions/brand.actions'
import { getActiveUnits } from '@/lib/actions/unit.actions'
import { getAttributesByStore } from '@/lib/actions/attribute.actions'
import { getUserStores } from '@/lib/actions/store.actions'
import { getUserWarehouses } from '@/lib/actions/warehouse.actions'
import { getCompanyIndustry } from '@/lib/actions/catalog.actions'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePurchaseFormStore } from '@/hooks/use-purchase-form-store'

interface ProductModalProps {
    open: boolean
    onClose: () => void
    onSuccess?: (product: any) => void
    storeId: string
}

export function ProductModal({ open, onClose, onSuccess, storeId }: ProductModalProps) {
    const t = useTranslations('products')
    // Fallback for title to avoid crash if translation is missing
    const title = t('createNewProduct') || 'Crear Nuevo Producto'
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Get the addProduct function from the store
    const { addProduct } = usePurchaseFormStore()

    useEffect(() => {
        if (open && !data) {
            const fetchData = async () => {
                setLoading(true)
                try {
                    const [
                        categories,
                        brands,
                        units,
                        attributes,
                        stores,
                        warehouses,
                        industry
                    ] = await Promise.all([
                        getActiveCategories(),
                        getActiveBrands(),
                        getActiveUnits(),
                        getAttributesByStore(storeId),
                        getUserStores(),
                        getUserWarehouses(),
                        getCompanyIndustry()
                    ])

                    setData({
                        categories,
                        brands,
                        units,
                        attributes,
                        stores,
                        warehouses,
                        industry
                    })
                } catch (error) {
                    console.error('Error fetching product creation data:', error)
                } finally {
                    setLoading(false)
                }
            }
            fetchData()
        }
    }, [open, storeId, data])

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent
                className="w-[95vw] sm:max-w-[80vw] lg:max-w-[70%] max-h-[90vh] overflow-y-auto p-0 border-none shadow-2xl rounded-xl"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <DialogHeader className="p-4 sm:p-6 pb-0 sticky top-0 bg-white z-20 border-b border-gray-100 rounded-t-xl">
                    <DialogTitle className="text-xl sm:text-2xl font-black text-navy">
                        {title}
                    </DialogTitle>
                </DialogHeader>

                <div className="p-4 sm:p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-10 h-10 text-orange animate-spin" />
                            <p className="text-gray-500 font-medium">Cargando formulario...</p>
                        </div>
                    ) : data ? (
                        <ProductForm
                            type="Create"
                            storeId={storeId}
                            categories={data.categories}
                            brands={data.brands}
                            units={data.units}
                            attributes={data.attributes}
                            stores={data.stores}
                            warehouses={data.warehouses}
                            industry={data.industry}
                            isModal={true}
                            onSuccess={(product) => {
                                // Add the newly created product to the store
                                addProduct(product)
                                // Call the parent's onSuccess callback
                                onSuccess?.(product)
                                onClose()
                            }}
                        />
                    ) : (
                        <div className="text-center py-10 text-destructive font-bold">
                            Error al cargar los datos necesarios.
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
