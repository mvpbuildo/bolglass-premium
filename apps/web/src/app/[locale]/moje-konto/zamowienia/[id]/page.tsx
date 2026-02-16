import { prisma } from "@bolglass/database";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import { Link } from "@/i18n/navigation";
import { Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button } from "@bolglass/ui";
import { ChevronLeft, Package, Clock, CreditCard, Truck } from "lucide-react";

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
            }
        }
    });
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const order = await getOrder(id, session.user.id);

    if (!order) {
        notFound();
    }

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            'PENDING': 'Oczekujące',
            'PROCESSING': 'W trakcie',
            'COMPLETED': 'Zakończone',
            'CANCELLED': 'Anulowane',
            'PAID': 'Opłacone',
            'SHIPPED': 'Wysłane',
            'DELIVERED': 'Dostarczone'
        };
        return labels[status] || status;
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
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <ChevronLeft className="w-4 h-4" />
                        Wróć do listy
                    </Button>
                </Link>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <Package className="w-7 h-7 text-red-600" />
                        Zamówienie #{order.id.substring(0, 8)}
                    </h1>
                    <p className="text-gray-500 text-sm">Złożone {format(new Date(order.createdAt), 'dd.MM.yyyy HH:mm')}</p>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-bold w-fit ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Summary */}
                <Card className="lg:col-span-2 divide-y divide-gray-100">
                    <div className="p-6">
                        <h3 className="text-lg font-bold mb-4">Pozycje zamówienia</h3>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Produkt</TableHead>
                                        <TableHead className="text-center">Ilość</TableHead>
                                        <TableHead className="text-right">Suma</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">{item.name}</span>
                                                    {item.product?.sku && <span className="text-xs text-gray-500">SKU: {item.product.sku}</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">{item.quantity}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                {(item.price * item.quantity).toFixed(2)} PLN
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50/50">
                        <div className="flex justify-between items-center text-lg">
                            <span className="font-bold text-gray-900">Łącznie:</span>
                            <span className="font-black text-red-600">{order.total.toFixed(2)} PLN</span>
                        </div>
                    </div>
                </Card>

                {/* Details Sidebar */}
                <div className="space-y-6">
                    {/* Payment Info */}
                    <Card className="p-6 space-y-4">
                        <div className="flex items-center gap-3 text-gray-900 font-bold border-b pb-3">
                            <CreditCard className="w-5 h-5 text-red-600" />
                            Płatność
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Metoda:</span>
                                <span className="font-medium">{order.paymentProvider || 'Nieznana'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Status:</span>
                                <span className={`font-bold ${order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {order.paymentStatus === 'PAID' ? 'Opłacone' : 'Oczekiwanie'}
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Shipping Info */}
                    <Card className="p-6 space-y-4">
                        <div className="flex items-center gap-3 text-gray-900 font-bold border-b pb-3">
                            <Truck className="w-5 h-5 text-red-600" />
                            Dostawa
                        </div>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Metoda:</span>
                                <span className="font-medium">{order.shippingMethod}</span>
                            </div>
                            <div className="space-y-1">
                                <span className="text-gray-500 block">Adres dostawy:</span>
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 italic text-gray-700">
                                    <p className="font-bold not-italic">{shippingAddress.name}</p>
                                    <p>{shippingAddress.street}</p>
                                    <p>{shippingAddress.zip} {shippingAddress.city}</p>
                                    <p className="mt-2 text-xs">Tel: {shippingAddress.phone}</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
