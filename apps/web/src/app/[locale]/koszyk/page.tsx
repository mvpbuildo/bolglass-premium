'use client';

import { useCart } from '@/context/CartContext';
import { Button, Card } from '@bolglass/ui';
import { Link, useRouter } from '@/i18n/navigation';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { placeOrder } from './actions';
import Image from 'next/image';

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
    if (items.length === 0) {
        return (
            <main className="min-h-screen bg-[#050505] pt-32">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h1 className="text-4xl font-serif text-amber-50 mb-4">Twój koszyk jest pusty</h1>
                    <p className="text-amber-200/40 mb-12">Dodaj coś pięknego z naszej manufaktury.</p>
                    <Link href="/sklep">
                        <Button className="bg-amber-500 hover:bg-amber-600 text-black px-8 rounded-full font-black uppercase tracking-widest text-xs">Wróć do Sklepu</Button>
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#050505] pt-20">

            <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
                <div className="flex items-center gap-4 mb-12">
                    <h1 className="text-4xl md:text-5xl font-serif text-amber-50">Koszyk i Zamówienie</h1>
                    <div className="h-px flex-1 bg-white/5" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* LEFT COLUMN: Cart Items */}
                    <div className="space-y-8">
                        <Card className="p-8 bg-white/5 border-white/5 backdrop-blur-xl rounded-[2rem] shadow-2xl">
                            <h2 className="text-xs font-black text-amber-500 uppercase tracking-[0.3em] mb-8 border-b border-white/5 pb-4">Wybrane Produkty</h2>
                            <div className="space-y-6">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-6 items-center group relative">
                                        <div className="relative w-24 h-24 bg-white/5 rounded-2xl overflow-hidden flex-shrink-0 border border-white/5">
                                            {item.image ? (
                                                <Image src={item.image} alt={item.name} fill className="object-cover transition-transform group-hover:scale-110" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-amber-500/20">📦</div>
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-serif text-lg text-amber-50 mb-1">{item.name}</h3>
                                            <p className="text-amber-500 font-black text-sm">{item.price.toFixed(2)} zł</p>
                                        </div>
                                        {/* ... quantity and remove remain similar but themed ... */}
                                        <div className="flex items-center gap-2">
                                            <button type="button" onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold">-</button>
                                            <span className="w-8 text-center font-bold">{item.quantity}</span>
                                            <button type="button" onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold">+</button>
                                        </div>
                                        <button type="button" onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 ml-2">
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
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <button
                                        type="button"
                                        onClick={() => setDocumentType('RECEIPT')}
                                        className={`py-3 px-4 rounded-xl border-2 transition-all font-bold ${documentType === 'RECEIPT'
                                            ? 'border-red-600 bg-red-50 text-red-600'
                                            : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
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
                                        className="w-full px-4 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-900"
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
                                                className="w-full px-4 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-900"
                                                placeholder="PL0000000000"
                                                title="NIP"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Nazwa Firmy</label>
                                            <input
                                                name="companyName"
                                                required={documentType === 'INVOICE'}
                                                className="w-full px-4 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-900"
                                                title="Nazwa Firmy"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Adres Firmy (Ulica, Kod, Miasto)</label>
                                            <input
                                                name="companyAddress"
                                                required={documentType === 'INVOICE'}
                                                className="w-full px-4 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-900"
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
                                        className="w-full px-4 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-900"
                                        title="Imię i Nazwisko"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Adres Dostawy (Ulica i nr)</label>
                                    <input name="address" required className="w-full px-4 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-900" title="Adres" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Kod Pocztowy</label>
                                        <input name="zip" required className="w-full px-4 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-900" title="Kod Pocztowy" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Miasto</label>
                                        <input name="city" required className="w-full px-4 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-900" title="Miasto" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Telefon</label>
                                    <input name="phone" type="tel" required className="w-full px-4 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-900" title="Telefon" />
                                </div>
                                {!session && (
                                    <div className="mb-8 p-6 bg-amber-500/5 border border-amber-500/10 text-amber-200/60 rounded-2xl text-sm italic">
                                        Kupujesz jako <strong>Gość</strong>. <Link href="/api/auth/signin" className="text-amber-500 underline font-bold">Zaloguj się</Link>, aby zapisać zamówienie w swojej historii.
                                    </div>
                                )}

                                <div className="pt-4 mt-4 border-t">
                                    <h3 className="font-bold mb-2">Płatność</h3>
                                    <div className="p-3 border rounded-lg bg-gray-50 text-sm text-gray-600">
                                        🔘 Przelew Tradycyjny (Dane otrzymasz w mailu)
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-amber-500 hover:bg-amber-600 text-black py-4 text-lg font-black uppercase tracking-widest mt-6 shadow-lg hover:shadow-amber-500/20 transition-all rounded-full"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Przetwarzanie...' : `Zamawiam i Płacę (${total.toFixed(2)} zł)`}
                                </Button>
                                <p className="text-[10px] text-center text-amber-200/20 mt-4 uppercase tracking-widest leading-loose">
                                    Klikając &quot;Zamawiam i Płacę&quot; akceptujesz regulamin sklepu.
                                </p>
                            </form>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    );
}
