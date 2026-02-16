import AdminNavigation from '@/components/AdminNavigation';
import { Card } from '@bolglass/ui';
import { Tag } from 'lucide-react';

export default function MarketingPromocjePage() {
    return (
        <main className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto px-4">
                <AdminNavigation />
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Promocje</h2>
                        <p className="text-gray-500 text-sm">Zarządzaj kodami rabatowymi i ofertami specjalnymi</p>
                    </div>
                </div>
                <Card className="p-12 text-center border-dashed">
                    <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Tag className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Moduł Promocji w przygotowaniu</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Tutaj będziesz mógł tworzyć kody rabatowe, ustawiać przeceny czasowe oraz zarządzać kampaniami promocyjnymi.
                    </p>
                </Card>
            </div>
        </main>
    );
}
