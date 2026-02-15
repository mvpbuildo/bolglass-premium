import { Link } from '@/i18n/navigation';
import { prisma } from '@bolglass/database';
import { Button, Card } from '@bolglass/ui';
import { redirect } from 'next/navigation';

export default function AdminNewProductPage() {
    async function createProduct(formData: FormData) {
        'use server'

        const name = formData.get('name') as string;
        const price = parseFloat(formData.get('price') as string);
        const description = formData.get('description') as string;
        const imageUrl = formData.get('imageUrl') as string;
        const isConfigurable = formData.get('isConfigurable') === 'on';

        // Generate a simple slug from name
        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        const sku = `BG-${Math.floor(Math.random() * 10000)}`;

        await prisma.product.create({
            data: {
                name,
                slug: `${slug}-${Date.now()}`, // Ensure uniqueness
                description,
                price,
                images: imageUrl ? [imageUrl] : [],
                sku,
                isConfigurable,
                stock: 100 // Default stock
            }
        });

        redirect('/admin/products');
    }

    return (
        <main className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto px-4">
                <div className="mb-8">
                    <Link href="/admin/products" className="text-sm text-gray-500 hover:text-red-600 transition-colors">
                        ← Powrót do listy produktów
                    </Link>
                    <h1 className="text-3xl font-black text-gray-900 mt-2">Dodaj Nowy Produkt</h1>
                </div>

                <Card className="p-6 bg-white shadow-sm">
                    <form action={createProduct} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Nazwa Produktu</label>
                            <input name="name" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="np. Bombka Czerwona 10cm" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Cena (PLN)</label>
                            <input name="price" type="number" step="0.01" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="0.00" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Opis</label>
                            <textarea name="description" required rows={4} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="Opisz produkt..." />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">URL Obrazka (Opcjonalnie)</label>
                            <input name="imageUrl" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="https://..." />
                        </div>

                        <div className="flex items-center gap-2">
                            <input type="checkbox" name="isConfigurable" id="isConfigurable" className="w-5 h-5 text-red-600 rounded" />
                            <label htmlFor="isConfigurable" className="text-sm font-medium text-gray-700">
                                Produkt Konfigurowalny (3D)
                            </label>
                        </div>

                        <div className="pt-4 border-t flex justify-end">
                            <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-8">
                                Zapisz Produkt
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </main>
    );
}
