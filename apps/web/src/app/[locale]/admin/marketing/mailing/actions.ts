'use server';

import { prisma } from '@bolglass/database';
import nodemailer from 'nodemailer';

type SmtpConfig = {
    host: string;
    port: string;
    user: string;
    pass: string;
    from: string;
};

export async function sendMailing(formData: FormData) {
    try {
        const subject = formData.get('subject') as string;
        const content = formData.get('content') as string;
        const targetLanguage = formData.get('targetLanguage') as string;
        const recipientType = formData.get('recipientType') as string;
        const smtpConfigStr = formData.get('smtpConfig') as string;

        if (!subject || !content) {
            return { error: 'Temat i treść są wymagane.' };
        }

        // 1. Determine SMTP Configuration
        let transporter;
        let fromAddress;

        if (smtpConfigStr) {
            const config = JSON.parse(smtpConfigStr);
            transporter = nodemailer.createTransport({
                host: config.host,
                port: parseInt(config.port),
                secure: parseInt(config.port) === 465,
                auth: {
                    user: config.user,
                    pass: config.password,
                },
            });
            fromAddress = config.from;
        } else {
            // Use System Settings (DB)
            // We import dynamic to avoid build-time issues if simple import fails, though here it's checking logic.
            const { getTransporter } = await import('@/lib/mail');
            const { EMAIL_SETTING_KEYS } = await import('@/lib/mail-constants');

            transporter = await getTransporter();

            if (!transporter) {
                // Fallback to minimal ENV if DB fails - usually for dev
                if (process.env.SMTP_HOST) {
                    transporter = nodemailer.createTransport({
                        host: process.env.SMTP_HOST,
                        port: parseInt(process.env.SMTP_PORT || '587'),
                        auth: {
                            user: process.env.SMTP_USER,
                            pass: process.env.SMTP_PASSWORD,
                        }
                    });
                    fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;
                } else {
                    return { error: 'Brak konfiguracji SMTP (Systemowej). Skonfiguruj własne SMTP.' };
                }
            } else {
                // Fetch 'from' address from DB
                const fromSetting = await prisma.systemSetting.findUnique({
                    where: { key: EMAIL_SETTING_KEYS.SMTP_FROM }
                });
                // fallback to user if from is missing
                if (fromSetting) {
                    fromAddress = fromSetting.value;
                } else {
                    // If we have transporter but no from, try to guess or fetch user
                    const userSetting = await prisma.systemSetting.findUnique({
                        where: { key: EMAIL_SETTING_KEYS.SMTP_USER }
                    });
                    fromAddress = userSetting?.value || 'noreply@bolglass.com';
                }
            }
        }

        // 2. Fetch Recipients
        let recipients: { email: string | null }[] = [];

        if (recipientType === 'all') {
            recipients = await prisma.user.findMany({
                where: {
                    email: { not: null },
                    locale: targetLanguage
                },
                select: { email: true }
            });
        } else if (recipientType === 'newsletter') {
            // Assuming NewsletterSubscriber model exists, or check property on User
            // For now, let's assume we filter users who opted in (if we had that field)
            // Or if we have a separate table.
            // Since we deleted the old newsletter module, we might need to rely on User table for now.
            recipients = await prisma.user.findMany({
                where: {
                    email: { not: null },
                    locale: targetLanguage
                    // isNewsletterSubscribed: true // creating this field was not part of the strict plan, so sticking to locale for now.
                },
                select: { email: true }
            });
        }

        const validEmails = recipients
            .map(r => r.email)
            .filter((e): e is string => e !== null && e.includes('@'));

        if (validEmails.length === 0) {
            return { error: `Nie znaleziono odbiorców dla języka: ${targetLanguage}` };
        }

        console.log(`Sending mailing to ${validEmails.length} recipients...`);

        // 3. Send Emails (Loop)
        // In production, this should be a queue (BullMQ/Redis). For MVP, we loop responsibly.
        let successCount = 0;
        let failCount = 0;

        for (const email of validEmails) {
            try {
                await transporter.sendMail({
                    from: fromAddress,
                    to: email,
                    subject: subject,
                    html: content,
                });
                successCount++;
            } catch (err) {
                console.error(`Failed to send to ${email}`, err);
                failCount++;
            }
        }

        return {
            success: true,
            message: `Wysłano: ${successCount}, Błędy: ${failCount}`
        };

    } catch (error) {
        console.error('Mailing error:', error);
        return { error: 'Wystąpił błąd krytyczny podczas wysyłki.' };
    }
}
