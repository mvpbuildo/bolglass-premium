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

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);
        try {
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

    if (items.length === 0) {
        return (
            <main className="min-h-screen bg-gray-50">
                <ShopNavigation />
                <div className="max-w-7xl mx-auto px-4 py-12 text-center">
                    <h1 className="text-3xl font-bold mb-4">Twój koszyk jest pusty</h1>
                    <p className="text-gray-500 mb-8">Dodaj coś pięknego z naszego sklepu.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <ShopNavigation />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-black text-gray-900 mb-8">Koszyk i Zamówienie</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* LEFT COLUMN: Cart Items */}
                    <div className="space-y-6">
                        <Card className="p-6 bg-white shadow-sm">
                            <h2 className="text-xl font-bold mb-4 border-b pb-2">Produkty</h2>
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4 items-center">
                                        <div className="relative w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                            {item.image ? (
                                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">📦</div>
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-bold text-gray-900">{item.name}</h3>
                                            <p className="text-sm text-gray-500">{item.price.toFixed(2)} zł</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold">-</button>
                                            <span className="w-8 text-center font-bold">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold">+</button>
                                        </div>
                                        <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 ml-2">
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 pt-4 border-t flex justify-between items-center text-xl font-black">
                                <span>Razem</span>
                                <span>{total.toFixed(2)} zł</span>
                            </div>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: Checkout Form */}
                    <div>
                        <Card className="p-6 bg-white shadow-sm sticky top-24">
                            <h2 className="text-xl font-bold mb-4 border-b pb-2">Dane do Dostawy</h2>

                            {!session && (
                                <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-lg text-sm">
                                    Kupujesz jako <strong>Gość</strong>. <a href="/api/auth/signin" className="underline font-bold">Zaloguj się</a>, aby zapisać zamówienie w swojej historii.
                                </div>
                            )}

                            <form action={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        defaultValue={session?.user?.email || ''}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Imię i Nazwisko</label>
                                    <input
                                        name="name"
                                        required
                                        defaultValue={session?.user?.name || ''}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Adres (Ulica i nr)</label>
                                    <input name="address" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Kod Pocztowy</label>
                                        <input name="zip" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Miasto</label>
                                        <input name="city" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Telefon</label>
                                    <input name="phone" type="tel" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
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
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    );
}
