'use server'

import { prisma } from '@bolglass/database';
import { auth } from '@/auth';
import { paymentProvider, shippingProvider } from '@/lib/modules/store-context';

export async function placeOrder(formData: FormData, cartItemsJson: string, total: number) {
    const session = await auth();
    const userId = session?.user?.id;

    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const zip = formData.get('zip') as string;
    const phone = formData.get('phone') as string;

    // Shipping & Payment Selections (Frontend must send these, or we default)
    const shippingMethodKey = formData.get('shippingMethod') as string || 'courier';
    const paymentMethodKey = formData.get('paymentMethod') as string || 'transfer';

    // VAT Invoice fields
    const documentType = formData.get('documentType') as string || 'RECEIPT';
    const nip = formData.get('nip') as string;
    const companyName = formData.get('companyName') as string;
    const companyAddress = formData.get('companyAddress') as string;

    const items = JSON.parse(cartItemsJson);

    if (!items || items.length === 0) {
        throw new Error("Cart is empty");
    }

    // --- Server-Side Validation ---
    const productIds = items.map((i: any) => i.id);
    const dbProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, price: true, name: true }
    });

    let calculatedItemsTotal = 0;
    const trustedItems: any[] = [];

    for (const item of items) {
        const dbProduct = dbProducts.find(p => p.id === item.id);

        if (!dbProduct) {
            throw new Error(`Product not found: ${item.name} (${item.id})`);
        }

        const itemTotal = dbProduct.price * item.quantity;
        calculatedItemsTotal += itemTotal;

        trustedItems.push({
            productId: dbProduct.id,
            name: dbProduct.name,
            price: dbProduct.price,
            quantity: item.quantity
        });
    }

    // --- Shipping Calculation (Universal Adapter) ---
    // We calculate rates based on trusted items and address
    // In a real scenario, we might call the provider to get the cost for the *selected* method specifically.
    // Here we get all rates and find the selected one.
    const rates = await shippingProvider.calculateRates(trustedItems, { city, zip });
    const selectedRate = rates.find(r => r.id === shippingMethodKey) || rates[0]; // Default to first if invalid
    const shippingCost = selectedRate ? selectedRate.price : 0;
    const shippingMethodName = selectedRate ? selectedRate.name : 'Unknown';

    const finalTotal = calculatedItemsTotal + shippingCost;

    const invoiceData = documentType === 'INVOICE' ? {
        nip,
        companyName,
        companyAddress
    } : null;

    // --- Create Order (Universal) ---
    const order = await prisma.order.create({
        data: {
            userId: userId || null,
            email: email,
            status: "PENDING",
            paymentStatus: "UNPAID",
            total: finalTotal,

            // Store provider info
            shippingMethod: shippingMethodName,
            shippingCost: shippingCost,
            // paymentProvider: paymentProvider.key,
            paymentProvider: paymentProvider.key,

            documentType,
            invoiceData: invoiceData as any,
            shippingAddress: {
                name,
                street: address,
                city,
                zip,
                phone
            },
            items: {
                create: trustedItems.map(item => ({
                    productId: item.productId,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                }))
            }
        }
    });

    // --- Payment Initialization (Universal Adapter) ---
    let paymentResult = { success: true, paymentUrl: `/sklep/zamowienie/${order.id}/potwierdzenie` };
    try {
        const result = await paymentProvider.createTransaction({
            id: order.id,
            total: finalTotal,
            currency: 'PLN',
            email: email,
            description: `Zamówienie #${order.id.substring(0, 8)}`
        });

        if (result.success && result.paymentUrl) {
            paymentResult.paymentUrl = result.paymentUrl;
        }
    } catch (error) {
        console.error("Payment initialization failed:", error);
    }

    // Persistence: Update User Profile if logged in
    if (userId && documentType === 'INVOICE') {
        try {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    isCompany: true,
                    companyName: companyName,
                    nip: nip,
                    companyStreet: companyAddress,
                }
            });
        } catch (err) {
            console.error("Failed to update user profile with company data:", err);
        }
    }

    return {
        orderId: order.id,
        success: true,
        paymentUrl: paymentResult.paymentUrl
    };
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

        return cart.items.map((item: any) => ({
            id: item.productId,
            name: item.product.name,
            price: item.product.price, // Live price
            image: item.product.images[0] || '', // Assuming images array
            quantity: item.quantity,
            slug: item.product.slug,
        }));
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

        if (remove || item.quantity <= 0) {
            // Need to find unique constraint. 
            // We defined @@unique([cartId, productId, configuration])
            // For now assuming default config "{}"
            await prisma.cartItem.deleteMany({
                where: {
                    cartId: cart.id,
                    productId: item.id,
                    configuration: item.configuration || "{}"
                }
            });
        } else {
            await prisma.cartItem.upsert({
                where: {
                    cartId_productId_configuration: {
                        cartId: cart.id,
                        productId: item.id,
                        configuration: item.configuration || "{}"
                    }
                },
                update: { quantity: item.quantity },
                create: {
                    cartId: cart.id,
                    productId: item.id,
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
        { id: 'transfer', name: 'Przelew Tradycyjny', description: 'Dane do przelewu otrzymasz w mailu.' },
        // Future: { id: 'payu', name: 'Szybkie Płatności', description: 'BLIK, Karta' }
    ];
}
