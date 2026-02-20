'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@bolglass/ui';

export default function ConfiguratorBanner() {
    const t = useTranslations('Shop');

    return (
        <div className="relative w-full h-[600px] overflow-hidden rounded-[40px] border border-white/5 group shadow-2xl">
            {/* Background Image */}
            <Image
                src="/promo/configurator-cta.png"
                alt="3D Configurator"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                priority
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

            {/* Content Container */}
            <div className="relative h-full flex flex-col justify-center px-12 md:px-20 max-w-2xl space-y-6">
                <div className="space-y-2 animate-in slide-in-from-left duration-700">
                    <span className="flex items-center gap-2 text-amber-500 text-xs font-black uppercase tracking-[0.4em]">
                        <Sparkles className="w-4 h-4" />
                        {t('promoTitle')}
                    </span>
                    <h2 className="text-4xl md:text-6xl font-serif text-white leading-tight">
                        {t('promoSubtitle')}
                    </h2>
                </div>

                <p className="text-lg text-amber-100/60 font-light leading-relaxed max-w-md">
                    {t('promoDescription')}
                </p>

                <div className="pt-4 flex flex-col sm:flex-row gap-4">
                    <Link href="/#studio-3d">
                        <Button
                            className="bg-amber-500 hover:bg-amber-600 text-black font-black px-10 py-7 text-sm rounded-full tracking-widest uppercase transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(245,158,11,0.3)] flex gap-3 items-center"
                        >
                            {t('promoCTA')}
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 p-8">
                <div className="w-24 h-px bg-gradient-to-l from-amber-500/50 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 p-8">
                <div className="w-48 h-px bg-gradient-to-r from-amber-500/20 to-transparent" />
            </div>
        </div>
    );
}
