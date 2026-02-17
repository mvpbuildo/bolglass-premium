import { getGalleryItems } from '@/app/[locale]/admin/gallery/actions';
import { VideoIcon, ImageIcon, Maximize2 } from 'lucide-react';
import Image from 'next/image';
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {(items as GalleryItem[]).map((item) => (
                            <div
                                key={item.id}
                                className="group relative aspect-square md:aspect-video rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-500 hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] hover:-translate-y-2 cursor-pointer"
                            >
                                {item.type === 'VIDEO' ? (
                                    <div className="w-full h-full relative">
                                        <video
                                            src={item.url}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            muted
                                            loop
                                            playsInline
                                            autoPlay
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                                        <div className="absolute top-4 right-4 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white">
                                            <VideoIcon className="w-4 h-4" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full h-full relative">
                                        <Image
                                            src={item.url}
                                            alt={item.title || ''}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className="absolute top-4 right-4 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white">
                                            <ImageIcon className="w-4 h-4" />
                                        </div>
                                    </div>
                                )}

                                {/* Overlay Content */}
                                <div className="absolute inset-0 flex flex-col justify-end p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-4 rounded-xl">
                                        <h3 className="text-amber-100 font-serif text-xl">{item.title || 'Manufaktura Bolglass'}</h3>
                                        {item.description && <p className="text-amber-200/60 text-sm mt-1 line-clamp-2">{item.description}</p>}
                                        <div className="mt-4 flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-widest">
                                            <span>Powiększ</span>
                                            <Maximize2 className="w-3 h-3" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Fine decoration */}
            <div className="fixed bottom-10 left-10 w-32 h-32 border-l border-b border-amber-500/20 pointer-events-none" />
            <div className="fixed top-32 right-10 w-32 h-32 border-r border-t border-amber-500/20 pointer-events-none" />
        </main>
    );
}
