'use server'

import { prisma } from '@bolglass/database';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function changePassword(formData: FormData) {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return { error: "Brak autoryzacji." };
    }

    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!newPassword || newPassword.length < 6) {
        return { error: "Nowe hasło musi mieć co najmniej 6 znaków." };
    }

    if (newPassword !== confirmPassword) {
        return { error: "Nowe hasła nie są identyczne." };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { password: true }
        });

        if (!user) return { error: "Użytkownik nie znaleziony." };

        // If user has a password set (Credentials login), verify the current one
        if (user.password) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return { error: "Aktualne hasło jest niepoprawne." };
            }
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error: any) {
        console.error("Change password error:", error);
        return { error: "Wystąpił błąd podczas zmiany hasła." };
    }
}
