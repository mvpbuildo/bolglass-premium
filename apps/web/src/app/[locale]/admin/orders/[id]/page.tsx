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

export default async function OrderDetailsPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;
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

    // Helper for readable payment methods
    const paymentMethods: Record<string, string> = {
        'manual_transfer': 'Przelew tradycyjny',
        'przelewy24': 'Przelewy24',
        'stripe': 'Stripe'
    };
    const paymentLabel = paymentMethods[order.paymentProvider] || order.paymentProvider || 'Nieznana';

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/orders">
                    <Button variant="outline" size="sm">← Powrót</Button>
                </Link>
                <h1 className="text-3xl font-bold text-white">Zamówienie #{order.id.substring(0, 8)}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Info */}
                <Card className="p-6 space-y-4 bg-white dark:bg-gray-900">
                    <h3 className="text-lg font-bold border-b pb-2 text-gray-900 dark:text-gray-100">Dane Klienta i Rozliczenie</h3>
                    <div className="space-y-4 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-gray-600 dark:text-gray-400">Imię i Nazwisko:</div>
                            <div className="font-medium text-gray-900 dark:text-gray-200">{customerName}</div>
                            <div className="text-gray-600 dark:text-gray-400">Email:</div>
                            <div className="font-medium text-gray-900 dark:text-gray-200">{order.email}</div>
                            <div className="text-gray-600 dark:text-gray-400">Telefon:</div>
                            <div className="font-medium text-gray-900 dark:text-gray-200">{customerPhone}</div>
                            <div className="text-gray-600 dark:text-gray-400">Adres Dostawy:</div>
                            <div className="font-medium whitespace-pre-line text-gray-900 dark:text-gray-200">{customerAddress}</div>
                        </div>

                        <div className="pt-4 mt-4 border-t space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">Rodzaj dokumentu:</span>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${order.documentType === 'INVOICE'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    }`}>
                                    {order.documentType === 'INVOICE' ? 'FAKTURA VAT' : 'PARAGON'}
                                </span>
                            </div>

                            {order.documentType === 'INVOICE' && order.invoiceData && (
                                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="text-gray-500 dark:text-gray-400 text-xs">NIP:</div>
                                        <div className="font-bold text-gray-900 dark:text-gray-200">{(order.invoiceData as any).nip}</div>
                                        <div className="text-gray-500 dark:text-gray-400 text-xs">Firma:</div>
                                        <div className="font-medium text-gray-900 dark:text-gray-200">{(order.invoiceData as any).companyName}</div>
                                        <div className="text-gray-500 dark:text-gray-400 text-xs">Adres:</div>
                                        <div className="font-medium text-xs whitespace-pre-line text-gray-900 dark:text-gray-200">{(order.invoiceData as any).companyAddress}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Order Status & Summary */}
                <Card className="p-6 space-y-4 bg-white dark:bg-gray-900">
                    <h3 className="text-lg font-bold border-b pb-2 text-gray-900 dark:text-gray-100">Status i Płatność</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm items-center">
                        <div className="text-gray-600 dark:text-gray-400">Data złożenia:</div>
                        <div className="font-medium text-gray-900 dark:text-gray-200">{format(new Date(order.createdAt), 'dd.MM.yyyy HH:mm')}</div>

                        <div className="text-gray-600 dark:text-gray-400">Metoda płatności:</div>
                        <div className="font-medium text-gray-900 dark:text-gray-200">{paymentLabel}</div>

                        <div className="text-gray-600 dark:text-gray-400">Sposób dostawy:</div>
                        <div className="font-medium text-gray-900 dark:text-gray-200">{order.shippingMethod}</div>

                        <div className="text-gray-600 dark:text-gray-400">Koszt dostawy:</div>
                        <div className="font-medium text-gray-900 dark:text-gray-200">{order.shippingCost.toFixed(2)} PLN</div>

                        <div className="text-gray-600 dark:text-gray-400">Status:</div>
                        <div>
                            <form action={updateOrderStatus} className="flex gap-2">
                                <input type="hidden" name="id" value={order.id} />
                                <select
                                    name="status"
                                    defaultValue={order.status}
                                    className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-600"
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
            <Card className="bg-white dark:bg-gray-900">
                <div className="p-6 border-b dark:border-gray-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Pozycje Zamówienia</h3>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow className="dark:border-gray-800">
                            <TableHead className="text-gray-600 dark:text-gray-400">Produkt</TableHead>
                            <TableHead className="text-gray-600 dark:text-gray-400">SKU</TableHead>
                            <TableHead className="text-center text-gray-600 dark:text-gray-400">Ilość</TableHead>
                            <TableHead className="text-right text-gray-600 dark:text-gray-400">Cena jedn.</TableHead>
                            <TableHead className="text-right text-gray-600 dark:text-gray-400">Suma</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {order.items.map((item) => (
                            <TableRow key={item.id} className="dark:border-gray-800">
                                <TableCell className="font-medium text-gray-900 dark:text-gray-200">
                                    <div className="flex flex-col">
                                        <span>{item.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-xs text-gray-500 dark:text-gray-400">{item.product?.sku || '-'}</TableCell>
                                <TableCell className="text-center text-gray-900 dark:text-gray-200">{item.quantity}</TableCell>
                                <TableCell className="text-right text-gray-900 dark:text-gray-200">{item.price.toFixed(2)} PLN</TableCell>
                                <TableCell className="text-right font-bold text-gray-900 dark:text-gray-100">
                                    {(item.price * item.quantity).toFixed(2)} PLN
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow className="bg-gray-50 dark:bg-gray-800 font-bold">
                            <TableCell colSpan={4} className="text-right text-lg text-gray-900 dark:text-gray-100">Łącznie do zapłaty:</TableCell>
                            <TableCell className="text-right text-lg text-green-600 dark:text-green-400">{order.total.toFixed(2)} PLN</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
