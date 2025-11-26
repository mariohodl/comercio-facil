'use server'

import { connectToDatabase } from '@/lib/db'
import Unit, { IUnit } from '@/lib/db/models/unit.model'
import { revalidatePath } from 'next/cache'
import { formatError } from '../utils'
import { z } from 'zod'

import { UnitInputSchema, UnitUpdateSchema } from '@/lib/validator'

const PAGE_SIZE = 10

// GET ALL UNITS
export async function getAllUnits({
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

    const units = await Unit.find({
        ...queryFilter,
        ...statusFilter,
    })
        .sort(sortOrder)
        .skip(limit * (Number(page) - 1))
        .limit(limit)
        .lean()

    const countUnits = await Unit.countDocuments({
        ...queryFilter,
        ...statusFilter,
    })

    return {
        units: JSON.parse(JSON.stringify(units)) as IUnit[],
        totalPages: Math.ceil(countUnits / limit),
        totalUnits: countUnits,
    }
}

// GET UNIT BY ID
export async function getUnitById(unitId: string) {
    await connectToDatabase()
    const unit = await Unit.findById(unitId)
    return JSON.parse(JSON.stringify(unit)) as IUnit
}

// CREATE UNIT
export async function createUnit(data: z.infer<typeof UnitInputSchema>) {
    try {
        const unit = UnitInputSchema.parse(data)
        await connectToDatabase()

        // Check if name or abbreviation already exists
        const existingUnit = await Unit.findOne({
            $or: [{ name: unit.name }, { abbreviation: unit.abbreviation }]
        })
        if (existingUnit) {
            return {
                success: false,
                message: 'Unit name or abbreviation already exists',
            }
        }

        await Unit.create(unit)
        revalidatePath('/admin/[store]/inventory/units', 'page')
        return {
            success: true,
            message: 'Unit created successfully',
        }
    } catch (error) {
        return { success: false, message: formatError(error) }
    }
}

// UPDATE UNIT
export async function updateUnit(data: z.infer<typeof UnitUpdateSchema>) {
    try {
        const unit = UnitUpdateSchema.parse(data)
        await connectToDatabase()

        // Check if name or abbreviation already exists (excluding current unit)
        const existingUnit = await Unit.findOne({
            $and: [
                { _id: { $ne: unit._id } },
                { $or: [{ name: unit.name }, { abbreviation: unit.abbreviation }] }
            ]
        })
        if (existingUnit) {
            return {
                success: false,
                message: 'Unit name or abbreviation already exists',
            }
        }

        await Unit.findByIdAndUpdate(unit._id, unit)
        revalidatePath('/admin/[store]/inventory/units', 'page')
        return {
            success: true,
            message: 'Unit updated successfully',
        }
    } catch (error) {
        return { success: false, message: formatError(error) }
    }
}

// DELETE UNIT
export async function deleteUnit(id: string) {
    try {
        await connectToDatabase()
        const res = await Unit.findByIdAndDelete(id)
        if (!res) throw new Error('Unit not found')
        revalidatePath('/admin/[store]/inventory/units', 'page')
        return {
            success: true,
            message: 'Unit deleted successfully',
        }
    } catch (error) {
        return { success: false, message: formatError(error) }
    }
}

// GET ACTIVE UNITS (for dropdowns/selects)
export async function getActiveUnits() {
    await connectToDatabase()
    const units = await Unit.find({ status: true })
        .select('name abbreviation')
        .sort({ name: 1 })
        .lean()
    return JSON.parse(JSON.stringify(units)) as IUnit[]
}
