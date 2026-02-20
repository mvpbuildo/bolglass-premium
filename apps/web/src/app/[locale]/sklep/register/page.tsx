'use client';

import { Link } from '@/i18n/navigation';
import { Button, Card } from '@bolglass/ui';
import { useState } from 'react';
import { registerUser } from './actions';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';

export default function RegisterPage() {
    const t = useTranslations('Auth.register');
    const [isCompany, setIsCompany] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);
        setError(null);

        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (password !== confirmPassword) {
            setError(t('passwordMismatch'));
            setIsSubmitting(false);
            return;
        }

        const res = await registerUser(formData);

        if (res?.error) {
            setError(res.error);
            setIsSubmitting(false);
        } else {
            const email = formData.get('email') as string;
            await signIn('credentials', {
                email,
                password,
                callbackUrl: '/sklep'
            });
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 py-12">
            <Card className="w-full max-w-2xl p-8 space-y-6 bg-white shadow-xl rounded-2xl">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('title')}</h1>
                    <p className="text-gray-500">{t('subtitle')}</p>
                </div>

                <div className="flex justify-center gap-4 bg-gray-100 p-1 rounded-lg w-max mx-auto">
                    <button
                        onClick={() => setIsCompany(false)}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${!isCompany ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        {t('individualClient')}
                    </button>
                    <button
                        onClick={() => setIsCompany(true)}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${isCompany ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        {t('company')}
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <form action={handleSubmit} className="space-y-6 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1">{t('emailLabel')}</label>
                            <input id="email" name="email" type="email" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1">{t('passwordLabel')}</label>
                            <input id="password" name="password" type="password" required minLength={6} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700 mb-1">{t('confirmPasswordLabel')}</label>
                            <input id="confirmPassword" name="confirmPassword" type="password" required minLength={6} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="text-sm font-bold text-gray-900 mb-4">
                            {isCompany ? t('companyData') : t('personalData')} ({t('shippingAddress')})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {isCompany && (
                                <>
                                    <div className="col-span-2">
                                        <label htmlFor="companyName" className="block text-sm font-bold text-gray-700 mb-1">{t('companyName')}</label>
                                        <input id="companyName" name="companyName" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                                    </div>
                                    <div className="col-span-2">
                                        <label htmlFor="nip" className="block text-sm font-bold text-gray-700 mb-1">{t('nipLabel')}</label>
                                        <input id="nip" name="nip" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                                    </div>
                                </>
                            )}

                            {!isCompany && (
                                <div className="col-span-2">
                                    <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-1">{t('fullName')}</label>
                                    <input id="name" name="name" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                                </div>
                            )}

                            <div className="col-span-2">
                                <label htmlFor="street" className="block text-sm font-bold text-gray-700 mb-1">{t('streetLabel')}</label>
                                <input id="street" name="street" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                            </div>
                            <div>
                                <label htmlFor="zipCode" className="block text-sm font-bold text-gray-700 mb-1">{t('zipLabel')}</label>
                                <input id="zipCode" name="zipCode" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="00-000" />
                            </div>
                            <div>
                                <label htmlFor="city" className="block text-sm font-bold text-gray-700 mb-1">{t('cityLabel')}</label>
                                <input id="city" name="city" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                            </div>
                            <div className="col-span-2">
                                <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-1">{t('phoneLabel')}</label>
                                <input id="phone" name="phone" required type="tel" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                            </div>
                        </div>
                    </div>

                    <input type="hidden" name="isCompany" value={isCompany ? 'true' : 'false'} />

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 text-lg font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? t('submitting') : t('submit')}
                    </Button>

                    <p className="text-center text-sm text-gray-500">
                        {t('hasAccount')} <Link href="/sklep/login" className="text-red-600 hover:underline">{t('loginLink')}</Link>
                    </p>
                </form>
            </Card>
        </div>
    );
}
