'use server'

import { connectToDatabase } from '@/lib/db'
import AICache from '@/lib/db/models/ai-cache.model'


export async function getSuggestedSubCategories(categoryName: string, industry: string = 'general') {
    try {
        // Try Google Gemini (free)
        const googleKey = process.env.GOOGLE_API_KEY
        if (googleKey) {
            try {
                // Discover available models
                const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${googleKey}`)

                if (!listResponse.ok) {
                    const errorText = await listResponse.text() // Keep error logging
                    console.error('[AI Action] Failed to list models:', listResponse.status, errorText)
                } else {
                    const listData = await listResponse.json()
                    const models = listData.models || []

                    // Filter for models that support generating content
                    const validModels = models.filter((m: any) =>
                        m.supportedGenerationMethods?.includes('generateContent') &&
                        m.name.toLowerCase().includes('gemini')
                    )

                    // Define optimized preference order: 1.5 Flash (most stable free tier) -> 2.0 Flash -> Pro
                    const preferredOrder = [
                        'gemini-1.5-flash',
                        'gemini-2.0-flash',
                        'gemini-1.5-pro',
                        'gemini-pro'
                    ]

                    // Sort valid models based on preference, or keep them if not in preference list
                    const candidates = validModels.sort((a: any, b: any) => {
                        const indexA = preferredOrder.findIndex(p => a.name.includes(p))
                        const indexB = preferredOrder.findIndex(p => b.name.includes(p))
                        // If both are in preference list, lower index wins
                        if (indexA !== -1 && indexB !== -1) return indexA - indexB
                        // If only A is in list, A wins
                        if (indexA !== -1) return -1
                        // If only B is in list, B wins
                        if (indexB !== -1) return 1
                        return 0
                    })

                    for (const model of candidates) {
                        const modelName = model.name
                        try {
                            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${googleKey}`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    contents: [{
                                        parts: [{
                                            text: `Propose 10 relevant subcategories for the main category "${categoryName}" in the "${industry}" industry. Return a valid JSON array of strings only. Example: ["Sub1", "Sub2"]. Do not include markdown formatting or 'json' tags.`
                                        }]
                                    }]
                                })
                            })

                            if (response.ok) {
                                const data = await response.json()
                                const text = data.candidates?.[0]?.content?.parts?.[0]?.text

                                if (text) {
                                    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim()
                                    const parsed = JSON.parse(cleanText)
                                    if (Array.isArray(parsed) && parsed.length > 0) {
                                        return parsed
                                    }
                                }
                            } else {
                                const errorText = await response.text()
                                console.warn(`[AI Action] Failed with ${modelName}:`, errorText.substring(0, 200))
                            }
                        } catch (e) {
                            console.error(`[AI Action] Error trying ${modelName}:`, e)
                        }
                    }
                }
            } catch (e) {
                console.error('[AI Action] Gemini Discovery Exception:', e)
            }
        } else {
            // No Google Key logic moved here if needed or removed if empty
        }

        // Try OpenAI (Prepaid)
        const openAiKey = process.env.OPENAI_API_KEY
        if (openAiKey) {
            const prompt = `Propose 10 relevant subcategories for the main category "${categoryName}" in the "${industry}" industry. Return ONLY a JSON array of strings.`
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openAiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: 'You are a helpful assistant. Return ONLY a JSON array of strings.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.7,
                }),
            })

            if (response.ok) {
                const data = await response.json()
                const content = data.choices[0]?.message?.content
                if (content) {
                    const parsed = JSON.parse(content)
                    if (Array.isArray(parsed) && parsed.length > 0) return parsed
                }
            } else {
                const err = await response.text()
                console.error('OpenAI API Error:', err)
            }
        }


        return []

    } catch (error) {
        console.error('Error fetching suggested subcategories:', error)
        return []
    }
}

