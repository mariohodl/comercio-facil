'use server'

import { connectToDatabase } from '@/lib/db'
import SubCategory, { ISubCategory } from '@/lib/db/models/sub-category.model'
import Category from '@/lib/db/models/category.model'
import { revalidatePath } from 'next/cache'
import { formatError, toSlug } from '../utils'
import { SubCategoryInputSchema, SubCategoryUpdateSchema } from '../validator'
import { ISubCategoryInput } from '@/types'
import { z } from 'zod'
import { getCompanyIndustry } from './catalog.actions'

const PAGE_SIZE = 10

// GET ALL SUB CATEGORIES
export async function getAllSubCategories({
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
                name: {
                    $regex: query,
                    $options: 'i',
                },
            }
            : {}

    const statusFilter =
        status && status !== 'all' ? { status: status === 'active' } : {}

    const finalFilter = {
        ...queryFilter,
        ...statusFilter,
        ...(storeId ? { storeId } : {})
    }

    const subCategories = await SubCategory.find(finalFilter)
        .populate('parentCategory', 'categoryName')
        .sort({ createdAt: -1 })
        .skip(limit * (Number(page) - 1))
        .limit(limit)
        .lean()

    const countSubCategories = await SubCategory.countDocuments(finalFilter)

    return JSON.parse(JSON.stringify({
        subCategories: subCategories as any[],
        totalPages: Math.ceil(countSubCategories / limit),
        totalSubCategories: countSubCategories,
    }))
}

// GET SUB CATEGORY BY ID
export async function getSubCategoryById(subCategoryId: string) {
    await connectToDatabase()
    const subCategory = await SubCategory.findById(subCategoryId)
    return JSON.parse(JSON.stringify(subCategory))
}

// CREATE SUB CATEGORY
export async function createSubCategory(data: ISubCategoryInput) {
    try {
        const subCategory = SubCategoryInputSchema.parse(data)
        await connectToDatabase()

        const slug = subCategory.slug || toSlug(subCategory.name)
        const code = subCategory.code || subCategory.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 9).toUpperCase()

        // Check if slug already exists for this store/parent
        const existingSubCategory = await SubCategory.findOne({
            slug,
            parentCategory: subCategory.parentCategory,
            storeId: subCategory.storeId
        })
        if (existingSubCategory) {
            return {
                success: false,
                message: 'Sub Category slug already exists for this category',
            }
        }

        const industry = await getCompanyIndustry()

        await SubCategory.create({
            ...subCategory,
            slug,
            code,
            industry,
            isApproved: false,
            isGlobal: false,
        })
        revalidatePath('/admin/[store]/inventory/sub-categories', 'page')
        return {
            success: true,
            message: 'Sub Category proposed successfully and is pending approval',
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
export async function getSubCategoriesByCategory(categoryId: string, storeId?: string) {
    await connectToDatabase()
    const filter: any = {
        parentCategory: categoryId,
        status: true,
        $or: [
            { isApproved: true },
            ...(storeId ? [{ storeId }] : [])
        ]
    }
    const subCategories = await SubCategory.find(filter)
        .select('name slug code isGlobal industry isApproved')
        .sort({ name: 1 })
        .lean()
    return JSON.parse(JSON.stringify(subCategories)) as ISubCategory[]
}

// APPROVE SUB CATEGORY (SuperAdmin only)
export async function approveSubCategory(id: string, isGlobal: boolean = false) {
    try {
        await connectToDatabase()
        const subCategory = await SubCategory.findByIdAndUpdate(
            id,
            { isApproved: true, isGlobal },
            { new: true }
        )
        if (!subCategory) throw new Error('Sub Category not found')

        revalidatePath('/admin/[store]/inventory/sub-categories', 'page')
        return {
            success: true,
            message: `Sub Category approved ${isGlobal ? 'as global' : ''}`,
        }
    } catch (error) {
        return { success: false, message: formatError(error) }
    }
}
