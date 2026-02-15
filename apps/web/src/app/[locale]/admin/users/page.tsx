import { prisma } from '@bolglass/database';
import { Button, Card } from '@bolglass/ui';
import AdminNavigation from '../../../../components/AdminNavigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

async function getUsers() {
    return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: { sessions: true }
    });
}

async function toggleUserRole(userId: string, currentRole: string) {
    'use server'
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return;

    // Safety check: Prevent modifying own role
    if (session?.user?.id === userId) return;

    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';

    await prisma.user.update({
        where: { id: userId },
        data: { role: newRole }
    });

    revalidatePath('/admin/users');
}

export default async function AdminUsersPage() {
    const users = await getUsers();
    const session = await auth();
    const currentUserId = session?.user?.id;

    return (
        <main className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto px-4">
                <AdminNavigation />

                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Użytkownicy</h2>
                    <p className="text-gray-500 text-sm">Zarządzaj dostępem do panelu administratora</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {users.map((user) => (
                        <Card key={user.id} className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {user.image ? (
                                    <img src={user.image} alt={user.name || ''} className="w-10 h-10 rounded-full" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                        {user.name?.[0] || '?'}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                        {user.name}
                                        {user.role === 'ADMIN' && (
                                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] uppercase font-bold rounded-full">Admin</span>
                                        )}
                                        {user.id === currentUserId && (
                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] uppercase font-bold rounded-full">Ty</span>
                                        )}
                                    </h3>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                            </div>

                            <form action={toggleUserRole.bind(null, user.id, user.role)}>
                                <Button
                                    type="submit"
                                    variant="outline"
                                    disabled={user.id === currentUserId}
                                    className={`
                                        text-xs font-bold
                                        ${user.role === 'ADMIN'
                                            ? 'text-red-600 border-red-200 hover:bg-red-50'
                                            : 'text-purple-600 border-purple-200 hover:bg-purple-50'}
                                        ${user.id === currentUserId ? 'opacity-50 cursor-not-allowed' : ''}
                                    `}
                                >
                                    {user.role === 'ADMIN' ? 'Zabierz Admina ⬇️' : 'Daj Admina ⬆️'}
                                </Button>
                            </form>
                        </Card>
                    ))}
                </div>
            </div>
        </main>
    );
}
