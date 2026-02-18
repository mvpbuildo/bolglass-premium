import { useTranslations } from 'next-intl';

export default function AboutPage() {
    const t = useTranslations('AboutPage');

    return (
        <main className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-8">
                    {t('title')}
                </h1>
                <div className="text-lg text-gray-700 space-y-6 leading-relaxed">
                    <p>{t('p1')}</p>
                    <p>{t('p2')}</p>
                    <p>{t('p3')}</p>
                </div>
            </div>
        </main>
    );
}
