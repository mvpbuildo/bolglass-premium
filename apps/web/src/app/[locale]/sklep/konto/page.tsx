'use client';

import { Button, Card } from "@bolglass/ui";
import { useState } from "react";
import { changePasswordAction } from "./actions";

export default function AccountPage() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (newPassword !== confirmPassword) {
            setError("Nowe hasła muszą być identyczne.");
            return;
        }

        setIsLoading(true);

        try {
            const result = await changePasswordAction({ currentPassword, newPassword });
            if (result.error) {
                setError(result.error);
            } else {
                setSuccess("Hasło zostało pomyślnie zmienione.");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
        } catch (error) {
            setError("Wystąpił błąd. Spróbuj ponownie później.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Moje Konto</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <nav className="space-y-1">
                        <button className="w-full text-left px-4 py-2 text-sm font-medium rounded-md bg-red-50 text-red-700">
                            Zmień hasło
                        </button>
                        {/* More account sections can be added here later */}
                    </nav>
                </div>

                <div className="md:col-span-2">
                    <Card className="p-6 bg-white shadow rounded-xl">
                        <h2 className="text-xl font-bold mb-6">Zmiana hasła</h2>

                        {success && (
                            <div className="mb-6 bg-green-50 text-green-700 p-3 rounded-lg text-sm font-medium border border-green-100">
                                {success}
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="currentPassword" class="block text-sm font-bold text-gray-700 mb-1">Obecne hasło</label>
                                <input
                                    id="currentPassword"
                                    type="password"
                                    required
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                                />
                            </div>
                            <div>
                                <label htmlFor="newPassword" class="block text-sm font-bold text-gray-700 mb-1">Nowe hasło</label>
                                <input
                                    id="newPassword"
                                    type="password"
                                    required
                                    minLength={6}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                                />
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" class="block text-sm font-bold text-gray-700 mb-1">Powtórz nowe hasło</label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    required
                                    minLength={6}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="mt-4 px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md transition-all disabled:opacity-50"
                            >
                                {isLoading ? 'Trwa zmiana...' : 'Zaktualizuj hasło'}
                            </Button>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
}
