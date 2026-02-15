'use server';

import { auth } from "@/auth";
import { prisma } from "@bolglass/database";
import bcrypt from "bcryptjs";


export async function changePasswordAction({ currentPassword, newPassword }: Record<string, string>) {
    const session = await auth();

    if (!session?.user?.email) {
        return { error: "Musisz być zalogowany." };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user || !user.password) {
            return { error: "Nie można zmienić hasła dla tego konta (zaloguj się przez Google)." };
        }

        // Verify current password
        const isCorrect = await bcrypt.compare(currentPassword, user.password);
        if (!isCorrect) {
            return { error: "Obecne hasło jest nieprawidłowe." };
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        return { success: true };
    } catch (error) {
        console.error("Change password error:", error);
        return { error: "Wystąpił błąd podczas zmiany hasła." };
    }
}
