import { prisma } from "@bolglass/database";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Link } from "@/i18n/navigation";
import { Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button } from "@bolglass/ui";
import { Package, ChevronRight } from "lucide-react";

export default async function OrderHistoryPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const orders = await prisma.order.findMany({
        where: {
            userId: session.user.id
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

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

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Moje Zamówienia</h1>
                <p className="text-gray-500 text-sm">Przeglądaj historię swoich zakupów i śledź statusy.</p>
            </div>

            {orders.length === 0 ? (
                <Card className="p-12 text-center space-y-4">
                    <div className="bg-gray-50 p-4 rounded-full w-fit mx-auto">
                        <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-700 font-medium">Nie masz jeszcze żadnych zamówień.</p>
                    <Link href="/sklep">
                        <Button variant="primary">Przejdź do sklepu</Button>
                    </Link>
                </Card>
            ) : (
                <Card className="overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Zamówienie</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead>Suma</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[100px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id} className="group">
                                    <TableCell>
                                        <span className="font-bold">#{order.id.substring(0, 8)}</span>
                                    </TableCell>
                                    <TableCell className="text-gray-500">
                                        {format(new Date(order.createdAt), 'dd.MM.yyyy')}
                                    </TableCell>
                                    <TableCell className="font-medium text-gray-900">
                                        {order.total.toFixed(2)} PLN
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/moje-konto/zamowienia/${order.id}`}>
                                            <Button variant="ghost" size="sm" className="group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}
        </div>
    );
}
