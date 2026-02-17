'use client';

import { useState } from 'react';
import { GalleryItem } from '@/types/gallery';
import Image from 'next/image';
import { VideoIcon, ImageIcon, Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface GalleryGridProps {
    items: GalleryItem[];
}

export default function GalleryGrid({ items }: GalleryGridProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const openLightbox = (index: number) => setSelectedIndex(index);
    const closeLightbox = () => setSelectedIndex(null);

    const nextMedia = () => {
        if (selectedIndex === null) return;
        setSelectedIndex((selectedIndex + 1) % items.length);
    };

    const prevMedia = () => {
        if (selectedIndex === null) return;
        setSelectedIndex((selectedIndex - 1 + items.length) % items.length);
    };

    const selectedItem = selectedIndex !== null ? items[selectedIndex] : null;

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        onClick={() => openLightbox(index)}
                        className="group relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-500 hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] hover:-translate-y-2 cursor-pointer"
                    >
                        {item.type === 'VIDEO' ? (
                            <div className="w-full h-full relative">
                                <video
                                    src={item.url}
                                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110 bg-black/20"
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
                                    className="object-contain transition-transform duration-700 group-hover:scale-110 bg-black/20"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="absolute top-4 right-4 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white">
                                    <ImageIcon className="w-4 h-4" />
                                </div>
                            </div>
                        )}

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

            {/* Lightbox */}
            {selectedItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl transition-all duration-300">
                    <button
                        onClick={closeLightbox}
                        className="absolute top-6 right-6 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors z-[110]"
                        aria-label="Zamknij"
                    >
                        <X className="w-8 h-8" />
                    </button>

                    <button
                        onClick={prevMedia}
                        className="absolute left-6 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors z-[110]"
                        aria-label="Poprzednie"
                    >
                        <ChevronLeft className="w-10 h-10" />
                    </button>

                    <button
                        onClick={nextMedia}
                        className="absolute right-6 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors z-[110]"
                        aria-label="Następne"
                    >
                        <ChevronRight className="w-10 h-10" />
                    </button>

                    <div className="relative w-full h-full max-w-6xl max-h-[85vh] px-4 flex flex-col items-center justify-center">
                        <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-2xl shadow-amber-500/10 border border-white/5">
                            {selectedItem.type === 'VIDEO' ? (
                                <video
                                    key={selectedItem.url}
                                    src={selectedItem.url}
                                    className="w-full h-full object-contain"
                                    controls
                                    autoPlay
                                    playsInline
                                />
                            ) : (
                                <Image
                                    src={selectedItem.url}
                                    alt={selectedItem.title || ''}
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            )}
                        </div>

                        {(selectedItem.title || selectedItem.description) && (
                            <div className="mt-8 text-center max-w-2xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-3xl font-serif text-amber-100">{selectedItem.title}</h2>
                                {selectedItem.description && (
                                    <p className="mt-2 text-amber-200/60 text-lg">{selectedItem.description}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
