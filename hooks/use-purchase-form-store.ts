import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PurchaseItem {
    productId: string
    name: string
    quantity: number
    freeQuantity: number
    costPrice: number
    subtotal: number
    entryType: string
    reason?: string
}

interface PurchaseFormData {
    supplierId: string
    reference: string
    purchaseDate: Date
    status: string
    type: string
    items: PurchaseItem[]
    totalAmount: number
    paidAmount: number
    paymentStatus: string
    notes: string
    storeId: string
    attachments?: { name: string; url: string; type: string }[]
}

interface PurchaseFormState {
    products: any[]
    formData: Partial<PurchaseFormData> | null
    setProducts: (products: any[]) => void
    addProduct: (product: any) => void
    updateProduct: (productId: string, updates: any) => void
    removeProduct: (productId: string) => void
    clearProducts: () => void
    setFormData: (data: Partial<PurchaseFormData>) => void
    updateFormData: (updates: Partial<PurchaseFormData>) => void
    clearFormData: () => void
    clearAll: () => void
}

export const usePurchaseFormStore = create(
    persist<PurchaseFormState>(
        (set, get) => ({
            products: [],
            formData: null,

            // Product actions
            setProducts: (products) => {
                set({ products })
            },

            addProduct: (product) => {
                const { products } = get()
                // Check if product already exists
                const existingIndex = products.findIndex(p => p._id === product._id)

                if (existingIndex >= 0) {
                    // Update existing product
                    const updatedProducts = [...products]
                    updatedProducts[existingIndex] = product
                    set({ products: updatedProducts })
                } else {
                    // Add new product
                    set({ products: [...products, product] })
                }
            },

            updateProduct: (productId, updates) => {
                const { products } = get()
                const updatedProducts = products.map(p =>
                    p._id === productId ? { ...p, ...updates } : p
                )
                set({ products: updatedProducts })
            },

            removeProduct: (productId) => {
                const { products } = get()
                set({ products: products.filter(p => p._id !== productId) })
            },

            clearProducts: () => {
                set({ products: [] })
            },

            // Form data actions
            setFormData: (data) => {
                set({ formData: data })
            },

            updateFormData: (updates) => {
                const { formData } = get()
                set({ formData: { ...formData, ...updates } })
            },

            clearFormData: () => {
                set({ formData: null })
            },

            clearAll: () => {
                set({ products: [], formData: null })
            },
        }),
        {
            name: 'purchase-form-store',
            partialize: (state) => ({
                ...state,
                formData: state.formData ? {
                    ...state.formData,
                    paidAmount: 0 // Reset paidAmount when persisting/rehydrating
                } : null
            }) as PurchaseFormState
        }
    )
)
