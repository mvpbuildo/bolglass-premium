'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

type Currency = 'PLN' | 'EUR';

type UseCurrencyResult = {
    currency: Currency;
    formatPrice: (pricePLN: number) => string;
    convertPrice: (pricePLN: number) => number;
    rate: number | null;
    isLoading: boolean;
    currencySymbol: string;
};

const EUR_LOCALES = ['en', 'de'];

export function useCurrency(): UseCurrencyResult {
    const params = useParams();
    const locale = typeof params?.locale === 'string' ? params.locale : 'pl';
    const currency: Currency = EUR_LOCALES.includes(locale) ? 'EUR' : 'PLN';
    const currencySymbol = currency === 'EUR' ? '€' : 'zł';

    const [rate, setRate] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(currency === 'EUR');

    useEffect(() => {
        if (currency !== 'EUR') return;

        fetch('/api/currency')
            .then(res => res.json())
            .then((data: { rate: number }) => {
                setRate(data.rate);
            })
            .catch((err) => {
                console.error('[useCurrency] Failed to fetch rate:', err);
                setRate(4.25); // Fallback
            })
            .finally(() => setIsLoading(false));
    }, [currency]);

    /**
     * Converts a PLN price to EUR (if applicable) and rounds UP to the nearest whole number.
     */
    const convertPrice = (pricePLN: number): number => {
        if (currency === 'PLN' || rate === null) return pricePLN;
        return Math.ceil(pricePLN / rate);
    };

    /**
     * Formats a PLN price for display in the current locale's currency.
     * EUR prices are rounded UP to the nearest whole number (Math.ceil).
     * PLN prices show 2 decimal places.
     */
    const formatPrice = (pricePLN: number): string => {
        if (currency === 'EUR') {
            if (rate === null) return '...';
            const eur = Math.ceil(pricePLN / rate);
            return `${eur} €`;
        }
        return `${pricePLN.toFixed(2)} zł`;
    };

    return { currency, formatPrice, convertPrice, rate, isLoading, currencySymbol };
}
