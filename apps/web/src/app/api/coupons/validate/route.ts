import { NextResponse } from 'next/server';
import { prisma } from '@bolglass/database';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { code, cartTotal } = body;

        if (!code) {
            return NextResponse.json({ success: false, message: 'Nie podano kodu.' }, { status: 400 });
        }

        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (!coupon) {
            return NextResponse.json({ success: false, message: 'Nieznany lub niepoprawny kod rabatowy.' }, { status: 404 });
        }

        if (!coupon.isActive) {
            return NextResponse.json({ success: false, message: 'Ten kod rabatowy został już zdezaktywowany.' }, { status: 400 });
        }

        const now = new Date();
        if (coupon.startDate && now < coupon.startDate) {
            return NextResponse.json({ success: false, message: 'Ten kod rabatowy jeszcze nie obowiązuje.' }, { status: 400 });
        }

        if (coupon.endDate && now > coupon.endDate) {
            return NextResponse.json({ success: false, message: 'Ten kod rabatowy wygasł.' }, { status: 400 });
        }

        if (coupon.maxUses !== null && coupon.uses >= coupon.maxUses) {
            return NextResponse.json({ success: false, message: 'Limit użyć tego kodu został wyczerpany.' }, { status: 400 });
        }

        if (coupon.minAmount !== null && cartTotal < coupon.minAmount) {
            return NextResponse.json({ success: false, message: `Kod działa przy zamówieniu za minimalnie ${coupon.minAmount} PLN.` }, { status: 400 });
        }

        // Wszystko weryfikowane, odsyłamy parametry obniżki by koszyk mógł się na bieżąco przemalować
        return NextResponse.json({
            success: true,
            coupon: {
                id: coupon.id,
                code: coupon.code,
                type: coupon.type,
                value: coupon.value
            },
            message: 'Kod dodany weryfikowany pomyślnie!'
        });

    } catch (error) {
        console.error("[POST /api/coupons/validate] Error:", error);
        return NextResponse.json({ success: false, message: "Błąd weryfikacji serwera." }, { status: 500 });
    }
}
