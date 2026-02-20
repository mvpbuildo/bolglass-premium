'use client';

import { useState } from 'react';
import { GalleryItem } from '@/types/gallery';
import Image from 'next/image';
import { VideoIcon, ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface GalleryHomeGridProps {
    items: GalleryItem[];
}

export default function GalleryHomeGrid({ items }: GalleryHomeGridProps) {
    const t = useTranslations('Gallery');
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        onClick={() => openLightbox(index)}
                        className="group relative rounded-2xl overflow-hidden glass-card shadow-sm border border-orange-100/20 aspect-video cursor-pointer"
                    >
                        {item.type === 'VIDEO' ? (
                            <video
                                src={item.url}
                                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105 bg-black/5"
                                muted
                                loop
                                playsInline
                                autoPlay
                            />
                        ) : (
                            <Image
                                src={item.url}
                                alt={item.title || ''}
                                fill
                                className="object-contain transition-transform duration-700 group-hover:scale-105 bg-black/5"
                            />
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                            <p className="text-white font-medium text-sm md:text-base">{item.title || t('defaultTitle')}</p>
                            {item.description && (
                                <p className="text-white/60 text-[10px] md:text-xs mt-1 line-clamp-2">{item.description}</p>
                            )}
                            <div className="flex items-center gap-1.5 mt-2 text-orange-400">
                                {item.type === 'VIDEO' ? <VideoIcon className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                                <span className="text-[10px] uppercase font-bold tracking-tighter">{item.type}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            {selectedItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl">
                    <button
                        onClick={closeLightbox}
                        className="absolute top-6 right-6 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white z-[110]"
                        aria-label={t('close')}
                    >
                        <X className="w-8 h-8" />
                    </button>

                    <button
                        onClick={prevMedia}
                        className="absolute left-6 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white z-[110]"
                        aria-label={t('prev')}
                    >
                        <ChevronLeft className="w-10 h-10" />
                    </button>

                    <button
                        onClick={nextMedia}
                        className="absolute right-6 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white z-[110]"
                        aria-label={t('next')}
                    >
                        <ChevronRight className="w-10 h-10" />
                    </button>

                    <div className="relative w-full h-full max-w-6xl max-h-[85vh] px-4 flex flex-col items-center justify-center">
                        <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-2xl border border-white/5">
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
                            <div className="mt-8 text-center max-w-2xl px-4 text-white">
                                <h2 className="text-3xl font-serif text-amber-100">{selectedItem.title}</h2>
                                {selectedItem.description && (
                                    <p className="mt-2 text-white/60 text-lg">{selectedItem.description}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
