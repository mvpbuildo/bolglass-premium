'use client';

import { useState } from 'react';
import { Button, Card, Input } from '@bolglass/ui';
import { createUser } from './actions';
import { UserPlus, Loader2, X } from 'lucide-react';

export default function UserCreationForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        try {
            await createUser(formData);
            setIsOpen(false);
            (e.target as HTMLFormElement).reset();
        } catch (err: any) {
            setError(err.message || 'Wystąpił błąd');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <Button onClick={() => setIsOpen(true)} className="gap-2 font-bold">
                <UserPlus className="w-4 h-4" />
                DODAJ ADMINISTRATORA
            </Button>
        );
    }

    return (
        <Card className="p-6 border-2 border-red-100 shadow-xl animate-in slide-in-from-top duration-300">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase">Nowy Administrator</h3>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-900">
                    <X className="w-5 h-5" />
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-bold text-gray-700">Imię i Nazwisko</label>
                        <Input id="name" name="name" placeholder="np. Jan Kowalski" required />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-bold text-gray-700">Adres Email</label>
                        <Input id="email" name="email" type="email" placeholder="jan@bolann.cloud" required />
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-bold text-gray-700">Hasło tymczasowe</label>
                    <Input id="password" name="password" type="password" placeholder="••••••••" required />
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                        Hasło musi zawierać minimum 8 znaków.
                    </p>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-bold border border-red-100 italic">
                        {error}
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
                        ANULUJ
                    </Button>
                    <Button type="submit" className="gap-2 min-w-[140px]" disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                        STWÓRZ KONTO
                    </Button>
                </div>
            </form>
        </Card>
    );
}
