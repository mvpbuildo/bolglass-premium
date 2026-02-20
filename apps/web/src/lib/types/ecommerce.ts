export interface BaubleConfiguration {
    sizeId: string;
    colorHex: string;
    text?: string;
}

export interface ShippingAddress {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    postalCode: string;
    phoneNumber: string;
    email: string;
}

export interface InvoiceData {
    companyName: string;
    nip: string;
    street: string;
    city: string;
    postalCode: string;
}

export type PaymentMethod = 'PAYU' | 'P24' | 'MANUAL';
export type ShippingMethod = 'COURIER' | 'LOCKER' | 'PICKUP';
export type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURN_REQUESTED' | 'RETURNED';
