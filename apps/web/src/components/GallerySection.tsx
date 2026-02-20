import { getHomeGalleryItems } from '@/app/[locale]/admin/gallery/actions';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import GalleryHomeGrid from './GalleryHomeGrid';
import { getTranslations } from 'next-intl/server';

export default async function GallerySection() {
    const t = await getTranslations('Gallery');
    const items = await getHomeGalleryItems();

    if (items.length === 0) return null;

    return (
        <section id="gallery" className="w-full py-24 bg-white relative overflow-hidden">
            {/* Artistic Background Elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-50" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-50 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 opacity-30" />

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="space-y-4">
                        <h2 className="text-4xl md:text-5xl font-serif text-gray-900">
                            {t('magicOfCreation').split(' ')[0]} <span className="text-orange-600 italic">{t('magicOfCreation').split(' ')[1]}</span>
                        </h2>
                        <div className="w-20 h-1.5 bg-orange-600 rounded-full" />
                        <p className="text-gray-500 max-w-xl text-lg">
                            {t('subtitle')}
                        </p>
                    </div>
                    <Link
                        href="/galeria"
                        className="group flex items-center gap-3 text-orange-600 font-bold uppercase tracking-widest hover:text-orange-700 transition-colors"
                    >
                        {t('viewAll')}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </Link>
                </div>

                <GalleryHomeGrid items={items} />
            </div>
        </section>
    );
}
