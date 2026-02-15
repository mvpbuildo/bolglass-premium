'use server';

import { prisma } from "@bolglass/database";
import crypto from "crypto";
import { getTransporter } from "@/lib/mail";
import { EMAIL_SETTING_KEYS } from "@/lib/mail-constants";

export async function forgotPasswordAction(email: string) {
    if (!email) return { error: "Email jest wymagany." };

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        // For security, don't reveal if user exists or not
        if (!user) {
            return { success: true };
        }

        // Generate token
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: token,
                resetPasswordExpires: expires
            }
        });

        // Send Email
        const transporter = await getTransporter();
        if (transporter) {
            const resetUrl = `${process.env.NEXTAUTH_URL}/sklep/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

            await transporter.sendMail({
                from: `"Bolglass" <${process.env.SMTP_USER}>`,
                to: email,
                subject: "Resetowanie hasła - Bolglass",
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #333;">Resetowanie hasła</h2>
                        <p style="color: #555;">Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta w Bolglass.</p>
                        <p style="color: #555;">Kliknij w poniższy link, aby ustawić nowe hasło (link jest ważny przez 1 godzinę):</p>
                        <div style="margin: 30px 0; text-align: center;">
                            <a href="${resetUrl}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Resetuj hasło</a>
                        </div>
                        <p style="color: #999; font-size: 12px;">Jeśli nie prosiłeś o reset hasła, możesz zignorować tę wiadomość.</p>
                        <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
                        <p style="font-size: 12px; color: #999;">Wiadomość wysłana automatycznie przez system Bolglass.</p>
                    </div>
                `
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Forgot password error:", error);
        return { error: "Wystąpił błąd podczas procesowania prośby." };
    }
}
