'use server';

import { connectToDatabase } from '../db';
import Customer, { ICustomer } from '../db/models/customer.model';
import { formatError } from '../utils';

// CREATE
export async function createCustomer(data: {
    name: string
    storeId: string
    email?: string
    phone?: string
    address?: string
    city?: string
}) {
    try {
        await connectToDatabase()

        if (!data.storeId) {
            return { success: false, message: 'Store ID is required' }
        }

        // Check for duplicates within the same store? 
        // For now, let's allow same email in different stores, or even same store?
        // User requirement said "Customers are business entities owned by each store". 
        // So uniqueness should be scoped to store, or not enforced.
        // Let's enforce email uniqueness per store if email is provided.
        if (data.email) {
            const existingCustomer = await Customer.findOne({
                email: data.email,
                storeId: data.storeId
            })
            if (existingCustomer) {
                return { success: false, message: 'Customer with this email already exists in this store' }
            }
        }

        const newCustomer = await Customer.create(data)

        return {
            success: true,
            message: 'Customer created successfully',
            data: JSON.parse(JSON.stringify(newCustomer)),
        }
    } catch (error) {
        return { success: false, message: formatError(error) }
    }
}

// GET ACTIONS
export async function getCustomersByStore(storeId: string) {
    try {
        await connectToDatabase()
        const customers = await Customer.find({ storeId }).sort({ name: 1 })
        return {
            success: true,
            data: JSON.parse(JSON.stringify(customers)) as ICustomer[],
        }
    } catch (error) {
        return { success: false, message: formatError(error), data: [] }
    }
}
