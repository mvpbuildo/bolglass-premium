import { Link } from '@/i18n/navigation';
import AdminNavigation from '../../../../components/AdminNavigation';
import { prisma } from '@bolglass/database';
import { Button } from '@bolglass/ui';
import ProductCard from './ProductCard';

export const dynamic = 'force-dynamic';

async function getProducts() {
    return await prisma.product.findMany({
        orderBy: { createdAt: 'desc' }
    });
}

export default async function AdminProductsPage() {
    const products = await getProducts();

    return (
        <main className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto px-4">
                <AdminNavigation />

                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Produkty</h2>
                        <p className="text-gray-500 text-sm">Zarządzaj asortymentem sklepu</p>
                    </div>
                    <Link href="/admin/products/new">
                        <Button className="bg-green-600 hover:bg-green-700 text-white">
                            + Dodaj Produkt
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.length === 0 ? (
                        <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-400 mb-4">Brak produktów w sklepie.</p>
                            <Link href="/admin/products/new">
                                <Button variant="outline">Dodaj pierwszy produkt</Button>
                            </Link>
                        </div>
                    ) : (
                        products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
