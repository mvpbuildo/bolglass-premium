'use server'

import { prisma } from '@bolglass/database';
import { auth } from '@/auth';

export async function placeOrder(formData: FormData, cartItemsJson: string, total: number) {
    const session = await auth();
    const userId = session?.user?.id;

    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const zip = formData.get('zip') as string;
    const phone = formData.get('phone') as string;

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
        select: { id: true, price: true, name: true } // Add stock check if needed
    });

    let calculatedTotal = 0;
    const trustedItems: any[] = [];

    for (const item of items) {
        const dbProduct = dbProducts.find(p => p.id === item.id);

        if (!dbProduct) {
            throw new Error(`Product not found: ${item.name} (${item.id})`);
        }

        // Use DB price, not client price
        // TODO: Handle promotions/discounts here if applicable (e.g. verify coupon)
        const itemTotal = dbProduct.price * item.quantity;
        calculatedTotal += itemTotal;

        trustedItems.push({
            productId: dbProduct.id,
            name: dbProduct.name, // Or use DB name to ensure consistency
            price: dbProduct.price,
            quantity: item.quantity
        });
    }

    // Optional: Allow small floating point diffs or reject if mismatch is large
    // For now, we AUTHORITATIVELY use the calculatedTotal.
    // If the client sent a total that is wildly different, it might be an attack or a bug.
    const diff = Math.abs(calculatedTotal - total);
    if (diff > 1.00) {
        console.warn(`Price mismatch! Client: ${total}, Server: ${calculatedTotal}. Using Server value.`);
    }

    const invoiceData = documentType === 'INVOICE' ? {
        nip,
        companyName,
        companyAddress
    } : null;

    // Create Order with Trusted Values
    const order = await prisma.order.create({
        data: {
            userId: userId || null,
            email: email,
            status: "PENDING",
            paymentStatus: "UNPAID",
            total: calculatedTotal, // TRUSTED
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

    // Persistence: Update User Profile if logged in
    if (userId && documentType === 'INVOICE') {
        try {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    isCompany: true,
                    companyName: companyName,
                    nip: nip,
                    companyStreet: companyAddress, // Mapping one field to schema for now
                    // Note: If we had separate city/zip in checkout, we'd update them here too.
                }
            });
        } catch (err) {
            console.error("Failed to update user profile with company data:", err);
        }
    }

    return { orderId: order.id, success: true };
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

export async function syncCartItem(item: { id: string; quantity: number }, remove = false) {
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
                    configuration: "{}"
                }
            });
        } else {
            await prisma.cartItem.upsert({
                where: {
                    cartId_productId_configuration: {
                        cartId: cart.id,
                        productId: item.id,
                        configuration: "{}"
                    }
                },
                update: { quantity: item.quantity },
                create: {
                    cartId: cart.id,
                    productId: item.id,
                    quantity: item.quantity,
                    configuration: "{}"
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
