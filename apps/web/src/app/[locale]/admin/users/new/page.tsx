import { Link } from '@/i18n/navigation';
import { prisma } from '@bolglass/database';
import { Button, Card } from '@bolglass/ui';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export default function AdminNewUserPage() {
    async function createUser(formData: FormData) {
        'use server'

        const session = await auth();
        if (session?.user?.role !== 'ADMIN') return;

        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const role = formData.get('role') as string; // "USER" or "ADMIN"

        // Check if user exists
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            // Handle error - for now just redirect
            redirect('/admin/users?error=EmailExists');
        }

        await prisma.user.create({
            data: {
                name,
                email,
                role
            }
        });

        redirect('/admin/users');
    }

    return (
        <main className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto px-4">
                <div className="mb-8">
                    <Link href="/admin/users" className="text-sm text-gray-500 hover:text-red-600 transition-colors">
                        ← Powrót do listy użytkowników
                    </Link>
                    <h1 className="text-3xl font-black text-gray-900 mt-2">Dodaj Nowego Użytkownika</h1>
                </div>

                <Card className="p-6 bg-white shadow-sm">
                    <form action={createUser} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Nazwa (Imię i Nazwisko)</label>
                            <input name="name" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Jan Kowalski" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                            <input name="email" type="email" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="jan@example.com" />
                            <p className="text-xs text-gray-400 mt-1">Użytkownik zaloguje się przez Google używając tego adresu.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Rola</label>
                            <select name="role" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
                                <option value="USER">Użytkownik (Klient)</option>
                                <option value="ADMIN">Administrator</option>
                            </select>
                        </div>

                        <div className="pt-4 border-t flex justify-end">
                            <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-8">
                                Utwórz Użytkownika
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </main>
    );
}
