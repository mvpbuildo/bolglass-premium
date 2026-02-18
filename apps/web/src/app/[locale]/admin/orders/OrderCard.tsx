import { Link } from '@/i18n/navigation';
import { Button, Card } from '@bolglass/ui';
import { format } from 'date-fns';
import { Package, Calendar, User, Clock } from 'lucide-react';

interface OrderCardProps {
    order: any; // Using any for now to facilitate early dev, will refine with proper types if possible
}

export default function AdminOrderCard({ order }: OrderCardProps) {
    const getStatusStyles = (status: string) => {
        const styles: Record<string, string> = {
            'COMPLETED': 'bg-green-100 text-green-800 border-green-200',
            'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'CANCELLED': 'bg-red-100 text-red-800 border-red-200',
            'PAID': 'bg-purple-100 text-purple-800 border-purple-200',
            'SHIPPED': 'bg-blue-100 text-blue-800 border-blue-200',
        };
        return styles[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const itemCount = order.items?.length || 0;

    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow relative group border-gray-200 flex flex-col h-full">
            {/* Header: Icon & Status */}
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-2 text-gray-500">
                    <Package className="w-4 h-4" />
                    <span className="text-xs font-mono font-bold">#{order.id.substring(0, 8)}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${getStatusStyles(order.status)}`}>
                    {order.status}
                </span>
            </div>

            {/* Content */}
            <div className="p-4 flex-grow space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-900 font-bold">
                        <span className="text-lg">{order.total.toFixed(2)} PLN</span>
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(order.createdAt), 'HH:mm')}
                    </div>
                </div>

                <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span className="truncate" title={order.email}>{order.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{format(new Date(order.createdAt), 'dd.MM.yyyy')}</span>
                    </div>
                </div>

                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 mt-2">
                    <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">Pozycje ({itemCount})</p>
                    <div className="text-xs text-gray-700 truncate">
                        {order.items?.map((i: any) => i.name).join(', ') || 'Brak pozycji'}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="p-4 pt-0">
                <Link href={`/admin/orders/${order.id}`}>
                    <Button variant="outline" className="w-full text-xs font-bold py-2 border-gray-200 text-gray-900 hover:bg-gray-50 hover:text-gray-900 transition-all">
                        SZCZEGÓŁY ZAMÓWIENIA
                    </Button>
                </Link>
            </div>
        </Card>
    );
}
