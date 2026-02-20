import { BaubleConfiguration } from '@/lib/types/ecommerce';
import { BaubleConfig } from '@/app/[locale]/admin/settings/3d/actions';

/**
 * Calculates the price of a personalized bauble.
 * @param config User selected configuration (size, color, text)
 * @param settings System settings containing base prices and addons
 * @returns Total price in PLN
 */
export function calculateBaublePrice(
    config: BaubleConfiguration,
    settings: BaubleConfig
): number {
    const size = settings.sizes.find(s => s.id === config.sizeId);
    if (!size) {
        // Fallback or throw error? For now fallback to 0 to be safe in UI
        console.warn(`Size ${config.sizeId} not found in settings`);
        return 0;
    }

    const color = settings.colors.find(c => c.hex === config.colorHex);
    // If color is not found (e.g. legacy color), we assume 0 extra cost or strictly validate?
    // Let's assume 0 for robustness.
    const colorPrice = color?.price || 0;

    const textPrice = config.text && config.text.length > 0 ? settings.addons.textPrice : 0;

    return size.basePrice + colorPrice + textPrice;
}
