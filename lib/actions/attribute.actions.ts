'use server'

import { connectToDatabase } from '@/lib/db'
import Attribute, { IAttribute } from '@/lib/db/models/attribute.model'
import { revalidatePath } from 'next/cache'

export async function createAttribute(data: {
    name: string
    values: string[]
    storeId: string
    industry?: string
    status?: boolean
}) {
    try {
        await connectToDatabase()
        const newAttribute = await Attribute.create(data)
        revalidatePath(`/admin/${data.storeId}/inventory/attributes`)
        return { success: true, message: 'Attribute created successfully', data: JSON.parse(JSON.stringify(newAttribute)) }
    } catch (error: any) {
        return { success: false, message: error.message }
    }
}

export async function updateAttribute(
    id: string,
    data: {
        name?: string
        values?: string[]
        status?: boolean
    }
) {
    try {
        await connectToDatabase()
        const updatedAttribute = await Attribute.findByIdAndUpdate(id, data, {
            new: true,
        })
        if (!updatedAttribute) {
            return { success: false, message: 'Attribute not found' }
        }
        revalidatePath(`/admin/${updatedAttribute.storeId}/inventory/attributes`)
        return { success: true, message: 'Attribute updated successfully', data: JSON.parse(JSON.stringify(updatedAttribute)) }
    } catch (error: any) {
        return { success: false, message: error.message }
    }
}

export async function deleteAttribute(id: string, storeId: string) {
    try {
        await connectToDatabase()
        await Attribute.findByIdAndDelete(id)
        revalidatePath(`/admin/${storeId}/inventory/attributes`)
        return { success: true, message: 'Attribute deleted successfully' }
    } catch (error: any) {
        return { success: false, message: error.message }
    }
}

export async function getAttributesByStore(storeId: string, includeGlobal: boolean = true) {
    try {
        await connectToDatabase()
        // Find attributes that belong to this store OR optionally are global and approved
        const query: any = { storeId: storeId }

        if (includeGlobal) {
            query.$or = [
                { storeId: storeId },
                { isGlobal: true, isApproved: true }
            ]
            delete query.storeId // Use the $or version instead
        } else {
            // If includeGlobal is false, we only want store-specific attributes,
            // so the initial query { storeId: storeId } is sufficient.
            // No change needed here as it's already the default.
        }

        const attributes = await Attribute.find(query).sort({ name: 1 })
        return JSON.parse(JSON.stringify(attributes)) as IAttribute[]
    } catch (error: any) {
        console.error('Error fetching attributes:', error)
        return []
    }
}
