'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Input } from '@bolglass/ui';
import { toast } from 'sonner';
import { getConfiguratorSettings, updateConfiguratorSettings, type BaubleConfig } from '@/app/[locale]/admin/settings/3d/actions';
import { Trash2, Plus } from 'lucide-react';

export default function ConfiguratorSettings() {
    const [config, setConfig] = useState<BaubleConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

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

    if (isLoading || !config) return <div>Ładowanie...</div>;

    // --- Handlers ---
    const updateAddon = (key: keyof typeof config.addons, value: number) => {
        setConfig({ ...config, addons: { ...config.addons, [key]: value } });
    };

    const addSize = () => {
        setConfig({
            ...config,
            sizes: [...config.sizes, { id: `size-${Date.now()}`, label: 'Nowy Rozmiar', basePrice: 0, scale: 1.0 }]
        });
    };

    const removeSize = (index: number) => {
        const newSizes = [...config.sizes];
        newSizes.splice(index, 1);
        setConfig({ ...config, sizes: newSizes });
    };

    const updateSize = (index: number, field: keyof typeof config.sizes[0], value: any) => {
        const newSizes = [...config.sizes];
        newSizes[index] = { ...newSizes[index], [field]: value };
        setConfig({ ...config, sizes: newSizes });
    };

    const addColor = () => {
        setConfig({
            ...config,
            colors: [...config.colors, { hex: '#000000', name: 'Nowy Kolor', price: 0 }]
        });
    };

    const removeColor = (index: number) => {
        const newColors = [...config.colors];
        newColors.splice(index, 1);
        setConfig({ ...config, colors: newColors });
    };

    const updateColor = (index: number, field: keyof typeof config.colors[0], value: any) => {
        const newColors = [...config.colors];
        newColors[index] = { ...newColors[index], [field]: value };
        setConfig({ ...config, colors: newColors });
    };

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Konfigurator 3D</h2>
                <Button onClick={handleSave} disabled={isSaving} variant="primary">
                    {isSaving ? 'Zapisywanie...' : 'Zapisz Zmiany'}
                </Button>
            </div>

            {/* Dedykacja */}
            <Card className="p-6 bg-neutral-900 border-neutral-800">
                <h3 className="text-lg font-bold text-white mb-4">Opcje Dodatkowe</h3>
                <div className="grid gap-4 max-w-xs">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Cena za Dedykację (PLN)</label>
                        <Input
                            type="number"
                            value={config.addons.textPrice}
                            onChange={(e) => updateAddon('textPrice', parseFloat(e.target.value))}
                        />
                    </div>
                </div>
            </Card>

            {/* Rozmiary */}
            <Card className="p-6 bg-neutral-900 border-neutral-800">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white">Rozmiary Bombek</h3>
                    <Button size="sm" variant="outline" onClick={addSize}><Plus className="w-4 h-4 mr-2" /> Dodaj</Button>
                </div>
                <div className="space-y-4">
                    {config.sizes.map((size, index) => (
                        <div key={index} className="grid grid-cols-12 gap-4 items-end bg-neutral-800/50 p-4 rounded-lg">
                            <div className="col-span-3">
                                <label className="text-xs text-gray-500">Etykieta</label>
                                <Input value={size.label} onChange={(e) => updateSize(index, 'label', e.target.value)} />
                            </div>
                            <div className="col-span-3">
                                <label className="text-xs text-gray-500">Cena Bazowa (PLN)</label>
                                <Input type="number" value={size.basePrice} onChange={(e) => updateSize(index, 'basePrice', parseFloat(e.target.value))} />
                            </div>
                            <div className="col-span-3">
                                <label className="text-xs text-gray-500">Skala 3D (0.5 - 2.0)</label>
                                <Input type="number" step="0.1" value={size.scale} onChange={(e) => updateSize(index, 'scale', parseFloat(e.target.value))} />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs text-gray-500">ID</label>
                                <Input value={size.id} onChange={(e) => updateSize(index, 'id', e.target.value)} />
                            </div>
                            <div className="col-span-1 flex justify-end">
                                <Button size="icon" variant="destructive" onClick={() => removeSize(index)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Kolory */}
            <Card className="p-6 bg-neutral-900 border-neutral-800">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white">Kolory Szkła</h3>
                    <Button size="sm" variant="outline" onClick={addColor}><Plus className="w-4 h-4 mr-2" /> Dodaj</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {config.colors.map((color, index) => (
                        <div key={index} className="flex gap-4 items-center bg-neutral-800/50 p-4 rounded-lg">
                            <div className="w-12 h-12 rounded-full border-2 border-white/20 shrink-0" style={{ backgroundColor: color.hex }} />
                            <div className="flex-grow space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <Input value={color.name} onChange={(e) => updateColor(index, 'name', e.target.value)} placeholder="Nazwa" />
                                    <Input value={color.hex} onChange={(e) => updateColor(index, 'hex', e.target.value)} placeholder="#Hex" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-gray-500 whitespace-nowrap">Dopłata:</label>
                                    <Input type="number" value={color.price} onChange={(e) => updateColor(index, 'price', parseFloat(e.target.value))} placeholder="0" />
                                </div>
                            </div>
                            <Button size="icon" variant="ghost" className="text-red-500" onClick={() => removeColor(index)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
