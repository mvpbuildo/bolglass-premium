'use client';

import { Link } from '@/i18n/navigation';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Calendar,
    ShoppingCart,
    TrendingUp,
    Image as ImageIcon,
    Settings,
    Phone,
    Files,
    LogOut
} from 'lucide-react';

export default function AdminNavigation() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname.includes(path);
    const checkActiveGroup = (paths: string[]) => paths.some(path => pathname.includes(path));

    const modules = [
        {
            title: 'Warsztaty',
            path: '/admin/bookings',
            icon: <Calendar className="w-4 h-4" />,
            groupPaths: ['/admin/bookings', '/admin/settings'],
            color: 'text-blue-600 group-hover:text-blue-600',
        },
        {
            title: 'Sklep',
            path: '/admin/orders',
            icon: <ShoppingCart className="w-4 h-4" />,
            groupPaths: ['/admin/products', '/admin/orders'],
            color: 'text-green-600 group-hover:text-green-600',
        },
        {
            title: 'Marketing',
            path: '/admin/marketing/analityka', // Changed to analytics as main entry
            icon: <TrendingUp className="w-4 h-4" />,
            groupPaths: ['/admin/marketing'],
            color: 'text-purple-600 group-hover:text-purple-600',
        },
        {
            title: 'Galeria',
            path: '/admin/gallery',
            icon: <ImageIcon className="w-4 h-4" />,
            groupPaths: ['/admin/gallery'],
            color: 'text-orange-600 group-hover:text-orange-600',
        },
        {
            title: 'System',
            path: '/admin/users',
            icon: <Settings className="w-4 h-4" />,
            groupPaths: ['/admin/users', '/admin/system'],
            color: 'text-gray-600 group-hover:text-gray-900',
        },
        {
            title: 'Kontakt',
            path: '/admin/system/settings',
            icon: <Phone className="w-4 h-4" />,
            groupPaths: ['/admin/system/settings'], // Shared with System in practice but conceptually distinct
            color: 'text-pink-600 group-hover:text-pink-600',
        },
        {
            title: 'Zasoby',
            path: '/admin/files',
            icon: <Files className="w-4 h-4" />,
            groupPaths: ['/admin/files'],
            color: 'text-cyan-600 group-hover:text-cyan-600',
        }
    ];

    // Hide navigation grid on the main admin dashboard to avoid duplication with the main tiles
    const isMainDashboard = /\/admin\/?$/.test(pathname);

    if (isMainDashboard) {
        return (
            <nav className="mb-8">
                <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-600 rounded-lg text-white">
                            <LayoutDashboard className="w-5 h-5" />
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
                        <Link href="/api/auth/signout" className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-200 transition-colors">
                            <LogOut className="w-4 h-4" />
                            Wyloguj
                        </Link>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-2 overflow-x-auto">
            <div className="flex items-center gap-1 min-w-max">
                {/* Main Dashboard Link */}
                <Link
                    href="/admin"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
                >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Panel Główny</span>
                </Link>

                <div className="w-px h-6 bg-gray-200 mx-1"></div>

                {/* Modules Links */}
                {modules.map((module) => {
                    const isActiveGroup = checkActiveGroup(module.groupPaths);

                    return (
                        <Link
                            key={module.title}
                            href={module.path}
                            className={`
                                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all group whitespace-nowrap
                                ${isActiveGroup
                                    ? 'bg-gray-900 text-white shadow-md'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                            `}
                        >
                            <span className={`${isActiveGroup ? 'text-white' : module.color}`}>
                                {module.icon}
                            </span>
                            <span>{module.title}</span>
                        </Link>
                    );
                })}

                <div className="w-px h-6 bg-gray-200 mx-1 ml-auto"></div>

                {/* Utils */}
                <Link href="/" className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Strona Główna">
                    <span className="text-sm font-bold">WWW ↗</span>
                </Link>
                <Link href="/api/auth/signout" className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Wyloguj">
                    <LogOut className="w-4 h-4" />
                </Link>
            </div>
        </nav>
    );
}
