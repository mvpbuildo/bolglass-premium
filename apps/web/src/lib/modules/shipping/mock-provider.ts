import { ShippingProvider, ShippingRate, ShippingLabel } from './types';

export class MockShippingProvider implements ShippingProvider {
    name = "Standardowa Wysyłka";
    key = "manual_shipping";

    async calculateRates(items: any[], address: any): Promise<ShippingRate[]> {
        // Simple logic: 
        // 1. Pickup = 0 PLN
        // 2. Courier = 20 PLN

        return [
            {
                id: 'pickup',
                name: 'Odbiór Osobisty (Warsztat)',
                price: 0,
                currency: 'PLN',
                estimatedDays: 'Gotowe w 24h'
            },
            {
                id: 'courier',
                name: 'Kurier (DPD/InPost)',
                price: 20.00,
                currency: 'PLN',
                estimatedDays: '1-2 dni robocze'
            }
        ];
    }

    async createLabel(order: any): Promise<ShippingLabel> {
        // No real API integration yet
        return {
            trackingNumber: `MOCK_TRACK_${order.id.substring(0, 8).toUpperCase()}`,
            labelUrl: '#' // Return dummy URL
        };
    }
}
