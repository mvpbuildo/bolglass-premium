'use client';

import { useRouter } from '@/i18n/navigation';
import { Card } from '@bolglass/ui';
import { useState, ChangeEvent } from 'react';
import { updateProduct } from './actions';
import Image from 'next/image';
import { Product } from '@prisma/client';

interface EditProductFormProps {
    product: Product;
}

import { compressImage } from '@/utils/imageCompression';

export default function EditProductForm({ product }: EditProductFormProps) {
    const router = useRouter();
    const [existingImages, setExistingImages] = useState<string[]>(product.images || []);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [newPreviews, setNewPreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);



    // ... inside EditProductForm component ...

    const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);

            // Compress images before setting state
            const compressedFiles = await Promise.all(
                filesArray.map(async (file) => {
                    try {
                        return await compressImage(file);
                    } catch (error) {
                        console.error("Compression failed for", file.name, error);
                        return file; // Fallback to original
                    }
                })
            );

            setNewImages(prev => [...prev, ...compressedFiles]);

            // Create previews for new images
            const previews = compressedFiles.map(file => URL.createObjectURL(file));
            setNewPreviews(prev => [...prev, ...previews]);
        }
    };

    const removeExistingImage = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeNewImage = (index: number) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
        setNewPreviews(prev => prev.filter((_, i) => i !== index));
    };

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);
        setError(null);

        // We handle images manually
        formData.delete('images'); // Clear default input

        // Append existing images as string array
        formData.append('existingImages', JSON.stringify(existingImages));

        // Append new images
        newImages.forEach(file => {
            formData.append('newImages', file);
        });

        // Checkbox handling
        if (!formData.get('isConfigurable')) {
            // If unchecked, it's missing from formData, we don't need to append false explicitly 
            // because `get('isConfigurable') === 'on'` check in action handles it.
        }

        const result = await updateProduct(product.id, formData);

        if (result?.error) {
            setError(result.error);
            setIsSubmitting(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            router.push('/admin/products');
            router.refresh();
        }
    }

    return (
        <Card className="p-8 bg-white shadow-sm">
            {error && (
                <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg text-sm font-bold border border-red-100 flex items-center gap-2">
                    ⚠️ {error}
                </div>
            )}
            <form action={handleSubmit} className="space-y-8">
                {/* SECTION 1: BASIC INFO */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2">1. Podstawowe Informacje</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Nazwa Produktu</label>
                            <input name="name" defaultValue={product.name} required className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-red-500 outline-none" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Opis</label>
                            <textarea name="description" defaultValue={product.description || ''} required rows={3} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-red-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Kod EAN</label>
                            <input name="ean" defaultValue={product.ean || ''} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-red-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Kod Producenta (MPN)</label>
                            <input name="manufacturerCode" defaultValue={product.manufacturerCode || ''} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-red-500 outline-none" />
                        </div>
                    </div>
                </div>

                {/* SECTION 2: PRICING & INVENTORY */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2">2. Ceny i Magazyn</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Cena Netto (PLN)</label>
                            <input name="priceNet" defaultValue={product.priceNet || 0} type="number" step="0.01" required className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-red-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Stawka VAT (%)</label>
                            <select name="vatRate" defaultValue={product.vatRate || 23} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-red-500 outline-none">
                                <option value="23">23% (Standard)</option>
                                <option value="8">8%</option>
                                <option value="0">0%</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Rabat (%)</label>
                            <input name="discountPercent" type="number" min="0" max="99" defaultValue={product.discountPercent || 0} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-red-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 text-blue-600">Ilość w Magazynie</label>
                            <input name="stock" type="number" min="0" defaultValue={product.stock || 0} className="w-full px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                        </div>
                    </div>
                </div>

                {/* SECTION 3: LOGISTICS */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2">3. Logistyka i Wymiary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Waga (kg)</label>
                            <input name="weight" defaultValue={product.weight || 0} type="number" step="0.001" className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-red-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Wysokość (cm)</label>
                            <input name="height" defaultValue={product.height || 0} type="number" step="0.1" className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-red-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Szerokość (cm)</label>
                            <input name="width" defaultValue={product.width || 0} type="number" step="0.1" className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-red-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Głębokość (cm)</label>
                            <input name="depth" defaultValue={product.depth || 0} type="number" step="0.1" className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-red-500 outline-none" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Opakowanie</label>
                            <input name="packaging" defaultValue={product.packaging || ''} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-red-500 outline-none" />
                        </div>
                    </div>
                </div>

                {/* SECTION 4: MEDIA */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2">4. Zdjęcia</h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {/* Existing Images */}
                        {existingImages.map((src, idx) => (
                            <div key={`existing-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                                <Image src={src} alt="Existing" fill className="object-cover" />
                                <div className="absolute top-0 left-0 bg-blue-600 text-white text-[10px] px-2 py-1">Obecne</div>
                                <button
                                    type="button"
                                    onClick={() => removeExistingImage(idx)}
                                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        ))}

                        {/* New Images Previews */}
                        {newPreviews.map((src, idx) => (
                            <div key={`new-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border border-green-200 group">
                                <Image src={src} alt="New Preview" fill className="object-cover" />
                                <div className="absolute top-0 left-0 bg-green-600 text-white text-[10px] px-2 py-1">Nowe</div>
                                <button
                                    type="button"
                                    onClick={() => removeNewImage(idx)}
                                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        ))}

                        <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                            <span className="text-xl">+</span>
                            <span className="text-sm text-gray-500">Dodaj</span>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>

                <div className="flex items-center gap-2 pt-4">
                    <input type="checkbox" name="isConfigurable" id="isConfigurable" defaultChecked={product.isConfigurable} className="w-5 h-5 text-red-600 rounded" />
                    <label htmlFor="isConfigurable" className="text-sm font-medium text-gray-700">
                        Produkt Konfigurowalny (3D)
                    </label>
                </div>

                <div className="pt-6 border-t flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        Anuluj
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? 'Zapisywanie...' : 'Zapisz Zmiany'}
                    </button>
                </div>
            </form>
        </Card>
    );
}
