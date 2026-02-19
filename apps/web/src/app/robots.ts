import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://test.bolann.cloud';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/admin/',
                '/debug/',
                '/api/',
                '/koszyk/',
                '/moje-konto/',
                '/unauthorized/',
                '/_next/'
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
