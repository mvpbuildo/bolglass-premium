'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Input } from '@bolglass/ui';
import { toast } from 'sonner';
import { getConfiguratorSettings, updateConfiguratorSettings, type BaubleConfig, type MultilingualLabel } from '@/app/[locale]/admin/settings/3d/actions';
import { Trash2, Plus, Sparkles, Globe } from 'lucide-react';
import { translateText } from '../../app/[locale]/admin/translations/actions';

export default function ConfiguratorSettings() {
    const [config, setConfig] = useState<BaubleConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'pl' | 'en' | 'de'>('pl');
    const [isTranslating, setIsTranslating] = useState<string | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await getConfiguratorSettings();
            setConfig(data);
        } catch (error) {
            toast.error('Błąd ładowania ustawień');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!config) return;
        setIsSaving(true);
        try {
            await updateConfiguratorSettings(config);
            toast.success('Zapisano ustawienia');
        } catch (error) {
            toast.error('Błąd zapisu');
        } finally {
            setIsSaving(false);
        }
    };

    const handleTranslateAll = async (targetLocale: 'en' | 'de') => {
        if (!config) return;
        setIsTranslating(targetLocale);
        try {
            const newConfig = { ...config };

            // Translate Sizes
            for (let i = 0; i < newConfig.sizes.length; i++) {
                const labelObj = newConfig.sizes[i].label as MultilingualLabel;
                if (labelObj.pl && !labelObj[targetLocale]) {
                    const res = await translateText(labelObj.pl, targetLocale);
                    if (res.success && res.translated) {
                        labelObj[targetLocale] = res.translated;
                    }
                }
            }

            // Translate Colors
            for (let i = 0; i < newConfig.colors.length; i++) {
                const nameObj = newConfig.colors[i].name as MultilingualLabel;
                if (nameObj.pl && !nameObj[targetLocale]) {
                    const res = await translateText(nameObj.pl, targetLocale);
                    if (res.success && res.translated) {
                        nameObj[targetLocale] = res.translated;
                    }
                }
            }

            setConfig(newConfig);
            toast.success(`Przetłumaczono na język: ${targetLocale.toUpperCase()}`);
        } catch (error) {
            toast.error('Błąd podczas tłumaczenia AI');
        } finally {
            setIsTranslating(null);
        }
    };

    if (isLoading || !config) return <div className="p-8 text-center text-gray-500 font-bold italic anim-pulse">Ładowanie konfiguracji...</div>;

    // --- Handlers ---
    const updateAddon = (key: keyof typeof config.addons, value: number) => {
        setConfig({ ...config, addons: { ...config.addons, [key]: value } });
    };

    const addSize = () => {
        setConfig({
            ...config,
            sizes: [...config.sizes, {
                id: `size-${Date.now()}`,
                label: { pl: 'Nowy Rozmiar', en: 'New Size', de: 'Neue Größe' },
                basePrice: 0,
                scale: 1.0
            }]
        });
    };

    const removeSize = (index: number) => {
        const newSizes = [...config.sizes];
        newSizes.splice(index, 1);
        setConfig({ ...config, sizes: newSizes });
    };

    const updateSizeLabel = (index: number, locale: keyof MultilingualLabel, value: string) => {
        const newSizes = [...config.sizes];
        const label = { ...(newSizes[index].label as MultilingualLabel), [locale]: value };
        newSizes[index] = { ...newSizes[index], label };
        setConfig({ ...config, sizes: newSizes });
    };

    const updateSizeField = (index: number, field: 'basePrice' | 'scale' | 'id', value: any) => {
        const newSizes = [...config.sizes];
        newSizes[index] = { ...newSizes[index], [field]: value };
        setConfig({ ...config, sizes: newSizes });
    };

    const addColor = () => {
        setConfig({
            ...config,
            colors: [...config.colors, {
                hex: '#000000',
                name: { pl: 'Nowy Kolor', en: 'New Color', de: 'Neue Farbe' },
                price: 0
            }]
        });
    };

    const removeColor = (index: number) => {
        const newColors = [...config.colors];
        newColors.splice(index, 1);
        setConfig({ ...config, colors: newColors });
    };

    const updateColorName = (index: number, locale: keyof MultilingualLabel, value: string) => {
        const newColors = [...config.colors];
        const name = { ...(newColors[index].name as MultilingualLabel), [locale]: value };
        newColors[index] = { ...newColors[index], name };
        setConfig({ ...config, colors: newColors });
    };

    const updateColorField = (index: number, field: 'hex' | 'price', value: any) => {
        const newColors = [...config.colors];
        newColors[index] = { ...newColors[index], [field]: value };
        setConfig({ ...config, colors: newColors });
    };

    return (
        <div className="space-y-8 max-w-5xl">
            <div className="flex justify-between items-center bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                        <Globe className="w-6 h-6 text-blue-400" />
                        Ustawienia Konfiguratora 3D
                    </h2>
                    <p className="text-gray-400 text-sm mt-1 font-medium">Zarządzaj opcjami wizualizacji i ich cenami w wielu językach.</p>
                </div>
                <div className="flex gap-4">
                    <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700 text-white font-black px-6">
                        {isSaving ? 'Zapisywanie...' : 'Zapisz Wszystkie Zmiany'}
                    </Button>
                </div>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 p-2 rounded-2xl">
                <div className="flex gap-2">
                    {['pl', 'en', 'de'].map((loc) => (
                        <button
                            key={loc}
                            onClick={() => setActiveTab(loc as any)}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === loc
                                    ? 'bg-red-600 text-white shadow-lg'
                                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                }`}
                        >
                            {loc === 'pl' ? '🇵🇱 PL' : loc === 'en' ? '🇬🇧 EN' : '🇩🇪 DE'}
                        </button>
                    ))}
                </div>

                {activeTab !== 'pl' && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTranslateAll(activeTab as 'en' | 'de')}
                        disabled={!!isTranslating}
                        className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 font-bold gap-2 mr-2"
                    >
                        {isTranslating === activeTab ? (
                            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Sparkles className="w-4 h-4" />
                        )}
                        Tłumacz brakujące (AI)
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Dedykacja */}
                <Card className="p-8 bg-neutral-950 border-neutral-800 shadow-2xl">
                    <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-6 bg-red-600 rounded-full" />
                        1. Opcje Dodatkowe
                    </h3>
                    <div className="grid gap-6 max-w-sm">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Cena za Dedykację Tekstową (PLN Netto)</label>
                            <Input
                                type="number"
                                step="0.01"
                                value={config.addons.textPrice}
                                onChange={(e) => updateAddon('textPrice', parseFloat(e.target.value))}
                                className="bg-neutral-900 border-neutral-800 text-white font-bold h-12 text-lg"
                            />
                        </div>
                    </div>
                </Card>

                {/* Rozmiary */}
                <Card className="p-8 bg-neutral-950 border-neutral-800 shadow-2xl">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-6 bg-blue-600 rounded-full" />
                            2. Rozmiary Bombek
                        </h3>
                        <Button size="sm" onClick={addSize} className="bg-blue-600 hover:bg-blue-700 text-white font-black px-4">
                            <Plus className="w-4 h-4 mr-2" /> Dodaj Nowy Rozmiar
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {config.sizes.map((size, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-neutral-900 p-6 rounded-2xl border border-neutral-800/50 hover:border-neutral-700 transition-all group">
                                <div className="md:col-span-4 space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Etykieta ({activeTab.toUpperCase()})</label>
                                    <Input
                                        value={(size.label as MultilingualLabel)[activeTab]}
                                        onChange={(e) => updateSizeLabel(index, activeTab, e.target.value)}
                                        className="bg-neutral-800 border-neutral-700 text-white font-bold"
                                        placeholder="np. Średnica 10cm"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Cena Bazowa</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={size.basePrice}
                                        onChange={(e) => updateSizeField(index, 'basePrice', parseFloat(e.target.value))}
                                        className="bg-neutral-800 border-neutral-700 text-white font-mono"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Skala (3D)</label>
                                    <Input
                                        type="number"
                                        step="0.05"
                                        value={size.scale}
                                        onChange={(e) => updateSizeField(index, 'scale', parseFloat(e.target.value))}
                                        className="bg-neutral-800 border-neutral-700 text-white font-mono"
                                    />
                                </div>
                                <div className="md:col-span-3 space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">ID (Wewnętrzne)</label>
                                    <Input
                                        value={size.id}
                                        onChange={(e) => updateSizeField(index, 'id', e.target.value)}
                                        className="bg-neutral-800 border-neutral-700 text-gray-400 font-mono text-xs uppercase"
                                    />
                                </div>
                                <div className="md:col-span-1 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => removeSize(index)}
                                        className="p-3 text-red-500 hover:text-white hover:bg-red-600 rounded-xl transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Kolory */}
                <Card className="p-8 bg-neutral-950 border-neutral-800 shadow-2xl">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-6 bg-orange-600 rounded-full" />
                            3. Kolory Szkła
                        </h3>
                        <Button size="sm" onClick={addColor} className="bg-orange-600 hover:bg-orange-700 text-white font-black px-4">
                            <Plus className="w-4 h-4 mr-2" /> Dodaj Nowy Kolor
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {config.colors.map((color, index) => (
                            <div key={index} className="flex gap-6 items-start bg-neutral-900 p-6 rounded-2xl border border-neutral-800/50 hover:border-neutral-700 transition-all group">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-16 h-16 rounded-2xl border-4 border-white/10 shadow-xl group-hover:scale-110 transition-transform" style={{ backgroundColor: color.hex }} />
                                    <div className="font-mono text-[10px] text-gray-500 font-bold uppercase">{color.hex}</div>
                                </div>

                                <div className="flex-grow space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Nazwa ({activeTab.toUpperCase()})</label>
                                            <Input
                                                value={(color.name as MultilingualLabel)[activeTab]}
                                                onChange={(e) => updateColorName(index, activeTab, e.target.value)}
                                                placeholder="Nazwa koloru"
                                                className="bg-neutral-800 border-neutral-700 text-white font-bold"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Kod HEX</label>
                                            <Input
                                                value={color.hex}
                                                onChange={(e) => updateColorField(index, 'hex', e.target.value)}
                                                placeholder="#HEX"
                                                className="bg-neutral-800 border-neutral-700 text-gray-300 font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 bg-neutral-800 px-3 py-1.5 rounded-xl border border-neutral-700">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Dopłata:</label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={color.price}
                                                onChange={(e) => updateColorField(index, 'price', parseFloat(e.target.value))}
                                                className="w-20 bg-transparent border-none p-0 text-white font-black text-right focus:ring-0"
                                            />
                                            <span className="text-xs font-bold text-gray-500">PLN</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeColor(index)}
                                            className="p-2.5 text-red-500 hover:text-white hover:bg-red-600 rounded-xl transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <div className="pt-8 text-center">
                <p className="text-gray-500 text-xs font-medium tracking-wide flex items-center justify-center gap-2">
                    <Sparkles className="w-3 h-3 text-blue-400" />
                    Wszystkie zmiany wymagają kliknięcia "Zapisz Wszystkie Zmiany", aby zostały zastosowane w sklepie.
                </p>
            </div>
        </div>
    );
}
