'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Card } from '@bolglass/ui';
import { getAdminEmailSettings, updateAdminEmailSettings } from '../app/[locale]/actions';
import { EMAIL_SETTING_KEYS } from '@/lib/mail-constants';

export default function AdminEmailSettings() {
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
                alert('Zapisano ustawienia e-mail!');
            } else {
                alert('Błąd: ' + result.error);
            }
        } catch (error) {
            console.error('Failed to save email settings:', error);
            alert('Wystąpił błąd podczas zapisywania.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Ładowanie ustawień e-mail...</div>;

    return (
        <div className="space-y-8">
            <Card className="p-8 bg-white shadow-xl border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                    📧 Konfiguracja Serwera (SMTP)
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
                <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                    📝 Treść Potwierdzeń
                </h2>

                <div className="space-y-8">
                    <div className="p-6 border rounded-xl bg-blue-50/30 border-blue-100">
                        <h3 className="font-bold text-lg mb-4 text-blue-800">👁️ Zwiedzanie (Sightseeing)</h3>
                        <Input
                            label="Temat wiadomości"
                            className="mb-4"
                            value={settings[EMAIL_SETTING_KEYS.EMAIL_SUBJECT_SIGHTSEEING] || ''}
                            onChange={(e) => handleChange(EMAIL_SETTING_KEYS.EMAIL_SUBJECT_SIGHTSEEING, e.target.value)}
                        />
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700 mb-1">Treść wiadomości</label>
                            <textarea
                                className="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={settings[EMAIL_SETTING_KEYS.EMAIL_BODY_SIGHTSEEING] || ''}
                                onChange={(e) => handleChange(EMAIL_SETTING_KEYS.EMAIL_BODY_SIGHTSEEING, e.target.value)}
                                placeholder="Dostępne tagi: {{name}}, {{date}}, {{people}}, {{total}}, {{type}}"
                            />
                        </div>
                    </div>

                    <div className="p-6 border rounded-xl bg-orange-50/30 border-orange-100">
                        <h3 className="font-bold text-lg mb-4 text-orange-800">🎨 Warsztaty (Workshop)</h3>
                        <Input
                            label="Temat wiadomości"
                            className="mb-4"
                            value={settings[EMAIL_SETTING_KEYS.EMAIL_SUBJECT_WORKSHOP] || ''}
                            onChange={(e) => handleChange(EMAIL_SETTING_KEYS.EMAIL_SUBJECT_WORKSHOP, e.target.value)}
                        />
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700 mb-1">Treść wiadomości</label>
                            <textarea
                                className="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                value={settings[EMAIL_SETTING_KEYS.EMAIL_BODY_WORKSHOP] || ''}
                                onChange={(e) => handleChange(EMAIL_SETTING_KEYS.EMAIL_BODY_WORKSHOP, e.target.value)}
                                placeholder="Dostępne tagi: {{name}}, {{date}}, {{people}}, {{total}}, {{type}}"
                            />
                        </div>
                    </div>

                    <div className="p-6 border rounded-xl bg-purple-50/30 border-purple-100">
                        <h3 className="font-bold text-lg mb-4 text-purple-800">⏰ Przypomnienie (Reminder)</h3>
                        <Input
                            label="Temat wiadomości"
                            className="mb-4"
                            value={settings[EMAIL_SETTING_KEYS.EMAIL_SUBJECT_REMINDER] || ''}
                            onChange={(e) => handleChange(EMAIL_SETTING_KEYS.EMAIL_SUBJECT_REMINDER, e.target.value)}
                        />
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700 mb-1">Treść wiadomości</label>
                            <textarea
                                className="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                value={settings[EMAIL_SETTING_KEYS.EMAIL_BODY_REMINDER] || ''}
                                onChange={(e) => handleChange(EMAIL_SETTING_KEYS.EMAIL_BODY_REMINDER, e.target.value)}
                                placeholder="Dostępne tagi: {{name}}, {{date}}, {{people}}, {{total}}, {{type}}"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-between items-center text-xs text-gray-400">
                    <p>Dostępne tagi: <code className="bg-gray-100 px-1 rounded">{'{{name}}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{{date}}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{{people}}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{{total}}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{{type}}'}</code></p>
                    <Button
                        variant="primary"
                        size="lg"
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
