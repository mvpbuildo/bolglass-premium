import { prisma } from '@bolglass/database';
import { paymentProvider, shippingProvider } from '@/lib/modules/store-context';

export interface OrderInput {
    formData: FormData;
    cartItems: any[];
    userId?: string;
}

export class CheckoutService {
    static async placeOrder({ formData, cartItems, userId }: OrderInput) {
        try {
            const email = formData.get('email') as string;
            const name = formData.get('name') as string;
            const address = formData.get('address') as string;
            const city = formData.get('city') as string;
            const zip = formData.get('zip') as string;
            const phone = formData.get('phone') as string;

            // Shipping & Payment Selections
            const shippingMethodKey = formData.get('shippingMethod') as string || 'courier';

            // VAT Invoice fields
            const documentType = formData.get('documentType') as string || 'RECEIPT';
            const nip = formData.get('nip') as string;
            const companyName = formData.get('companyName') as string;
            const companyAddress = formData.get('companyAddress') as string;

            if (!cartItems || cartItems.length === 0) {
                throw new Error("Koszyk jest pusty");
            }

            // --- Server-Side Validation ---
            const productIds = cartItems.map((i: { id: string }) => i.id);
            const dbProducts = await prisma.product.findMany({
                where: { id: { in: productIds } },
                select: { id: true, price: true, name: true }
            });

            let calculatedItemsTotal = 0;
            const trustedItems: { productId: string; name: string; price: number; quantity: number }[] = [];

            for (const item of cartItems) {
                const dbProduct = dbProducts.find(p => p.id === item.id);
                if (!dbProduct) {
                    throw new Error(`Produkt nie znaleziony: ${item.name} (${item.id})`);
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

            // --- Shipping Calculation ---
            const rates = await shippingProvider.calculateRates(trustedItems, { city, zip });
            const selectedRate = rates.find(r => r.id === shippingMethodKey) || rates[0];
            const shippingCost = selectedRate ? selectedRate.price : 0;
            const shippingMethodName = selectedRate ? selectedRate.name : 'Nieznany';

            const finalTotal = calculatedItemsTotal + shippingCost;

            const invoiceData = documentType === 'INVOICE' ? {
                nip,
                companyName,
                companyAddress
            } : null;

            // --- Create Order ---
            const order = await prisma.order.create({
                data: {
                    userId: userId || null,
                    email: email,
                    status: "PENDING",
                    paymentStatus: "UNPAID",
                    total: finalTotal,
                    shippingMethod: shippingMethodName,
                    shippingCost: shippingCost,
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

            // --- Payment Initialization ---
            let paymentUrl = `/sklep/zamowienie/${order.id}/potwierdzenie`;
            try {
                const result = await paymentProvider.createTransaction({
                    id: order.id,
                    total: finalTotal,
                    currency: 'PLN',
                    email: email,
                    description: `Zamówienie #${order.id.substring(0, 8)}`
                });

                if (result.success && result.paymentUrl) {
                    paymentUrl = result.paymentUrl;
                }
            } catch (error) {
                console.error("Payment initialization failed:", error);
            }

            // --- Profile Update ---
            if (userId && documentType === 'INVOICE') {
                try {
                    await prisma.user.update({
                        where: { id: userId },
                        data: {
                            isCompany: true,
                            companyName,
                            nip,
                            companyStreet: companyAddress,
                        }
                    });
                } catch (err) {
                    console.error("Failed to update user profile with company data:", err);
                }
            }

            // --- Send Confirmation Email ---
            const locale = formData.get('locale') as string || 'pl';
            const { sendOrderConfirmationEmail } = await import('@/lib/mail');
            // We do not await this to avoid blocking the response, or we can await to ensure it's sent.
            // In a real system, this would be a queue. For now, let's just trigger it.
            sendOrderConfirmationEmail(order, locale).catch(err => console.error("Email send failed:", err));

            return {
                orderId: order.id,
                success: true,
                paymentUrl
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error in placeOrder:', error);
            return { success: false, error: message };
        }
    }
}
