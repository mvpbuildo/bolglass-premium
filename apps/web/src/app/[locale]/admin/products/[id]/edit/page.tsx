import { Link } from '@/i18n/navigation';
import { prisma } from '@bolglass/database';
import { notFound } from 'next/navigation';
import EditProductForm from './EditProductForm';

interface EditProductPageProps {
    params: Promise<{
        id: string;
        locale: string;
    }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
    const { id } = await params;

    const product = await prisma.product.findUnique({
        where: { id },
        include: { translations: true }
    });

    if (!product) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <div className="mb-8">
                    <Link href="/admin/products" className="text-sm text-gray-500 hover:text-red-600 transition-colors">
                        ← Powrót do listy produktów
                    </Link>
                    <div className="flex justify-between items-end mt-2">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900">Edytuj Produkt</h1>
                            <p className="text-gray-500 text-sm">{product.name}</p>
                        </div>
                        <div className="text-xs font-mono bg-gray-200 px-2 py-1 rounded">
                            ID: {product.id}
                        </div>
                    </div>
                </div>

                <EditProductForm product={product} />
            </div>
        </main>
    );
}
