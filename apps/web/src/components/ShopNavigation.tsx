'use client';

import { Link } from '@/i18n/navigation';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Button } from '@bolglass/ui';
import { useSession, signOut } from "next-auth/react";

export default function ShopNavigation() {
    const pathname = usePathname();
    const { itemCount } = useCart();
    const { data: session } = useSession();

    const isActive = (path: string) => pathname.includes(path);

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center gap-8">
                        {/* Logo */}
                        <Link href="/" className="flex-shrink-0 flex items-center gap-2">
                            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-black text-sm">
                                B
                            </div>
                            <span className="font-bold text-xl tracking-tight text-gray-900">Bolglass</span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex space-x-8">
                            <Link
                                href="/sklep"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/sklep') ? 'border-red-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            >
                                Sklep
                            </Link>
                            {/* <Link href="/sklep/kategorie" className="text-gray-500 hover:text-gray-900">Kategorie</Link> */}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Cart */}
                        <Link href="/koszyk" className="relative p-2 text-gray-400 hover:text-gray-500">
                            <span className="sr-only">Koszyk</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {itemCount > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                                    {itemCount}
                                </span>
                            )}
                        </Link>

                        {/* Account */}
                        {session ? (
                            <div className="flex items-center gap-2">
                                <Link href={session.user?.role === 'ADMIN' ? "/admin" : "/moje-konto"}>
                                    <Button variant="outline" size="sm" className="hidden sm:flex">
                                        Mój Profil ({session.user?.name?.split(' ')[0] || 'Konto'})
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="text-gray-500 hover:text-red-600"
                                >
                                    Wyloguj
                                </Button>
                            </div>
                        ) : (
                            <Link href="/sklep/login">
                                <Button variant="primary" size="sm" className="bg-gray-900 hover:bg-black text-white">
                                    Zaloguj
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
