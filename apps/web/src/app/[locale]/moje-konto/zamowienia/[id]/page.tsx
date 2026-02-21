import { prisma } from "@bolglass/database";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import { Link } from "@/i18n/navigation";
import { Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button } from "@bolglass/ui";
import { ChevronLeft, Package, CreditCard, Truck } from "lucide-react";
import { getTranslations } from "next-intl/server";

async function getOrder(id: string, userId: string) {
    return await prisma.order.findUnique({
        where: {
            id: id,
            userId: userId // Security: Only fetch if it belongs to the user
        },
        include: {
            items: {
                include: {
                    product: true
                }
            },
            coupon: true
        }
    });
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string, locale: string }> }) {
    const { id, locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Account.orders' });
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const order = await getOrder(id, session.user.id);

    if (!order) {
        notFound();
    }

    const getStatusLabel = (status: string) => {
        return t(`statuses.${status}`) || status;
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'PENDING': 'bg-yellow-100 text-yellow-800',
            'PROCESSING': 'bg-blue-100 text-blue-800',
            'COMPLETED': 'bg-green-100 text-green-800',
            'CANCELLED': 'bg-red-100 text-red-800',
            'PAID': 'bg-purple-100 text-purple-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const shippingAddress = order.shippingAddress as Record<string, string> || {};

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/moje-konto/zamowienia">
                    <Button variant="ghost" size="sm" className="flex items-center gap-2 text-amber-50 hover:bg-white/10 hover:text-amber-500">
                        <ChevronLeft className="w-4 h-4" />
                        {t('backToList')}
                    </Button>
                </Link>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-amber-50 flex items-center gap-3">
                        <Package className="w-7 h-7 text-amber-500" />
                        {t('order')} #{order.id.substring(0, 8)}
                    </h1>
                    <p className="text-amber-200/40 text-sm font-medium">{t('placedAt')} {format(new Date(order.createdAt), 'dd.MM.yyyy HH:mm')}</p>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-bold w-fit ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Summary */}
                <Card className="lg:col-span-2 divide-y divide-gray-100">
                    <div className="p-6">
                        <h3 className="text-lg font-bold mb-4">{t('orderItems')}</h3>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-gray-200">
                                        <TableHead className="text-gray-900 font-black uppercase text-[10px] tracking-widest">{t('product')}</TableHead>
                                        <TableHead className="text-center text-gray-900 font-black uppercase text-[10px] tracking-widest">{t('quantity')}</TableHead>
                                        <TableHead className="text-right text-gray-900 font-black uppercase text-[10px] tracking-widest">{t('unitPrice')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">{item.name}</span>
                                                    {item.product?.sku && <span className="text-xs text-gray-500">SKU: {item.product.sku}</span>}
                                                    {item.configuration && item.configuration !== "{}" && (
                                                        <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                                                            {(() => {
                                                                try {
                                                                    const config = JSON.parse(item.configuration as string);
                                                                    return Object.entries(config).map(([key, value]) => {
                                                                        const labels: Record<string, string> = {
                                                                            size: t('size') ?? 'Rozmiar',
                                                                            color: t('color') ?? 'Kolor',
                                                                            text: t('inscription') ?? 'Napis'
                                                                        };
                                                                        return (
                                                                            <div key={key} className="flex gap-2">
                                                                                <span className="font-semibold">{labels[key] || key}:</span>
                                                                                <span>{value as string}</span>
                                                                            </div>
                                                                        );
                                                                    });
                                                                } catch {
                                                                    return null;
                                                                }
                                                            })()}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">{item.quantity}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                {order.currency === 'EUR' ? Math.ceil(item.price * item.quantity) : (item.price * item.quantity).toFixed(2)} {order.currency}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50/50 border-t border-gray-100">
                        {order.coupon && order.discountAmount > 0 && (
                            <div className="flex justify-between items-center text-sm font-bold text-green-600 mb-2">
                                <span>{t('discountCode') || 'Kod Rabatowy'} ({order.coupon.code})</span>
                                <span>-{order.currency === 'EUR' ? Math.ceil(order.discountAmount) : order.discountAmount.toFixed(2)} {order.currency || 'PLN'}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center text-lg">
                            <span className="font-bold text-gray-900">{t('totalLabel') || 'Razem'}</span>
                            <span className="font-black text-red-600 text-2xl">{order.currency === 'EUR' ? Math.ceil(order.total) : order.total.toFixed(2)} {order.currency || 'PLN'}</span>
                        </div>
                    </div>
                </Card>

                {/* Details Sidebar */}
                <div className="space-y-6">
                    {/* Payment Info */}
                    <Card className="p-6 space-y-4">
                        <div className="flex items-center gap-3 text-gray-900 font-bold border-b pb-3">
                            <CreditCard className="w-5 h-5 text-red-600" />
                            {t('payment')}
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                <span className="text-gray-500 font-medium">{t('method')}:</span>
                                <span className="font-bold text-gray-900">
                                    {t.has(`paymentMethods.${order.paymentProvider}`)
                                        ? t(`paymentMethods.${order.paymentProvider}`)
                                        : (order.paymentProvider || t('unknown'))}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">{t('paymentStatus')}:</span>
                                <span className={`font-black uppercase text-[10px] px-2 py-0.5 rounded-md ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {order.paymentStatus === 'PAID' ? t('paid') : t('waiting')}
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Shipping Info */}
                    <Card className="p-6 space-y-4">
                        <div className="flex items-center gap-3 text-gray-900 font-bold border-b pb-3">
                            <Truck className="w-5 h-5 text-red-600" />
                            {t('shipping')}
                        </div>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                <span className="text-gray-500 font-medium">{t('method')}:</span>
                                <span className="font-bold text-gray-900">{order.shippingMethod}</span>
                            </div>
                            <div className="space-y-2">
                                <span className="text-gray-400 font-black uppercase text-[10px] tracking-widest block">{t('shippingAddress')}:</span>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 italic text-gray-700 shadow-inner">
                                    <p className="font-black not-italic text-gray-900 mb-1">{shippingAddress.name}</p>
                                    <p className="font-medium">{shippingAddress.street}</p>
                                    <p className="font-medium">{shippingAddress.zip} {shippingAddress.city}</p>
                                    <div className="mt-3 pt-2 border-t border-gray-200/50 flex items-center gap-2 text-[11px] font-bold text-gray-500 not-italic">
                                        <span className="text-gray-400">TEL:</span> {shippingAddress.phone}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
