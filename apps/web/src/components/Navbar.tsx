'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import LanguageSwitcher from './LanguageSwitcher';
import { useCart } from '@/context/CartContext';
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, User, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { Button } from '@bolglass/ui';

export default function Navbar({ logoUrl }: { logoUrl?: string }) {
    const t = useTranslations('Common.nav');
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const { itemCount } = useCart();
    const { data: session } = useSession();

    // Check if we are on the homepage
    // We handle the locale prefix if it exists
    const isHome = pathname === '/' || pathname === '/pl' || pathname === '/en' || pathname === '/de';

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { href: '/o-nas', label: t('about'), isHash: false },
        { href: '/#booking', label: t('workshops'), isHash: true },
        { href: '/#studio-3d', label: t('studio3d'), isHash: true },
        { href: '/galeria', label: t('gallery'), isHash: false },
        { href: '/sklep', label: t('shop'), isHash: false },
        { href: '/#contact', label: t('contact'), isHash: true },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled || !isHome
                ? 'py-3 bg-black/40 backdrop-blur-xl border-b border-white/5 shadow-2xl'
                : 'py-6 bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                {/* Logo Section */}
                <Link href="/" className="relative group flex items-center">
                    <div className={`relative transition-all duration-500 rounded-lg hover:scale-105 ${isScrolled || !isHome ? 'w-24 h-12' : 'w-40 h-20'
                        }`}>
                        <Image
                            src={logoUrl || "/bolglass-logo-white.png"}
                            alt="Bolglass Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden xl:flex items-center gap-8">
                    <div className="flex gap-6 text-[11px] font-black text-white/70 uppercase tracking-[0.2em]">
                        {navLinks.map((link) => (
                            link.isHash ? (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    className="hover:text-amber-500 transition-colors duration-300"
                                >
                                    {link.label}
                                </a>
                            ) : (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`hover:text-amber-500 transition-colors duration-300 ${pathname.includes(link.href) ? 'text-amber-500' : ''
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            )
                        ))}
                    </div>

                    <div className="h-4 w-px bg-white/10 mx-2" />

                    {/* Actions: Cart, User, Language */}
                    <div className="flex items-center gap-4">
                        {/* Cart */}
                        <Link href="/koszyk" className="relative p-2.5 rounded-full bg-white/5 border border-white/5 text-white/70 hover:text-amber-500 hover:border-amber-500/30 transition-all group">
                            <ShoppingCart className="w-4 h-4" />
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-[10px] font-black text-black flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                                    {itemCount}
                                </span>
                            )}
                        </Link>

                        {/* Account */}
                        {session ? (
                            <div className="flex items-center gap-2">
                                <Link href="/moje-konto" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-all">
                                    <User className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{session.user?.name?.split(' ')[0] || 'Konto'}</span>
                                </Link>
                                {session.user?.role === 'ADMIN' && (
                                    <Link href="/admin">
                                        <Button variant="ghost" size="sm" className="h-9 px-4 rounded-full text-amber-500 text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/10">
                                            <LayoutDashboard className="w-3.5 h-3.5 mr-2" />
                                            Admin
                                        </Button>
                                    </Link>
                                )}
                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="p-2.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <Link href="/sklep/login">
                                <Button className="h-9 px-6 rounded-full bg-amber-500 hover:bg-amber-600 text-black text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                                    Zaloguj
                                </Button>
                            </Link>
                        )}

                        <div className="h-4 w-px bg-white/10 mx-2" />
                        <LanguageSwitcher />
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="xl:hidden p-3 text-white/70 hover:text-amber-500"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    title="Menu"
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="xl:hidden fixed inset-0 top-[73px] bg-black/95 backdrop-blur-2xl z-[90] animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="p-8 flex flex-col gap-6">
                        {navLinks.map((link) => (
                            link.isHash ? (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-2xl font-serif text-amber-100 hover:text-amber-500"
                                >
                                    {link.label}
                                </a>
                            ) : (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-2xl font-serif text-amber-100 hover:text-amber-500"
                                >
                                    {link.label}
                                </Link>
                            )
                        ))}
                        <div className="h-px bg-white/10 my-4" />
                        <div className="flex items-center gap-6">
                            <Link href="/koszyk" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-amber-500">
                                <ShoppingCart />
                                <span className="font-bold">Koszyk ({itemCount})</span>
                            </Link>
                            <Link href="/moje-konto" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-amber-500">
                                <User />
                                <span className="font-bold">Konto</span>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
