import { prisma } from '@bolglass/database';

export async function getTelegramToken() {
    const dbToken = await prisma.systemSetting.findUnique({ where: { key: 'telegram_bot_token' } });
    return dbToken?.value || process.env.TELEGRAM_BOT_TOKEN || '8184635848:AAFSf-X0BqY52eR7XF3-wO_x83OigWv_9lQ';
}

export async function sendTelegramMessage(chatId: string, text: string, parseMode: 'HTML' | 'MarkdownV2' = 'HTML') {
    const token = await getTelegramToken();
    if (!token) return false;

    const TELEGRAM_API_URL = `https://api.telegram.org/bot${token}/sendMessage`;

    try {
        const response = await fetch(TELEGRAM_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: parseMode,
                disable_web_page_preview: true,
            })
        });

        if (!response.ok) {
            console.error(`Telegram API error: ${response.status} ${response.statusText}`);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Failed to send Telegram message', error);
        return false;
    }
}

export async function broadcastNewOrder(orderData: {
    id: string;
    total: number;
    currency: string;
    items: { name: string; quantity: number }[];
    discountAmount: number;
    shippingMethod?: string;
    shippingAddress?: any;
}) {
    try {
        const subscribers = await prisma.telegramSubscriber.findMany({
            where: {
                OR: [
                    { receivesOrders: true },
                    { receivesLogistics: true }
                ]
            }
        });

        if (subscribers.length === 0) return;

        const itemsList = orderData.items.map(item => `📦 ${item.quantity}x ${item.name}`).join('\n');
        const addressInfo = orderData.shippingAddress ?
            `📍 <b>Adres:</b> ${orderData.shippingAddress.name}, ${orderData.shippingAddress.street}, ${orderData.shippingAddress.city} (${orderData.shippingAddress.phone || 'brak tel.'})` :
            '📍 <b>Adres:</b> Brak danych (Odbiór?)';

        // Wiadomość PEŁNA (Administracja)
        const messageFull = `
<b>🎉 Nowe Zamówienie! (#${orderData.id.slice(-6).toUpperCase()})</b>

💰 <b>Kwota:</b> ${orderData.total.toFixed(2)} ${orderData.currency}
📉 <b>Rabat:</b> ${orderData.discountAmount.toFixed(2)} ${orderData.currency}
🚚 <b>Dostawa:</b> ${orderData.shippingMethod || 'Standard'}

${addressInfo}

<b>Zawartość:</b>
${itemsList}

<i>Przejdź do panelu, by sprawdzić status płatności.</i>`;

        // Wiadomość LOGISTYCZNA (Tylko dane do wysyłki)
        const messageLogistics = `
<b>📦 Nowa Wysyłka! (#${orderData.id.slice(-6).toUpperCase()})</b>

🚚 <b>Metoda:</b> ${orderData.shippingMethod || 'Standard'}
${addressInfo}

<b>Asortyment do spakowania:</b>
${itemsList}

<i>Logistyka Bolglass - Miłego pakowania! 🛠</i>`;

        const sendPromises = subscribers.map(sub => {
            // Jeśli ma tylko uprawnienia logistyczne - wysyłamy okrojoną wersję
            const text = (sub.receivesLogistics && !sub.receivesOrders) ? messageLogistics : messageFull;
            return sendTelegramMessage(sub.chatId, text);
        });

        await Promise.all(sendPromises);
    } catch (e) {
        console.error('Error broadcasting order to Telegram:', e);
    }
}

export async function broadcastNewBooking(bookingData: { id: string, name: string, date: string, type: string, people: number }) {
    try {
        const subscribers = await prisma.telegramSubscriber.findMany({
            where: { receivesBookings: true }
        });

        if (subscribers.length === 0) return;

        const message = `
<b>📅 Nowa Rezerwacja Bolglass! (#${bookingData.id.slice(-6).toUpperCase()})</b>

👤 Klient: ${bookingData.name}
🔢 Grupa: ${bookingData.people} osób(y)
🎟 Type: ${bookingData.type === 'GLASS' ? 'Dmuchanie Szkła' : 'Warsztaty + Zwiedzanie'}
⏰ Data: ${bookingData.date}

<i>Sprawdź dostępność logistyczną na ten dzień w puli.</i>`;

        const sendPromises = subscribers.map(sub =>
            sendTelegramMessage(sub.chatId, message)
        );

        await Promise.all(sendPromises);
    } catch (e) {
        console.error('Error broadcasting booking to Telegram:', e);
    }
}
