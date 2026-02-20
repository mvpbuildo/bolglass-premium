import { prisma } from '@bolglass/database';
import { auth } from '@/auth';
import UserCard from './UserCard';
import UserCreationForm from './UserCreationForm';
import { Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getUsers() {
    return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
    });
}

export default async function AdminUsersPage() {
    const session = await auth();
    const currentUserEmail = session?.user?.email;
    const users = await getUsers();

    return (
        <main className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto px-4">

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

            </div>
        </main>
    );
}
