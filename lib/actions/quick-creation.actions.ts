'use server'

import { connectToDatabase } from '@/lib/db'
import Category from '@/lib/db/models/category.model'
import SubCategory from '@/lib/db/models/sub-category.model'
import Brand from '@/lib/db/models/brand.model'
import Unit from '@/lib/db/models/unit.model'
import { toSlug, formatError } from '../utils'
import { getCompanyIndustry } from './catalog.actions'
import { revalidatePath } from 'next/cache'

export async function quickCreateCategory(name: string, storeId: string) {
    try {
        await connectToDatabase()
        const industry = await getCompanyIndustry()
        const categorySlug = toSlug(name)

        // Check if exists
        const existing = await Category.findOne({
            $and: [
                {
                    $or: [
                        { categoryName: name },
                        { categorySlug }
                    ]
                },
                {
                    $or: [
                        { isGlobal: true },
                        { storeId }
                    ]
                }
            ]
        })

        if (existing) return { success: true, item: JSON.parse(JSON.stringify(existing)) }

        const newCategory = await Category.create({
            categoryName: name,
            categorySlug,
            industry,
            storeId,
            isApproved: false,
            isGlobal: false,
            status: true
        })

        revalidatePath('/admin/[store]/inventory/categories', 'page')
        return { success: true, item: JSON.parse(JSON.stringify(newCategory)) }
    } catch (error) {
        return { success: false, message: formatError(error) }
    }
}

export async function quickCreateBrand(name: string, storeId: string) {
    try {
        await connectToDatabase()
        const industry = await getCompanyIndustry()
        const slug = toSlug(name)

        // Check if exists
        const existing = await Brand.findOne({
            $and: [
                {
                    $or: [
                        { name },
                        { slug }
                    ]
                },
                {
                    $or: [
                        { isGlobal: true },
                        { storeId }
                    ]
                }
            ]
        })

        if (existing) return { success: true, item: JSON.parse(JSON.stringify(existing)) }

        const newBrand = await Brand.create({
            name,
            slug,
            industry: industry || 'general',
            storeId,
            isApproved: false,
            isGlobal: false,
            status: true
        })

        revalidatePath('/admin/[store]/inventory/brands', 'page')
        return { success: true, item: JSON.parse(JSON.stringify(newBrand)) }
    } catch (error) {
        return { success: false, message: formatError(error) }
    }
}

export async function quickCreateUnit(name: string, storeId: string) {
    try {
        await connectToDatabase()
        const abbreviation = name.substring(0, 3).toLowerCase()

        // Check if exists
        const existing = await Unit.findOne({
            $and: [
                {
                    $or: [
                        { name },
                        { abbreviation }
                    ]
                },
                {
                    $or: [
                        { isGlobal: true },
                        { storeId }
                    ]
                }
            ]
        })

        if (existing) return { success: true, item: JSON.parse(JSON.stringify(existing)) }

        const newUnit = await Unit.create({
            name,
            abbreviation,
            industry: 'general',
            storeId,
            isApproved: false,
            isGlobal: false,
            status: true
        })

        revalidatePath('/admin/[store]/inventory/units', 'page')
        return { success: true, item: JSON.parse(JSON.stringify(newUnit)) }
    } catch (error) {
        return { success: false, message: formatError(error) }
    }
}

export async function quickCreateSubCategory(name: string, categoryId: string, storeId: string) {
    try {
        await connectToDatabase()
        const industry = await getCompanyIndustry()
        const slug = toSlug(name)
        const code = name.substring(0, 3).toUpperCase()

        // Check if exists
        const existing = await SubCategory.findOne({
            name,
            parentCategory: categoryId,
            $or: [
                { isGlobal: true },
                { storeId }
            ]
        })

        if (existing) return { success: true, item: JSON.parse(JSON.stringify(existing)) }

        const newSub = await SubCategory.create({
            name,
            slug,
            parentCategory: categoryId,
            code,
            industry,
            storeId,
            isApproved: false,
            isGlobal: false,
            status: true
        })

        revalidatePath('/admin/[store]/inventory/sub-categories', 'page')
        return { success: true, item: JSON.parse(JSON.stringify(newSub)) }
    } catch (error) {
        return { success: false, message: formatError(error) }
    }
}
