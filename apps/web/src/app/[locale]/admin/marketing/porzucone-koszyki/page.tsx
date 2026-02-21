import { auth } from '@/auth';
import { prisma } from '@bolglass/database';
import { redirect } from 'next/navigation';
import { Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@bolglass/ui';
import { format } from 'date-fns';
import { CheckCircle, XCircle } from 'lucide-react';

export default async function AbandonedCartsAnalyticsPage() {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
        redirect('/admin/login');
    }

    // 1. Zbieramy tylko te zamówienia, które dostały e-maila ratunkowego
    const targetedOrders = await prisma.order.findMany({
        where: { abandonedEmailSentAt: { not: null } },
        orderBy: { abandonedEmailSentAt: 'desc' },
        include: { user: true }
    });

    const totalTargeted = targetedOrders.length;
    const recoveredOrders = targetedOrders.filter(o => o.isRecovered);
    const lostOrders = targetedOrders.filter(o => !o.isRecovered);

    const recoveredRevenue = recoveredOrders.reduce((acc, curr) => acc + curr.total, 0);
    const lostRevenue = lostOrders.reduce((acc, curr) => acc + curr.total, 0);

    const recoveryRate = totalTargeted > 0 ? ((recoveredOrders.length / totalTargeted) * 100).toFixed(1) : 0;

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 mb-2">Ratowanie Porzuconych Koszyków</h1>
                <p className="text-gray-500">Analiza skuteczności automatycznych kampanii e-mail po nieudanej/zaniechanej płatności klienta.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="p-6 bg-white border-gray-200">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Stopa Odzysku</h3>
                    <p className="text-3xl font-black text-gray-900">{recoveryRate}%</p>
                </Card>
                <Card className="p-6 bg-green-50/50 border-green-100">
                    <h3 className="text-[10px] font-black text-green-800 uppercase tracking-widest mb-1">Ocalony Przychód</h3>
                    <p className="text-3xl font-black text-green-600">{recoveredRevenue.toFixed(2)} PLN</p>
                    <p className="text-xs text-green-800/60 mt-1">Z {recoveredOrders.length} zamówień</p>
                </Card>
                <Card className="p-6 bg-red-50/50 border-red-100">
                    <h3 className="text-[10px] font-black text-red-800 uppercase tracking-widest mb-1">Utracony Przychód</h3>
                    <p className="text-3xl font-black text-red-600">{lostRevenue.toFixed(2)} PLN</p>
                    <p className="text-xs text-red-800/60 mt-1">Z {lostOrders.length} zamówień</p>
                </Card>
                <Card className="p-6 bg-purple-50/50 border-purple-100">
                    <h3 className="text-[10px] font-black text-purple-800 uppercase tracking-widest mb-1">Wysłane Ratunki</h3>
                    <p className="text-3xl font-black text-purple-600">{totalTargeted}</p>
                    <p className="text-xs text-purple-800/60 mt-1">Sztuk maili</p>
                </Card>
            </div>

            <Card className="p-0 overflow-hidden border-gray-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-900">Historia Interwencji</h2>
                </div>
                {totalTargeted === 0 ? (
                    <div className="p-8 text-center text-gray-500">Brak zarejestrowanych interwencji mailowych. Skrypt sprawdzający działa w tle.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-white">
                                    <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500">ID Zamówienia / Klient</TableHead>
                                    <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500">Mienie W Koszyku</TableHead>
                                    <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500">Wysłano E-mail</TableHead>
                                    <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500 text-right">Skutek Ratowania</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {targetedOrders.map(order => (
                                    <TableRow key={order.id} className="hover:bg-gray-50">
                                        <TableCell>
                                            <div className="font-mono text-xs font-bold text-gray-900">{order.id.split('-')[0]}</div>
                                            <div className="text-sm text-gray-500">{order.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-bold text-gray-900">{order.total.toFixed(2)} {order.currency}</span>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600">
                                            {order.abandonedEmailSentAt ? format(new Date(order.abandonedEmailSentAt), 'dd.MM.yyyy HH:mm') : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {order.isRecovered ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                                    <CheckCircle className="w-4 h-4" /> Uratowano ({order.paymentStatus})
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                                                    <XCircle className="w-4 h-4" /> Brak Reakcji
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </Card>
        </div>
    );
}
