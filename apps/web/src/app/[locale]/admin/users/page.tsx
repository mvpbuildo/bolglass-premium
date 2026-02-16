import { prisma } from '@bolglass/database';
import { Button } from '@bolglass/ui';
import AdminNavigation from '@/components/AdminNavigation';
import { auth } from '@/auth';
import { Link } from '@/i18n/navigation';
import UserCard from './UserCard';

export const dynamic = 'force-dynamic';

async function getUsers() {
    return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    });
}

export default async function AdminUsersPage() {
    const users = await getUsers();
    const session = await auth();
    const currentUserId = session?.user?.id;

    return (
        <main className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto px-4">
                <AdminNavigation />

                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Użytkownicy</h2>
                        <p className="text-gray-500 text-sm">Zarządzaj dostępem do panelu administratora</p>
                    </div>
                    <Link href="/admin/users/new">
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                            + Dodaj Użytkownika
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {users.map((user) => (
                        <UserCard
                            key={user.id}
                            user={user}
                            currentUserId={currentUserId}
                        />
                    ))}
                </div>
            </div>
        </main>
    );
}
