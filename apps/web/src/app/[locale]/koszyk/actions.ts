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

    const invoiceData = documentType === 'INVOICE' ? {
        nip,
        companyName,
        companyAddress
    } : null;

    // Create Order
    const order = await prisma.order.create({
        data: {
            userId: userId || null,
            email: email,
            status: "PENDING",
            paymentStatus: "UNPAID",
            total: total,
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
                create: items.map((item: { id: string; name: string; price: number; quantity: number }) => ({
                    productId: item.id,
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
