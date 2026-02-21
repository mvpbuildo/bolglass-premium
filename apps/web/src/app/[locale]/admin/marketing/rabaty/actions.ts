'use server';

import { auth } from '@/auth';
import { prisma } from '@bolglass/database';
import { revalidatePath } from 'next/cache';

export async function createCoupon(data: {
    code: string;
    type: string;
    value: number;
    minAmount?: number;
    maxUses?: number;
    excludePromotions: boolean;
}) {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
        throw new Error("Brak dostępu: Wymagane uprawnienia administratora");
    }

    await prisma.coupon.create({
        data: {
            code: data.code.toUpperCase(),
            type: data.type,
            value: data.value,
            minAmount: data.minAmount || null,
            maxUses: data.maxUses || null,
            excludePromotions: data.excludePromotions
        }
    });

    revalidatePath('/admin/marketing/rabaty');
    return { success: true };
}

export async function deleteCoupon(id: string) {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
        throw new Error("Brak dostępu");
    }

    await prisma.coupon.delete({
        where: { id }
    });

    revalidatePath('/admin/marketing/rabaty');
    return { success: true };
}
