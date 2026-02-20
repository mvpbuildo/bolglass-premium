
import AdminSettings from '../../../../components/AdminSettings';
import AdminEmailSettings from '../../../../components/AdminEmailSettings';

export default function AdminSettingsPage() {
    return (
        <main className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 space-y-12">
                <div>

                    <h1 className="text-4xl font-black text-gray-900 mb-2 mt-8">Ustawienia Rezerwacji</h1>
                    <p className="text-gray-500 mb-8 font-medium">Zarządzanie cenami i treścią powiadomień</p>

                    <AdminSettings />
                </div>

                <div className="space-y-12">
                    <AdminEmailSettings />
                </div>
            </div>
        </main>
    );
}
