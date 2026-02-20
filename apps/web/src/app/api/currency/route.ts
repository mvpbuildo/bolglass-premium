import { NextResponse } from 'next/server';

// Cache the exchange rate for 1 hour via Next.js ISR
export const revalidate = 3600;

// Fallback rate in case the API is unavailable
const FALLBACK_RATE = 4.25;

export async function GET() {
    try {
        const response = await fetch(
            'https://api.nbp.pl/api/exchangerates/rates/A/EUR/?format=json',
            { next: { revalidate: 3600 } }
        );

        if (!response.ok) {
            throw new Error(`NBP API responded with status ${response.status}`);
        }

        const data = await response.json();
        const rate = data?.rates?.[0]?.mid;

        if (!rate || typeof rate !== 'number') {
            throw new Error('Invalid rate data from NBP API');
        }

        return NextResponse.json({
            rate,
            source: 'NBP',
            updatedAt: data?.rates?.[0]?.effectiveDate ?? new Date().toISOString(),
        });
    } catch (error) {
        console.error('[Currency API] Failed to fetch from NBP, using fallback rate:', error);
        return NextResponse.json({
            rate: FALLBACK_RATE,
            source: 'fallback',
            updatedAt: new Date().toISOString(),
        });
    }
}
