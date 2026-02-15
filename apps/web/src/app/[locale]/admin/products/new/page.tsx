'use client';

import { useRouter, Link } from '@/i18n/navigation';
import { Button, Card } from '@bolglass/ui';
import { useState, ChangeEvent } from 'react';
import { createProduct } from './actions';
import Image from 'next/image';

export default function AdminNewProductPage() {
    const router = useRouter();
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setImages(prev => [...prev, ...filesArray]);

            // Create previews
            const newPreviews = filesArray.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);
        setError(null);

        // Strategy: We remove the 'image' field from formData (if any) and append our state `images`.
        formData.delete('images');
        images.forEach(file => {
            formData.append('images', file);
        });

        const result = await createProduct(formData);

        if (result?.error) {
            setError(result.error);
            setIsSubmitting(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            router.push('/admin/products');
        }
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
                    {error && (
                        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg text-sm font-bold border border-red-100 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {error}
                        </div>
                    )}
                    <form action={handleSubmit} className="space-y-8">
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
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Kod EAN (Opcjonalnie)</label>
                                    <input name="ean" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="np. 590..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Kod Producenta (MPN)</label>
                                    <input name="manufacturerCode" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="np. BG-2024-X" />
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
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">4. Zdjęcia({images.length})</h3>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                {previews.map((src, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                                        <Image src={src} alt="Preview" fill className="object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                ))}
                                <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                    <span className="text-sm text-gray-500">Dodaj zdjęcie</span>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <p className="text-xs text-gray-500">Pierwsze zdjęcie będzie miniaturką.</p>
                        </div>

                        <div className="flex items-center gap-2 pt-4">
                            <input type="checkbox" name="isConfigurable" id="isConfigurable" className="w-5 h-5 text-red-600 rounded" />
                            <label htmlFor="isConfigurable" className="text-sm font-medium text-gray-700">
                                Produkt Konfigurowalny (3D)
                            </label>
                        </div>

                        <div className="pt-6 border-t flex justify-end">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? 'Zapisywanie...' : 'Zapisz Produkt'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </main>
    );
}
