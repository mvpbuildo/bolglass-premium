'use server';

import { prisma } from '@bolglass/database';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function addTelegramSubscriber(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');

    const chatId = formData.get('chatId') as string;
    const name = formData.get('name') as string;
    const roleDescription = formData.get('roleDescription') as string;
    const receivesOrders = formData.get('receivesOrders') === 'true';
    const receivesBookings = formData.get('receivesBookings') === 'true';

    if (!chatId || !name) throw new Error('ID Czatu i Nazwa są wymagane');

    try {
        await prisma.telegramSubscriber.create({
            data: {
                chatId,
                name,
                roleDescription,
                receivesOrders,
                receivesBookings
            }
        });
        revalidatePath('/admin/settings/telegram');
    } catch (e) {
        console.error('Failed to add Telegram subscriber:', e);
    }
}

export async function deleteTelegramSubscriber(id: string): Promise<void> {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');

    try {
        await prisma.telegramSubscriber.delete({ where: { id } });
        revalidatePath('/admin/settings/telegram');
    } catch (e) {
        console.error('Failed to delete Telegram subscriber:', e);
    }
}

export async function updateTelegramToken(formData: FormData): Promise<void> {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');

    const token = formData.get('token') as string;

    try {
        await prisma.systemSetting.upsert({
            where: { key: 'telegram_bot_token' },
            create: { key: 'telegram_bot_token', value: token },
            update: { value: token }
        });
        revalidatePath('/', 'layout');
    } catch (e) {
        console.error('Failed to update Telegram token:', e);
    }
}

export async function sendTestTelegramMessage(chatId: string): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');

    try {
        const { sendTelegramMessage } = await import('@/lib/telegram');
        const success = await sendTelegramMessage(chatId, '🔔 <b>To jest wiadomość testowa z Twojego panelu Bolglass!</b>\n\nJeśli to widzisz, konfiguracja dla tego Chat ID jest poprawna.');

        if (success) return { success: true };
        return { success: false, error: 'Telegram API zwrócił błąd. Sprawdź czy Token Bota jest poprawny.' };
    } catch (e) {
        console.error('Failed to send test Telegram message:', e);
        return { success: false, error: 'Wystąpił nieoczekiwany błąd.' };
    }
}
