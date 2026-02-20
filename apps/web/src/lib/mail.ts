import nodemailer from 'nodemailer';
import { prisma } from '@bolglass/database';
import { EMAIL_SETTING_KEYS } from './mail-constants';

export async function getTransporter() {
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

    console.log(`--- SMTP Attempt: Host=${config[EMAIL_SETTING_KEYS.SMTP_HOST]}, Port=${config[EMAIL_SETTING_KEYS.SMTP_PORT]}, User=${config[EMAIL_SETTING_KEYS.SMTP_USER]} ---`);

    if (!config[EMAIL_SETTING_KEYS.SMTP_HOST] || !config[EMAIL_SETTING_KEYS.SMTP_USER]) {
        console.error('CRITICAL: SMTP configuration is incomplete in database!', {
            host: config[EMAIL_SETTING_KEYS.SMTP_HOST] ? 'YES' : 'MISSING',
            user: config[EMAIL_SETTING_KEYS.SMTP_USER] ? 'YES' : 'MISSING',
            port: config[EMAIL_SETTING_KEYS.SMTP_PORT] ? 'YES' : 'MISSING'
        });
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

        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #ffffff;">
                <h2 style="color: #333333;">${subject}</h2>
                <div style="white-space: pre-wrap; line-height: 1.6; color: #333333;">${body}</div>
                <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
                <p style="font-size: 12px; color: #999999;">Wiadomość wysłana automatycznie przez system Bolglass. Nie odpowiadaj na ten e-mail.</p>
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

export async function sendBookingReminderEmail(booking: any) {
    try {
        const transporter = await getTransporter();
        if (!transporter) return;

        const subjectKey = EMAIL_SETTING_KEYS.EMAIL_SUBJECT_REMINDER;
        const bodyKey = EMAIL_SETTING_KEYS.EMAIL_BODY_REMINDER;
        const fromKey = EMAIL_SETTING_KEYS.SMTP_FROM;

        const settings = await prisma.systemSetting.findMany({
            where: {
                key: { in: [subjectKey, bodyKey, fromKey] }
            }
        });

        const config = Object.fromEntries(settings.map((s: { key: string; value: string }) => [s.key, s.value]));

        let subject = config[subjectKey] || 'Przypomnienie o wizycie w Bolglass';
        let body = config[bodyKey] || 'Dzień dobry!\nPrzypominamy o rezerwacji na jutro.\nData: {{date}}\nLiczba osób: {{people}}';
        const from = config[fromKey] || config[EMAIL_SETTING_KEYS.SMTP_USER];

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
            '{{type}}': booking.type === 'WORKSHOP' ? 'Warsztaty' : 'Zwiedzanie',
            '{{id}}': booking.id
        };

        Object.entries(replacements).forEach(([tag, val]) => {
            subject = (subject || '').replace(new RegExp(tag, 'g'), val);
            body = (body || '').replace(new RegExp(tag, 'g'), val);
        });

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

        console.log(`Booking reminder sent to ${booking.email}. Response: ${info.response}`);
    } catch (error: unknown) {
        console.error('Failed to send booking reminder:', error);
    }
}

export async function sendBookingUpdateEmail(booking: any) {
    try {
        const transporter = await getTransporter();
        if (!transporter) return;

        const subjectKey = EMAIL_SETTING_KEYS.EMAIL_SUBJECT_UPDATE;
        const bodyKey = EMAIL_SETTING_KEYS.EMAIL_BODY_UPDATE;
        const fromKey = EMAIL_SETTING_KEYS.SMTP_FROM;

        const settings = await prisma.systemSetting.findMany({
            where: {
                key: { in: [subjectKey, bodyKey, fromKey] }
            }
        });

        const config = Object.fromEntries(settings.map((s: { key: string; value: string }) => [s.key, s.value]));

        let subject = config[subjectKey] || 'Aktualizacja Twojej rezerwacji w Bolglass';
        let body = config[bodyKey] || 'Dzień dobry!\nTwoja rezerwacja została zaktualizowana.\nNowa liczba osób: {{people}}\nData: {{date}}';
        const from = config[fromKey] || config[EMAIL_SETTING_KEYS.SMTP_USER];

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
            '{{type}}': booking.type === 'WORKSHOP' ? 'Warsztaty' : 'Zwiedzanie',
            '{{id}}': booking.id
        };

        Object.entries(replacements).forEach(([tag, val]) => {
            subject = (subject || '').replace(new RegExp(tag, 'g'), val);
            body = (body || '').replace(new RegExp(tag, 'g'), val);
        });

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

        console.log(`Booking update email sent to ${booking.email}. Response: ${info.response}`);
    } catch (error: unknown) {
        console.error('Failed to send booking update email:', error);
    }
}

