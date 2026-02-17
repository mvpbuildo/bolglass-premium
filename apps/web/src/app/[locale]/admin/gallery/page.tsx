import AdminNavigation from '@/components/AdminNavigation';
import GalleryManager from './GalleryManager';

export default function GalleryPage() {
    return (
        <main className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto px-4">
                <AdminNavigation />
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Galeria Zarządzanie</h2>
                        <p className="text-gray-500 text-sm">Przesyłaj zdjęcia i filmy do galerii oraz na stronę główną</p>
                    </div>
                </div>

                <GalleryManager />
            </div>
        </main>
    );
}
