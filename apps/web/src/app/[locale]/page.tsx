import { useTranslations } from 'next-intl';
import ProductionProcess from '@/components/ProductionProcess';
import BookingCalendar from '@/components/BookingCalendar';
import BaubleConfigurator from '@/components/BaubleConfigurator';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Button } from '@bolglass/ui';

import Image from "next/image";

export default function HomePage() {
    const t = useTranslations('HomePage');

    return (
        <>
            <main className="flex min-h-screen flex-col items-center justify-between p-24 relative overflow-hidden">
                {/* Top Navigation */}
                <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-12 py-6">
                    <div className="text-xl font-bold text-white tracking-widest uppercase">Bolglass</div>
                    <div className="hidden xl:flex gap-6 text-xs font-medium text-white/90 uppercase tracking-widest">
                        <a href="#about" className="hover:text-white transition-colors">{t('nav.about')}</a>
                        {/* Changed href from #production to #production to match, keeping #production anchor for Manufaktura */}
                        <a href="#production" className="hover:text-white transition-colors">{t('nav.manufactory')}</a>
                        <a href="#offer" className="hover:text-white transition-colors">{t('nav.offer')}</a>
                        <a href="#booking" className="hover:text-white transition-colors">{t('nav.workshops')}</a>
                        <a href="#studio-3d" className="hover:text-white transition-colors">{t('nav.studio3d')}</a>
                        <a href="#shop" className="hover:text-white transition-colors">{t('nav.shop')}</a>
                        <a href="#b2b" className="hover:text-white transition-colors">{t('nav.b2b')}</a>
                        <a href="#contact" className="hover:text-white transition-colors">{t('nav.contact')}</a>
                    </div>
                    <LanguageSwitcher />
                </nav>

                {/* Background Image */}
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat blur-[3px]"
                    style={{ backgroundImage: "url('/hero-background.png')" }}
                />
                <div className="absolute inset-0 z-0 bg-black/70" /> {/* Dark overlay separately to avoid blur */}

                <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
                    <div className="flex flex-col items-start gap-4">
                        <div className="w-40 h-40 rounded-full overflow-hidden flex items-center justify-center shadow-2xl">
                            <Image
                                src="/logo.png"
                                alt="Bolglass Logo"
                                width={160}
                                height={160}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-amber-500">
                            {t('title')}
                        </h1>
                    </div>
                    <div className="mt-8 max-w-2xl">
                        <h2 className="text-3xl font-semibold text-white drop-shadow-lg">{t('hero.headline')}</h2>
                        <p className="mt-6 text-lg text-gray-100 drop-shadow-md leading-relaxed">{t('hero.subheadline')}</p>
                        <div className="mt-6">
                            <Button size="lg" variant="primary" className="rounded-full">
                                {t('hero.cta')}
                            </Button>
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
            <ProductionProcess />
            <div id="booking">
                <BookingCalendar />
            </div>

            <div id="studio-3d">
                <BaubleConfigurator />
            </div>
        </>
    );
}
