import AdminBookingList from '../../../../components/AdminBookingList';
import AdminCalendar from '../../../../components/AdminCalendar';
import AdminStats from '../../../../components/AdminStats';

export default function AdminBookingsPage() {
    return (
        <main className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto px-4">
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
