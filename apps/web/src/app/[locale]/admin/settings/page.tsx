import { Link } from '@/i18n/navigation';
import AdminSettings from '../../../../components/AdminSettings';
import AdminEmailSettings from '../../../../components/AdminEmailSettings';

export default function AdminSettingsPage() {
    return (
        <main className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 space-y-12">
                <div>
                    <div className="mb-8 flex items-center gap-4">
                        <Link href="/admin/bookings" className="text-sm text-gray-500 hover:text-red-600 transition-colors">← Powrót do rezerwacji</Link>
                    </div>

                    <h1 className="text-4xl font-black text-gray-900 mb-2">Konfiguracja Systemu</h1>
                    <p className="text-gray-500 mb-8 font-medium">Zarządzanie cenami i ustawieniami globalnymi</p>

                    <AdminSettings />
                </div>

                <AdminEmailSettings />
            </div>
        </main>
    );
}
