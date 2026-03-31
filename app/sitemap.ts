import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://comerciofacil.com'

    // Static routes that should be indexed
    const routes = [
        '',
        '/sign-up', // Only sign-up might be relevant for lead gen
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    // Future: Here you would fetch public products/stores from DB
    // const stores = await getAllPublicStores()
    // const storeRoutes = stores.map((store) => ({ ... }))

    return [
        ...routes,
        // ...storeRoutes
    ]
}
