import { prisma } from '@bolglass/database';
import { paymentProvider, shippingProvider } from '@/lib/modules/store-context';

export interface OrderInput {
    formData: FormData;
    cartItems: { id: string; quantity: number; name: string }[];
    userId?: string;
    couponCode?: string;
}

export class CheckoutService {
    static async placeOrder({ formData, cartItems, userId, couponCode }: OrderInput) {
        console.log(">>> [CheckoutService] Entering placeOrder");
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

            // --- Send Confirmation Email ---
            const locale = formData.get('locale') as string || 'pl';
            const currency = ['en', 'de'].includes(locale) ? 'EUR' : 'PLN';

            // --- Validation and Discount Assignment ---
            let originalItemsTotal = calculatedItemsTotal;
            let discountAmount = 0;
            let appliedCoupon = null;

            if (couponCode) {
                const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
                if (coupon && coupon.isActive) {
                    if (coupon.type === 'PERCENTAGE') {
                        discountAmount = originalItemsTotal * (coupon.value / 100);
                    } else if (coupon.type === 'FIXED_CART') {
                        discountAmount = coupon.value;
                    }
                    if (discountAmount > calculatedItemsTotal) discountAmount = calculatedItemsTotal;
                    calculatedItemsTotal -= discountAmount;
                    appliedCoupon = coupon;
                }
            }

            // --- Server-Side Conversion (if EUR) ---
            let finalTotal = calculatedItemsTotal + shippingCost;
            let currentExchangeRate: number | null = null;

            if (currency === 'EUR') {
                try {
                    console.log(">>> [CheckoutService] Fetching exchange rate for EUR");
                    // We can't easily fetch from our own local API /api/currency during a server action in some envs
                    // Let's call the NBP API directly as a backup or first choice for reliability on server
                    const rateRes = await fetch('https://api.nbp.pl/api/exchangerates/rates/A/EUR/?format=json');
                    if (rateRes.ok) {
                        const rateData = await rateRes.json();
                        currentExchangeRate = rateData?.rates?.[0]?.mid;
                    }
                } catch (err) {
                    console.error("Failed to fetch rate on server, using fallback 4.25", err);
                }

                if (!currentExchangeRate) currentExchangeRate = 4.25; // Fallback

                // Convert EVERYTHING to EUR for the order record
                finalTotal = Math.ceil(finalTotal / currentExchangeRate);
            }

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
                    currency: currency,
                    exchangeRate: currentExchangeRate,
                    shippingMethod: shippingMethodName,
                    shippingCost: currency === 'EUR' && currentExchangeRate ? Math.ceil(shippingCost / currentExchangeRate) : shippingCost,
                    paymentProvider: paymentProvider.key,
                    documentType,
                    invoiceData: invoiceData as any,
                    couponId: appliedCoupon ? appliedCoupon.id : null,
                    discountAmount: currency === 'EUR' && currentExchangeRate ? Math.ceil(discountAmount / currentExchangeRate) : discountAmount,
                    originalTotal: currency === 'EUR' && currentExchangeRate ? Math.ceil(originalItemsTotal / currentExchangeRate) : originalItemsTotal,
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
                            price: currency === 'EUR' && currentExchangeRate ? Math.ceil(item.price / currentExchangeRate) : item.price,
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
                    currency: currency, // Now dynamic!
                    email: email,
                    description: `Zamówienie #${order.id.substring(0, 8)}`
                });

                if (result.success && result.paymentUrl) {
                    paymentUrl = result.paymentUrl;
                }
            } catch (error) {
                console.error("Payment initialization failed:", error);
            }

            // --- Coupon Usaage Recording ---
            if (appliedCoupon) {
                try {
                    await prisma.coupon.update({
                        where: { id: appliedCoupon.id },
                        data: { uses: { increment: 1 } }
                    });
                } catch (err) {
                    console.error("Failed to increment coupon uses:", err);
                }
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

            console.log(`>>> [CheckoutService] Attempting to import mail service, locale: ${locale}`);
            const { sendOrderConfirmationEmail } = await import('@/lib/mail');
            console.log(">>> [CheckoutService] Calling sendOrderConfirmationEmail...");
            await sendOrderConfirmationEmail(order, locale).catch(err => console.error("CRITICAL: Email send failed:", err));
            console.log(">>> [CheckoutService] sendOrderConfirmationEmail call finished (awaited)");

            // Podpięcie równoległego powiadomienia na czat Telegrama do właściciela i pracowników
            const { broadcastNewOrder } = await import('@/lib/telegram');
            broadcastNewOrder({
                id: order.id,
                total: order.total,
                currency: order.currency,
                items: trustedItems,
                discountAmount: order.discountAmount
            }).catch(err => console.error("CRITICAL: Telegram broadcast failed:", err));

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
