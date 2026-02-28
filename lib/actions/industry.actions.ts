'use server'

import { connectToDatabase } from '@/lib/db'
import Industry from '@/lib/db/models/industry.model'

const SEED_INDUSTRIES = [
    { name: 'General', slug: 'general' },
    { name: 'Abarrotes', slug: 'abarrotes' },
    { name: 'Farmacia', slug: 'farmacia' },
    { name: 'Ferretería', slug: 'ferreteria' },
    { name: 'Ropa y Calzado', slug: 'ropa' },
    { name: 'Tienda de Conveniencia', slug: 'tienda-de-conveniencia' },
    { name: 'Papelería', slug: 'papeleria' },
    { name: 'Cosméticos y Belleza', slug: 'cosmeticos' },
    { name: 'Electrónica y Computación', slug: 'electronica' },
    { name: 'Juguetería', slug: 'jugueteria' },
    { name: 'Librería', slug: 'libreria' },
    { name: 'Mascotas y Veterinaria', slug: 'mascotas' },
    { name: 'Artículos Deportivos', slug: 'deportes' },
    { name: 'Restaurante / Alimentos Preparados', slug: 'alimentos-preparados' },
    { name: 'Panadería y Pastelería', slug: 'panaderia' },
    { name: 'Carnicería', slug: 'carniceria' },
    { name: 'Frutas y Verduras', slug: 'frutas-verduras' },
    { name: 'Automotriz y Autopartes', slug: 'automotriz' },
    { name: 'Mueblería y Hogar', slug: 'muebleria' },
    { name: 'Tecnología y Gadgets', slug: 'tecnologia' },
    { name: 'Tienda de Regalos', slug: 'regalos' },
    { name: 'Joyería y Relojería', slug: 'joyeria' },
    { name: 'Salud y Bienestar', slug: 'salud' },
    { name: 'Flores y Plantas', slug: 'flores' },
    { name: 'Óptica', slug: 'optica' },
    { name: 'Pinturas y Decoración', slug: 'pinturas' },
    { name: 'Materiales de Construcción', slug: 'construccion' },
    { name: 'Vivero y Jardinería', slug: 'jardineria' },
    { name: 'Fotografía', slug: 'fotografia' },
    { name: 'Lavanderías y Tintorería', slug: 'lavanderia' },
    { name: 'Papelería y Suministros de Oficina', slug: 'suministros-oficina' },
]

// Seed all global industries into DB (idempotent)
export async function seedGlobalIndustries() {
    await connectToDatabase()
    let seeded = 0
    for (const ind of SEED_INDUSTRIES) {
        const exists = await Industry.findOne({ slug: ind.slug })
        if (!exists) {
            await Industry.create({ ...ind, isGlobal: true, isApproved: true, status: true })
            seeded++
        }
    }
    return { success: true, seeded }
}

// Get autocomplete suggestions (search by name)
export async function getIndustrySuggestions(query: string = '') {
    try {
        await connectToDatabase()

        // Ensure at least the global industries exist
        const count = await Industry.countDocuments({ isGlobal: true })
        if (count === 0) {
            await seedGlobalIndustries()
        }

        const regex = query.trim()
            ? new RegExp(query.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, ''), 'i')
            : null

        const filter: any = { status: true }
        if (regex) {
            filter.name = { $regex: regex }
        }

        const industries = await Industry.find(filter)
            .sort({ usageCount: -1, name: 1 })
            .limit(20)
            .lean()

        return {
            success: true,
            suggestions: JSON.parse(JSON.stringify(industries)) as Array<{
                _id: string; name: string; slug: string
            }>
        }
    } catch (error: any) {
        return { success: false, error: error.message, suggestions: [] }
    }
}

// Create or find a custom industry proposed by the user
export async function createOrFindIndustry(name: string): Promise<{ success: boolean; slug: string; name: string; error?: string }> {
    try {
        await connectToDatabase()
        const slug = name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')

        let industry = await Industry.findOne({
            $or: [{ slug }, { name: { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }]
        })

        if (!industry) {
            industry = await Industry.create({
                name: name.trim(),
                slug,
                isGlobal: false,
                isApproved: false,
                status: true,
            })
        }

        // Increment usage
        await Industry.findByIdAndUpdate(industry._id, { $inc: { usageCount: 1 } })

        return { success: true, slug: industry.slug, name: industry.name }
    } catch (error: any) {
        return { success: false, slug: '', name: '', error: error.message }
    }
}
