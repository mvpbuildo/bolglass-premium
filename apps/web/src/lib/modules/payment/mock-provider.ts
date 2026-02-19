import { PaymentProvider, PaymentResult, PaymentStatus } from './types';

export class MockPaymentProvider implements PaymentProvider {
    name = "Przelew Tradycyjny";
    key = "manual_transfer";

    async createTransaction(order: {
        id: string;
        total: number;
        currency: string;
        email: string;
        description: string;
    }): Promise<PaymentResult> {
        console.log(`[MockPayment] Creating transaction for Order ${order.id}: ${order.total} ${order.currency}`);

        // In a real provider, this would call an API.
        // Here, we just return success and point to a generic "thank you" page 
        // that shows bank transfer details.

        return {
            success: true,
            transactionId: `mock_tr_${Date.now()}_${order.id}`,
            paymentUrl: `/sklep/zamowienie/${order.id}/potwierdzenie?method=transfer`
        };
    }

    async verifyTransaction(transactionId: string): Promise<{ status: PaymentStatus }> {
        // Manual transfers are verified manually by admin, so initially PENDING.
        return { status: 'PENDING' };
    }
}
