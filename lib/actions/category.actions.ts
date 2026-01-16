'use server'

import { connectToDatabase } from '@/lib/db'
import Category, { ICategory } from '@/lib/db/models/category.model'
import { revalidatePath } from 'next/cache'
import { formatError } from '../utils'
import { CategoryInputSchema, CategoryUpdateSchema } from '../validator'
import { ICategoryInput } from '@/types'
import { z } from 'zod'

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

    const categories = await Category.find({
        ...queryFilter,
        ...statusFilter,
        ...(storeId ? { storeId } : {}),
    })
        .sort({ createdAt: -1 })
        .skip(limit * (Number(page) - 1))
        .limit(limit)
        .lean()

    const countCategories = await Category.countDocuments({
        ...queryFilter,
        ...statusFilter,
        ...(storeId ? { storeId } : {}),
    })

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

        await Category.create(category)
        revalidatePath('/admin/[store]/inventory/categories', 'page')
        return {
            success: true,
            message: 'Category created successfully',
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
    const categories = await Category.find({
        status: true,
        ...(storeId ? { storeId } : {})
    })
        .select('categoryName categorySlug')
        .sort({ categoryName: 1 })
        .lean()
    return JSON.parse(JSON.stringify(categories)) as ICategory[]
}
