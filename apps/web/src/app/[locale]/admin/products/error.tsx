'use client';

import { useEffect } from 'react';
import { Button } from '@bolglass/ui';
import { Link } from '@/i18n/navigation';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center border border-red-100">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                    ⚠️
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Błąd Serwera</h2>
                <p className="text-gray-500 mb-6 font-medium">
                    Wystąpił nieoczekiwany błąd podczas ładowania widoku produktów.
                </p>

                {error.digest && (
                    <div className="mb-6 p-3 bg-gray-50 rounded font-mono text-xs text-gray-400 break-all">
                        ID: {error.digest}
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    <Button
                        onClick={() => reset()}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold"
                    >
                        Spróbuj ponownie
                    </Button>
                    <Link href="/admin">
                        <Button variant="outline" className="w-full">
                            Wróć do panelu
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