export async function extractProductClassificationWithAI(categoriesText: string, productName: string, description?: string, keywords?: string[]) {
    if (!categoriesText && !productName && (!keywords || keywords.length === 0)) return null

    // Normalize input to create a consistent cache key
    const normalizedKey = `${productName}|${categoriesText}|${(keywords || []).sort().join(',')}`.toLowerCase()

    try {
        await connectToDatabase()

        // 1. Check Cache First
        const cached = await AICache.findOne({ key: normalizedKey, type: 'classification_refinement' })
        if (cached) {
            try {
                const parsed = JSON.parse(cached.value)
                if (parsed.salesUnit || parsed.unit) { // Support both names just in case
                    console.log(`[AI Cache] HIT for key: ${normalizedKey.substring(0, 50)}...`)
                    AICache.updateOne({ _id: cached._id }, { $inc: { hits: 1 } }).catch(e => console.error('Error updating cache hits:', e))
                    return parsed as { name: string, category: string, subCategory: string, salesUnit: string }
                }
                console.log(`[AI Cache] INCOMPLETE (Missing salesUnit) for key: ${normalizedKey.substring(0, 50)}... RE-CLASSIFYING`)
            } catch (e) {
                console.error('Error parsing cached classification JSON:', e)
            }
        }

        console.log(`[AI Cache] MISS for key: ${normalizedKey.substring(0, 50)}...`)

        const googleKey = process.env.GOOGLE_API_KEY
        let extractedJSON: string | null = null
        let usedModel: string | null = null

        if (googleKey) {
            const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${googleKey}`)
            if (listResponse.ok) {
                const listData = await listResponse.json()
                const models = (listData.models || []).filter((m: any) =>
                    m.supportedGenerationMethods?.includes('generateContent') &&
                    m.name.toLowerCase().includes('gemini')
                )

                const model = models.find((m: any) => m.name.includes('gemini-1.5-flash')) || models[0]

                if (model) {
                    usedModel = model.name
                    const prompt = `
                        As an expert in Mexican retail and "tienditas de abarrotes", classify this product into a concise Category and a specific Subcategory.
                        Also, improve the product name if it's too short, generic, or incomplete (e.g., "Integral" -> "Pan Integral Bimbo").
                        
                        Original Name: "${productName}"
                        Description: "${description || 'No description available'}"
                        Keywords: "${keywords?.join(', ') || 'No keywords available'}"
                        Raw Categories from API: "${categoriesText}"
                        
                        Requirements:
                        - Use Mexican Spanish terminology (e.g., "Abarrotes", "Carnes y Embutidos", "Lácteos", "Limpieza", "Cuidado Personal", "Botanas", "Refrescos").
                        - The Category should be broad but concise.
                        - Create a descriptive and professional name for the product.
                        - SALES UNIT: Differentiate between "Net Content" (e.g., 220g) and "How it is sold". 
                          Most sealed/packaged products are sold as "Pieza" (Piece). 
                          Only suggest "Kilogramo", "Litro", or "Gramo" if the product is typically sold in bulk (granel) or by weight/volume measurement in a Mexican "tiendita".
                        - IMPORTANT: Return ONLY a JSON object: {"name": "...", "category": "...", "subCategory": "...", "salesUnit": "..."}
                    `.trim()

                    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${model.name}:generateContent?key=${googleKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{
                                parts: [{ text: prompt }]
                            }]
                        })
                    })

                    if (response.ok) {
                        const data = await response.json()
                        const text = data.candidates?.[0]?.content?.parts?.[0]?.text
                        if (text) {
                            // Robust JSON extraction
                            const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim()
                            const startIdx = cleanJson.indexOf('{')
                            const endIdx = cleanJson.lastIndexOf('}')

                            if (startIdx !== -1 && endIdx !== -1) {
                                extractedJSON = cleanJson.substring(startIdx, endIdx + 1)
                            } else {
                                extractedJSON = cleanJson
                            }
                        }
                    }
                }
            }
        }

        let result = { name: productName, category: '', subCategory: '', salesUnit: '' }
        if (extractedJSON) {
            try {
                const parsed = JSON.parse(extractedJSON)
                result = {
                    name: parsed.name || productName,
                    category: parsed.category || '',
                    subCategory: parsed.subCategory || '',
                    salesUnit: parsed.salesUnit || ''
                }
            } catch (e) { }
        }

        if (!result.category) {
            result.category = categoriesText.split(',')[0]?.trim() || 'General'
        }
        if (!result.subCategory) {
            result.subCategory = categoriesText.split(',').pop()?.trim() || 'General'
        }

        // 2. Save to Cache
        try {
            await AICache.findOneAndUpdate(
                { key: normalizedKey, type: 'classification_refinement' },
                {
                    value: JSON.stringify(result),
                    type: 'classification_refinement',
                    modelName: usedModel || 'fallback',
                    inputContext: `${productName} | ${description} | ${keywords?.join(',')}`.substring(0, 500),
                    $inc: { hits: 0 }
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            )
            console.log(`[AI Cache] SAVE SUCCESS for key: ${normalizedKey.substring(0, 50)}...`)
        } catch (saveError) {
            console.error('[AI Cache] SAVE FAILED:', saveError)
        }

        return result
    } catch (e) {
        console.error('[AI Action] Error extracting classification:', e)
        const parts = categoriesText.split(',')
        return {
            name: productName,
            category: parts[0]?.trim() || 'General',
            subCategory: parts.pop()?.trim() || 'General',
            salesUnit: ''
        }
    }
}
