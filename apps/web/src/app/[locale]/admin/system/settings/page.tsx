
import AdminSmtpSettings from '../../../../../components/AdminSmtpSettings';
import AdminContactSettings from '../../../../../components/AdminContactSettings';
import AdminNavigation from '../../../../../components/AdminNavigation';

export default function AdminSystemSettingsPage() {
    return (
        <main className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 space-y-12">
                <div>
                    <AdminNavigation />

                    <h1 className="text-4xl font-black text-gray-900 mb-2 mt-8">Ustawienia Systemowe</h1>
                    <p className="text-gray-500 mb-8 font-medium">Konfiguracja danych firmy, social media oraz serwera pocztowego.</p>

                    <div className="space-y-12">
                        <AdminContactSettings />
                        <AdminSmtpSettings />
                    </div>
                </div>
            </div>
        </main>
    );
}
