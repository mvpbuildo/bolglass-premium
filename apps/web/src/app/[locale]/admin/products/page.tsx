import { Link } from '@/i18n/navigation';
import AdminNavigation from '../../../../components/AdminNavigation';
import { prisma } from '@bolglass/database';
import { Button, Card } from '@bolglass/ui';

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
                            <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                <div className="h-40 bg-gray-100 flex items-center justify-center relative">
                                    {product.images && product.images[0] ? (
                                        <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-4xl">📦</span>
                                    )}
                                    {product.isConfigurable && (
                                        <span className="absolute top-2 right-2 bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-1 rounded-full">
                                            3D CONFIG
                                        </span>
                                    )}
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-gray-900">{product.name}</h3>
                                        <span className="font-mono text-green-600 font-bold">{product.price} PLN</span>
                                    </div>
                                    <p className="text-xs text-gray-500 line-clamp-2 mb-4">{product.description}</p>

                                    <div className="flex gap-2">
                                        <Link href={`/admin/products/${product.id}/edit`} className="flex-1">
                                            <Button variant="outline" className="w-full text-xs">Edytuj</Button>
                                        </Link>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
