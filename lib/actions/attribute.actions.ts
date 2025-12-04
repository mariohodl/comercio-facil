'use server'

import { connectToDatabase } from '@/lib/db'
import Attribute, { IAttribute } from '@/lib/db/models/attribute.model'
import { revalidatePath } from 'next/cache'

export async function createAttribute(data: {
    name: string
    values: string[]
    store: string
    status?: boolean
}) {
    try {
        await connectToDatabase()
        const newAttribute = await Attribute.create(data)
        revalidatePath(`/admin/${data.store}/inventory/attributes`)
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
        revalidatePath(`/admin/${updatedAttribute.store}/inventory/attributes`)
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

export async function getAttributesByStore(storeId: string) {
    try {
        await connectToDatabase()
        const attributes = await Attribute.find({ store: storeId }).sort({ createdAt: -1 })
        return JSON.parse(JSON.stringify(attributes)) as IAttribute[]
    } catch (error: any) {
        console.error('Error fetching attributes:', error)
        return []
    }
}
