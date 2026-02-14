import nodemailer from 'nodemailer';
import { prisma } from '@bolglass/database';
import { EMAIL_SETTING_KEYS } from './mail-constants';

export async function getTransporter() {
    // @ts-ignore
    const settings = await prisma.systemSetting.findMany({
        where: {
            key: {
                in: [
                    EMAIL_SETTING_KEYS.SMTP_HOST,
                    EMAIL_SETTING_KEYS.SMTP_PORT,
                    EMAIL_SETTING_KEYS.SMTP_USER,
                    EMAIL_SETTING_KEYS.SMTP_PASSWORD
                ]
            }
        }
    });

    const config = Object.fromEntries(settings.map((s: { key: string; value: string }) => [s.key, s.value]));

    if (!config[EMAIL_SETTING_KEYS.SMTP_HOST] || !config[EMAIL_SETTING_KEYS.SMTP_USER]) {
        console.warn('SMTP configuration is incomplete. Skipping mail delivery.');
        return null;
    }

    console.log(`--- SMTP Config: ${config[EMAIL_SETTING_KEYS.SMTP_HOST]}:${config[EMAIL_SETTING_KEYS.SMTP_PORT]} (SSL/TLS: ${config[EMAIL_SETTING_KEYS.SMTP_PORT] === '465'}) ---`);

    return nodemailer.createTransport({
        host: config[EMAIL_SETTING_KEYS.SMTP_HOST],
        port: parseInt(config[EMAIL_SETTING_KEYS.SMTP_PORT]) || 587,
        secure: config[EMAIL_SETTING_KEYS.SMTP_PORT] === '465',
        auth: {
            user: config[EMAIL_SETTING_KEYS.SMTP_USER],
            pass: config[EMAIL_SETTING_KEYS.SMTP_PASSWORD],
        },
        tls: {
            // Often required for VPS and private mail servers
            rejectUnauthorized: false
        }
    });
}

export async function sendBookingConfirmation(booking: any) {
    try {
        const transporter = await getTransporter();
        if (!transporter) return;

        const isWorkshop = booking.type === 'WORKSHOP';
        const subjectKey = isWorkshop ? EMAIL_SETTING_KEYS.EMAIL_SUBJECT_WORKSHOP : EMAIL_SETTING_KEYS.EMAIL_SUBJECT_SIGHTSEEING;
        const bodyKey = isWorkshop ? EMAIL_SETTING_KEYS.EMAIL_BODY_WORKSHOP : EMAIL_SETTING_KEYS.EMAIL_BODY_SIGHTSEEING;
        const fromKey = EMAIL_SETTING_KEYS.SMTP_FROM;

        // @ts-ignore
        const settings = await prisma.systemSetting.findMany({
            where: {
                key: { in: [subjectKey, bodyKey, fromKey] }
            }
        });

        const config = Object.fromEntries(settings.map((s: { key: string; value: string }) => [s.key, s.value]));

        let subject = config[subjectKey] || (isWorkshop ? 'Potwierdzenie rezerwacji warsztatów' : 'Potwierdzenie rezerwacji zwiedzania');
        let body = config[bodyKey] || (isWorkshop
            ? 'Dziękujemy za rezerwację warsztatów w Bolglass!\nData: {{date}}\nLiczba osób: {{people}}'
            : 'Dziękujemy za rezerwację zwiedzania w Bolglass!\nData: {{date}}\nLiczba osób: {{people}}');
        const from = config[fromKey] || config[EMAIL_SETTING_KEYS.SMTP_USER];

        // Replace tags
        const dateStr = new Date(booking.date).toLocaleString('pl-PL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const replacements: Record<string, string> = {
            '{{name}}': booking.name,
            '{{email}}': booking.email,
            '{{date}}': dateStr,
            '{{people}}': booking.people.toString(),
            '{{total}}': (booking.people * (booking.priceBase || 0)).toString(),
            '{{type}}': isWorkshop ? 'Warsztaty' : 'Zwiedzanie',
            '{{id}}': booking.id
        };

        Object.entries(replacements).forEach(([tag, val]) => {
            subject = (subject || '').replace(new RegExp(tag, 'g'), val);
            body = (body || '').replace(new RegExp(tag, 'g'), val);
        });

        // Simple HTML wrap
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #333;">${subject}</h2>
                <div style="white-space: pre-wrap; line-height: 1.6; color: #555;">${body}</div>
                <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
                <p style="font-size: 12px; color: #999;">Wiadomość wysłana automatycznie przez system Bolglass. Nie odpowiadaj na ten e-mail.</p>
            </div>
        `;

        const info = await transporter.sendMail({
            from: `"Bolglass" <${from}>`,
            to: booking.email,
            subject: subject,
            text: body,
            html: html
        });

        console.log(`Booking confirmation sent to ${booking.email}. Response: ${info.response}`);
    } catch (error: unknown) {
        console.error('Failed to send booking confirmation:', error);
    }
}
