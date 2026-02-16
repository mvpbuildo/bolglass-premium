'use client';

import ShopNavigation from '@/components/ShopNavigation';
import { useCart } from '@/context/CartContext';
import { Button, Card } from '@bolglass/ui';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { placeOrder } from './actions';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
    const { items, updateQuantity, removeItem, total, clearCart } = useCart();
    const { data: session } = useSession();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [documentType, setDocumentType] = useState<'RECEIPT' | 'INVOICE'>('RECEIPT');

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);
        try {
            // Add document type to formData
            formData.append('documentType', documentType);

            const result = await placeOrder(formData, JSON.stringify(items), total);
            if (result.success) {
                clearCart();
                // Redirect to success / thank you
                alert(`Zamówienie złożone! Numer: ${result.orderId}`);
                router.push('/sklep'); // or /sklep/zamowienie/[id]
            }
        } catch (error) {
            console.error(error);
            alert("Wystąpił błąd podczas składania zamówienia.");
        } finally {
            setIsSubmitting(false);
        }
    }
    // ... [rest of the component logic until form start] ...
    <form action={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
            <button
                type="button"
                onClick={() => setDocumentType('RECEIPT')}
                className={`py-3 px-4 rounded-xl border-2 transition-all font-bold ${documentType === 'RECEIPT'
                        ? 'border-red-600 bg-red-50 text-red-600'
                        : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
                    }`}
            >
                📄 Paragon
            </button>
            <button
                type="button"
                onClick={() => setDocumentType('INVOICE')}
                className={`py-3 px-4 rounded-xl border-2 transition-all font-bold ${documentType === 'INVOICE'
                        ? 'border-red-600 bg-red-50 text-red-600'
                        : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
                    }`}
            >
                🏢 Faktura VAT
            </button>
        </div>

        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <input
                name="email"
                type="email"
                required
                defaultValue={session?.user?.email || ''}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                title="Adres e-mail"
            />
        </div>

        {documentType === 'INVOICE' && (
            <div className="space-y-4 pt-2 pb-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h3 className="font-bold text-gray-900 border-b pb-2 text-sm italic">Dane do Faktury</h3>
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">NIP</label>
                    <input
                        name="nip"
                        required={documentType === 'INVOICE'}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        placeholder="PL0000000000"
                        title="NIP"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Nazwa Firmy</label>
                    <input
                        name="companyName"
                        required={documentType === 'INVOICE'}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        title="Nazwa Firmy"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Adres Firmy (Ulica, Kod, Miasto)</label>
                    <input
                        name="companyAddress"
                        required={documentType === 'INVOICE'}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        placeholder="ul. Wspólna 1, 00-001 Warszawa"
                        title="Adres Firmy"
                    />
                </div>
            </div>
        )}

        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Imię i Nazwisko (Odbiorca)</label>
            <input
                name="name"
                required
                defaultValue={session?.user?.name || ''}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                title="Imię i Nazwisko"
            />
        </div>
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Adres Dostawy (Ulica i nr)</label>
            <input name="address" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" title="Adres" />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Kod Pocztowy</label>
                <input name="zip" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" title="Kod Pocztowy" />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Miasto</label>
                <input name="city" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" title="Miasto" />
            </div>
        </div>
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Telefon</label>
            <input name="phone" type="tel" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" title="Telefon" />
        </div>

        <div className="pt-4 mt-4 border-t">
            <h3 className="font-bold mb-2">Płatność</h3>
            <div className="p-3 border rounded-lg bg-gray-50 text-sm text-gray-600">
                🔘 Przelew Tradycyjny (Dane otrzymasz w mailu)
                {/* Placeholder for future gateways */}
            </div>
        </div>

        <Button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white py-4 text-lg font-bold mt-6 shadow-lg hover:shadow-xl transition-all"
            disabled={isSubmitting}
        >
            {isSubmitting ? 'Przetwarzanie...' : `Zamawiam i Płacę (${total.toFixed(2)} zł)`}
        </Button>
        <p className="text-xs text-center text-gray-400 mt-2">
            Klikając "Zamawiam i Płacę" akceptujesz regulamin sklepu.
        </p>
    </form>
                        </Card >
                    </div >
                </div >
            </div >
        </main >
    );
}
