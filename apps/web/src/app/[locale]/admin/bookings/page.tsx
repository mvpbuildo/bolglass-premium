import AdminBookingList from '../../../../components/AdminBookingList';

export default function AdminBookingsPage() {
    return (
        <main className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto px-4">
                <div className="mb-8 flex items-center gap-4">
                    <a href="/" className="text-sm text-gray-500 hover:text-red-600 transition-colors">← Powrót do strony głównej</a>
                </div>

                <h1 className="text-4xl font-black text-gray-900 mb-2">Panel Administratora</h1>
                <p className="text-gray-500 mb-12">Zarządzanie rezerwacjami na warsztaty dmuchania szkła.</p>

                <AdminBookingList />
            </div>
        </main>
    );
}
