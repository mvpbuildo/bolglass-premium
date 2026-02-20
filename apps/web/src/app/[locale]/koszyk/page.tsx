'use client';

import { useCart } from '@/context/CartContext';
import { Button, Card } from '@bolglass/ui';
import { Link, useRouter } from '@/i18n/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { placeOrder, getShippingRates, getPaymentMethods } from './actions';
import Image from 'next/image';
import { useCurrency } from '@/hooks/useCurrency';
import { useTranslations, useLocale } from 'next-intl';

export default function CheckoutPage() {
    const locale = useLocale();
    const { items, updateQuantity, removeItem, total, clearCart } = useCart();
    const { data: session } = useSession();
    const router = useRouter();
    const { formatPrice } = useCurrency();
    const t = useTranslations('Cart');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [documentType, setDocumentType] = useState<'RECEIPT' | 'INVOICE'>('RECEIPT');

    // Universal Adapter State
    const [shippingMethods, setShippingMethods] = useState<any[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
    const [selectedShipping, setSelectedShipping] = useState<string>('');
    const [selectedPayment, setSelectedPayment] = useState<string>('');
    const [shippingCost, setShippingCost] = useState(0);

    // Fetch Providers Data
    useEffect(() => {
        if (items.length > 0) {
            // Fetch shipping rates
            getShippingRates(items).then(rates => {
                setShippingMethods(rates);
                if (rates.length > 0) {
                    setSelectedShipping(rates[0].id);
                    setShippingCost(rates[0].price);
                }
            });

            // Fetch payment methods
            getPaymentMethods().then(methods => {
                setPaymentMethods(methods);
                if (methods.length > 0) {
                    setSelectedPayment(methods[0].id);
                }
            });
        }
    }, [items]); // Re-fetch if items change (weight/size might change)

    // Update cost when shipping method changes
    useEffect(() => {
        const method = shippingMethods.find(m => m.id === selectedShipping);
        if (method) {
            setShippingCost(method.price);
        }
    }, [selectedShipping, shippingMethods]);

    const finalTotal = total + shippingCost;

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);
        try {
            // Add document type & selections to formData
            formData.append('documentType', documentType);
            formData.append('shippingMethod', selectedShipping);
            formData.append('paymentMethod', selectedPayment);

            const result = await placeOrder(formData, JSON.stringify(items), finalTotal);
            if (result.success) {
                clearCart();
                router.push(result.paymentUrl || `/sklep/zamowienie/${result.orderId}`);
            }
        } catch (error) {
            console.error(error);
            alert(t('errorPlacingOrder'));
        } finally {
            setIsSubmitting(false);
        }
    }

    if (items.length === 0) {
        return (
            <main className="min-h-screen bg-[#050505] pt-32">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h1 className="text-4xl font-serif text-amber-50 mb-4">{t('emptyTitle')}</h1>
                    <p className="text-amber-200/40 mb-12">{t('emptySubtitle')}</p>
                    <Link href="/sklep">
                        <Button className="bg-amber-500 hover:bg-amber-600 text-black px-8 rounded-full font-black uppercase tracking-widest text-xs">{t('goToShop')}</Button>
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#050505] pt-20">

            <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
                <div className="flex items-center gap-4 mb-12">
                    <h1 className="text-4xl md:text-5xl font-serif text-amber-50">{t('cartAndCheckout')}</h1>
                    <div className="h-px flex-1 bg-white/5" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* LEFT COLUMN: Cart Items */}
                    <div className="space-y-8">
                        <Card className="p-8 bg-white/5 border-white/5 backdrop-blur-xl rounded-[2rem] shadow-2xl">
                            <h2 className="text-xs font-black text-amber-500 uppercase tracking-[0.3em] mb-8 border-b border-white/5 pb-4">{t('selectedProducts')}</h2>
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
                                            {item.configuration && (
                                                <div className="text-xs text-gray-400 mb-2 space-y-1">
                                                    {(() => {
                                                        try {
                                                            const config = JSON.parse(item.configuration);
                                                            return Object.entries(config).map(([key, val]) => (
                                                                <div key={key}>
                                                                    <span className="capitalize">{key === 'size' ? t('size') ?? 'Rozmiar' : key === 'color' ? t('color') ?? 'Kolor' : key === 'text' ? t('dedication') ?? 'Dedykacja' : key}:</span> <span className="text-white">{String(val)}</span>
                                                                </div>
                                                            ));
                                                        } catch {
                                                            return <span>{item.configuration}</span>;
                                                        }
                                                    })()}
                                                </div>
                                            )}
                                            <p className="text-amber-500 font-black text-sm">{formatPrice(item.price)}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button type="button" onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold">-</button>
                                            <span className="w-8 text-center font-bold text-white">{item.quantity}</span>
                                            <button type="button" onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold">+</button>
                                        </div>
                                        <button type="button" onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 ml-2">
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 pt-4 border-t border-white/10 flex flex-col gap-2 text-xl font-black text-amber-50">
                                <div className="flex justify-between text-sm text-amber-50/60">
                                    <span>{t('products')}</span>
                                    <span>{formatPrice(total)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-amber-50/60">
                                    <span>{t('shipping')} ({selectedShipping ? t(`methods.shipping.${selectedShipping}`) : '...'})</span>
                                    <span>{formatPrice(shippingCost)}</span>
                                </div>
                                <div className="flex justify-between border-t border-white/10 pt-2 mt-2 text-2xl text-amber-500">
                                    <span>{t('total')}</span>
                                    <span>{formatPrice(finalTotal)}</span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: Checkout Form */}
                    <div>
                        <Card className="p-6 bg-white shadow-sm sticky top-24 rounded-2xl">
                            <h2 className="text-xl font-bold mb-4 border-b pb-2 text-black">{t('shippingDetails')}</h2>

                            {!session && (
                                <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-lg text-sm">
                                    {t('guestNotice')} <Link href="/api/auth/signin" className="underline font-bold">{t('loginButton')}</Link> {t('loginToSave')}
                                </div>
                            )}

                            <form action={handleSubmit} className="space-y-4">
                                <input type="hidden" name="locale" value={locale} />
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <button
                                        type="button"
                                        onClick={() => setDocumentType('RECEIPT')}
                                        className={`py-3 px-4 rounded-xl border-2 transition-all font-bold ${documentType === 'RECEIPT'
                                            ? 'border-red-600 bg-red-50 text-red-600'
                                            : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                                            }`}
                                    >
                                        📄 {t('receipt')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDocumentType('INVOICE')}
                                        className={`py-3 px-4 rounded-xl border-2 transition-all font-bold ${documentType === 'INVOICE'
                                            ? 'border-red-600 bg-red-50 text-red-600'
                                            : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
                                            }`}
                                    >
                                        🏢 {t('invoice')}
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">{t('email')}</label>
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        defaultValue={session?.user?.email || ''}
                                        className="w-full px-4 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-900"
                                        title={t('email')}
                                    />
                                </div>

                                {documentType === 'INVOICE' && (
                                    <div className="space-y-4 pt-2 pb-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <h3 className="font-bold text-gray-900 border-b pb-2 text-sm italic">{t('invoiceSection')}</h3>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">{t('nip')}</label>
                                            <input
                                                name="nip"
                                                required={documentType === 'INVOICE'}
                                                className="w-full px-4 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-900"
                                                placeholder="PL0000000000"
                                                title={t('nip')}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">{t('companyName')}</label>
                                            <input
                                                name="companyName"
                                                required={documentType === 'INVOICE'}
                                                className="w-full px-4 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-900"
                                                title={t('companyName')}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">{t('companyAddress')}</label>
                                            <input
                                                name="companyAddress"
                                                required={documentType === 'INVOICE'}
                                                className="w-full px-4 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-900"
                                                placeholder="ul. Wspólna 1, 00-001 Warszawa"
                                                title={t('companyAddress')}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">{t('firstName')} i {t('lastName')}</label>
                                    <input
                                        name="name"
                                        required
                                        defaultValue={session?.user?.name || ''}
                                        className="w-full px-4 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-900"
                                        title={t('firstName')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">{t('shippingAddress')} ({t('street')})</label>
                                    <input name="address" required className="w-full px-4 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-900" title={t('street')} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">{t('zipCode')}</label>
                                        <input name="zip" required className="w-full px-4 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-900" title={t('zipCode')} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">{t('city')}</label>
                                        <input name="city" required className="w-full px-4 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-900" title={t('city')} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">{t('phone')}</label>
                                    <input name="phone" type="tel" required className="w-full px-4 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-900" title={t('phone')} />
                                </div>

                                <div className="pt-4 mt-6 border-t border-gray-100">
                                    <h3 className="font-bold mb-3 text-gray-900">{t('shippingMethod')}</h3>
                                    <div className="space-y-2">
                                        {shippingMethods.map((method) => (
                                            <label key={method.id} className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${selectedShipping === method.id ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500' : 'border-gray-200 hover:border-gray-300'}`}>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="radio"
                                                        name="shippingMethod"
                                                        value={method.id}
                                                        checked={selectedShipping === method.id}
                                                        onChange={() => setSelectedShipping(method.id)}
                                                        className="h-4 w-4 text-amber-500 focus:ring-amber-500 border-gray-300"
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-700">{t(`methods.shipping.${method.id}`)}</span>
                                                        <span className="text-[10px] text-gray-400 capitalize">{t(`methods.shipping.${method.id}_desc`)}</span>
                                                    </div>
                                                </div>
                                                <span className="font-bold text-gray-900">{formatPrice(method.price)}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 mt-4 border-t border-gray-100">
                                    <h3 className="font-bold mb-3 text-gray-900">{t('paymentMethod')}</h3>
                                    <div className="space-y-2">
                                        {paymentMethods.map((method) => (
                                            <div key={method.id} className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedPayment === method.id ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setSelectedPayment(method.id)}>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <input
                                                        type="radio"
                                                        name="paymentMethod"
                                                        value={method.id}
                                                        checked={selectedPayment === method.id}
                                                        onChange={() => setSelectedPayment(method.id)}
                                                        className="h-4 w-4 text-amber-500 focus:ring-amber-500 border-gray-300"
                                                    />
                                                    <span className="font-bold text-gray-800">{t(`methods.payment.${method.id}`)}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 ml-7">{t(`methods.payment.${method.id}_desc`)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {!session && (
                                    <div className="mt-8 mb-4 p-6 bg-amber-500/5 border border-amber-500/10 text-amber-700 rounded-2xl text-sm italic">
                                        {t('guestNotice')} <Link href="/api/auth/signin" className="text-amber-500 underline font-bold">{t('loginButton')}</Link> {t('loginToSave')}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full bg-amber-500 hover:bg-amber-600 text-black py-4 text-lg font-black uppercase tracking-widest mt-6 shadow-lg hover:shadow-amber-500/20 transition-all rounded-full"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? t('processing') : `${t('orderAndPay')} (${formatPrice(finalTotal)})`}
                                </Button>
                                <p className="text-[10px] text-center text-gray-400 mt-4 uppercase tracking-widest leading-loose">
                                    {t('acceptTerms', { buttonText: t('orderAndPay') })}
                                </p>
                            </form>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    );
}
