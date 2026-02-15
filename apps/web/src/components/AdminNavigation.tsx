import { Link } from '@/i18n/navigation';
import { usePathname } from 'next/navigation';

export default function AdminNavigation() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname.includes(path);

    const navItems = [
        { name: 'Rezerwacje', path: '/admin/bookings', icon: '📅' },
        { name: 'Produkty', path: '/admin/products', icon: '📦' },
        { name: 'Zamówienia', path: '/admin/orders', icon: '🛒' },
        { name: 'Ustawienia', path: '/admin/settings', icon: '⚙️' },
    ];

    return (
        <nav className="mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-black text-gray-900">Panel Administratora</h1>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">BETA</span>
                </div>

                <div className="flex flex-wrap gap-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`
                                px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2
                                ${isActive(item.path)
                                    ? 'bg-gray-900 text-white shadow-md'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}
                            `}
                        >
                            <span>{item.icon}</span>
                            {item.name}
                        </Link>
                    ))}
                    <Link href="/" className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-red-600 transition-colors ml-2">
                        Wyloguj
                    </Link>
                </div>
            </div>
        </nav>
    );
}
