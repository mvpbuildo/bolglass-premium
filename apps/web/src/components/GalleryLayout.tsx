'use client';

import { useState } from 'react';
import { GalleryItem, GalleryAlbum } from '@/types/gallery';
import Image from 'next/image';
import { VideoIcon, ImageIcon, Maximize2, X, ChevronLeft, ChevronRight, FolderIcon, ArrowLeft } from 'lucide-react';

interface GalleryLayoutProps {
    items: GalleryItem[];
    albums: GalleryAlbum[];
}

export default function GalleryLayout({ items, albums }: GalleryLayoutProps) {
    const [selectedAlbum, setSelectedAlbum] = useState<GalleryAlbum | null>(null);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const activeItems = selectedAlbum ? (selectedAlbum.items || []) : items;

    const openLightbox = (index: number) => setSelectedIndex(index);
    const closeLightbox = () => setSelectedIndex(null);

    const nextMedia = () => {
        if (selectedIndex === null) return;
        setSelectedIndex((selectedIndex + 1) % activeItems.length);
    };

    const prevMedia = () => {
        if (selectedIndex === null) return;
        setSelectedIndex((selectedIndex - 1 + activeItems.length) % activeItems.length);
    };

    const selectedItem = selectedIndex !== null ? activeItems[selectedIndex] : null;

    if (!selectedAlbum && albums.length > 0) {
        return (
            <div className="space-y-16">
                {/* Folders Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {albums.map((album) => (
                        <div
                            key={album.id}
                            onClick={() => setSelectedAlbum(album)}
                            className="group relative aspect-video rounded-3xl overflow-hidden border border-white/5 bg-white/5 backdrop-blur-md transition-all duration-500 hover:border-amber-500/30 hover:shadow-[0_0_50px_rgba(245,158,11,0.1)] hover:-translate-y-2 cursor-pointer"
                        >
                            <div className="absolute inset-0 grayscale group-hover:grayscale-0 transition-all duration-700">
                                {album.items && album.items[0] ? (
                                    <Image
                                        src={album.items[0].url}
                                        alt={album.title}
                                        fill
                                        className="object-cover transform group-hover:scale-110 transition-transform duration-1000"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-amber-950/20">
                                        <FolderIcon className="w-16 h-16 text-amber-500/20" />
                                    </div>
                                )}
                            </div>

                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                            <div className="absolute inset-0 flex flex-col justify-end p-8">
                                <span className="text-amber-500 text-[10px] uppercase font-black tracking-[0.2em] mb-2 block">Kolekcja</span>
                                <h3 className="text-3xl font-serif text-amber-100 group-hover:text-white transition-colors">{album.title}</h3>
                                {album.description && (
                                    <p className="text-amber-200/40 text-sm mt-2 line-clamp-2 font-light">{album.description}</p>
                                )}
                                <div className="mt-6 flex items-center gap-2 text-amber-500/60 group-hover:text-amber-400 transition-colors">
                                    <span className="text-xs font-bold uppercase tracking-widest">Otwórz folder</span>
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Individual Media if any */}
                {items.length > 0 && (
                    <div className="space-y-8">
                        <h4 className="text-amber-200/20 text-xs font-black uppercase tracking-[0.3em] text-center">Pozostałe realizacje</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {items.map((item, idx) => (
                                <MediaTile key={item.id} item={item} onClick={() => {
                                    setSelectedAlbum(null); // Ensure we are in individual context
                                    openLightbox(idx);
                                }} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {selectedAlbum && (
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-amber-500/10">
                    <div className="space-y-4">
                        <button
                            onClick={() => setSelectedAlbum(null)}
                            className="flex items-center gap-2 text-amber-500/60 hover:text-amber-400 transition-colors uppercase text-[10px] font-black tracking-widest"
                        >
                            <ArrowLeft className="w-3 h-3" />
                            Powrót do galerii
                        </button>
                        <h2 className="text-4xl md:text-5xl font-serif text-amber-100">{selectedAlbum.title}</h2>
                        {selectedAlbum.description && (
                            <p className="text-amber-200/60 max-w-2xl text-lg font-light leading-relaxed italic border-l-2 border-amber-500/20 pl-6">
                                {selectedAlbum.description}
                            </p>
                        )}
                    </div>
                    <div className="px-4 py-2 bg-amber-500/5 border border-amber-500/10 rounded-full">
                        <span className="text-amber-500/40 text-xs font-bold uppercase tracking-widest">{activeItems.length} Elementów</span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {activeItems.map((item, index) => (
                    <MediaTile key={item.id} item={item} onClick={() => openLightbox(index)} />
                ))}
            </div>

            {/* Lightbox logic remains same but uses activeItems */}
            {selectedItem && (
                <Lightbox
                    item={selectedItem}
                    onClose={closeLightbox}
                    onNext={nextMedia}
                    onPrev={prevMedia}
                />
            )}
        </div>
    );
}

function MediaTile({ item, onClick }: { item: GalleryItem; onClick: () => void }) {
    return (
        <div
            onClick={onClick}
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
    );
}

function Lightbox({ item, onClose, onNext, onPrev }: { item: GalleryItem; onClose: () => void; onNext: () => void; onPrev: () => void }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl transition-all duration-300">
            <button onClick={onClose} className="absolute top-6 right-6 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors z-[110]" aria-label="Zamknij">
                <X className="w-8 h-8" />
            </button>
            <button onClick={onPrev} className="absolute left-6 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white z-[110]" aria-label="Poprzednie">
                <ChevronLeft className="w-10 h-10" />
            </button>
            <button onClick={onNext} className="absolute right-6 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white z-[110]" aria-label="Następne">
                <ChevronRight className="w-10 h-10" />
            </button>

            <div className="relative w-full h-full max-w-6xl max-h-[85vh] px-4 flex flex-col items-center justify-center">
                <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                    {item.type === 'VIDEO' ? (
                        <video key={item.url} src={item.url} className="w-full h-full object-contain" controls autoPlay playsInline />
                    ) : (
                        <Image src={item.url} alt={item.title || ''} fill className="object-contain" priority />
                    )}
                </div>
                {(item.title || item.description) && (
                    <div className="mt-8 text-center max-w-2xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-3xl font-serif text-amber-100">{item.title}</h2>
                        {item.description && <p className="mt-2 text-amber-200/60 text-lg">{item.description}</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
