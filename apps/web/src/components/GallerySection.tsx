import { getHomeGalleryItems } from '@/app/[locale]/admin/gallery/actions';
import { VideoIcon, ImageIcon, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { GalleryItem } from '@/types/gallery';

export default async function GallerySection() {
    const items = await getHomeGalleryItems();

    if (items.length === 0) return null;

    return (
        <section id="gallery" className="w-full py-24 bg-white relative overflow-hidden">
            {/* Artistic Background Elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-50" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-50 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 opacity-30" />

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="space-y-4">
                        <h2 className="text-4xl md:text-5xl font-serif text-gray-900">
                            Magia <span className="text-orange-600 italic">Tworzenia</span>
                        </h2>
                        <div className="w-20 h-1.5 bg-orange-600 rounded-full" />
                        <p className="text-gray-500 max-w-xl text-lg">
                            Odkryj tajemnice naszej manufaktury. Od płynnego szkła po gotowe, ręcznie malowane arcydzieła.
                        </p>
                    </div>
                    <Link
                        href="/galeria"
                        className="group flex items-center gap-3 text-orange-600 font-bold uppercase tracking-widest hover:text-orange-700 transition-colors"
                    >
                        Zobacz pełną galerię
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {items.map((item: GalleryItem, index: number) => (
                        <div
                            key={item.id}
                            className={`group relative rounded-2xl overflow-hidden glass-card shadow-sm border border-orange-100/20 aspect-square ${index === 0 ? 'md:col-span-2 md:row-span-2 md:aspect-auto' : ''
                                }`}
                        >
                            {item.type === 'VIDEO' ? (
                                <video
                                    src={item.url}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                <p className="text-white font-medium text-sm md:text-base">{item.title || 'Manufaktura Bolglass'}</p>
                                <div className="flex items-center gap-1.5 mt-1 text-orange-400">
                                    {item.type === 'VIDEO' ? <VideoIcon className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                                    <span className="text-[10px] uppercase font-bold tracking-tighter">{item.type}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
