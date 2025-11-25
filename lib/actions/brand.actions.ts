'use server'

import { connectToDatabase } from '@/lib/db'
import Brand, { IBrand } from '@/lib/db/models/brand.model'
import { revalidatePath } from 'next/cache'
import { formatError, toSlug } from '../utils'
import { BrandInputSchema, BrandUpdateSchema } from '../validator'
import { IBrandInput } from '@/types'
import { z } from 'zod'

const PAGE_SIZE = 10

// GET ALL BRANDS
export async function getAllBrands({
    query = '',
    page = 1,
    limit = PAGE_SIZE,
    status,
    sort = 'latest',
}: {
    query?: string
    page?: number
    limit?: number
    status?: string
    sort?: string
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

    const sortOrder: any = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 }

    const brands = await Brand.find({
        ...queryFilter,
        ...statusFilter,
    })
        .sort(sortOrder)
        .skip(limit * (Number(page) - 1))
        .limit(limit)
        .lean()

    const countBrands = await Brand.countDocuments({
        ...queryFilter,
        ...statusFilter,
    })

    return {
        brands: JSON.parse(JSON.stringify(brands)) as IBrand[],
        totalPages: Math.ceil(countBrands / limit),
        totalBrands: countBrands,
    }
}

// GET BRAND BY ID
export async function getBrandById(brandId: string) {
    await connectToDatabase()
    const brand = await Brand.findById(brandId)
    return JSON.parse(JSON.stringify(brand)) as IBrand
}

// CREATE BRAND
export async function createBrand(data: IBrandInput) {
    try {
        const brand = BrandInputSchema.parse(data)
        await connectToDatabase()

        const slug = toSlug(brand.name)

        // Check if slug already exists
        const existingBrand = await Brand.findOne({ slug })
        if (existingBrand) {
            return {
                success: false,
                message: 'Brand name already exists',
            }
        }

        await Brand.create({ ...brand, slug })
        revalidatePath('/admin/[store]/inventory/brands', 'page')
        return {
            success: true,
            message: 'Brand created successfully',
        }
    } catch (error) {
        return { success: false, message: formatError(error) }
    }
}

// UPDATE BRAND
export async function updateBrand(data: z.infer<typeof BrandUpdateSchema>) {
    try {
        const brand = BrandUpdateSchema.parse(data)
        await connectToDatabase()

        const slug = toSlug(brand.name)

        // Check if slug already exists (excluding current brand)
        const existingBrand = await Brand.findOne({
            slug,
            _id: { $ne: brand._id }
        })
        if (existingBrand) {
            return {
                success: false,
                message: 'Brand name already exists',
            }
        }

        await Brand.findByIdAndUpdate(brand._id, { ...brand, slug })
        revalidatePath('/admin/[store]/inventory/brands', 'page')
        return {
            success: true,
            message: 'Brand updated successfully',
        }
    } catch (error) {
        return { success: false, message: formatError(error) }
    }
}

// DELETE BRAND
export async function deleteBrand(id: string) {
    try {
        await connectToDatabase()
        const res = await Brand.findByIdAndDelete(id)
        if (!res) throw new Error('Brand not found')
        revalidatePath('/admin/[store]/inventory/brands', 'page')
        return {
            success: true,
            message: 'Brand deleted successfully',
        }
    } catch (error) {
        return { success: false, message: formatError(error) }
    }
}

// GET ACTIVE BRANDS (for dropdowns/selects)
export async function getActiveBrands() {
    await connectToDatabase()
    const brands = await Brand.find({ status: true })
        .select('name slug image')
        .sort({ name: 1 })
        .lean()
    return JSON.parse(JSON.stringify(brands)) as IBrand[]
}
