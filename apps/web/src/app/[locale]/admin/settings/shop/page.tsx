import AdminShopSettings from '@/components/AdminShopSettings';
import AdminNavigation from '@/components/AdminNavigation';

export default function AdminShopSettingsPage() {
    return (
        <main className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 space-y-12">
                <div>
                    <AdminNavigation />

                    <div className="mb-10 mt-8">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Ustawienia Sklepu</h1>
                        <p className="text-lg text-gray-500 mt-2 font-medium">Zarządzaj konfiguracją poczty i komunikatami dla klientów.</p>
                    </div>

                    <AdminShopSettings />
                </div>
            </div>

            <div className="mt-16 text-center text-xs text-gray-400 font-medium">
                Bolglass Admin Portal &bull; Shop Configuration Engine
            </div>
        </main>
    );
}
