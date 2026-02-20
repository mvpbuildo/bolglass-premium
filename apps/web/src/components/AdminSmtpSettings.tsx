'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Card } from '@bolglass/ui';
import { getAdminEmailSettings, updateAdminEmailSettings } from '../app/[locale]/actions';
import { EMAIL_SETTING_KEYS } from '@/lib/mail-constants';
import { toast } from 'sonner';

export default function AdminSmtpSettings() {
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
                toast.success('Zapisano ustawienia SMTP!');
            } else {
                toast.error('Błąd: ' + result.error);
            }
        } catch (error) {
            console.error('Failed to save SMTP settings:', error);
            toast.error('Wystąpił błąd podczas zapisywania.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Ładowanie konfiguracji SMTP...</div>;

    return (
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

            <div className="mt-8 flex justify-end">
                <Button
                    variant="primary"
                    size="lg"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? 'Zapisywanie...' : 'Zapisz Konfigurację SMTP'}
                </Button>
            </div>
        </Card>
    );
}
