'use client';

import { useState } from 'react';
import { Card, Button } from "@bolglass/ui";
import { Settings, Trash2, AlertTriangle, Key, CheckCircle2 } from "lucide-react";
import { deleteCurrentUserAccount } from '../../actions';
import { changePassword } from './actions';
import { signOut } from 'next-auth/react';

export default function SettingsPage() {
    // Delete Account states
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // Password Change states
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        setDeleteError(null);
        try {
            const res = await deleteCurrentUserAccount();
            if (res.success) {
                await signOut({ callbackUrl: '/' });
            } else {
                setDeleteError(res.error || "Wystąpił nieoczekiwany błąd.");
                setIsDeleting(false);
                setIsConfirmingDelete(false);
            }
        } catch (err: any) {
            setDeleteError(err.message || "Błąd połączenia.");
            setIsDeleting(false);
            setIsConfirmingDelete(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsChangingPassword(true);
        setPasswordError(null);
        setPasswordSuccess(false);

        const formData = new FormData(e.currentTarget);
        try {
            const res = await changePassword(formData);
            if (res.success) {
                setPasswordSuccess(true);
                e.currentTarget.reset();
            } else {
                setPasswordError(res.error || "Błąd zmiany hasła.");
            }
        } catch (err: any) {
            setPasswordError("Błąd serwera.");
        } finally {
            setIsChangingPassword(false);
        }
    };

    const inputClasses = "w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-gray-900 placeholder-gray-400 bg-white transition-all mb-4";
    const labelClasses = "block text-sm font-semibold text-gray-700 mb-1.5";

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Ustawienia Konta</h1>
                <p className="text-gray-400 text-sm">Zarządzaj swoim kontem i preferencjami.</p>
            </div>

            {/* Password Change Section */}
            <Card className="p-6 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b">
                    <div className="bg-blue-50 p-2 rounded-lg">
                        <Key className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="font-semibold text-gray-800">Zmiana Hasła</h2>
                </div>

                <form onSubmit={handlePasswordChange} className="max-w-md">
                    <div>
                        <label className={labelClasses}>Aktualne Hasło</label>
                        <input
                            type="password"
                            name="currentPassword"
                            className={inputClasses}
                            required
                        />
                    </div>
                    <div>
                        <label className={labelClasses}>Nowe Hasło</label>
                        <input
                            type="password"
                            name="newPassword"
                            className={inputClasses}
                            required
                            minLength={6}
                        />
                    </div>
                    <div>
                        <label className={labelClasses}>Potwierdź Nowe Hasło</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className={inputClasses}
                            required
                        />
                    </div>

                    {passwordError && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded text-red-700 text-sm flex items-center gap-2 mb-4">
                            <AlertTriangle className="w-4 h-4" />
                            {passwordError}
                        </div>
                    )}

                    {passwordSuccess && (
                        <div className="p-3 bg-green-50 border border-green-100 rounded text-green-700 text-sm flex items-center gap-2 mb-4">
                            <CheckCircle2 className="w-4 h-4" />
                            Hasło zostało pomyślnie zmienione!
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isChangingPassword}
                        variant="primary"
                        className="w-full md:w-auto"
                    >
                        {isChangingPassword ? "Zmienianie..." : "Zaktualizuj Hasło"}
                    </Button>
                </form>
            </Card>

            {/* Danger Zone Section */}
            <Card className="p-6 space-y-6 border-red-100 bg-red-50/30">
                <div className="flex items-center gap-3 pb-4 border-b border-red-100">
                    <div className="bg-red-100 p-2 rounded-lg">
                        <Trash2 className="w-5 h-5 text-red-600" />
                    </div>
                    <h2 className="font-semibold text-red-800">Strefa Niebezpieczna</h2>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                        <p className="font-bold text-gray-900">Usuń moje konto</p>
                        <p className="text-sm text-gray-600 max-w-xl">
                            Trwale usunie Twoje dane logowania, adresy i profil.
                            <span className="font-semibold"> Historia zamówień oraz rezerwacji zostanie zachowana w systemie</span> ze względów księgowych i prawnych.
                        </p>
                    </div>

                    {!isConfirmingDelete ? (
                        <Button
                            variant="primary"
                            className="bg-red-600 hover:bg-red-700 text-white border-none"
                            onClick={() => setIsConfirmingDelete(true)}
                        >
                            Usuń Konto
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsConfirmingDelete(false)}
                                disabled={isDeleting}
                            >
                                Anuluj
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                className="bg-red-700 hover:bg-red-800 border-none"
                                onClick={handleDeleteAccount}
                                disabled={isDeleting}
                            >
                                {isDeleting ? "Usuwanie..." : "Tak, Usuń trwale"}
                            </Button>
                        </div>
                    )}
                </div>

                {deleteError && (
                    <div className="p-3 bg-red-100 border border-red-200 rounded text-red-700 text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {deleteError}
                    </div>
                )}
            </Card>
        </div>
    );
}
