'use server'

import { connectToDatabase } from '@/lib/db'
import Category, { ICategory } from '@/lib/db/models/category.model'
import { revalidatePath } from 'next/cache'
import { formatError } from '../utils'
import { CategoryInputSchema, CategoryUpdateSchema } from '../validator'
import { ICategoryInput } from '@/types'
import { z } from 'zod'
import { getCompanyIndustry } from './catalog.actions'

const PAGE_SIZE = 10

// GET ALL CATEGORIES
export async function getAllCategories({
    query = '',
    page = 1,
    limit = PAGE_SIZE,
    status,
    storeId,
}: {
    query?: string
    page?: number
    limit?: number
    status?: string
    storeId?: string
}) {
    await connectToDatabase()

    const queryFilter =
        query && query !== 'all'
            ? {
                categoryName: {
                    $regex: query,
                    $options: 'i',
                },
            }
            : {}

    const statusFilter =
        status && status !== 'all' ? { status: status === 'active' } : {}

    const safePage = Math.max(1, Number(page))

    const finalFilter = {
        ...queryFilter,
        ...statusFilter,
        ...(storeId ? { storeId } : {})
    }

    const categories = await Category.find(finalFilter)
        .sort({ createdAt: -1 })
        .skip(limit * (safePage - 1))
        .limit(limit)
        .lean()

    const countCategories = await Category.countDocuments(finalFilter)

    return {
        categories: JSON.parse(JSON.stringify(categories)) as ICategory[],
        totalPages: Math.ceil(countCategories / limit),
        totalCategories: countCategories,
    }
}

// GET CATEGORY BY ID
export async function getCategoryById(categoryId: string) {
    await connectToDatabase()
    const category = await Category.findById(categoryId)
    return JSON.parse(JSON.stringify(category)) as ICategory
}

// CREATE CATEGORY
export async function createCategory(data: ICategoryInput) {
    try {
        const category = CategoryInputSchema.parse(data)
        await connectToDatabase()

        // Check if slug already exists for this store
        const existingCategory = await Category.findOne({
            categorySlug: category.categorySlug,
            storeId: category.storeId
        })
        if (existingCategory) {
            return {
                success: false,
                message: 'Category slug already exists',
            }
        }

        const industry = await getCompanyIndustry()

        const newCategory = await Category.create({
            ...category,
            industry,
            isApproved: false,
            isGlobal: false,
        })
        revalidatePath('/admin/[store]/inventory/categories', 'page')
        return {
            success: true,
            message: 'Category proposed successfully and is pending approval',
            categoryId: newCategory._id.toString(),
            categoryName: newCategory.categoryName
        }
    } catch (error) {
        return { success: false, message: formatError(error) }
    }
}

// UPDATE CATEGORY
export async function updateCategory(data: z.infer<typeof CategoryUpdateSchema>) {
    try {
        const category = CategoryUpdateSchema.parse(data)
        await connectToDatabase()

        // Check if slug already exists (excluding current category)
        const existingCategory = await Category.findOne({
            categorySlug: category.categorySlug,
            storeId: category.storeId,
            _id: { $ne: category._id }
        })
        if (existingCategory) {
            return {
                success: false,
                message: 'Category slug already exists',
            }
        }

        await Category.findByIdAndUpdate(category._id, category)
        revalidatePath('/admin/[store]/inventory/categories', 'page')
        return {
            success: true,
            message: 'Category updated successfully',
        }
    } catch (error) {
        return { success: false, message: formatError(error) }
    }
}

// DELETE CATEGORY
export async function deleteCategory(id: string) {
    try {
        await connectToDatabase()
        const res = await Category.findByIdAndDelete(id)
        if (!res) throw new Error('Category not found')
        revalidatePath('/admin/[store]/inventory/categories', 'page')
        return {
            success: true,
            message: 'Category deleted successfully',
        }
    } catch (error) {
        return { success: false, message: formatError(error) }
    }
}

// GET ACTIVE CATEGORIES (for dropdowns/selects)
export async function getActiveCategories(storeId?: string) {
    await connectToDatabase()
    const filter = {
        status: true,
        $or: [
            { isApproved: true },
            ...(storeId ? [{ storeId }] : [])
        ]
    }

    const categories = await Category.find(filter)
        .select('categoryName categorySlug')
        .sort({ categoryName: 1 })
        .lean()
    return JSON.parse(JSON.stringify(categories)) as ICategory[]
}

// APPROVE CATEGORY (SuperAdmin only)
export async function approveCategory(id: string, isGlobal: boolean = false) {
    try {
        await connectToDatabase()
        const category = await Category.findByIdAndUpdate(
            id,
            { isApproved: true, isGlobal },
            { new: true }
        )
        if (!category) throw new Error('Category not found')

        revalidatePath('/admin/[store]/inventory/categories', 'page')
        return {
            success: true,
            message: `Category approved ${isGlobal ? 'as global' : ''}`,
        }
    } catch (error) {
        return { success: false, message: formatError(error) }
    }
}
