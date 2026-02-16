'use server';

import { prisma } from '@bolglass/database';
import { revalidatePath } from 'next/cache';
import { OrderStatus } from '@prisma/client';

export async function updateOrderStatus(formData: FormData) {
    const id = formData.get('id') as string;
    const status = formData.get('status') as OrderStatus;

    if (!id || !status) {
        return { error: 'Invalid data' };
    }

    try {
        await prisma.order.update({
            where: { id },
            data: { status }
        });

        revalidatePath(`/admin/orders/${id}`);
        revalidatePath('/admin/orders');
        return { success: true };
    } catch (error) {
        console.error('Failed to update order status:', error);
        return { error: 'Failed to update status' };
    }
}
