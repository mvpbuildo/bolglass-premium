'use client';

import { Link } from '@/i18n/navigation';
import { Button, Card } from '@bolglass/ui';
import { useState } from 'react';
import { registerUser } from './actions';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
    const [isCompany, setIsCompany] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);
        setError(null);

        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (password !== confirmPassword) {
            setError("Hasła nie są identyczne.");
            setIsSubmitting(false);
            return;
        }

        const res = await registerUser(formData);

        if (res?.error) {
            setError(res.error);
            setIsSubmitting(false);
        } else {
            // Success - Auto login
            // We use next-auth signIn with credentials
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
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Załóż konto</h1>
                    <p className="text-gray-500">Dołącz do Bolglass, aby wygodnie zamawiać.</p>
                </div>

                <div className="flex justify-center gap-4 bg-gray-100 p-1 rounded-lg w-max mx-auto">
                    <button
                        onClick={() => setIsCompany(false)}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${!isCompany ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Klient Indywidualny
                    </button>
                    <button
                        onClick={() => setIsCompany(true)}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${isCompany ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Firma
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <form action={handleSubmit} className="space-y-6">
                    {/* Common Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                            <input name="email" type="email" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Hasło</label>
                            <input name="password" type="password" required minLength={6} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Powtórz Hasło</label>
                            <input name="confirmPassword" type="password" required minLength={6} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="text-sm font-bold text-gray-900 mb-4">{isCompany ? 'Dane Firmowe' : 'Dane Osobowe'} (Adres Dostawy)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {isCompany && (
                                <>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Nazwa Firmy</label>
                                        <input name="companyName" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-1">NIP</label>
                                        <input name="nip" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                                    </div>
                                </>
                            )}

                            {!isCompany && (
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Imię i Nazwisko</label>
                                    <input name="name" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                                </div>
                            )}

                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Ulica i Numer</label>
                                <input name="street" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Kod Pocztowy</label>
                                <input name="zipCode" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="00-000" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Miasto</label>
                                <input name="city" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Telefon</label>
                                <input name="phone" required type="tel" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                            </div>
                        </div>
                    </div>

                    <input type="hidden" name="isCompany" value={isCompany ? 'true' : 'false'} />

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 text-lg font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? 'Tworzenie konta...' : 'Zarejestruj się'}
                    </Button>

                    <p className="text-center text-sm text-gray-500">
                        Masz już konto? <Link href="/sklep/login" className="text-red-600 hover:underline">Zaloguj się</Link>
                    </p>
                </form>
            </Card>
        </div>
    );
}
