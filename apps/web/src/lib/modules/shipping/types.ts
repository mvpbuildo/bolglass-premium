export interface ShippingRate {
    id: string; // 'courier_standard'
    name: string; // 'Kurier DPD'
    price: number;
    currency: string;
    estimatedDays?: string; // '1-2 dni'
}

export interface ShippingLabel {
    trackingNumber: string;
    labelUrl?: string;
}

export interface ShippingProvider {
    name: string;
    key: string;

    /**
     * Calculates available shipping rates for the cart.
     */
    calculateRates(items: any[], address: any): Promise<ShippingRate[]>;

    /**
     * Creates a shipment in the carrier's system.
     */
    createLabel(order: any): Promise<ShippingLabel>;
}
