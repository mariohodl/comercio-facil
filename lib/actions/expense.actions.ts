'use server'

import { auth } from '@/auth'
import { connectToDatabase } from '../db'
import Expense from '../db/models/expense.model'
import { formatError } from '../utils'
import { revalidatePath } from 'next/cache'
import { ExpenseInputSchema } from '../validator'
import { DateRange } from 'react-day-picker'

export async function createExpense(data: any) {
    try {
        await connectToDatabase()
        const session = await auth()
        if (!session) throw new Error('User not authenticated')

        const validatedData = ExpenseInputSchema.parse(data)

        const expense = await Expense.create({
            ...validatedData,
            user: session.user.id,
        })

        revalidatePath(`/admin/${validatedData.storeId}/expenses`)
        return {
            success: true,
            message: 'Gasto registrado correctamente',
            data: JSON.parse(JSON.stringify(expense)),
        }
    } catch (error) {
        return { success: false, message: formatError(error) }
    }
}

export async function getExpenses({
    storeId,
    dateRange,
    query,
    limit = 20,
    page = 1,
}: {
    storeId: string
    dateRange?: DateRange
    query?: string
    limit?: number
    page?: number
}) {
    try {
        await connectToDatabase()

        const filter: any = { storeId }

        if (dateRange?.from && dateRange?.to) {
            filter.date = {
                $gte: dateRange.from,
                $lte: dateRange.to,
            }
        }

        if (query) {
            filter.$or = [
                { category: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
            ]
        }

        const skipAmount = (page - 1) * limit

        const expenses = await Expense.find(filter)
            .sort({ date: -1 })
            .skip(skipAmount)
            .limit(limit)
            .populate('user', 'name')

        const totalExpenses = await Expense.countDocuments(filter)

        return {
            data: JSON.parse(JSON.stringify(expenses)),
            totalPages: Math.ceil(totalExpenses / limit),
            totalCount: totalExpenses,
        }
    } catch (error) {
        console.error(error)
        return { data: [], totalPages: 0, totalCount: 0 }
    }
}

export async function deleteExpense(id: string, storeId: string) {
    try {
        await connectToDatabase()
        const session = await auth()
        if (!session) throw new Error('User not authenticated')

        await Expense.findByIdAndDelete(id)

        revalidatePath(`/admin/${storeId}/expenses`)
        return { success: true, message: 'Gasto eliminado correctamente' }
    } catch (error) {
        return { success: false, message: formatError(error) }
    }
}

export async function getExpenseCategories(storeId: string) {
    try {
        await connectToDatabase()
        const categories = await Expense.distinct('category', { storeId })
        const defaults = ['Renta', 'Luz', 'Agua', 'Internet', 'Sueldos', 'Limpieza', 'Mantenimiento', 'Otros']

        // Merge defaults with existing categories and remove duplicates
        const allCategories = Array.from(new Set([...defaults, ...categories])).sort()

        return allCategories
    } catch (error) {
        return ['Otros']
    }
}
