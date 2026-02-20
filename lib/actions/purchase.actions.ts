'use server'

import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/db'
import Purchase, { IPurchase } from '@/lib/db/models/purchase.model'
import Product from '@/lib/db/models/product.model'
import { PurchaseInputSchema, PurchaseUpdateSchema } from '@/lib/validator'
import { revalidatePath } from 'next/cache'
import { formatError } from '@/lib/utils'
import { z } from 'zod'

const PAGE_SIZE = 10

// CREATE
export async function createPurchase(data: z.infer<typeof PurchaseInputSchema>) {
    try {
        const session = await auth()
        if (!session) throw new Error('Unauthorized')

        const purchase = PurchaseInputSchema.parse(data)
        await connectToDatabase()

        // Always force status to Received and update stock
        purchase.status = 'Received'

        const newPurchase = await Purchase.create({
            ...purchase,
            storeId: session.user.storeId,
            paymentStatus: purchase.paidAmount >= purchase.totalAmount ? 'Paid' : purchase.paidAmount > 0 ? 'Partial' : 'Unpaid'
        })

        // Update stock
        for (const item of purchase.items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { countInStock: item.quantity },
            })
        }

        revalidatePath(`/admin/${session.user.storeId}/purchases`)
        return {
            success: true,
            message: 'Purchase created successfully',
            data: JSON.parse(JSON.stringify(newPurchase)),
        }
    } catch (error) {
        return { success: false, message: formatError(error) }
    }
}

// UPDATE
export async function updatePurchase(data: z.infer<typeof PurchaseUpdateSchema>) {
    try {
        const session = await auth()
        if (!session) throw new Error('Unauthorized')

        const purchase = PurchaseUpdateSchema.parse(data)
        await connectToDatabase()

        const oldPurchase = await Purchase.findById(purchase._id)
        if (!oldPurchase) throw new Error('Purchase not found')

        // Always force status to Received
        purchase.status = 'Received'

        // Reconcile stock: Remove old items, Add new items
        // 1. Revert old stock
        for (const item of oldPurchase.items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { countInStock: -item.quantity },
            })
        }
        // 2. Apply new stock
        for (const item of purchase.items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { countInStock: item.quantity },
            })
        }

        // Recalculate payment status
        purchase.paymentStatus = purchase.paidAmount >= purchase.totalAmount ? 'Paid' : purchase.paidAmount > 0 ? 'Partial' : 'Unpaid'

        const updatedPurchase = await Purchase.findByIdAndUpdate(purchase._id, purchase, { new: true })

        revalidatePath(`/admin/${session.user.storeId}/purchases`)
        return {
            success: true,
            message: 'Purchase updated successfully',
            data: JSON.parse(JSON.stringify(updatedPurchase)),
        }
    } catch (error) {
        return { success: false, message: formatError(error) }
    }
}

// DELETE
export async function deletePurchase(id: string) {
    try {
        const session = await auth()
        if (!session) throw new Error('Unauthorized')

        await connectToDatabase()
        const purchase = await Purchase.findById(id)
        if (!purchase) throw new Error('Purchase not found')

        // Revert stock
        for (const item of purchase.items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { countInStock: -item.quantity },
            })
        }

        await Purchase.findByIdAndDelete(id)

        revalidatePath(`/admin/${session.user.storeId}/purchases`)
        return {
            success: true,
            message: 'Purchase deleted successfully',
        }
    } catch (error) {
        return { success: false, message: formatError(error) }
    }
}

// GET ALL
export async function getAllPurchases({
    query = '',
    page = 1,
    limit = PAGE_SIZE,
    storeId,
    status,
    paymentStatus,
    type,
    dateRange,
}: {
    query?: string
    page?: number
    limit?: number
    storeId: string
    status?: string
    paymentStatus?: string
    type?: string
    dateRange?: string
}) {
    try {
        await connectToDatabase()

        const filter: any = { storeId }
        if (query) {
            filter.reference = { $regex: query, $options: 'i' }
        }
        if (status && status !== 'all') {
            filter.status = status
        }
        if (paymentStatus && paymentStatus !== 'all') {
            filter.paymentStatus = paymentStatus
        }
        if (type && type !== 'all') {
            filter.type = type
        }

        // Date Range logic
        if (dateRange && dateRange !== 'all') {
            const now = new Date()
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

            if (dateRange === 'today') {
                filter.purchaseDate = { $gte: today }
            } else if (dateRange === 'yesterday') {
                const yesterday = new Date(today)
                yesterday.setDate(yesterday.getDate() - 1)
                filter.purchaseDate = { $gte: yesterday, $lt: today }
            } else if (dateRange === 'this_week') {
                const monday = new Date(today)
                monday.setDate(monday.getDate() - monday.getDay() + (monday.getDay() === 0 ? -6 : 1))
                filter.purchaseDate = { $gte: monday }
            } else if (dateRange === 'this_month') {
                const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
                filter.purchaseDate = { $gte: firstDayOfMonth }
            }
        }

        const skip = (page - 1) * limit

        const purchases = await Purchase.find(filter)
            .populate('supplierId', 'nameProvider')
            .sort({ purchaseDate: -1 })
            .skip(skip)
            .limit(limit)
            .lean()

        const totalPurchases = await Purchase.countDocuments(filter)

        return {
            purchases: JSON.parse(JSON.stringify(purchases)) as any[],
            totalPages: Math.ceil(totalPurchases / limit),
            totalPurchases,
        }
    } catch (error) {
        console.error('Error fetching purchases:', error)
        return { purchases: [], totalPages: 0, totalPurchases: 0 }
    }
}

// DUPLICATE
export async function duplicatePurchase(id: string) {
    try {
        const session = await auth()
        if (!session) throw new Error('Unauthorized')

        await connectToDatabase()
        const original = await Purchase.findById(id).lean()
        if (!original) throw new Error('Original purchase not found')

        const { _id, createdAt, updatedAt, ...rest } = original as any
        const newPurchase = await Purchase.create({
            ...rest,
            reference: `${rest.reference}-COPY`,
            purchaseDate: new Date(),
            status: 'Pending',
            paymentStatus: 'Unpaid',
            paidAmount: 0,
        })

        revalidatePath(`/admin/${session.user.storeId}/purchases`)
        return {
            success: true,
            message: 'Purchase duplicated successfully',
            data: JSON.parse(JSON.stringify(newPurchase)),
        }
    } catch (error) {
        return { success: false, message: formatError(error) }
    }
}

// GET BY ID
export async function getPurchaseById(id: string) {
    try {
        await connectToDatabase()
        const purchase = await Purchase.findById(id).populate('supplierId').populate('items.productId').lean()
        if (!purchase) return null
        return JSON.parse(JSON.stringify(purchase))
    } catch (error) {
        return null
    }
}

export async function hasPurchases(storeId: string) {
    try {
        await connectToDatabase()
        const count = await Purchase.countDocuments({ storeId })
        return count > 0
    } catch (error) {
        console.error('Error checking if store has purchases:', error)
        return false
    }
}
