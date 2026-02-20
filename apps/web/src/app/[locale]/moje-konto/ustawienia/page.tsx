'use client';

import { useState } from 'react';
import { Card, Button } from "@bolglass/ui";
import { Settings, Trash2, AlertTriangle } from "lucide-react";
import { deleteCurrentUserAccount } from '../../actions';
import { signOut } from 'next-auth/react';

export default function SettingsPage() {
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        setError(null);
        try {
            const res = await deleteCurrentUserAccount();
            if (res.success) {
                // Logout and redirect
                await signOut({ callbackUrl: '/' });
            } else {
                setError(res.error || "Wystąpił nieoczekiwany błąd.");
                setIsDeleting(false);
                setIsConfirmingDelete(false);
            }
        } catch (err: any) {
            setError(err.message || "Błąd połączenia.");
            setIsDeleting(false);
            setIsConfirmingDelete(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Ustawienia Konta</h1>
                <p className="text-gray-500 text-sm">Zarządzaj swoim kontem i preferencjami.</p>
            </div>

            <Card className="p-6 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b">
                    <div className="bg-blue-50 p-2 rounded-lg">
                        <Settings className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="font-semibold text-gray-800">Hasło i Zabezpieczenia</h2>
                </div>

                <p className="text-sm text-gray-500">
                    Opcja zmiany hasła zostanie udostępniona wkrótce. Skorzystaj z opcji "Przypomnij hasło" przy logowaniu, jeśli chcesz je teraz zresetować.
                </p>
            </Card>

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

                {error && (
                    <div className="p-3 bg-red-100 border border-red-200 rounded text-red-700 text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {error}
                    </div>
                )}
            </Card>
        </div>
    );
}
