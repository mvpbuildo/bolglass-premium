import { useTranslations } from 'next-intl';

export default function AboutPage() {
    const t = useTranslations('AboutPage');

    return (
        <main className="min-h-screen relative flex items-start justify-center pt-24 lg:pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/onas_tlo.png')" }}
            />
            <div className="absolute inset-0 z-0 bg-black/60" /> {/* Overlay for readability */}

            <div className="relative z-10 max-w-4xl mx-auto text-center">
                <div className="text-xl md:text-2xl text-gray-100 space-y-8 leading-relaxed font-light drop-shadow-md">
                    <p>{t('p1')}</p>
                    <p>{t('p2')}</p>
                    <p>{t('p3')}</p>
                </div>
            </div>
        </main>
    );
}
