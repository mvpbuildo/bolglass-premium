'use client';

import { useState } from 'react';
import { Button } from '@bolglass/ui';
import { createCoupon } from './actions';
import { useRouter } from 'next/navigation';

export default function CouponForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);

        try {
            await createCoupon({
                code: formData.get('code') as string,
                type: formData.get('type') as string,
                value: parseFloat(formData.get('value') as string),
                minAmount: formData.get('minAmount') ? parseFloat(formData.get('minAmount') as string) : undefined,
                maxUses: formData.get('maxUses') ? parseInt(formData.get('maxUses') as string) : undefined,
                excludePromotions: formData.get('excludePromotions') === 'on'
            });
            //@ts-ignore
            e.target.reset();
            router.refresh();
        } catch (err) {
            alert('Wystąpił błąd podczas dodawania kodu.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Kod (Wielkie Litery)</label>
                <input
                    name="code"
                    required
                    className="w-full border rounded-lg px-3 py-2 text-sm uppercase focus:ring-1 focus:ring-red-500"
                    placeholder="np. PROMOCJA26"
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Rozmiar</label>
                    <input
                        name="value"
                        type="number"
                        step="0.01"
                        required
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-red-500"
                        placeholder="np. 15"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Typ Rabatowania</label>
                    <select name="type" className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                        <option value="PERCENTAGE">Procent (%)</option>
                        <option value="FIXED_CART">Kwota zł (- PLN)</option>
                    </select>
                </div>
            </div>

            <div className="border-t pt-4 mt-2">
                <label className="block text-xs font-bold text-gray-800 mb-2 uppercase tracking-wider">Limity Bezpieczeństwa (Opcjonalne)</label>

                <div className="space-y-3">
                    <div>
                        <input name="minAmount" type="number" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Minimalna wartość koszyka (PLN)" />
                    </div>
                    <div>
                        <input name="maxUses" type="number" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Limit ilości użyć (np. 50 uż.)" />
                    </div>
                </div>
            </div>

            <div className="border-t pt-4 mt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" name="excludePromotions" className="mt-1" defaultChecked />
                    <span className="text-xs text-gray-600">Nie łącz tego kodu z innymi promocjami (odmawia przyznania zniżki jeśli na towar jest już naliczony rabat bazowy katalogowy).</span>
                </label>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full bg-black text-white py-3 rounded-lg text-sm font-bold mt-4 hover:bg-gray-800 transition-colors">
                {isLoading ? 'Tworzenie...' : 'Aktywuj Kod'}
            </Button>
        </form>
    );
}
