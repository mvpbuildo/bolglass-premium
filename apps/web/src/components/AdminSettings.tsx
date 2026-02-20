'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Card } from '@bolglass/ui';
import { getSystemSettings, updateSystemSetting } from '../app/[locale]/actions';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AdminSettings() {
    const [prices, setPrices] = useState({ sightseeing: '', workshop: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function fetchSettings() {
            const settings = await getSystemSettings();
            setPrices({
                sightseeing: settings.price_sightseeing || '35',
                workshop: settings.price_workshop || '60'
            });
            setLoading(false);
        }
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await Promise.all([
                updateSystemSetting('price_sightseeing', prices.sightseeing),
                updateSystemSetting('price_workshop', prices.workshop)
            ]);
            toast.success('Zapisano zmiany!');
        } catch (error) {
            console.error('Failed to save settings:', error);
            toast.error('Wystąpił błąd podczas zapisywania.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Ładowanie ustawień...</div>;

    return (
        <Card className="p-8 bg-white shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Cennik Pakietów</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="p-6 border rounded-xl bg-gray-50">
                    <h3 className="font-bold text-lg mb-4 text-gray-700">👀 Zwiedzanie (30 min)</h3>
                    <Input
                        label="Cena (PLN)"
                        type="number"
                        value={prices.sightseeing}
                        onChange={(e) => setPrices({ ...prices, sightseeing: e.target.value })}
                        className="bg-white"
                    />
                    <p className="text-xs text-gray-500 mt-2">Domyślnie: 35 zł</p>
                </div>

                <div className="p-6 border rounded-xl bg-red-50 border-red-100">
                    <h3 className="font-bold text-lg mb-4 text-red-800">🎨 Warsztaty (80 min)</h3>
                    <Input
                        label="Cena (PLN)"
                        type="number"
                        value={prices.workshop}
                        onChange={(e) => setPrices({ ...prices, workshop: e.target.value })}
                        className="bg-white"
                    />
                    <p className="text-xs text-red-400 mt-2">Domyślnie: 60 zł</p>
                </div>
            </div>

            <div className="flex justify-end">
                <Button
                    variant="primary"
                    size="lg"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? 'Zapisywanie...' : 'Zapisz Zmiany'}
                </Button>
            </div>
        </Card>
    );
}
