import { getGalleryItems } from '@/app/[locale]/admin/gallery/actions';
import GalleryGrid from '@/components/GalleryGrid';
import { GalleryItem } from '@/types/gallery';

export default async function GalleryPage() {
    const items = await getGalleryItems();

    return (
        <main className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 overflow-hidden relative">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 via-black to-black pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-5xl md:text-7xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-500 drop-shadow-2xl">
                        Magia Tworzenia
                    </h1>
                    <p className="text-amber-200/60 max-w-2xl mx-auto text-lg font-light tracking-wide uppercase">
                        Zajrzyj do wnętrza naszej manufaktury
                    </p>
                    <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto pt-4" />
                </div>

                {items.length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="text-amber-200/40 text-xl font-serif italic">Galeria jest aktualnie w przygotowaniu...</p>
                    </div>
                ) : (
                    <GalleryGrid items={items as GalleryItem[]} />
                )}
            </div>

            {/* Fine decoration */}
            <div className="fixed bottom-10 left-10 w-32 h-32 border-l border-b border-amber-500/20 pointer-events-none" />
            <div className="fixed top-32 right-10 w-32 h-32 border-r border-t border-amber-500/20 pointer-events-none" />
        </main>
    );
}
