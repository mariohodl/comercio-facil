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
    storeId,
}: {
    query?: string
    page?: number
    limit?: number
    status?: string
    sort?: string
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

    const sortOrder: any = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 }

    const units = await Unit.find({
        ...queryFilter,
        ...statusFilter,
        ...(storeId ? { storeId } : {}),
    })
        .sort(sortOrder)
        .skip(limit * (Number(page) - 1))
        .limit(limit)
        .lean()

    const countUnits = await Unit.countDocuments({
        ...queryFilter,
        ...statusFilter,
        ...(storeId ? { storeId } : {}),
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

        // Check if name or abbreviation already exists for this store
        const existingUnit = await Unit.findOne({
            storeId: unit.storeId,
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
                { storeId: unit.storeId },
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
export async function getActiveUnits(storeId?: string) {
    await connectToDatabase()

    // Use aggregation to deduplicate by name while keeping one ID
    const units = await Unit.aggregate([
        {
            $match: {
                status: true,
                ...(storeId ? { $or: [{ storeId }, { isGlobal: true }] } : { isGlobal: true })
            }
        },
        {
            $group: {
                _id: "$name",
                docId: { $first: "$_id" },
                name: { $first: "$name" },
                abbreviation: { $first: "$abbreviation" }
            }
        },
        { $sort: { name: 1 } }
    ]);

    return units.map(u => ({
        _id: u.docId.toString(),
        name: u.name,
        abbreviation: u.abbreviation
    })) as any[]
}
