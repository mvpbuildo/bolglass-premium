import { getGalleryData } from '@/app/[locale]/admin/gallery/actions';
import GalleryLayout from '@/components/GalleryLayout';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

export default async function GalleryPage() {
    const { items, albums } = await getGalleryData();
    const t = await getTranslations('Gallery');

    return (
        <main className="min-h-screen bg-[#060606] pt-32 pb-20 overflow-hidden relative">
            {/* Cinematic Hero Background */}
            <div className="fixed inset-0 z-0">
                <Image
                    src="/images/magia-tworzenia.png"
                    alt="Manufaktura Bolglass Background"
                    fill
                    className="object-cover opacity-60 scale-105"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#060606] via-[#060606]/40 to-[#060606]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="text-center mb-16 space-y-6">
                    <span className="text-amber-500 text-xs font-black uppercase tracking-[0.5em] block animate-in fade-in slide-in-from-top-4 duration-1000">
                        {t('badge')}
                    </span>
                    <h1 className="text-6xl md:text-8xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-amber-50 via-amber-200 to-amber-500 drop-shadow-[0_10px_30px_rgba(245,158,11,0.3)] animate-in fade-in zoom-in-95 duration-1000">
                        {t('title')}
                    </h1>
                    <p className="text-amber-200/40 max-w-2xl mx-auto text-lg font-light tracking-widest uppercase italic animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                        {t('subtitle')}
                    </p>
                    <div className="w-32 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent mx-auto pt-4" />
                </div>

                {items.length === 0 && albums.length === 0 ? (
                    <div className="py-20 text-center animate-in fade-in duration-1000 delay-500">
                        <p className="text-amber-200/40 text-xl font-serif italic">{t('empty')}</p>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                        <GalleryLayout items={items} albums={albums} />
                    </div>
                )}
            </div>

            {/* Ambient Lighting Decorations */}
            <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 blur-[150px] rounded-full pointer-events-none z-0" />
            <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-red-900/10 blur-[150px] rounded-full pointer-events-none z-0" />

            {/* Fine decoration lines */}
            <div className="fixed bottom-10 left-10 w-24 h-24 border-l border-b border-amber-500/10 pointer-events-none" />
            <div className="fixed top-32 right-10 w-24 h-24 border-r border-t border-amber-500/10 pointer-events-none" />
        </main>
    );
}
