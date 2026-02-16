import { prisma } from '@bolglass/database';
import { auth } from '@/auth';
import AdminNavigation from '@/components/AdminNavigation';
import UserCard from './UserCard';
import UserCreationForm from './UserCreationForm';
import { Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getUsers() {
    return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            accounts: true,
        }
    });
}

export default async function AdminUsersPage() {
    const session = await auth();
    const currentUserEmail = session?.user?.email;
    const users = await getUsers();

    return (
        <main className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto px-4">
                <AdminNavigation />

                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <Users className="w-8 h-8 text-red-600" />
                            Użytkownicy
                        </h1>
                        <p className="text-gray-500 mt-2">Zarządzaj dostępem do panelu administratora i uprawnieniami.</p>
                    </div>

                    <UserCreationForm />
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        {users.map((user) => (
                            <UserCard
                                key={user.id}
                                user={JSON.parse(JSON.stringify(user))}
                                isCurrentUser={user.email === currentUserEmail}
                            />
                        ))}
                    </div>
                </div>

                <div className="mt-12 p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-4">
                    <div className="bg-blue-600 p-2 rounded-lg text-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-blue-900 uppercase tracking-wide">Wskazówka Bezpieczeństwa</h4>
                        <p className="text-sm text-blue-700 leading-relaxed mt-1">
                            Użytkownicy z ikonką <b>G</b> logują się przez konto Google. Użytkownicy z ikonką <b>Klucza</b> logują się za pomocą adresu email i hasła nadanego w tym panelu. Zawsze weryfikuj uprawnienia nowych administratorów.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
