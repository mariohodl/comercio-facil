'use client'

import { useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { get, set, del } from 'idb-keyval'
import { createCustomer } from '@/lib/actions/customer.actions'
import { createProduct } from '@/lib/actions/product.actions'

export function OfflineSyncManager({ storeId }: { storeId: string }) {
    const syncOfflineData = useCallback(async () => {
        if (!navigator.onLine || !storeId) return

        let idMap: Record<string, string> = {}

        // 1. Sync Offline Customers
        try {
            const customersKey = `offline_customers_${storeId}`
            const cachedCustomers: any[] = await get(customersKey) || []
            const newOfflineCustomers = cachedCustomers.filter(c => c._id?.startsWith('offline_customer_'))

            if (newOfflineCustomers.length > 0) {
                toast.info(`Sincronizando ${newOfflineCustomers.length} clientes nuevos...`)
                let syncedCount = 0
                for (const customer of newOfflineCustomers) {
                    const tempId = customer._id
                    const { _id, createdAt, updatedAt, ...cleanData } = customer
                    const res = await createCustomer({ ...cleanData, storeId })
                    if (res.success && res.data) {
                        idMap[tempId] = res.data._id
                        syncedCount++
                    }
                }

                if (syncedCount > 0) {
                    toast.success(`${syncedCount} clientes sincronizados.`)
                    const remainingCustomers = cachedCustomers.filter(c => !c._id?.startsWith('offline_customer_'))
                    await set(customersKey, remainingCustomers)
                }
            }
        } catch (error) {
            console.error('Error syncing offline customers:', error)
        }

        // 2. Sync Offline Products
        try {
            const productsKey = `offline_products_queue_${storeId}`
            const offlineProducts: any[] = await get(productsKey) || []

            if (offlineProducts.length > 0) {
                toast.info(`Sincronizando ${offlineProducts.length} productos nuevos...`)
                let syncedProducts = 0
                const remainingProducts: any[] = []

                for (const product of offlineProducts) {
                    try {
                        const { localId, isOffline, _id, ...payload } = product

                        // NOTE: If images have 'file' objects, they would need startUpload here.
                        // For a smoother experience, we'll strip unuploaded files or keep it simple.
                        const cleanPayload = { ...payload };
                        if (cleanPayload.images) {
                            cleanPayload.images = cleanPayload.images.map((img: any) => {
                                if (img.file) {
                                    const { file, ...rest } = img;
                                    return rest; // Strip file object for server action
                                }
                                return img;
                            });
                        }

                        const res = await createProduct(cleanPayload)
                        if (res.success) {
                            syncedProducts++
                        } else {
                            console.error('Error syncing product:', res.message)
                            remainingProducts.push(product)
                        }
                    } catch (err) {
                        console.error('Failed to sync product:', err)
                        remainingProducts.push(product)
                    }
                }

                if (syncedProducts > 0) {
                    toast.success(`${syncedProducts} productos sincronizados.`)
                    await set(productsKey, remainingProducts)

                    // Trigger a catalog refresh so POS sees the new products with real IDs
                    const { getAllProductsForAdmin } = await import('@/lib/actions/product.actions')
                    const result = await getAllProductsForAdmin({
                        query: '',
                        page: 1,
                        limit: 2000,
                        store: storeId,
                    })
                    await set(`offline_catalog_${storeId}`, result.products)
                }
            }
        } catch (error) {
            console.error('Error syncing offline products:', error)
        }

        // 3. Sync Offline Orders (from localStorage as per POS pattern)
        const offlineOrdersKey = `offline_orders_${storeId}`
        let offlineOrders = JSON.parse(localStorage.getItem(offlineOrdersKey) || '[]')

        if (offlineOrders.length > 0) {
            offlineOrders = offlineOrders.map((order: any) => {
                if (order.customerId && idMap[order.customerId]) {
                    order.customerId = idMap[order.customerId]
                } else if (order.customerId?.startsWith('offline_customer_')) {
                    order.customerId = undefined
                }
                return order
            })

            toast.info(`Sincronizando ${offlineOrders.length} ventas offline...`)
            const failedOrders: any[] = []

            for (const order of offlineOrders) {
                try {
                    const { _id, ...payload } = order
                    const res = await fetch('/api/admin/pos/transaction', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                    })

                    if (!res.ok) failedOrders.push(order)
                } catch (err) {
                    failedOrders.push(order)
                }
            }

            if (failedOrders.length < offlineOrders.length) {
                toast.success(`${offlineOrders.length - failedOrders.length} ventas sincronizadas.`)
            }
            localStorage.setItem(offlineOrdersKey, JSON.stringify(failedOrders))
        }

        // 4. Sync Offline Purchases
        try {
            const purchasesKey = `offline_purchases_queue_${storeId}`
            const offlinePurchases: any[] = await get(purchasesKey) || []

            if (offlinePurchases.length > 0) {
                toast.info(`Sincronizando ${offlinePurchases.length} compras nuevas...`)
                let syncedPurchases = 0
                const remainingPurchases: any[] = []

                const { createPurchase } = await import('@/lib/actions/purchase.actions')

                for (const purchase of offlinePurchases) {
                    try {
                        const { localId, isOffline, _id, ...payload } = purchase
                        const res = await createPurchase(payload)
                        if (res.success) {
                            syncedPurchases++
                        } else {
                            console.error('Error syncing purchase:', res.message)
                            remainingPurchases.push(purchase)
                        }
                    } catch (err) {
                        console.error('Failed to sync purchase:', err)
                        remainingPurchases.push(purchase)
                    }
                }

                if (syncedPurchases > 0) {
                    toast.success(`${syncedPurchases} compras sincronizadas.`)
                    await set(purchasesKey, remainingPurchases)
                }
            }
        } catch (error) {
            console.error('Error syncing offline purchases:', error)
        }

        // 5. Sync Offline Providers
        try {
            const providersKey = `offline_proveedores_queue_${storeId}`
            const offlineProviders: any[] = await get(providersKey) || []

            if (offlineProviders.length > 0) {
                toast.info(`Sincronizando ${offlineProviders.length} proveedores nuevos...`)
                let syncedProviders = 0
                const remainingProviders: any[] = []

                const { createProveedor } = await import('@/lib/actions/proveedor.actions')

                for (const provider of offlineProviders) {
                    try {
                        const { localId, isOffline, storeId: sId, _id, ...payload } = provider
                        const res = await createProveedor(payload)
                        if (res.success) {
                            syncedProviders++
                        } else {
                            console.error('Error syncing provider:', res.message)
                            remainingProviders.push(provider)
                        }
                    } catch (err) {
                        console.error('Failed to sync provider:', err)
                        remainingProviders.push(provider)
                    }
                }

                if (syncedProviders > 0) {
                    toast.success(`${syncedProviders} proveedores sincronizados.`)
                    await set(providersKey, remainingProviders)

                    // Trigger catalog refresh for providers
                    const { getAllProveedoresForAdmin } = await import('@/lib/actions/proveedor.actions')
                    const result = await getAllProveedoresForAdmin({
                        query: '',
                        page: 1,
                        limit: 2000,
                        storeId: storeId,
                    })
                    await set(`offline_proveedores_${storeId}`, result)
                }
            }
        } catch (error) {
            console.error('Error syncing offline providers:', error)
        }
    }, [storeId])

    useEffect(() => {
        window.addEventListener('online', syncOfflineData)
        if (navigator.onLine) {
            syncOfflineData()
        }
        return () => window.removeEventListener('online', syncOfflineData)
    }, [syncOfflineData])

    return null
}
