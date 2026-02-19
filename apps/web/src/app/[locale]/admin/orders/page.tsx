import { prisma } from '@bolglass/database';
import OrderCard from './OrderCard';
import AdminNavigation from '@/components/AdminNavigation';

export default async function AdminOrdersPage() {
    const orders = await getOrders();

    return (
        <div className="space-y-6">
            <AdminNavigation />
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Zamówienia</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {orders.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">📦</span>
                        </div>
                        <p className="text-gray-500 font-medium">Brak zamówień do wyświetlenia.</p>
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
