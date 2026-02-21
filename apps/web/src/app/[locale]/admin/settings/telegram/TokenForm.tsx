'use client';

import { toast } from 'sonner';
import { updateTelegramToken } from './actions';
import { useTransition } from 'react';

export default function TokenForm({ defaultValue }: { defaultValue: string }) {
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (formData: FormData) => {
        startTransition(async () => {
            await updateTelegramToken(formData);
            toast.success('Klucz API zapisany pomyślnie!');
        });
    };

    return (
        <form action={handleSubmit} className="flex gap-4 items-end">
            <div className="flex-grow">
                <label className="block text-sm font-bold text-gray-700 mb-1">Telegram HTTP API Token</label>
                <input
                    type="text"
                    name="token"
                    defaultValue={defaultValue}
                    placeholder="np. 7123456789:AAHzX-aBcDeFgHiJkLmNoPqRsTuVwXyZ123"
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    disabled={isPending}
                />
            </div>
            <button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors h-[42px] disabled:opacity-50">
                {isPending ? 'Zapisywanie...' : 'Zapisz Token'}
            </button>
        </form>
    );
}
