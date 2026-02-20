'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Card } from '@bolglass/ui';
import { getAdminEmailSettings, updateAdminEmailSettings } from '../app/[locale]/actions';
import { EMAIL_SETTING_KEYS } from '@/lib/mail-constants';
import { toast } from 'sonner';

export default function AdminShopSettings() {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function fetchSettings() {
            const data = await getAdminEmailSettings();
            setSettings(data);
            setLoading(false);
        }
        fetchSettings();
    }, []);

    const handleChange = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const result = await updateAdminEmailSettings(settings);
            if (result.success) {
                toast.success('Zapisano ustawienia sklepu!');
            } else {
                toast.error('Błąd: ' + result.error);
            }
        } catch (error) {
            console.error('Failed to save shop settings:', error);
            toast.error('Wystąpił błąd podczas zapisywania.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Ładowanie konfiguracji sklepu...</div>;

    const languages = [
        { code: 'PL', subject: EMAIL_SETTING_KEYS.ORDER_CONFIRM_SUBJECT_PL, body: EMAIL_SETTING_KEYS.ORDER_CONFIRM_BODY_PL, color: 'blue' },
        { code: 'EN', subject: EMAIL_SETTING_KEYS.ORDER_CONFIRM_SUBJECT_EN, body: EMAIL_SETTING_KEYS.ORDER_CONFIRM_BODY_EN, color: 'indigo' },
        { code: 'DE', subject: EMAIL_SETTING_KEYS.ORDER_CONFIRM_SUBJECT_DE, body: EMAIL_SETTING_KEYS.ORDER_CONFIRM_BODY_DE, color: 'gray' }
    ];

    return (
        <div className="space-y-8">
            <Card className="p-8 bg-white shadow-xl border border-gray-100">
                <h2 className="text-2xl font-black mb-6 text-gray-900 flex items-center gap-2">
                    📧 Konfiguracja SMTP
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Host SMTP (np. mail.bolann.cloud)"
                        value={settings[EMAIL_SETTING_KEYS.SMTP_HOST] || ''}
                        onChange={(e) => handleChange(EMAIL_SETTING_KEYS.SMTP_HOST, e.target.value)}
                    />
                    <Input
                        label="Port (np. 587)"
                        value={settings[EMAIL_SETTING_KEYS.SMTP_PORT] || ''}
                        onChange={(e) => handleChange(EMAIL_SETTING_KEYS.SMTP_PORT, e.target.value)}
                    />
                    <Input
                        label="Użytkownik / E-mail"
                        value={settings[EMAIL_SETTING_KEYS.SMTP_USER] || ''}
                        onChange={(e) => handleChange(EMAIL_SETTING_KEYS.SMTP_USER, e.target.value)}
                    />
                    <Input
                        label="Hasło"
                        type="password"
                        value={settings[EMAIL_SETTING_KEYS.SMTP_PASSWORD] || ''}
                        onChange={(e) => handleChange(EMAIL_SETTING_KEYS.SMTP_PASSWORD, e.target.value)}
                    />
                    <Input
                        label="E-mail nadawcy (FROM)"
                        value={settings[EMAIL_SETTING_KEYS.SMTP_FROM] || ''}
                        onChange={(e) => handleChange(EMAIL_SETTING_KEYS.SMTP_FROM, e.target.value)}
                    />
                </div>
            </Card>

            <Card className="p-8 bg-white shadow-xl border border-gray-100">
                <h2 className="text-2xl font-black mb-6 text-gray-900 flex items-center gap-2">
                    🛍️ Powiadomienia po zakupie
                </h2>
                <div className="space-y-8">
                    {languages.map(lang => (
                        <div key={lang.code} className={`p-6 border rounded-xl bg-${lang.color}-50/30 border-${lang.color}-100`}>
                            <h3 className={`font-black text-lg mb-4 text-${lang.color}-800 flex items-center gap-2`}>
                                <span className={`w-3 h-3 rounded-full bg-${lang.color}-500`}></span>
                                Język: {lang.code}
                            </h3>
                            <Input
                                label="Temat wiadomości"
                                className="mb-4"
                                value={settings[lang.subject] || ''}
                                onChange={(e) => handleChange(lang.subject, e.target.value)}
                            />
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-bold text-gray-700 mb-1">Treść wiadomości</label>
                                <textarea
                                    className={`w-full p-4 border rounded-xl h-40 focus:ring-2 focus:ring-${lang.color}-500 outline-none transition-all text-gray-900 bg-white font-medium`}
                                    value={settings[lang.body] || ''}
                                    onChange={(e) => handleChange(lang.body, e.target.value)}
                                    placeholder="Dostępne tagi: {{id}}, {{customerName}}, {{total}}, {{items}}, {{date}}"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <p className="font-bold mb-1 text-gray-500 uppercase tracking-widest">Dostępne tagi:</p>
                        <div className="flex flex-wrap gap-2">
                            {['{{id}}', '{{total}}', '{{items}}', '{{customerName}}', '{{date}}'].map(tag => (
                                <code key={tag} className="bg-white border px-1.5 py-0.5 rounded text-red-600 font-bold">{tag}</code>
                            ))}
                        </div>
                    </div>
                    <Button
                        variant="primary"
                        size="lg"
                        className="w-full md:w-auto px-8 py-4 text-lg"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'Zapisywanie...' : 'Zapisz Wszystkie Ustawienia'}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
