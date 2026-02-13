import Link from 'next/link';
import AdminBookingList from '../../../../components/AdminBookingList';
import AdminCalendar from '../../../../components/AdminCalendar';
import AdminStats from '../../../../components/AdminStats';

export default function AdminBookingsPage() {
    return (
        <main className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto px-4">
                <div className="mb-8 flex items-center gap-4">
                    <Link href="/" className="text-sm text-gray-500 hover:text-red-600 transition-colors">← Powrót do strony głównej</Link>
                </div>

                <h1 className="text-4xl font-black text-gray-900 mb-2">Panel Administratora</h1>
                <div className="flex justify-between items-end mb-8">
                    <p className="text-gray-500 font-medium">Zarządzanie warsztatami i rezerwacjami</p>
                    <Link href="/admin/settings" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
                        ⚙️ Ustawienia
                    </Link>
                </div>

                <div className="mb-12">
                    <AdminStats />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <AdminCalendar />
                    </div>
                    <div className="lg:col-span-2">
                        <AdminBookingList />
                    </div>
                </div>
            </div>
        </main>
    );
}
