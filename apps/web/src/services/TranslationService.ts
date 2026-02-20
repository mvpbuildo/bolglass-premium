import { prisma } from '@bolglass/database';

export class TranslationService {
    /**
     * Translates text to a target locale using OpenAI API.
     * Uses keys and prompts stored in SystemSetting.
     */
    static async translateField(text: string, targetLocale: string): Promise<string> {
        if (!text || text.trim().length === 0) return '';

        try {
            // 1. Fetch AI Configuration
            const settings = await prisma.systemSetting.findMany({
                where: {
                    key: { in: ['openai_api_key', 'ai_translation_prompt'] }
                }
            });

            const apiKey = settings.find(s => s.key === 'openai_api_key')?.value;
            const systemPrompt = settings.find(s => s.key === 'ai_translation_prompt')?.value || 'Translate accurately.';

            if (!apiKey) {
                throw new Error('MISSING_API_KEY');
            }

            // 2. Prepare the request
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini', // Cost-effective and fast
                    messages: [
                        {
                            role: 'system',
                            content: systemPrompt
                        },
                        {
                            role: 'user',
                            content: `Translate the following text to locale "${targetLocale}". Respond ONLY with the translated text, nothing else.\n\nText: ${text}`
                        }
                    ],
                    temperature: 0.3 // Low temperature for consistent translations
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('OpenAI API Error:', errorData);
                throw new Error(`AI_API_ERROR: ${response.status}`);
            }

            const data = await response.json();
            const translatedText = data.choices?.[0]?.message?.content?.trim();

            if (!translatedText) {
                throw new Error('AI_EMPTY_RESPONSE');
            }

            return translatedText;
        } catch (error: any) {
            console.error('Translation error:', error);
            throw error;
        }
    }
}
