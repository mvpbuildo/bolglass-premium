'use server';

import { TranslationService } from '@/services/TranslationService';
import { auth } from '@/auth';

export async function translateText(text: string, targetLocale: string) {
    // 1. Check authorization
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
        return { error: 'UNAUTHORIZED' };
    }

    if (!text) return { error: 'EMPTY_TEXT' };

    try {
        const translated = await TranslationService.translateField(text, targetLocale);
        return { success: true, translated };
    } catch (error: any) {
        console.error('Translation action error:', error);

        if (error.message === 'MISSING_API_KEY') {
            return { error: 'Brak klucza API OpenAI w ustawieniach systemowych.' };
        }

        if (error.message.startsWith('AI_API_ERROR')) {
            return { error: 'Błąd połączenia z API OpenAI. Sprawdź ważność klucza.' };
        }

        return { error: 'Wystąpił błąd podczas tłumaczenia.' };
    }
}
