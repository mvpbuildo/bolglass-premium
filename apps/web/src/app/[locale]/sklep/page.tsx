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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-black text-gray-900 mb-2">Nasze Produkty</h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Odkryj ręcznie malowane arcydzieła, które wniosą magię świąt do Twojego domu.
                    </p>
                </div>

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
