import { MockPaymentProvider } from './payment/mock-provider';
import { MockShippingProvider } from './shipping/mock-provider';
import { PaymentProvider } from './payment/types';
import { ShippingProvider } from './shipping/types';

// In the future, this can switch based on env vars
// const usePayU = process.env.PAYMENT_PROVIDER === 'PAYU';
// export const paymentProvider: PaymentProvider = usePayU ? new PayUProvider() : new MockPaymentProvider();

export const paymentProvider: PaymentProvider = new MockPaymentProvider();
export const shippingProvider: ShippingProvider = new MockShippingProvider();
