'use client';

import { Link } from '@/i18n/navigation';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    LogOut
} from 'lucide-react';

export default function AdminNavigation() {
    const pathname = usePathname();

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
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all bg-gray-50/50 border border-gray-100"
                >
                    <LayoutDashboard className="w-4 h-4 text-red-600" />
                    <span>Panel Główny</span>
                </Link>

                <div className="w-px h-6 bg-gray-200 mx-2"></div>

                <div className="flex-grow"></div>

                {/* Utils */}
                <Link href="/" className="px-3 py-2 text-gray-400 hover:text-red-600 transition-colors flex items-center gap-2" title="Strona Główna">
                    <span className="text-sm font-bold">WWW ↗</span>
                </Link>
                <Link href="/api/auth/signout" className="px-3 py-2 text-gray-400 hover:text-red-600 transition-colors flex items-center gap-2" title="Wyloguj">
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-bold">Wyloguj</span>
                </Link>
            </div>
        </nav>
    );
}
