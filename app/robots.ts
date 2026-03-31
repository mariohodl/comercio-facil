import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://comerciofacil.com'

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/super-admin/',
                    '/api/',
                    '/checkout/',
                    '/account/',
                    '/verify-email',
                    '/admin/setup',
                    '/*?*', // Block tracking parameters to avoid duplicate content
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
