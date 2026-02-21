'use client';

import { signIn } from "next-auth/react";
import { Button } from "@bolglass/ui";
import { Card } from "@bolglass/ui";
import { useState } from "react";
import { Turnstile } from '@marsidev/react-turnstile';

export default function LoginPage() {
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
                setError("Błędny e-mail lub hasło.");
            } else {
                window.location.href = "/admin";
            }
        } catch (err) {
            setError("Wystąpił nieoczekiwany błąd.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md p-8 space-y-6 bg-white shadow-xl rounded-2xl">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Panel Administratora</h1>
                    <p className="text-gray-500">Zaloguj się, aby zarządzać serwisem.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1">E-mail</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                            placeholder="twoj-admin@email.pl"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1">Hasło</label>
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
                                onError={() => setError('Weryfikacja bezpieczeństwa (Cloudflare) nie powiodła się. Odśwież stronę.')}
                            />
                        </div>
                    )}
                    <Button
                        type="submit"
                        disabled={isLoading || (!!siteKey && !turnstileToken)}
                        className="w-full py-4 text-lg font-bold bg-gray-900 hover:bg-black text-white rounded-xl shadow-lg transition-all disabled:opacity-50"
                    >
                        {isLoading ? 'Logowanie...' : 'Zaloguj się'}
                    </Button>
                </form>
            </Card>
        </div>
    )
}
