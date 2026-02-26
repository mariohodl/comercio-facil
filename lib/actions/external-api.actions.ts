'use server'

/**
 * Supported Barcode API Providers
 */
export type BarcodeProvider = 'openfoodfacts' | 'barcodelookup'

/**
 * Normalized product data used to pre-fill the form
 */
export interface NormalizedProduct {
    name?: string
    brand?: string
    category?: string
    subCategory?: string
    description?: string
    image?: string
    barcode: string
    quantity?: string
    unit?: string
    weight?: number
    source: BarcodeProvider
    keywords?: string[]
}

/**
 * Normalizes Open Food Facts response to our internal format
 */
function normalizeOpenFoodFacts(data: any): NormalizedProduct | null {
    if (data.status !== 1 || !data.product) return null

    const p = data.product

    // Extract unit from quantity string if possible (e.g. "600 ml" -> "ml")
    let extractedUnit = p.product_quantity_unit || p.quantity_unit
    if (!extractedUnit && p.quantity) {
        const match = p.quantity.match(/[a-zA-Z]+$/)
        if (match) extractedUnit = match[0].toLowerCase()
    }

    return {
        name: p.product_name_es || p.product_name || p.generic_name || p.product_name_en,
        brand: p.brands?.split(',')[0]?.trim(),
        category: p.categories?.split(',')[0]?.trim(),
        description: p.ingredients_text_es || p.ingredients_text || p.description || p.generic_name_es,
        image: p.image_url || p.image_front_url || p.image_front_small_url,
        barcode: data.code,
        quantity: p.quantity,
        unit: extractedUnit,
        weight: p.product_quantity || p.quantity_value,
        source: 'openfoodfacts',
        keywords: p._keywords
    }
}

/**
 * Normalizes Barcode Lookup response to our internal format
 */
function normalizeBarcodeLookup(data: any): NormalizedProduct | null {
    if (!data.products || data.products.length === 0) return null

    const p = data.products[0]
    return {
        name: p.title || p.product_name,
        brand: p.brand,
        category: p.category?.split(' > ').pop(), // Get the most specific category
        description: p.description,
        image: p.images?.[0],
        barcode: p.barcode_number,
        source: 'barcodelookup'
    }
}

import { extractProductClassificationWithAI } from './ai.actions'

/**
 * Fetch product information from Open Food Facts API
 */
export async function getProductFromOpenFoodFacts(barcode: string) {
    const logPrefix = `[OFF-API][${new Date().toISOString()}]`;
    console.log(`${logPrefix} Fetching barcode: "${barcode}"`)

    try {
        const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000)

        const response = await fetch(url, {
            headers: { 'User-Agent': 'ComercioFacilApp/1.0 (https://comerciofacil.com)' },
            signal: controller.signal,
            cache: 'no-store'
        }).finally(() => clearTimeout(timeoutId))

        if (!response.ok) return null

        const data = await response.json()
        const normalized = normalizeOpenFoodFacts(data)

        if (normalized) {
            console.log(`${logPrefix} Found: ${normalized.name}`)

            // Refine category and subcategory using Gemini AI
            if (data.product?.categories || normalized.keywords) {
                console.log(`${logPrefix} Requesting AI classification refinement...`)
                const refinement = await extractProductClassificationWithAI(
                    data.product?.categories || '',
                    normalized.name || '',
                    normalized.description || '',
                    normalized.keywords
                )

                if (refinement) {
                    console.log(`${logPrefix} AI Refined Name: ${refinement.name}`)
                    console.log(`${logPrefix} AI Refined Category: ${refinement.category}`)
                    console.log(`${logPrefix} AI Refined Subcategory: ${refinement.subCategory}`)
                    normalized.name = refinement.name
                    normalized.category = refinement.category
                    normalized.subCategory = refinement.subCategory
                }
            }
        }

        return { ...normalized, data }
    } catch (error: any) {
        console.error(`${logPrefix} EXCEPTION:`, error.message || error)
        return null
    }
}

/**
 * Fetch product information from Barcode Lookup API
 */
export async function getProductFromBarcodeLookup(barcode: string): Promise<NormalizedProduct | null> {
    const apiKey = process.env.BARCODELOOKUP_API_KEY
    if (!apiKey) return null

    const logPrefix = `[BarcodeLookup][${new Date().toISOString()}]`;
    console.log(`${logPrefix} Fetching barcode: "${barcode}"`)

    try {
        const url = `https://api.barcodelookup.com/v3/products?barcode=${barcode}&key=${apiKey}`
        const response = await fetch(url, { cache: 'no-store' })
        if (!response.ok) return null

        const data = await response.json()
        console.log(` Raw JSON:`, JSON.stringify(data))
        const normalized = normalizeBarcodeLookup(data)

        if (normalized) {
            7501017005024

            console.log(`${logPrefix} Found: ${normalized.name}`)
            console.log(`${logPrefix} Raw JSON:`, JSON.stringify(data, null, 2))
        }

        return normalized
    } catch (error: any) {
        console.error(`${logPrefix} EXCEPTION:`, error.message || error)
        return null
    }
}

/**
 * Main switchable function to get product info
 */
export async function getProductInfoByBarcode(barcode: string, provider?: BarcodeProvider) {
    const activeProvider = provider || (process.env.BARCODE_API_PROVIDER as BarcodeProvider) || 'openfoodfacts'

    if (activeProvider === 'barcodelookup') {
        const result = await getProductFromBarcodeLookup(barcode)
        if (result) return result
        // Fallback to OFF if lookup fails
        return getProductFromOpenFoodFacts(barcode)
    }

    return getProductFromOpenFoodFacts(barcode)
}
