'use client';

import { useState } from 'react';
import { Card } from '@bolglass/ui';

interface CouponAnalyticsProps {
    coupons: {
        id: string;
        code: string;
        uses: number;
    }[];
    couponStats: Record<string, { PLN: number; EUR: number }>;
    totalDiscountAmount: { PLN: number; EUR: number };
}

export default function CouponAnalyticsCards({ coupons, couponStats, totalDiscountAmount }: CouponAnalyticsProps) {
    const [selectedCouponId, setSelectedCouponId] = useState<string>('all');

    const totalUses = coupons.reduce((acc, curr) => acc + curr.uses, 0);

    const displayDiscountPLN = selectedCouponId === 'all'
        ? totalDiscountAmount.PLN
        : (couponStats[selectedCouponId]?.PLN || 0);

    const displayDiscountEUR = selectedCouponId === 'all'
        ? totalDiscountAmount.EUR
        : (couponStats[selectedCouponId]?.EUR || 0);

    const displayUses = selectedCouponId === 'all'
        ? totalUses
        : (coupons.find(c => c.id === selectedCouponId)?.uses || 0);

    return (
        <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-xl p-4">
                <span className="text-sm font-bold text-gray-700">Weryfikacja Analityki:</span>
                <select
                    value={selectedCouponId}
                    onChange={e => setSelectedCouponId(e.target.value)}
                    className="border border-gray-200 rounded-lg text-sm px-4 py-2 bg-white font-bold text-gray-900 shadow-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                    <option value="all">Wszystkie Kupony (Zsumowane)</option>
                    {coupons.map(c => (
                        <option key={c.id} value={c.id}>{c.code}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-6 bg-red-50/30 border-red-100 transition-all duration-300">
                    <h3 className="text-sm font-bold text-red-800 uppercase tracking-widest mb-1">Przekazany Rabat (Koszty Kampanii)</h3>
                    <div className="flex flex-col">
                        <p className="text-3xl font-black text-red-600">{displayDiscountPLN.toFixed(2)} PLN</p>
                        <p className="text-lg font-bold text-red-500/80">{displayDiscountEUR.toFixed(2)} EUR</p>
                    </div>
                </Card>
                <Card className="p-6 bg-blue-50/30 border-blue-100 transition-all duration-300">
                    <h3 className="text-sm font-bold text-blue-800 uppercase tracking-widest mb-1">Wykorzystane Kupony (Suma Użyć)</h3>
                    <p className="text-3xl font-black text-blue-600">
                        {displayUses} <span className="text-sm font-bold text-blue-600/50">szt.</span>
                    </p>
                </Card>
            </div>
        </div>
    );
}
