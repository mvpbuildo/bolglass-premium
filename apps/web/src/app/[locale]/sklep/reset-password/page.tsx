'use client';

import { Button, Card } from "@bolglass/ui";
import { Link, useRouter } from "@/i18n/navigation";
import { useState, Suspense } from "react";
import { resetPasswordAction } from "./actions";
import { useSearchParams } from "next/navigation";
import { useTranslations } from 'next-intl';

function ResetPasswordForm() {
    const t = useTranslations('Auth.resetPassword');
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    if (!token || !email) {
        return (
            <div className="text-center space-y-4">
                <p className="text-red-600 font-medium">{t('errorInvalidToken')}</p>
                <Link href="/sklep/forgot-password" title={t('sendNewLink')} className="text-red-600 font-bold hover:underline">{t('sendNewLink')}</Link>
            </div>
        );
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError(t('errorMismatch'));
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await resetPasswordAction({ token, email, password });
            if (result.error) {
                setError(result.error);
            } else {
                router.push("/sklep/login?reset=success");
            }
        } catch {
            setError(t('errorUnexpected'));
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1">{t('newPasswordLabel')}</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                />
            </div>
            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700 mb-1">{t('confirmPasswordLabel')}</label>
                <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                />
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium">
                    {error}
                </div>
            )}

            <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 text-lg font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg transition-all disabled:opacity-50"
            >
                {isLoading ? t('submitting') : t('submit')}
            </Button>
        </form>
    );
}

export default function ResetPasswordPage() {
    const t = useTranslations('Auth.resetPassword');
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md p-8 space-y-6 bg-white shadow-xl rounded-2xl">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('title')}</h1>
                    <p className="text-gray-500">{t('subtitle')}</p>
                </div>

                <Suspense fallback={<div className="text-center text-gray-500">{t('loading')}</div>}>
                    <ResetPasswordForm />
                </Suspense>

                <p className="text-center text-sm text-gray-500">
                    {t('backTo')} <Link href="/sklep/login" className="text-red-600 font-bold hover:underline">{t('backToLogin')}</Link>
                </p>
            </Card>
        </div>
    );
}
