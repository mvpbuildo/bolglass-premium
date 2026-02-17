'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Card } from '@bolglass/ui';
import { getSystemSettings, updateSystemSetting } from '../app/[locale]/actions';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Mail, Phone, MapPin, Globe, Image as ImageIcon, Upload, X } from 'lucide-react';

export default function AdminContactSettings() {
    const [settings, setSettings] = useState({
        company_name: 'BOLGLASS',
        company_address: 'ul. Witkowska 78',
        company_city: '62-200 Gniezno',
        phone_1: '+48 604 620 732',
        phone_2: '061 425 55 88',
        email: 'biuro@bolglass.pl',
        facebook_url: 'https://facebook.com/bolglass',
        instagram_url: 'https://instagram.com/bolglass',
        logo_url: '',
        google_maps_iframe: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function fetchSettings() {
            const data = await getSystemSettings();
            setSettings(prev => ({
                ...prev,
                ...data
            }));
            setLoading(false);
        }
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const updates = Object.entries(settings).map(([key, value]) =>
                updateSystemSetting(key, value)
            );
            await Promise.all(updates);
            alert('Zapisano ustawienia kontaktu!');
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('Wystąpił błąd podczas zapisywania.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Ładowanie ustawień kontaktu...</div>;

    return (
        <Card className="p-8 bg-white shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                📞 Dane Kontaktowe i Social Media
            </h2>

            <div className="space-y-8">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-700 border-b pb-2 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-red-500" /> Dane Firmy
                        </h3>
                        <Input
                            label="Nazwa Firmy"
                            value={settings.company_name}
                            onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                        />
                        <Input
                            label="Ulica i numer"
                            value={settings.company_address}
                            onChange={(e) => setSettings({ ...settings, company_address: e.target.value })}
                        />
                        <Input
                            label="Kod pocztowy i Miasto"
                            value={settings.company_city}
                            onChange={(e) => setSettings({ ...settings, company_city: e.target.value })}
                        />
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-700 border-b pb-2 flex items-center gap-2">
                            <Phone className="w-4 h-4 text-green-500" /> Komunikacja
                        </h3>
                        <Input
                            label="Telefon 1 (komórkowy)"
                            value={settings.phone_1}
                            onChange={(e) => setSettings({ ...settings, phone_1: e.target.value })}
                        />
                        <Input
                            label="Telefon 2 (stacjonarny / fax)"
                            value={settings.phone_2}
                            onChange={(e) => setSettings({ ...settings, phone_2: e.target.value })}
                        />
                        <Input
                            label="E-mail kontaktowy"
                            value={settings.email}
                            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                        />
                    </div>
                </div>

                {/* Social Media & Media */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-700 border-b pb-2 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-blue-500" /> Social Media
                        </h3>
                        <Input
                            label="Link Facebook"
                            value={settings.facebook_url}
                            onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                        />
                        <Input
                            label="Link Instagram"
                            value={settings.instagram_url}
                            onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                        />
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-700 border-b pb-2 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-purple-500" /> Media i Mapa
                        </h3>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Logo Firmy</label>
                            <div className="flex items-center gap-6">
                                {settings.logo_url ? (
                                    <div className="relative w-32 h-32 border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                                        <img src={settings.logo_url} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                                        <button
                                            onClick={() => setSettings({ ...settings, logo_url: '' })}
                                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                                        <span className="text-xs">Brak logo</span>
                                    </div>
                                )}

                                <div className="flex-1">
                                    <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                        <Upload className="w-5 h-5 mr-2 text-gray-500" />
                                        Wybierz plik z dysku
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    const file = e.target.files[0];
                                                    const formData = new FormData();
                                                    formData.append('file', file);

                                                    // Optimistic update (show generic loader or keep old until done?) mechanism:
                                                    // Ideally we need loading state, but let's keep it simple for now or adding a small toast
                                                    try {
                                                        const { uploadContactLogo } = await import('../app/[locale]/actions'); // Dynamic import to avoid circular dep issues in client component if any
                                                        const res = await uploadContactLogo(formData);
                                                        if (res.success && res.url) {
                                                            setSettings({ ...settings, logo_url: res.url });
                                                        } else {
                                                            alert('Błąd przesyłania: ' + res.error);
                                                        }
                                                    } catch (err) {
                                                        console.error(err);
                                                        alert('Wystąpił błąd podczas przesyłania pliku.');
                                                    }
                                                }
                                            }}
                                        />
                                    </label>
                                    <p className="mt-2 text-xs text-gray-500">Zalecany format: PNG, JPG. Maks. 2MB.</p>
                                    {/* Fallback for manual URL if needed, or just hidden */}
                                    {/* <Input label="lub wklej URL" value={settings.logo_url} onChange={(e) => setSettings({...settings, logo_url: e.target.value})} className="mt-2" /> */}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700 mb-1">Kod Iframe Mapy Google</label>
                            <textarea
                                className="w-full p-3 border rounded-lg h-24 text-xs font-mono focus:ring-2 focus:ring-red-500 outline-none transition-all"
                                value={settings.google_maps_iframe}
                                onChange={(e) => setSettings({ ...settings, google_maps_iframe: e.target.value })}
                                placeholder='<iframe src="..." ...></iframe>'
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <Button
                        variant="primary"
                        size="lg"
                        className="px-12"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'Zapisywanie...' : 'Zapisz Dane Kontaktu'}
                    </Button>
                </div>
            </div>
        </Card>
    );
}
