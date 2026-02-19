import { MetadataRoute } from 'next';
import { prisma } from '@bolglass/database';

const locales = ['pl', 'en', 'de'];
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://test.bolann.cloud';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const products = await prisma.product.findMany({
        where: {
            stock: { gt: 0 } // Optional: only show in-stock products? Or all. Let's show all for SEO.
        },
        select: {
            slug: true,
            updatedAt: true
        }
    });

    const staticRoutes = [
        '',
        '/o-nas',
        '/kontakt',
        '/sklep',
        '/galeria'
    ];

    const sitemapEntries: MetadataRoute.Sitemap = [];

    for (const locale of locales) {
        // Static Routes
        for (const route of staticRoutes) {
            sitemapEntries.push({
                url: `${baseUrl}/${locale}${route}`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: route === '' ? 1 : 0.8
            });
        }

        // Dynamic Products
        for (const product of products) {
            sitemapEntries.push({
                url: `${baseUrl}/${locale}/sklep/produkt/${product.slug}`,
                lastModified: product.updatedAt,
                changeFrequency: 'weekly',
                priority: 0.6
            });
        }
    }

    return sitemapEntries;
}
