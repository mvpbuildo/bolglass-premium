'use server';

import { prisma } from "@bolglass/database";
import bcrypt from "bcryptjs";

export async function resetPasswordAction({ token, email, password }: any) {
    if (!token || !email || !password) {
        return { error: "Wszystkie pola są wymagane." };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user || user.resetPasswordToken !== token || !user.resetPasswordExpires) {
            return { error: "Nieprawidłowy lub wygasły token." };
        }

        if (new Date() > user.resetPasswordExpires) {
            return { error: "Link do resetowania wygasł." };
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Update user and clear reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null
            }
        });

        return { success: true };
    } catch (error) {
        console.error("Reset password error:", error);
        return { error: "Wystąpił błąd podczas resetowania hasła." };
    }
}
