'use server'

import { auth } from '@/auth'
import { connectToDatabase } from '../db'
import Warehouse from '../db/models/warehouse.model'
import User from '../db/models/user.model'

export async function getUserWarehouses() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            console.log('getUserWarehouses: No session user id')
            throw new Error('Unauthorized')
        }

        await connectToDatabase()
        const user = await User.findById(session.user.id)
        console.log('getUserWarehouses: User found:', user ? user._id : 'null')
        if (!user || !user.business?.companyId) {
            console.log('getUserWarehouses: No user or companyId', user?.business)
            return []
        }

        console.log('getUserWarehouses: Company ID:', user.business.companyId)
        let warehouses = await Warehouse.find({ company: user.business.companyId })
        console.log('getUserWarehouses: Warehouses found:', warehouses.length)

        if (warehouses.length === 0) {
            console.log('getUserWarehouses: Creating default warehouse')
            // Create default warehouse if none exist
            const defaultWarehouse = await Warehouse.create({
                name: 'Almacén Principal',
                company: user.business.companyId,
                location: 'Ubicación Principal',
                slug: 'almacen-principal-' + Math.random().toString(36).substring(7)
            })

            warehouses = [defaultWarehouse]

            // Update user with new warehouse
            await User.findByIdAndUpdate(user._id, {
                $push: { 'business.warehouses': defaultWarehouse._id }
            })
        }

        return JSON.parse(JSON.stringify(warehouses))
    } catch (error) {
        console.error('getUserWarehouses error:', error)
        return []
    }
}
