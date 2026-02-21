'use client';

import { signIn } from "next-auth/react";
import { Button } from "@bolglass/ui";
import { Card } from "@bolglass/ui";
import { Link } from "@/i18n/navigation";
import { useState } from "react";
import { useTranslations } from 'next-intl';
import { Turnstile } from '@marsidev/react-turnstile';

export default function ShopLoginPage() {
    const t = useTranslations('Auth.login');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState<string>('');
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const res = await signIn("credentials", {
                email,
                password,
                turnstileToken,
                redirect: false,
            });

            if (res?.error) {
                setError(t('errorInvalid'));
            } else {
                window.location.href = "/sklep";
            }
        } catch {
            setError(t('errorUnexpected'));
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

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium">
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
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                            placeholder={t('emailPlaceholder')}
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label htmlFor="password" className="block text-sm font-bold text-gray-700">{t('passwordLabel')}</label>
                            <Link href="/sklep/forgot-password" title={t('forgotPassword')} className="text-xs text-red-600 hover:underline">{t('forgotPassword')}</Link>
                        </div>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        />
                    </div>
                    {siteKey && (
                        <div className="flex justify-center my-4">
                            <Turnstile
                                siteKey={siteKey}
                                onSuccess={setTurnstileToken}
                                onError={() => setError(t('errorUnexpected') ?? 'Weryfikacja nie powiodła się.')}
                            />
                        </div>
                    )}
                    <Button
                        type="submit"
                        disabled={isLoading || (!!siteKey && !turnstileToken)}
                        className="w-full py-4 text-lg font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg transition-all disabled:opacity-50"
                    >
                        {isLoading ? t('submitting') : t('submit')}
                    </Button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-400">{t('orDivider')}</span>
                    </div>
                </div>

                <Button
                    onClick={() => signIn("google", { callbackUrl: "/sklep", redirectTo: "/sklep" })}
                    variant="outline"
                    className="w-full py-4 text-lg font-medium border-gray-300 flex items-center justify-center gap-3 rounded-xl hover:bg-gray-50"
                >
                    <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span className="text-gray-700">{t('googleLogin')}</span>
                </Button>

                <p className="text-center text-sm text-gray-500">
                    {t('noAccount')} <Link href="/sklep/register" className="text-red-600 font-bold hover:underline">{t('registerLink')}</Link>
                </p>
            </Card>
        </div>
    )
}
