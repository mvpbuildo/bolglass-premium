'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Card } from '@bolglass/ui';
import { getAdminEmailSettings, updateAdminEmailSettings } from '../app/[locale]/actions';
import { getApiStatuses, type ApiStatusData } from '../app/[locale]/admin/settings/shop/status-actions';
import { EMAIL_SETTING_KEYS } from '@/lib/mail-constants';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Coins, Sparkles, MessageSquare } from 'lucide-react';

export default function AdminShopSettings() {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [apiStatus, setApiStatus] = useState<ApiStatusData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const [data, statuses] = await Promise.all([
                    getAdminEmailSettings(),
                    getApiStatuses()
                ]);
                setSettings(data);
                setApiStatus(statuses);
            } catch (error) {
                console.error('Failed to fetch shop settings/status:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
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
            {/* API STATUS SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-white shadow-xl border border-gray-100 overflow-hidden relative">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2 px-1">Integracja AI</p>
                            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-purple-500" />
                                OpenAI Translation
                            </h3>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                            <motion.div
                                animate={{ opacity: [1, 0.4, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className={`w-3 h-3 rounded-full shadow-[0_0_8px] ${apiStatus?.ai.active ? 'bg-green-500 shadow-green-500/50' : 'bg-red-500 shadow-red-500/50'}`}
                            />
                            <span className={`text-[10px] font-black uppercase tracking-wider ${apiStatus?.ai.active ? 'text-green-600' : 'text-red-600'}`}>
                                {apiStatus?.ai.active ? 'Aktywne' : 'Nieaktywne'}
                            </span>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 font-medium">
                        <MessageSquare className="w-4 h-4" />
                        Automatyczne tłumaczenia 3D & Produktów
                    </div>
                </Card>

                <Card className="p-6 bg-white shadow-xl border border-gray-100 overflow-hidden relative">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2 px-1">Kursy Walut</p>
                            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                <Coins className="w-5 h-5 text-amber-500" />
                                Narodowy Bank Polski
                            </h3>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                            <motion.div
                                animate={{ opacity: [1, 0.4, 1] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                                className={`w-3 h-3 rounded-full shadow-[0_0_8px] ${apiStatus?.nbp.active ? 'bg-green-500 shadow-green-500/50' : 'bg-red-500 shadow-red-500/50'}`}
                            />
                            <span className={`text-[10px] font-black uppercase tracking-wider ${apiStatus?.nbp.active ? 'text-green-600' : 'text-red-600'}`}>
                                {apiStatus?.nbp.active ? 'Połączono' : 'Błąd'}
                            </span>
                        </div>
                    </div>

                    {apiStatus?.nbp.active && (
                        <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-end">
                            <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Aktualny Kurs EUR</p>
                                <p className="text-2xl font-black text-amber-600 leading-none">1 EUR = {apiStatus.nbp.rate.toFixed(4)} PLN</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Ostatnia Aktualizacja</p>
                                <p className="text-[11px] font-bold text-gray-600">{new Date(apiStatus.nbp.updatedAt).toLocaleDateString()} {new Date(apiStatus.nbp.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

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
