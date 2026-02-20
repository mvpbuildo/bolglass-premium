'use client';

import { useRouter } from '@/i18n/navigation';
import { Card } from '@bolglass/ui';
import { useState, ChangeEvent } from 'react';
import { createProduct } from './actions';
import Image from 'next/image';

import { compressImage } from '@/utils/imageCompression';
import { translateText } from '@/app/[locale]/admin/translations/actions';
import { Sparkles, Globe, AlertCircle, Plus } from 'lucide-react';

export default function NewProductForm() {
    const router = useRouter();
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState<'pl' | 'en' | 'de'>('pl');
    const [isTranslating, setIsTranslating] = useState<string | null>(null);

    const [translations, setTranslations] = useState({
        pl: { name: '', description: '' },
        en: { name: '', description: '' },
        de: { name: '', description: '' }
    });

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

            setImages(prev => [...prev, ...compressedFiles]);

            // Create previews from compressed files (blobs)
            const newPreviews = compressedFiles.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleTranslate = async (targetLocale: 'en' | 'de') => {
        const sourceText = translations.pl.description || translations.pl.name;
        if (!sourceText) {
            alert('Wpisz najpierw tekst w języku polskim.');
            return;
        }

        setIsTranslating(targetLocale);
        try {
            // Translate Name
            if (translations.pl.name) {
                const resName = await translateText(translations.pl.name, targetLocale);
                if (resName.success && resName.translated) {
                    setTranslations(prev => ({
                        ...prev,
                        [targetLocale]: { ...prev[targetLocale], name: resName.translated }
                    }));
                }
            }

            // Translate Description
            if (translations.pl.description) {
                const resDesc = await translateText(translations.pl.description, targetLocale);
                if (resDesc.success && resDesc.translated) {
                    setTranslations(prev => ({
                        ...prev,
                        [targetLocale]: { ...prev[targetLocale], description: resDesc.translated }
                    }));
                }
            }
        } catch (err: unknown) {
            const error = err as { message?: string };
            alert(error.message || 'Błąd podczas tłumaczenia.');
        } finally {
            setIsTranslating(null);
        }
    };

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);
        setError(null);

        // Add translations to formData
        formData.append('translations', JSON.stringify(translations));

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
        <Card className="p-8 bg-white shadow-sm">
            {error && (
                <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg text-sm font-bold border border-red-100 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}
            <form action={handleSubmit} className="space-y-8">
                {/* SECTION 1: CONTENT & LANGUAGES */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center justify-between">
                        <span>1. Treści i Języki</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                <Globe className="w-3 h-3" /> multi-lang active
                            </span>
                        </div>
                    </h3>

                    <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                        <div className="flex border-b border-gray-200 mb-6 gap-8 overflow-x-auto scrollbar-hide">
                            {['pl', 'en', 'de'].map((loc) => (
                                <button
                                    key={loc}
                                    type="button"
                                    onClick={() => setActiveTab(loc as 'pl' | 'en' | 'de')}
                                    className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all relative whitespace-nowrap ${activeTab === loc
                                        ? 'text-red-600 border-b-2 border-red-600'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    {loc === 'pl' ? '🇵🇱 Polski' : loc === 'en' ? '🇬🇧 English' : '🇩🇪 Deutsch'}
                                </button>
                            ))}
                        </div>

                        {/* Language Content Tabs */}
                        <div className="space-y-6">
                            {activeTab !== 'pl' && (
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => handleTranslate(activeTab as 'en' | 'de')}
                                        disabled={!!isTranslating}
                                        className="flex items-center gap-2 text-xs font-black bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-100 hover:bg-blue-100 transition-all disabled:opacity-50"
                                    >
                                        {isTranslating === activeTab ? (
                                            <>
                                                <div className="w-3 h-3 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
                                                AI tłumaczy...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-3 h-3" />
                                                ✨ Automatyczne tłumaczenie (AI)
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Nazwa Produktu ({activeTab.toUpperCase()})</label>
                                    <input
                                        value={translations[activeTab].name}
                                        onChange={(e) => setTranslations({
                                            ...translations,
                                            [activeTab]: { ...translations[activeTab], name: e.target.value }
                                        })}
                                        required={activeTab === 'pl'}
                                        className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-red-500 outline-none shadow-sm transition-all"
                                        placeholder={activeTab === 'pl' ? "np. Bombka Czerwona 10cm" : `Tłumaczenie nazwy na ${activeTab}...`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Opis Produktu ({activeTab.toUpperCase()})</label>
                                    <textarea
                                        value={translations[activeTab].description}
                                        onChange={(e) => setTranslations({
                                            ...translations,
                                            [activeTab]: { ...translations[activeTab], description: e.target.value }
                                        })}
                                        required={activeTab === 'pl'}
                                        rows={4}
                                        className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-red-500 outline-none shadow-sm transition-all leading-relaxed"
                                        placeholder={activeTab === 'pl' ? "Wpisz bogaty opis produktu..." : `Opis w języku ${activeTab}...`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Kod EAN (Opcjonalnie)</label>
                            <input name="ean" className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-red-500 outline-none" placeholder="np. 590..." />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Kod Producenta (MPN)</label>
                            <input name="manufacturerCode" className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-red-500 outline-none" placeholder="np. BG-2024-X" />
                        </div>
                    </div>
                </div>

                {/* SECTION 2: PRICING & INVENTORY */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2">2. Ceny i Magazyn</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Cena Netto (PLN)</label>
                            <input name="priceNet" type="number" step="0.01" required className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-red-500 outline-none" placeholder="np. 45.00" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Stawka VAT (%)</label>
                            <select name="vatRate" className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-red-500 outline-none">
                                <option value="23">23% (Standard)</option>
                                <option value="8">8%</option>
                                <option value="0">0%</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Rabat (%)</label>
                            <input name="discountPercent" type="number" min="0" max="99" defaultValue="0" className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-red-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 text-blue-600">Ilość w Magazynie</label>
                            <input name="stock" type="number" min="0" defaultValue="0" className="w-full px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                        </div>
                    </div>
                </div>

                {/* SECTION 3: LOGISTICS */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2">3. Logistyka i Wymiary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Waga (kg)</label>
                            <input name="weight" type="number" step="0.001" className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-red-500 outline-none" placeholder="np. 0.250" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Wysokość (cm)</label>
                            <input name="height" type="number" step="0.1" className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-red-500 outline-none" placeholder="cm" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Szerokość (cm)</label>
                            <input name="width" type="number" step="0.1" className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-red-500 outline-none" placeholder="cm" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Głębokość (cm)</label>
                            <input name="depth" type="number" step="0.1" className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-red-500 outline-none" placeholder="cm" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Opakowanie</label>
                            <input name="packaging" className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-red-500 outline-none" placeholder="np. Kartonik ozdobny" />
                        </div>
                    </div>
                </div>

                {/* SECTION 4: MEDIA */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2">4. Zdjęcia ({images.length})</h3>

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
                            <Plus className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500 font-bold uppercase tracking-widest text-[10px]">Dodaj zdjęcie</span>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Pierwsze zdjęcie będzie miniaturką.</p>
                </div>

                <div className="flex items-center gap-2 pt-4">
                    <input type="checkbox" name="isConfigurable" id="isConfigurable" className="w-5 h-5 text-red-600 rounded" />
                    <label htmlFor="isConfigurable" className="text-sm font-bold text-gray-700">
                        Produkt Konfigurowalny (3D)
                    </label>
                </div>

                <div className="pt-8 border-t flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 text-xl font-black rounded-2xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 uppercase tracking-tighter"
                    >
                        {isSubmitting ? 'Zapisywanie...' : 'Utwórz Produkt'}
                    </button>
                </div>
            </form>
        </Card>
    );
}
