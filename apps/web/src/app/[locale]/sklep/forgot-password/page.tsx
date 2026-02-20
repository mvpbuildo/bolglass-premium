'use client';

import { Button, Card } from "@bolglass/ui";
import { Link } from "@/i18n/navigation";
import { useState } from "react";
import { forgotPasswordAction } from "./actions";
import { useTranslations } from 'next-intl';

export default function ForgotPasswordPage() {
    const t = useTranslations('Auth.forgotPassword');
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        setError(null);

        try {
            const result = await forgotPasswordAction(email);
            if (result.error) {
                setError(result.error);
            } else {
                setMessage(t('successMessage'));
            }
        } catch {
            setError(t('errorMessage'));
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md p-8 space-y-6 bg-white shadow-xl rounded-2xl">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('title')}</h1>
                    <p className="text-gray-500">{t('subtitle')}</p>
                </div>

                {message && (
                    <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm text-center font-medium border border-green-100">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1">{t('emailLabel')}</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                            placeholder={t('emailPlaceholder')}
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 text-lg font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg transition-all disabled:opacity-50"
                    >
                        {isLoading ? t('sending') : t('submit')}
                    </Button>
                </form>

                <p className="text-center text-sm text-gray-500">
                    {t('backTo')} <Link href="/sklep/login" className="text-red-600 font-bold hover:underline">{t('loginLink')}</Link>
                </p>
            </Card>
        </div>
    );
}
