import AdminNavigation from '@/components/AdminNavigation';
import MailingForm from './MailingForm';

export default function MailingPage() {
    return (
        <main className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4">
                <AdminNavigation />
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900">Centrum Mailingu</h1>
                    <p className="text-gray-500">Wysyłaj wiadomości do klientów w wybranym języku.</p>
                </div>
                <MailingForm />
            </div>
        </main>
    );
}
