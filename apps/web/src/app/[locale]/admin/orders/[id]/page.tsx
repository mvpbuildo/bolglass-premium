import { prisma } from '@bolglass/database';
import { notFound } from 'next/navigation';
import { Button, Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@bolglass/ui';
import { updateOrderStatus } from './actions';
import { Link } from '@/i18n/navigation';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

async function getOrder(id: string) {
    return await prisma.order.findUnique({
        where: { id },
        include: {
            items: {
                include: {
                    product: true
                }
            }
        }
    });
}

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const order = await getOrder(id);

    if (!order) {
        notFound();
    }

    // Helper to safely access shipping address
    const shippingAddress = order.shippingAddress as Record<string, string> || {};
    const customerName = shippingAddress.name || 'Gość';
    const customerPhone = shippingAddress.phone || 'Brak';
    const customerAddress = shippingAddress.street
        ? `${shippingAddress.street}\n${shippingAddress.zip} ${shippingAddress.city}`
        : 'Brak danych adresowych';

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/orders">
                    <Button variant="outline" size="sm">← Powrót</Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Zamówienie #{order.id.substring(0, 8)}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Info */}
                <Card className="p-6 space-y-4">
                    <h3 className="text-lg font-bold border-b pb-2">Dane Klienta</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-gray-500">Imię i Nazwisko:</div>
                        <div className="font-medium">{customerName}</div>
                        <div className="text-gray-500">Email:</div>
                        <div className="font-medium">{order.email}</div>
                        <div className="text-gray-500">Telefon:</div>
                        <div className="font-medium">{customerPhone}</div>
                        <div className="text-gray-500">Adres:</div>
                        <div className="font-medium whitespace-pre-line">{customerAddress}</div>
                    </div>
                </Card>

                {/* Order Status & Summary */}
                <Card className="p-6 space-y-4">
                    <h3 className="text-lg font-bold border-b pb-2">Status i Płatność</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm items-center">
                        <div className="text-gray-500">Data złożenia:</div>
                        <div className="font-medium">{format(new Date(order.createdAt), 'dd.MM.yyyy HH:mm')}</div>
                        <div className="text-gray-500">Metoda płatności:</div>
                        <div className="font-medium">{order.paymentProvider || 'Nieznana'}</div>
                        <div className="text-gray-500">Status:</div>
                        <div>
                            <form action={updateOrderStatus} className="flex gap-2">
                                <input type="hidden" name="id" value={order.id} />
                                <select
                                    name="status"
                                    defaultValue={order.status}
                                    className="border rounded px-2 py-1 text-sm bgbw-white"
                                    aria-label="Zmień status zamówienia"
                                >
                                    <option value="PENDING">Oczekujące</option>
                                    <option value="PROCESSING">W trakcie</option>
                                    <option value="COMPLETED">Zakończone</option>
                                    <option value="CANCELLED">Anulowane</option>
                                </select>
                                <Button type="submit" size="sm" variant="primary">Zmień</Button>
                            </form>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Order Items */}
            <Card>
                <div className="p-6 border-b">
                    <h3 className="text-lg font-bold">Pozycje Zamówienia</h3>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Produkt</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead className="text-center">Ilość</TableHead>
                            <TableHead className="text-right">Cena jedn.</TableHead>
                            <TableHead className="text-right">Suma</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {order.items.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span>{item.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-xs text-gray-500">{item.product?.sku || '-'}</TableCell>
                                <TableCell className="text-center">{item.quantity}</TableCell>
                                <TableCell className="text-right">{item.price.toFixed(2)} PLN</TableCell>
                                <TableCell className="text-right font-bold">
                                    {(item.price * item.quantity).toFixed(2)} PLN
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow className="bg-gray-50 font-bold">
                            <TableCell colSpan={4} className="text-right text-lg">Łącznie do zapłaty:</TableCell>
                            <TableCell className="text-right text-lg text-green-600">{order.total.toFixed(2)} PLN</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
