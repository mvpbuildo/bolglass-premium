import { prisma } from '@bolglass/database';
import { Button, Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@bolglass/ui';
import { Link } from '@/i18n/navigation';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

async function getOrders() {
    return await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            items: true
        }
    });
}

export default async function AdminOrdersPage() {
    const orders = await getOrders();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Zamówienia</h1>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Klient</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Kwota</TableHead>
                            <TableHead>Akcje</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                    Brak zamówień.
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-mono text-xs">{order.id.substring(0, 8)}...</TableCell>
                                    <TableCell>{format(new Date(order.createdAt), 'dd.MM.yyyy HH:mm')}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{order.customerEmail}</span>
                                            <span className="text-xs text-gray-500">{order.customerPhone}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-bold">
                                        {order.total.toFixed(2)} PLN
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/admin/orders/${order.id}`}>
                                            <Button size="sm" variant="outline">Szczegóły</Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
