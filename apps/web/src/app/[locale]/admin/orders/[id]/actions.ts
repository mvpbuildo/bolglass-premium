'use server';

import { prisma } from '@bolglass/database';
import { revalidatePath } from 'next/cache';

// Define status locally since it's a String in schema, not an Enum
type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED' | 'RETURN_REQUESTED' | 'RETURNED';

export async function updateOrderStatus(formData: FormData) {
    const id = formData.get('id') as string;
    const status = formData.get('status') as OrderStatus;

    if (!id || !status) {
        return;
    }

    try {
        console.log(`Updating order ${id} status to ${status}`);

        // Find if order was abandoned
        const order = await prisma.order.findUnique({
            where: { id },
            select: { abandonedEmailSentAt: true, status: true, paymentStatus: true }
        });

        const isRecovering = order?.abandonedEmailSentAt &&
            order.status !== 'COMPLETED' &&
            order.paymentStatus !== 'PAID' &&
            (status === 'PAID' || status === 'COMPLETED');

        await prisma.order.update({
            where: { id },
            data: {
                status,
                ...(isRecovering ? { isRecovered: true } : {})
            }
        });

        // Invalidate the specific page path across all locales
        revalidatePath('/[locale]/admin/orders/[id]', 'page');
        // Invalidate the list page
        revalidatePath('/[locale]/admin/orders', 'page');
    } catch (error) {
        console.error('Failed to update order status:', error);
        throw error; // Re-throw so Next.js can potentially show an error boundary or we can handle it
    }
}
