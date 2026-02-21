import { auth } from '@/auth';
import { prisma } from '@bolglass/database';
import { redirect } from 'next/navigation';
import { Card } from '@bolglass/ui';
import CouponForm from './CouponForm';
import CouponAnalyticsCards from './CouponAnalyticsCards';
import { deleteCoupon } from './actions';

export default async function AdminDiscountsPage() {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
        redirect('/admin/login');
    }

    const coupons = await prisma.coupon.findMany({
        orderBy: { createdAt: 'desc' }
    });

    const totalAnalytics = await prisma.order.groupBy({
        by: ['currency'],
        _sum: { discountAmount: true },
        _count: { _all: true },
        where: { couponId: { not: null }, status: { not: 'CANCELLED' } }
    });

    const totalDiscountAmount = {
        PLN: totalAnalytics.find(a => a.currency === 'PLN')?._sum.discountAmount || 0,
        EUR: totalAnalytics.find(a => a.currency === 'EUR')?._sum.discountAmount || 0,
    };

    const totalUsesByCurrency = {
        PLN: totalAnalytics.find(a => a.currency === 'PLN')?._count._all || 0,
        EUR: totalAnalytics.find(a => a.currency === 'EUR')?._count._all || 0,
    };

    const couponsAnalytics = await prisma.order.groupBy({
        by: ['couponId', 'currency'],
        _sum: { discountAmount: true },
        _count: { _all: true },
        where: { couponId: { not: null }, status: { not: 'CANCELLED' } }
    });

    const couponStats = new Map<string, { PLN: number, EUR: number, usesPLN: number, usesEUR: number }>();
    couponsAnalytics.forEach(c => {
        if (!c.couponId) return;
        const current = couponStats.get(c.couponId) || { PLN: 0, EUR: 0, usesPLN: 0, usesEUR: 0 };
        if (c.currency === 'PLN') {
            current.PLN += c._sum.discountAmount || 0;
            current.usesPLN += c._count._all || 0;
        }
        if (c.currency === 'EUR') {
            current.EUR += c._sum.discountAmount || 0;
            current.usesEUR += c._count._all || 0;
        }
        couponStats.set(c.couponId, current);
    });

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Marketing i Kody Rabatowe</h1>
                    <p className="text-gray-500">Zarządzaj aktywnymi kampaniami obniżkowymi dla klientów Twojego sklepu oraz kontroluj koszty tych działań.</p>
                </div>
            </div>

            <CouponAnalyticsCards
                coupons={coupons.map(c => ({ id: c.id, code: c.code, uses: c.uses }))}
                couponStats={Object.fromEntries(couponStats)}
                totalDiscountAmount={totalDiscountAmount}
                totalUsesByCurrency={totalUsesByCurrency}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Card className="p-6 sticky top-8">
                        <h2 className="text-lg font-bold mb-4">Wygeneruj nowy kod</h2>
                        <CouponForm />
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card className="p-6">
                        <h2 className="text-lg font-bold mb-4">Aktywne Kody (Baza)</h2>
                        {coupons.length === 0 ? (
                            <p className="text-sm text-gray-400">Nie wygenerowano jeszcze żadnych kodów.</p>
                        ) : (
                            <div className="space-y-4">
                                {coupons.map(coupon => (
                                    <div key={coupon.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border rounded-xl hover:border-gray-300 transition-colors">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded text-sm">{coupon.code}</span>
                                                <span className="text-xs font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                                    {coupon.isActive ? 'Aktywny' : 'Wyłączony'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Zniżka: <strong className="text-gray-900">{coupon.value}{coupon.type === 'PERCENTAGE' ? '%' : ' PLN'}</strong>
                                                {coupon.minAmount ? ` (Od ${coupon.minAmount} PLN)` : ''}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Wykorzystano: {coupon.uses} / {coupon.maxUses || 'BEZ LIMITU'}.
                                                {coupon.excludePromotions ? " (Z wykluczeniem przecenionych)" : ""}
                                            </p>
                                            <div className="text-xs text-blue-600 font-bold mt-1">
                                                Wygenerowano Zniżek:
                                                <span className="ml-1">{(couponStats.get(coupon.id)?.PLN || 0).toFixed(2)} PLN</span>
                                                <span className="mx-1">/</span>
                                                <span>{(couponStats.get(coupon.id)?.EUR || 0).toFixed(2)} EUR</span>
                                            </div>
                                        </div>
                                        <div className="mt-3 sm:mt-0 flex gap-2">
                                            {/* Tutaj moglaby byc obsluga wylaczania, na etapie MVP po prostu usuniecie umozliwi czyszczenie smieci */}
                                            <form action={async () => {
                                                'use server';
                                                await deleteCoupon(coupon.id);
                                            }}>
                                                <button type="submit" className="text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Usuń Kod</button>
                                            </form>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
