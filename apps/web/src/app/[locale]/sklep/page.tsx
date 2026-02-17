import ShopNavigation from '@/components/ShopNavigation';
import ProductCard from '@/components/shop/ProductCard';
import { prisma } from '@bolglass/database';

export const dynamic = 'force-dynamic'; // Ensure we see latest products

async function getProducts() {
    return await prisma.product.findMany({
        where: { stock: { gt: 0 } }, // Only show in-stock items? Or all for now? Let's show all.
        orderBy: { createdAt: 'desc' },
    });
}

export default async function ShopPage() {
    const products = await getProducts();

    return (
        <main className="min-h-screen bg-gray-50">
            <ShopNavigation />

            {/* HER0 SECTION */}
            <div className="relative h-[400px] w-full flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 transform hover:scale-105"
                    style={{ backgroundImage: "url('/hero-background.png')" }}
                />
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>

                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-6">
                    <h1 className="text-5xl md:text-7xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-500 drop-shadow-2xl">
                        Magia Szklanych Świąt
                    </h1>
                    <p className="text-xl md:text-2xl text-amber-50/90 font-light tracking-wide max-w-2xl mx-auto">
                        Ręcznie dmuchane, artystycznie malowane – bombki z duszą.
                    </p>
                    <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto"></div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

                {products.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <p>Jeszcze nie dodano żadnych produktów.</p>
                        <p className="text-sm">Zajrzyj do panelu administratora.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                                    vatRate: product.vatRate
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
