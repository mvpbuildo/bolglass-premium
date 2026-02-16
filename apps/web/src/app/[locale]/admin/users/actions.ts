'use server'

import { prisma } from '@bolglass/database';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function toggleUserRole(userId: string, currentRole: string) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');

    // Safety check: Prevent modifying own role
    if (session?.user?.id === userId) throw new Error('Cannot modify own role');

    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';

    await prisma.user.update({
        where: { id: userId },
        data: { role: newRole }
    });

    revalidatePath('/admin/users');
}

export async function deleteUser(userId: string) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');

    // Safety check: Prevent self-deletion
    if (session?.user?.id === userId) throw new Error('Cannot delete yourself');

    await prisma.user.delete({
        where: { id: userId }
    });

    revalidatePath('/admin/users');
}
