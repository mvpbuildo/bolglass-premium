'use client';

import { Link } from '@/i18n/navigation';
import { usePathname } from 'next/navigation';

export default function AdminNavigation() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname.includes(path);

    const checkActiveGroup = (paths: string[]) => paths.some(path => pathname.includes(path));

    const modules = [
        {
            title: 'WARSZTATY',
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            items: [
                { name: 'Rezerwacje', path: '/admin/bookings', icon: '📅' },
                { name: 'Ustawienia Rezerwacji', path: '/admin/settings', icon: '⚙️' },
            ]
        },
        {
            title: 'SKLEP',
            color: 'text-green-600',
            bg: 'bg-green-50',
            items: [
                { name: 'Produkty', path: '/admin/products', icon: '📦' },
                { name: 'Zamówienia', path: '/admin/orders', icon: '🛒' },
            ]
        },
        {
            title: 'MARKETING',
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            items: [
                { name: 'Promocje', path: '/admin/marketing/promocje', icon: '🏷️' },
                { name: 'Newsletter', path: '/admin/marketing/newsletter', icon: '📧' },
            ]
        },
        {
            title: 'GALERIA',
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            items: [
                { name: 'Zdjęcia', path: '/admin/gallery', icon: '🖼️' },
                { name: 'Realizacje', path: '/admin/gallery/realizacje', icon: '✨' },
            ]
        },
        {
            title: 'SYSTEM',
            color: 'text-gray-600',
            bg: 'bg-gray-50',
            items: [
                { name: 'Użytkownicy', path: '/admin/users', icon: '👥' },
            ]
        }
    ];

    return (
        <nav className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-600 rounded-lg text-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-gray-900 leading-none">Panel Administratora</h1>
                        <p className="text-xs text-gray-500 mt-1">Bolglass Premium</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/" className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors">
                        Strona Główna ↗
                    </Link>
                    <Link href="/api/auth/signout" className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-200 transition-colors">
                        Wyloguj
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {modules.map((module) => (
                    <div key={module.title} className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 transition-all ${checkActiveGroup(module.items.map(i => i.path)) ? 'ring-2 ring-red-500 ring-offset-2' : 'hover:shadow-md'}`}>
                        <h3 className={`text-xs font-black tracking-wider mb-3 flex items-center gap-2 ${module.color}`}>
                            <span className={`w-2 h-2 rounded-full ${module.bg}`}></span>
                            {module.title}
                        </h3>
                        <div className="space-y-1">
                            {module.items.map((item) => (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={`
                                        w-full px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-between group
                                        ${isActive(item.path)
                                            ? 'bg-gray-900 text-white shadow-md'
                                            : 'text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-100'}
                                    `}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{item.icon}</span>
                                        {item.name}
                                    </div>
                                    {isActive(item.path) && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </nav>
    );
}
