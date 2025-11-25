'use server'

import { connectToDatabase } from '@/lib/db'
import SubCategory, { ISubCategory } from '@/lib/db/models/sub-category.model'
import Category from '@/lib/db/models/category.model'
import { revalidatePath } from 'next/cache'
import { formatError } from '../utils'
import { SubCategoryInputSchema, SubCategoryUpdateSchema } from '../validator'
import { ISubCategoryInput } from '@/types'
import { z } from 'zod'

const PAGE_SIZE = 10

// GET ALL SUB CATEGORIES
export async function getAllSubCategories({
    query = '',
    page = 1,
    limit = PAGE_SIZE,
    status,
}: {
    query?: string
    page?: number
    limit?: number
    status?: string
}) {
    await connectToDatabase()

    const queryFilter =
        query && query !== 'all'
            ? {
                name: {
                    $regex: query,
                    $options: 'i',
                },
            }
            : {}

    const statusFilter =
        status && status !== 'all' ? { status: status === 'active' } : {}

    const subCategories = await SubCategory.find({
        ...queryFilter,
        ...statusFilter,
    })
        .populate('parentCategory', 'categoryName')
        .sort({ createdAt: -1 })
        .skip(limit * (Number(page) - 1))
        .limit(limit)
        .lean()

    const countSubCategories = await SubCategory.countDocuments({
        ...queryFilter,
        ...statusFilter,
    })

    return {
        subCategories: JSON.parse(JSON.stringify(subCategories)) as (ISubCategory & { parentCategory: { categoryName: string } })[],
        totalPages: Math.ceil(countSubCategories / limit),
        totalSubCategories: countSubCategories,
    }
}

// GET SUB CATEGORY BY ID
export async function getSubCategoryById(subCategoryId: string) {
    await connectToDatabase()
    const subCategory = await SubCategory.findById(subCategoryId)
    return JSON.parse(JSON.stringify(subCategory)) as ISubCategory
}

// CREATE SUB CATEGORY
export async function createSubCategory(data: ISubCategoryInput) {
    try {
        const subCategory = SubCategoryInputSchema.parse(data)
        await connectToDatabase()

        // Check if slug already exists
        const existingSubCategory = await SubCategory.findOne({ slug: subCategory.slug })
        if (existingSubCategory) {
            return {
                success: false,
                message: 'Sub Category slug already exists',
            }
        }

        await SubCategory.create(subCategory)
        revalidatePath('/admin/[store]/inventory/sub-categories', 'page')
        return {
            success: true,
            message: 'Sub Category created successfully',
        }
    } catch (error) {
        return { success: false, message: formatError(error) }
    }
}

// UPDATE SUB CATEGORY
export async function updateSubCategory(data: z.infer<typeof SubCategoryUpdateSchema>) {
    try {
        const subCategory = SubCategoryUpdateSchema.parse(data)
        await connectToDatabase()

        // Check if slug already exists (excluding current sub category)
        const existingSubCategory = await SubCategory.findOne({
            slug: subCategory.slug,
            _id: { $ne: subCategory._id }
        })
        if (existingSubCategory) {
            return {
                success: false,
                message: 'Sub Category slug already exists',
            }
        }

        await SubCategory.findByIdAndUpdate(subCategory._id, subCategory)
        revalidatePath('/admin/[store]/inventory/sub-categories', 'page')
        return {
            success: true,
            message: 'Sub Category updated successfully',
        }
    } catch (error) {
        return { success: false, message: formatError(error) }
    }
}

// DELETE SUB CATEGORY
export async function deleteSubCategory(id: string) {
    try {
        await connectToDatabase()
        const res = await SubCategory.findByIdAndDelete(id)
        if (!res) throw new Error('Sub Category not found')
        revalidatePath('/admin/[store]/inventory/sub-categories', 'page')
        return {
            success: true,
            message: 'Sub Category deleted successfully',
        }
    } catch (error) {
        return { success: false, message: formatError(error) }
    }
}

// GET SUB CATEGORIES BY CATEGORY ID (for dropdowns/selects)
export async function getSubCategoriesByCategory(categoryId: string) {
    await connectToDatabase()
    const subCategories = await SubCategory.find({ parentCategory: categoryId, status: true })
        .select('name slug code')
        .sort({ name: 1 })
        .lean()
    return JSON.parse(JSON.stringify(subCategories)) as ISubCategory[]
}
