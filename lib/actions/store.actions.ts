'use server'

import { auth } from '@/auth'
import { connectToDatabase } from '../db'
import Store from '../db/models/store.model'
import User from '../db/models/user.model'

export async function getUserStores() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            throw new Error('Unauthorized')
        }

        await connectToDatabase()
        const user = await User.findById(session.user.id)
        if (!user || !user.business?.companyId) {
            return []
        }

        const stores = await Store.find({ company: user.business.companyId })
        return JSON.parse(JSON.stringify(stores))
    } catch (error) {
        console.error(error)
        return []
    }
}
