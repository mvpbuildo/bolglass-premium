import { auth } from '@/auth';
import { prisma } from '@bolglass/database';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sinceStr = searchParams.get('since');

    if (!sinceStr) {
        return NextResponse.json({ orders: 0, bookings: 0 });
    }

    const sinceDate = new Date(sinceStr);

    try {
        const newOrdersCount = await prisma.order.count({
            where: {
                paymentStatus: 'PAID',
                updatedAt: { gt: sinceDate }
            }
        });

        const newBookingsCount = await prisma.booking.count({
            where: {
                status: 'PAID',
                createdAt: { gt: sinceDate }
            }
        });

        return NextResponse.json({
            orders: newOrdersCount,
            bookings: newBookingsCount
        });
    } catch (e) {
        console.error('Polling error', e);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