export async function sendOrderConfirmationEmail(order: any, locale: string = 'pl') {
    try {
        const transporter = await getTransporter();
        if (!transporter) return;

        let subjectKey = EMAIL_SETTING_KEYS.ORDER_CONFIRM_SUBJECT_PL;
        let bodyKey = EMAIL_SETTING_KEYS.ORDER_CONFIRM_BODY_PL;

        if (locale === 'en') {
            subjectKey = EMAIL_SETTING_KEYS.ORDER_CONFIRM_SUBJECT_EN;
            bodyKey = EMAIL_SETTING_KEYS.ORDER_CONFIRM_BODY_EN;
        } else if (locale === 'de') {
            subjectKey = EMAIL_SETTING_KEYS.ORDER_CONFIRM_SUBJECT_DE;
            bodyKey = EMAIL_SETTING_KEYS.ORDER_CONFIRM_BODY_DE;
        }

        const fromKey = EMAIL_SETTING_KEYS.SMTP_FROM;

        const settings = await prisma.systemSetting.findMany({
            where: {
                key: { in: [subjectKey, bodyKey, fromKey] }
            }
        });

        const config = Object.fromEntries(settings.map((s: { key: string; value: string }) => [s.key, s.value]));

        const defaultSubjects: Record<string, string> = {
            pl: 'Potwierdzenie zamówienia nr {{id}}',
            en: 'Order confirmation #{{id}}',
            de: 'Bestellbestätigung nr. {{id}}'
        };

        const defaultBodies: Record<string, string> = {
            pl: 'Dziękujemy za zakupy w Bolglass!\nTwoje zamówienie nr {{id}} na kwotę {{total}} PLN zostało przyjęte do realizacji.\n\nProdukty:\n{{items}}',
            en: 'Thank you for shopping at Bolglass!\nYour order #{{id}} for {{total}} PLN has been accepted for processing.\n\nItems:\n{{items}}',
            de: 'Vielen Dank für Ihren Einkauf bei Bolglass!\nIhre Bestellung Nr. {{id}} über {{total}} PLN wurde zur Bearbeitung angenommen.\n\nProdukte:\n{{items}}'
        };

        let subject = config[subjectKey] || defaultSubjects[locale] || defaultSubjects.pl;
        let body = config[bodyKey] || defaultBodies[locale] || defaultBodies.pl;
        const from = config[fromKey] || config[EMAIL_SETTING_KEYS.SMTP_USER];

        const itemsList = order.items.map((item: any) => `- ${item.name} (x${item.quantity}) - ${item.price.toFixed(2)} PLN`).join('\n');

        const replacements: Record<string, string> = {
            '{{id}}': fullOrder.id.substring(0, 8),
            '{{total}}': fullOrder.total.toFixed(2),
            '{{items}}': itemsList,
            '{{email}}': fullOrder.email,
            '{{date}}': new Date(fullOrder.createdAt).toLocaleString(locale === 'pl' ? 'pl-PL' : locale === 'de' ? 'de-DE' : 'en-GB')
        };

        Object.entries(replacements).forEach(([tag, val]) => {
            subject = (subject || '').replace(new RegExp(tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), val);
            body = (body || '').replace(new RegExp(tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), val);
        });

        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #ffffff;">
                <h2 style="color: #333333;">${subject}</h2>
                <div style="white-space: pre-wrap; line-height: 1.6; color: #333333;">${body}</div>
                <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
                <p style="font-size: 12px; color: #999999;">Wiadomość wysłana automatycznie przez system Bolglass. Nie odpowiadaj na ten e-mail.</p>
            </div>
        `;

        const info = await transporter.sendMail({
            from: `"Bolglass" <${from}>`,
            to: fullOrder.email,
            subject: subject,
            text: body,
            html: html
        });

        console.log(`Order confirmation sent to ${order.email}. Response: ${info.response}`);
    } catch (error: unknown) {
        console.error('Failed to send order confirmation email:', error);
    }
}
