'use server';

import { prisma } from '@bolglass/database';

export type ApiStatusData = {
    ai: {
        active: boolean;
    };
    nbp: {
        active: boolean;
        rate: number;
        updatedAt: string;
        source: string;
    };
};

export async function getApiStatuses(): Promise<ApiStatusData> {
    try {
        // 1. Check AI (OpenAI)
        const openaiSetting = await prisma.systemSetting.findUnique({
            where: { key: 'openai_api_key' }
        });

        const aiStatus = {
            active: !!openaiSetting?.value && openaiSetting.value.length > 20
        };

        // 2. Check NBP (via internal API or direct fetch if needed, let's use the safer direct approach for status)
        let nbpStatus = {
            active: false,
            rate: 4.25, // default
            updatedAt: new Date().toISOString(),
            source: 'fallback'
        };

        try {
            const response = await fetch('https://api.nbp.pl/api/exchangerates/rates/A/EUR/?format=json', {
                next: { revalidate: 60 } // Cache for 1 min for frequency
            });

            if (response.ok) {
                const data = await response.json();
                nbpStatus = {
                    active: true,
                    rate: data?.rates?.[0]?.mid || 4.25,
                    updatedAt: data?.rates?.[0]?.effectiveDate || new Date().toISOString(),
                    source: 'NBP'
                };
            }
        } catch (error) {
            console.error('[Status Action] NBP Fetch Error:', error);
        }

        return {
            ai: aiStatus,
            nbp: nbpStatus
        };
    } catch (error) {
        console.error('[Status Action] Global Error:', error);
        return {
            ai: { active: false },
            nbp: { active: false, rate: 4.25, updatedAt: new Date().toISOString(), source: 'error' }
        };
    }
}
