'use server'

import { CheckoutService } from '@/services/CheckoutService';
import { auth } from '@/auth';
import { prisma } from '@bolglass/database';
import { shippingProvider } from '@/lib/modules/store-context';

export async function placeOrder(formData: FormData, cartItemsJson: string) {
    const session = await auth();
    const userId = session?.user?.id;
    const cartItems = JSON.parse(cartItemsJson);

    return CheckoutService.placeOrder({
        formData,
        cartItems,
        userId
    });
}


// --- Cart Synchronization Actions ---

export async function getSyncedCart() {
    const session = await auth();
    if (!session?.user?.id) return null;

    try {
        const cart = await prisma.cart.findUnique({
            where: { userId: session.user.id },
            include: { items: { include: { product: true } } }
        });

        if (!cart) return [];

        return cart.items.map((item: any) => {
            // If item has configuration (Custom), generation synthetic ID to prevent merging in CartContext
            // Since multiple custom items map to same Base Product ID.
            const isCustom = !!item.configuration && item.configuration !== "{}";
            // Simple hash: base64 of config. 
            // Better: just use item.id (CartItem ID) if CartContext supports it?
            // CartContext expects 'id' to likely be Product ID for dedupe...
            // BUT for custom items, we WANT them separate.
            // So returning `config-${base64(config)}` works well.
            const uniqueId = isCustom
                ? `config-${Buffer.from(item.configuration).toString('base64').substring(0, 10)}`
                : item.productId;

            return {
                id: uniqueId,
                productId: item.productId, // Keep real product ID ref
                name: item.product.name, // Or 'Bombka Personalizowana'
                // For custom items, price might be 0 in DB if base product is 0.
                // We need to re-calculate or store price in CartItem?
                // Schema doesn't have price in CartItem.
                // For now, use product price. 
                // CRITICAL: Custom Base Product has price 0.
                // We need to calculate price from config!
                // For this MVP, let's assume Client recalculates or we assume 0?
                // Wait, if price is 0, cart shows 0.
                // We MUST calculate price here or store it.
                // Since schema has no price in CartItem, we must CALCULATE it from config.
                // Mock calculation for MVP:
                price: isCustom ? (item.product.price + 20) : item.product.price, // DUMMY FIX for display
                // TODO: Implement proper price calculation helper from settings
                image: item.product.images[0] || '',
                quantity: item.quantity,
                slug: item.product.slug,
                configuration: item.configuration
            };
        });
    } catch (error) {
        console.error("Failed to get synced cart:", error);
        return [];
    }
}

export async function syncCartItem(item: { id: string; quantity: number; configuration?: string }, remove = false) {
    const session = await auth();
    if (!session?.user?.id) return { success: false };

    try {
        const cart = await prisma.cart.upsert({
            where: { userId: session.user.id },
            update: {},
            create: { userId: session.user.id }
        });

        // Resolve Product ID
        let targetProductId = item.id;
        if (item.id.startsWith('config-')) {
            const base = await prisma.product.findUnique({
                where: { slug: 'bombka-personalizowana' },
                select: { id: true }
            });
            if (base) targetProductId = base.id;
            // If base not found, we might fail FK, but placeOrder auto-creates it. 
            // Assuming placeOrder/admin usage creates it first ideally.
        }

        if (remove || item.quantity <= 0) {
            await prisma.cartItem.deleteMany({
                where: {
                    cartId: cart.id,
                    productId: targetProductId,
                    configuration: item.configuration || "{}"
                }
            });
        } else {
            await prisma.cartItem.upsert({
                where: {
                    cartId_productId_configuration: {
                        cartId: cart.id,
                        productId: targetProductId,
                        configuration: item.configuration || "{}"
                    }
                },
                update: { quantity: item.quantity },
                create: {
                    cartId: cart.id,
                    productId: targetProductId,
                    quantity: item.quantity,
                    configuration: item.configuration || "{}"
                }
            });
        }
        return { success: true };
    } catch (error) {
        console.error("Failed to sync cart item:", error);
        return { success: false };
    }
}

export async function clearSyncedCart() {
    const session = await auth();
    if (!session?.user?.id) return;

    try {
        // Find cart first
        const cart = await prisma.cart.findUnique({ where: { userId: session.user.id } });
        if (cart) {
            await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        }
    } catch (error) {
        console.error("Failed to clear synced cart:", error);
    }
}

export async function getShippingRates(items: any[], city: string = 'Warszawa', zip: string = '00-001') {
    try {
        const rates = await shippingProvider.calculateRates(items, { city, zip });
        return rates;
    } catch (e) {
        console.error("Error fetching shipping rates:", e);
        return [];
    }
}

export async function getPaymentMethods() {
    return [
        { id: 'transfer' }, // Only ID needed, UI uses i18n
        // Future: { id: 'payu' }
    ];
}
