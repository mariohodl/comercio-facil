'use server'

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
