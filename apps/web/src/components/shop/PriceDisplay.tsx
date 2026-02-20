'use client';

import { useCurrency } from '@/hooks/useCurrency';

interface PriceDisplayProps {
    pricePLN: number;
    className?: string;
    showOriginal?: boolean;
    discountPercent?: number;
}

export default function PriceDisplay({ pricePLN, className = "", showOriginal = false, discountPercent = 0 }: PriceDisplayProps) {
    const { formatPrice } = useCurrency();

    const effectivePrice = pricePLN * (1 - (discountPercent / 100));

    if (discountPercent > 0 && showOriginal) {
        return (
            <div className={`flex items-baseline gap-3 ${className}`}>
                <p className="text-3xl font-black text-red-600">
                    {formatPrice(effectivePrice)}
                </p>
                <p className="text-xl text-gray-400 line-through">
                    {formatPrice(pricePLN)}
                </p>
            </div>
        );
    }

    return (
        <p className={className}>
            {formatPrice(effectivePrice)}
        </p>
    );
}
