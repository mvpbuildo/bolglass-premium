import { Link } from '@/i18n/navigation';
import { prisma } from '@bolglass/database';
import { Button, Card } from '@bolglass/ui';
import { redirect } from 'next/navigation';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export default function AdminNewProductPage() {
    async function createProduct(formData: FormData) {
        'use server'

        const name = formData.get('name') as string;
        const description = formData.get('description') as string;

        // Pricing
        const priceNet = parseFloat(formData.get('priceNet') as string) || 0;
        const vatRate = parseInt(formData.get('vatRate') as string) || 23;
        const priceGross = priceNet * (1 + vatRate / 100);

        // Logistics
        const weight = parseFloat(formData.get('weight') as string) || 0;
        const height = parseFloat(formData.get('height') as string) || 0;
        const width = parseFloat(formData.get('width') as string) || 0;
        const depth = parseFloat(formData.get('depth') as string) || 0;
        const packaging = formData.get('packaging') as string;

        const file = formData.get('image') as File;
        const isConfigurable = formData.get('isConfigurable') === 'on';

        let imageUrl = '';

        if (file && file.size > 0) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Robust path resolution for Docker/Standalone
            // In standalone output, public folder is copied to .next/standalone/public (sometimes)
            // But we want to map to the volume.
            // Best practice: Use process.cwd() which in Docker is /app
            // and assume 'public/uploads' is mapped.
            const uploadDir = join(process.cwd(), 'public', 'uploads');

            try {
                await mkdir(uploadDir, { recursive: true });

                // Generate unique filename
                // Sanitize filename to be safe
                const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
                const filename = `${Date.now()}-${sanitizedName}`;
                const filepath = join(uploadDir, filename);

                await writeFile(filepath, buffer);
                imageUrl = `/uploads/${filename}`;
            } catch (error) {
                console.error("Upload failed:", error);
                // Fail gracefully or throw? For now log and continue without image
            }
        }

        // Generate a simple slug from name
        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        const sku = `BG-${Math.floor(Math.random() * 10000)}`;

        await prisma.product.create({
            data: {
                name,
                slug: `${slug}-${Date.now()}`,
                description,
                price: priceGross, // Store Gross for compatibility
                priceNet,
                vatRate,
                weight,
                height,
                width,
                depth,
                packaging,
                images: imageUrl ? [imageUrl] : [],
                sku,
                isConfigurable,
                stock: 100
            }
        });

        redirect('/admin/products');
    }

    return (
        <main className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <div className="mb-8">
                    <Link href="/admin/products" className="text-sm text-gray-500 hover:text-red-600 transition-colors">
                        ← Powrót do listy produktów
                    </Link>
                    <h1 className="text-3xl font-black text-gray-900 mt-2">Dodaj Nowy Produkt</h1>
                </div>

                <Card className="p-8 bg-white shadow-sm">
                    <form action={createProduct} className="space-y-8">
                        {/* SECTION 1: BASIC INFO */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">1. Podstawowe Informacje</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Nazwa Produktu</label>
                                    <input name="name" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="np. Bombka Czerwona 10cm" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Opis</label>
                                    <textarea name="description" required rows={3} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="Opisz produkt..." />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: PRICING */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">2. Ceny</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Cena Netto (PLN)</label>
                                    <input name="priceNet" type="number" step="0.01" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="np. 45.00" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Stawka VAT (%)</label>
                                    <select name="vatRate" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none">
                                        <option value="23">23% (Standard)</option>
                                        <option value="8">8%</option>
                                        <option value="0">0%</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Cena Brutto (Auto)</label>
                                    <input disabled className="w-full px-4 py-2 bg-gray-100 border rounded-lg text-gray-500 cursor-not-allowed" placeholder="Wyliczona automatycznie" />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 3: LOGISTICS */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">3. Logistyka i Wymiary</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Waga (kg)</label>
                                    <input name="weight" type="number" step="0.001" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="np. 0.250" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Wysokość (cm)</label>
                                    <input name="height" type="number" step="0.1" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="cm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Szerokość (cm)</label>
                                    <input name="width" type="number" step="0.1" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="cm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Głębokość (cm)</label>
                                    <input name="depth" type="number" step="0.1" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="cm" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Opakowanie</label>
                                    <input name="packaging" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="np. Kartonik ozdobny" />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 4: MEDIA */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">4. Zdjęcie</h3>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Wgraj Plik</label>
                                <input
                                    name="image"
                                    type="file"
                                    accept="image/*"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                                />
                                <p className="text-xs text-gray-500 mt-1">Zostanie zapisane na serwerze w /uploads.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-4">
                            <input type="checkbox" name="isConfigurable" id="isConfigurable" className="w-5 h-5 text-red-600 rounded" />
                            <label htmlFor="isConfigurable" className="text-sm font-medium text-gray-700">
                                Produkt Konfigurowalny (3D)
                            </label>
                        </div>

                        <div className="pt-6 border-t flex justify-end">
                            <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all">
                                Zapisz Produkt (Gotowe)
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </main>
    );
}
