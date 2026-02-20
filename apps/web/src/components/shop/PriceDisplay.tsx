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
                <p className="text-2xl font-black text-red-500 tracking-tighter">
                    {formatPrice(effectivePrice)}
                </p>
                <p className="text-sm text-gray-400 line-through decoration-red-500/50">
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
