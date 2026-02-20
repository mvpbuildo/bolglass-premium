import ProductCard from '@/components/shop/ProductCard';
import { prisma } from '@bolglass/database';
import { unstable_cache } from 'next/cache';

export const dynamic = 'force-dynamic'; // Ensure we see latest products

const getProducts = unstable_cache(
    async () => {
        return await prisma.product.findMany({
            where: { stock: { gt: 0 } },
            orderBy: { createdAt: 'desc' },
        });
    },
    ['shop-products-cache'],
    { tags: ['products'], revalidate: 3600 }
);

export default async function ShopPage() {
    const products = await getProducts();

    return (
        <main className="min-h-screen bg-[#050505] pt-20">
            {/* HERO SECTION */}
            <div className="relative h-[500px] w-full flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 transform scale-105"
                    style={{ backgroundImage: "url('/hero-background.png')" }}
                />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px]"></div>

                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-1000">
                    <span className="text-amber-500 text-xs font-black uppercase tracking-[0.5em] block">
                        Kolekcja Bolglass
                    </span>
                    <h1 className="text-6xl md:text-8xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-amber-50 via-amber-200 to-amber-500 drop-shadow-[0_10px_30px_rgba(245,158,11,0.3)]">
                        Magia Szklanych Świąt
                    </h1>
                    <p className="text-xl md:text-2xl text-amber-100/60 font-light tracking-widest max-w-2xl mx-auto italic">
                        Ręcznie dmuchane, artystycznie malowane – bombki z duszą.
                    </p>
                    <div className="w-32 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent mx-auto"></div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-24 relative z-10">
                <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-8">
                    <h2 className="text-white text-xs font-black uppercase tracking-[0.3em]">Wszystkie Produkty</h2>
                    <div className="h-px flex-1 bg-white/5 mx-8" />
                    <span className="text-amber-500/40 text-xs font-bold uppercase tracking-widest">{products.length} Przedmiotów</span>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-32 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md">
                        <p className="text-amber-200/40 text-xl font-serif italic">Jeszcze nie dodano żadnych produktów.</p>
                        <p className="text-amber-500/20 text-xs mt-2 font-black uppercase tracking-widest">Zajrzyj do panelu administratora.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={{
                                    id: product.id,
                                    name: product.name,
                                    price: product.price,
                                    slug: product.slug,
                                    image: (product.images && product.images[0]) || null,
                                    priceNet: product.priceNet || 0,
                                    vatRate: product.vatRate || 23,
                                    discountPercent: product.discountPercent || 0
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
