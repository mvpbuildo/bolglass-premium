import { Link } from '@/i18n/navigation';
import { Button, Card } from '@bolglass/ui';
import { format } from 'date-fns';
import { Package, Calendar, ChevronRight } from 'lucide-react';

interface ClientOrderCardProps {
    order: any;
}

export default function ClientOrderCard({ order }: ClientOrderCardProps) {
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
            'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'PROCESSING': 'bg-blue-100 text-blue-800 border-blue-200',
            'COMPLETED': 'bg-green-100 text-green-800 border-green-200',
            'CANCELLED': 'bg-red-100 text-red-800 border-red-200',
            'PAID': 'bg-purple-100 text-purple-800 border-purple-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow relative group border-gray-100 flex flex-col h-full bg-white">
            {/* Header */}
            <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                    <Package className="w-4 h-4 text-red-600" />
                    <span>Zamówienie #{order.id.substring(0, 8)}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                </span>
            </div>

            {/* Content */}
            <div className="p-5 flex-grow space-y-4">
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Suma do zapłaty</p>
                        <p className="text-xl font-black text-gray-900 leading-none">
                            {order.total.toFixed(2)} <span className="text-xs font-medium text-gray-500">PLN</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Data złożenia</p>
                        <p className="text-xs font-medium text-gray-700">
                            {format(new Date(order.createdAt), 'dd.MM.yyyy')}
                        </p>
                    </div>
                </div>

                <div className="pt-2 border-t border-gray-50">
                    <p className="text-[11px] font-bold text-gray-400 uppercase mb-2">Metoda płatności</p>
                    <p className="text-xs text-gray-600 italic">
                        {order.paymentProvider || 'Tradycyjny przelew'}
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-gray-50/30 border-t border-gray-50">
                <Link href={`/moje-konto/zamowienia/${order.id}`}>
                    <Button variant="outline" className="w-full text-xs font-bold py-2.5 border-gray-200 text-gray-900 hover:bg-white hover:text-red-600 hover:border-red-200 transition-all flex items-center justify-center gap-2">
                        SZCZEGÓŁY
                        <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                </Link>
            </div>
        </Card>
    );
}
