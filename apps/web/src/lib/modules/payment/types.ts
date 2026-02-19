export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface PaymentResult {
    success: boolean;
    paymentUrl?: string; // Where to redirect the user (e.g. PayU page or Thank You page for manual)
    transactionId?: string;
    error?: string;
}

export interface PaymentProvider {
    name: string;
    key: string; // e.g. 'payu', 'stripe', 'transfer'

    /**
     * Initiates a payment transaction.
     */
    createTransaction(order: {
        id: string;
        total: number;
        currency: string;
        email: string;
        description: string;
        customerIp?: string;
    }): Promise<PaymentResult>;

    /**
     * Verifies a payment notification (webhook or return).
     */
    verifyTransaction(transactionId: string): Promise<{ status: PaymentStatus }>;
}
