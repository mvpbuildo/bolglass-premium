import { prisma } from '@bolglass/database';
import OrderCard from './OrderCard';
import AdminNavigation from '@/components/AdminNavigation';
import { Card, Button } from '@bolglass/ui';
import { Link } from '@/i18n/navigation';

export const dynamic = 'force-dynamic';

async function getOrders(status?: string) {
    const where = status && status !== 'ALL' ? { status } : {};
    return await prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            items: true
        }
    });
}

async function getOrderCounts() {
    const counts = await prisma.order.groupBy({
        by: ['status'],
        _count: {
            id: true
        }
    });

    const countMap: Record<string, number> = {};
    counts.forEach(c => {
        countMap[c.status] = c._count.id;
    });

    return countMap;
}

export default async function AdminOrdersPage(props: { searchParams: Promise<{ status?: string }> }) {
    const searchParams = await props.searchParams;
    const currentStatus = searchParams.status || 'ALL';
    const orders = await getOrders(currentStatus);
    const counts = await getOrderCounts();

    const totalOrders = Object.values(counts).reduce((a, b) => a + b, 0);

    const statuses = [
        { id: 'ALL', label: 'Wszystkie', count: totalOrders },
        { id: 'PENDING', label: 'Oczekujące', count: counts['PENDING'] || 0 },
        { id: 'PROCESSING', label: 'W trakcie', count: counts['PROCESSING'] || 0 },
        { id: 'COMPLETED', label: 'Zakończone', count: counts['COMPLETED'] || 0 },
        { id: 'CANCELLED', label: 'Anulowane', count: counts['CANCELLED'] || 0 },
    ];

    return (
        <div className="space-y-6">
            <AdminNavigation />
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Zamówienia</h1>
            </div>

            {/* Status Tabs */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
                {statuses.map((status) => (
                    <Link key={status.id} href={`/admin/orders?status=${status.id}`}>
                        <div className={`px-4 py-2 rounded-full text-sm font-medium border flex items-center gap-2 transition-colors ${currentStatus === status.id
                                ? 'bg-black text-white border-black dark:bg-white dark:text-black'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'
                            }`}>
                            {status.label}
                            <span className={`px-1.5 py-0.5 rounded-full text-xs ${currentStatus === status.id
                                    ? 'bg-white/20'
                                    : 'bg-gray-100 dark:bg-gray-700'
                                }`}>
                                {status.count}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {orders.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                        <div className="bg-gray-50 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">📦</span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Brak zamówień w tym statusie.</p>
                    </div>
                ) : (
                    orders.map((order) => (
                        <OrderCard key={order.id} order={order} />
                    ))
                )}
            </div>
        </div>
    );
}
