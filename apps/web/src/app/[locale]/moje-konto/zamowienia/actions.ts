'use server';

import { prisma } from '@bolglass/database';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function requestReturn(orderId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const order = await prisma.order.findUnique({
        where: { id: orderId }
    });

    if (!order) {
        throw new Error('Order not found');
    }

    if (order.userId !== session.user.id) {
        throw new Error('Unauthorized');
    }

    if (order.status !== 'COMPLETED') {
        throw new Error('Order must be completed to be returned');
    }

    await prisma.order.update({
        where: { id: orderId },
        data: { status: 'RETURN_REQUESTED' }
    });

    revalidatePath('/[locale]/moje-konto/zamowienia', 'page');
    revalidatePath(`/admin/orders/${orderId}`, 'page'); // Invalidate admin too
}
