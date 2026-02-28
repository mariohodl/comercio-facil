'use client'

import { useEffect } from 'react'

interface StorePersistenceManagerProps {
    sessionUser: {
        id: string
        companyId?: string
        storeId?: string
        storeName?: string
    }
}

/**
 * This client component ensures that the latest visited store information 
 * is persisted in localStorage. This is critical for the "Seller Login" 
 * screen to know which sellers to display when a seller starts their turn.
 */
export function StorePersistenceManager({ sessionUser }: StorePersistenceManagerProps) {
    useEffect(() => {
        if (sessionUser?.companyId && sessionUser?.storeId) {
            const lastPosStore = {
                companyId: sessionUser.companyId,
                storeId: sessionUser.storeId,
                storeName: sessionUser.storeName || 'Mi Tienda'
            }

            // Check if already correct to avoid unnecessary writes
            const saved = localStorage.getItem('last_pos_store')
            if (saved !== JSON.stringify(lastPosStore)) {
                console.log('[StorePersistence] Updating last_pos_store for device:', lastPosStore.storeName)
                localStorage.setItem('last_pos_store', JSON.stringify(lastPosStore))
            }
        }
    }, [sessionUser])

    return null
}
