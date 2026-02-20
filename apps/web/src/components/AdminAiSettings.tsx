'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Card } from '@bolglass/ui';
import { getSystemSettings, updateSystemSetting } from '../app/[locale]/actions';
import { Bot, Key, Sparkles, Save, Eye, EyeOff } from 'lucide-react';

export default function AdminAiSettings() {
    const [settings, setSettings] = useState({
        openai_api_key: '',
        ai_translation_prompt: 'Jesteś ekspertem od tłumaczeń w branży e-commerce, specjalizującym się w luksusowych produktach rzemieślniczych i szklanych ozdobach choinkowych marki Bolglass. Tłumacz teksty z zachowaniem kontekstu branżowego, elegancji oraz specyfiki rzemiosła huty szkła.'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showKey, setShowKey] = useState(false);

    useEffect(() => {
        async function fetchSettings() {
            const data = await getSystemSettings();
            setSettings(prev => ({
                ...prev,
                openai_api_key: data.openai_api_key || '',
                ai_translation_prompt: data.ai_translation_prompt || prev.ai_translation_prompt
            }));
            setLoading(false);
        }
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateSystemSetting('openai_api_key', settings.openai_api_key);
            await updateSystemSetting('ai_translation_prompt', settings.ai_translation_prompt);
            alert('Ustawienia AI zostały zapisane!');
        } catch (error) {
            console.error('Failed to save AI settings:', error);
            alert('Wystąpił błąd podczas zapisywania.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Ładowanie ustawień AI...</div>;

    return (
        <Card className="p-8 bg-white shadow-xl border border-gray-100 overflow-hidden relative">
            {/* Background Accent */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-50 rounded-full opacity-50 blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                            <Bot className="w-7 h-7 text-blue-600" />
                            Sztuczna Inteligencja
                        </h2>
                        <p className="text-gray-500 text-sm mt-1 font-medium">Konfiguracja automatycznych tłumaczeń i generatorów treści.</p>
                    </div>
                    <div className="bg-blue-50 px-3 py-1 rounded-full text-blue-700 text-xs font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        AI POWERED
                    </div>
                </div>

                <div className="space-y-6">
                    {/* API Key */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            <Key className="w-4 h-4" /> Klucz API OpenAI
                        </label>
                        <div className="relative">
                            <input
                                type={showKey ? "text" : "password"}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none transition-all pr-12"
                                value={settings.openai_api_key}
                                onChange={(e) => setSettings({ ...settings, openai_api_key: e.target.value })}
                                placeholder="sk-..."
                            />
                            <button
                                type="button"
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium px-1 uppercase tracking-wider">
                            Klucz jest przechowywany bezpiecznie w bazie danych aplikacji.
                        </p>
                    </div>

                    {/* System Prompt */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Globalny Prompt Tłumaczenia
                        </label>
                        <textarea
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl h-40 text-sm leading-relaxed focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner"
                            value={settings.ai_translation_prompt}
                            onChange={(e) => setSettings({ ...settings, ai_translation_prompt: e.target.value })}
                            placeholder="Wpisz instrukcje dla AI..."
                        />
                        <p className="text-xs text-gray-500 font-medium">
                            Ten opis posłuży jako instrukcja dla AI podczas tłumaczenia produktów, kategorii i opcji konfiguratora.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <Button
                        variant="primary"
                        size="md"
                        className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg shadow-blue-200"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Zapisywanie...' : 'Zapisz Konfigurację AI'}
                    </Button>
                </div>
            </div>
        </Card>
    );
}
