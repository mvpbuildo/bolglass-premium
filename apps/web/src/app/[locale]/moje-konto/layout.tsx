import { auth } from "@/auth";
import { Link, redirect } from "@/i18n/navigation";
import { Button } from "@bolglass/ui";
import { LogOut, Package, User, Settings } from "lucide-react";

export default async function AccountLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const session = await auth();
    const { locale } = await params;

    if (!session) {
        redirect({ href: "/sklep/login", locale });
    }

    const navigation = [
        { name: "Moje Zamówienia", href: "/moje-konto/zamowienia", icon: Package },
        { name: "Profil", href: "/moje-konto/profil", icon: User },
        { name: "Ustawienia", href: "/moje-konto/ustawienia", icon: Settings },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-64 space-y-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition-colors group"
                            >
                                <item.icon className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
                                {item.name}
                            </Link>
                        ))}
                        <div className="pt-4 mt-4 border-t border-gray-100">
                            <form action="/api/auth/signout" method="POST">
                                <button
                                    type="submit"
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors group"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Wyloguj się
                                </button>
                            </form>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
