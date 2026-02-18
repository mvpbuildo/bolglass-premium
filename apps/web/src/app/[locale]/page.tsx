import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import ProductionProcess from '@/components/ProductionProcess';
import BookingCalendar from '@/components/BookingCalendar';
import BaubleConfigurator from '@/components/BaubleConfigurator';
import ContactSection from '@/components/ContactSection';
import GallerySection from '@/components/GallerySection';
import { Button } from '@bolglass/ui';

export default function HomePage() {
    const t = useTranslations();

    return (
        <>
            <main className="flex min-h-screen flex-col items-center justify-between px-4 py-20 lg:p-24 relative overflow-hidden">
                {/* Navbar is now global in layout.tsx */}

                {/* Background Image */}
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat blur-[3px]"
                    style={{ backgroundImage: "url('/hero-background.png')" }}
                />
                <div className="absolute inset-0 z-0 bg-black/70" /> {/* Dark overlay separately to avoid blur */}

                <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
                    <div className="flex flex-col items-start gap-4">
                        {/* Logo removed from Hero section as requested */}
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-amber-500">
                            {t('HomePage.title')}
                        </h1>
                    </div>
                    <div className="mt-64 max-w-3xl">
                        <h2 className="text-3xl font-semibold text-white drop-shadow-lg">{t('HomePage.hero.headline')}</h2>
                        <div className="mt-8">
                            <Link href="/sklep">
                                <Button size="lg" className="rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                                    {t('HomePage.hero.cta')}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 animate-bounce text-gray-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </main>
            <GallerySection />
            <ProductionProcess />
            <div id="booking">
                <BookingCalendar />
            </div>

            <div id="studio-3d">
                <BaubleConfigurator />
            </div>

            <ContactSection />
        </>
    );
}
