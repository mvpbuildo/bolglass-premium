import { Link } from '@/i18n/navigation';
import NewProductForm from './NewProductForm';

export default async function AdminNewProductPage() {
    console.log('[NewProductPage] Rendering Server-side shell');

    return (
        <main className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <div className="mb-8">
                    <Link href="/admin/products" className="text-sm text-gray-500 hover:text-red-600 transition-colors">
                        ← Powrót do listy produktów
                    </Link>
                    <h1 className="text-3xl font-black text-gray-900 mt-2">Dodaj Nowy Produkt</h1>
                </div>

                <NewProductForm />
            </div>
        </main>
    );
}
